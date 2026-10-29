import { Etiqueta, type FamiliaEstado } from './Piezas'

const ESTADOS: Record<string, { texto: string; familia: FamiliaEstado }> = {
  en_stock: { texto: 'En stock', familia: 'exito' },
  asignado: { texto: 'Asignado', familia: 'curso' },
  en_reparacion: { texto: 'En reparación', familia: 'atencion' },
  extraviado: { texto: 'Extraviado', familia: 'alerta' },
  de_baja: { texto: 'De baja', familia: 'final' },
}

export const OPCIONES_ESTADO = Object.entries(ESTADOS).map(([valor, e]) => ({ valor, etiqueta: e.texto }))

/** Estado del activo: palabra + icono, nunca solo color. */
export function EstadoActivo({ estado }: { estado: string }) {
  const e = ESTADOS[estado] ?? { texto: estado, familia: 'neutro' as FamiliaEstado }
  return <Etiqueta texto={e.texto} familia={e.familia} testid={`estado-${estado}`} />
}
