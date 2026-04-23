'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { EyeIcon, EyeOffIcon, KeyRoundIcon, OctagonAlertIcon } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { resetPassword } from '@/modules/auth/actions/reset-password'
import { resetPasswordSchema, type ResetPasswordInput } from '@/modules/auth/schemas'
import type { ActionResponse } from '@/modules/auth/types'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

const initialState: ActionResponse<{ redirectTo: string }> = { success: false }

export function ResetPasswordForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(resetPassword, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '', code: '', password: '' }
  })

  useEffect(() => {
    const savedEmail = window.sessionStorage.getItem('auth.resetPasswordEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      form.setValue('email', savedEmail)
    } else {
      router.push('/forgot-password')
    }
  }, [form, router])

  const [isTransitioning, startTransition] = useTransition()

  useEffect(() => {
    if (state.success && state.data?.redirectTo) {
      window.sessionStorage.removeItem('auth.resetPasswordEmail')
      router.push(state.data.redirectTo)
    }
  }, [state, router])

  if (!email) {
    return null
  }

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
              Restablecer contraseña
            </h1>
            <p className='text-sm text-[#50453f]'>Ingresa el código enviado a tu correo y tu nueva contraseña.</p>
          </div>

          <form
            id='reset-password-form'
            className='space-y-6'
            onSubmit={form.handleSubmit(data => {
              startTransition(() => {
                const formData = new FormData()
                formData.append('email', data.email)
                formData.append('code', data.code)
                formData.append('password', data.password)
                formAction(formData)
              })
            })}
          >
            <Controller
              name='code'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <label className='block text-sm font-medium text-[#50453f]'>
                    Código de verificación
                  </label>
                  <div className='flex justify-center'>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className='h-12 w-12 border-[#d3c3bb] text-lg' />
                        <InputOTPSlot index={1} className='h-12 w-12 border-[#d3c3bb] text-lg' />
                        <InputOTPSlot index={2} className='h-12 w-12 border-[#d3c3bb] text-lg' />
                        <InputOTPSlot index={3} className='h-12 w-12 border-[#d3c3bb] text-lg' />
                        <InputOTPSlot index={4} className='h-12 w-12 border-[#d3c3bb] text-lg' />
                        <InputOTPSlot index={5} className='h-12 w-12 border-[#d3c3bb] text-lg' />
                      </InputOTPGroup>
                    </InputOTP>
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
                    htmlFor='reset-password'
                    className='block text-sm font-medium text-[#50453f]'
                  >
                    Nueva contraseña
                  </label>
                  <div className='relative'>
                    <KeyRoundIcon className='pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#82746e]' />
                    <Input
                      {...field}
                      id='reset-password'
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='••••••••'
                      autoComplete='new-password'
                      className='h-12 rounded-lg border-[#d3c3bb] bg-white pl-11 pr-12'
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
                  {fieldState.error?.message && (
                    <p className='text-sm text-red-600'>{fieldState.error.message}</p>
                  )}
                  {/* Password requirements */}
                  <div className="space-y-1 mt-2">
                    <p className={`text-xs ${(field.value || '').length >= 12 ? 'text-green-600' : 'text-[#82746e]'}`}>
                      • Al menos 12 caracteres
                    </p>
                    <p className={`text-xs ${/[A-Z]/.test(field.value || '') ? 'text-green-600' : 'text-[#82746e]'}`}>
                      • Una letra mayúscula
                    </p>
                    <p className={`text-xs ${/[a-z]/.test(field.value || '') ? 'text-green-600' : 'text-[#82746e]'}`}>
                      • Una letra minúscula
                    </p>
                    <p className={`text-xs ${/[0-9]/.test(field.value || '') ? 'text-green-600' : 'text-[#82746e]'}`}>
                      • Un número
                    </p>
                    <p className={`text-xs ${/[^A-Za-z0-9]/.test(field.value || '') ? 'text-green-600' : 'text-[#82746e]'}`}>
                      • Un carácter especial
                    </p>
                  </div>
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
              form='reset-password-form'
              disabled={isPending || isTransitioning}
              className='h-12 w-full rounded-xl bg-[linear-gradient(45deg,#2b1608_0%,#5c4130_100%)] text-base font-bold text-white hover:opacity-95'
            >
              {isPending || isTransitioning ? 'Guardando...' : 'Cambiar contraseña'}
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
