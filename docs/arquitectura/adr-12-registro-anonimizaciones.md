# ADR-12 · Registro de anonimizaciones (y constancias de purga) fuera de la base que se restaura (T-8)

**Estado:** Propuesto (revisado 2026-10-29 tras Seguridad ronda 5 y Datos) · **Decide:** Gerente de TI (revisan Cumplimiento y DevOps) · **Base:** D-032.3, D-052.3 y .4, D-033, D-030, D-077, D-080(b), RF-DAT-016, CA-053; H-SEG-62; D12-1 a D12-5, D04-3

## Contexto
Si el registro de anonimizaciones viviera en la misma base, al restaurar un respaldo antiguo retrocedería con ella y se perdería justo lo que debía reaplicarse: personas ya anonimizadas reaparecerían. Lo mismo le pasa a la constancia de una purga de auditoría (`purga_acta`): al restaurar, las particiones purgadas reaparecen y su constancia desaparece.

## Opciones
1. Tabla en la misma base. Descartada (se restaura junto con la base).
2. Otra base. Descartada: sigue siendo un servicio de base que mantener y respaldar.
3. **Almacén de objetos aparte**, de solo agregar, con versiones y bloqueo contra borrado, replicado. Elegida (propuesta de DevOps, §5.4).

## Decisión
- Puerto de código `RegistroAnonimizaciones { agregar(entrada), listar() }`. Implementación real contra un almacén compatible con S3 con bloqueo de objetos (credencial de la aplicación **solo agrega**, `ANON_REGISTRY_*`; la lectura es del procedimiento de restauración) e implementación local para desarrollo y pruebas. **El mismo almacén y la misma credencial de solo agregar guardan también las constancias de purga** (prefijo `purga/<tabla>/<mes>`, con `intencion` y `confirmada`; ADR-23). Existe también una constancia de **congelaciones** vigentes al momento de restaurar, para que el procedimiento sepa si debe reponerlas (ADR-23).
- **Contenido:** solo `empresa_id`, `persona_id` o `usuario_id`, fecha y estado (`intencion | confirmada`). Nunca datos personales.
- **Limpieza por módulo al anonimizar:** el registro de módulo (ADR-14) incluye un escucha síncrono "al anonimizar"; `anonimizar` lo invoca dentro de su transacción para que cada módulo borre sus copias (por ejemplo el vínculo con una cuenta de Microsoft, ADR-21).
- **Mapa de columnas con datos personales (D12-1):** cada columna que guarda un dato personal lleva una marca consultable en el catálogo de la base (`COMMENT ON COLUMN tabla.columna IS 'pii:persona|accion=null'`), y una prueba de CI recorre `pg_description`: toda columna marcada está cubierta por `anonimizar`, y toda columna que `anonimizar` toca está marcada. Cubre al menos: `persona_pii`, la copia de nombre y área del acta (`retener_hasta`), `contacto_proveedor` (correo y teléfono), `importacion_fila.datos_validados`, el valor original conservado 90 días por la migración de líneas, los valores de campos con `dato_personal` (ADR-17) y los espejos de usuarios y dispositivos de integraciones (ADR-21). La marca de un módulo nuevo es obligatoria para que su tabla pase la prueba.
- **Unicidad:** al anonimizar, `correo_norm` y `codigo_empleado_norm` pasan a **NULL** (no a una cadena), para que la clave única de Persona (RN-PRS-005) se libere sola.
- **Nombre:** "Persona anonimizada 0042" se construye con el número de su **propia referencia `PRS-0042`**, no con un contador nuevo: reaplicar la anonimización da el mismo nombre (idempotencia) y no se agrega una clave más al ADR-15 (D12-4).
- **Protocolo** (no se puede escribir en la misma transacción que la base):
  1. escribir la **intención** (objeto `anon/<empresa>/<persona>/intencion`, idempotente: si existe, no cambia);
  2. transacción en la base que (a) **bloquea la fila de la Persona** con `SELECT ... FOR UPDATE` y **vuelve a comprobar los pendientes** dentro de esa transacción (patrón 2 de ADR-15), para que una entrega concurrente no deje a la Persona anonimizada con un equipo asignado; (b) **rechaza si hay congelación por incidente vigente** (`congelacion_activa`, ADR-23; la intención ya escrita queda pendiente y se reaplica al levantarla); y luego sobrescribe `persona_pii` con la referencia, limpia copias vencidas (por ejemplo la copia de nombre del acta cuando vence `retener_hasta`, D-051) y registra el evento en la auditoría;
  3. escribir la **confirmación**.
