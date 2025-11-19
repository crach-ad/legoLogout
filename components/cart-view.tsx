'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Trash2, CheckCircle, Store } from 'lucide-react'
import type { TeamProfile } from '@/lib/types'

interface CartViewProps {
  profile: TeamProfile
  onRemoveItem: (itemId: string) => void
  onBack: () => void
  onSubmit: () => void
  onShop: () => void
}

export function CartView({ profile, onRemoveItem, onBack, onSubmit, onShop }: CartViewProps) {
  const remaining = profile.budget - profile.spent
  const isOverBudget = remaining < 0

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onClick={onBack}
            size="lg"
            variant="outline"
            className="h-20 px-8 text-3xl font-bold rounded-2xl border-2 text-gray-800 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-3 h-8 w-8" strokeWidth={3} />
            Back
          </Button>
          
          <h1 className="text-5xl font-black text-primary">
            Your Inventory
          </h1>
          
          <div className="w-32" />
        </div>

        {/* Money Display */}
        <Card className="p-8 shadow-2xl bg-white/90 backdrop-blur">
          <div className="text-center space-y-4">
            <p className="text-3xl font-bold text-muted-foreground">
              Money Left
            </p>
            <div className={`text-9xl font-black ${isOverBudget ? 'text-destructive' : 'text-success'}`}>
              {remaining}
            </div>
            {isOverBudget && (
              <div className="bg-destructive/20 rounded-2xl p-6 border-4 border-destructive">
                <p className="text-3xl font-black text-destructive">
                  😮 Too Much! Take Things Out!
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Cart Items */}
        {profile.cart.length === 0 ? (
          <Card className="p-16 text-center shadow-2xl bg-white/90 backdrop-blur">
            <p className="text-5xl font-bold text-muted-foreground mb-8">
              Inventory is Empty! 📦
            </p>
            <Button 
              onClick={onShop}
              size="lg"
              className="h-24 px-12 text-4xl font-black rounded-3xl"
            >
              <Store className="mr-4 h-12 w-12" strokeWidth={3} />
              Go Shopping!
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {profile.cart.map(item => (
              <Card key={item.id} className="p-6 shadow-xl bg-white/90 backdrop-blur">
                <div className="flex items-center gap-6">
                  {/* Item Image */}
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <img 
                      src={`/.jpg?height=80&width=80&query=${encodeURIComponent(item.name)}`}
                      alt={item.name}
                      className="w-16 h-16 object-contain"
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-balance">{item.name}</h3>
                    <p className="text-2xl font-bold text-muted-foreground mt-1">
                      {item.quantity} × {item.price} = {item.price * item.quantity} Bucks
                    </p>
                  </div>

                  {/* Delete Button */}
                  <Button
                    onClick={() => onRemoveItem(item.id)}
                    size="lg"
                    variant="destructive"
                    className="h-20 w-20 rounded-2xl flex-shrink-0"
                  >
                    <Trash2 className="h-10 w-10" strokeWidth={3} />
                    <span className="sr-only">Remove {item.name}</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {profile.cart.length > 0 && (
          <Button
            onClick={onShop}
            size="lg"
            variant="outline"
            className="w-full h-20 text-3xl font-bold rounded-3xl border-4 text-gray-800 hover:bg-gray-100"
          >
            <Store className="mr-4 h-10 w-10" strokeWidth={3} />
            Shop More
          </Button>
        )}

        {/* Checkout Button */}
        {profile.cart.length > 0 && (
          <div className="sticky bottom-4">
            <Button
              onClick={onSubmit}
              disabled={isOverBudget}
              className="w-full h-28 text-5xl font-black rounded-3xl shadow-2xl bg-gradient-to-r from-success to-green-600 hover:scale-105 transform transition-all disabled:opacity-50"
            >
              <CheckCircle className="mr-4 h-12 w-12" strokeWidth={3} />
              CHECKOUT! 🛒
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
