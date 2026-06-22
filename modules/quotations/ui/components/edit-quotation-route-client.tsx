'use client'

import { useSearchParams } from 'next/navigation'

import { MissingIdState } from '@/components/missing-id-state'

import { EditQuotationPageClient } from './edit-quotation-page-client'

interface EditQuotationRouteClientProps {
  homePath?: string
  basePath?: string
}

export function EditQuotationRouteClient(props: EditQuotationRouteClientProps) {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  if (!id) {
    return (
      <MissingIdState
        title='No se pudo editar la cotización'
        description='Falta el identificador de la cotización en la URL.'
        backHref={props.basePath ?? '/admin/quotations'}
        backLabel='Volver a cotizaciones'
      />
    )
  }

  return <EditQuotationPageClient id={id} {...props} />
}
