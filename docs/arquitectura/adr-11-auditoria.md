# ADR-11 · Auditoría: cuatro tipos de autor, partición mensual, copia externa y purga controlada (T-8)

**Estado:** Propuesto (revisado 2026-10-29 tras Seguridad ronda 5, Datos y D-077) · **Decide:** Gerente de TI (revisan Cumplimiento y Datos) · **Base:** D-018, D-024, D-030, D-041, D-052, D-054.1, D-055 T-8, D-061.6, D-077, D-080; H-SEG-37, 40, 43, 62; D11-1 a D11-10, D04-5, D04-6

## Contexto
La auditoría solo se agrega (D-018) y debe: nombrar al autor (usuario, integración, sistema o, en la lectura de soporte, la plataforma), no guardar valores de datos personales (D-030, con la enmienda D-077 sobre los motivos), conservarse 5 años y poder retirarse al vencer sin editar nada. DevOps preguntó si la partición es anual (D-030.8) o mensual (D-055 T-8).

## Decisión

### Estructura
- Tabla `auditoria` **particionada por mes** en `creado_en`, creada con la variante `particionada` de la macro (ADR-03): clave primaria `(creado_en, id)`, **sin** `UNIQUE (empresa_id, id)` y **sin que ninguna otra tabla la referencie con clave foránea** (D11-1). Los índices se crean en la tabla padre (PostgreSQL los replica a cada partición). Una partición por defecto recoge cualquier fila fuera de rango y dispara alarma de gravedad **alta** si deja de estar vacía.
- `creado_en` es siempre el momento de **inicio de la transacción** (`now()`): un disparador lo fuerza a `transaction_timestamp()` para que nadie lo escriba a mano. Es la base de la copia externa (abajo).
- **Cuatro tipos de autor** (D11-2, H-SEG-37 a): `autor_tipo IN ('membresia','integracion','sistema','plataforma')`, con una sola de `autor_membresia_id | autor_integracion_id | autor_regla | autor_plataforma_id` (este último apunta a `administrador_plataforma`, global); un `CHECK` exige "exactamente una de cuatro, coherente con `autor_tipo`" y `motivo NOT NULL` cuando el autor es `plataforma`. "Sistema" guarda el identificador de la regla y de quien la configuró. El cuarto tipo existe **solo para las lecturas de soporte** (ADR-03); RF-AUD-013 y CA-041 deben decirlo (ajuste del Analista).
- Columnas: `empresa_id`, `autor_tipo` y su columna, `accion` y `entidad_tipo` (`CHECK` de lista cerrada que viene del catálogo del código), `entidad_id`, `cambios jsonb` (`CHECK (jsonb_typeof(cambios) = 'object' AND pg_column_size(cambios) <= 65536)`), `motivo` (hasta 500 caracteres, D-072.1), `ip inet`, `creado_en`.
- Índices `(empresa_id, entidad_tipo, entidad_id, creado_en)` y `(empresa_id, creado_en)`. Un índice `(empresa_id, autor_membresia_id, creado_en)` parcial `WHERE autor_tipo = 'membresia'` **solo si H3 muestra que la pantalla de auditoría lo necesita**; no se agregan índices que nadie midió (D11-9).
- La referencia a la entidad no tiene clave foránea (entidades de muchos tipos). Para no hacer una consulta por fila (D11-4): el disparador de "misma empresa de la entidad" corre **solo en `auditoria`** (no en `auditoria_lote_detalle`, cuyo vínculo es el lote); `entidad_tipo` es una lista cerrada ligada a una tabla de correspondencia en la migración; y `registrarAuditoria` escribe la entrada **después** de escribir la entidad en la misma transacción, de modo que la propia entidad (ya sometida a la seguridad por fila y a las claves compuestas) garantiza la empresa. H3 mide el costo con y sin disparador: si es mayor al 10 %, queda solo la verificación nocturna (que ya existe y tolera una entrada huérfana de un borrador borrado, para los `entidad_tipo` marcados "con borradores").
- Un **lote** (importación) es una entrada más su detalle en `auditoria_lote_detalle`, particionada igual; el detalle guarda `importacion_lote_id` y su propio `creado_en`, no una clave hacia `auditoria` (D-050.10).
- Las particiones las crea **solo** la función DEFINER `crear_particion_auditoria(mes)` (H-SEG-40): parámetro único validado como primer día de mes, identificadores formateados con `format('%I')`, crea la partición con `ENABLE` y `FORCE ROW LEVEL SECURITY`, la misma política, los disparadores propios y **sin ningún permiso para ningún rol de aplicación**. Un trabajo mensual crea las particiones de los **3 meses siguientes y de los 3 anteriores si faltan** (por si el sistema estuvo apagado), con alarma si falla. Si la partición por defecto no está vacía, el procedimiento de rescate (documentado) mueve primero esas filas a su partición correcta y recién entonces crea la del mes: PostgreSQL rechaza crear una partición cuyo rango contiene filas de la por defecto, y eso es lo que ocurriría el primer día de un mes sin partición (D11-6).

