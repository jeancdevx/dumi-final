import { Suspense } from 'react'

import { ClothesDetailRouteClient } from '@/modules/clothes/ui/components/clothes-detail-route-client'

export default function SellerClothesDetailPage() {
  return (
    <Suspense>
      <ClothesDetailRouteClient
        homePath='/seller'
        basePath='/seller/clothes'
        canEdit={false}
      />
    </Suspense>
  )
}
