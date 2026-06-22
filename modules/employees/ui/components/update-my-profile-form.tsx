'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { User } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { ActionResponse } from '@/modules/auth/types'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { updateCurrentEmployeeClient } from '../../lib/employees-client'
import {
  updateEmployeeProfileSchema,
  type UpdateEmployeeProfileInput
} from '../../schemas'
import type { GetCurrentEmployeeResponse } from '../../types'

interface UpdateMyProfileFormProps {
  currentEmployee: GetCurrentEmployeeResponse
  onUpdated?: (employee: GetCurrentEmployeeResponse) => void
}

const initialState: ActionResponse<GetCurrentEmployeeResponse> = {
  success: false
}

export function UpdateMyProfileForm({
  currentEmployee,
  onUpdated
}: UpdateMyProfileFormProps) {
  const router = useRouter()
  const [state, setState] = useState(initialState)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<UpdateEmployeeProfileInput>({
    resolver: zodResolver(updateEmployeeProfileSchema),
    defaultValues: {
      names: currentEmployee.names,
      lastNames: currentEmployee.lastNames
    }
  })

  async function handleSubmit(data: UpdateEmployeeProfileInput) {
    setIsPending(true)
    const result = await updateCurrentEmployeeClient(data)
    setState(result)
    setIsPending(false)

    if (result.success && result.data) {
      toast.success('Perfil actualizado correctamente')
      form.reset({
        names: result.data.names,
        lastNames: result.data.lastNames
      })
      onUpdated?.(result.data)
      router.refresh()
    }

    if (result.error) {
      toast.error(result.error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-5'>
        <div className='grid gap-5 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='names'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium'>Nombres</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <User className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                    <Input
                      placeholder='Juan Carlos'
                      className='pl-9'
                      {...field}
                    />
                  </div>
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
                <FormLabel className='text-sm font-medium'>Apellidos</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <User className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                    <Input
                      placeholder='Pérez García'
                      className='pl-9'
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {state.error && (
          <div className='bg-destructive/10 border-destructive/20 text-destructive rounded-lg border px-4 py-3 text-sm'>
            {state.error}
          </div>
        )}

        <div className='flex justify-end pt-2'>
          <Button type='submit' disabled={isPending} className='min-w-[160px]'>
            {isPending ? (
              <span className='flex items-center gap-2'>
                <span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                Guardando...
              </span>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
