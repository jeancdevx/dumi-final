export interface Client {
  id: string
  names: string
  lastNames: string
  phone: string
  reference: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateClientResponse {
  id: string
  names: string
  lastNames: string
  phone: string
  reference: string | null
}
