'use client'

import Image from 'next/image'
import Link from 'next/link'

import {
  Edit,
  Eye,
  ImageOff,
  MoreHorizontal,
  PackageSearch,
  Search
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import type { Clothes } from '../../types'

interface ClothesTableProps {
  clothes: Clothes[]
  hasFilters?: boolean
  basePath?: string
  canEdit?: boolean
}

export function ClothesTable({
  clothes,
  hasFilters = false,
  basePath = '/admin/clothes',
  canEdit = true
}: ClothesTableProps) {
  function formatPrice(price: number | string) {
    return `S/ ${Number(price).toFixed(2)}`
  }

  if (clothes.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        {hasFilters ? (
          <>
            <Search className='text-muted-foreground mb-4 h-12 w-12' />
            <p className='text-muted-foreground text-lg font-medium'>
              No se encontraron prendas
            </p>
            <p className='text-muted-foreground mt-1 text-sm'>
              Intenta con otros términos de búsqueda o filtros
            </p>
          </>
        ) : (
          <>
            <PackageSearch className='text-muted-foreground mb-4 h-12 w-12' />
            <p className='text-muted-foreground text-lg font-medium'>
              No hay prendas registradas
            </p>
            <p className='text-muted-foreground mt-1 text-sm'>
              Crea tu primera prenda para comenzar
            </p>
            {canEdit && (
              <Button asChild className='mt-4'>
                <Link href={`${basePath}/new`}>Crear prenda</Link>
              </Button>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-20'>Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio Base</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className='w-[50px]'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clothes.map(item => {
            const images = item.clothe_image ?? []
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <div className='bg-muted relative h-12 w-12 overflow-hidden rounded'>
                    {images.length > 0 ? (
                      <Image
                        src={images[0].url}
                        alt={item.name}
                        fill
                        className='object-cover'
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center'>
                        <ImageOff className='text-muted-foreground h-5 w-5' />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className='font-medium'>
                  <Link
                    href={`${basePath}/${item.id}`}
                    className='hover:text-primary hover:underline'
                  >
                    {item.name}
                  </Link>
                </TableCell>
                <TableCell>{formatPrice(item.price)}</TableCell>
                <TableCell>
                  {item.isDraft ? (
                    <Badge
                      variant='outline'
                      className='border-amber-500 text-amber-600 dark:text-amber-400'
                    >
                      Borrador
                    </Badge>
                  ) : (
                    <Badge className='bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'>
                      Publicado
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon'>
                        <MoreHorizontal className='h-4 w-4' />
                        <span className='sr-only'>Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem asChild>
                        <Link href={`${basePath}/${item.id}`}>
                          <Eye className='mr-2 h-4 w-4' />
                          Ver
                        </Link>
                      </DropdownMenuItem>
                      {canEdit && (
                        <DropdownMenuItem asChild>
                          <Link href={`${basePath}/${item.id}/edit`}>
                            <Edit className='mr-2 h-4 w-4' />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
