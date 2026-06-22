'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { MailIcon, OctagonAlertIcon } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { forgotPasswordClient } from '@/modules/auth/lib/auth-client'
import {
  forgotPasswordSchema,
  type ForgotPasswordInput
} from '@/modules/auth/schemas'
import type { ActionResponse } from '@/modules/auth/types'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const initialState: ActionResponse<{ redirectTo: string }> = { success: false }

export function ForgotPasswordForm() {
  const router = useRouter()
  const [state, setState] = useState(initialState)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  })

  const handleSubmit = async (data: ForgotPasswordInput) => {
    setIsPending(true)
    const result = await forgotPasswordClient(data)
    setState(result)
    setIsPending(false)

    if (result.success && result.data?.redirectTo) {
      window.sessionStorage.setItem('auth.resetPasswordEmail', data.email)
      router.push(result.data.redirectTo)
    }
  }

  return (
    <div className='relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#faf9f8] p-6'>
      <div className='pointer-events-none absolute top-[-10%] left-[-5%] h-96 w-96 rounded-full bg-[#e9e8e7] blur-3xl' />
      <div className='pointer-events-none absolute right-[-5%] bottom-[-10%] h-96 w-96 rounded-full bg-[#e4dfdc] blur-3xl' />

      <div className='w-full max-w-md'>
        <div className='mb-12 flex flex-col items-center'>
          <div className='mb-2 text-4xl font-black tracking-tight text-[#2b1608]'>
            Telar
          </div>
          <div className='h-1 w-8 rounded-full bg-[linear-gradient(45deg,#2b1608_0%,#5c4130_100%)]' />
        </div>

        <div className='rounded-xl border border-[#d3c3bb]/20 bg-white p-8 shadow-[0_8px_24px_rgba(43,22,8,0.06)] md:p-10'>
          <div className='mb-8'>
            <h1 className='mb-2 text-2xl font-bold tracking-tight text-[#2b1608]'>
              Recuperar contraseña
            </h1>
            <p className='text-sm text-[#50453f]'>
              Ingresa tu correo para recibir un código de recuperación.
            </p>
          </div>

          <form
            id='forgot-password-form'
            className='space-y-6'
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-[#50453f]'
                  >
                    Correo electrónico
                  </label>
                  <div className='relative'>
                    <MailIcon className='pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#82746e]' />
                    <Input
                      {...field}
                      id='email'
                      name='email'
                      type='email'
                      placeholder='tu@ejemplo.com'
                      autoComplete='email'
                      className='h-12 rounded-lg border-[#d3c3bb] bg-white pl-11'
                      aria-invalid={fieldState.invalid}
                    />
                  </div>
                  {fieldState.error?.message && (
                    <p className='text-sm text-red-600'>
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            {state.error && (
              <Alert variant='destructive' className='bg-red-50'>
                <OctagonAlertIcon className='size-4' />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <Button
              type='submit'
              form='forgot-password-form'
              disabled={isPending}
              className='h-12 w-full rounded-xl bg-[linear-gradient(45deg,#2b1608_0%,#5c4130_100%)] text-base font-bold text-white hover:opacity-95'
            >
              {isPending ? 'Enviando...' : 'Enviar código'}
            </Button>
          </form>

          <p className='mt-8 border-t border-[#d3c3bb]/30 pt-8 text-center text-sm text-[#50453f]'>
            ¿Recordaste tu contraseña?{' '}
            <Link
              href='/sign-in'
              className='font-bold text-[#2b1608] transition-colors hover:text-[#5c4130]'
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
