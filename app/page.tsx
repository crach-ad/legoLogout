'use client'

import { useEffect, useState } from 'react'
import { LoginScreen } from '@/components/login-screen'
import { Dashboard } from '@/components/dashboard'
import { PartsSelection } from '@/components/parts-selection'
import { CartView } from '@/components/cart-view'
import { MyItems } from '@/components/my-items'
import { SubmitSuccess } from '@/components/submit-success'
import type { TeamProfile, CartItem } from '@/lib/types'

type Screen = 'login' | 'dashboard' | 'shop' | 'inventory' | 'myitems' | 'success'

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login')
  const [teamProfile, setTeamProfile] = useState<TeamProfile | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('teamProfile')
    if (saved) {
      const profile = JSON.parse(saved)
      // Add ownedItems if it doesn't exist (backwards compatibility)
      if (!profile.ownedItems) {
        profile.ownedItems = []
      }
      setTeamProfile(profile)
      setCurrentScreen('dashboard')
    }
  }, [])

  const handleLogin = (profile: TeamProfile) => {
    setTeamProfile(profile)
    localStorage.setItem('teamProfile', JSON.stringify(profile))
    setCurrentScreen('dashboard')
  }

  const handleAddToCart = (items: CartItem[]) => {
    if (!teamProfile) return
    
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
    localStorage.setItem('teamProfile', JSON.stringify(updated))
  }

  const handleRemoveFromCart = (itemId: string) => {
    if (!teamProfile) return
    
    const updatedCart = teamProfile.cart.filter(item => item.id !== itemId)
    const totalSpent = updatedCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const updated = { ...teamProfile, cart: updatedCart, spent: totalSpent }
    setTeamProfile(updated)
    localStorage.setItem('teamProfile', JSON.stringify(updated))
  }

  const handleCheckout = () => {
    if (!teamProfile) return

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
    localStorage.setItem('teamProfile', JSON.stringify(updated))
    setCurrentScreen('dashboard')
  }

  const handleSellItem = (itemId: string, quantity: number) => {
    if (!teamProfile) return

    const itemToSell = teamProfile.ownedItems.find(item => item.id === itemId)
    if (!itemToSell) return

    // Calculate sell price (half of original price)
    const sellPrice = Math.floor((itemToSell.price * quantity) / 2)

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
    localStorage.setItem('teamProfile', JSON.stringify(updated))
  }

  const handleSubmitBuild = () => {
    if (!teamProfile) return

    // Save to submissions
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]')
    submissions.push({
      ...teamProfile,
      timestamp: new Date().toISOString()
    })
    localStorage.setItem('submissions', JSON.stringify(submissions))

    // Clear team profile
    localStorage.removeItem('teamProfile')
    setTeamProfile(null)
    setCurrentScreen('success')
  }

  const handleNewTeam = () => {
    setCurrentScreen('login')
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
