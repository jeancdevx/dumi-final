'use client'

import { useEffect, useMemo, useState } from 'react'

import { useSearchParams } from 'next/navigation'

import { AlertCircle } from 'lucide-react'

import {
  getClientsClient,
  searchClientsClient
} from '@/modules/clients/lib/clients-client'
import type { Client } from '@/modules/clients/types'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

import { ClientsTable } from './clients-table'
import { CreateClientForm } from './create-client-form'
import { SearchClientsForm } from './search-clients-form'

interface ClientsPageClientProps {
  basePath?: string
}

export function ClientsPageClient({
  basePath = '/admin/clients'
}: ClientsPageClientProps) {
  const searchParams = useSearchParams()
  const [clients, setClients] = useState<Client[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const filters = useMemo(
    () => ({
      names: searchParams.get('names') ?? '',
      lastnames: searchParams.get('lastnames') ?? '',
      phone: searchParams.get('phone') ?? ''
    }),
    [searchParams]
  )
  const hasFilters = !!(filters.names || filters.lastnames || filters.phone)
  const searchKey = searchParams.toString()

  useEffect(() => {
    let isCurrent = true

    async function loadClients() {
      setIsLoading(true)
      setError(null)

      const result = hasFilters
        ? await searchClientsClient(filters)
        : await getClientsClient()

      if (!isCurrent) return

      if (result.success) {
        setClients(result.data ?? [])
      } else {
        setClients([])
        setError(result.error || 'No se pudo cargar la lista de clientes')
      }

      setIsLoading(false)
    }

    void loadClients()

    return () => {
      isCurrent = false
    }
  }, [filters, hasFilters, reloadKey])

  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Clientes</h1>
          <p className='text-muted-foreground'>
            Gestiona los clientes de tu negocio
          </p>
        </div>
        <CreateClientForm onCreated={() => setReloadKey(key => key + 1)} />
      </div>

      <SearchClientsForm
        key={searchKey}
        basePath={basePath}
        onRefresh={() => setReloadKey(key => key + 1)}
      />

      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error al cargar clientes</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='mt-2'
              onClick={() => setReloadKey(key => key + 1)}
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className='text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm'>
          <Spinner />
          Cargando clientes...
        </div>
      ) : (
        <ClientsTable clients={clients} hasFilters={hasFilters} />
      )}
    </div>
  )
}
