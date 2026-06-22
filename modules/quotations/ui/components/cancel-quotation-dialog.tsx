'use client'

import { useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { XCircle } from 'lucide-react'

import { toast } from 'sonner'

import { cancelQuotationClient } from '@/modules/quotations/lib/quotations-client'

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

interface CancelQuotationDialogProps {
  quotationId: string
  disabled?: boolean
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function CancelQuotationDialog({
  quotationId,
  disabled = false,
  trigger,
  onSuccess
}: CancelQuotationDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelQuotationClient(quotationId)

      if (result.success) {
        toast.success('Cotización cancelada exitosamente')
        setOpen(false)
        onSuccess?.()
        router.refresh()
      } else {
        toast.error(result.error || 'Error al cancelar la cotización')
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant='destructive' disabled={disabled}>
            <XCircle className='mr-2 h-4 w-4' />
            Cancelar cotización
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar cotización?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. La cotización será cancelada
            permanentemente y no podrá convertirse en orden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Volver</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isPending}
            className='bg-destructive hover:bg-destructive/90 text-white'
          >
            {isPending ? (
              <>
                <Spinner className='mr-2 h-4 w-4' />
                Cancelando...
              </>
            ) : (
              'Sí, cancelar cotización'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
