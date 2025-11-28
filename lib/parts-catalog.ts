import type { Part, PartCategory } from './types'

export const PARTS_CATALOG: Record<PartCategory, Part[]> = {
  Hubs: [
    { id: 'large_hub', name: 'Large Hub', price: 40 },
    { id: 'small_hub', name: 'Small Hub', price: 30 }
  ],
  Motors: [
    { id: 'small_motor', name: 'Small Motor', price: 10 },
    { id: 'medium_motor', name: 'Medium Motor', price: 18 },
    { id: 'large_motor', name: 'Large Motor', price: 25 }
  ],
  Tires: [
    { id: 'small_tires', name: 'Small Tires (pair)', price: 6 },
    { id: 'medium_tires', name: 'Medium Tires (pair)', price: 10 }
  ],
  Claws: [
    { id: 'small_claw', name: 'Small Claw', price: 12 },
    { id: 'large_claw', name: 'Large Claw', price: 18 }
  ]
}
