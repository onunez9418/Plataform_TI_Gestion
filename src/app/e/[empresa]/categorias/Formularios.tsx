'use client'
// Formularios de categoría. Cada alta correcta reinicia el editor de campos (por la llave `version`).
import { useState } from 'react'
import { Campo, Formulario } from '@/componentes/ui/Formulario'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'
import { EditorCampos } from './EditorCampos'

export function FormularioCategoria({ accion }: { accion: (datos: FormData) => Promise<ResultadoAccion<unknown>> }) {
  const [version, setVersion] = useState(0)
  return (
    <Formulario accion={accion} enviar="Crear categoría" testid="form-crear-categoria" exito="Categoría creada." alExito={() => setVersion((v) => v + 1)}>
      <div className="fila-form">
        <Campo nombre="nombre" etiqueta="Nombre de la categoría" requerido testid="campo-nombre-categoria" placeholder="Impresoras" />
        <Campo nombre="prefijo" etiqueta="Prefijo del código" requerido testid="campo-prefijo" placeholder="IMP" ayuda="Letras para el código automático de los SKU (IMP-0001)." />
      </div>
      <EditorCampos key={version} prefijoId="campo-def" />
    </Formulario>
  )
}

export function FormularioAgregarCampo({ categoriaId, nombreCategoria, accion }: { categoriaId: string; nombreCategoria: string; accion: (datos: FormData) => Promise<ResultadoAccion<unknown>> }) {
  const [version, setVersion] = useState(0)
  return (
    <Formulario accion={accion} enviar="Agregar el campo" testid={`form-agregar-campo-${nombreCategoria}`} exito="Campo agregado." alExito={() => setVersion((v) => v + 1)}>
      <EditorCampos key={version} unico prefijoId={`nuevo-campo-${categoriaId}`} />
    </Formulario>
  )
}
