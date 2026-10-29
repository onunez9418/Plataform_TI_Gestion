# ADR-18 · Importación: huella de archivo, filas en preparación y deshacer (T-13)

**Estado:** Propuesto (revisado 2026-10-29: incorpora el texto de reemplazo de Datos, `adr-18-importacion-revision-datos.md`, y la observación de Seguridad) · **Decide:** Gerente de TI (el Ingeniero de Datos completa los índices, plan-aplicacion §3) · **Base:** D-050, D-070.6, D-072, D-022, D-054.2, D-039.7, D-077, D-080, H-ARQ-14; D18-1 a D18-10; `indices-claves-naturales.md`

## Contexto
Ocho módulos piden "su" importación. D-050 definió un solo marco; D-022 dice que no hay almacenamiento de archivos y el archivo contiene datos personales. "Deshacer" significa cosas distintas en cada módulo. La versión anterior de este ADR tenía tres cosas que no se sostienen en la base: la huella SHA-256 simple (permite comprobar contenido conocido), la tabla `lote_registro` sin clave foránea (contradice D-039.7 y permitiría un lote que "registre" una entidad de otra empresa) y la limpieza de las filas en preparación "al confirmar" (la ejecución las necesita después de confirmar). Además faltaban los índices que hacen cumplir en la base lo que solo el código prometía.

## Decisión

### 0. Lo que no cambia
La lectura segura (solo `.xlsx` y `.csv`, sin evaluar fórmulas ni entidades externas, límites de tamaño descomprimido, de hojas, columnas y largo de celda, rechazo de macros, tiempo máximo, **5.000 filas y 10 MB**; celdas **de texto** que empiezan con `=`, `+`, `-`, `@`, tabulador o retorno se tratan como texto; las numéricas siguen siendo números); la empresa sale de la dirección, nunca del archivo; **el archivo no se guarda** (se descarta al terminar la lectura); "todo o nada" y "solo crea"; valores desconocidos (marcas, ubicaciones) y SKU que no se crean solos; orden de dependencias (catálogos, Personas, SKU, activos, saldos); fechas `dd/mm/aaaa` o número de serie de Excel; series dañadas por Excel rechazadas (D-072.2); los topes (5.000 filas, 10 MB, 10 por día por empresa, ADR-16); las invitaciones masivas del portal son por persona (D-050.11); las claves de licencia no entran por Excel.
**Tipo de archivo por su contenido, no por la extensión** (observación de Seguridad): se valida la firma del archivo (un `.xlsx` es un contenedor ZIP con la estructura esperada; un `.csv` es texto en una codificación admitida) y se rechaza lo que no coincida con su extensión. La biblioteca de lectura la escoge Seguridad en la Etapa 4 (sin vulnerabilidades conocidas, lectura en flujo).

### 1. Tablas (todas con `aplicar_aislamiento`, clave primaria `(empresa_id, id)` salvo que se indique)

**`importacion_lote`**: `id`, `tipo`, `estado`, `huella_archivo`, `filas_total`, `filas_validas`, `filas_con_error`, `rango_desde`/`rango_hasta` (correlativos reservados, ADR-15), `creado_por_membresia_id`, `creado_en`, `confirmado_por_membresia_id`, `confirmado_en`, `iniciado_en`, `terminado_en`, `deshecho_por_membresia_id`, `deshecho_en`, `motivo_deshacer`, `codigo_fallo`, `version`. **Sin nombre del archivo** (puede contener un nombre de persona o de cliente).

| Estado | Significado | Siguiente permitido |
|---|---|---|
| `preparando` | Se subió; se está leyendo y validando | `validado`, `cancelado`, `expirado` |
| `validado` | Todas las filas válidas (o con errores listados); esperando confirmación | `confirmado`, `cancelado`, `expirado` |
| `confirmado` | Una persona con `datos.importar` confirmó; en cola para el trabajador | `en_ejecucion`, `fallado` |
| `en_ejecucion` | El trabajador abrió la transacción de carga | `completado`, `fallado` |
| `completado` | Todo creado | `deshecho` |
| `fallado` | No se creó nada (final) | (final) |
| `deshecho` | Todo anulado (final) | (final) |
| `cancelado` | La persona abandonó antes de confirmar (final) | (final) |
| `expirado` | 7 días sin confirmar; limpiado por el trabajo programado (final) | (final) |

