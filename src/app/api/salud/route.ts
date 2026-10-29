// Ruta de salud: dice si la aplicación está viva. No toca la base de datos ni devuelve datos de nadie.
// La usan iniciar.bat, el healthcheck de Docker y la integración continua.
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ estado: 'ok', servicio: 'plataforma-ti', version: '0.1.0' });
}
