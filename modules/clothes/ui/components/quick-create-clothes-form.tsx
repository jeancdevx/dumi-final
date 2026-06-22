'use client'

import { useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { CircleDollarSign, FileText, Zap } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  quickCreateClothesClient,
  uploadPreSignedImages
} from '@/modules/clothes/lib/clothes-client'
import {
  quickCreateClothesSchema,
  type QuickCreateClothesInput
} from '@/modules/clothes/schemas'

import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Spinner } from '@/components/ui/spinner'

import { ImagesUpload } from './images-upload'

interface QuickCreateClothesFormProps {
  basePath?: string
}

export function QuickCreateClothesForm({
  basePath = '/admin/clothes'
}: QuickCreateClothesFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<QuickCreateClothesInput>({
    resolver: zodResolver(quickCreateClothesSchema),
    defaultValues: {
      name: '',
      price: 0,
      images: []
    }
  })

  const onSubmit = (values: QuickCreateClothesInput) => {
    startTransition(async () => {
      const serverData = {
        name: values.name,
        price: values.price,
        images: values.images.map(img => ({
          filename: img.file.name,
          contentType: img.file.type
        }))
      }

      const result = await quickCreateClothesClient(serverData)

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
            router.push(basePath)
            return
          }
        }

        toast.success('Borrador creado exitosamente')
        router.push(basePath)
      } else {
        toast.error(result.error || 'Error al crear el borrador')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <Alert>
          <Zap className='h-4 w-4' />
          <AlertDescription>
            La prenda se creará como <Badge variant='secondary'>Borrador</Badge>{' '}
            con una variante única (Talla M, Unisex). Podrás agregar más
            variantes después.
          </AlertDescription>
        </Alert>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Columna izquierda - Imágenes */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>Imágenes</CardTitle>
                <CardDescription>
                  Agrega fotos del diseño personalizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImagesUpload />
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha - Datos básicos */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  Información básica
                </CardTitle>
                <CardDescription>
                  Solo necesitas el nombre y precio estimado
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del diseño</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Ej: Polo promoción colegio San Juan'
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
                      <FormLabel>Precio estimado</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <CircleDollarSign className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                          <Input
                            type='text'
                            inputMode='decimal'
                            placeholder='0.00'
                            className='pl-10 text-base font-medium'
                            value={field.value || ''}
                            onChange={e => {
                              const value = e.target.value
                              if (value === '' || value === '.') {
                                field.onChange(0)
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
                      <p className='text-muted-foreground text-xs'>
                        Puedes ajustar el precio después de agregar variantes
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botones de acción */}
        <div className='flex items-center justify-between gap-4 border-t pt-4'>
          <Button
            type='button'
            variant='ghost'
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type='submit' disabled={isPending} className='min-w-40'>
            {isPending ? (
              <>
                <Spinner className='mr-2 h-4 w-4' />
                Creando...
              </>
            ) : (
              <>
                <Zap className='mr-2 h-4 w-4' />
                Crear borrador
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
