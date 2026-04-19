import { fetchWithAuth } from '@/lib/fetch'
import type { Client } from './types'

export async function getClients(): Promise<Client[]> {
  try {
    return await fetchWithAuth<Client[]>('/customers')
  } catch (error: any) {
    if (error?.status === 404) return []
    console.error('Error fetching clients:', error)
    return []
  }
}

export async function searchClients(params: {
  names?: string
  lastnames?: string
  phone?: string
}): Promise<Client[]> {
  try {
    const query = new URLSearchParams()
    if (params.names) query.append('names', params.names)
    if (params.lastnames) query.append('lastnames', params.lastnames)
    if (params.phone) query.append('phone', params.phone)

    return await fetchWithAuth<Client[]>(`/customers/search?${query.toString()}`)
  } catch (error) {
    console.error('Error searching clients:', error)
    return []
  }
}
