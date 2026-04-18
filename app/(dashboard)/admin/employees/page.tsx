import { requireRole } from '@/modules/auth/lib/dal'
import { getEmployees } from '@/modules/employees/queries'
import { CreateEmployeeForm } from '@/modules/employees/ui/components/create-employee-form'
import { EmployeesTable } from '@/modules/employees/ui/components/employees-table'

export default async function EmployeesPage() {
  const session = await requireRole(['owner', 'admin'])
  const employees = await getEmployees()

  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Empleados</h1>
          <p className='text-muted-foreground'>
            Visualiza y gestiona el estado de los empleados de tu organización
          </p>
        </div>
        <CreateEmployeeForm
          canAssignAdminRole={session.roles.includes('owner')}
        />
      </div>
      <EmployeesTable
        employees={employees}
        currentUserRoles={session.roles}
        currentUserEmail={session.email}
        currentUserSub={session.userId}
      />
    </div>
  )
}
