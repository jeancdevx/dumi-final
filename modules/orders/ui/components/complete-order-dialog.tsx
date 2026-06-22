'use client'

import { useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { CheckCircle } from 'lucide-react'

import { toast } from 'sonner'

import { updateOrderStatusClient } from '@/modules/orders/lib/orders-client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface CompleteOrderDialogProps {
  orderId: string
  disabled?: boolean
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function CompleteOrderDialog({
  orderId,
  disabled = false,
  trigger,
  onSuccess
}: CompleteOrderDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleComplete = () => {
    startTransition(async () => {
      const result = await updateOrderStatusClient(orderId, 'DONE')

      if (result.success) {
        toast.success('Orden finalizada exitosamente', {
          description: 'El pedido está listo para entrega.'
        })
        setOpen(false)
        onSuccess?.()
        router.refresh()
      } else {
        toast.error('Error al finalizar la orden', {
          description: result.error
        })
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button disabled={disabled}>
            <CheckCircle className='mr-2 h-4 w-4' />
            Finalizar orden
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Finalizar orden?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción marcará la orden como completada. El pedido quedará
            listo para entrega al cliente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleComplete}
            disabled={isPending}
            className='bg-green-600 hover:bg-green-700'
          >
            {isPending ? (
              <>
                <Spinner className='mr-2' />
                Finalizando...
              </>
            ) : (
              <>
                <CheckCircle className='mr-2 h-4 w-4' />
                Finalizar orden
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
