'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Home
} from 'lucide-react'

import { detailPath } from '@/lib/routes'

import { getClothesWithVariantsClient } from '@/modules/clothes/lib/clothes-client'
import type { Clothes } from '@/modules/clothes/types'
import { QUOTATION_STATUSES } from '@/modules/quotations/constants'
import { getQuotationByIdClient } from '@/modules/quotations/lib/quotations-client'
import type { QuotationWithDetails } from '@/modules/quotations/types'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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

import { EditQuotationForm } from './edit-quotation-form'

interface EditQuotationPageClientProps {
  id: string
  homePath?: string
  basePath?: string
}

const colorClasses = {
  yellow:
    'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
  green:
    'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  red: 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400'
}

function EditQuotationSkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-20 w-full' />
      <Skeleton className='h-[540px] w-full' />
    </div>
  )
}

export function EditQuotationPageClient({
  id,
  homePath = '/admin',
  basePath = '/admin/quotations'
}: EditQuotationPageClientProps) {
  const [quotation, setQuotation] = useState<QuotationWithDetails | null>(null)
  const [clothes, setClothes] = useState<Clothes[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadInitialData() {
      setIsLoading(true)
      setError(null)

      const [quotationResult, clothesResult] = await Promise.all([
        getQuotationByIdClient(id),
        getClothesWithVariantsClient()
      ])

      if (!isCurrent) return

      if (
        quotationResult.success &&
        quotationResult.data &&
        clothesResult.success
      ) {
        setQuotation(quotationResult.data)
        setClothes(clothesResult.data ?? [])
      } else {
        setQuotation(null)
        setClothes([])
        setError(
          quotationResult.error ||
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
  }, [id, reloadKey])

  const statusOption = quotation
    ? QUOTATION_STATUSES.find(s => s.value === quotation.status)
    : null

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
          {quotation?.status === 'PENDING' && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={detailPath(basePath, id)}>Detalle</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className='h-4 w-4' />
              </BreadcrumbSeparator>
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>Editar</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {isLoading ? (
        <EditQuotationSkeleton />
      ) : error || !quotation ? (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error al cargar cotización</AlertTitle>
          <AlertDescription>
            <p>{error ?? 'Cotización no encontrada'}</p>
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
        <>
          <div className='flex items-center justify-between'>
            <div>
              <div className='flex items-center gap-3'>
                <h1 className='text-2xl font-bold tracking-tight'>
                  Editar cotización
                </h1>
                {statusOption && (
                  <Badge className={colorClasses[statusOption.color]}>
                    {statusOption.label}
                  </Badge>
                )}
              </div>
              <p className='text-muted-foreground'>
                {quotation.status === 'PENDING'
                  ? 'Modifica los detalles de la cotización'
                  : `Cotización #${id.slice(0, 8)}...`}
              </p>
            </div>
          </div>

          {quotation.status !== 'PENDING' ? (
            <>
              <Alert variant='destructive'>
                <AlertTriangle className='h-4 w-4' />
                <AlertTitle>No se puede editar</AlertTitle>
                <AlertDescription>
                  Solo se pueden editar cotizaciones en estado pendiente. Esta
                  cotización está en estado{' '}
                  <strong>{statusOption?.label || quotation.status}</strong>.
                </AlertDescription>
              </Alert>

              <div className='flex gap-3'>
                <Button variant='outline' asChild>
                  <Link href={detailPath(basePath, id)}>
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Volver al detalle
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <EditQuotationForm
              quotation={quotation}
              clothes={clothes}
              basePath={basePath}
            />
          )}
        </>
      )}
    </div>
  )
}