Cada cambio de estado es una **actualización condicional** (`UPDATE … SET estado = $nuevo, version = version + 1 WHERE id = $id AND estado = $esperado AND version = $v`; 0 filas = "ya fue decidido", patrón 2 de ADR-15). Un `CHECK` con la lista y una función de transiciones válidas (ADR-06) rechazan cualquier otra.

**Índices únicos parciales (hacen cumplir "no duplicar" y "una a la vez" en la base):**
- `UNIQUE (empresa_id, huella_archivo) WHERE estado IN ('confirmado','en_ejecucion','completado')`: un archivo ya confirmado y no deshecho se rechaza entero con "este archivo ya se importó el [fecha] en el lote N". Un lote `fallado`, `cancelado`, `expirado` o `deshecho` **no** ocupa la huella.
- `UNIQUE (empresa_id) WHERE estado IN ('confirmado','en_ejecucion')`: una sola importación **en curso** por empresa (RF-IMP-011). Preparar o validar otros lotes mientras tanto sí se permite; **confirmar** el segundo se rechaza con "hay otra importación en curso".
- Apoyo: `(empresa_id, estado, creado_en)` para el trabajo de limpieza y la pantalla de lotes.

**`importacion_fila`** (preparación; `sin_soporte`; `borrable`): `lote_id`, `n_fila`, `estado` (`valida`, `con_error`, `valor_nuevo_pendiente`), `datos_validados jsonb`, `clave_natural_norm text`, `creado_en`. Clave primaria `(empresa_id, lote_id, n_fila)`; clave foránea compuesta a `importacion_lote`. **Índice único parcial `(empresa_id, lote_id, clave_natural_norm) WHERE clave_natural_norm IS NOT NULL`**: detecta las filas repetidas dentro del mismo archivo ("repetida en la fila 12") al insertarlas con `ON CONFLICT DO NOTHING`, sin parar en la primera.
- Contiene datos personales en claro (nombres, correos): se declara en §18.1 con plazo de **7 días como máximo**; es `sin_soporte`, o sea `app_soporte` no tiene permiso sobre ella (ADR-03), y está en el mapa de anonimización (ADR-12). Seguridad decide si se cifra la columna con el mecanismo de ADR-07 (no se pide: son 7 días y complicaría la validación; queda como opción).
- **Limpieza:** se borran **al pasar el lote a un estado final** (`completado`, `fallado`, `deshecho`, `cancelado`) en la misma transacción que el cambio de estado, y por el trabajo programado a los **7 días** de `creado_en` para los lotes que quedaron en `preparando`/`validado` (que pasan a `expirado`). **No se borran al confirmar:** el trabajador las lee para ejecutar. Con una congelación vigente (ADR-23) la limpieza por plazo se pospone para las empresas afectadas.

**`importacion_error`**: `lote_id`, `n_fila`, `columna`, `codigo` (lista cerrada: `obligatorio`, `formato`, `largo`, `ya_existe`, `repetida_en_archivo`, `serie_danada`, `valor_desconocido`, `fecha_invalida`, `referencia_inexistente`…), `parametros jsonb` (solo números de fila y nombres de columna, **nunca el valor de la celda**: el reporte de errores no debe ser un segundo almacén de datos personales sin plazo). Es lo que se descarga como reporte. Se conserva con el lote.

**`importacion_valor_nuevo`** (`sin_soporte`; `borrable`; misma limpieza que las filas): valores desconocidos (marca, ubicación, área) propuestos para aprobar en bloque: `lote_id`, `catalogo`, `valor_norm`, `texto`, `decision` (`pendiente`, `aprobado`, `rechazado`).

