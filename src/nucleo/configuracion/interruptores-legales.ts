// Interruptores legales de D-118. Todo lo que depende de la ley nace APAGADO y nada lo enciende:
// no se leen de variables de entorno, ni de la base, ni de la pantalla. Encender uno es un cambio de
// código con visto bueno del Gerente de TI y del CEO, cuando el abogado lo permita.

export const NOMBRES_INTERRUPTORES_LEGALES = [
  'legal.borrado_automatico',
  'legal.anonimizacion',
  'legal.purga_auditoria',
  'legal.asistente_texto_libre',
  'legal.asistente_con_datos_reales',
  'legal.envio_a_proveedores_con_datos_reales',
] as const

export type InterruptorLegal = (typeof NOMBRES_INTERRUPTORES_LEGALES)[number]

const VALORES: Readonly<Record<InterruptorLegal, boolean>> = Object.freeze({
  'legal.borrado_automatico': false,
  'legal.anonimizacion': false,
  'legal.purga_auditoria': false,
  'legal.asistente_texto_libre': false,
  'legal.asistente_con_datos_reales': false,
  'legal.envio_a_proveedores_con_datos_reales': false,
})

/** ¿Está encendido este interruptor legal? En la versión local 0.1 la respuesta es siempre «no». */
export function interruptorLegalActivo(nombre: InterruptorLegal): boolean {
  return VALORES[nombre] === true
}

export function interruptoresLegales(): Readonly<Record<InterruptorLegal, boolean>> {
  return { ...VALORES }
}
