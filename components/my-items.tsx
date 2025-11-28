'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, DollarSign, Package, Minus, Plus } from 'lucide-react'
import { PageWrapper } from '@/components/page-wrapper'
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
              My Items
            </h1>

            <div className="w-24" />
          </div>

          {/* Money Display */}
          <Card className="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
            <div className="text-center space-y-4">
              <p className="text-lg text-white/60 font-light uppercase tracking-wide">
                Current Budget
              </p>
              <div className="text-7xl font-light text-emerald-400">
                {profile.budget}
              </div>
              <p className="text-base text-white/40">King Bucks</p>
            </div>
          </Card>

          {/* Owned Items */}
          {profile.ownedItems.length === 0 ? (
            <Card className="p-12 text-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
              <Package className="w-16 h-16 mx-auto text-white/30 mb-4" strokeWidth={1.5} />
              <p className="text-2xl font-light text-white/60 mb-2">
                No items yet
              </p>
              <p className="text-base text-white/40">
                Shop and checkout to see your purchased items here
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              <Card className="p-4 bg-amber-500/20 backdrop-blur-md border border-amber-500/30 rounded-xl">
                <p className="text-base font-medium text-amber-400 text-center">
                  You can sell items back for 30% of the original price
                </p>
              </Card>

              {profile.ownedItems.map(item => {
                const sellPrice = Math.floor(item.price * 0.3)
                const quantity = sellQuantities[item.id] || 1
                const totalSellPrice = sellPrice * quantity

                return (
                  <Card key={item.id} className="p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                    <div className="flex items-center gap-4">
                      {/* Item Info */}
                      <div className="flex-1">
                        <h3 className="text-xl font-medium text-white">{item.name}</h3>
                        <p className="text-base text-white/60 mt-1">
                          Owned: <span className="text-white">{item.quantity}</span>
                        </p>
                        <p className="text-sm text-emerald-400 mt-1">
                          Sell value: {sellPrice} KB each
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
                            size="sm"
                            className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20"
                          >
                            <Minus className="h-4 w-4" strokeWidth={2} />
                          </Button>
                          <div className="text-xl font-light w-10 text-center text-white">
                            {quantity}
                          </div>
                          <Button
                            onClick={() => {
                              const newQty = Math.min(item.quantity, (sellQuantities[item.id] || 1) + 1)
                              setSellQuantities(prev => ({ ...prev, [item.id]: newQty }))
                            }}
                            size="sm"
                            className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20"
                          >
                            <Plus className="h-4 w-4" strokeWidth={2} />
                          </Button>
                        </div>
                        <Button
                          onClick={() => handleSellClick(item.id, item.quantity)}
                          size="sm"
                          className="h-10 px-4 rounded-lg bg-amber-500/80 hover:bg-amber-500 text-white"
                        >
                          <DollarSign className="mr-1 h-4 w-4" strokeWidth={2} />
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
    </PageWrapper>
  )
}
