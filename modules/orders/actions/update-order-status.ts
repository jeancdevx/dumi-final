'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import type { Order, OrderStatus } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<ActionResponse<Order>> {

  const cookieStore = await cookies()
  const idToken = cookieStore.get("telar.idToken")?.value
  if (!idToken) return { success: false, error: "No session" }
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({ status })
    })

    if (response.status === 404) {
      return {
        success: false,
        error: 'Orden no encontrada'
      }
    }

    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error:
          errorData.message ||
          'No se puede cambiar el estado de la orden. Verifica que esté en producción.'
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: 'Error al actualizar la orden'
      }
    }

    const data = await response.json()

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${id}`)

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Error updating order status:', error)
    return {
      success: false,
      error: 'Error de conexión al actualizar la orden'
    }
  }
}
