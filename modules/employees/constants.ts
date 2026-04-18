export const EMPLOYEE_ERRORS = {
  EMAIL_ALREADY_EXISTS: 'Ya existe un empleado con este correo electrónico',
  NOT_FOUND: 'Empleado no encontrado',
  CANNOT_DELETE_SELF: 'No puedes eliminarte a ti mismo',
  CANNOT_DISABLE_SELF: 'No puedes desactivar tu propia cuenta',
  CANNOT_DISABLE_OWNER: 'La cuenta del propietario no puede ser desactivada',
  CANNOT_DISABLE_ADMIN: 'Un administrador no puede desactivar a otro administrador',
  CANNOT_REACTIVATE_SELF: 'No puedes modificar tu propio perfil de esta manera',
  CANNOT_REACTIVATE_ADMIN: 'Un administrador no puede reactivar a otro administrador',
  UNKNOWN: 'Ocurrió un error inesperado, intenta nuevamente'
} as const
