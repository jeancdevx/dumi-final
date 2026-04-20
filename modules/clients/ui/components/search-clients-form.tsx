'use client'

import { useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Filters {
  names: string
  lastnames: string
  phone: string
}

export function SearchClientsForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<Filters>({
    names: searchParams.get('names') || '',
    lastnames: searchParams.get('lastnames') || '',
    phone: searchParams.get('phone') || ''
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const hasFilters = filters.names || filters.lastnames || filters.phone

  function buildURL(newFilters: Filters): string {
    const params = new URLSearchParams()
    if (newFilters.names) params.set('names', newFilters.names)
    if (newFilters.lastnames) params.set('lastnames', newFilters.lastnames)
    if (newFilters.phone) params.set('phone', newFilters.phone)
    const queryString = params.toString()
    return queryString ? `/admin/clients?${queryString}` : '/admin/clients'
  }

  function handleChange(field: keyof Filters, value: string) {
    // Solo letras y espacios para nombres y apellidos
    if (field === 'names' || field === 'lastnames') {
      if (value && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value)) return
    }
    // Solo números para teléfono
    if (field === 'phone') {
      if (value && !/^\d*$/.test(value)) return
    }

    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      router.replace(buildURL(newFilters))
    }, 300)
  }

  function handleClear() {
    const emptyFilters = { names: '', lastnames: '', phone: '' }
    setFilters(emptyFilters)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    router.replace('/admin/clients')
  }

  async function handleRefresh() {
    setIsRefreshing(true)
    router.refresh()
    // Pequeño delay visual para que el usuario note que se actualizó
    setTimeout(() => setIsRefreshing(false), 600)
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-end gap-4'>
        <div className='flex-1 space-y-2'>
          <Label htmlFor='search-names'>Nombres</Label>
          <div className='relative'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              id='search-names'
              type='text'
              placeholder='Buscar por nombres...'
              value={filters.names}
              onChange={e => handleChange('names', e.target.value)}
              className='pl-9'
            />
          </div>
        </div>

        <div className='flex-1 space-y-2'>
          <Label htmlFor='search-lastnames'>Apellidos</Label>
          <div className='relative'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              id='search-lastnames'
              type='text'
              placeholder='Buscar por apellidos...'
              value={filters.lastnames}
              onChange={e => handleChange('lastnames', e.target.value)}
              className='pl-9'
            />
          </div>
        </div>

        <div className='flex-1 space-y-2'>
          <Label htmlFor='search-phone'>Teléfono</Label>
          <div className='relative'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              id='search-phone'
              type='text'
              inputMode='numeric'
              placeholder='Buscar por teléfono...'
              value={filters.phone}
              onChange={e => handleChange('phone', e.target.value)}
              className='pl-9'
            />
          </div>
        </div>

        {/* Botón limpiar filtros */}
        {hasFilters && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={handleClear}
            title='Limpiar filtros'
          >
            <X className='h-4 w-4' />
            <span className='sr-only'>Limpiar filtros</span>
          </Button>
        )}

        {/* Botón actualizar lista */}
        <Button
          type='button'
          variant='outline'
          size='icon'
          onClick={handleRefresh}
          title='Actualizar lista'
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className='sr-only'>Actualizar lista</span>
        </Button>
      </div>
    </div>
  )
}
