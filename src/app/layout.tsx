import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@/estilos/globales.css'
import { SCRIPT_TEMA } from '@/componentes/ui/Tema'
import { Franja } from '@/componentes/estructura/Franja'

// La franja de versión local depende del entorno en que corre, no del momento de compilar.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Plataforma de TI · Versión local de prueba',
  description: 'Gestión de áreas de TI. Versión local 0.1 con datos inventados.',
}

export default function LayoutRaiz({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-tema="claro" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>
        <a className="saltar" href="#contenido">Saltar al contenido</a>
        <Franja />
        {children}
      </body>
    </html>
  )
}
