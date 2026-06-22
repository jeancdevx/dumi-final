'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'

import { useSearchParams } from 'next/navigation'

import { AlertCircle } from 'lucide-react'

import { searchClothesClient } from '@/modules/clothes/lib/clothes-client'
import type { Clothes, SearchClothesParams } from '@/modules/clothes/types'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { ClothesTable } from './clothes-table'

interface ClothesSearchResultsProps {
  basePath?: string
  canEdit?: boolean
}

function ClothesTableSkeleton() {
  return (
    <div className='space-y-3'>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-16 w-full' />
      <Skeleton className='h-16 w-full' />
      <Skeleton className='h-16 w-full' />
    </div>
  )
}

function ClothesSearchResultsContent({
  basePath,
  canEdit
}: ClothesSearchResultsProps) {
  const searchParams = useSearchParams()
  const [clothes, setClothes] = useState<Clothes[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const filters = useMemo(() => {
    const q = searchParams.get('q') ?? ''
    const size = searchParams.get('size') ?? ''
    const gender = searchParams.get('gender') ?? ''
    const status = searchParams.get('status') ?? ''
    const params: SearchClothesParams = {}

    if (q) params.name = q
    if (size) params.size = size
    if (gender) params.gender = gender
    if (status === 'published') params.isDraft = false
    if (status === 'draft') params.isDraft = true

    return {
      params,
      hasFilters: Boolean(q || size || gender || status)
    }
  }, [searchParams])

  useEffect(() => {
    let isCurrent = true

    async function loadClothes() {
      setIsLoading(true)
      setError(null)

      const result = await searchClothesClient(filters.params)

      if (!isCurrent) return

      if (result.success) {
        setClothes(result.data ?? [])
      } else {
        setClothes([])
        setError(result.error || 'No se pudo cargar la lista de prendas')
      }

      setIsLoading(false)
    }

    void loadClothes()

    return () => {
      isCurrent = false
    }
  }, [filters, reloadKey])

  if (isLoading) return <ClothesTableSkeleton />

  return (
    <div className='space-y-4'>
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error al cargar prendas</AlertTitle>
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

      <ClothesTable
        clothes={clothes}
        hasFilters={filters.hasFilters}
        basePath={basePath}
        canEdit={canEdit}
      />
    </div>
  )
}

export function ClothesSearchResults(props: ClothesSearchResultsProps) {
  return (
    <Suspense fallback={<ClothesTableSkeleton />}>
      <ClothesSearchResultsContent {...props} />
    </Suspense>
  )
}
