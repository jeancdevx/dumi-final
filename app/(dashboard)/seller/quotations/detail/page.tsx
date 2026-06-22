import { Suspense } from 'react'

import { QuotationDetailRouteClient } from '@/modules/quotations/ui/components/quotation-detail-route-client'

export default function SellerQuotationDetailPage() {
  return (
    <Suspense>
      <QuotationDetailRouteClient
        homePath='/seller'
        basePath='/seller/quotations'
        ordersBasePath='/seller/orders'
      />
    </Suspense>
  )
}
