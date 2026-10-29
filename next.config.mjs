/** @type {import('next').NextConfig} */

// Cabeceras de seguridad (H-SEG-L04). Se envían en todas las respuestas.
const esDesarrollo = process.env.NODE_ENV !== 'production';

// Política de contenido. Next.js pone pequeños scripts en la propia página para arrancar, por eso
// 'unsafe-inline' en scripts (sin él la aplicación no carga). Se descarta todo lo que venga de fuera:
// nada de marcos ajenos, ni objetos, ni formularios que envíen a otro sitio.
// 'unsafe-eval' y el websocket solo se permiten con "npm run dev" (recarga en caliente).
const politicaContenido = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${esDesarrollo ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${esDesarrollo ? ' ws: wss:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const cabecerasSeguridad = [
  { key: 'Content-Security-Policy', value: politicaContenido },
  // Para navegadores que no entienden frame-ancestors: nadie puede incrustar la aplicación en un marco.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // El enlace de ingreso lleva un token en la dirección: no se debe filtrar hacia otros sitios.
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
];

const configuracion = {
  reactStrictMode: true,
  // No se anuncia la tecnología del servidor en las respuestas.
  poweredByHeader: false,
  // Las pantallas se arman con datos de la base en cada petición, no en la compilación.
  // (La imagen de Docker compila sin base de datos.)
  async headers() {
    return [{ source: '/:path*', headers: cabecerasSeguridad }];
  },
};

export default configuracion;
