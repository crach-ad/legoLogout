'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Rocket, Zap, Star, Heart } from 'lucide-react'
import type { TeamProfile } from '@/lib/types'

const HOUSES = [
  { name: 'Lynx', icon: Zap, color: 'bg-yellow-600 hover:bg-yellow-700' },
  { name: 'Jaguar', icon: Star, color: 'bg-purple-600 hover:bg-purple-700' },
  { name: 'Cougar', icon: Heart, color: 'bg-pink-600 hover:bg-pink-700' },
  { name: 'Panther', icon: Rocket, color: 'bg-blue-600 hover:bg-blue-700' }
]

const ROVER_BUDGET = 200
const LANDSCAPE_BUDGET = 120

interface LoginScreenProps {
  onLogin: (profile: TeamProfile) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [house, setHouse] = useState('')
  const [teamName, setTeamName] = useState('')
  const [step, setStep] = useState(1)

  const handleStart = () => {
    if (!house || !teamName.trim()) return

    const profile: TeamProfile = {
      grade: 1,
      house,
      teamName: teamName.trim(),
      budget: ROVER_BUDGET + LANDSCAPE_BUDGET,
      spent: 0,
      cart: [],
      ownedItems: []
    }

    onLogin(profile)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl animate-bounce">
              <Rocket className="w-20 h-20 text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-6xl font-black text-primary drop-shadow-lg" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Mars Rover!
          </h1>
          {step === 1 && (
            <p className="text-3xl font-bold text-secondary">
              Pick Your Team!
            </p>
          )}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-6">
            {HOUSES.map(({ name, icon: Icon, color }) => (
              <button
                key={name}
                onClick={() => {
                  setHouse(name)
                  setStep(2)
                }}
                className={`${color} rounded-3xl p-12 shadow-2xl transform transition-all hover:scale-105 active:scale-95`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-16 h-16 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-4xl font-black text-white drop-shadow-lg">
                    {name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <Card className="p-12 shadow-2xl bg-white/90 backdrop-blur">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <p className="text-4xl font-bold text-secondary">
                  You picked
                </p>
                <div className={`inline-block ${HOUSES.find(h => h.name === house)?.color} rounded-3xl px-12 py-6 shadow-xl`}>
                  <span className="text-5xl font-black text-white">
                    {house}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-secondary">
                    Enter Your Team Name
                  </p>
                  <Input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g., The Red Rockets"
                    className="h-16 text-2xl font-bold text-center rounded-2xl border-2 border-gray-300 focus:border-primary placeholder:text-gray-400 text-black"
                    maxLength={30}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && teamName.trim()) {
                        handleStart()
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleStart}
                  disabled={!teamName.trim()}
                  size="lg"
                  className="w-full h-24 text-4xl font-black rounded-3xl shadow-2xl bg-gradient-to-r from-primary to-secondary hover:scale-105 transform transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  START! 🚀
                </Button>
                <Button
                  onClick={() => {
                    setHouse('')
                    setTeamName('')
                    setStep(1)
                  }}
                  variant="outline"
                  size="lg"
                  className="w-full h-20 text-3xl font-bold rounded-3xl border-2 text-gray-800 hover:bg-gray-100"
                >
                  Go Back
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
