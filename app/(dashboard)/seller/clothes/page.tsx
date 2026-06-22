import Link from 'next/link'

import { Zap } from 'lucide-react'

import { ClothesFilters } from '@/modules/clothes/ui/components/clothes-filters'
import { ClothesSearchInput } from '@/modules/clothes/ui/components/clothes-search-input'
import { ClothesSearchResults } from '@/modules/clothes/ui/components/clothes-search-results'

import { Button } from '@/components/ui/button'

export default function SellerClothesPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Prendas</h1>
          <p className='text-muted-foreground'>
            Consulta el catálogo de prendas disponibles
          </p>
        </div>
        <Button variant='outline' asChild>
          <Link href='/seller/clothes/quick'>
            <Zap className='mr-2 h-4 w-4' />
            Creación rápida
          </Link>
        </Button>
      </div>

      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <ClothesSearchInput />
        <ClothesFilters />
      </div>

      <ClothesSearchResults basePath='/seller/clothes' canEdit={false} />
    </div>
  )
}
