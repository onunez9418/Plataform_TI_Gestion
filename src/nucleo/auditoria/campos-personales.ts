// Lista cerrada de campos personales por tipo de entidad (ADR-11): de estos la auditoría guarda
// solo «el campo cambió», nunca el valor. Un solo lugar en el código.

export const CAMPOS_PERSONALES: Readonly<Record<string, readonly string[]>> = {
  usuario: ['correo', 'nombre'],
  persona: ['nombre', 'correo', 'area', 'telefono', 'codigo_empleado'],
}

export const MARCA_CAMPO_PERSONAL = 'cambió'

export function filtrarCambios(entidadTipo: string, cambios: Record<string, unknown>): Record<string, unknown> {
  const personales = CAMPOS_PERSONALES[entidadTipo] ?? []
  const salida: Record<string, unknown> = {}
  for (const [campo, valor] of Object.entries(cambios)) {
    salida[campo] = personales.includes(campo) ? MARCA_CAMPO_PERSONAL : valor
  }
  return salida
}
