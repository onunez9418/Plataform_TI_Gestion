import { Etiqueta, type FamiliaEstado } from './Piezas'

export const ESTADOS_ORDEN: Record<string, { texto: string; familia: FamiliaEstado }> = {
  borrador: { texto: 'Borrador', familia: 'neutro' },
  por_aprobar: { texto: 'Por aprobar', familia: 'atencion' },
  aprobada: { texto: 'Aprobada', familia: 'exito' },
  rechazada: { texto: 'Rechazada', familia: 'alerta' },
  recibida_parcial: { texto: 'Recibida en parte', familia: 'curso' },
  recibida: { texto: 'Recibida', familia: 'final' },
}

/** Estado de la orden: palabra + icono, nunca solo color. */
export function EstadoOrden({ estado }: { estado: string }) {
  const e = ESTADOS_ORDEN[estado] ?? { texto: estado, familia: 'neutro' as FamiliaEstado }
  return <Etiqueta texto={e.texto} familia={e.familia} testid={`estado-orden-${estado}`} />
}
