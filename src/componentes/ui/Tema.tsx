'use client'
// Alterna modo claro / oscuro. Recuerda la elección en el navegador (si no puede, funciona igual).
import { useEffect, useState } from 'react'
import { Icono } from './Icono'

export function CambiarTema() {
  const [oscuro, setOscuro] = useState(false)
  useEffect(() => {
    setOscuro(document.documentElement.getAttribute('data-tema') === 'oscuro')
  }, [])
  function alternar() {
    const siguiente = oscuro ? 'claro' : 'oscuro'
    document.documentElement.setAttribute('data-tema', siguiente)
    try { localStorage.setItem('tema', siguiente) } catch { /* sin almacenamiento: no se recuerda */ }
    setOscuro(!oscuro)
  }
  return (
    <button type="button" className="btn-barra" onClick={alternar} aria-pressed={oscuro} data-testid="cambiar-tema">
      <Icono nombre={oscuro ? 'sol' : 'luna'} />
      <span className="etq">{oscuro ? 'Modo claro' : 'Modo oscuro'}</span>
    </button>
  )
}

/** Script mínimo que aplica el tema guardado antes de pintar (evita el parpadeo). */
export const SCRIPT_TEMA = `try{var t=localStorage.getItem('tema');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'oscuro':'claro'}document.documentElement.setAttribute('data-tema',t)}catch(e){}`
