'use client'

import { useSearchParams } from 'next/navigation'

import { MissingIdState } from '@/components/missing-id-state'

import { ClothesDetailPageClient } from './clothes-detail-page-client'

interface ClothesDetailRouteClientProps {
  homePath?: string
  basePath?: string
  canEdit?: boolean
}

export function ClothesDetailRouteClient(props: ClothesDetailRouteClientProps) {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  if (!id) {
    return (
      <MissingIdState
        title='No se pudo cargar la prenda'
        description='Falta el identificador de la prenda en la URL.'
        backHref={props.basePath ?? '/admin/clothes'}
        backLabel='Volver a prendas'
      />
    )
  }

  return <ClothesDetailPageClient id={id} {...props} />
}
