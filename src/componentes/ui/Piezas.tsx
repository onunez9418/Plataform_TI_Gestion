// Piezas de presentación reutilizables (sin lógica de negocio).
import type { ReactNode } from 'react'
import { Icono, type NombreIcono } from './Icono'

export type FamiliaEstado = 'neutro' | 'curso' | 'atencion' | 'exito' | 'alerta' | 'final' | 'sensible'

const ICONO_FAMILIA: Record<FamiliaEstado, NombreIcono> = {
  neutro: 'circulo', curso: 'reloj', atencion: 'alerta', exito: 'check', alerta: 'prohibido', final: 'circulo', sensible: 'candado',
}

/** Etiqueta de estado: siempre una palabra y un icono, nunca solo color. */
export function Etiqueta({ texto, familia = 'neutro', testid }: { texto: string; familia?: FamiliaEstado; testid?: string }) {
  return (
    <span className={`chip s-${familia}`} data-testid={testid}>
      <Icono nombre={ICONO_FAMILIA[familia]} />
      {texto}
    </span>
  )
}

export function Aviso({ tipo = 'info', titulo, children, testid }: {
  tipo?: 'info' | 'atencion' | 'exito' | 'alerta' | 'sensible'; titulo?: string; children?: ReactNode; testid?: string
}) {
  const icono: NombreIcono = tipo === 'exito' ? 'check' : tipo === 'alerta' ? 'alerta' : tipo === 'sensible' ? 'candado' : 'info'
  return (
    <div className={`aviso ${tipo}`} role={tipo === 'alerta' ? 'alert' : 'status'} data-testid={testid}>
      <Icono nombre={icono} />
      <div className="cuerpo-aviso">
        {titulo ? <strong>{titulo}</strong> : null}
        {children}
      </div>
    </div>
  )
}

export function Vacio({ titulo, texto, children }: { titulo: string; texto?: string; children?: ReactNode }) {
  return (
    <div className="vacio" role="status" data-testid="estado-vacio">
      <Icono nombre="buscar" />
      <h3>{titulo}</h3>
      {texto ? <p className="suave">{texto}</p> : null}
      {children}
    </div>
  )
}

export function CabeceraPantalla({ titulo, descripcion, acciones }: { titulo: string; descripcion?: string; acciones?: ReactNode }) {
  return (
    <div className="cabecera-pantalla">
      <div>
        <h1 tabIndex={-1}>{titulo}</h1>
        {descripcion ? <p className="suave sin-margen">{descripcion}</p> : null}
      </div>
      {acciones ? <div className="acciones">{acciones}</div> : null}
    </div>
  )
}

/** Bloque plegable para formularios de alta («Crear ...»). */
export function Crear({ titulo, children, testid, abierto }: { titulo: string; children: ReactNode; testid?: string; abierto?: boolean }) {
  return (
    <details className="crear" open={abierto} data-testid={testid}>
      <summary data-testid={testid ? `${testid}-abrir` : undefined}>{titulo}</summary>
      <div className="cuerpo-crear">{children}</div>
    </details>
  )
}

/** Mensaje claro cuando el servidor rechaza cargar una pantalla (sin permiso, sin acceso, etc.). */
export function ErrorDePantalla({ mensaje, codigo }: { mensaje: string; codigo?: string }) {
  const sinPermiso = codigo === 'SIN_PERMISO' || codigo === 'SIN_ACCESO'
  return (
    <Aviso tipo={sinPermiso ? 'atencion' : 'alerta'} titulo={sinPermiso ? 'No tiene permiso para ver esto' : 'No se pudo cargar la pantalla'} testid="error-pantalla">
      <p className="sin-margen">{mensaje}</p>
    </Aviso>
  )
}
