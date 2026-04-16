'use client'

import { useState } from 'react'

import { MoreHorizontal, Trash2 } from 'lucide-react'

import { toast } from 'sonner'

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { deleteEmployee } from '../../actions/delete-employee'
import type { Employee } from '../../types'

interface EmployeesTableProps {
  employees: Employee[]
}

export function EmployeesTable({ employees }: EmployeesTableProps) {
  const [employeeToDelete, setEmployeeToDelete] = useState<{
    superTokensId: string
    name: string
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const sellers = employees.filter(
    employee =>
      employee.roles.includes('seller') && !employee.roles.includes('owner')
  )

  async function handleDelete() {
    if (!employeeToDelete) return

    setIsDeleting(true)
    const result = await deleteEmployee(employeeToDelete.superTokensId)
    setIsDeleting(false)

    if (result.success) {
      toast.success('Empleado eliminado exitosamente')
    } else {
      toast.error(result.error || 'Error al eliminar empleado')
    }

    setEmployeeToDelete(null)
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (sellers.length === 0) {
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
            <TableHead>Rol</TableHead>
            <TableHead>Fecha de creación</TableHead>
            <TableHead className='w-[50px]'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sellers.map(employee => (
            <TableRow key={employee.id}>
              <TableCell className='font-medium capitalize'>
                {employee.names} {employee.lastNames}
              </TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>
                <Badge variant='default'>Vendedor</Badge>
              </TableCell>
              <TableCell>{formatDate(employee.createdAt)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon'>
                      <MoreHorizontal className='h-4 w-4' />
                      <span className='sr-only'>Acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                      className='bg-destructive/80 focus:text-destructive hover:bg-destructive/90! cursor-pointer text-white hover:text-white!'
                      onClick={() =>
                        setEmployeeToDelete({
                          superTokensId: employee.superTokensId,
                          name: `${employee.names} ${employee.lastNames}`
                        })
                      }
                    >
                      <Trash2 className='h-4 w-4 text-white' />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!employeeToDelete}
        onOpenChange={open => !open && setEmployeeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar empleado?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar a {employeeToDelete?.name}? Esta acción
              no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className='bg-destructive hover:bg-destructive/90 text-white'
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
