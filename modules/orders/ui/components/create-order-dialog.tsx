'use client'

import { useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { CalendarIcon, PackageIcon } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { addDays, format, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

import { createOrder } from '../../actions'
import {
  DELIVERY_DATE_MAX_DAYS,
  DELIVERY_DATE_MIN_DAYS
} from '../../constants'
import {
  createOrderDefaultValues,
  createOrderSchema,
  type CreateOrderFormValues
} from '../../schemas'
import { AddressForm } from './address-form'

interface CreateOrderDialogProps {
  quoteId: string
  quotationCode?: string
  trigger?: React.ReactNode
}

export function CreateOrderDialog({
  quoteId,
  quotationCode,
  trigger
}: CreateOrderDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      ...createOrderDefaultValues,
      quoteId,
      address: {
        department: '',
        city: '',
        district: '',
        street: ''
      }
    }
  })

  // Obtiene el "hoy" en la zona horaria de Lima para las validaciones
  const limaStr = new Date().toLocaleString('en-US', { timeZone: 'America/Lima' })
  const today = startOfDay(new Date(limaStr))
  
  const minDate = addDays(today, DELIVERY_DATE_MIN_DAYS)
  const maxDate = addDays(today, DELIVERY_DATE_MAX_DAYS)

  const onSubmit = (values: CreateOrderFormValues) => {
    startTransition(async () => {
      const result = await createOrder({
        quoteId: values.quoteId,
        deliveryDate: format(values.deliveryDate, 'yyyy-MM-dd'),
        address: {
          department: values.address.department,
          city: values.address.city,
          district: values.address.district,
          street: values.address.street
        }
      })

      if (result.success) {
        toast.success('Orden creada exitosamente', {
          description: `La orden ha sido generada y está en producción.`
        })
        setOpen(false)
        form.reset()
        router.push(`/admin/orders/${result.data?.id}`)
      } else {
        toast.error('Error al crear la orden', {
          description: result.error
        })
      }
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isPending) {
      setOpen(newOpen)
      if (!newOpen) {
        form.reset()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PackageIcon className='mr-2 h-4 w-4' />
            Generar orden
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] max-w-md overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Generar orden de producción</DialogTitle>
          <DialogDescription>
            {quotationCode
              ? `Crear una orden a partir de la cotización ${quotationCode}.`
              : 'Completa los datos de entrega para generar la orden.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Fecha de entrega */}
            <FormField
              control={form.control}
              name='deliveryDate'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Fecha de entrega</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP', { locale: es })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={date => date < minDate || date > maxDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Entre {DELIVERY_DATE_MIN_DAYS} y {DELIVERY_DATE_MAX_DAYS}{' '}
                    días desde hoy
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dirección */}
            <AddressForm />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Creando...' : 'Crear orden'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
