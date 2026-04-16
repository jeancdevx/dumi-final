'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import type { ActionResponse } from '@/modules/auth/types'

import type { CreateOrderInput, Order } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function createOrder(
  input: CreateOrderInput
): Promise<ActionResponse<Order>> {

  const cookieStore = await cookies()
  const idToken = cookieStore.get("telar.idToken")?.value
  if (!idToken) return { success: false, error: "No session" }
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify(input)
    })

    if (response.status === 404) {
      return {
        success: false,
        error: 'Cotización no encontrada'
      }
    }

    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error:
          errorData.message ||
          'No se puede generar la orden. Verifica que la cotización esté pendiente.'
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: 'Error al crear la orden'
      }
    }

    const data = await response.json()

    revalidatePath('/admin/quotations')
    revalidatePath('/admin/orders')

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return {
      success: false,
      error: 'Error de conexión al crear la orden'
    }
  }
}
