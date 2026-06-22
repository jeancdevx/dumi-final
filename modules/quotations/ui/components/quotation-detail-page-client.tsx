'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { AlertCircle, ArrowLeft, Edit } from 'lucide-react'

import { editPath } from '@/lib/routes'

import { CreateOrderDialog } from '@/modules/orders/ui/components'
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

import { CancelQuotationDialog } from './cancel-quotation-dialog'
import { QuotationDetail } from './quotation-detail'

interface QuotationDetailPageClientProps {
  id: string
  homePath?: string
  basePath?: string
  ordersBasePath?: string
}

const colorClasses = {
  yellow:
    'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
  green:
    'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  red: 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400'
}

function QuotationDetailSkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-8 w-72' />
      <div className='grid gap-6 md:grid-cols-3'>
        <Skeleton className='h-[420px] md:col-span-2' />
        <div className='space-y-6'>
          <Skeleton className='h-40' />
          <Skeleton className='h-48' />
        </div>
      </div>
    </div>
  )
}

export function QuotationDetailPageClient({
  id,
  homePath = '/admin',
  basePath = '/admin/quotations',
  ordersBasePath = '/admin/orders'
}: QuotationDetailPageClientProps) {
  const [quotation, setQuotation] = useState<QuotationWithDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadQuotation() {
      setIsLoading(true)
      setError(null)

      const result = await getQuotationByIdClient(id)

      if (!isCurrent) return

      if (result.success && result.data) {
        setQuotation(result.data)
      } else {
        setQuotation(null)
        setError(result.error || 'No se pudo cargar la cotización')
      }

      setIsLoading(false)
    }

    void loadQuotation()

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
            <BreadcrumbLink href={homePath}>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={basePath}>Cotizaciones</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detalle</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {isLoading ? (
        <QuotationDetailSkeleton />
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
            <div className='flex items-center gap-4'>
              <div>
                <div className='flex items-center gap-3'>
                  <h1 className='text-2xl font-bold tracking-tight'>
                    Cotización #{id.slice(0, 8)}...
                  </h1>
                  {statusOption && (
                    <Badge className={colorClasses[statusOption.color]}>
                      {statusOption.label}
                    </Badge>
                  )}
                </div>
                <p className='text-muted-foreground'>
                  Detalle completo de la cotización
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='outline' asChild>
                <Link href={basePath}>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Volver
                </Link>
              </Button>
              {quotation.status === 'PENDING' && (
                <>
                  <CreateOrderDialog
                    quoteId={id}
                    quotationCode={id.slice(0, 8)}
                    basePath={ordersBasePath}
                  />
                  <Button asChild>
                    <Link href={editPath(basePath, id)}>
                      <Edit className='mr-2 h-4 w-4' />
                      Editar
                    </Link>
                  </Button>
                  <CancelQuotationDialog
                    quotationId={id}
                    onSuccess={() => setReloadKey(key => key + 1)}
                  />
                </>
              )}
            </div>
          </div>

          <QuotationDetail
            quotation={quotation}
            ordersBasePath={ordersBasePath}
          />
        </>
      )}
    </div>
  )
}
