# ADR-01 · Ejecución continua, trabajador, consola aparte y base gestionada (T-1)

**Estado:** Propuesto (revisado 2026-10-29 tras Seguridad ronda 5) · **Decide:** Gerente de TI · **Base:** D-038, D-055 T-1, `plan-entornos-y-costos.md` §2 y §6; H-SEG-42, 50; D06-3

## Contexto
Catorce módulos necesitan procesos sin intervención de nadie (avisos diarios, reintentos de correo, importaciones, exportaciones de hasta 50.000 filas, PDF). D-025 decía "sin colas"; D-038 lo reemplazó. Un alojamiento que apaga el programa a los pocos segundos de cada petición no puede sostener eso. Además, la consola de plataforma no puede compartir proceso ni credenciales con la parte que usan las empresas.

## Opciones
1. **Funciones sin servidor** (tiempo límite de segundos). Descartada: no hay dónde correr el trabajador.
2. **Servidor virtual administrado por nosotros.** Descartada: costo de operación y parches recae en un equipo pequeño.
3. **Servicio de contenedores de ejecución continua + PostgreSQL gestionado** con agrupador de conexiones. Elegida.

## Decisión
- **Una sola imagen de contenedor** (Next.js en modo `standalone`) que arranca como **tres servicios**, elegidos por la variable `DESPLIEGUE` ∈ `web | trabajador | consola` (H-SEG-42, **propuesta, a ratificar por el Gerente**): `web` (las empresas), `trabajador` (cola, programador, correos, importaciones, exportaciones, PDF) y `consola` (plataforma y soporte, en una dirección propia y con red restringida). Se publican juntos, nunca solos. Reiniciar uno no detiene a los otros. La ruta `plataforma/` solo existe en `consola`; en `web` responde "no encontrado".
- **Qué credencial tiene cada proceso** (Seguridad, H-SEG-42). La guarda de arranque se niega a iniciar un proceso que tenga una variable que no le corresponde, y una prueba lo comprueba:

| Proceso | Tiene | No tiene |
|---|---|---|
| `web` | `DATABASE_URL` (cuenta `app_empresa_web`, por el agrupador), `MASTER_ENCRYPTION_KEY`, `ANON_REGISTRY_*`, clave del modelo de IA si el asistente está activo (ADR-22), techo del tope global del asistente (ADR-22) | `WORKER_DATABASE_URL`, `PLATFORM_*`, `SOPORTE_*`, `MIGRATION_*`, `MAINTENANCE_*`, `AUDIT_READER_*` |
| `trabajador` | `WORKER_DATABASE_URL` (cuenta `app_empresa_trabajador`, conexión directa; solo esta cuenta puede emitir valores de entrada, ADR-04 y ADR-08), `MASTER_ENCRYPTION_KEY`, credenciales del proveedor de correo, `ANON_REGISTRY_*` | `DATABASE_URL`, `PLATFORM_*`, `SOPORTE_*`, `MIGRATION_*`, `MAINTENANCE_*`, `AUDIT_READER_*` |
| `consola` | `PLATFORM_DATABASE_URL` (`app_plataforma`) y `SOPORTE_DATABASE_URL` (`app_soporte`) | `DATABASE_URL`, **`MASTER_ENCRYPTION_KEY`**, `MIGRATION_*`, `MAINTENANCE_*`, `AUDIT_READER_*` |
| paso de publicación | `MIGRATION_*` (rol `migraciones`) | todo lo demás |
| tarea programada de mantenimiento (purga y creación mensual de particiones de auditoría, ADR-11) | `MAINTENANCE_*`, `ANON_REGISTRY_*` (solo agregar) | todo lo demás |
| tarea programada de copia externa | `AUDIT_READER_*`, `AUDIT_COPY_*` (solo agregar), la derivación `auditoria_copia` | todo lo demás |

  Las dos tareas programadas usan la misma imagen con otro comando; DevOps confirma que el proveedor ofrece tareas programadas (si no, se ejecutan como procesos de corta vida del `trabajador` con sus credenciales y se anota el riesgo residual).
