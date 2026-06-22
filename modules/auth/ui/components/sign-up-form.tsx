'use client'

import { useState, useSyncExternalStore } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { CheckIcon, EyeIcon, EyeOffIcon, OctagonAlertIcon } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { Controller, useForm, useWatch } from 'react-hook-form'

import {
  confirmEmailClient,
  resendCodeClient,
  signUpClient
} from '@/modules/auth/lib/auth-client'
import {
  otpVerificationSchema,
  signUpSchema,
  type OtpVerificationInput,
  type SignUpInput
} from '@/modules/auth/schemas'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp'

type Step = 'create-account' | 'verify-code' | 'done'
const PENDING_EMAIL_STORAGE_KEY = 'auth.pendingVerificationEmail'
const PENDING_EMAIL_STORAGE_EVENT = 'auth:pending-verification-email'

function getPendingVerificationEmail() {
  if (typeof window === 'undefined') return ''

  return window.sessionStorage.getItem(PENDING_EMAIL_STORAGE_KEY) ?? ''
}

function subscribeToPendingVerificationEmail(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(PENDING_EMAIL_STORAGE_EVENT, onStoreChange)

  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(PENDING_EMAIL_STORAGE_EVENT, onStoreChange)
  }
}

function setPendingVerificationEmail(email: string) {
  window.sessionStorage.setItem(PENDING_EMAIL_STORAGE_KEY, email)
  window.dispatchEvent(new Event(PENDING_EMAIL_STORAGE_EVENT))
}

