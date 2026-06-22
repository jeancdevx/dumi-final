'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { AlertCircle, ChevronRight, Home } from 'lucide-react'

import { getClothesByIdClient } from '@/modules/clothes/lib/clothes-client'
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

import { ClothesDetail } from './clothes-detail'

interface ClothesDetailPageClientProps {
  id: string
  homePath?: string
  basePath?: string
  canEdit?: boolean
}

function ClothesDetailSkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-6 w-72' />
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <Skeleton className='aspect-square w-full' />
        <div className='space-y-4'>
          <Skeleton className='h-10 w-2/3' />
          <Skeleton className='h-6 w-24' />
          <Skeleton className='h-8 w-32' />
          <Skeleton className='h-24 w-full' />
        </div>
      </div>
    </div>
  )
}

export function ClothesDetailPageClient({
  id,
  homePath = '/admin',
  basePath = '/admin/clothes',
  canEdit = true
}: ClothesDetailPageClientProps) {
  const [clothes, setClothes] = useState<Clothes | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadClothes() {
      setIsLoading(true)
      setError(null)

      const result = await getClothesByIdClient(id)

      if (!isCurrent) return

      if (result.success && result.data) {
        setClothes(result.data)
      } else {
        setClothes(null)
        setError(result.error || 'No se pudo cargar la prenda')
      }

      setIsLoading(false)
    }

    void loadClothes()

    return () => {
      isCurrent = false
    }
  }, [id, reloadKey])

  if (isLoading) {
    return (
      <div className='flex flex-1 flex-col gap-6 p-6'>
        <ClothesDetailSkeleton />
      </div>
    )
  }

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
              <Link href={basePath}>Prendas</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className='h-4 w-4' />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{clothes?.name ?? 'Detalle'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {error || !clothes ? (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error al cargar prenda</AlertTitle>
          <AlertDescription>
            <p>{error ?? 'Prenda no encontrada'}</p>
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
        <ClothesDetail
          clothes={clothes}
          basePath={basePath}
          canEdit={canEdit}
        />
      )}
    </div>
  )
}
