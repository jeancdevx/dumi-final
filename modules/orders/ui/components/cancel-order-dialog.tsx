'use client'

import { useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { XCircle } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { cancelOrderClient } from '@/modules/orders/lib/orders-client'
import {
  cancelOrderDefaultValues,
  cancelOrderSchema,
  type CancelOrderFormValues
} from '@/modules/orders/schemas'

import { Button } from '@/components/ui/button'
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
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

interface CancelOrderDialogProps {
  orderId: string
  disabled?: boolean
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function CancelOrderDialog({
  orderId,
  disabled = false,
  trigger,
  onSuccess
}: CancelOrderDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<CancelOrderFormValues>({
    resolver: zodResolver(cancelOrderSchema),
    defaultValues: cancelOrderDefaultValues
  })

  const handleCancel = (values: CancelOrderFormValues) => {
    startTransition(async () => {
      const result = await cancelOrderClient(orderId, values.reason)

      if (result.success) {
        toast.success('Orden cancelada', {
          description: 'La orden ha sido cancelada exitosamente.'
        })
        setOpen(false)
        form.reset()
        onSuccess?.()
        router.refresh()
      } else {
        toast.error('Error al cancelar la orden', {
          description: result.error
        })
      }
    })
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isPending) {
      setOpen(isOpen)
      if (!isOpen) {
        form.reset()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant='destructive' disabled={disabled}>
            <XCircle className='mr-2 h-4 w-4' />
            Cancelar orden
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Cancelar orden?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Por favor, indica el motivo de la
            cancelación.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCancel)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo de cancelación</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Describe el motivo por el cual se cancela esta orden...'
                      className='min-h-[100px] resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Volver
              </Button>
              <Button type='submit' variant='destructive' disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner className='mr-2' />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <XCircle className='mr-2 h-4 w-4' />
                    Cancelar orden
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
