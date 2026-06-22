import { Suspense } from 'react'

import { ClientsPageClient } from '@/modules/clients/ui/components/clients-page-client'

import { Spinner } from '@/components/ui/spinner'

function ClientsPageFallback() {
  return (
    <div className='text-muted-foreground flex flex-1 items-center justify-center gap-2 p-6 text-sm'>
      <Spinner />
      Cargando clientes...
    </div>
  )
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<ClientsPageFallback />}>
      <ClientsPageClient />
    </Suspense>
  )
}
