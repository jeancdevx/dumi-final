import type { Metadata } from 'next'

import { getCatalog } from '@/modules/ecommerce/catalog/actions/get-catalog'
import { CatalogGrid } from '@/modules/ecommerce/catalog/ui/components/catalog-grid'

export const metadata: Metadata = {
  title: 'Catálogo | TELAR',
  description: 'Explora nuestra colección de prendas personalizadas'
}

export default async function CatalogPage() {
  const result = await getCatalog()

  const clothes = result.success ? (result.data ?? []) : []

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Nuestro Catálogo</h1>
        <p className='text-muted-foreground mt-2'>
          Explora nuestra colección de prendas personalizadas
        </p>
      </div>

      <CatalogGrid clothes={clothes} />
    </div>
  )
}
