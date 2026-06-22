'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'

import { useSearchParams } from 'next/navigation'

import { AlertCircle } from 'lucide-react'

import { getQuotationsClient } from '@/modules/quotations/lib/quotations-client'
import type { Quotation, QuotationStatus } from '@/modules/quotations/types'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { QuotationsTable } from './quotations-table'

interface QuotationsSearchResultsProps {
  basePath?: string
}

function QuotationsTableSkeleton() {
  return (
    <div className='space-y-3'>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-16 w-full' />
      <Skeleton className='h-16 w-full' />
      <Skeleton className='h-16 w-full' />
    </div>
  )
}

function sortQuotations(
  quotations: Quotation[],
  sortBy?: string,
  sortOrder?: string
) {
  if (!sortBy) return quotations

  return [...quotations].sort((a, b) => {
    let comparison = 0

    if (sortBy === 'createdAt') {
      comparison =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    } else if (sortBy === 'total') {
      comparison = Number(a.total) - Number(b.total)
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })
}

function QuotationsSearchResultsContent({
  basePath = '/admin/quotations'
}: QuotationsSearchResultsProps) {
  const searchParams = useSearchParams()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const filters = useMemo(() => {
    const status = searchParams.get('status') as QuotationStatus | null
    const sortBy = searchParams.get('sortBy') ?? undefined
    const sortOrder = searchParams.get('sortOrder') ?? undefined

    return {
      status: status ?? undefined,
      sortBy,
      sortOrder,
      hasFilters: Boolean(status)
    }
  }, [searchParams])

  useEffect(() => {
    let isCurrent = true

    async function loadQuotations() {
      setIsLoading(true)
      setError(null)

      const result = await getQuotationsClient({ status: filters.status })

      if (!isCurrent) return

      if (result.success) {
        setQuotations(result.data ?? [])
        setError(null)
      } else {
        setQuotations([])
        setError(result.error || 'No se pudo cargar la lista de cotizaciones')
      }

      setIsLoading(false)
    }

    void loadQuotations()

    return () => {
      isCurrent = false
    }
  }, [filters.status, reloadKey])

  if (isLoading) return <QuotationsTableSkeleton />

  const sortedQuotations = sortQuotations(
    quotations,
    filters.sortBy,
    filters.sortOrder
  )

  return (
    <div className='space-y-4'>
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error al cargar cotizaciones</AlertTitle>
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

      <QuotationsTable
        quotations={sortedQuotations}
        hasFilters={filters.hasFilters}
        basePath={basePath}
      />
    </div>
  )
}

export function QuotationsSearchResults(props: QuotationsSearchResultsProps) {
  return (
    <Suspense fallback={<QuotationsTableSkeleton />}>
      <QuotationsSearchResultsContent {...props} />
    </Suspense>
  )
}
