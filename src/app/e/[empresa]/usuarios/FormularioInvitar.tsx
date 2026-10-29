'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Campo, Formulario } from '@/componentes/ui/Formulario'
import { Aviso } from '@/componentes/ui/Piezas'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

type Props = {
  roles: { id: string; nombre: string }[]
  accion: (datos: FormData) => Promise<ResultadoAccion<{ ruta?: string }>>
}

export function FormularioInvitar({ roles, accion }: Props) {
  const [ruta, setRuta] = useState<string | null>(null)
  const [invitado, setInvitado] = useState(false)
  return (
    <>
      <Formulario
        accion={accion}
        enviar="Invitar"
        testid="form-invitar"
        exito="Usuario invitado."
        alExito={(d) => {
          setInvitado(true)
          setRuta((d as { ruta?: string } | undefined)?.ruta ?? null)
        }}
      >
        <div className="fila-form">
          <Campo nombre="nombre" etiqueta="Nombre" requerido testid="campo-nombre" />
          <Campo nombre="correo" etiqueta="Correo" tipo="email" requerido testid="campo-correo" placeholder="persona@alfa.local" />
          <Campo
            nombre="rolId"
            etiqueta="Rol"
            tipo="select"
            requerido
            opciones={roles.map((r) => ({ valor: r.id, etiqueta: r.nombre }))}
            testid="campo-rol"
          />
        </div>
      </Formulario>
      {invitado ? (
        <div style={{ marginTop: 'var(--e4)' }}>
          {ruta ? (
            <Aviso tipo="exito" titulo="Enlace de ingreso de la persona invitada" testid="aviso-enlace-invitado">
              <p>En la versión local no se envía correo. Entregue este enlace a la persona (sirve una sola vez):</p>
              <p><Link className="btn primario" href={ruta} data-testid="enlace-invitado">Abrir el enlace</Link></p>
              <p className="enlace-local" data-testid="texto-enlace-invitado">{ruta}</p>
            </Aviso>
          ) : null}
        </div>
      ) : null}
    </>
  )
}