**`lote_registro` se elimina.** Reemplazo: **cada tabla de una entidad importable** (activo, SKU, Persona, proveedor, línea, dominio, certificado, contrato de licencia, servicio de CMDB, movimiento de saldo inicial, catálogos) lleva estas columnas, definidas por la macro con la opción `importable => true`:
- `importacion_lote_id uuid NULL` con **clave foránea compuesta** `(empresa_id, importacion_lote_id)` hacia `importacion_lote` e índice `(empresa_id, importacion_lote_id) WHERE importacion_lote_id IS NOT NULL`;
- `secuencia_alta bigint NOT NULL DEFAULT nextval('marca_secuencia')` (ver punto 5);
- `anulado_en timestamptz NULL` y `anulado_motivo text NULL` (`CHECK`: ambos o ninguno).
Así la pregunta "qué creó este lote" es un `SELECT … WHERE importacion_lote_id = $1` por tabla, la base garantiza que la entidad es de la misma empresa que el lote y desaparece una referencia polimórfica sin clave foránea (D-039.7).

### 2. Huella del archivo
`huella('archivo_importacion', bytes_del_archivo)` de ADR-09 (nivel A: HMAC-SHA-256 con llave derivada de la maestra, fuera de la base), **no** SHA-256 simple: con SHA-256 simple, quien lea la base podría comprobar si un archivo conocido (una lista filtrada de empleados) se importó. La huella se calcula al subir y se guarda desde el estado `preparando`; el índice único solo cuenta los estados confirmados. Dos personas que suban el mismo archivo a la vez pueden preparar los dos lotes; solo el primero en confirmar lo logra y el segundo recibe el mensaje de "ya se importó" en el momento de confirmar. (Si cambia el pepper se pierde la detección de duplicados de lotes anteriores; ver ADR-09.)

### 3. Validación
Contra la base: una fila cuya clave natural ya existe es error de **esa fila**; valores desconocidos y SKU aparte. Las **claves naturales y sus índices únicos parciales** son los de `indices-claves-naturales.md` (cada clave con su clase P, L, B, V o A); la plantilla de cada entidad nombra su índice (`uq_<tabla>__<clave>`); la validación consulta la misma condición que el índice (`WHERE anulado_en IS NULL …`) para dar el mensaje "ya existe en [dónde]". Los errores se escriben en `importacion_error` sin el valor.

### 4. Ejecución (trabajador, ADR-02)
1. **Antes de la transacción:** se reservan los correlativos en un rango (ADR-15): `n = filas` más 20 % de margen para los SKU (código manual ocupado) y se guardan en `rango_desde`/`rango_hasta`.
2. Paso corto, transacción propia: `confirmado → en_ejecucion` (actualización condicional). Si el trabajador muere después, un trabajo de reconciliación pasa a `fallado` (`codigo_fallo = 'trabajador_caido'`) cualquier lote `en_ejecucion` sin transacción viva tras 10 minutos; como la carga es atómica, **no hay nada que limpiar**.
3. **Una sola transacción** de carga (`READ COMMITTED`, `conTiempoExtendido` con **tope de 4 minutos**, ADR-03, para que la copia externa de auditoría nunca se salte filas, D11-3) que, en el orden de dependencias, inserta por bloques con `INSERT … SELECT FROM unnest(…)` (no fila por fila), asigna `importacion_lote_id`, escribe la entrada de lote y su detalle en la auditoría (ADR-11), pasa el lote a `completado` y borra sus filas en preparación. 5.000 filas con auditoría de lote caben holgadas.
4. **Violación de un índice único durante la carga** (otra persona creó la misma clave entre la validación y la ejecución): se captura el error `23505`, se identifica el índice por su nombre, el lote pasa a `fallado` con `codigo_fallo = 'ya_existe_<clave>'` y se informa la clave. Sigue siendo "todo o nada": ninguna fila queda.
5. Cualquier otro error: `fallado`, nada creado, error técnico a los registros sin datos personales y con el error normalizado (ADR-02, ADR-20). Un archivo corregido es otro archivo (misma regla D-050.3).

