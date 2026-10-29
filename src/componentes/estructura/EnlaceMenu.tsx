'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/** Enlace del menú: marca la página actual y cierra el menú en pantallas pequeñas. */
export function EnlaceMenu({ href, children, exacto, testid }: { href: string; children: ReactNode; exacto?: boolean; testid?: string }) {
  const ruta = usePathname()
  const activo = exacto ? ruta === href : ruta === href || ruta.startsWith(href + '/')
  return (
    <Link
      href={href}
      aria-current={activo ? 'page' : undefined}
      data-testid={testid}
      onClick={() => document.body.classList.remove('menu-abierto')}
    >
      {children}
    </Link>
  )
}
