'use client'

import { useSearchParams } from 'next/navigation'

import { MissingIdState } from '@/components/missing-id-state'

import { OrderDetailPageClient } from './order-detail-page-client'

interface OrderDetailRouteClientProps {
  homePath?: string
  basePath?: string
}

export function OrderDetailRouteClient(props: OrderDetailRouteClientProps) {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  if (!id) {
    return (
      <MissingIdState
        title='No se pudo cargar la orden'
        description='Falta el identificador de la orden en la URL.'
        backHref={props.basePath ?? '/admin/orders'}
        backLabel='Volver a órdenes'
      />
    )
  }

  return <OrderDetailPageClient id={id} {...props} />
}
