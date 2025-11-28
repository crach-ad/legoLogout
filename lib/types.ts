export interface TeamProfile {
  grade: number
  house: string
  teamName: string
  budget: number
  spent: number
  cart: CartItem[]
  ownedItems: CartItem[]
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category: PartCategory
}

export type PartCategory = 'Hubs' | 'Motors' | 'Tires' | 'Claws'

export interface Part {
  id: string
  name: string
  price: number
}