### 5. Deshacer = anular, nunca borrar (D-050.5, D-072.3)
- **Marca de secuencia:** una `SEQUENCE marca_secuencia` global con **`CACHE 1`** (obligatorio). Con `CACHE` mayor que 1 cada conexión reserva un tramo y dos sesiones entregan valores fuera del orden en que se pidieron: la regla "ninguna fila posterior" dejaría de ser cierta. La llevan `secuencia_alta` de cada entidad importable y una columna `secuencia` en cada tabla que registra un hecho sobre ellas (movimiento, asignación, corrección de costo, historial de estado, vínculos, reclamos, órdenes de servicio, avisos…), con el mismo valor por defecto. **La marca nunca se muestra** (pantalla, API, exportación): una secuencia global revelaría, desde una empresa, cuánta actividad tiene el resto de la plataforma (Seguridad avaló el cambio de D-050.5 con esa condición); hay una prueba de contrato en la API.
- **Por qué sirve la secuencia y no la hora:** un hecho posterior solo puede referirse a una entidad ya confirmada, así que pide su número de secuencia *después* de que la entidad existe; su número es mayor que el `secuencia_alta` de la entidad. Es una propiedad de `CACHE 1` y de que la entidad se vea solo tras su `COMMIT`.
- **Algoritmo**, en una transacción `READ COMMITTED`, **en este orden** (el orden importa):
  1. Bloquear el lote: `SELECT … FROM importacion_lote WHERE id = $1 AND estado = 'completado' FOR UPDATE`.
  2. Bloquear las entidades del lote **en orden inverso de dependencias y por `id` ascendente**: `SELECT id FROM <tabla> WHERE importacion_lote_id = $1 AND anulado_en IS NULL ORDER BY id FOR UPDATE`.
  3. **Solo después**, como sentencia nueva (en `READ COMMITTED` cada sentencia ve lo confirmado hasta ese momento), ejecutar `esta_en_uso(tipo, ids)` de cada plantilla: verdadero si existe un hecho con `secuencia` mayor que el `secuencia_alta` de la entidad o cualquier fila que la referencie (clave foránea entrante). Si alguna lo está, **no se deshace nada** y se informa cuáles.
  4. `UPDATE … SET anulado_en = now(), anulado_motivo = 'Anulado por lote deshecho'`; los disparadores propagan la marca a `identificador_unico` (ADR-17) y a las demás filas que repliquen una clave (liberan las claves naturales, porque los índices tienen `WHERE anulado_en IS NULL`); el saldo inicial de stock se anula con un movimiento contrario con el mismo lote.
  5. Lote a `deshecho`, entrada de auditoría de lote.
- **Carrera cerrada por la base, no solo por el servicio:** todas las tablas que apuntan a una entidad importable (movimiento, asignación, vínculos) tienen un disparador `BEFORE INSERT` que toma `FOR KEY SHARE` la fila apuntada y rechaza si `anulado_en IS NOT NULL`. Si un movimiento llega *mientras* se deshace: o toma su bloqueo primero (y el paso 3 lo ve y se aborta el deshacer) o espera al `COMMIT` del deshacer (y el disparador lo rechaza porque la entidad quedó anulada). No hay un tercer camino.
- **Cobertura de `esta_en_uso`:** una prueba de CI recorre `pg_constraint` y falla si una tabla tiene clave foránea hacia una entidad importable y no figura en la lista `referencias` de la plantilla.
- **Lo anulado:** sale de conteos y de unicidad (índices parciales), conserva historial y se ve con el filtro "incluir anulados". Si el activo anulado tenía `ACTV-NNNNNN`, ese código **no se reutiliza** (clase P).

### 6. Plantilla declarativa por entidad (la aporta cada módulo por el registro de módulo, ADR-14)
Columnas y tipos; validaciones; **clave natural con el nombre de su índice único parcial**; resolución de referencias; valores a aprobar; `esta_en_uso` y `referencias`; permiso `datos.importar`; campos personalizados por el validador de ADR-17 (campos secretos **no** entran por Excel). Un módulo sin plantilla completa no puede registrar importación: lo comprueba la prueba de arquitectura.

### 7. Auditoría
Una entrada de lote (tipo de autor y membresía) más las filas de `auditoria_lote_detalle` (ADR-11, sin clave foránea hacia `auditoria`; el detalle guarda `importacion_lote_id`).

