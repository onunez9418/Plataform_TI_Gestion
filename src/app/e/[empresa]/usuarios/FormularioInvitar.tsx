'use client'
import { Campo, Formulario } from '@/componentes/ui/Formulario'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

type Props = {
  roles: { id: string; nombre: string }[]
  accion: (datos: FormData) => Promise<ResultadoAccion<{ ruta?: string }>>
}

export function FormularioInvitar({ roles, accion }: Props) {
  return (
    <Formulario
      accion={accion}
      enviar="Invitar"
      testid="form-invitar"
      mensajeExito={(d) => {
        const ruta = (d as { ruta?: string } | undefined)?.ruta
        return ruta
          ? {
              texto: 'Usuario invitado. En la versión local no se envía correo: entregue este enlace a la persona (sirve una sola vez).',
              testid: 'aviso-enlace-invitado',
              enlace: { ruta, texto: 'Abrir el enlace', testid: 'enlace-invitado', verRuta: { texto: ruta, testid: 'texto-enlace-invitado' } },
            }
          : { texto: 'Usuario invitado.' }
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
  )
}
