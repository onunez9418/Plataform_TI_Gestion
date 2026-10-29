# ADR-02 · Cola de trabajos en PostgreSQL, eventos, programador y reloj (T-2)

**Estado:** Propuesto (revisado 2026-10-29 tras Seguridad ronda 5 y Datos) · **Decide:** Gerente de TI · **Base:** D-038, D-062.2, D-039.6, RNF-020; H-SEG-44, 46

## Contexto
Hace falta ejecutar trabajos en segundo plano con reintentos, sin agregar Redis ni otro servicio, y un bus de eventos único para que los módulos se avisen sin importarse entre sí.

## Opciones
1. **Redis + BullMQ.** Descartada: pieza nueva y gasto; no hace falta al volumen supuesto.
2. **Cola propia mínima** con `SELECT ... FOR UPDATE SKIP LOCKED`. Plan B.
3. **Librería sobre PostgreSQL** (graphile-worker o pg-boss). Elegida; la librería se escoge en el prototipo (H7).

Criterios de elección: (a) encolar **dentro de la misma transacción** que el cambio de negocio (si el cambio se revierte, no queda trabajo); (b) clave única de trabajo (para el programador); (c) funciona con la conexión directa del trabajador y, para encolar, con el agrupador; (d) reintentos con espera creciente y estado "muerto"; (e) mantenimiento activo y sin vulnerabilidades conocidas. Hipótesis de partida: graphile-worker (función SQL `add_job` y `job_key`).

## Decisión
**Cola.** Esquema propio `cola` (lo crea la librería); es una "infraestructura sin `empresa_id`" de categoría B (ADR-04). `app_empresa` la usa **solo mediante las funciones de la librería** (encolar, tomar, completar, fallar), sin DML libre sobre sus tablas; H7 comprueba que la librería elegida lo permite y, si necesita DML directo, se vuelve a mesa. **Regla:** la carga útil de todo trabajo contiene solo `empresa_id`, tipo e identificadores, validada con un esquema por tipo; nunca datos personales ni secretos ni **valores de entrada**: los correos de acceso, invitación y acceso de emergencia llevan solo el identificador de su fila y el valor nace en el trabajador al enviar (ADR-08, H-SEG-46). Los filtros de una exportación viven en `exportacion_solicitud` (ADR-19), no en la carga. Reintentos con espera creciente; tras N intentos pasa a "muerto" con alarma sin bloquear al resto (webhooks: tope de ~12 h de reintentos según RN-INT-027; correos de acceso: ninguno después de que el enlace venza).

**Errores sin datos personales (H-SEG-44).** El texto de un error puede llevar datos: un error de clave duplicada de PostgreSQL trae el valor en su detalle (por ejemplo el correo duplicado), y las librerías candidatas guardan el error del trabajo fallido en su propia tabla (`last_error` en graphile-worker, `output` en pg-boss), que es global, sin seguridad por fila y viaja a los respaldos y al monitor. Un **envoltorio único** en `nucleo/cola` (y el mismo en `nucleo/observabilidad`, ADR-20) **normaliza todo error a tipo, código y mensaje fijo** y descarta `detail`, `where` y los parámetros antes de guardarlo, de escribirlo en `corrida_diaria.resultado` o de enviarlo al monitor.

**Todo trabajo** se ejecuta con `ejecutarComoEmpresa(empresaId, fn)`: abre la transacción, fija la empresa (ADR-03), salta empresas suspendidas, calcula "hoy" con `hoyEnEmpresa()` y es **idempotente** (correrlo dos veces no duplica; se apoya en claves únicas de origen).

**Programador único.** Un trabajo `programador` corre cada minuto (clave única) y, para cada empresa activa (función DEFINER `empresas_activas()`), encola `diario:<tarea>:<empresa>:<fecha_lógica>` con clave única. Tabla `corrida_diaria(empresa, tarea, fecha_logica, estado, resultado)` con seguridad por fila. Al arrancar procesa los días pendientes en orden: no se pierde un aviso por una caída.

**Eventos.** Tabla `evento_dominio(empresa_id, id, tipo, entidad_tipo, entidad_id, datos, creado_en)` con tipos `<módulo>.<entidad>_<hecho>` definidos en un catálogo en código (la tabla global `tipo_evento` se llena desde él al publicar). Datos del evento: solo identificadores.
- Lo que **protege la integridad** (liberar puestos, cerrar asignaciones, bloquear una anonimización) corre **síncrono en la misma transacción** mediante `emitir()` y escuchas síncronas registradas.
- Lo que es **aviso o espejo** (correo, webhook, elemento derivado de CMDB) lo toma el trabajo `despachar_eventos` por empresa (patrón de bandeja de salida), con entrega idempotente por `(evento, consumidor)`.

**Reloj.** Única función `reloj.ahora()`. Solo en desarrollo y pruebas lee un valor fijable guardado en `reloj_prueba` (tabla creada por el guion de pruebas, **no por migración**), de modo que web y trabajador ven el mismo reloj. Disparador manual `/api/pruebas/disparar` protegido con `CRON_SECRET`, inexistente en producción (responde "no encontrado"); la aplicación se niega a arrancar en producción si encuentra el reloj de prueba.

## Consecuencias
- Un solo mecanismo; nadie crea temporizadores sueltos.
- La cola tiene su propio esquema sin seguridad por fila; el riesgo es una carga útil o un error con datos: lo cubren el esquema por tipo, el envoltorio de errores y una prueba que busca el nombre canario en la cola.
- Los módulos de integración (ADR-21) y el asistente (ADR-22) usan esta misma cola y estas mismas reglas; no abren hilos propios.
- Las versiones de la web y del trabajador conviven un momento: los trabajos deben seguir siendo comprensibles por ambas versiones.

## Qué prueba lo valida
- H7: `kill -9` al trabajador a mitad de un trabajo, se completa una sola vez; dos trabajadores, una sola corrida diaria por empresa y día; trabajo "envenenado" llega a muerto con alarma; encolar y revertir no deja trabajo.
- Prueba por módulo: ejecutar el proceso con dos empresas y comprobar que cada aviso, registro y destinatario queda en la suya; empresa suspendida se salta.
- Prueba de arquitectura: ningún módulo importa la librería de cola; todos usan `nucleo/cola`.
- Prueba de que producción no contiene `reloj_prueba` ni la ruta del disparador.
- **Error con dato personal (H-SEG-44):** se provoca una violación de clave única con un correo canario dentro de un trabajo y en una petición, y se busca en `cola.*`, en `corrida_diaria.resultado`, en el registro y en el monitor simulado: no aparece.

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| H-SEG-44 | Incorporado: envoltorio de errores, `app_empresa` sin DML libre sobre `cola`, prueba con correo canario. |
| H-SEG-46 | Incorporado: la carga útil no admite valores de entrada; el valor nace en el trabajador. |
| H-SEG-55 | Incorporado: los filtros de exportación no viajan en la carga. |
| D04-1 | `cola` queda como categoría B (infraestructura) de ADR-04, no como "tabla global" número 18. |
