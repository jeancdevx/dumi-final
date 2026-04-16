import { redirect } from 'next/navigation'

import { getRedirectPathByRole, getSession } from '@/modules/auth/lib/dal'
import { SignUpForm } from '@/modules/auth/ui/components/sign-up-form'

export const metadata = {
  title: 'Crear cuenta — Telar',
  description: 'Regístrate en Telar y comienza a gestionar tu negocio'
}

export default async function SignUpPage() {
  const session = await getSession()

  if (session) {
    if (!session.tenantId) {
      redirect('/tenant-setup')
    }
    redirect(getRedirectPathByRole(session.roles))
  }

  return <SignUpForm />
}
