'use client'

import { useSearchParams } from 'next/navigation'

import { MissingIdState } from '@/components/missing-id-state'

import { EditClothesPageClient } from './edit-clothes-page-client'

export function EditClothesRouteClient() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  if (!id) {
    return (
      <MissingIdState
        title='No se pudo editar la prenda'
        description='Falta el identificador de la prenda en la URL.'
        backHref='/admin/clothes'
        backLabel='Volver a prendas'
      />
    )
  }

  return <EditClothesPageClient id={id} />
}
