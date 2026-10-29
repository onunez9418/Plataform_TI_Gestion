# ADR-15 · Correlativos por contador atómico y patrones de concurrencia (T-11)

**Estado:** Propuesto (revisado 2026-10-29 tras la revisión de Datos y Seguridad ronda 5) · **Decide:** Gerente de TI (con Ingeniero de Datos) · **Base:** D-007, D-055 T-11, H-ARQ-15, H-ARQ-17, D-049, D-079; D15-1 a D15-8

## Contexto
Hay unas 20 numeraciones (`OC-`, `RCP-`, `CTR-`, `PRS-`, `ACTV-`, códigos de SKU…). D-007 pide que el número se asigne en la misma operación que crea el registro; pero bloquear el contador hasta el final de una importación de 5.000 filas o una recepción larga frena a todos los demás. D-007.2 ya acepta saltos.

## Decisión

### Contadores
- Tabla `contador(empresa_id, clave, ultimo bigint)` con seguridad por fila, `fillfactor = 50` y parámetros de limpieza automática más agresivos (recibe una actualización por reserva sobre las mismas pocas filas). La clave tiene espacio de nombres y se normaliza en mayúsculas: `sku:<prefijo>`, `doc:<prefijo>`, `prs`. Un `CHECK` fija la forma: `clave ~ '^(sku:[A-Z0-9]{2,5}|doc:[A-Z]{2,5}(-[A-Z])?|prs)$'`. Para SKU la clave es el **prefijo** (no la categoría): las subcategorías usan el de su categoría principal, y cambiar el prefijo no cambia los códigos existentes.
- **Lista de claves (D15-5):** el código visible del activo de D-079 usa **`doc:ACTV`** (una sola forma para todo documento con prefijo; formato `ACTV-NNNNNN`, mínimo 6 dígitos, no se reutiliza). Más `doc:OC`, `doc:RCP`, `doc:OS`, `doc:ACT-E`, `doc:ACT-D`, `doc:RCL`, `doc:MNT`, `doc:CTR`, `doc:AYU`, `doc:CAM`, `doc:PRB`, `doc:KB`, `doc:EC`, `doc:PPT`, `doc:MPR`, `doc:GMA`, `doc:LSAP`, `doc:PRG` y `prs`. La lista vive en **una constante del código** y una prueba la compara con los prefijos reservados de RF-CAT-008 (que debe incluir `ACTV`, D-079).
- **`siguiente(empresa_id, clave, n)`** es una **función SQL de la base, SECURITY INVOKER** (no DEFINER; lo pidió la observación de Seguridad sobre las funciones que reciben la empresa como parámetro): en **una llamada** hace el `set_config` local de la empresa y el `INSERT … ON CONFLICT (empresa_id, clave) DO UPDATE SET ultimo = contador.ultimo + n RETURNING ultimo`. El cliente la ejecuta en autocommit: un viaje y una transacción de una sola sentencia, sin tres viajes por reserva (`BEGIN`, `set_config`, `INSERT`) que no cabrían en el p95 ≤ 50 ms. No eleva privilegios (quien la llama ya es `app_empresa`); es la única función no DEFINER que fija el contexto, y está en la lista cerrada de ADR-04. `nucleo/contadores` es el único código que la llama.
- **Forma exacta de la reserva (D15-2):** la primera reserva inserta `(empresa, clave, n)` (el rango es `1..n`); en conflicto, `ultimo = ultimo + n`; el resultado devuelto es el **último** número de la reserva, y el rango es `ultimo − n + 1 .. ultimo`. `CHECK (n BETWEEN 1 AND 10000)` en la función.
- **Se llama antes de abrir la transacción principal**, nunca dentro de ella ni anidada (anidarla exige una segunda conexión y puede agotar el grupo). El servicio hace: reservar, luego `conEmpresa(… crear con los números)`. Si la operación falla, queda un salto: está permitido.
- Una importación reserva un rango de una vez (`n` = filas, más 20 % para SKU, ver abajo). Formato y ancho (mínimo 6 dígitos en documentos, 4 en SKU, `PRS-` de 4) los define cada módulo en su registro; el prefijo reservado no se puede usar en categorías (D-049.3).
- **El código de SKU escrito a mano ocupa números del contador (D15-4, RF-SKU-005):** el servicio de SKU reserva un **bloque pequeño** (p. ej. 5), toma el primer código libre (consulta previa) y, si aun así el `INSERT` choca con el índice único de `sku`, reserva otro bloque y reintenta hasta 10 veces antes de fallar con un error claro. La importación de SKU reserva `filas + 20 %` y descarta los ocupados.
- **Los índices únicos de numeración son la red de seguridad** (`indices-claves-naturales.md`): el contador evita colisiones en el uso normal; el índice garantiza que, si algo falla, el segundo insert **falle** en lugar de duplicar.
- **Reparar tras una restauración (D15-3):** al restaurar un respaldo anterior, `contador` retrocede, pero los números ya enviados (en correos, PDF, actas firmadas, el sistema SAP) no. `contador_reparar()` (DEFINER, la ejecuta `mantenimiento` o `migraciones`) deja, para cada clave, `ultimo = GREATEST(ultimo, MAX(parte numérica del código existente)) + 1000`. Es el paso (1) de la rutina de restauración de ADR-12.

