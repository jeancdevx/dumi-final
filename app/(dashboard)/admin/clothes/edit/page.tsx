import { Suspense } from 'react'

import { EditClothesRouteClient } from '@/modules/clothes/ui/components/edit-clothes-route-client'

export default function EditClothesPage() {
  return (
    <Suspense>
      <EditClothesRouteClient />
    </Suspense>
  )
}
