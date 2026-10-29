// Middleware de Next.js: corre antes de cada petición. Hoy solo protege MODO_LOCAL contra «DNS rebinding»
// (H-SEG-L02): rechaza toda petición cuyo `Host` no sea localhost:<puerto> o 127.0.0.1:<puerto>.
import { NextResponse, type NextRequest } from 'next/server'
import { evaluarHost, MENSAJE_HOST_RECHAZADO } from '@/nucleo/acceso/host-local'

export function middleware(peticion: NextRequest): NextResponse {
  const decision = evaluarHost({
    host: peticion.headers.get('host'),
    xForwardedHost: peticion.headers.get('x-forwarded-host'),
    ruta: peticion.nextUrl.pathname,
  })
  if (decision.permitido) return NextResponse.next()
  // 421 = «petición dirigida a un destino equivocado». No se repite el valor recibido en la respuesta.
  return new NextResponse(MENSAJE_HOST_RECHAZADO, {
    status: 421,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  })
}

export const config = { matcher: '/:path*' }
