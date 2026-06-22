'use client'

import { useEffect, useState } from 'react'

import { AlertCircle } from 'lucide-react'

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
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

import { EditClothesForm } from './edit-clothes-form'
import { EditImagesSection } from './edit-images-section'
import { EditVariantsSection } from './edit-variants-section'

interface EditClothesPageClientProps {
  id: string
}

function EditClothesSkeleton() {
  return (
    <div className='grid gap-6 lg:grid-cols-3'>
      <Skeleton className='h-[420px] lg:col-span-1' />
      <div className='space-y-6 lg:col-span-2'>
        <Skeleton className='h-[360px]' />
        <Skeleton className='h-[280px]' />
      </div>
    </div>
  )
}

export function EditClothesPageClient({ id }: EditClothesPageClientProps) {
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

  const basePrice = Number(clothes?.price) || 0
  const refreshClothes = () => setReloadKey(key => key + 1)

  return (
    <>
      <header className='flex h-16 shrink-0 items-center gap-2'>
        <div className='flex items-center gap-2 px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator
            orientation='vertical'
            className='mr-2 data-[orientation=vertical]:h-4'
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className='hidden md:block'>
                <BreadcrumbLink href='/admin/clothes'>Prendas</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden md:block' />
              <BreadcrumbItem>
                <BreadcrumbPage>Editar prenda</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl font-bold tracking-tight'>Editar prenda</h1>
          <p className='text-muted-foreground'>
            {clothes
              ? `Modifica los datos de la prenda "${clothes.name}".`
              : 'Carga y modifica los datos de la prenda.'}
          </p>
        </div>

        {isLoading ? (
          <EditClothesSkeleton />
        ) : error || !clothes ? (
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
                onClick={refreshClothes}
              >
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className='grid gap-6 lg:grid-cols-3'>
            <div className='lg:col-span-1'>
              <EditImagesSection
                clothesId={clothes.id}
                images={clothes.clothe_image ?? []}
                onChanged={refreshClothes}
              />
            </div>

            <div className='space-y-6 lg:col-span-2'>
              <EditClothesForm clothes={clothes} onUpdated={refreshClothes} />
              <EditVariantsSection
                clothesId={clothes.id}
                variants={clothes.clothes_variant ?? []}
                basePrice={basePrice}
                onChanged={refreshClothes}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
