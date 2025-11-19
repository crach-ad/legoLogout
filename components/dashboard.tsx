'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Store, Package, CheckCircle, Box } from 'lucide-react'
import type { TeamProfile } from '@/lib/types'

interface DashboardProps {
  profile: TeamProfile
  onNavigate: (screen: 'shop' | 'inventory' | 'myitems') => void
}

export function Dashboard({ profile, onNavigate }: DashboardProps) {
  const remaining = profile.budget - profile.spent
  const cartCount = profile.cart.reduce((sum, item) => sum + item.quantity, 0)
  const ownedCount = profile.ownedItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Money Display */}
        <Card className="p-8 shadow-2xl bg-white/90 backdrop-blur">
          <div className="text-center space-y-4">
            <p className="text-3xl font-bold text-muted-foreground">
              Your Money
            </p>
            <div className="relative">
              <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                {profile.budget}
              </div>
              <p className="text-4xl font-bold text-secondary mt-2">
                King Bucks
              </p>
            </div>
          </div>
        </Card>

        {/* Big Action Buttons */}
        <div className="grid gap-6">
          <button
            onClick={() => onNavigate('shop')}
            className="bg-gradient-to-br from-primary to-pink-500 rounded-3xl p-12 shadow-2xl transform transition-all hover:scale-105 active:scale-95 group"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform">
                <Store className="w-20 h-20 text-white" strokeWidth={3} />
              </div>
              <span className="text-6xl font-black text-white drop-shadow-lg">
                SHOP
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('inventory')}
            className="bg-gradient-to-br from-secondary to-purple-600 rounded-3xl p-12 shadow-2xl transform transition-all hover:scale-105 active:scale-95 relative group"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform relative">
                <Package className="w-20 h-20 text-white" strokeWidth={3} />
                {cartCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-16 h-16 bg-accent rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-3xl font-black text-foreground">
                      {cartCount}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-6xl font-black text-white drop-shadow-lg">
                INVENTORY
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('myitems')}
            className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl p-12 shadow-2xl transform transition-all hover:scale-105 active:scale-95 relative group"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform relative">
                <Box className="w-20 h-20 text-white" strokeWidth={3} />
                {ownedCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-3xl font-black text-foreground">
                      {ownedCount}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-6xl font-black text-white drop-shadow-lg">
                MY ITEMS
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
