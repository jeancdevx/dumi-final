'use client'

import { useActionState, useEffect, useRef } from 'react'

import { Pencil } from 'lucide-react'

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

import { updateClient } from '../../actions/update-client'
import { updateClientSchema, type UpdateClientInput } from '../../schemas'
import type { Client } from '../../types'

interface EditClientFormProps {
  client: Client
}

const initialState: ActionResponse<Client> = {
  success: false
}

export function EditClientForm({ client }: EditClientFormProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const prevSuccessRef = useRef(false)

  const [state, formAction, isPending] = useActionState(
    (prevState: ActionResponse<Client>, formData: FormData) =>
      updateClient(client.id, prevState, formData),
    initialState
  )

  const form = useForm<UpdateClientInput>({
    resolver: zodResolver(updateClientSchema),
    defaultValues: {
      phone: client.phone,
      reference: client.reference || ''
    }
  })

  useEffect(() => {
    if (state.success && !prevSuccessRef.current) {
      prevSuccessRef.current = true
      toast.success('Cliente actualizado exitosamente')
      closeButtonRef.current?.click()
    }
  }, [state.success])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='ghost' size='sm' className='w-full justify-start'>
          <Pencil className='mr-2 h-4 w-4' />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>
            Modifica el teléfono y la referencia del cliente.
          </DialogDescription>
        </DialogHeader>

        <div className='bg-muted/50 rounded-md p-3'>
          <p className='text-sm font-medium'>
            {client.names} {client.lastNames}
          </p>
          <p className='text-muted-foreground text-xs'>
            Los nombres no pueden ser modificados
          </p>
        </div>

        <Form {...form}>
          <form action={formAction} className='space-y-4'>
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder='987654321' maxLength={9} {...field} />
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
                {isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