### Solo agregar: dos barreras (D11-7)
La barrera principal son los **permisos**: `app_empresa` tiene `SELECT` e `INSERT` sobre la tabla padre y **ningún permiso sobre las particiones** (hecho: PostgreSQL no aplica las políticas ni los permisos del padre a quien consulta una partición directamente). La segunda es el disparador de fila contra UPDATE y DELETE (heredado por cada partición desde PostgreSQL 13). El disparador de `TRUNCATE` es de sentencia y **no se hereda**, así que no cuenta como barrera; la prueba incluye `TRUNCATE` sobre cada partición. La única excepción documentada es la purga por partición (abajo), fuera de la aplicación.

### Qué se guarda de los cambios (D-030.6 enmendada por D-077)
Una sola función, `registrarAuditoria`, escribe; filtra con la **lista cerrada de campos personales** mantenida en un solo lugar del código y alimentada por la marca `dato_personal` de los campos (ADR-17): nombre, correo, área, código de empleado, teléfono y correo laborales de contactos, titular persona natural, IMEI y número de línea asignados a una Persona y **comentarios y descripciones libres**. De esos guarda solo "el campo X cambió". La aplicación **nunca** llena valores personales. Los datos personales viven en `persona_pii` (tabla aparte, D-041.3); anonimizar es sobrescribir esa fila y la auditoría no se toca (ADR-12).

**El motivo se guarda por valor (D-077).** Es el "porqué" de aprobar, anular, reabrir, corregir o revertir (RN-008), con tope de 500 caracteres. Es **texto libre que no se puede anonimizar de forma garantizada**: así se declara en §18.1 y en el aviso de privacidad. Como la auditoría solo se agrega, su copia vence con el plazo de la auditoría (5 años) y se retira con la partición; `texto.redactar` (PS-234) redacta el registro, no la copia de la auditoría. Se mantienen el aviso al escribir ("no ponga datos personales ni claves") y el validador común de textos. El plazo de esa copia queda dentro de la consulta legal L-04 ya pedida. **Sigue sin ir a la copia externa** (abajo).

### IP y eventos de seguridad
Se mantiene la lectura de D-030.5: la IP de acciones realizadas queda en la auditoría hasta el plazo de 5 años, y se retira con la partición. Los accesos fallidos, el correo escrito en un intento fallido **(guardado como huella de tipo `correo_intento`, no en claro, D04-5)** y los rechazos por empresa ajena van a **`evento_seguridad`** y **`evento_seguridad_ingreso`** (ADR-04), escritos en una transacción independiente, con partición mensual y retención de 12 meses. Cumplimiento confirma con legal si la IP debe quedar en la auditoría (L-04).

### Lecturas auditadas
Las lecturas masivas (≥ 5.000 filas), la consulta de impacto con ≥ 100 nombres de Personas, el registro de envíos, la cola de derechos y **todo acceso de soporte** se registran por una **ruta de escritura aparte** (transacción propia), de modo que también se registren desde una transacción de solo lectura y no se pierdan si la operación falla.

