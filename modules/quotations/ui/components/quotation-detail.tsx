'use client'

import { Fragment, useState } from 'react'

import { ChevronDown, Phone, User } from 'lucide-react'

import { format } from 'date-fns'

import { CreateOrderDialog } from '@/modules/orders/ui/components/create-order-dialog'
import { QUOTATION_STATUSES } from '@/modules/quotations/constants'
import type { QuotationWithDetails } from '@/modules/quotations/types'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface QuotationDetailProps {
  quotation: QuotationWithDetails
  ordersBasePath?: string
}

export function QuotationDetail({
  quotation,
  ordersBasePath = '/admin/orders'
}: QuotationDetailProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  function toggleRow(id: string) {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function formatPrice(price: string | number) {
    return `S/ ${Number(price).toFixed(2)}`
  }

  function getStatusBadge(status: QuotationWithDetails['status']) {
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

  const totalUnits = quotation.details.reduce(
    (acc, detail) => acc + detail.quantity,
    0
  )

  return (
    <div className='grid gap-6 md:grid-cols-3'>
      {/* Columna izquierda - Detalles */}
      <div className='space-y-6 md:col-span-2'>
        <Card>
          <CardHeader>
            <CardTitle>Detalle de prendas</CardTitle>
            <CardDescription>
              Lista de prendas incluidas en la cotización
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variante</TableHead>
                  <TableHead className='text-center'>Cantidad</TableHead>
                  <TableHead className='text-right'>Precio unit.</TableHead>
                  <TableHead className='text-right'>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotation.details.map(detail => {
                  const subtotal = Number(detail.unitPrice) * detail.quantity
                  const hasCustomizations =
                    detail.customizations && detail.customizations.length > 0
                  const isExpanded = expandedRows.has(detail.id)

                  return (
                    <Fragment key={detail.id}>
                      <TableRow>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {hasCustomizations && (
                              <Button
                                variant='ghost'
                                size='icon'
                                className='-ml-1 h-8 w-8'
                                onClick={() => toggleRow(detail.id)}
                              >
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                />
                              </Button>
                            )}
                            <div>
                              <p className='font-medium'>
                                Talla {detail.clothesVariant.size.size}
                              </p>
                              <p className='text-muted-foreground text-sm'>
                                {detail.clothesVariant.gender.gender}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='text-center'>
                          {detail.quantity}
                        </TableCell>
                        <TableCell className='text-right'>
                          {formatPrice(detail.unitPrice)}
                        </TableCell>
                        <TableCell className='text-right font-medium'>
                          {formatPrice(subtotal)}
                        </TableCell>
                      </TableRow>
                      {hasCustomizations && isExpanded && (
                        <TableRow
                          key={`${detail.id}-customizations`}
                          className='bg-muted/50'
                        >
                          <TableCell colSpan={4} className='p-0'>
                            <div className='px-4 py-3'>
                              <p className='text-muted-foreground mb-2 text-sm font-medium'>
                                Personalizaciones (
                                {detail.customizations.length})
                              </p>
                              <div className='bg-background rounded-md border'>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className='w-12'>#</TableHead>
                                      <TableHead>Nombre</TableHead>
                                      <TableHead>Número</TableHead>
                                      <TableHead>Notas</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {detail.customizations.map(
                                      (customization, index) => (
                                        <TableRow key={index}>
                                          <TableCell className='text-muted-foreground'>
                                            {index + 1}
                                          </TableCell>
                                          <TableCell>
                                            {customization.name}
                                          </TableCell>
                                          <TableCell>
                                            {customization.number}
                                          </TableCell>
                                          <TableCell className='text-muted-foreground'>
                                            {customization.notes || '-'}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Columna derecha - Info cliente y resumen */}
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User className='h-5 w-5' />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div>
              <p className='text-muted-foreground text-sm'>Nombre</p>
              <p className='font-medium'>
                {quotation.customer.names} {quotation.customer.lastNames}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Phone className='text-muted-foreground h-4 w-4' />
              <p>{quotation.customer.phone}</p>
            </div>
            {quotation.customer.reference && (
              <div>
                <p className='text-muted-foreground text-sm'>Referencia</p>
                <p>{quotation.customer.reference}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm'>
                Estado actual
              </span>
              {getStatusBadge(quotation.status)}
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Creada</p>
              <p>{format(new Date(quotation.createdAt), 'dd/MM/yyyy HH:mm')}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>
                Última actualización
              </p>
              <p>{format(new Date(quotation.updatedAt), 'dd/MM/yyyy HH:mm')}</p>
            </div>

            {quotation.status === 'PENDING' && (
              <div className='border-t pt-3'>
                <CreateOrderDialog
                  quoteId={quotation.id}
                  quotationCode={quotation.id.slice(0, 8).toUpperCase()}
                  basePath={ordersBasePath}
                  trigger={
                    <Button className='w-full'>Aprobar y Generar Orden</Button>
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm'>Variantes</span>
              <span>{quotation.details.length}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm'>
                Total unidades
              </span>
              <span>{totalUnits}</span>
            </div>
            <div className='border-t pt-3'>
              <div className='flex items-center justify-between'>
                <span className='font-medium'>Total</span>
                <span className='text-primary text-xl font-bold'>
                  {formatPrice(quotation.total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
