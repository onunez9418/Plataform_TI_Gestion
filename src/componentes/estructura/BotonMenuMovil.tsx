'use client'
import { useState } from 'react'
import { Icono } from '@/componentes/ui/Icono'

export function BotonMenuMovil() {
  const [abierto, setAbierto] = useState(false)
  function alternar() {
    const nuevo = !abierto
    document.body.classList.toggle('menu-abierto', nuevo)
    setAbierto(nuevo)
  }
  return (
    <button type="button" className="btn-barra btn-menu-movil" onClick={alternar} aria-expanded={abierto} aria-label="Abrir o cerrar el menú" data-testid="boton-menu">
      <Icono nombre="menu" />
    </button>
  )
}

export function VeloMenu() {
  return <div className="velo-menu" onClick={() => document.body.classList.remove('menu-abierto')} aria-hidden="true" />
}