### Copia externa (D-052.2)
- **Qué se copia (H-SEG-43):** la fila **sin `ip` ni `motivo`**. En su lugar, un resumen con llave (HMAC con el propósito `auditoria_copia`, ADR-07) de cada uno. El almacén externo es de solo agregar y **no se puede borrar**; copiar ahí IP y texto libre convertiría en irreversible algo que quizá haya que eliminar por orden legal (L-04, L-05, L-06). Si Cumplimiento prefiriera copiar los valores, debe declararlo como riesgo residual y entra a la consulta legal ya pedida. La frase de ADR-04 que decía que la copia "no contiene valores personales" se corrigió.
- **Cadena de integridad:** por partición-mes, cada lote guarda `cadena = SHA-256(cadena_anterior || fila completa)`, calculada por la tarea de copia a partir de la fila **completa** leída con `lector_auditoria`. La verificación semanal vuelve a calcular los resúmenes y la cadena desde la base: detecta alteraciones sin que el almacén guarde ningún texto libre. La cadena reinicia en cada mes, de modo que purgar meses viejos no rompe la verificación de los siguientes. Comparación de **conteos por partición y empresa**, no solo "no hay saltos".
- **Por qué no se saltan filas (D11-3, bloqueante).** `creado_en` es la hora de **inicio** de la transacción, no la del `COMMIT`: una transacción que empezó hace 6 minutos y confirma ahora inserta filas con `creado_en` anterior a la marca ya copiada, y nunca se copiarían. Defensa en capas:
  1. **Tope de duración de la transacción de `app_empresa`: 4 minutos** (ADR-03: `transaction_timeout` en PostgreSQL 17 o superior; si no, plazo en `conEmpresa`). Hecho: `statement_timeout` por sí solo no basta, porque una transacción hecha de muchas sentencias cortas puede durar horas.
  2. **Margen de la copia: 15 minutos**, estrictamente mayor que el tope, no 5. La copia lee filas con `creado_en` anterior a *ahora − 15 min*, ordenadas por `(creado_en, id)`.
  3. **Marca de agua exacta (a medir en H3, mejora opcional):** la tarea llama `transaccion_mas_antigua()` (DEFINER, lee `pg_stat_activity` y requiere que el proveedor permita al dueño de la función el rol `pg_read_all_stats`) y copia solo lo anterior a `LEAST(ahora − 1 min, la transacción activa más antigua)`. Como `creado_en` es la hora de inicio de la transacción, toda fila de una transacción aún abierta tiene `creado_en` posterior a su inicio; el resultado no depende de supuestos de duración. Alternativa descartada por frágil: comparar `xmin` con el horizonte de transacciones activas (el `xmin` de la fila es de 32 bits y se reinicia; exigiría traducir a 64 bits).
  4. Cada noche la copia **relee el último día completo** (idempotente por `(creado_en, id)`, barato).
  5. La verificación semanal compara conteos por partición y empresa.
  6. Las importaciones suben el tope solo hasta 4 minutos (ADR-18); una importación de 5.000 filas cabe.

### Retención y purga (D11-5)
- **Partición mensual** (decisión, reemplaza "anual" de D-030.8, avalada por Seguridad). Motivo: con particiones anuales una fila de enero viviría 6 años o la purga se aplazaría un año; con mensuales la retención es exactamente de 60 meses, los índices por partición son pequeños y retirar un mes es barato.
- El rol `mantenimiento` **no es dueño**: ejecuta `purgar_particion_auditoria(mes, acta_id)` (DEFINER, propiedad de `migraciones`). Compara el **límite superior de la partición** (primer día del mes siguiente) con `now() − interval '60 months'`, no la fecha de creación de la tabla: una partición se purga solo cuando **todo** el mes tiene 60 meses. Rechaza si: tiene menos de 60 meses; en `purga_acta` no hay **dos aprobadores distintos**; la **verificación de la copia externa** de ese mes no está en estado "completa" (no se purga lo que no se copió); hay **congelación por incidente** vigente (ADR-23: con cualquiera, porque la partición mezcla empresas); falta la marca de **intención en el almacén externo** (ADR-23, D04-3); o el interruptor legal está apagado. Deja constancia (partición, fecha, quién). **Apagada por defecto hasta que legal confirme los plazos (L-04, D-033.4)**; nada irreversible se activa.
- **Mecánica:** `ALTER TABLE ... DETACH PARTITION` normal (no `CONCURRENTLY`, que no puede ejecutarse dentro de una función) con `SET LOCAL lock_timeout = '2s'` y reintentos desde la tarea fuera de hora pico. En dos pasos: **separar** (reversible, la tabla separada sigue existiendo) y **descartar** tras un plazo fijo (propuesta: 7 días) con una segunda llamada, para tener una última oportunidad de deshacer. H3 lo comprueba con la versión elegida.
- Eventos de seguridad: la misma función con otro mínimo (12 meses), con las mismas condiciones.

