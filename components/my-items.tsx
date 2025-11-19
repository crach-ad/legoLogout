'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, DollarSign, Package } from 'lucide-react'
import type { TeamProfile } from '@/lib/types'

interface MyItemsProps {
  profile: TeamProfile
  onSellItem: (itemId: string, quantity: number) => void
  onBack: () => void
}

export function MyItems({ profile, onSellItem, onBack }: MyItemsProps) {
  const [sellQuantities, setSellQuantities] = useState<Record<string, number>>({})

  const handleSellClick = (itemId: string, maxQuantity: number) => {
    const quantityToSell = sellQuantities[itemId] || 1
    if (quantityToSell > 0 && quantityToSell <= maxQuantity) {
      onSellItem(itemId, quantityToSell)
      setSellQuantities(prev => ({ ...prev, [itemId]: 1 }))
    }
  }

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
            My Items
          </h1>

          <div className="w-32" />
        </div>

        {/* Money Display */}
        <Card className="p-8 shadow-2xl bg-white/90 backdrop-blur">
          <div className="text-center space-y-4">
            <p className="text-3xl font-bold text-muted-foreground">
              Money Left
            </p>
            <div className="text-9xl font-black text-success">
              {profile.budget}
            </div>
            <p className="text-2xl font-bold text-muted-foreground">
              KB
            </p>
          </div>
        </Card>

        {/* Owned Items */}
        {profile.ownedItems.length === 0 ? (
          <Card className="p-16 text-center shadow-2xl bg-white/90 backdrop-blur">
            <p className="text-5xl font-bold text-muted-foreground mb-4">
              No Items Yet! 📦
            </p>
            <p className="text-3xl font-bold text-muted-foreground">
              Go shopping and checkout to see your items here!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-100 border-4 border-yellow-500 rounded-2xl p-6">
              <p className="text-2xl font-bold text-yellow-900 text-center">
                💡 You can sell items back for half price!
              </p>
            </div>
            {profile.ownedItems.map(item => {
              const sellPrice = Math.floor(item.price / 2)
              const quantity = sellQuantities[item.id] || 1
              const totalSellPrice = sellPrice * quantity

              return (
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
                        Owned: {item.quantity}
                      </p>
                      <p className="text-xl font-bold text-success mt-1">
                        Sell Price: {sellPrice} KB each
                      </p>
                    </div>

                    {/* Sell Controls */}
                    <div className="flex flex-col gap-2 items-center">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            const newQty = Math.max(1, (sellQuantities[item.id] || 1) - 1)
                            setSellQuantities(prev => ({ ...prev, [item.id]: newQty }))
                          }}
                          size="lg"
                          variant="outline"
                          className="h-14 w-14 rounded-xl text-2xl font-bold"
                        >
                          -
                        </Button>
                        <div className="text-3xl font-black w-16 text-center text-black">
                          {quantity}
                        </div>
                        <Button
                          onClick={() => {
                            const newQty = Math.min(item.quantity, (sellQuantities[item.id] || 1) + 1)
                            setSellQuantities(prev => ({ ...prev, [item.id]: newQty }))
                          }}
                          size="lg"
                          variant="outline"
                          className="h-14 w-14 rounded-xl text-2xl font-bold"
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleSellClick(item.id, item.quantity)}
                        size="lg"
                        className="h-16 px-6 rounded-2xl text-xl font-bold bg-orange-500 hover:bg-orange-600"
                      >
                        <DollarSign className="mr-2 h-6 w-6" strokeWidth={3} />
                        Sell for {totalSellPrice} KB
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
