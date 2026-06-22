'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

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

import { createEmployeeClient } from '../../lib/employees-client'
import { createEmployeeSchema, type CreateEmployeeInput } from '../../schemas'
import type { CreateEmployeeResponse } from '../../types'

const initialState: ActionResponse<CreateEmployeeResponse> = {
  success: false
}

interface CreateEmployeeFormProps {
  canAssignAdminRole: boolean
  onCreated?: () => void
}

export function CreateEmployeeForm({
  canAssignAdminRole,
  onCreated
}: CreateEmployeeFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [state, setState] = useState(initialState)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      names: '',
      lastNames: '',
      email: '',
      role: 'seller'
    }
  })

  async function handleSubmit(data: CreateEmployeeInput) {
    setIsPending(true)
    const result = await createEmployeeClient(data)
    setState(result)
    setIsPending(false)

    if (result.success) {
      toast.success('Empleado creado exitosamente')
      form.reset()
      setOpen(false)
      onCreated?.()
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
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
                    <Select value={field.value} onValueChange={field.onChange}>
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
                <Button type='button' variant='outline'>
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
