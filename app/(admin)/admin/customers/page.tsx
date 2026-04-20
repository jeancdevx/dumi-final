import { Suspense } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { CreateClientForm } from '@/modules/clients/ui/components/create-client-form'

import { getClients } from '@/modules/clients/queries'
import { ClientsTable } from '@/modules/clients/ui/components/clients-table'

export const dynamic = 'force-dynamic'

// ─── Componente async que carga los datos en el servidor ─────────────────────
async function CustomersContent() {
  const clients = await getClients()
  return <ClientsTable clients={clients} />
}

// ─── Skeleton mientras se carga la tabla ─────────────────────────────────────
function ClientsTableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-80" />
      <div className="rounded-md border">
        <div className="space-y-px">
          {/* Header */}
          <div className="bg-muted/50 flex gap-4 px-4 py-3">
            {[180, 180, 120, 200, 80, 60].map((w, i) => (
              <Skeleton key={i} className="h-4" style={{ width: w }} />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 px-4 py-3">
              {[180, 180, 120, 200, 80, 60].map((w, j) => (
                <Skeleton key={j} className="h-4" style={{ width: w }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function CustomersPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm">
            Gestiona los clientes registrados en tu organización
          </p>
        </div>

        <CreateClientForm />
      </div>

      {/* Tabla con Suspense */}
      <Suspense fallback={<ClientsTableSkeleton />}>
        <CustomersContent />
      </Suspense>
    </div>
  )
}
