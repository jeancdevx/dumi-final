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

import { createEmployee } from '../../actions/create-employee'
import { createEmployeeSchema, type CreateEmployeeInput } from '../../schemas'
import type { CreateEmployeeResponse } from '../../types'

const initialState: ActionResponse<CreateEmployeeResponse> = {
  success: false
}

export function CreateEmployeeForm() {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [state, formAction, isPending] = useActionState(
    createEmployee,
    initialState
  )

  const form = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      names: '',
      lastNames: '',
      email: '',
      password: ''
    }
  })

  useEffect(() => {
    if (state.success) {
      toast.success('Empleado creado exitosamente')
      form.reset()
      closeButtonRef.current?.click()
    }
  }, [state.success, form])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Nuevo empleado
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Crear nuevo empleado</DialogTitle>
          <DialogDescription>
            El empleado será creado con el rol de vendedor automáticamente.
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
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='empleado@telar.com'
                      autoComplete='email'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='••••••••'
                      autoComplete='new-password'
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

            <div className='flex justify-end gap-3 pt-4'>
              <DialogClose asChild>
                <Button type='button' variant='outline' ref={closeButtonRef}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Creando...' : 'Crear empleado'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
