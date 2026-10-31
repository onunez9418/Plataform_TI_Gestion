'use client'
// Vuelve a leer la pantalla actual desde el servidor DESPUÉS de que una acción terminó bien.
// La acción ya pide revalidar, pero a veces la lista nueva llegaba al navegador y no se pintaba (DEF-FRO-01):
// el refresco se hacía mientras la acción seguía "en curso" dentro de la misma transición de React y las dos
// actualizaciones se pisaban. Por eso el refresco se programa un instante después, ya fuera de esa transición
// y sin depender de que el componente siga en pantalla (algunos formularios se reinician y se vuelven a montar).
import { startTransition } from 'react'
import { useRouter } from 'next/navigation'

const ESPERA_MS = 120

export function useRefrescar(): () => void {
  let router: ReturnType<typeof useRouter> | null = null
  try {
    router = useRouter()
  } catch {
    // Fuera de la aplicación (pruebas de componentes): no hay a quién pedirle el refresco.
  }
  return () => {
    if (!router) return
    const r = router
    setTimeout(() => startTransition(() => r.refresh()), ESPERA_MS)
  }
}
