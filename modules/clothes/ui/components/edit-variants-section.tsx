'use client'

import { useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { Plus, Save, Trash2 } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  addVariantClient,
  deleteVariantClient,
  updateVariantClient
} from '@/modules/clothes/lib/clothes-client'
import {
  addVariantSchema,
  type AddVariantInput
} from '@/modules/clothes/schemas'
import type { ClothesVariant } from '@/modules/clothes/types'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

import { GENDERS, SIZES } from '../../constants'

interface EditVariantsSectionProps {
  clothesId: string
  variants: ClothesVariant[]
  basePrice: number
  onChanged?: () => void
}

export function EditVariantsSection({
  clothesId,
  variants,
  basePrice,
  onChanged
}: EditVariantsSectionProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingVariant, setEditingVariant] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [variantToDelete, setVariantToDelete] = useState<ClothesVariant | null>(
    null
  )
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const addForm = useForm<AddVariantInput>({
    resolver: zodResolver(addVariantSchema),
    defaultValues: {
      gender: 'UNISEX',
      size: '',
      additional: 0
    }
  })

  function getGenderLabel(value: string) {
    return GENDERS.find(g => g.value === value)?.label || value
  }

  function getGenderEmoji(value: string) {
    const emojis: Record<string, string> = {
      HOMBRE: '👨',
      MUJER: '👩',
      UNISEX: '👤'
    }
    return emojis[value] || '👤'
  }

  function handleStartEdit(variant: ClothesVariant) {
    setEditingVariant(variant.id)
    setEditValue(variant.additional)
  }

  function handleCancelEdit() {
    setEditingVariant(null)
    setEditValue('')
  }

  function handleSaveEdit(variantId: string) {
    startTransition(async () => {
      const result = await updateVariantClient(clothesId, variantId, {
        additional: parseFloat(editValue) || 0
      })

      if (result.success) {
        toast.success('Variante actualizada')
        setEditingVariant(null)
        onChanged?.()
        router.refresh()
      } else {
        toast.error(result.error || 'Error al actualizar')
      }
    })
  }

  function handleDeleteClick(variant: ClothesVariant) {
    setVariantToDelete(variant)
    setDeleteDialogOpen(true)
  }

  function handleConfirmDelete() {
    if (!variantToDelete) return

    startTransition(async () => {
      const result = await deleteVariantClient(clothesId, variantToDelete.id)

      if (result.success) {
        toast.success('Variante eliminada')
        onChanged?.()
        router.refresh()
      } else {
        toast.error(result.error || 'Error al eliminar')
      }

      setDeleteDialogOpen(false)
      setVariantToDelete(null)
    })
  }

  function handleAddVariant(values: AddVariantInput) {
    // Verificar duplicados
    const exists = variants.some(
      v => v.size.size === values.size && v.gender.gender === values.gender
    )

    if (exists) {
      addForm.setError('size', {
        type: 'manual',
        message: 'Ya existe una variante con esta talla y género'
      })
      return
    }

    startTransition(async () => {
      const result = await addVariantClient(clothesId, values)

      if (result.success) {
        toast.success('Variante agregada')
        setAddDialogOpen(false)
        addForm.reset()
        onChanged?.()
        router.refresh()
      } else {
        toast.error(result.error || 'Error al agregar variante')
      }
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <CardTitle>Tallas y variantes</CardTitle>
              <CardDescription>
                {variants.length} variante{variants.length !== 1 ? 's' : ''}{' '}
                disponibles
              </CardDescription>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size='sm'>
                  <Plus className='mr-2 h-4 w-4' />
                  Agregar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar variante</DialogTitle>
                  <DialogDescription>
                    Crea una nueva combinación de talla y género
                  </DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                  <form
                    onSubmit={addForm.handleSubmit(handleAddVariant)}
                    className='space-y-4'
                  >
                    <FormField
                      control={addForm.control}
                      name='size'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Talla</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Seleccionar talla' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value='header-ninos' disabled>
                                — Niños —
                              </SelectItem>
                              {SIZES.filter(s => s.category === 'niños').map(
                                size => (
                                  <SelectItem
                                    key={size.value}
                                    value={size.value}
                                  >
                                    {size.label}
                                  </SelectItem>
                                )
                              )}
                              <SelectItem value='header-adultos' disabled>
                                — Adultos —
                              </SelectItem>
                              {SIZES.filter(s => s.category === 'adultos').map(
                                size => (
                                  <SelectItem
                                    key={size.value}
                                    value={size.value}
                                  >
                                    {size.label}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name='gender'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Género</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Seleccionar género' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GENDERS.map(gender => (
                                <SelectItem
                                  key={gender.value}
                                  value={gender.value}
                                >
                                  {gender.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name='additional'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio adicional</FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <span className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm'>
                                S/
                              </span>
                              <Input
                                type='number'
                                min={0}
                                step={0.01}
                                placeholder='0.00'
                                className='pl-9'
                                value={field.value || ''}
                                onChange={e => {
                                  const value = e.target.value
                                  field.onChange(
                                    value === '' ? 0 : parseFloat(value)
                                  )
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => setAddDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type='submit' disabled={isPending}>
                        {isPending ? (
                          <Spinner className='mr-2 h-4 w-4' />
                        ) : null}
                        Agregar variante
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {variants.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-12'>
              <p className='text-muted-foreground mb-4 text-sm'>
                No hay variantes. Agrega al menos una.
              </p>
            </div>
          ) : (
            <div className='grid gap-3 sm:grid-cols-2'>
              {variants.map(variant => {
                const additional = parseFloat(variant.additional) || 0
                const totalPrice = basePrice + additional
                const isEditing = editingVariant === variant.id

                return (
                  <div
                    key={variant.id}
                    className='bg-muted/30 group hover:border-primary/50 relative rounded-lg border p-4 transition-colors'
                  >
                    {/* Header */}
                    <div className='mb-3 flex items-start justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='text-lg'>
                          {getGenderEmoji(variant.gender.gender)}
                        </span>
                        <div>
                          <p className='text-sm font-medium'>
                            Talla {variant.size.size}
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            {getGenderLabel(variant.gender.gender)}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <Badge
                          variant='secondary'
                          className='font-mono text-sm'
                        >
                          S/ {totalPrice.toFixed(2)}
                        </Badge>
                        {additional > 0 && (
                          <p className='text-muted-foreground mt-0.5 text-xs'>
                            +S/ {additional.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Editar precio adicional */}
                    {isEditing ? (
                      <div className='space-y-2'>
                        <label className='text-xs font-medium'>
                          Precio adicional
                        </label>
                        <div className='flex gap-2'>
                          <div className='relative flex-1'>
                            <span className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm'>
                              S/
                            </span>
                            <Input
                              type='number'
                              min={0}
                              step={0.01}
                              className='h-9 pl-9'
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <Button
                            size='sm'
                            className='h-9'
                            onClick={() => handleSaveEdit(variant.id)}
                            disabled={isPending}
                          >
                            {isPending ? (
                              <Spinner className='h-4 w-4' />
                            ) : (
                              <Save className='h-4 w-4' />
                            )}
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-9'
                            onClick={handleCancelEdit}
                            disabled={isPending}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          className='h-8 flex-1'
                          onClick={() => handleStartEdit(variant)}
                        >
                          Editar precio
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          className='text-destructive hover:text-destructive h-8'
                          onClick={() => handleDeleteClick(variant)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar variante?</AlertDialogTitle>
            <AlertDialogDescription>
              {variantToDelete && (
                <>
                  Se eliminará la variante{' '}
                  <strong>
                    Talla {variantToDelete.size.size} -{' '}
                    {getGenderLabel(variantToDelete.gender.gender)}
                  </strong>
                  . Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isPending}
              className='bg-destructive hover:bg-destructive/90 text-white'
            >
              {isPending ? <Spinner className='mr-2 h-4 w-4' /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
