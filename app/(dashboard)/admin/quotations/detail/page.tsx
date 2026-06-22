import { Suspense } from 'react'

import { QuotationDetailRouteClient } from '@/modules/quotations/ui/components/quotation-detail-route-client'

export default function QuotationDetailPage() {
  return (
    <Suspense>
      <QuotationDetailRouteClient />
    </Suspense>
  )
}
