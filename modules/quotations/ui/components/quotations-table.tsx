'use client'

import Link from 'next/link'

import {
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  PackageIcon,
  Search,
  XCircle
} from 'lucide-react'

import { format } from 'date-fns'

import { detailPath, editPath } from '@/lib/routes'

import { CreateOrderDialog } from '@/modules/orders/ui/components'
import { QUOTATION_STATUSES } from '@/modules/quotations/constants'
import type { Quotation } from '@/modules/quotations/types'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

import { CancelQuotationDialog } from './cancel-quotation-dialog'

interface QuotationsTableProps {
  quotations: Quotation[]
  hasFilters?: boolean
  basePath?: string
}

export function QuotationsTable({
  quotations,
  hasFilters = false,
  basePath = '/admin/quotations'
}: QuotationsTableProps) {
  const ordersBasePath = basePath.startsWith('/seller')
    ? '/seller/orders'
    : '/admin/orders'

  function formatPrice(price: string | number) {
    return `S/ ${Number(price).toFixed(2)}`
  }

  function getStatusBadge(status: Quotation['status']) {
    const statusOption = QUOTATION_STATUSES.find(s => s.value === status)
    if (!statusOption) return null

    const colorClasses = {
      yellow:
        'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
      green:
        'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
      red: 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400'
    }

    return (
      <Badge className={colorClasses[statusOption.color]}>
        {statusOption.label}
      </Badge>
    )
  }

  if (quotations.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        {hasFilters ? (
          <>
            <Search className='text-muted-foreground mb-4 h-12 w-12' />
            <p className='text-muted-foreground text-lg font-medium'>
              No se encontraron cotizaciones
            </p>
            <p className='text-muted-foreground mt-1 text-sm'>
              Intenta con otros filtros
            </p>
          </>
        ) : (
          <>
            <FileText className='text-muted-foreground mb-4 h-12 w-12' />
            <p className='text-muted-foreground text-lg font-medium'>
              No hay cotizaciones registradas
            </p>
            <p className='text-muted-foreground mt-1 text-sm'>
              Crea tu primera cotización para comenzar
            </p>
            <Button asChild className='mt-4'>
              <Link href={`${basePath}/new`}>Crear cotización</Link>
            </Button>
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
            <TableHead>Cliente</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Prendas</TableHead>
            <TableHead>Unidades</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className='w-[50px]'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.map(quotation => (
            <TableRow key={quotation.id}>
              <TableCell className='font-medium'>
                {quotation.customer.names} {quotation.customer.lastNames}
              </TableCell>
              <TableCell>{formatPrice(quotation.total)}</TableCell>
              <TableCell>{quotation.totalClothes}</TableCell>
              <TableCell>{quotation.totalUnitsToProduced}</TableCell>
              <TableCell>{getStatusBadge(quotation.status)}</TableCell>
              <TableCell>
                {format(new Date(quotation.createdAt), 'dd/MM/yyyy')}
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
                      <Link href={detailPath(basePath, quotation.id)}>
                        <Eye className='mr-2 h-4 w-4' />
                        Ver
                      </Link>
                    </DropdownMenuItem>
                    {quotation.status === 'PENDING' && (
                      <>
                        <CreateOrderDialog
                          quoteId={quotation.id}
                          quotationCode={quotation.id.slice(0, 8)}
                          basePath={ordersBasePath}
                          trigger={
                            <DropdownMenuItem
                              onSelect={e => e.preventDefault()}
                            >
                              <PackageIcon className='mr-2 h-4 w-4' />
                              Generar orden
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem asChild>
                          <Link href={editPath(basePath, quotation.id)}>
                            <Edit className='mr-2 h-4 w-4' />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <CancelQuotationDialog
                          quotationId={quotation.id}
                          trigger={
                            <DropdownMenuItem
                              onSelect={e => e.preventDefault()}
                              className='text-destructive focus:text-destructive'
                            >
                              <XCircle className='mr-2 h-4 w-4' />
                              Cancelar
                            </DropdownMenuItem>
                          }
                        />
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
