'use client'

import { useEffect, useState } from 'react'
import { LoginScreen } from '@/components/login-screen'
import { Dashboard } from '@/components/dashboard'
import { PartsSelection } from '@/components/parts-selection'
import { CartView } from '@/components/cart-view'
import { MyItems } from '@/components/my-items'
import { SubmitSuccess } from '@/components/submit-success'
import type { TeamProfile, CartItem } from '@/lib/types'
import {
  saveTeamProfile,
  getTeamProfile,
  submitTeamBuild,
  generateTeamId
} from '@/lib/firebase-service'

type Screen = 'login' | 'dashboard' | 'shop' | 'inventory' | 'myitems' | 'success'

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login')
  const [teamProfile, setTeamProfile] = useState<TeamProfile | null>(null)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTeamProfile = async () => {
      try {
        // Check for existing team ID in localStorage
        const savedTeamId = localStorage.getItem('teamId')

        if (savedTeamId) {
          // Try to load from Firebase first
          const profile = await getTeamProfile(savedTeamId)

          if (profile) {
            setTeamId(savedTeamId)
            setTeamProfile(profile)
            setCurrentScreen('dashboard')
          } else {
            // If not found in Firebase, check localStorage as fallback
            const savedProfile = localStorage.getItem('teamProfile')
            if (savedProfile) {
              const profile = JSON.parse(savedProfile)
              if (!profile.ownedItems) {
                profile.ownedItems = []
              }
              setTeamId(savedTeamId)
              setTeamProfile(profile)
              setCurrentScreen('dashboard')
              // Save to Firebase
              await saveTeamProfile(savedTeamId, profile)
            }
          }
        }
      } catch (error) {
        console.error('Error loading team profile:', error)
        // Fallback to localStorage
        const saved = localStorage.getItem('teamProfile')
        if (saved) {
          const profile = JSON.parse(saved)
          if (!profile.ownedItems) {
            profile.ownedItems = []
          }
          setTeamProfile(profile)
          setCurrentScreen('dashboard')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadTeamProfile()
  }, [])

  // Helper function to save profile to both Firebase and localStorage
  const saveProfile = async (profile: TeamProfile, currentTeamId: string) => {
    try {
      // Save to Firebase
      await saveTeamProfile(currentTeamId, profile)
      // Save to localStorage as backup
      localStorage.setItem('teamProfile', JSON.stringify(profile))
    } catch (error) {
      console.error('Error saving to Firebase:', error)
      // Still save to localStorage even if Firebase fails
      localStorage.setItem('teamProfile', JSON.stringify(profile))
    }
  }

  const handleLogin = async (profile: TeamProfile) => {
    try {
      // Generate unique team ID
      const newTeamId = generateTeamId(profile.house, profile.teamName)

      // Save to Firebase
      await saveTeamProfile(newTeamId, profile)

      // Save to localStorage as backup
      localStorage.setItem('teamId', newTeamId)
      localStorage.setItem('teamProfile', JSON.stringify(profile))

      setTeamId(newTeamId)
      setTeamProfile(profile)
      setCurrentScreen('dashboard')
    } catch (error) {
      console.error('Error saving team profile:', error)
      // Even if Firebase fails, save to localStorage and continue
      localStorage.setItem('teamProfile', JSON.stringify(profile))
      setTeamProfile(profile)
      setCurrentScreen('dashboard')
    }
  }

  const handleAddToCart = async (items: CartItem[]) => {
    if (!teamProfile || !teamId) return

    const updatedCart = [...teamProfile.cart]
    items.forEach(newItem => {
      const existingIndex = updatedCart.findIndex(item => item.id === newItem.id)
      if (existingIndex >= 0) {
        updatedCart[existingIndex].quantity += newItem.quantity
      } else {
        updatedCart.push(newItem)
      }
    })

    const totalSpent = updatedCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const updated = { ...teamProfile, cart: updatedCart, spent: totalSpent }
    setTeamProfile(updated)
    await saveProfile(updated, teamId)
  }

  const handleRemoveFromCart = async (itemId: string) => {
    if (!teamProfile || !teamId) return

    const updatedCart = teamProfile.cart.filter(item => item.id !== itemId)
    const totalSpent = updatedCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const updated = { ...teamProfile, cart: updatedCart, spent: totalSpent }
    setTeamProfile(updated)
    await saveProfile(updated, teamId)
  }

  const handleCheckout = async () => {
    if (!teamProfile || !teamId) return

    // Move cart items to owned items
    const updatedOwnedItems = [...teamProfile.ownedItems]
    teamProfile.cart.forEach(cartItem => {
      const existingIndex = updatedOwnedItems.findIndex(item => item.id === cartItem.id)
      if (existingIndex >= 0) {
        updatedOwnedItems[existingIndex].quantity += cartItem.quantity
      } else {
        updatedOwnedItems.push({ ...cartItem })
      }
    })

    // Calculate new budget (subtract cart total)
    const cartTotal = teamProfile.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const newBudget = teamProfile.budget - cartTotal

    // Update profile: move items to owned, update budget, clear cart
    const updated = {
      ...teamProfile,
      ownedItems: updatedOwnedItems,
      budget: newBudget,
      cart: [],
      spent: 0
    }

    setTeamProfile(updated)
    await saveProfile(updated, teamId)
    setCurrentScreen('dashboard')
  }

  const handleSellItem = async (itemId: string, quantity: number) => {
    if (!teamProfile || !teamId) return

    const itemToSell = teamProfile.ownedItems.find(item => item.id === itemId)
    if (!itemToSell) return

    // Calculate sell price (30% of original price)
    const sellPrice = Math.floor(itemToSell.price * quantity * 0.3)

    // Update owned items
    const updatedOwnedItems = teamProfile.ownedItems
      .map(item => {
        if (item.id === itemId) {
          return { ...item, quantity: item.quantity - quantity }
        }
        return item
      })
      .filter(item => item.quantity > 0)

    // Add sell price back to budget
    const updated = {
      ...teamProfile,
      ownedItems: updatedOwnedItems,
      budget: teamProfile.budget + sellPrice
    }

    setTeamProfile(updated)
    await saveProfile(updated, teamId)
  }

  const handleSubmitBuild = async () => {
    if (!teamProfile || !teamId) return

    try {
      // Submit to Firebase (this moves from teams to submissions and deletes the team)
      await submitTeamBuild(teamId, teamProfile)

      // Also save to localStorage submissions as backup
      const submissions = JSON.parse(localStorage.getItem('submissions') || '[]')
      submissions.push({
        ...teamProfile,
        timestamp: new Date().toISOString()
      })
      localStorage.setItem('submissions', JSON.stringify(submissions))

      // Clear team profile and team ID
      localStorage.removeItem('teamProfile')
      localStorage.removeItem('teamId')
      setTeamProfile(null)
      setTeamId(null)
      setCurrentScreen('success')
    } catch (error) {
      console.error('Error submitting build:', error)
      // Fallback to localStorage only
      const submissions = JSON.parse(localStorage.getItem('submissions') || '[]')
      submissions.push({
        ...teamProfile,
        timestamp: new Date().toISOString()
      })
      localStorage.setItem('submissions', JSON.stringify(submissions))
      localStorage.removeItem('teamProfile')
      localStorage.removeItem('teamId')
      setTeamProfile(null)
      setTeamId(null)
      setCurrentScreen('success')
    }
  }

  const handleNewTeam = () => {
    setCurrentScreen('login')
  }

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('teamProfile')
    localStorage.removeItem('teamId')
    setTeamProfile(null)
    setTeamId(null)
    setCurrentScreen('login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    )
  }

  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} />
  }

  if (currentScreen === 'success') {
    return <SubmitSuccess onNewTeam={handleNewTeam} />
  }

  if (!teamProfile) return null

  if (currentScreen === 'dashboard') {
    return (
      <Dashboard
        profile={teamProfile}
        onNavigate={setCurrentScreen}
        onLogout={handleLogout}
      />
    )
  }

  if (currentScreen === 'shop') {
    return (
      <PartsSelection
        profile={teamProfile}
        onAddToCart={handleAddToCart}
        onBack={() => setCurrentScreen('dashboard')}
      />
    )
  }

  if (currentScreen === 'inventory') {
    return (
      <CartView
        profile={teamProfile}
        onRemoveItem={handleRemoveFromCart}
        onBack={() => setCurrentScreen('dashboard')}
        onSubmit={handleCheckout}
        onShop={() => setCurrentScreen('shop')}
      />
    )
  }

  if (currentScreen === 'myitems') {
    return (
      <MyItems
        profile={teamProfile}
        onSellItem={handleSellItem}
        onBack={() => setCurrentScreen('dashboard')}
      />
    )
  }

  return null
}
