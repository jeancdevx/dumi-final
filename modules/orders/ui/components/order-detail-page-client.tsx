'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { AlertCircle, ArrowLeft } from 'lucide-react'

import { ORDER_STATUSES } from '@/modules/orders/constants'
import { getOrderByIdClient } from '@/modules/orders/lib/orders-client'
import type { OrderWithDetails } from '@/modules/orders/types'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { CancelOrderDialog } from './cancel-order-dialog'
import { CompleteOrderDialog } from './complete-order-dialog'
import { OrderDetail } from './order-detail'

interface OrderDetailPageClientProps {
  id: string
  homePath?: string
  basePath?: string
}

function OrderDetailSkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-8 w-64' />
      <div className='grid gap-6 md:grid-cols-3'>
        <Skeleton className='h-[520px] md:col-span-2' />
        <div className='space-y-6'>
          <Skeleton className='h-36' />
          <Skeleton className='h-36' />
          <Skeleton className='h-48' />
        </div>
      </div>
    </div>
  )
}

export function OrderDetailPageClient({
  id,
  homePath = '/admin',
  basePath = '/admin/orders'
}: OrderDetailPageClientProps) {
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadOrder() {
      setIsLoading(true)
      setError(null)

      const result = await getOrderByIdClient(id)

      if (!isCurrent) return

      if (result.success && result.data) {
        setOrder(result.data)
      } else {
        setOrder(null)
        setError(result.error || 'No se pudo cargar la orden')
      }

      setIsLoading(false)
    }

    void loadOrder()

    return () => {
      isCurrent = false
    }
  }, [id, reloadKey])

  const statusOption = order ? ORDER_STATUSES[order.status] : null
  const refreshOrder = () => setReloadKey(key => key + 1)

  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={homePath}>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={basePath}>Órdenes</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detalle</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {isLoading ? (
        <OrderDetailSkeleton />
      ) : error || !order ? (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error al cargar orden</AlertTitle>
          <AlertDescription>
            <p>{error ?? 'Orden no encontrada'}</p>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='mt-2'
              onClick={refreshOrder}
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div>
                <div className='flex items-center gap-3'>
                  <h1 className='text-2xl font-bold tracking-tight'>
                    Orden #{id.slice(0, 8)}...
                  </h1>
                  {statusOption && (
                    <Badge variant={statusOption.variant}>
                      {statusOption.label}
                    </Badge>
                  )}
                </div>
                <p className='text-muted-foreground'>
                  Detalle completo de la orden
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='outline' asChild>
                <Link href={basePath}>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Volver
                </Link>
              </Button>
              {order.status === 'IN_PRODUCTION' && (
                <>
                  <CancelOrderDialog orderId={id} onSuccess={refreshOrder} />
                  <CompleteOrderDialog orderId={id} onSuccess={refreshOrder} />
                </>
              )}
            </div>
          </div>

          <OrderDetail order={order} />
        </>
      )}
    </div>
  )
}
