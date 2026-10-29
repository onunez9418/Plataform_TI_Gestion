// Formatos de pantalla: fechas en hora de Lima, números con separador de miles.
const ZONA = 'America/Lima'

export function fechaHora(iso: string | null | undefined): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short', timeZone: ZONA }).format(d)
}

export function fecha(iso: string | null | undefined): string {
  if (!iso) return '-'
  // Una fecha sin hora (2026-10-29) no se desplaza por la zona horaria.
  const solo = /^\d{4}-\d{2}-\d{2}$/.test(iso)
  const d = new Date(solo ? `${iso}T12:00:00` : iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeZone: solo ? undefined : ZONA }).format(d)
}

export function numero(n: number): string {
  return new Intl.NumberFormat('es-PE').format(n)
}
