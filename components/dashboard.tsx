'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Store, Package, Box, LogOut } from 'lucide-react'
import { PageWrapper } from '@/components/page-wrapper'
import type { TeamProfile } from '@/lib/types'

interface DashboardProps {
  profile: TeamProfile
  onNavigate: (screen: 'shop' | 'inventory' | 'myitems') => void
  onLogout?: () => void
}

export function Dashboard({ profile, onNavigate, onLogout }: DashboardProps) {
  const cartCount = profile.cart.reduce((sum, item) => sum + item.quantity, 0)
  const ownedCount = profile.ownedItems.reduce((sum, item) => sum + item.quantity, 0)

  // Calculate bonus points: 10 KB = 5 points, max 20 KB = 10 points
  const calculateBonusPoints = (remainingBudget: number) => {
    const maxKB = Math.min(remainingBudget, 20)
    return Math.floor(maxKB / 10) * 5
  }

  const bonusPoints = calculateBonusPoints(profile.budget)

  return (
    <PageWrapper>
      <div className="p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header with Team Info and Logout */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-light text-white">{profile.teamName}</h2>
              <p className="text-xl font-medium text-white/60">{profile.house}</p>
            </div>
            {onLogout && (
              <Button
                onClick={onLogout}
                variant="ghost"
                size="lg"
                className="h-12 px-6 text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <LogOut className="w-5 h-5 mr-2" />
                New Team
              </Button>
            )}
          </div>

          {/* Money Display */}
          <Card className="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
            <div className="text-center space-y-4">
              <p className="text-lg text-white/60 font-light uppercase tracking-wide">
                Your Budget
              </p>
              <div className="relative">
                <div className="text-8xl font-light text-white">
                  {profile.budget}
                </div>
                <p className="text-xl font-medium text-white/60 mt-2">
                  King Bucks
                </p>
              </div>
            </div>
          </Card>

          {/* Bonus Points Display */}
          {bonusPoints > 0 && (
            <Card className="p-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md border border-amber-500/30 rounded-2xl">
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-amber-400">
                  Potential Bonus Points
                </p>
                <div className="text-5xl font-light text-white">
                  {bonusPoints}
                </div>
                <p className="text-sm text-white/60">
                  (10 KB = 5 points, max 20 KB = 10 points)
                </p>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="grid gap-4">
            <button
              onClick={() => onNavigate('shop')}
              className="bg-blue-600/80 hover:bg-blue-600 border border-blue-400/30 rounded-2xl p-8 backdrop-blur-sm transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                    <Store className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                  <span className="text-3xl font-semibold text-white">
                    Shop
                  </span>
                </div>
                <span className="text-white/40 text-lg">Browse parts</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('inventory')}
              className="bg-purple-600/80 hover:bg-purple-600 border border-purple-400/30 rounded-2xl p-8 backdrop-blur-sm transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-colors relative">
                    <Package className="w-8 h-8 text-white" strokeWidth={1.5} />
                    {cartCount > 0 && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                        <span className="text-sm font-bold text-slate-900">
                          {cartCount}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-3xl font-semibold text-white">
                    Cart
                  </span>
                </div>
                <span className="text-white/40 text-lg">Review & checkout</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('myitems')}
              className="bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-400/30 rounded-2xl p-8 backdrop-blur-sm transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-colors relative">
                    <Box className="w-8 h-8 text-white" strokeWidth={1.5} />
                    {ownedCount > 0 && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                        <span className="text-sm font-bold text-slate-900">
                          {ownedCount}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-3xl font-semibold text-white">
                    My Items
                  </span>
                </div>
                <span className="text-white/40 text-lg">View purchased</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
