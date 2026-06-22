import { AuthRouteGuard } from '@/modules/auth/ui/components/auth-route-guard'
import { SignInForm } from '@/modules/auth/ui/components/sign-in-form'

export const metadata = {
  title: 'Iniciar sesión — Telar',
  description: 'Accede a Telar con tus credenciales'
}

export default function SignInPage() {
  return (
    <AuthRouteGuard mode='guest'>
      <SignInForm />
    </AuthRouteGuard>
  )
}
