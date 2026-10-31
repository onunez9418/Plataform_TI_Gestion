'use client'
// Vuelve a leer la pantalla actual desde el servidor DESPUÉS de que una acción terminó bien.
// La acción ya pide revalidar, pero a veces la respuesta llega con la lista vieja; este refresco, que se hace
// cuando la acción ya terminó, asegura que lo recién guardado aparezca sin recargar a mano (DEF-FRO-01).
import { useRouter } from 'next/navigation'

export function useRefrescar(): () => void {
  let router: ReturnType<typeof useRouter> | null = null
  try {
    router = useRouter()
  } catch {
    // Fuera de la aplicación (pruebas de componentes): no hay a quién pedirle el refresco.
  }
  return () => router?.refresh()
}
