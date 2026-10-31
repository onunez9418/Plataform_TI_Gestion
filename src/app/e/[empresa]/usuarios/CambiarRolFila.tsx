'use client'
import { useState } from 'react'
import { BotonAccion } from '@/componentes/ui/BotonAccion'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

type Props = {
  usuarioId: string
  /** Identificador legible para las pruebas (el correo). */
  clave: string
  rolActual: string
  roles: { id: string; nombre: string }[]
  accion: (usuarioId: string, rolId: string) => Promise<ResultadoAccion<void>>
  etiqueta: string
}

export function CambiarRolFila({ usuarioId, clave, rolActual, roles, accion, etiqueta }: Props) {
  const [rol, setRol] = useState(rolActual)
  return (
    <span className="fila">
      <label className="oculto-visual" htmlFor={`rol-${usuarioId}`}>Rol de {etiqueta}</label>
      <select id={`rol-${usuarioId}`} value={rol} onChange={(e) => setRol(e.target.value)} style={{ width: 'auto', minHeight: 36 }} data-testid={`rol-de-${clave}`}>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>{r.nombre}</option>
        ))}
      </select>
      <BotonAccion texto="Cambiar rol" exito="Rol cambiado." accion={() => accion(usuarioId, rol)} testid={`cambiar-rol-${clave}`} />
    </span>
  )
}