### Patrones de concurrencia obligatorios
Una guía corta; cada uno tiene una prueba que escribe QA contra PostgreSQL real.

| # | Patrón | Se usa para |
|---|---|---|
| 1 | **Índice único parcial** `WHERE hasta IS NULL` (más `EXCLUDE` contra solapes en historiales, ADR-06) | Un solo vigente: asignación abierta por activo, línea activa por número, puesto por persona y contrato |
| 2 | **Actualización condicional** (`UPDATE … WHERE estado = $esperado AND version = $v`; 0 filas = "ya fue decidido") | Aprobar, cerrar, cancelar, decidir |
| 3 | **Capacidad**: `UPDATE … SET usados = usados + 1 WHERE usados < total` más `CHECK` | Stock sin negativos, puestos de licencia, cantidad pendiente de recepción |
| 4 | **Clave de idempotencia** (tabla con vencimiento) en toda operación que se confirma o llega por la API | Recepciones, importaciones, webhooks |
| 5 | **`version`** en toda entidad editable (RN-014) | Edición simultánea, ver "alguien lo cambió" |

**Reglas que completan los patrones (Datos):**
- **Orden de bloqueo (D15-6):** toda operación que toca varias filas de la misma clase las bloquea **en orden ascendente de clave** (`ORDER BY id FOR UPDATE`): activos de un traspaso, saldos de un traslado (por `(sku_id, ubicacion_id)`), series de una recepción. Orden entre clases: documento (orden, lote) → activo → saldo → asignación. Con eso el interbloqueo entre dos traslados cruzados no ocurre; si ocurre, PostgreSQL aborta una con el error `40P01` y el servicio la reintenta una vez.
- **Tabla de idempotencia (D15-7):** `idempotencia(empresa_id, clave, huella_peticion, estado, resultado, expira_en)`, clave primaria `(empresa_id, clave)`, `estado IN ('en_curso','completada')`; la huella de la petición (ADR-09, tipo `peticion`) detecta la misma clave con una petición distinta (error 422, no se devuelve el resultado ajeno); limpieza por trabajo a las 24 horas; `INSERT … ON CONFLICT DO NOTHING` para ganar la clave.
- **Stock (D15-8):** `stock_saldo` con clave primaria `(empresa_id, sku_id, ubicacion_id)` y `CHECK (cantidad >= 0)`; ingreso por `INSERT … ON CONFLICT DO UPDATE SET cantidad = cantidad + $n`; salida por `UPDATE … SET cantidad = cantidad − $n WHERE … AND cantidad >= $n` (0 filas = saldo insuficiente); el movimiento y el saldo se escriben en la misma transacción. RF-INV-020 no depende de la hora ni del orden.

## Opciones descartadas
- Reservar dentro de la transacción principal (D-007 literal): bloquea la numeración durante todo el trabajo.
- `SEQUENCE` por empresa y clave: no se pueden crear en tiempo de ejecución con un rol sin dueño.
- Sin saltos garantizados: obliga a bloquear; el CEO ya aceptó saltos.
- `siguiente` como función DEFINER con la empresa por parámetro: tendría que recibir un identificador de empresa como prueba de quién llama (H-SEG-34); la versión INVOKER no eleva privilegios.

## Consecuencias
- Los números pueden tener huecos; el documento funcional ya lo dice y el visor no promete correlatividad sin saltos.
- Un solo punto caliente por clave, pero de duración de una sentencia.
- Tras una restauración los números saltan 1.000: es el precio de no repetir uno ya enviado.

## Qué prueba lo valida
- H5: 20 y 50 conexiones simultáneas pidiendo 100 números cada una: cero duplicados, cero interbloqueos, p95 de `siguiente` ≤ 50 ms; una reserva de 5.000 no retrasa a otros más de 100 ms; 50 solicitudes simultáneas con un grupo de 10 conexiones no se bloquean (prueba contra el agotamiento). Se agregan: **reservar tras restaurar un respaldo antiguo** (`contador_reparar`); **SKU con código a mano que ocupa el siguiente**; **dos traslados cruzados en sentido contrario, 200 veces, sin interbloqueo no reintentado**; misma clave de idempotencia con petición distinta.
- H4: 50 aprobaciones simultáneas: gana exactamente una; 200 intentos sobre 100 puestos: exactamente 100 éxitos.
- Una prueba por patrón (QA), incluida la de dos recepciones a la vez de la misma orden (D-016); la constante de claves coincide con los prefijos reservados.

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| D15-1 | Incorporado: `siguiente` como función SQL de un viaje, INVOKER. Compatible con la observación de Seguridad (no es DEFINER que reciba la empresa como prueba de identidad). |
| D15-2 | Incorporado (forma exacta, `CHECK`, `fillfactor`). |
| D15-3 | Incorporado: `contador_reparar`. |
| D15-4 | Incorporado: bloque pequeño y reintentos. |
| D15-5 | Incorporado. Elegí `doc:ACTV` en lugar de `activo`, para tener una sola forma. |
| D15-6, D15-7, D15-8 | Incorporados. |
