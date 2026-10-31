'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Campo, Formulario } from '@/componentes/ui/Formulario'
import { Aviso } from '@/componentes/ui/Piezas'
import { pedirEnlace, type DatosPedirEnlace } from './acciones'

export function FormularioEntrar({ correoInicial }: { correoInicial?: string }) {
  const [respuesta, setRespuesta] = useState<DatosPedirEnlace | null>(null)

  return (
    <>
      <Formulario
        accion={pedirEnlace}
        enviar="Pedir mi enlace"
        testid="form-entrar"
        testidEnviar="boton-pedir-enlace"
        limpiar={false}
        recargar={false}
        tituloError="No se pudo entrar"
        alExito={(d) => setRespuesta((d as DatosPedirEnlace) ?? {})}
      >
        <Campo nombre="correo" etiqueta="Su correo" tipo="email" requerido valorInicial={correoInicial} testid="campo-correo" placeholder="ceo@demo.local" />
      </Formulario>

      {respuesta ? (
        respuesta.ruta ? (
          <div style={{ marginTop: 'var(--e4)' }}>
            <Aviso tipo="exito" titulo="Enlace de ingreso generado" testid="aviso-enlace">
              <p>
                En la versión local no se envía correo: el enlace aparece aquí. Ábralo y pulse el botón «Entrar».
              </p>
              <p className="chica">
                Si escribió mal el correo, el enlace no servirá: compruebe que sea uno de los de la pantalla de inicio o el de una persona invitada.
              </p>
              <p>
                <Link className="btn primario" href={respuesta.ruta} data-testid="enlace-ingreso">Abrir mi enlace</Link>
              </p>
              <p className="enlace-local" data-testid="texto-enlace">{respuesta.ruta}</p>
            </Aviso>
          </div>
        ) : (
          <div style={{ marginTop: 'var(--e4)' }}>
            <Aviso tipo="info" titulo="Listo" testid="aviso-sin-enlace">
              <p className="sin-margen">
                Si ese correo está registrado, se genera un enlace. Si no ve ninguno, revise que escribió uno de los correos de la
                pantalla de inicio.
              </p>
            </Aviso>
          </div>
        )
      ) : null}
    </>
  )
}
