'use client'

import { useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { Shield, UserRound } from 'lucide-react'

import { toast } from 'sonner'

import type { Role } from '@/modules/auth/types'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { updateEmployeeStatusClient } from '../../lib/employees-client'
import type { Employee } from '../../types'

interface EmployeesTableProps {
  employees: Employee[]
  currentUserRoles: Role[]
  currentUserEmail: string
  currentUserSub: string
  onStatusUpdated?: () => void
}

export function EmployeesTable({
  employees,
  currentUserRoles,
  currentUserEmail,
  currentUserSub,
  onStatusUpdated
}: EmployeesTableProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [employeeToUpdate, setEmployeeToUpdate] = useState<{
    id: string
    name: string
    isActive: boolean
  } | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const viewerIsOwner = currentUserRoles.includes('owner')
  const visibleEmployees = viewerIsOwner
    ? employees
    : employees.filter(
        employee =>
          !employee.roles.includes('owner') && !employee.roles.includes('admin')
      )

  async function handleStatusUpdate() {
    if (!employeeToUpdate) return

    setIsUpdating(true)
    try {
      const result = await updateEmployeeStatusClient({
        employeeId: employeeToUpdate.id,
        shouldActivate: !employeeToUpdate.isActive
      })

      if (result.success) {
        toast.success(
          employeeToUpdate.isActive
            ? 'Empleado suspendido exitosamente'
            : 'Empleado reactivado exitosamente'
        )
        onStatusUpdated?.()
        startTransition(() => router.refresh())
      } else {
        toast.error(
          result.error || 'No se pudo actualizar el estado del empleado'
        )
      }
    } finally {
      setIsUpdating(false)
      setEmployeeToUpdate(null)
    }
  }

  function canManageEmployee(employee: Employee): boolean {
    if (
      employee.email === currentUserEmail ||
      employee.sub === currentUserSub
    ) {
      return false
    }

    if (viewerIsOwner) {
      return true
    }

    const targetIsPrivileged =
      employee.roles.includes('owner') || employee.roles.includes('admin')

    return !targetIsPrivileged
  }

  function getRoleLabel(role: Role): string {
    if (role === 'owner') return 'Owner'
    if (role === 'admin') return 'Admin'
    return 'Seller'
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (visibleEmployees.length === 0) {
    return (
      <div className='text-muted-foreground py-8 text-center'>
        No hay empleados registrados
      </div>
    )
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de creación</TableHead>
            <TableHead className='w-[120px] text-right'>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleEmployees.map(employee => (
            <TableRow key={employee.id}>
              <TableCell className='font-medium capitalize'>
                {employee.names} {employee.lastNames}
              </TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>
                <div className='flex flex-wrap gap-1.5'>
                  {employee.roles.map(role => (
                    <Badge
                      key={`${employee.id}-${role}`}
                      variant={role === 'owner' ? 'default' : 'secondary'}
                    >
                      {role === 'owner' || role === 'admin' ? (
                        <Shield className='mr-1 h-3 w-3' />
                      ) : (
                        <UserRound className='mr-1 h-3 w-3' />
                      )}
                      {getRoleLabel(role)}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={employee.isActive ? 'secondary' : 'destructive'}
                >
                  {employee.isActive ? 'Activo' : 'Suspendido'}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(employee.createdAt)}</TableCell>
              <TableCell className='text-right'>
                {canManageEmployee(employee) ? (
                  <Button
                    type='button'
                    variant={employee.isActive ? 'outline' : 'secondary'}
                    size='sm'
                    onClick={() =>
                      setEmployeeToUpdate({
                        id: employee.id,
                        name: `${employee.names} ${employee.lastNames}`,
                        isActive: employee.isActive
                      })
                    }
                  >
                    {employee.isActive ? 'Suspender' : 'Reactivar'}
                  </Button>
                ) : (
                  <span className='text-muted-foreground text-xs'>-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!employeeToUpdate}
        onOpenChange={open => !open && setEmployeeToUpdate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {employeeToUpdate?.isActive
                ? '¿Suspender empleado?'
                : '¿Reactivar empleado?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {employeeToUpdate?.isActive
                ? `¿Estás seguro de suspender a ${employeeToUpdate?.name}?`
                : `¿Estás seguro de reactivar a ${employeeToUpdate?.name}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              disabled={isUpdating}
              className={
                employeeToUpdate?.isActive
                  ? 'bg-destructive hover:bg-destructive/90 text-white'
                  : ''
              }
            >
              {isUpdating
                ? 'Guardando...'
                : employeeToUpdate?.isActive
                  ? 'Suspender'
                  : 'Reactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
