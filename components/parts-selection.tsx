'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Plus, Minus, ShoppingCart, Cog, Sheet as Wheel, Wrench, Zap, Box, Mountain } from 'lucide-react'
import { PARTS_CATALOG } from '@/lib/parts-catalog'
import type { TeamProfile, CartItem, PartCategory } from '@/lib/types'

interface PartsSelectionProps {
  profile: TeamProfile
  onAddToCart: (items: CartItem[]) => void
  onBack: () => void
}

const getCategoryIcon = (category: PartCategory) => {
  const iconMap = {
    'Electronics': Zap,
    'Motion & Wheels': Wheel,
    'Structure & Beams': Box,
    'Axles & Connectors': Wrench,
    'Specialty Items': Cog,
    'Landscape': Mountain,
  }
  return iconMap[category] || Box
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
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-6">
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
          
          <Card className="px-8 py-4 shadow-xl bg-white/90 backdrop-blur">
            <p className="text-2xl font-bold text-muted-foreground">Money Left</p>
            <p className={`text-5xl font-black ${canAfford ? 'text-success' : 'text-destructive'}`}>
              {remaining}
            </p>
          </Card>
        </div>

        {/* Parts Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.flatMap(category =>
            PARTS_CATALOG[category].map(part => {
              const quantity = quantities[part.id] || 0
              const subtotal = part.price * quantity
              const Icon = getCategoryIcon(category)
              
              return (
                <Card key={part.id} className="p-6 shadow-xl bg-white/90 backdrop-blur space-y-4">
                  <div className="w-full h-40 bg-gradient-to-br from-primary/20 via-white to-secondary/20 rounded-2xl flex items-center justify-center border-4 border-primary/30">
                    <Icon className="w-24 h-24 text-primary" strokeWidth={2} />
                  </div>

                  {/* Part Name */}
                  <h3 className="text-2xl font-bold text-center text-balance min-h-[4rem] flex items-center justify-center text-black">
                    {part.name}
                  </h3>

                  {/* Price */}
                  <div className="text-center py-3 bg-primary/10 rounded-2xl">
                    <p className="text-4xl font-black text-primary">{part.price}</p>
                    <p className="text-xl font-bold text-muted-foreground">Bucks</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => updateQuantity(part.id, -1)}
                      disabled={quantity === 0}
                      size="lg"
                      className="flex-1 h-20 text-4xl font-black rounded-2xl bg-destructive hover:bg-destructive/90"
                    >
                      <Minus className="h-8 w-8" strokeWidth={4} />
                    </Button>
                    
                    <div className="flex-1 text-center">
                      <div className="text-6xl font-black text-secondary">
                        {quantity}
                      </div>
                    </div>

                    <Button
                      onClick={() => updateQuantity(part.id, 1)}
                      disabled={quantity >= 10}
                      size="lg"
                      className="flex-1 h-20 text-4xl font-black rounded-2xl bg-success hover:bg-success/90"
                    >
                      <Plus className="h-8 w-8" strokeWidth={4} />
                    </Button>
                  </div>

                  {/* Subtotal */}
                  {quantity > 0 && (
                    <div className="text-center py-3 bg-success/20 rounded-2xl border-2 border-success">
                      <p className="text-xl font-bold text-success">Total</p>
                      <p className="text-4xl font-black text-success">{subtotal}</p>
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
              className="w-full h-28 text-5xl font-black rounded-3xl shadow-2xl bg-gradient-to-r from-primary to-secondary hover:scale-105 transform transition-all"
            >
              <ShoppingCart className="mr-4 h-12 w-12" strokeWidth={3} />
              {canAfford ? 'ADD TO CART' : 'TOO MUCH!'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
