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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { createEmployee } from '../../actions/create-employee'
import { createEmployeeSchema, type CreateEmployeeInput } from '../../schemas'
import type { CreateEmployeeResponse } from '../../types'

const initialState: ActionResponse<CreateEmployeeResponse> = {
  success: false
}

interface CreateEmployeeFormProps {
  canAssignAdminRole: boolean
}

export function CreateEmployeeForm({
  canAssignAdminRole
}: CreateEmployeeFormProps) {
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
      role: 'seller'
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
            Completa los datos para registrar al empleado en la organización.
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
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Selecciona un rol' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='seller'>SELLER</SelectItem>
                        {canAssignAdminRole ? (
                          <SelectItem value='admin'>ADMIN</SelectItem>
                        ) : null}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <input
                    type='hidden'
                    name='role'
                    value={field.value ?? 'seller'}
                  />
                  {!canAssignAdminRole && (
                    <p className='text-muted-foreground text-xs'>
                      Solo un owner puede crear empleados con rol ADMIN.
                    </p>
                  )}
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
