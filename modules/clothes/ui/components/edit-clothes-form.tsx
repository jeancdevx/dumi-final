'use client'

import { useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { CircleDollarSign, Save, Sparkles } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { updateClothesClient } from '@/modules/clothes/lib/clothes-client'
import {
  updateClothesSchema,
  type UpdateClothesInput
} from '@/modules/clothes/schemas'
import type { Clothes } from '@/modules/clothes/types'

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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface EditClothesFormProps {
  clothes: Clothes
  onUpdated?: () => void
}

export function EditClothesForm({ clothes, onUpdated }: EditClothesFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const parsedPrice = Number(clothes.price) || 0

  const form = useForm<UpdateClothesInput>({
    resolver: zodResolver(updateClothesSchema),
    defaultValues: {
      name: clothes.name ?? '',
      description: clothes.description ?? '',
      price: parsedPrice,
      isDraft: Boolean(clothes.isDraft)
    }
  })

  const watchedPrice = useWatch({ control: form.control, name: 'price' })
  const watchedIsDraft = useWatch({ control: form.control, name: 'isDraft' })

  const variants = clothes.clothes_variant ?? []
  const minAdditional = Math.min(
    ...variants.map(v => parseFloat(v.additional) || 0)
  )
  const maxAdditional = Math.max(
    ...variants.map(v => parseFloat(v.additional) || 0)
  )
  const basePrice = watchedPrice || parsedPrice
  const minPrice = basePrice + minAdditional
  const maxPrice = basePrice + maxAdditional

  const onSubmit = (values: UpdateClothesInput) => {
    startTransition(async () => {
      const result = await updateClothesClient(clothes.id, values)

      if (result.success) {
        toast.success('Prenda actualizada exitosamente')
        onUpdated?.()
        router.refresh()
      } else {
        toast.error(result.error || 'Error al actualizar la prenda')
      }
    })
  }

  const hasChanges = form.formState.isDirty

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <CardTitle className='flex items-center gap-2'>
                  <Sparkles className='h-5 w-5' />
                  Información del producto
                </CardTitle>
                <CardDescription>
                  Edita los datos básicos de la prenda
                </CardDescription>
              </div>
              <div className='flex items-center gap-2'>
                {watchedIsDraft ? (
                  <Badge variant='secondary'>Borrador</Badge>
                ) : (
                  <Badge variant='default'>Publicada</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la prenda</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ej: Polo deportivo personalizado'
                        className='text-base'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio base</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <CircleDollarSign className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                        <Input
                          type='text'
                          inputMode='decimal'
                          placeholder='0.00'
                          className='pl-10 text-base font-medium'
                          value={field.value ?? ''}
                          onChange={e => {
                            const value = e.target.value
                            if (value === '' || value === '.') {
                              field.onChange(undefined)
                              return
                            }
                            const parsed = parseFloat(value)
                            if (!isNaN(parsed)) {
                              field.onChange(parsed)
                            }
                          }}
                        />
                        <span className='text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm'>
                          PEN
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Describe las características, materiales, colores disponibles...'
                      className='min-h-[120px] resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='isDraft'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Modo borrador</FormLabel>
                    <FormDescription>
                      Las prendas en borrador no aparecen en el catálogo público
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Preview de precios */}
            {variants.length > 0 && (
              <div className='bg-muted/50 rounded-lg border p-4'>
                <p className='text-muted-foreground mb-2 text-sm font-medium'>
                  Rango de precios con variantes
                </p>
                <div className='flex items-baseline gap-2'>
                  <span className='text-primary text-2xl font-bold'>
                    S/ {minPrice.toFixed(2)}
                  </span>
                  {maxPrice > minPrice && (
                    <>
                      <span className='text-muted-foreground'>-</span>
                      <span className='text-primary text-2xl font-bold'>
                        S/ {maxPrice.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Botón guardar */}
            <div className='flex justify-end'>
              <Button type='submit' disabled={isPending || !hasChanges}>
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
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
