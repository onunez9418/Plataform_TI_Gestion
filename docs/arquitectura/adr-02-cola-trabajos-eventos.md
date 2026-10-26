# ADR-02 · Cola de trabajos en PostgreSQL, eventos, programador y reloj (T-2)

**Estado:** Propuesto · **Decide:** Gerente de TI · **Base:** D-038, D-062.2, D-039.6, RNF-020

## Contexto
Hace falta ejecutar trabajos en segundo plano con reintentos, sin agregar Redis ni otro servicio, y un bus de eventos único para que los módulos se avisen sin importarse entre sí.

## Opciones
1. **Redis + BullMQ.** Descartada: pieza nueva y gasto; no hace falta al volumen supuesto.
2. **Cola propia mínima** con `SELECT ... FOR UPDATE SKIP LOCKED`. Plan B.
3. **Librería sobre PostgreSQL** (graphile-worker o pg-boss). Elegida; la librería se escoge en el prototipo (H7).

Criterios de elección: (a) encolar **dentro de la misma transacción** que el cambio de negocio (si el cambio se revierte, no queda trabajo); (b) clave única de trabajo (para el programador); (c) funciona con la conexión directa del trabajador y, para encolar, con el agrupador; (d) reintentos con espera creciente y estado "muerto"; (e) mantenimiento activo y sin vulnerabilidades conocidas. Hipótesis de partida: graphile-worker (función SQL `add_job` y `job_key`).

## Decisión
**Cola.** Esquema propio `cola` (lo crea la librería) con su permiso para `app_empresa`; es la única "tabla global de infraestructura" (ADR-04). **Regla:** la carga útil de todo trabajo contiene solo `empresa_id`, tipo e identificadores, validada con un esquema por tipo; nunca datos personales ni secretos. Reintentos con espera creciente; tras N intentos pasa a "muerto" con alarma sin bloquear al resto (correo: tope de ~12 h de reintentos de webhook según RN-INT-027).

**Todo trabajo** se ejecuta con `ejecutarComoEmpresa(empresaId, fn)`: abre la transacción, fija la empresa (ADR-03), salta empresas suspendidas, calcula "hoy" con `hoyEnEmpresa()` y es **idempotente** (correrlo dos veces no duplica; se apoya en claves únicas de origen).

**Programador único.** Un trabajo `programador` corre cada minuto (clave única) y, para cada empresa activa (función DEFINER `empresas_activas()`), encola `diario:<tarea>:<empresa>:<fecha_lógica>` con clave única. Tabla `corrida_diaria(empresa, tarea, fecha_logica, estado, resultado)` con seguridad por fila. Al arrancar procesa los días pendientes en orden: no se pierde un aviso por una caída.

**Eventos.** Tabla `evento_dominio(empresa_id, id, tipo, entidad_tipo, entidad_id, datos, creado_en)` con tipos `<módulo>.<entidad>_<hecho>` definidos en un catálogo en código (la tabla global `tipo_evento` se llena desde él al publicar). Datos del evento: solo identificadores.
- Lo que **protege la integridad** (liberar puestos, cerrar asignaciones, bloquear una anonimización) corre **síncrono en la misma transacción** mediante `emitir()` y escuchas síncronas registradas.
- Lo que es **aviso o espejo** (correo, webhook, elemento derivado de CMDB) lo toma el trabajo `despachar_eventos` por empresa (patrón de bandeja de salida), con entrega idempotente por `(evento, consumidor)`.

**Reloj.** Única función `reloj.ahora()`. Solo en desarrollo y pruebas lee un valor fijable guardado en `reloj_prueba` (tabla creada por el guion de pruebas, **no por migración**), de modo que web y trabajador ven el mismo reloj. Disparador manual `/api/pruebas/disparar` protegido con `CRON_SECRET`, inexistente en producción (responde "no encontrado"); la aplicación se niega a arrancar en producción si encuentra el reloj de prueba.

## Consecuencias
- Un solo mecanismo; nadie crea temporizadores sueltos.
- La cola tiene su propio esquema sin seguridad por fila; el riesgo es una carga útil con datos: lo cubre el esquema por tipo y una prueba que busca el nombre canario en la cola.
- Las versiones de la web y del trabajador conviven un momento: los trabajos deben seguir siendo comprensibles por ambas versiones.

## Qué prueba lo valida
- H7: `kill -9` al trabajador a mitad de un trabajo, se completa una sola vez; dos trabajadores, una sola corrida diaria por empresa y día; trabajo "envenenado" llega a muerto con alarma; encolar y revertir no deja trabajo.
- Prueba por módulo: ejecutar el proceso con dos empresas y comprobar que cada aviso, registro y destinatario queda en la suya; empresa suspendida se salta.
- Prueba de arquitectura: ningún módulo importa la librería de cola; todos usan `nucleo/cola`.
- Prueba de que producción no contiene `reloj_prueba` ni la ruta del disparador.
