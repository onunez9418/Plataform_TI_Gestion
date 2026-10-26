# ADR-01 · Ejecución continua, trabajador y base gestionada (T-1)

**Estado:** Propuesto · **Decide:** Gerente de TI · **Base:** D-038, D-055 T-1, `plan-entornos-y-costos.md` §2

## Contexto
Catorce módulos necesitan procesos sin intervención de nadie (avisos diarios, reintentos de correo, importaciones, exportaciones de hasta 50.000 filas, PDF). D-025 decía "sin colas"; D-038 lo reemplazó. Un alojamiento que apaga el programa a los pocos segundos de cada petición no puede sostener eso.

## Opciones
1. **Funciones sin servidor** (tiempo límite de segundos). Descartada: no hay dónde correr el trabajador.
2. **Servidor virtual administrado por nosotros.** Descartada: costo de operación y parches recae en un equipo pequeño.
3. **Servicio de contenedores de ejecución continua + PostgreSQL gestionado** con agrupador de conexiones. Elegida.

## Decisión
- **Una sola imagen de contenedor** (Next.js en modo `standalone`) que arranca como **dos servicios**: `web` y `trabajador`. Se publican juntos, nunca solos. Reiniciar uno no detiene al otro.
- **PostgreSQL gestionado** con respaldos. La web entra por el **agrupador de conexiones en modo transacción**; el trabajador entra por **conexión directa** (`WORKER_DATABASE_URL`) porque las librerías de cola suelen escuchar avisos de la base, función que el modo transacción no admite. Ambos usan el rol `app_empresa` (ADR-04) y fijan la empresa dentro de cada transacción (ADR-03).
- **Una instancia de trabajador al inicio.** Se permiten varias (la cola bloquea cada trabajo); el programador diario es único por clave (ADR-02), así que arrancar dos no duplica.
- **Migraciones** como paso de publicación con el rol `migraciones` (que no existe en la aplicación en marcha), con regla "ampliar y luego limpiar" para convivir con la versión anterior durante el cambio.
- Puntos de salud: `/salud` (web) y latido del trabajador cada minuto. Apagado ordenado: termina o devuelve el trabajo en curso en pocos segundos.
- El proveedor concreto lo propone DevOps con **precios verificados** (no se asume Vercel). Debe pasar las 9 comprobaciones del día 0 (`plan-entornos-y-costos.md` §10).

## Consecuencias
- El trabajador es una pieza de alojamiento más: costo ya incluido en D2. **No agrega gasto nuevo** a lo escalado.
- La web no puede depender de estado en memoria (puede haber más de una instancia): sesiones y límites viven en la base.
- La web debe tolerar el agrupador: sin sentencias preparadas de sesión, sin `SET` de sesión; solo `set_config(..., true)` por transacción (ADR-03).
- Si ningún candidato permite crear roles sin BYPASSRLS ni funciones SECURITY DEFINER, se vuelve a mesa (prototipo, riesgo #18).

## Qué prueba lo valida
- Día 0 de DevOps (9 comprobaciones) y las pruebas H1, H7 del prototipo (`prototipo-tecnico.md`).
- Matar el trabajador a mitad de un trabajo: se completa una sola vez al reiniciar.
- Guardas de arranque en producción (reloj de prueba, correo en captura, llave de relleno) con una prueba por guarda.
