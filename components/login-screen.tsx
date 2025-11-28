'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Rocket, Settings, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { TeamProfile } from '@/lib/types'

const HOUSES = [
  { name: 'Lynx', image: '/Lynx.jpg', color: 'bg-blue-900/90 hover:bg-blue-900', border: 'border-blue-400' },
  { name: 'Jaguar', image: '/Jaguar.jpg', color: 'bg-yellow-500/90 hover:bg-yellow-500', border: 'border-yellow-300' },
  { name: 'Cougar', image: '/Cougar.jpg', color: 'bg-red-600/90 hover:bg-red-600', border: 'border-red-400' },
  { name: 'Panther', image: '/Panthers.jpg', color: 'bg-green-600/90 hover:bg-green-600', border: 'border-green-400' }
]

const TOTAL_BUDGET = 120
const ADMIN_PIN = '1122'
const ADMIN_USERS = ['Carlo', 'Mark', 'Crachad']

interface LoginScreenProps {
  onLogin: (profile: TeamProfile) => void | Promise<void>
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const router = useRouter()
  const [house, setHouse] = useState('')
  const [teamName, setTeamName] = useState('')
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // PIN modal state
  const [showPinModal, setShowPinModal] = useState(false)
  const [adminUsername, setAdminUsername] = useState('')
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)

  const handleStart = async () => {
    if (!house || !teamName.trim() || isLoading) return

    setIsLoading(true)
    try {
      const profile: TeamProfile = {
        grade: 1,
        house,
        teamName: teamName.trim(),
        budget: TOTAL_BUDGET,
        spent: 0,
        cart: [],
        ownedItems: []
      }

      await onLogin(profile)
    } catch (error) {
      console.error('Error during login:', error)
      alert('Error creating team. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinSubmit = () => {
    const isValidUser = ADMIN_USERS.some(user => user.toLowerCase() === adminUsername.trim().toLowerCase())
    if (isValidUser && pin === ADMIN_PIN) {
      router.push('/admin')
    } else {
      setPinError(true)
      setPin('')
      setTimeout(() => setPinError(false), 2000)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-900">
      {/* Background Image with 10% opacity */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/kcsb-background.png"
          alt="Background"
          fill
          className="object-cover opacity-10"
          priority
        />
      </div>

      {/* Scorer Button - Top Right */}
      <button
        onClick={() => setShowPinModal(true)}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
      >
        <Settings className="w-5 h-5 text-white/40 hover:text-white/60" strokeWidth={1.5} />
      </button>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl space-y-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Rocket className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white">
              KCSB STEAM Day
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-wide text-white/80">
              Rover Challenge
            </h2>
          </div>
          {step === 1 && (
            <p className="text-lg text-white/60 font-light tracking-wide uppercase">
              Select Your House
            </p>
          )}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {HOUSES.map(({ name, image, color, border }) => (
              <button
                key={name}
                onClick={() => {
                  setHouse(name)
                  setStep(2)
                }}
                className={`${color} ${border} border rounded-2xl p-6 md:p-8 backdrop-blur-sm transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/10 active:scale-[0.98]`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center overflow-hidden bg-white/10 backdrop-blur-sm">
                    <Image src={image} alt={name} width={140} height={140} className="object-contain" />
                  </div>
                  <span className="text-xl md:text-2xl font-semibold text-white tracking-wide">
                    {name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <Card className="p-8 md:p-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <p className="text-lg text-white/60 font-light uppercase tracking-wide">
                  Selected House
                </p>
                <div className={`inline-flex items-center gap-4 ${HOUSES.find(h => h.name === house)?.color} rounded-xl px-8 py-4`}>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                    <Image
                      src={HOUSES.find(h => h.name === house)?.image || ''}
                      alt={house}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-2xl font-semibold text-white">
                    {house}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-lg text-white/60 font-light uppercase tracking-wide">
                  Team Name
                </label>
                <Input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter your team name"
                  className="h-14 text-lg text-center rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-0"
                  maxLength={30}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && teamName.trim()) {
                      handleStart()
                    }
                  }}
                />
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleStart}
                  disabled={!teamName.trim() || isLoading}
                  size="lg"
                  className="w-full h-14 text-lg font-medium rounded-xl bg-white text-slate-900 hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Team...' : 'Start Challenge'}
                </Button>
                <Button
                  onClick={() => {
                    setHouse('')
                    setTeamName('')
                    setStep(1)
                  }}
                  disabled={isLoading}
                  variant="ghost"
                  size="lg"
                  className="w-full h-12 text-base font-light text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  Back to House Selection
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-sm p-6 bg-slate-900 border border-white/20 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light text-white">Scorer Access</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPinModal(false)
                  setAdminUsername('')
                  setPin('')
                  setPinError(false)
                }}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60 block mb-2">Username</label>
                <Input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter username"
                  className={`h-12 text-center rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/30 ${
                    pinError ? 'border-red-500' : ''
                  }`}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm text-white/60 block mb-2">PIN</label>
                <Input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="****"
                  maxLength={4}
                  className={`h-14 text-2xl text-center tracking-widest rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/30 ${
                    pinError ? 'border-red-500 animate-shake' : ''
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handlePinSubmit()
                    }
                  }}
                />
                {pinError && (
                  <p className="text-red-400 text-sm mt-2 text-center">Invalid username or PIN</p>
                )}
              </div>

              <Button
                onClick={handlePinSubmit}
                disabled={!adminUsername.trim() || !pin}
                className="w-full h-12 rounded-xl bg-white text-slate-900 hover:bg-white/90 disabled:opacity-50"
              >
                Access Dashboard
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