## Consecuencias
- Prisma no modela particiones: SQL en la migración (ADR-06).
- Consultas sin `empresa_id` y fecha recorren todas las particiones; la interfaz siempre filtra por empresa y rango.
- Varias personas con acceso total a la base pueden alterar la auditoría: se reduce a "detectable" con la copia externa encadenada.
- La copia externa guarda resúmenes y no los valores de IP y motivo: la verificación depende de la llave `auditoria_copia`; con una pérdida de la maestra (ADR-07) no se puede verificar la parte vieja de la cadena sin la versión archivada.
- Una congelación aplaza las purgas de todas las empresas (ADR-23).

## Qué prueba lo valida
- H3: `app_empresa` no puede UPDATE/DELETE/TRUNCATE (también sobre cada partición); consulta directa a una partición como `app_empresa` falla; la partición la crea la función y nace con `FORCE`; la purga rechaza antes de 60 meses, sin dos aprobadores, sin copia completa, con congelación vigente, sin intención externa y con el interruptor apagado; con una partición simulada de 61 meses y las condiciones, la acepta y deja constancia; mes sin partición: la alarma salta y el rescate funciona; consulta por `(empresa, entidad, id)` con 2 millones de filas en 24 particiones p95 ≤ 200 ms; inserción p95 ≤ 20 ms.
- Fila de soporte con autor `plataforma` se acepta y con dos autores se rechaza; `motivo` obligatorio para ese autor.
- **Copia externa con transacciones largas (a escala reducida):** una transacción abierta con `creado_en` anterior a la marca de la copia y que confirma después: la fila **llega**, por el margen y por la marca de agua; el tope de la transacción cancela una que lo supera; la relectura nocturna y el conteo semanal detectan una fila ausente sembrada a propósito.
- La copia externa **no contiene** `ip` ni `motivo`: se siembran una IP y un motivo con un nombre canario y se busca en la salida de la copia.
- Prueba del nombre canario (QA): anonimizar a una Persona y comprobar que la auditoría sigue completa y sin su nombre en los campos personales (el canario **escrito en un motivo sí permanece**, por D-077: es el comportamiento declarado).
- Prueba de que cambiar un campo personal deja "campo cambió" sin valores. Autor "sistema" con regla; CHECK rechaza dos autores.

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| D11-1 (bloqueante) | Incorporado: variante `particionada`, sin clave foránea hacia la auditoría. |
| D11-2 (bloqueante) y H-SEG-37 a | Incorporado: cuarto tipo de autor `plataforma` con persona y motivo obligatorio. |
| D11-3 (bloqueante) | Incorporado y ampliado: además del margen de 15 minutos y el tope de 4, añadí el hecho de que `statement_timeout` no limita la transacción y propuse la marca de agua por transacción más antigua (opción que Datos pedía medir; descarté `xmin` por los 32 bits). |
| D11-4 | Incorporado: disparador solo en `auditoria`, medido en H3. |
| D11-5 | Incorporado: límite superior de la partición, condiciones de rechazo, dos pasos. |
| D11-6, D11-7, D11-8, D11-9, D11-10 | Incorporados. |
| H-SEG-40 | Incorporado: `crear_particion_auditoria` con `FORCE` y sin permisos para la aplicación. |
| H-SEG-43 | Incorporado: copia sin `ip` ni `motivo`, con resumen HMAC y cadena sobre la fila completa. Cumplimiento puede revisar la alternativa de copiar valores. |
| H-SEG-62 | Incorporado vía ADR-23: la purga rechaza con congelación. |
| D-077 | Alineado: motivo por valor (500 caracteres), texto libre no anonimizable, fuera de la copia externa, aviso al escribir. |
| D04-5 | El correo del intento fallido se guarda como huella. |
