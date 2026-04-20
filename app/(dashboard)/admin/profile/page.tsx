import { verifySession } from '@/modules/auth/lib/dal'
import { getCurrentEmployee } from '@/modules/employees/queries'
import { UpdateMyProfileForm } from '@/modules/employees/ui/components/update-my-profile-form'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Mail, ShieldCheck, CalendarDays } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminProfilePage() {
  await verifySession()
  const employee = await getCurrentEmployee()

  const initials =
    `${employee.names.charAt(0)}${employee.lastNames.charAt(0)}`.toUpperCase()
  const fullName = `${employee.names} ${employee.lastNames}`

  const roleColors: Record<string, string> = {
    owner: 'bg-amber-100 text-amber-800 border-amber-200',
    admin: 'bg-blue-100 text-blue-800 border-blue-200',
    seller: 'bg-green-100 text-green-800 border-green-200'
  }

  return (
    <div className='flex flex-1 flex-col'>
      {/* Banner superior */}
      <div className='relative h-36 bg-gradient-to-r from-neutral-900 to-neutral-700'>
        <div className='absolute inset-0 opacity-10'
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
      </div>

      <div className='px-6 pb-6'>
        {/* Avatar flotante sobre el banner */}
        <div className='relative -mt-14 mb-6 flex items-end gap-5'>
          <div className='flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-background bg-primary text-primary-foreground text-3xl font-bold shadow-lg'>
            {initials}
          </div>
          <div className='mb-2'>
            <h1 className='text-2xl font-bold tracking-tight'>{fullName}</h1>
            <p className='text-muted-foreground text-sm'>{employee.email}</p>
          </div>
        </div>

        {/* Grid principal */}
        <div className='grid gap-6 lg:grid-cols-[300px_1fr]'>

          {/* Columna izquierda — info */}
          <div className='space-y-4'>
            <div className='rounded-xl border bg-card p-5 shadow-sm'>
              <h2 className='text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4'>
                Información
              </h2>

              <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <div className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>Correo electrónico</p>
                    <p className='text-sm font-medium break-all'>{employee.email}</p>
                  </div>
                </div>

                <Separator />

                <div className='flex items-start gap-3'>
                  <div className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted'>
                    <ShieldCheck className='h-4 w-4 text-muted-foreground' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-xs text-muted-foreground mb-2'>Roles asignados</p>
                    <div className='flex flex-wrap gap-1.5'>
                      {employee.roles.map(role => (
                        <span
                          key={role}
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleColors[role] ?? 'bg-muted text-muted-foreground'}`}
                        >
                          {role.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className='rounded-xl border bg-card p-5 shadow-sm'>
              <h2 className='text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3'>
                Estado de cuenta
              </h2>
              <div className='flex items-center gap-2'>
                <span className='relative flex h-2.5 w-2.5'>
                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75'></span>
                  <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500'></span>
                </span>
                <span className='text-sm font-medium text-green-700'>Cuenta activa</span>
              </div>
            </div>
          </div>

          {/* Columna derecha — formulario */}
          <div className='rounded-xl border bg-card p-6 shadow-sm'>
            <div className='mb-6'>
              <h2 className='text-lg font-semibold'>Editar información personal</h2>
              <p className='text-sm text-muted-foreground mt-1'>
                Actualiza tus nombres y apellidos visibles en el sistema. Tu correo no puede ser modificado.
              </p>
            </div>
            <Separator className='mb-6' />
            <UpdateMyProfileForm currentEmployee={employee} />
          </div>
        </div>
      </div>
    </div>
  )
}
