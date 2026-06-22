import Link from 'next/link'

import { Plus } from 'lucide-react'

import { QuotationsFilters } from '@/modules/quotations/ui/components/quotations-filters'
import { QuotationsSearchResults } from '@/modules/quotations/ui/components/quotations-search-results'

import { Button } from '@/components/ui/button'

export default function SellerQuotationsPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Cotizaciones</h1>
          <p className='text-muted-foreground'>
            Gestiona las cotizaciones de tus clientes
          </p>
        </div>
        <Button asChild>
          <Link href='/seller/quotations/new'>
            <Plus className='mr-2 h-4 w-4' />
            Nueva cotización
          </Link>
        </Button>
      </div>

      <QuotationsFilters />

      <QuotationsSearchResults basePath='/seller/quotations' />
    </div>
  )
}
