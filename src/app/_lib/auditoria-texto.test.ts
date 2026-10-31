import { describe, expect, it } from 'vitest'
import { lineasDeDetalle, textoDeAccion, textoDeEntidad } from './auditoria-texto'

describe('auditoría en lenguaje de la persona', () => {
  it('traduce las acciones y los tipos de dato', () => {
    expect(textoDeAccion('sku.crear')).toBe('Creó un artículo (SKU)')
    expect(textoDeAccion('activo.registrar')).toBe('Registró un equipo')
    expect(textoDeEntidad('categoria')).toBe('Categoría')
  })
  it('una acción desconocida se vuelve una frase, sin puntos ni guiones bajos', () => {
    expect(textoDeAccion('algo_nuevo.hecho')).toBe('Algo nuevo hecho')
  })
  it('oculta los identificadores largos y muestra etiquetas con tilde', () => {
    const l = lineasDeDetalle({ codigo: 'LAP-0001', prefijo: 'LAP', personaId: '01a18ff5-302f-73c6-aaaa', ubicacionId: 'x' })
    expect(l).toEqual(['Código: LAP-0001', 'Prefijo: LAP'])
  })
  it('los estados con guion bajo se escriben con espacio', () => {
    expect(lineasDeDetalle({ estado: 'recibida_parcial' })).toEqual(['Estado: recibida parcial'])
  })
  it('las series salen separadas por coma, los antes/después con flecha y los permisos se cuentan', () => {
    const l = lineasDeDetalle({ series: ['SN-1', 'SN-2'], rol: { antes: 'Técnico', despues: 'Jefatura' }, permisos: ['a', 'b', 'c'], obligatorio: true })
    expect(l).toEqual(['Series: SN-1, SN-2', 'Rol: Técnico → Jefatura', 'Permisos: 3', 'Obligatorio: Sí'])
  })
})
