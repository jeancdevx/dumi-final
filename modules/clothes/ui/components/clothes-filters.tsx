'use client'

import { useCallback } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Filter, X } from 'lucide-react'

import { ClientOnly } from '@/components/client-only'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { GENDERS, SIZES } from '../../constants'

export function ClothesFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const size = searchParams.get('size') ?? ''
  const gender = searchParams.get('gender') ?? ''
  const status = searchParams.get('status') ?? ''

  const activeFiltersCount = [size, gender, status].filter(Boolean).length

  const updateSearchParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }

      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('size')
    params.delete('gender')
    params.delete('status')
    router.push(`${pathname}?${params.toString()}`)
  }, [pathname, router, searchParams])

  return (
    <ClientOnly
      fallback={
        <div className='flex flex-wrap items-center gap-2'>
          <div className='flex items-center gap-2'>
            <Filter className='text-muted-foreground h-4 w-4' />
            <span className='text-muted-foreground text-sm'>Filtros:</span>
          </div>
          <div className='h-9 w-[130px] rounded-md border' />
          <div className='h-9 w-[130px] rounded-md border' />
          <div className='h-9 w-[140px] rounded-md border' />
        </div>
      }
    >
      <div className='flex flex-wrap items-center gap-2'>
        <div className='flex items-center gap-2'>
          <Filter className='text-muted-foreground h-4 w-4' />
          <span className='text-muted-foreground text-sm'>Filtros:</span>
        </div>

        <Select
          value={size || 'all'}
          onValueChange={v => updateSearchParams('size', v)}
        >
          <SelectTrigger className='w-[130px]'>
            <SelectValue placeholder='Talla' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todas las tallas</SelectItem>
            <SelectItem value='header-ninos' disabled>
              — Niños —
            </SelectItem>
            {SIZES.filter(s => s.category === 'niños').map(s => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
            <SelectItem value='header-adultos' disabled>
              — Adultos —
            </SelectItem>
            {SIZES.filter(s => s.category === 'adultos').map(s => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={gender || 'all'}
          onValueChange={v => updateSearchParams('gender', v)}
        >
          <SelectTrigger className='w-[130px]'>
            <SelectValue placeholder='Género' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos los géneros</SelectItem>
            {GENDERS.map(g => (
              <SelectItem key={g.value} value={g.value}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status || 'all'}
          onValueChange={v => updateSearchParams('status', v)}
        >
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder='Estado' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos</SelectItem>
            <SelectItem value='published'>Publicados</SelectItem>
            <SelectItem value='draft'>Borradores</SelectItem>
          </SelectContent>
        </Select>

        {activeFiltersCount > 0 && (
          <>
            <Badge variant='secondary' className='ml-2'>
              {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''}
            </Badge>
            <Button
              variant='ghost'
              size='sm'
              onClick={clearFilters}
              className='h-8 px-2'
            >
              <X className='mr-1 h-3 w-3' />
              Limpiar
            </Button>
          </>
        )}
      </div>
    </ClientOnly>
  )
}
