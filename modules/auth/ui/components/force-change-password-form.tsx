'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { CheckIcon, EyeIcon, EyeOffIcon, OctagonAlertIcon } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { forceChangePassword } from '@/modules/auth/actions/force-change-password'
import { forceChangePasswordSchema, type ForceChangePasswordInput } from '@/modules/auth/schemas'
import type { ActionResponse } from '@/modules/auth/types'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const initialState: ActionResponse<{ redirectTo: string }> = { success: false }

export function ForceChangePasswordForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(forceChangePassword, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)

  const emailInfo = typeof window !== 'undefined' ? window.sessionStorage.getItem('auth.challengeEmail') : null

  const form = useForm<ForceChangePasswordInput>({
    resolver: zodResolver(forceChangePasswordSchema),
    defaultValues: { password: '' }
  })

  const [isTransitioning, startTransition] = useTransition()
  const newPassword = form.watch('password') || ''

  const reqs = {
    length: newPassword.length >= 12,
    lowercase: /[a-z]/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    symbol: /[^A-Za-z0-9]/.test(newPassword)
  }

  useEffect(() => {
    if (state.success && state.data?.redirectTo) {
      window.sessionStorage.removeItem('auth.challengeEmail')
      window.sessionStorage.removeItem('auth.challengeSession')
      router.push(state.data.redirectTo)
    }
  }, [state, router])

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
              Cambiar contraseña
            </h1>
            <p className='text-sm text-[#50453f]'>
              Por seguridad, debes crear una nueva contraseña para la cuenta {emailInfo ? <b>{emailInfo}</b> : ''}.
            </p>
          </div>

          <form
            id='force-change-password-form'
            className='space-y-6'
            onSubmit={form.handleSubmit(data => {
              const session = window.sessionStorage.getItem('auth.challengeSession')
              const email = window.sessionStorage.getItem('auth.challengeEmail')

              if (!session || !email) {
                setSessionError('No se encontró la sesión activa. Por favor, intenta iniciar sesión nuevamente.')
                return
              }

              setSessionError(null)

              startTransition(() => {
                const formData = new FormData()
                formData.append('password', data.password)
                formData.append('session', session)
                formData.append('email', email)
                formAction(formData)
              })
            })}
          >
            <Controller
              name='password'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <label
                    htmlFor='new-password'
                    className='block text-sm font-medium text-[#50453f]'
                  >
                    Nueva contraseña
                  </label>
                  <div className='relative'>
                    <Input
                      {...field}
                      id='new-password'
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='••••••••'
                      autoComplete='new-password'
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
                  {fieldState.error?.message && (
                    <p className='text-sm text-red-600'>{fieldState.error.message}</p>
                  )}
                  <div className='mt-2 text-xs leading-relaxed'>
                    <p className='mb-1.5 font-medium text-[#50453f]'>Debe incluir al menos:</p>
                    <ul className='space-y-1.5'>
                      <RequirementItem met={reqs.length} text='12 caracteres' />
                      <RequirementItem met={reqs.lowercase} text='Una minúscula' />
                      <RequirementItem met={reqs.uppercase} text='Una mayúscula' />
                      <RequirementItem met={reqs.number} text='Un número' />
                      <RequirementItem met={reqs.symbol} text='Un símbolo' />
                    </ul>
                  </div>
                </div>
              )}
            />

            {(state.error || sessionError) && (
              <Alert variant='destructive' className='bg-red-50'>
                <OctagonAlertIcon className='size-4' />
                <AlertDescription>{state.error || sessionError}</AlertDescription>
              </Alert>
            )}

            <Button
              type='submit'
              form='force-change-password-form'
              disabled={isPending || isTransitioning}
              className='h-12 w-full rounded-xl bg-[linear-gradient(45deg,#2b1608_0%,#5c4130_100%)] text-base font-bold text-white hover:opacity-95'
            >
              {isPending || isTransitioning ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>

          <div className='mt-6 text-center'>
            <Button
              variant='link'
              onClick={() => router.push('/sign-in')}
              className='text-sm text-[#50453f] hover:text-[#2b1608]'
            >
              Volver al inicio de sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <li className='flex items-center gap-2'>
      <div
        className={`flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border ${
          met ? 'border-[#5c4130] bg-[#5c4130] text-white' : 'border-[#d3c3bb] bg-transparent'
        }`}
      >
        {met && <CheckIcon className='size-2.5' strokeWidth={4} />}
      </div>
      <span className={met ? 'font-medium text-[#5c4130]' : 'text-[#7d7068]'}>{text}</span>
    </li>
  )
}
