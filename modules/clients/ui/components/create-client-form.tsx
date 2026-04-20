'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Plus } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { ActionResponse } from '@/modules/auth/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
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
import { Textarea } from '@/components/ui/textarea'

import { createClient } from '../../actions/create-client'
import { createClientSchema, type CreateClientInput } from '../../schemas'
import type { CreateClientResponse } from '../../types'

const initialState: ActionResponse<CreateClientResponse> = {
  success: false
}

export function CreateClientForm() {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  // Guarda el id del último cliente procesado para detectar nuevas creaciones
  const lastProcessedId = useRef<string | null>(null)

  const [state, formAction, isPending] = useActionState(
    createClient,
    initialState
  )

  const form = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      names: '',
      lastNames: '',
      phone: '',
      reference: ''
    }
  })

  useEffect(() => {
    // Se dispara solo cuando el id del cliente creado es diferente al último procesado
    if (state.success && state.data?.id && state.data.id !== lastProcessedId.current) {
      lastProcessedId.current = state.data.id
      toast.success('Cliente creado exitosamente')
      form.reset()
      closeButtonRef.current?.click()
    }
  }, [state.success, state.data, form])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Nuevo cliente
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Registrar nuevo cliente</DialogTitle>
          <DialogDescription>
            Ingresa los datos del cliente para poder emitir cotizaciones y
            pedidos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form action={formAction} className='space-y-4'>
            <FormField
              control={form.control}
              name='names'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombres</FormLabel>
                  <FormControl>
                    <Input placeholder='Juan Carlos' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='lastNames'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellidos</FormLabel>
                  <FormControl>
                    <Input placeholder='Pérez García' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='987654321'
                      maxLength={9}
                      inputMode='numeric'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='reference'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Ej: Referido por Juan, cliente frecuente...'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {state.error && (
              <div className='bg-destructive/10 text-destructive rounded-md p-3 text-sm'>
                {state.error}
              </div>
            )}
            <DialogFooter className='gap-2 sm:gap-0'>
              <DialogClose asChild>
                <Button type='button' variant='outline' ref={closeButtonRef}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Guardando...' : 'Guardar cliente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
