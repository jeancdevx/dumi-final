// Estado de la orden
export type OrderStatus = 'IN_PRODUCTION' | 'DONE' | 'CANCELLED'

// Dirección de entrega
export interface OrderAddress {
  id: string
  department: string
  city: string
  district: string
  street: string
}

// Cliente asociado a la orden
export interface OrderCustomer {
  id: string
  names: string
  lastNames: string
  phone: string
  reference?: string
  createdAt?: string
  updatedAt?: string
}

// Variante de prenda en detalle de cotización
export interface OrderClothesVariant {
  id: string
  clothesId: string
  sizeId: string
  genderId: string
  additional: string
  clothes: {
    id: string
    name: string
    description: string
    price: string
    isDraft: boolean
    createdAt: string
    updatedAt: string
  }
}

// Detalle de cotización en orden
export interface OrderQuoteDetail {
  id: string
  unitPrice: string
  quantity: number
  customizations: Array<{
    id: string
    name: string
    technique: string
    description?: string
    area?: string
  }>
  quoteId: string
  clothesVariantId: string
  clothesVariant: OrderClothesVariant
}

// Cotización incluida en detalle de orden
export interface OrderQuote {
  id: string
  total: string
  customerId: string
  status: string
  createdAt: string
  updatedAt: string
  customer: OrderCustomer
  details: OrderQuoteDetail[]
}

// Input para crear dirección
export interface CreateAddressInput {
  department: string
  city: string
  district: string
  street: string
}

// Orden básica (respuesta del listado)
export interface Order {
  id: string
  total: string
  status: OrderStatus
  createdAt: string
  deliveryDate: string
  quoteId: string
  customer: OrderCustomer
  address: OrderAddress
  totalClothes: number
  totalUnitsToProduced: number
}

// Detalle de orden (respuesta de GET /orders/:id)
export interface OrderWithDetails {
  id: string
  total: string
  status: OrderStatus
  createdAt: string
  cancellationReason: string | null
  deliveryDate: string
  quoteId: string
  addressId: string
  address: OrderAddress
  quote: OrderQuote
}

// Input para crear orden
export interface CreateOrderInput {
  quoteId: string
  deliveryDate: string
  address: CreateAddressInput
}

// Respuesta de crear orden
export interface CreateOrderResponse {
  order: Order
}
