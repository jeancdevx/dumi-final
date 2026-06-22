import { Suspense } from 'react'

import { OrderDetailRouteClient } from '@/modules/orders/ui/components/order-detail-route-client'

export default function OrderDetailPage() {
  return (
    <Suspense>
      <OrderDetailRouteClient />
    </Suspense>
  )
}