- **PostgreSQL gestionado, versión 15 o superior** (recomendada 16 o 17; ADR-06) con respaldos. La web entra por el **agrupador de conexiones en modo transacción**; el trabajador entra por **conexión directa** (`WORKER_DATABASE_URL`) porque las librerías de cola suelen escuchar avisos de la base, función que el modo transacción no admite. Ambos usan el rol de grupo `app_empresa` (ADR-04), pero con **cuentas de ingreso distintas** (`app_empresa_web` y `app_empresa_trabajador`; propuesta, a ratificar por el Gerente, H-SEG-46) y fijan la empresa dentro de cada transacción (ADR-03).
- **Cabeceras de seguridad en toda respuesta** (H-SEG-50; DevOps las aplica en el despliegue y una prueba de integración continua las comprueba en cada ruta tipo): `Content-Security-Policy` sin scripts embebidos salvo con *nonce* por petición (`default-src 'self'; base-uri 'none'; form-action 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data:`), `Strict-Transport-Security` (un año, `includeSubDomains`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy` mínima. En la página del botón "Entrar" y en las descargas: `Referrer-Policy: no-referrer` y `Cache-Control: no-store`. Cumple RS-42 y RS-47. El *nonce* obliga a generar la página en cada petición, lo que ya ocurre porque todas dependen de la sesión. Las cookies están en ADR-08.
- **CORS cerrado por defecto (H-SEG-78 punto 5).** Ninguna ruta, incluida la API pública con claves de integración, envía cabeceras `Access-Control-Allow-*`: las integraciones llaman de servidor a servidor. Abrir un origen exige una decisión del módulo de Integraciones y API (con ADR). Una prueba de integración continua comprueba que ninguna respuesta las lleva y que una petición `OPTIONS` desde otro origen no recibe permiso.
- **Salidas de red permitidas por proceso (H-SEG-70, pedido a DevOps):** `web` solo al proveedor de IA y a los servicios que ya usa; `trabajador` al proveedor de correo, a Microsoft (las dos direcciones fijas de ADR-21) y a los almacenes externos; `consola` a nada fuera de la plataforma. El trabajador es el **único** proceso que sale a Microsoft; la lista la aplica el alojamiento.
- **Una instancia de trabajador al inicio.** Se permiten varias (la cola bloquea cada trabajo); el programador diario es único por clave (ADR-02), así que arrancar dos no duplica.
- **Migraciones** como paso de publicación con el rol `migraciones` (que no existe en la aplicación en marcha), con regla "ampliar y luego limpiar" para convivir con la versión anterior durante el cambio.
- Puntos de salud: `/salud` (web y consola) y latido del trabajador cada minuto. Apagado ordenado: termina o devuelve el trabajo en curso en pocos segundos.
- El proveedor concreto lo propone DevOps con **precios verificados** (no se asume Vercel). Debe pasar las 9 comprobaciones del día 0 (`plan-entornos-y-costos.md` §10).

## Consecuencias
- El trabajador es una pieza de alojamiento más: costo ya incluido en D2. **No agrega gasto nuevo** a lo escalado.
- **[ESCALAR AL CEO] Costo posible de la consola aparte:** un tercer servicio de ejecución continua y las dos tareas programadas pueden sumar un gasto mensual pequeño que **no** estaba en lo escalado en D2. Sin cifras: DevOps lo mide con precios verificados. La consola se usa poco y puede correr en el tamaño mínimo del proveedor. **El diseño no cambia por el costo** (Seguridad); si el CEO no lo aprobara, la alternativa degradada es dejar la consola como ruta del mismo servicio `web` con credenciales de plataforma, lo que Seguridad considera una pérdida real de aislamiento (una vulnerabilidad en la parte pública alcanzaría la credencial de plataforma).
- La web no puede depender de estado en memoria (puede haber más de una instancia): sesiones y límites viven en la base.
- La web debe tolerar el agrupador: sin sentencias preparadas de sesión, sin `SET` de sesión; solo `set_config(..., true)` por transacción (ADR-03).
- Si ningún candidato permite crear roles sin BYPASSRLS ni funciones SECURITY DEFINER, se vuelve a mesa (prototipo, riesgo #18).

## Qué prueba lo valida
- Día 0 de DevOps (9 comprobaciones) y las pruebas H1, H7 del prototipo (`prototipo-tecnico.md`).
- Matar el trabajador a mitad de un trabajo: se completa una sola vez al reiniciar.
- Guardas de arranque en producción (reloj de prueba, correo en captura, llave de relleno) con una prueba por guarda, **más**: el proceso `web` no contiene `PLATFORM_*`, `SOPORTE_*` ni `WORKER_DATABASE_URL`; el proceso `consola` no contiene `DATABASE_URL` ni `MASTER_ENCRYPTION_KEY`; ningún proceso en marcha contiene `MIGRATION_*`.
- Prueba de cabeceras y de cookies en integración continua.

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| H-SEG-42 | **Propuesta, a ratificar por el Gerente:** tres despliegues y credenciales por proceso. Posible costo marcado **[ESCALAR AL CEO]** sin cifras. Añadí que la consola tampoco recibe la maestra (condición 3 de la ronda 4). |
| H-SEG-50 | Incorporado: cabeceras de seguridad aquí; cookies en ADR-08. |
| D06-3 | PostgreSQL 15 o superior. |
| H-SEG-43 / D11-3 | La copia externa y la purga corren como tareas programadas con sus propias credenciales. |

## Qué cambió tras la ronda 6 (2026-10-29, Seguridad `ronda6-seguridad-adr.md`)
| Hallazgo | Qué se hizo |
|---|---|
| H-SEG-46 cond. 1 | **Propuesta, a ratificar por el Gerente:** dos cuentas de base, una por proceso (`app_empresa_web`, `app_empresa_trabajador`); la tabla de credenciales y la guarda de arranque lo reflejan. |
| H-SEG-38 | La tarea de purga pasa a "mantenimiento" e incluye la creación mensual de particiones. |
| H-SEG-70 (5) | Salidas de red por proceso: pedido a DevOps; solo el trabajador sale a Microsoft. |
| H-SEG-78 (5) | CORS cerrado por defecto, con prueba. |
| H-SEG-67 | El techo del tope global del asistente es una variable de publicación de `web`, no un dato de la base (ADR-22 y ADR-23). |
