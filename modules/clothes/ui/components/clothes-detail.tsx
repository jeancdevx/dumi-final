'use client'

import Link from 'next/link'

import { ArrowLeft, Pencil } from 'lucide-react'

import { editPath } from '@/lib/routes'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import type { Clothes } from '../../types'
import { ClothesImageGallery } from './clothes-image-gallery'
import { ClothesVariantsTable } from './clothes-variants-table'

interface ClothesDetailProps {
  clothes: Clothes
  basePath?: string
  canEdit?: boolean
}

export function ClothesDetail({
  clothes,
  basePath = '/admin/clothes',
  canEdit = true
}: ClothesDetailProps) {
  const basePrice = parseFloat(clothes.price)

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        {/* Left Column - Gallery */}
        <ClothesImageGallery images={clothes.clothe_image} />

        {/* Right Column - Information */}
        <div className='space-y-6'>
          {/* Header */}
          <div className='space-y-3'>
            <h1 className='text-3xl font-bold tracking-tight'>
              {clothes.name}
            </h1>

            <div className='flex flex-wrap gap-2'>
              {clothes.isDraft ? (
                <Badge
                  variant='secondary'
                  className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                >
                  Borrador
                </Badge>
              ) : (
                <Badge
                  variant='secondary'
                  className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                >
                  Publicada
                </Badge>
              )}
            </div>

            <p className='text-primary text-2xl font-semibold'>
              S/ {basePrice.toFixed(2)}
            </p>
          </div>

          {/* Description */}
          {clothes.description && (
            <p className='text-muted-foreground'>{clothes.description}</p>
          )}

          <Separator />

          {/* Variants */}
          <div className='space-y-4'>
            <h2 className='text-lg font-semibold'>Variantes disponibles</h2>
            <ClothesVariantsTable
              variants={clothes.clothes_variant}
              basePrice={basePrice}
            />
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-4'>
            <Button variant='outline' asChild>
              <Link href={basePath}>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Volver
              </Link>
            </Button>
            {canEdit && (
              <Button asChild>
                <Link href={editPath(basePath, clothes.id)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Editar prenda
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