export function SignUpForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('create-account')
  const [pendingEmailOverride, setPendingEmailOverride] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const storedPendingEmail = useSyncExternalStore(
    subscribeToPendingVerificationEmail,
    getPendingVerificationEmail,
    () => ''
  )

  const signUpForm = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      acceptedTerms: false
    }
  })

  const otpForm = useForm<OtpVerificationInput>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: { email: '', code: '' }
  })
  const otpCode = useWatch({ control: otpForm.control, name: 'code' })
  const signupPassword =
    useWatch({ control: signUpForm.control, name: 'password' }) || ''
  const pendingEmail = pendingEmailOverride || storedPendingEmail
  const currentStep =
    step === 'create-account' && pendingEmail ? 'verify-code' : step
  const verificationSuccessMessage =
    successMessage ??
    (currentStep === 'verify-code' && storedPendingEmail
      ? 'Retomamos tu verificación de correo.'
      : null)

  const reqs = {
    length: signupPassword.length >= 12,
    lowercase: /[a-z]/.test(signupPassword),
    uppercase: /[A-Z]/.test(signupPassword),
    number: /[0-9]/.test(signupPassword),
    symbol: /[^A-Za-z0-9]/.test(signupPassword)
  }

  const handleCreateAccount = async (data: SignUpInput) => {
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const result = await signUpClient(data)

    if (!result.success) {
      setErrorMessage(result.error || 'No se pudo crear la cuenta.')
      setIsSubmitting(false)
      return
    }

    const email = result.data?.email ?? data.email
    setPendingEmailOverride(email)
    otpForm.setValue('email', email)
    otpForm.setValue('code', '')
    setPendingVerificationEmail(email)
    setStep('verify-code')
    setSuccessMessage(`Te enviamos un código de 6 dígitos al correo ${email}.`)
    setIsSubmitting(false)
  }

  const handleVerifyCode = async (data: OtpVerificationInput) => {
    const email = data.email || pendingEmail

    if (!email) {
      setErrorMessage('No se encontró el correo pendiente de verificación.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const result = await confirmEmailClient({ ...data, email })

    if (!result.success) {
      setErrorMessage(result.error || 'No se pudo verificar el código.')
      setIsSubmitting(false)
      return
    }

    window.sessionStorage.removeItem(PENDING_EMAIL_STORAGE_KEY)
    setStep('done')
    setSuccessMessage('Tu cuenta fue verificada correctamente.')
    setIsSubmitting(false)
  }

  const handleResendCode = async () => {
    if (!pendingEmail) return
    setIsResending(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const result = await resendCodeClient(pendingEmail)

    if (!result.success) {
      setErrorMessage(result.error || 'No se pudo reenviar el código.')
    } else {
      setSuccessMessage(`Enviamos un nuevo código a ${pendingEmail}.`)
    }
    setIsResending(false)
  }

  return (
    <div className='flex min-h-svh w-full flex-col bg-[#faf9f8] md:flex-row'>
      {/* Panel izquierdo — solo desktop */}
      <div className='relative hidden w-1/2 items-center justify-center overflow-hidden bg-[#2b1608] p-12 md:flex'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,#5c4130_0%,#2b1608_60%)] opacity-90' />
        <div className='relative z-10 max-w-md text-white'>
          <h1 className='mb-6 text-6xl leading-none font-black tracking-tight'>
            Telar
          </h1>
          <p className='text-2xl leading-relaxed font-light text-[#e6bea8]'>
            Crea tu cuenta y comienza a gestionar tu negocio.
          </p>
          <div className='mt-12 flex gap-4'>
            <div className='h-1 w-12 rounded-full bg-[#e6bea8]' />
            <div className='h-1 w-4 rounded-full bg-[#e6bea84d]' />
            <div className='h-1 w-4 rounded-full bg-[#e6bea84d]' />
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className='flex flex-1 items-center justify-center p-6 md:p-12 lg:p-24'>
        <div className='w-full max-w-md space-y-8'>
          {/* Paso 1: crear cuenta */}
          {currentStep === 'create-account' && (
            <>
              <div className='space-y-2'>
                <h2 className='text-4xl leading-tight font-bold tracking-tight text-[#2b1608]'>
                  Comienza tu viaje
                </h2>
                <p className='font-medium text-[#50453f]'>
                  Crea una cuenta para continuar.
                </p>
              </div>

              {errorMessage && (
                <Alert variant='destructive' className='bg-red-50'>
                  <OctagonAlertIcon className='size-4' />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <form
                className='space-y-6'
                onSubmit={signUpForm.handleSubmit(handleCreateAccount)}
              >
                <div className='space-y-5'>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-1.5'>
                      <label
                        className='ml-1 block text-sm font-semibold text-[#50453f]'
                        htmlFor='firstName'
                      >
                        Nombre
                      </label>
                      <Input
                        id='firstName'
                        placeholder='Ej. Juliana'
                        className='h-12 rounded-xl border-[#d3c3bb] bg-white'
                        {...signUpForm.register('firstName')}
                      />
                      {signUpForm.formState.errors.firstName?.message && (
                        <p className='text-sm text-red-600'>
                          {signUpForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-1.5'>
                      <label
                        className='ml-1 block text-sm font-semibold text-[#50453f]'
                        htmlFor='lastName'
                      >
                        Apellido
                      </label>
                      <Input
                        id='lastName'
                        placeholder='Ej. Castro'
                        className='h-12 rounded-xl border-[#d3c3bb] bg-white'
                        {...signUpForm.register('lastName')}
                      />
                      {signUpForm.formState.errors.lastName?.message && (
                        <p className='text-sm text-red-600'>
                          {signUpForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='space-y-1.5'>
                    <label
                      className='ml-1 block text-sm font-semibold text-[#50453f]'
                      htmlFor='signup-email'
                    >
                      Correo electrónico
                    </label>
                    <Input
                      id='signup-email'
                      type='email'
                      placeholder='nombre@dominio.com'
                      className='h-12 rounded-xl border-[#d3c3bb] bg-white'
                      {...signUpForm.register('email')}
                    />
                    {signUpForm.formState.errors.email?.message && (
                      <p className='text-sm text-red-600'>
                        {signUpForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-1.5'>
                    <label
                      className='ml-1 block text-sm font-semibold text-[#50453f]'
                      htmlFor='signup-password'
                    >
                      Contraseña
                    </label>
                    <div className='relative'>
                      <Input
                        id='signup-password'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                        className='h-12 rounded-xl border-[#d3c3bb] bg-white pr-12'
                        {...signUpForm.register('password')}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute top-0 right-0 h-full px-3 hover:bg-transparent'
                        onClick={() => setShowPassword(prev => !prev)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className='size-4 text-[#50453f]' />
                        ) : (
                          <EyeIcon className='size-4 text-[#50453f]' />
                        )}
                      </Button>
                    </div>
                    {signUpForm.formState.errors.password?.message && (
                      <p className='text-sm text-red-600'>
                        {signUpForm.formState.errors.password.message}
                      </p>
                    )}
                    <div className='mt-2 text-xs leading-relaxed'>
                      <p className='mb-1.5 font-medium text-[#50453f]'>
                        Debe incluir al menos:
                      </p>
                      <ul className='space-y-1.5'>
                        <RequirementItem
                          met={reqs.length}
                          text='12 caracteres'
                        />
                        <RequirementItem
                          met={reqs.lowercase}
                          text='Una minúscula'
                        />
                        <RequirementItem
                          met={reqs.uppercase}
                          text='Una mayúscula'
                        />
                        <RequirementItem met={reqs.number} text='Un número' />
                        <RequirementItem met={reqs.symbol} text='Un símbolo' />
                      </ul>
                    </div>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Controller
                    name='acceptedTerms'
                    control={signUpForm.control}
                    render={({ field }) => (
                      <label className='flex items-start gap-3'>
                        <Checkbox
                          id='acceptedTerms'
                          checked={field.value}
                          onCheckedChange={checked =>
                            field.onChange(Boolean(checked))
                          }
                          className='mt-0.5 data-[state=checked]:bg-[#2b1608]'
                        />
                        <span className='text-xs leading-relaxed text-[#50453f]'>
                          Al crear una cuenta, aceptas nuestros Términos de
                          Servicio y Política de Privacidad.
                        </span>
                      </label>
                    )}
                  />
                  {signUpForm.formState.errors.acceptedTerms?.message && (
                    <p className='text-sm text-red-600'>
                      {signUpForm.formState.errors.acceptedTerms.message}
                    </p>
                  )}
                </div>

                <Button
                  type='submit'
                  disabled={isSubmitting}
                  className='h-12 w-full rounded-xl bg-[linear-gradient(45deg,#2b1608_0%,#5c4130_100%)] text-lg font-bold text-white hover:opacity-95'
                >
                  {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
              </form>
            </>
          )}

          {/* Paso 2: verificar código OTP */}
          {currentStep === 'verify-code' && (
            <div className='relative overflow-hidden rounded-xl bg-white p-8 shadow-[0_8px_24px_rgba(43,22,8,0.06)] md:p-12'>
              <div className='absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#f4f3f2] opacity-70' />

              <form
                className='relative z-10 space-y-10'
                onSubmit={otpForm.handleSubmit(handleVerifyCode)}
              >
                <input type='hidden' {...otpForm.register('email')} />

                <div className='mb-8 flex justify-center md:justify-start'>
                  <div className='h-1 w-12 rounded-full bg-[#5c4130]' />
                </div>

                <div>
                  <h3 className='mb-4 text-3xl leading-tight font-extrabold tracking-tight text-[#2b1608] md:text-4xl'>
                    Verifica tu cuenta
                  </h3>
                  <p className='text-base leading-relaxed text-[#50453f]'>
                    Hemos enviado un código de 6 dígitos a tu correo
                    {pendingEmail ? ` ${pendingEmail}` : ''}.
                  </p>
                </div>

                {errorMessage && (
                  <Alert variant='destructive' className='bg-red-50'>
                    <OctagonAlertIcon className='size-4' />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {verificationSuccessMessage && (
                  <Alert className='border-[#2b1608]/10 bg-[#fff8f3] text-[#2b1608]'>
                    <AlertDescription>
                      {verificationSuccessMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <Controller
                  name='code'
                  control={otpForm.control}
                  render={({ field, fieldState }) => (
                    <div className='space-y-2'>
                      <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        value={field.value}
                        onChange={field.onChange}
                        containerClassName='w-full justify-between gap-2 md:gap-4'
                      >
                        <InputOTPGroup className='w-full justify-between'>
                          {[0, 1, 2, 3, 4, 5].map(i => (
                            <InputOTPSlot
                              key={i}
                              index={i}
                              className='h-14 w-12 rounded-lg border-0 bg-[#f4f3f2] text-xl font-bold text-[#2b1608] md:h-16 md:w-14'
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                      {fieldState.error?.message && (
                        <p className='text-sm text-red-600'>
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <div className='space-y-6'>
                  <Button
                    type='submit'
                    disabled={isSubmitting || otpCode.length < 6}
                    className='h-12 w-full rounded-xl bg-[linear-gradient(45deg,#2b1608_0%,#5c4130_100%)] text-lg font-bold text-white hover:opacity-95'
                  >
                    {isSubmitting ? 'Verificando...' : 'Verificar'}
                  </Button>
                  <p className='text-center text-sm tracking-wide text-[#50453f]'>
                    No recibí el código.{' '}
                    <Button
                      type='button'
                      variant='link'
                      disabled={isResending}
                      className='h-auto p-0 font-bold text-[#2b1608] hover:underline'
                      onClick={handleResendCode}
                    >
                      {isResending ? 'Reenviando...' : 'Reenviar'}
                    </Button>
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Paso 3: cuenta verificada */}
          {currentStep === 'done' && (
            <div className='space-y-6 rounded-xl border border-[#d3c3bb] bg-white p-8'>
              <div className='flex flex-col items-start gap-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#fff8f3]'>
                  <span className='text-2xl'>✓</span>
                </div>
                <h3 className='text-2xl font-bold text-[#2b1608]'>
                  ¡Cuenta verificada!
                </h3>
              </div>
              {successMessage && (
                <Alert className='border-[#2b1608]/10 bg-[#fff8f3] text-[#2b1608]'>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              <p className='text-sm text-[#50453f]'>
                Ya puedes iniciar sesión con tu correo y contraseña.
              </p>
              <Button
                type='button'
                onClick={() => router.push('/sign-in')}
                className='h-12 w-full rounded-xl bg-[linear-gradient(45deg,#2b1608_0%,#5c4130_100%)] text-base font-bold text-white hover:opacity-95'
              >
                Ir a iniciar sesión
              </Button>
            </div>
          )}

          {currentStep !== 'done' && (
            <p className='border-t border-[#e3e2e1] pt-6 text-center text-sm text-[#50453f]'>
              ¿Ya tienes una cuenta?{' '}
              <Link
                href='/sign-in'
                className='font-bold text-[#2b1608] transition-colors hover:text-[#5c4130]'
              >
                Inicia sesión
              </Link>
            </p>
          )}
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
          met
            ? 'border-[#5c4130] bg-[#5c4130] text-white'
            : 'border-[#d3c3bb] bg-transparent'
        }`}
      >
        {met && <CheckIcon className='size-2.5' strokeWidth={4} />}
      </div>
      <span className={met ? 'font-medium text-[#5c4130]' : 'text-[#7d7068]'}>
        {text}
      </span>
    </li>
  )
}
