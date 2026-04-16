import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { CartItem, CartStore } from './types'

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: item => {
        const { items } = get()

        // Buscar si ya existe el mismo producto con la misma variante
        const existingItemIndex = items.findIndex(
          i => i.clothesId === item.clothesId && i.variantId === item.variantId
        )

        if (existingItemIndex !== -1) {
          // Incrementar cantidad
          const updatedItems = [...items]
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1
          }
          set({ items: updatedItems, isOpen: true })
        } else {
          // Añadir nuevo item
          const newItem: CartItem = {
            ...item,
            id: `${item.clothesId}-${item.variantId}-${Date.now()}`,
            quantity: 1
          }
          set({ items: [...items, newItem], isOpen: true })
        }
      },

      removeItem: id => {
        set(state => ({
          items: state.items.filter(item => item.id !== id)
        }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        set(state => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      },

      toggleCart: () => {
        set(state => ({ isOpen: !state.isOpen }))
      }
    }),
    {
      name: 'telar-cart'
    }
  )
)

// Selectores útiles
export const useCartItems = () => useCartStore(state => state.items)
export const useCartIsOpen = () => useCartStore(state => state.isOpen)
export const useCartItemsCount = () =>
  useCartStore(state =>
    state.items.reduce((acc, item) => acc + item.quantity, 0)
  )
export const useCartTotal = () =>
  useCartStore(state =>
    state.items.reduce(
      (acc, item) =>
        acc + (item.basePrice + item.additionalPrice) * item.quantity,
      0
    )
  )
