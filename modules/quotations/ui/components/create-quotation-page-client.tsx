'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { AlertCircle, ChevronRight, Home } from 'lucide-react'

import { getClientsClient } from '@/modules/clients/lib/clients-client'
import type { Client } from '@/modules/clients/types'
import { getClothesWithVariantsClient } from '@/modules/clothes/lib/clothes-client'
import type { Clothes } from '@/modules/clothes/types'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { CreateQuotationForm } from './create-quotation-form'

interface CreateQuotationPageClientProps {
  homePath?: string
  basePath?: string
}

function CreateQuotationSkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-32 w-full' />
      <Skeleton className='h-[460px] w-full' />
    </div>
  )
}

export function CreateQuotationPageClient({
  homePath = '/admin',
  basePath = '/admin/quotations'
}: CreateQuotationPageClientProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [clothes, setClothes] = useState<Clothes[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadInitialData() {
      setIsLoading(true)
      setError(null)

      const [clientsResult, clothesResult] = await Promise.all([
        getClientsClient(),
        getClothesWithVariantsClient()
      ])

      if (!isCurrent) return

      if (clientsResult.success && clothesResult.success) {
        setClients(clientsResult.data ?? [])
        setClothes(clothesResult.data ?? [])
      } else {
        setClients([])
        setClothes([])
        setError(
          clientsResult.error ||
            clothesResult.error ||
            'No se pudo cargar la información inicial'
        )
      }

      setIsLoading(false)
    }

    void loadInitialData()

    return () => {
      isCurrent = false
    }
  }, [reloadKey])

  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={homePath}>
                <Home className='h-4 w-4' />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className='h-4 w-4' />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={basePath}>Cotizaciones</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className='h-4 w-4' />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Nueva cotización</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Nueva cotización</h1>
        <p className='text-muted-foreground'>
          Crea una cotización seleccionando cliente y prendas
        </p>
      </div>

      {isLoading ? (
        <CreateQuotationSkeleton />
      ) : error ? (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error al cargar datos</AlertTitle>
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
      ) : (
        <CreateQuotationForm
          clients={clients}
          clothes={clothes}
          basePath={basePath}
        />
      )}
    </div>
  )
}
