'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'

import { useSearchParams } from 'next/navigation'

import { AlertCircle } from 'lucide-react'

import { getOrdersClient } from '@/modules/orders/lib/orders-client'
import type { Order, OrderStatus } from '@/modules/orders/types'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { OrdersTable } from './orders-table'

interface OrdersSearchResultsProps {
  basePath?: string
}

function OrdersTableSkeleton() {
  return (
    <div className='space-y-3'>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-16 w-full' />
      <Skeleton className='h-16 w-full' />
      <Skeleton className='h-16 w-full' />
    </div>
  )
}

function sortOrders(orders: Order[], sortBy?: string, sortOrder?: string) {
  if (!sortBy) return orders

  return [...orders].sort((a, b) => {
    let comparison = 0

    if (sortBy === 'createdAt') {
      comparison =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    } else if (sortBy === 'deliveryDate') {
      comparison =
        new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
    } else if (sortBy === 'total') {
      comparison = Number(a.total) - Number(b.total)
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })
}

function OrdersSearchResultsContent({
  basePath = '/admin/orders'
}: OrdersSearchResultsProps) {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const filters = useMemo(() => {
    const status = searchParams.get('status') as OrderStatus | null
    const sortBy = searchParams.get('sortBy') ?? undefined
    const sortOrder = searchParams.get('sortOrder') ?? undefined

    return {
      status: status ?? undefined,
      sortBy,
      sortOrder,
      hasFilters: Boolean(status)
    }
  }, [searchParams])

  useEffect(() => {
    let isCurrent = true

    async function loadOrders() {
      setIsLoading(true)
      setError(null)

      const result = await getOrdersClient({ status: filters.status })

      if (!isCurrent) return

      if (result.success) {
        setOrders(result.data ?? [])
        setError(null)
      } else {
        setOrders([])
        setError(result.error || 'No se pudo cargar la lista de órdenes')
      }

      setIsLoading(false)
    }

    void loadOrders()

    return () => {
      isCurrent = false
    }
  }, [filters.status, reloadKey])

  if (isLoading) return <OrdersTableSkeleton />

  const sortedOrders = sortOrders(orders, filters.sortBy, filters.sortOrder)

  return (
    <div className='space-y-4'>
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error al cargar órdenes</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='mt-2'
              onClick={() => setReloadKey(key => key + 1)}
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <OrdersTable
        orders={sortedOrders}
        hasFilters={filters.hasFilters}
        basePath={basePath}
      />
    </div>
  )
}

export function OrdersSearchResults(props: OrdersSearchResultsProps) {
  return (
    <Suspense fallback={<OrdersTableSkeleton />}>
      <OrdersSearchResultsContent {...props} />
    </Suspense>
  )
}
