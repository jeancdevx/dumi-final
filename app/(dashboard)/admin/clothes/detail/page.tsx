import { Suspense } from 'react'

import { ClothesDetailRouteClient } from '@/modules/clothes/ui/components/clothes-detail-route-client'

export default function ClothesDetailPage() {
  return (
    <Suspense>
      <ClothesDetailRouteClient />
    </Suspense>
  )
}
