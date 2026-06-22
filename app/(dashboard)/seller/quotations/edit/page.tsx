import { Suspense } from 'react'

import { EditQuotationRouteClient } from '@/modules/quotations/ui/components/edit-quotation-route-client'

export default function SellerEditQuotationPage() {
  return (
    <Suspense>
      <EditQuotationRouteClient
        homePath='/seller'
        basePath='/seller/quotations'
      />
    </Suspense>
  )
}
