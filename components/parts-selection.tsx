'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Plus, Minus, ShoppingCart, Cpu, Cog, Circle, Hand } from 'lucide-react'
import { PageWrapper } from '@/components/page-wrapper'
import { PARTS_CATALOG } from '@/lib/parts-catalog'
import type { TeamProfile, CartItem, PartCategory } from '@/lib/types'

interface PartsSelectionProps {
  profile: TeamProfile
  onAddToCart: (items: CartItem[]) => void
  onBack: () => void
}

const getCategoryIcon = (category: PartCategory) => {
  const iconMap = {
    'Hubs': Cpu,
    'Motors': Cog,
    'Tires': Circle,
    'Claws': Hand,
  }
  return iconMap[category] || Cog
}

export function PartsSelection({ profile, onAddToCart, onBack }: PartsSelectionProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const categories = Object.keys(PARTS_CATALOG) as PartCategory[]

  const updateQuantity = (id: string, delta: number) => {
    const current = quantities[id] || 0
    const newValue = Math.max(0, Math.min(10, current + delta))
    setQuantities({ ...quantities, [id]: newValue })
  }

  const getTotalCost = () => {
    return categories.reduce((sum, cat) => {
      return sum + PARTS_CATALOG[cat].reduce((catSum, part) => {
        const qty = quantities[part.id] || 0
        return catSum + part.price * qty
      }, 0)
    }, 0)
  }

  const handleAddToCart = () => {
    const items: CartItem[] = []
    categories.forEach(cat => {
      PARTS_CATALOG[cat].forEach(part => {
        const qty = quantities[part.id] || 0
        if (qty > 0) {
          items.push({
            id: part.id,
            name: part.name,
            price: part.price,
            quantity: qty,
            category: cat
          })
        }
      })
    })

    if (items.length > 0) {
      onAddToCart(items)
      setQuantities({})
      onBack()
    }
  }

  const totalCost = getTotalCost()
  const remaining = profile.budget - profile.spent - totalCost
  const canAfford = remaining >= 0

  return (
    <PageWrapper>
      <div className="p-4">
        <div className="max-w-6xl mx-auto space-y-6">
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

            <Card className="px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
              <p className="text-sm text-white/60 uppercase tracking-wide">Budget Remaining</p>
              <p className={`text-3xl font-light ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                {remaining} <span className="text-lg text-white/40">KB</span>
              </p>
            </Card>
          </div>

          {/* Parts Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.flatMap(category =>
              PARTS_CATALOG[category].map(part => {
                const quantity = quantities[part.id] || 0
                const subtotal = part.price * quantity
                const Icon = getCategoryIcon(category)

                return (
                  <Card key={part.id} className="p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl space-y-4">
                    <div className="w-full h-32 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                      <Icon className="w-16 h-16 text-white/60" strokeWidth={1.5} />
                    </div>

                    {/* Part Name */}
                    <h3 className="text-lg font-medium text-center text-white min-h-[3rem] flex items-center justify-center">
                      {part.name}
                    </h3>

                    {/* Price */}
                    <div className="text-center py-2 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-2xl font-light text-white">{part.price}</p>
                      <p className="text-sm text-white/40">King Bucks</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => updateQuantity(part.id, -1)}
                        disabled={quantity === 0}
                        size="lg"
                        className="flex-1 h-12 text-xl font-medium rounded-xl bg-red-500/80 hover:bg-red-500 text-white disabled:opacity-30"
                      >
                        <Minus className="h-5 w-5" strokeWidth={2} />
                      </Button>

                      <div className="flex-1 text-center">
                        <div className="text-3xl font-light text-white">
                          {quantity}
                        </div>
                      </div>

                      <Button
                        onClick={() => updateQuantity(part.id, 1)}
                        disabled={quantity >= 10}
                        size="lg"
                        className="flex-1 h-12 text-xl font-medium rounded-xl bg-emerald-500/80 hover:bg-emerald-500 text-white disabled:opacity-30"
                      >
                        <Plus className="h-5 w-5" strokeWidth={2} />
                      </Button>
                    </div>

                    {/* Subtotal */}
                    {quantity > 0 && (
                      <div className="text-center py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                        <p className="text-sm text-emerald-400">Subtotal</p>
                        <p className="text-xl font-light text-white">{subtotal} KB</p>
                      </div>
                    )}
                  </Card>
                )
              })
            )}
          </div>

          {/* Add to Cart Button */}
          {totalCost > 0 && (
            <div className="sticky bottom-4">
              <Button
                onClick={handleAddToCart}
                disabled={!canAfford}
                className="w-full h-16 text-xl font-medium rounded-xl bg-white text-slate-900 hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="mr-3 h-6 w-6" strokeWidth={1.5} />
                {canAfford ? `Add to Cart (${totalCost} KB)` : 'Over Budget'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