- **Falla cerrada:** si el almacén no responde, la anonimización se rechaza y se reintenta por la cola. Si hay intención y la transacción falló, reaplicar es inofensivo.
- **Cuenta global (D12-5):** la anonimización de `cuenta_usuario` (D-041.2) escribe el mismo tipo de entrada con `usuario_id`; el correo de la cuenta pasa a NULL (libera `cuenta_usuario.correo_norm`) y las sesiones, enlaces e invitaciones de esa cuenta se invalidan en la misma transacción. Se hace solo cuando no le queda ninguna empresa activa (D-041.2); la anonimización de membresía es por empresa.
- **Al restaurar, orden obligatorio antes de abrir el sistema (D12-3):** (1) reparar los contadores (`contador_reparar`, ADR-15), (2) reaplicar las anonimizaciones (leer todas las intenciones y ejecutar `anonimizar`, idempotente), (3) reaplicar las purgas con constancia, (4) reconstruir las particiones faltantes y la partición por defecto (ADR-11), (5) reponer las congelaciones vigentes y **pausar todas las conexiones de integraciones** (una credencial que se eliminó al desconectar puede reaparecer con el respaldo, ADR-21), (6) abrir. El guion de ensayo en base de pruebas (CA-053 ya lo pide para las anonimizaciones) pasa a cubrir los seis.
- **Reconciliación nocturna:** compara los eventos de la auditoría con el registro externo; alarma si falta uno, o si hay una intención sin resultado pasada 1 hora.
- Existe desde la **Etapa 2**, antes de la primera anonimización. La anonimización automática sigue **apagada** hasta la opinión legal (D-033.4); la manual solo con pedido documentado y dos personas.
- Aviso: bloquea la anonimización de quien tenga pendientes sin cerrar (D-033.3, D-061.7), lo que verifica el registro de módulo (ADR-14).
- **D-077:** un motivo con un dato personal escrito por error **no** se anonimiza (la auditoría no se toca, ADR-11); se declara así en el aviso de privacidad.

## Consecuencias
- Una dependencia más (el almacén): su costo bajo ya está en el escalado D2; sin él no hay anonimización.
- Un dato anonimizado puede seguir en respaldos hasta 12 meses; se declara en el aviso de privacidad (D-032.2).
- Anonimizar es irreversible: por eso la automática no se activa sin legal.
- Cada módulo nuevo con datos personales debe marcar sus columnas; sin la marca no pasa la prueba.

## Qué prueba lo valida
- CA-053: anonimizar a una persona, restaurar un respaldo anterior en base de ensayo, reaplicar y comprobar que no reaparece; el guion cubre los seis pasos de la restauración y una purga con constancia que reaparece y se vuelve a purgar.
- Prueba de falla cerrada (almacén caído: la persona no queda anonimizada a medias).
- Prueba de idempotencia: reaplicar dos veces da el mismo resultado y el mismo nombre.
- Prueba de que la entrada no contiene nombre, correo ni código de empleado (nombre canario).
- Con una congelación vigente `anonimizar` rechaza; al levantarla se completa. Una entrega concurrente no deja a la Persona anonimizada con un equipo asignado (candado y recomprobación).
- Prueba del mapa: una columna marcada y no cubierta, o cubierta y no marcada, hace fallar la integración continua; `correo_norm` queda NULL.

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| D12-1 | Incorporado: marca por columna consultable y prueba cruzada; `NULL` en claves. |
| D12-2 | Incorporado: candado `FOR UPDATE` con recomprobación; congelación (mecanismo en ADR-23). |
| D12-3 | Incorporado y ampliado a seis pasos: añadí la reposición de congelaciones. |
| D12-4, D12-5 | Incorporados. |
| H-SEG-62 | Incorporado vía ADR-23 (`congelacion_activa`). |
| D04-3 | Incorporado: el mismo almacén guarda las constancias de purga. |
| D-077 | Aviso de que el motivo no se anonimiza. |
