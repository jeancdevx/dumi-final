'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ImageOff,
  Package,
  Phone,
  Save,
  Trash2,
  User
} from 'lucide-react'

import { toast } from 'sonner'

import { detailPath } from '@/lib/routes'

import type { Clothes } from '@/modules/clothes/types'
import { updateQuotationClient } from '@/modules/quotations/lib/quotations-client'
import type {
  Customization,
  QuotationWithDetails,
  UpdateQuotationInput
} from '@/modules/quotations/types'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

import {
  ClothesVariantSelector,
  type SelectedVariantInfo
} from './clothes-variant-selector'

interface QuotationItem {
  variantId: string
  variantInfo: SelectedVariantInfo
  quantity: number
  customizations: Customization[]
}

interface EditQuotationFormProps {
  quotation: QuotationWithDetails
  clothes: Clothes[]
  basePath?: string
}

export function EditQuotationForm({
  quotation,
  clothes,
  basePath = '/admin/quotations'
}: EditQuotationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Calculate initial items from quotation details
  const initialItems = useMemo<QuotationItem[]>(() => {
    return quotation.details.map(detail => {
      // Find the clothes that contains this variant
      const clothesItem = clothes.find(c =>
        c.clothes_variant?.some(v => v.id === detail.clothesVariantId)
      )
      const variant = clothesItem?.clothes_variant?.find(
        v => v.id === detail.clothesVariantId
      )

      const basePrice = clothesItem ? parseFloat(clothesItem.price) : 0
      const additionalPrice = variant ? parseFloat(variant.additional) : 0

      return {
        variantId: detail.clothesVariantId,
        variantInfo: {
          clothesId: clothesItem?.id || '',
          clothesName: clothesItem?.name || 'Prenda',
          clothesImage: clothesItem?.clothe_image?.[0]?.url || null,
          variantId: detail.clothesVariantId,
          size: detail.clothesVariant.size.size,
          gender: detail.clothesVariant.gender.gender,
          basePrice,
          additionalPrice,
          unitPrice: parseFloat(detail.unitPrice)
        },
        quantity: detail.quantity,
        customizations: detail.customizations || []
      }
    })
  }, [quotation.details, clothes])

  const [items, setItems] = useState<QuotationItem[]>(initialItems)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(
    () => new Set(initialItems.map((_, i) => i))
  )

  // Check if quotation can be edited
  if (quotation.status !== 'PENDING') {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>No se puede editar</AlertTitle>
        <AlertDescription>
          Solo se pueden editar cotizaciones en estado pendiente. Esta
          cotización está en estado {quotation.status}.
        </AlertDescription>
      </Alert>
    )
  }

  const handleAddItems = (newItems: SelectedVariantInfo[]) => {
    const startIndex = items.length
    const itemsToAdd: QuotationItem[] = newItems.map(info => ({
      variantId: info.variantId,
      variantInfo: info,
      quantity: 1,
      customizations: []
    }))
    setItems(prev => [...prev, ...itemsToAdd])
    setExpandedItems(prev => {
      const next = new Set(prev)
      itemsToAdd.forEach((_, i) => next.add(startIndex + i))
      return next
    })
  }

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
    setExpandedItems(prev => {
      const next = new Set<number>()
      prev.forEach(i => {
        if (i < index) next.add(i)
        else if (i > index) next.add(i - 1)
      })
      return next
    })
  }

  const handleQuantityChange = (index: number, quantity: number) => {
    setItems(prev =>
      prev.map((item, i) => {
        if (i !== index) return item
        // Adjust customizations array to match quantity
        const newCustomizations = [...item.customizations]
        if (quantity > newCustomizations.length) {
          // Add empty customizations
          while (newCustomizations.length < quantity) {
            newCustomizations.push({ name: '', number: 0 })
          }
        } else if (quantity < newCustomizations.length) {
          // Remove extra customizations
          newCustomizations.length = quantity
        }
        return { ...item, quantity, customizations: newCustomizations }
      })
    )
  }

  const handleCustomizationChange = (
    itemIndex: number,
    custIndex: number,
    field: keyof Customization,
    value: string | number
  ) => {
    setItems(prev =>
      prev.map((item, i) => {
        if (i !== itemIndex) return item
        const newCustomizations = [...item.customizations]
        newCustomizations[custIndex] = {
          ...newCustomizations[custIndex],
          [field]: value
        }
        return { ...item, customizations: newCustomizations }
      })
    )
  }

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const calculateTotal = () => {
    return items.reduce(
      (acc, item) => acc + item.variantInfo.unitPrice * item.quantity,
      0
    )
  }

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error('Debe agregar al menos un artículo')
      return
    }

    const data: UpdateQuotationInput = {
      details: items.map(item => ({
        clothesVariantId: item.variantId,
        quantity: item.quantity,
        // Filtrar customizations vacías (sin nombre)
        customizations: item.customizations.filter(c => c.name.trim() !== '')
      }))
    }

    startTransition(async () => {
      const result = await updateQuotationClient(quotation.id, data)

      if (result.success) {
        toast.success('Cotización actualizada exitosamente')
        router.refresh()
        router.push(detailPath(basePath, quotation.id))
      } else {
        toast.error(result.error || 'Error al actualizar la cotización')
      }
    })
  }

  const total = calculateTotal()
  const excludeVariantIds = items.map(item => item.variantId)

  return (
    <div className='space-y-6'>
      {/* Customer Info (Read Only) */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            Cliente
          </CardTitle>
          <CardDescription>
            Información del cliente (no editable)
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div>
            <Label className='text-muted-foreground text-sm'>Nombre</Label>
            <p className='font-medium'>
              {quotation.customer.names} {quotation.customer.lastNames}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Phone className='text-muted-foreground h-4 w-4' />
            <p>{quotation.customer.phone}</p>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <Package className='h-5 w-5' />
              Artículos de la cotización
            </CardTitle>
            <Badge variant='secondary'>
              {items.length} artículo{items.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {items.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-8'>
              <Package className='text-muted-foreground mb-2 h-10 w-10' />
              <p className='text-muted-foreground mb-4 text-sm'>
                No hay artículos en la cotización
              </p>
              <ClothesVariantSelector
                clothes={clothes}
                onSelect={handleAddItems}
                excludeVariantIds={excludeVariantIds}
              />
            </div>
          ) : (
            <>
              <div className='space-y-3'>
                {items.map((item, index) => {
                  const subtotal = item.variantInfo.unitPrice * item.quantity
                  const isExpanded = expandedItems.has(index)

                  return (
                    <Collapsible
                      key={`${item.variantId}-${index}`}
                      open={isExpanded}
                      onOpenChange={() => toggleExpanded(index)}
                    >
                      <div className='rounded-lg border'>
                        <div className='flex items-center gap-3 p-3'>
                          {/* Image */}
                          <div className='bg-muted relative h-12 w-12 shrink-0 overflow-hidden rounded'>
                            {item.variantInfo.clothesImage ? (
                              <Image
                                src={item.variantInfo.clothesImage}
                                alt={item.variantInfo.clothesName}
                                fill
                                className='object-cover'
                              />
                            ) : (
                              <div className='flex h-full w-full items-center justify-center'>
                                <ImageOff className='text-muted-foreground h-5 w-5' />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className='min-w-0 flex-1'>
                            <p className='truncate font-medium'>
                              {item.variantInfo.clothesName}
                            </p>
                            <div className='flex items-center gap-2'>
                              <Badge variant='outline' className='text-xs'>
                                {item.variantInfo.size}
                              </Badge>
                              <Badge variant='secondary' className='text-xs'>
                                {item.variantInfo.gender}
                              </Badge>
                              <span className='text-muted-foreground text-xs'>
                                S/ {item.variantInfo.unitPrice.toFixed(2)} c/u
                              </span>
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className='w-20'>
                            <QuantityInput
                              value={item.quantity}
                              onChange={qty => handleQuantityChange(index, qty)}
                            />
                          </div>

                          {/* Subtotal */}
                          <div className='w-24 text-right'>
                            <p className='font-medium'>
                              S/ {subtotal.toFixed(2)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className='flex items-center gap-1'>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8'
                              >
                                {isExpanded ? (
                                  <ChevronUp className='h-4 w-4' />
                                ) : (
                                  <ChevronDown className='h-4 w-4' />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='text-destructive hover:text-destructive h-8 w-8'
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>

                        <CollapsibleContent>
                          <div className='space-y-3 border-t p-3'>
                            <div className='flex items-center justify-between'>
                              <Label className='text-sm font-medium'>
                                Personalizaciones ({item.quantity})
                              </Label>
                            </div>
                            {item.quantity === 0 ? (
                              <p className='text-muted-foreground text-sm'>
                                Ingrese una cantidad para agregar
                                personalizaciones
                              </p>
                            ) : (
                              <div className='space-y-2'>
                                {Array.from({ length: item.quantity }).map(
                                  (_, custIndex) => {
                                    const customization = item.customizations[
                                      custIndex
                                    ] || {
                                      name: '',
                                      number: 0
                                    }
                                    return (
                                      <div
                                        key={custIndex}
                                        className='grid grid-cols-12 gap-2'
                                      >
                                        <div className='col-span-1 flex items-center'>
                                          <span className='text-muted-foreground text-sm'>
                                            {custIndex + 1}.
                                          </span>
                                        </div>
                                        <div className='col-span-5'>
                                          <Input
                                            placeholder='Nombre'
                                            value={customization.name}
                                            onChange={e =>
                                              handleCustomizationChange(
                                                index,
                                                custIndex,
                                                'name',
                                                e.target.value
                                              )
                                            }
                                          />
                                        </div>
                                        <div className='col-span-2'>
                                          <Input
                                            type='number'
                                            placeholder='#'
                                            value={customization.number || ''}
                                            onChange={e =>
                                              handleCustomizationChange(
                                                index,
                                                custIndex,
                                                'number',
                                                parseInt(e.target.value) || 0
                                              )
                                            }
                                          />
                                        </div>
                                        <div className='col-span-4'>
                                          <Input
                                            placeholder='Notas (opcional)'
                                            value={customization.notes || ''}
                                            onChange={e =>
                                              handleCustomizationChange(
                                                index,
                                                custIndex,
                                                'notes',
                                                e.target.value
                                              )
                                            }
                                          />
                                        </div>
                                      </div>
                                    )
                                  }
                                )}
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  )
                })}
              </div>

              <ClothesVariantSelector
                clothes={clothes}
                onSelect={handleAddItems}
                excludeVariantIds={excludeVariantIds}
              />

              {/* Summary */}
              <div className='space-y-2 rounded-lg border p-4'>
                <h4 className='font-medium'>Resumen de la cotización</h4>
                <div className='divide-y text-sm'>
                  {items.map((item, index) => {
                    const subtotal = item.variantInfo.unitPrice * item.quantity
                    return (
                      <div
                        key={index}
                        className='flex items-center justify-between py-2'
                      >
                        <div className='flex items-center gap-2'>
                          <span className='text-muted-foreground'>
                            {item.quantity}x
                          </span>
                          <span className='max-w-[200px] truncate'>
                            {item.variantInfo.clothesName}
                          </span>
                          <Badge variant='outline' className='text-xs'>
                            {item.variantInfo.size}
                          </Badge>
                          <Badge variant='secondary' className='text-xs'>
                            {item.variantInfo.gender}
                          </Badge>
                        </div>
                        <span className='font-medium'>
                          S/ {subtotal.toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className='border-t pt-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>
                      Total de unidades:{' '}
                      {items.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className='bg-muted/50 flex items-center justify-between rounded-lg p-4'>
                <span className='text-lg font-medium'>Total estimado</span>
                <span className='text-primary text-2xl font-bold'>
                  S/ {total.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex justify-end gap-3'>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isPending || items.length === 0}
        >
          {isPending ? (
            <>
              <Spinner className='mr-2 h-4 w-4' />
              Guardando...
            </>
          ) : (
            <>
              <Save className='mr-2 h-4 w-4' />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Quantity input component with local state
function QuantityInput({
  value,
  onChange
}: {
  value: number
  onChange: (value: number) => void
}) {
  const [localValue, setLocalValue] = useState(String(value))

  useEffect(() => {
    setLocalValue(String(value))
  }, [value])

  return (
    <Input
      type='text'
      inputMode='numeric'
      className='text-center'
      value={localValue}
      onChange={e => {
        const raw = e.target.value.replace(/[^0-9]/g, '')
        setLocalValue(raw)
        const num = parseInt(raw)
        if (!isNaN(num) && num >= 1) {
          onChange(num)
        }
      }}
      onBlur={() => {
        const num = parseInt(localValue)
        if (isNaN(num) || num < 1) {
          setLocalValue('1')
          onChange(1)
        }
      }}
    />
  )
}
