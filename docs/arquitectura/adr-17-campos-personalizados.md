# ADR-17 · Marco único de campos personalizados (T-13)

**Estado:** Propuesto (revisado 2026-10-29 tras la revisión de Datos) · **Decide:** Gerente de TI (con Ingeniero de Datos) · **Base:** D-005, D-035, D-072.2, H-ARQ-06, H-ARQ-18; D17-1 a D17-7

## Contexto
Los campos personalizados los usarán SKU, unidades, el formulario de cada servicio de la mesa de ayuda, las importaciones, las exportaciones y la API. "Pendiente de completar" debe ser una cifra de tableros sobre 100.000 activos sin recorrer JSON en cada consulta. La clave de una licencia es un campo **secreto**, nunca la serie.

## Opciones
1. Una tabla de valores por campo (entidad-atributo-valor). Descartada: consultas lentas y complejas.
2. Columnas dinámicas por empresa. Descartada: exige DDL en tiempo de ejecución.
3. **JSON validado + definiciones + tablas auxiliares puntuales.** Elegida.

## Decisión
- **Definiciones:** tabla `campo_definicion(empresa_id, ambito, categoria_id, clave, nombre, tipo, obligatorio, filtrable, identificador, largo_exacto, dato_personal, opciones, orden)`. `ambito` ∈ `sku | unidad | servicio_ayuda`. **Seis tipos:** texto, número, fecha, lista, sí/no y **secreto**. Límites de D-072.1 (nombre de campo 60, texto 255, 100 opciones, 40 campos por categoría, secreto 512). Las claves del JSON de valores son el **identificador estable** del campo (`campo_definicion.clave`, RF-CAT-021), nunca el nombre; `valores` lleva `CHECK (jsonb_typeof(valores) = 'object')`. **Unicidad de definiciones (D17-4):** `UNIQUE (empresa_id, ambito, categoria_id, clave)` permanente y `UNIQUE (empresa_id, ambito, categoria_id, nombre_norm) WHERE activo` (el servicio de mesa de ayuda usa `servicio_id` en lugar de `categoria_id`; la macro admite una columna alternativa). Que una subcategoría no repita el nombre de un campo de su categoría principal (RF-CAT-010) no lo expresa un índice: lo comprueba un disparador `BEFORE INSERT/UPDATE` con prueba propia.
- **Un validador de servidor** `validarCampos(definiciones, valores)` genera el esquema de validación (Zod) desde las definiciones; lo usan pantallas, importación, API y mesa de ayuda. Nadie valida por su cuenta.
- **Valores** en `valores jsonb` de la entidad. Solo los campos marcados **filtrables** se copian además a `valores_filtrables jsonb`, con **un** índice GIN. Se descarta un índice por campo: exigiría DDL en tiempo de ejecución con un rol que no es dueño; si una consulta de rango sobre un campo numérico o de fecha resulta lenta al medirla, se agrega una columna generada por una migración (nunca en ejecución). **H10 mide con 100.000 activos y dos empresas** (D17-2): (A) `GIN (valores_filtrables jsonb_path_ops)` más el índice `(empresa_id, sku_id)`; (B) `GIN (empresa_id, valores_filtrables jsonb_path_ops)` con `btree_gin` si la versión elegida lo soporta para `uuid`. Se queda la más simple que cumpla RNF-011. Más un índice parcial `(empresa_id, sku_id) WHERE NOT completo` para "pendiente de completar", que es una cifra de tablero.
- **Secreto:** nunca en el JSON. Tabla `valor_secreto(empresa_id, activo_id, sku_id, definicion_id, cifrado, mascara, version_llave)`: **dos columnas por tipo de entidad con clave foránea compuesta y `CHECK` de una sola llena** (D-039.7), clave primaria `(empresa_id, definicion_id, <entidad>)`, índice `(empresa_id, version_llave)` para la rotación de llaves, `sin_soporte` (ADR-03; sin permiso para `app_soporte`) y fuera de la lectura de `lector_auditoria`. Cifrado según ADR-07. No se busca, no aparece en historial (dice "clave cambiada"), auditoría, exportaciones, importaciones, reportes, API, avisos ni correos (D-035.2). La `mascara` se calcula al escribir: últimos 4 caracteres solo si la clave tiene 16 o más.
- **Identificador** (IMEI, número de línea): tabla `identificador_unico(empresa_id, definicion_id, valor_norm, activo_id, sku_id, anulado_en)`: la entidad no es una referencia genérica sino **dos columnas con clave foránea compuesta y `CHECK` de una sola llena** (D-039.7). Índice único parcial exacto `UNIQUE (empresa_id, definicion_id, valor_norm) WHERE anulado_en IS NULL`. `anulado_en` lo copia **la misma función que anula la unidad** (lote deshecho, D-050.5) en la misma transacción, mediante un disparador en la tabla de activos que propaga la marca; sin eso, anular un lote dejaría el IMEI ocupado para siempre y el reintento del archivo corregido fallaría con "ya existe". Escrita en la misma transacción que el valor. Normalizado con las funciones versionadas de ADR-06; `largo_exacto` opcional; rechazo de series dañadas por Excel (D-072.2). **La unicidad es por definición de campo** (cada categoría con su "IMEI" es una definición distinta); si el Analista decide que un IMEI no puede repetirse entre un Celular y una Tablet (pregunta abierta, no es del CEO), se agrega `clase_identificador` (p. ej. `'imei'`) y el índice pasa a ser por clase.
- **Completo/incompleto:** `completo boolean` guardado al escribir. Cuando cambian las definiciones, el trabajo de recálculo (ADR-02) procesa **lotes de 1.000 por empresa con paginación por clave** (`WHERE id > $ultimo ORDER BY id LIMIT 1000`), una transacción por lote, con una columna `definiciones_version` en la entidad para saber qué filas ya se recalcularon: es reanudable e idempotente y un cambio de definición no bloquea las ediciones del resto (D17-3).
- **Dato personal:** la marca `dato_personal` alimenta la lista cerrada de campos que la auditoría no guarda por valor (ADR-11) **y el mapa de anonimización** (ADR-12): cuando un campo con esa marca está en una unidad, `anonimizar` sabe qué hacer según la regla del módulo. Un campo nuevo con dato personal no pasa a desarrollo sin declararse.
- **Migración de Celulares a Líneas (D17-7):** cuando el módulo de Líneas se active (RF-CAT-029), el asistente de migración **anula** las filas de `identificador_unico` del campo "número de línea" de la unidad (misma transacción) y crea las líneas; si no, el mismo número quedaría ocupado en dos tablas. Se anota para el escuadrón B.
- **Naturaleza de la categoría** (D-045: equipo físico, licencia, servicio) es fija y heredada; el motor la usa para decidir qué reglas aplican.