## Opciones descartadas
- Guardar el archivo 30 días (RF-IMP-012 original): datos personales y almacenamiento sin autorizar (D-022).
- Importación parcial con errores: contradice "todo o nada" y obliga a conciliar a mano.
- `lote_registro(lote_id, entidad_tipo, entidad_id)`: referencia sin clave foránea, no impide cruzar empresas, obliga a recorrer todas las tablas con un nombre de tipo en texto.
- Una tabla con una columna por tipo de entidad (`activo_id`, `sku_id`, `persona_id`…): 12 o más columnas casi siempre nulas; la columna `importacion_lote_id` en cada tabla es más simple, indexable y verificable.
- Una secuencia por empresa: cada empresa necesitaría crearse en ejecución (el rol de la aplicación no es dueño); una global con `CACHE 1` cumple la propiedad y no tiene punto caliente relevante a 5.000 filas por importación.
- Cifrar `importacion_fila`: complica la validación para 7 días de vida; queda como opción de Seguridad.

## Consecuencias
- Cada tabla importable lleva tres columnas más y un índice parcial; las tablas de hechos llevan `secuencia` (ocho bytes por fila).
- La preparación vive en la base como máximo 7 días con datos personales; se declara en §18.1 y en el aviso de privacidad (Cumplimiento) y la limpieza tiene prueba con el reloj fijado.
- Si se pierde la sesión a mitad de la preparación, la persona vuelve a subir el archivo (el lote anterior expira solo a los 7 días o lo cancela).
- Quien extienda un módulo con una referencia nueva a una entidad importable debe actualizar `referencias` de la plantilla; la prueba de CI lo obliga.
- Cada entidad nueva con importación exige declarar su plantilla y su "deshacer".

## Qué prueba lo valida
- **Mismo archivo dos veces:** el segundo se rechaza; corregido, entra completo (100 filas). Dos personas confirmando el mismo archivo a la vez: gana una.
- **Una a la vez:** confirmar un segundo lote con otro en curso se rechaza; preparar sí.
- **Deshacer** con y sin hecho posterior; **carrera:** un movimiento llega mientras se deshace (200 repeticiones), gana el bloqueo y no se cuela ninguna anulada con movimiento; el deshacer de un lote con 5.000 filas termina bien.
- **Secuencia:** `CACHE` mayor que 1 en `marca_secuencia` hace fallar la prueba de convenciones; la marca no aparece en ninguna respuesta de API ni exportación.
- **Fallo a mitad** (corte de conexión, inyección de fallos de DevOps): todo o nada; un lote `en_ejecucion` huérfano pasa a `fallado` sin dejar filas; la violación de índice único entre validar y ejecutar da `fallado` con la clave.
- **Limpieza:** `importacion_fila` y `importacion_valor_nuevo` no se ven en sesión de soporte, se vacían al terminar y a los 7 días con el reloj fijado; la tabla de errores nunca contiene el valor canario.
- **Huella:** el valor de `huella_archivo` de un archivo conocido no coincide con su SHA-256 (control positivo con la prueba RS-51 de ADR-09).
- **Archivos hostiles:** fórmula inyectada, zip bomba, macros, celda enorme, **archivo con extensión `.xlsx` que no es un contenedor válido**.
- **Cobertura:** la prueba de catálogo de claves foráneas entrantes y la de que todo índice único de clave natural de la plantilla existe en el esquema.

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| D18-2 (bloqueante) | Incorporado: `lote_registro` eliminada; `importacion_lote_id` con clave foránea compuesta en cada entidad importable. |
| D18-3 (bloqueante) | Incorporado: máquina de estados completa con `cancelado` y `expirado`; dos índices únicos parciales. |
| D18-1 | Incorporado: huella HMAC (ADR-09). |
| D18-4, D18-5, D18-6, D18-7, D18-8, D18-9, D18-10 | Incorporados tal cual el texto de reemplazo de Datos. |
| Seguridad (observación ADR-18) | Incorporado: tipo de archivo por contenido; biblioteca escogida por Seguridad en la Etapa 4. |
| D-050.5 (condición de Seguridad) | La marca de secuencia no se expone: prueba de contrato. |
| H-SEG-36 | `importacion_fila` y `importacion_valor_nuevo` quedan protegidas por permisos (`app_soporte` sin acceso). |
| H-SEG-62 | La limpieza por plazo respeta la congelación (ADR-23). |

El archivo `adr-18-importacion-revision-datos.md` queda como registro de la propuesta de Datos; vale este ADR.
