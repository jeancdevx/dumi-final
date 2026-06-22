import { Suspense } from 'react'

import { EditQuotationRouteClient } from '@/modules/quotations/ui/components/edit-quotation-route-client'

export default function EditQuotationPage() {
  return (
    <Suspense>
      <EditQuotationRouteClient />
    </Suspense>
  )
}
