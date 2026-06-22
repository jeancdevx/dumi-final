'use client'

import Link from 'next/link'

import {
  CheckCircle,
  Eye,
  MoreHorizontal,
  PackageIcon,
  Search,
  XCircle
} from 'lucide-react'

import { format } from 'date-fns'

import { detailPath } from '@/lib/routes'

import { ORDER_STATUSES } from '@/modules/orders/constants'
import type { Order } from '@/modules/orders/types'

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

import { CancelOrderDialog } from './cancel-order-dialog'
import { CompleteOrderDialog } from './complete-order-dialog'

interface OrdersTableProps {
  orders: Order[]
  hasFilters?: boolean
  basePath?: string
}

export function OrdersTable({
  orders,
  hasFilters = false,
  basePath = '/admin/orders'
}: OrdersTableProps) {
  function formatPrice(price: string | number) {
    return `S/ ${Number(price).toFixed(2)}`
  }

  function getStatusBadge(status: Order['status']) {
    const statusOption = ORDER_STATUSES[status]
    if (!statusOption) return null

    return <Badge variant={statusOption.variant}>{statusOption.label}</Badge>
  }

  if (orders.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        {hasFilters ? (
          <>
            <Search className='text-muted-foreground mb-4 h-12 w-12' />
            <p className='text-muted-foreground text-lg font-medium'>
              No se encontraron órdenes
            </p>
            <p className='text-muted-foreground mt-1 text-sm'>
              Intenta con otros filtros
            </p>
          </>
        ) : (
          <>
            <PackageIcon className='text-muted-foreground mb-4 h-12 w-12' />
            <p className='text-muted-foreground text-lg font-medium'>
              No hay órdenes registradas
            </p>
            <p className='text-muted-foreground mt-1 text-sm'>
              Las órdenes se generan desde cotizaciones aprobadas
            </p>
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
            <TableHead>ID</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Prendas</TableHead>
            <TableHead>Unidades</TableHead>
            <TableHead>Fecha entrega</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className='w-[50px]'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell className='font-mono text-sm'>
                {order.id.slice(0, 8)}...
              </TableCell>
              <TableCell className='font-medium'>
                {order.customer.names} {order.customer.lastNames}
              </TableCell>
              <TableCell>{formatPrice(order.total)}</TableCell>
              <TableCell>{order.totalClothes}</TableCell>
              <TableCell>{order.totalUnitsToProduced}</TableCell>
              <TableCell>
                {format(new Date(order.deliveryDate), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
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
                      <Link href={detailPath(basePath, order.id)}>
                        <Eye className='mr-2 h-4 w-4' />
                        Ver detalle
                      </Link>
                    </DropdownMenuItem>
                    {order.status === 'IN_PRODUCTION' && (
                      <>
                        <DropdownMenuSeparator />
                        <CompleteOrderDialog
                          orderId={order.id}
                          trigger={
                            <DropdownMenuItem
                              onSelect={e => e.preventDefault()}
                              className='text-green-600 focus:text-green-600'
                            >
                              <CheckCircle className='mr-2 h-4 w-4' />
                              Finalizar
                            </DropdownMenuItem>
                          }
                        />
                        <CancelOrderDialog
                          orderId={order.id}
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
