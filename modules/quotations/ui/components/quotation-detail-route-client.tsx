'use client'

import { useSearchParams } from 'next/navigation'

import { MissingIdState } from '@/components/missing-id-state'

import { QuotationDetailPageClient } from './quotation-detail-page-client'

interface QuotationDetailRouteClientProps {
  homePath?: string
  basePath?: string
  ordersBasePath?: string
}

export function QuotationDetailRouteClient(
  props: QuotationDetailRouteClientProps
) {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  if (!id) {
    return (
      <MissingIdState
        title='No se pudo cargar la cotización'
        description='Falta el identificador de la cotización en la URL.'
        backHref={props.basePath ?? '/admin/quotations'}
        backLabel='Volver a cotizaciones'
      />
    )
  }

  return <QuotationDetailPageClient id={id} {...props} />
}