## Consecuencias
- Dos copias de los filtrables (en `valores` y `valores_filtrables`) se escriben siempre juntas por la misma función.
- Un cambio de tipo de campo con valores existentes se rechaza (migración de datos explícita).
- La serie de una licencia es un código interno visible; la clave vive en otra tabla.

## Qué prueba lo valida
- Prueba por tipo: valor inválido rechazado igual desde pantalla, importación y API.
- Prueba del campo secreto: no aparece en volcado de la base ni de la exportación (ADR-09/19); revelar exige permiso, reautenticación y deja auditoría sin el valor.
- Unicidad del identificador con dos empresas con el mismo IMEI (permitido) y dentro de una (rechazado); anulado libera el valor.
- 100.000 unidades: consulta con filtro por campo filtrable usa el GIN (plan de ejecución) y cumple RNF-011.
- **Anular un lote libera el IMEI** (el reintento del archivo corregido entra); subcategoría con nombre de campo repetido se rechaza; recalcular `completo` con corte de conexión a mitad continúa donde quedó; el secreto no es legible con `app_soporte` ni con `lector_auditoria`.

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| D17-1 | Incorporado: `anulado_en` propagado, dos columnas de entidad, unicidad por definición (con la pregunta al Analista sobre `clase_identificador`). |
| D17-2 | Incorporado como medición en H10 y el índice de incompletos. |
| D17-3, D17-4 | Incorporados. |
| D17-5 | Incorporado: `valor_secreto` con dos columnas por tipo, índice de rotación, sin soporte ni lector de auditoría. |
| D17-6 | Incorporado: la marca alimenta el mapa de ADR-12. |
| D17-7 | Incorporado como nota para el escuadrón B.
