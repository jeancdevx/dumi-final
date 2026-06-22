import Link from 'next/link'

import { Plus, Zap } from 'lucide-react'

import { ClothesFilters } from '@/modules/clothes/ui/components/clothes-filters'
import { ClothesSearchInput } from '@/modules/clothes/ui/components/clothes-search-input'
import { ClothesSearchResults } from '@/modules/clothes/ui/components/clothes-search-results'

import { Button } from '@/components/ui/button'

export default function ClothesPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Prendas</h1>
          <p className='text-muted-foreground'>
            Gestiona el catálogo de prendas
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' asChild>
            <Link href='/admin/clothes/quick'>
              <Zap className='mr-2 h-4 w-4' />
              Creación rápida
            </Link>
          </Button>
          <Button asChild>
            <Link href='/admin/clothes/new'>
              <Plus className='mr-2 h-4 w-4' />
              Nueva prenda
            </Link>
          </Button>
        </div>
      </div>

      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <ClothesSearchInput />
        <ClothesFilters />
      </div>

      <ClothesSearchResults />
    </div>
  )
}
