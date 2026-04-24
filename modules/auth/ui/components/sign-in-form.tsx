'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { EyeIcon, EyeOffIcon, MailIcon, OctagonAlertIcon } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { resendCode } from '@/modules/auth/actions/resend-code'
import { signIn } from '@/modules/auth/actions/sign-in'
import { signInSchema, type SignInInput } from '@/modules/auth/schemas'
import type { ActionResponse } from '@/modules/auth/types'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const initialState: ActionResponse<{ redirectTo: string }> = { success: false }

export function SignInForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(signIn, initialState)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' }
  })

  const [isTransitioning, startTransition] = useTransition()

  useEffect(() => {
    if (state.success && state.data?.redirectTo) {
      if (state.data.redirectTo === '/force-change-password') {
        const anyData = state.data as any;
        window.sessionStorage.setItem('auth.challengeEmail', anyData.email)
        window.sessionStorage.setItem('auth.challengeSession', anyData.session)
      }
      router.push(state.data.redirectTo)
    } else if (state.error === 'Debes confirmar tu correo antes de iniciar sesión') {
      const email = form.getValues('email')
      if (email) {
        window.sessionStorage.setItem('auth.pendingVerificationEmail', email)
        // Automatically trigger server action
        resendCode(email).then(() => {
          router.push('/register')
        }).catch(err => {
          console.error(err)
          router.push('/register')
        })
      }
    }
  }, [state, router, form])

  return (
    <div className='relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#faf9f8] p-6'>
      <div className='pointer-events-none absolute top-[-10%] left-[-5%] h-96 w-96 rounded-full bg-[#e9e8e7] blur-3xl' />
      <div className='pointer-events-none absolute right-[-5%] bottom-[-10%] h-96 w-96 rounded-full bg-[#e4dfdc] blur-3xl' />

      <div className='w-full max-w-md'>
        <div className='mb-12 flex flex-col items-center'>
          <div className='mb-2 text-4xl font-black tracking-tight text-[#2b1608]'>Telar</div>
          <div className='h-1 w-8 rounded-full bg-[linear-gradient(45deg,#2b1608_0%,#5c4130_100%)]' />
        </div>

        <div className='rounded-xl border border-[#d3c3bb]/20 bg-white p-8 shadow-[0_8px_24px_rgba(43,22,8,0.06)] md:p-10'>
          <div className='mb-8'>
            <h1 className='mb-2 text-2xl font-bold tracking-tight text-[#2b1608]'>
              Iniciar sesión
            </h1>
            <p className='text-sm text-[#50453f]'>Bienvenido de nuevo a Telar.</p>
          </div>

          <form
            id='sign-in-form'
            className='space-y-6'
            onSubmit={form.handleSubmit(data => {
              startTransition(() => {
                const formData = new FormData()
                formData.append('email', data.email)
                formData.append('password', data.password)
                formAction(formData)
              })
            })}
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
                    <p className='text-sm text-red-600'>{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name='password'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <label
                    htmlFor='sign-in-password'
                    className='block text-sm font-medium text-[#50453f]'
                  >
                    Contraseña
                  </label>
                  <div className='relative'>
                    <Input
                      {...field}
                      id='sign-in-password'
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='••••••••'
                      autoComplete='current-password'
                      className='h-12 rounded-lg border-[#d3c3bb] bg-white pr-12'
                      aria-invalid={fieldState.invalid}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute top-0 right-0 h-full px-3 hover:bg-transparent'
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? (
                        <EyeOffIcon className='h-4 w-4 text-[#50453f]' />
                      ) : (
                        <EyeIcon className='h-4 w-4 text-[#50453f]' />
                      )}
                    </Button>
                  </div>
                  <div>
                    <Link
                      href='/forgot-password'
                      className='text-sm font-medium text-[#2b1608] hover:text-[#5c4130]'
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  {fieldState.error?.message && (
                    <p className='text-sm text-red-600'>{fieldState.error.message}</p>
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
              form='sign-in-form'
              disabled={isPending || isTransitioning}
              className='h-12 w-full rounded-xl bg-[linear-gradient(45deg,#2b1608_0%,#5c4130_100%)] text-base font-bold text-white hover:opacity-95'
            >
              {isPending || isTransitioning ? 'Iniciando sesión...' : 'Ingresar'}
            </Button>
          </form>

          <p className='mt-8 border-t border-[#d3c3bb]/30 pt-8 text-center text-sm text-[#50453f]'>
            ¿Aún no tienes una cuenta?{' '}
            <Link
              href='/register'
              className='font-bold text-[#2b1608] transition-colors hover:text-[#5c4130]'
            >
              Crear una cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
