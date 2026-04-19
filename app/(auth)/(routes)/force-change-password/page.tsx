import { ForceChangePasswordForm } from '@/modules/auth/ui/components/force-change-password-form'

export const metadata = {
  title: 'Cambiar contraseña temporal — Telar',
  description: 'Cambia tu contraseña temporal para acceder a Telar'
}

export default function ForceChangePasswordPage() {
  return <ForceChangePasswordForm />
}
