import { Suspense } from 'react'

import { OrderDetailRouteClient } from '@/modules/orders/ui/components/order-detail-route-client'

export default function SellerOrderDetailPage() {
  return (
    <Suspense>
      <OrderDetailRouteClient homePath='/seller' basePath='/seller/orders' />
    </Suspense>
  )
}
