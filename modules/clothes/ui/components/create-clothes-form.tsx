'use client'

import { useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { CircleDollarSign, Package, Sparkles } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  createClothesClient,
  uploadPreSignedImages
} from '@/modules/clothes/lib/clothes-client'
import { createClothesSchema } from '@/modules/clothes/schemas'

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

import { ImagesUpload } from './images-upload'
import { VariantsFieldArray } from './variants-field-array'

type FormValues = z.infer<typeof createClothesSchema>

export function CreateClothesForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(createClothesSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      variants: [{ gender: 'UNISEX', size: 'M', additional: 0 }],
      images: []
    }
  })

  const watchedPrice = useWatch({ control: form.control, name: 'price' })
  const watchedVariants =
    useWatch({ control: form.control, name: 'variants' }) ?? []
  const watchedImages =
    useWatch({ control: form.control, name: 'images' }) ?? []
  const watchedName = useWatch({ control: form.control, name: 'name' })

  // Calcular precio mínimo y máximo
  const minAdditional = Math.min(...watchedVariants.map(v => v.additional || 0))
  const maxAdditional = Math.max(...watchedVariants.map(v => v.additional || 0))
  const minPrice = (watchedPrice || 0) + minAdditional
  const maxPrice = (watchedPrice || 0) + maxAdditional

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const serverData = {
        name: values.name,
        description: values.description,
        price: values.price,
        variants: values.variants,
        images: values.images.map(img => ({
          filename: img.file.name,
          contentType: img.file.type
        }))
      }

      const result = await createClothesClient(serverData)

      if (result.success) {
        if (
          result.data?.preSignedPuts &&
          result.data.preSignedPuts.length > 0
        ) {
          try {
            await uploadPreSignedImages(
              result.data.preSignedPuts,
              values.images.map(image => image.file)
            )
          } catch (uploadError) {
            console.error('Error uploading images:', uploadError)
            toast.error(
              'Prenda creada pero hubo un error al subir las imágenes'
            )
            router.push('/admin/clothes')
            return
          }
        }

        toast.success('Prenda creada exitosamente')
        router.push('/admin/clothes')
      } else {
        toast.error(result.error || 'Error al crear la prenda')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Columna izquierda - Imágenes */}
          <div className='lg:col-span-1'>
            <Card className='sticky top-4'>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <Package className='h-4 w-4' />
                  Vista previa
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <ImagesUpload />

                {/* Preview de la prenda */}
                {(watchedName || watchedPrice > 0) && (
                  <>
                    <Separator />
                    <div className='space-y-2'>
                      <p className='text-sm font-medium'>
                        {watchedName || 'Sin nombre'}
                      </p>
                      {watchedPrice > 0 && (
                        <div className='flex items-baseline gap-1'>
                          <span className='text-primary text-2xl font-bold'>
                            S/ {minPrice.toFixed(2)}
                          </span>
                          {maxPrice > minPrice && (
                            <span className='text-muted-foreground text-sm'>
                              - S/ {maxPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}
                      <div className='flex flex-wrap gap-1'>
                        <Badge variant='secondary'>
                          {watchedVariants.length} variante
                          {watchedVariants.length !== 1 ? 's' : ''}
                        </Badge>
                        <Badge variant='secondary'>
                          {watchedImages.length} imagen
                          {watchedImages.length !== 1 ? 'es' : ''}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha - Formulario */}
          <div className='space-y-6 lg:col-span-2'>
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Sparkles className='h-5 w-5' />
                  Información del producto
                </CardTitle>
                <CardDescription>
                  Ingresa los datos básicos de la prenda
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
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
                  name='price'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio base</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <CircleDollarSign className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                          <Input
                            type='number'
                            min={0}
                            step={0.01}
                            placeholder='0.00'
                            className='pl-10 text-base font-medium'
                            value={field.value || ''}
                            onChange={e => {
                              const value = e.target.value
                              field.onChange(
                                value === '' ? 0 : parseFloat(value)
                              )
                            }}
                          />
                          <span className='text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm'>
                            PEN
                          </span>
                        </div>
                      </FormControl>
                      <p className='text-muted-foreground text-xs'>
                        Este es el precio sin variantes adicionales
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Variantes */}
            <Card>
              <CardHeader>
                <CardTitle>Tallas y variantes</CardTitle>
                <CardDescription>
                  Define las combinaciones de talla y género disponibles. El
                  precio adicional se suma al precio base.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VariantsFieldArray basePrice={watchedPrice || 0} />
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className='bg-background sticky bottom-0 flex items-center justify-between gap-4 border-t py-4'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                size='lg'
                disabled={isPending}
                className='min-w-40'
              >
                {isPending ? (
                  <>
                    <Spinner className='mr-2 h-4 w-4' />
                    Guardando...
                  </>
                ) : (
                  'Crear prenda'
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}
