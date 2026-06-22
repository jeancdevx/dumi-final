import { AuthRouteGuard } from '@/modules/auth/ui/components/auth-route-guard'
import { SignUpForm } from '@/modules/auth/ui/components/sign-up-form'

export const metadata = {
  title: 'Crear cuenta — Telar',
  description: 'Regístrate en Telar y comienza a gestionar tu negocio'
}

export default function SignUpPage() {
  return (
    <AuthRouteGuard mode='guest'>
      <SignUpForm />
    </AuthRouteGuard>
  )
}
