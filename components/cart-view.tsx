'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Trash2, CheckCircle, Store, Package } from 'lucide-react'
import { PageWrapper } from '@/components/page-wrapper'
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
    <PageWrapper>
      <div className="p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="ghost"
              size="lg"
              className="h-12 px-6 text-base font-medium text-white/80 hover:text-white hover:bg-white/10 border border-white/20 rounded-xl"
            >
              <ArrowLeft className="mr-2 h-5 w-5" strokeWidth={1.5} />
              Back
            </Button>

            <h1 className="text-3xl font-light text-white">
              Your Cart
            </h1>

            <div className="w-24" />
          </div>

          {/* Money Display */}
          <Card className="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
            <div className="text-center space-y-4">
              <p className="text-lg text-white/60 font-light uppercase tracking-wide">
                Budget Remaining
              </p>
              <div className={`text-7xl font-light ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                {remaining}
              </div>
              {isOverBudget && (
                <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/30">
                  <p className="text-lg font-medium text-red-400">
                    Over budget! Remove some items.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Cart Items */}
          {profile.cart.length === 0 ? (
            <Card className="p-12 text-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
              <Package className="w-16 h-16 mx-auto text-white/30 mb-4" strokeWidth={1.5} />
              <p className="text-2xl font-light text-white/60 mb-6">
                Your cart is empty
              </p>
              <Button
                onClick={onShop}
                size="lg"
                className="h-14 px-8 text-lg font-medium rounded-xl bg-white text-slate-900 hover:bg-white/90"
              >
                <Store className="mr-3 h-5 w-5" strokeWidth={1.5} />
                Go Shopping
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {profile.cart.map(item => (
                <Card key={item.id} className="p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                  <div className="flex items-center gap-4">
                    {/* Item Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-medium text-white">{item.name}</h3>
                      <p className="text-base text-white/60 mt-1">
                        {item.quantity} × {item.price} = <span className="text-white">{item.price * item.quantity}</span> KB
                      </p>
                    </div>

                    {/* Delete Button */}
                    <Button
                      onClick={() => onRemoveItem(item.id)}
                      size="lg"
                      className="h-12 w-12 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30"
                    >
                      <Trash2 className="h-5 w-5" strokeWidth={1.5} />
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
              variant="ghost"
              size="lg"
              className="w-full h-14 text-lg font-medium rounded-xl text-white/60 hover:text-white hover:bg-white/5 border border-white/10"
            >
              <Store className="mr-3 h-5 w-5" strokeWidth={1.5} />
              Continue Shopping
            </Button>
          )}

          {/* Checkout Button */}
          {profile.cart.length > 0 && (
            <div className="sticky bottom-4">
              <Button
                onClick={onSubmit}
                disabled={isOverBudget}
                className="w-full h-16 text-xl font-medium rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="mr-3 h-6 w-6" strokeWidth={1.5} />
                Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
