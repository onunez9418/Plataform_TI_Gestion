# ADR-06 · Convenciones del esquema de datos (T-4)

**Estado:** Propuesto (revisado 2026-10-29 tras la revisión de Datos) · **Decide:** Gerente de TI (con Ingeniero de Datos) · **Base:** D-055 T-4, H-ARQ-24, D-044.7, D-070.6, D-072; D06-1 a D06-8; `indices-claves-naturales.md`

## Contexto
Sin convenciones, 17 módulos escriben el esquema de 17 maneras. Prisma no expresa la seguridad por fila, particiones, índices parciales, columnas generadas ni funciones.

## Decisión

| Tema | Regla |
|---|---|
| Versión de PostgreSQL | **15 o superior** (recomendado 16 o 17; con 17 se dispone de `transaction_timeout`, ADR-03). Necesaria para `UNIQUE NULLS NOT DISTINCT`. DevOps confirma lo que ofrece el proveedor |
| Identificadores | **UUID v7** (ordenado en el tiempo, no adivinable), generado por el servicio. Si el proveedor ofrece PostgreSQL 18 o superior, además `DEFAULT uuidv7()`; si no, una función SQL `uuid_v7()` propia y documentada, para guiones de datos y migraciones escritas en SQL. Nunca autoincrementales visibles |
| Empresa | Toda tabla de negocio nace con `aplicar_aislamiento` (ADR-03): `empresa_id`, **clave primaria `(empresa_id, id)`**, claves foráneas compuestas, índices que empiezan por `empresa_id` |
| Nombres | Tablas en singular y en español sin tildes, `snake_case`; `creado_en`, `creado_por_membresia_id`; los "autor" apuntan a la **membresía** (D-041) |
| Normalización (RN-012) | Las claves naturales usan columnas `*_norm` calculadas por **funciones propias `IMMUTABLE` y versionadas** (`norm_codigo_v1`, `norm_correo_v1`, `norm_id_fiscal_v1`, `norm_serie_v1`, ...), escritas con `lower`, `btrim`, `regexp_replace` y `translate` explícitos. Columna generada (`GENERATED ALWAYS AS (...) STORED`) cuando la normalización es SQL puro. Cuando necesita una biblioteca (número de línea con el código de país de la empresa; dominio en forma `punycode`), la calcula **el servicio** y la base solo exige el formato con un `CHECK` (`numero_norm ~ '^[0-9]{6,15}$'`). Una prueba compara las funciones SQL con el normalizador del código sobre la tabla de casos de la ronda 2. **No se usa `citext` ni `unaccent` para claves únicas**: `unaccent()` es `STABLE` y no sirve en columna generada ni en índice, y su diccionario puede cambiar al actualizar PostgreSQL; `citext` compara con las reglas de idioma de la base y un cambio o una restauración en otro servidor puede dejar un índice único inconsistente. Un cambio de la función exige una migración que recalcula y reindexa (por eso `_v1`). Las búsquedas sin tildes usan una columna `*_busq` con la misma regla y un índice de trigramas. En Prisma las columnas generadas se declaran con `@default(dbgenerated())` y una prueba lo confirma |
| Dinero | `numeric(19,4)` con moneda (clave foránea a `moneda`); porcentajes `numeric(7,4)`; tipos `Dinero` y `ObligacionRecurrente` en código y **una** función de costo mensual equivalente (D-044) |
| Cantidades de stock | `numeric(14,3)` con `CHECK (cantidad >= 0)` en el saldo y la validación de enteros por unidad en el servicio; tope de 10.000.000 (D-072.1) por `CHECK`. **Propuesta de Datos, a confirmar por el Analista** (RF-INV-023 no dice cuántos decimales) |
| Fechas | `date` para fechas de calendario (vencimientos); `timestamptz` en hora universal para momentos. "Hoy" siempre con `hoyEnEmpresa()` (D-062.2) |
| Concurrencia | Columna `version integer` en toda entidad editable (RN-014); patrones del ADR-15 |
| Estados | `CHECK` sobre `text` con la lista cerrada, **no** tipos `enum` de PostgreSQL ni de Prisma (agregar un valor a un `enum` exige una migración especial y la lista de 17 módulos cambiará vivo). Las 25 transiciones del activo (RF-INV-010) son una función SQL `transicion_valida(desde, hacia)` usada por un `CHECK` de la tabla de cambios de estado, con tabla de verdad probada por QA. Vocabulario de D-049.5 |
| "Una abierta a la vez" | Columnas `desde`/`hasta` + índice único parcial `WHERE hasta IS NULL` **y**, en las tablas de historial con rango (asignación de activo, asignación de línea, asociación línea-equipo, vínculo certificado-dominio, relación de CMDB), una restricción `EXCLUDE USING gist (empresa_id WITH =, <entidad>_id WITH =, tstzrange(desde, hasta) WITH &&)` (`daterange` si son fechas de calendario) para que el historial no se solape. El índice parcial solo protege la fila abierta; una corrección de fechas o una importación podrían cruzar tramos pasados |
| Borrado | Físico **solo** en borradores sin hijos; lo demás se desactiva o anula |
| Claves naturales | Cada clave se clasifica en una de cuatro clases y se escribe con **predicados que solo usan `IS NULL`** (nunca listas de estados, que cambian y obligan a recrear el índice): **P** permanente (código de SKU, serie del activo, correlativos: no se libera nunca); **L** libera al anular (`anulado_en IS NULL`: lote deshecho o documento anulado); **B** libera al dar de baja o desactivar (`baja_en IS NULL`: dominio, línea, certificado); **V** vigente (`hasta IS NULL`); más **A** libera al anonimizar (el valor pasa a NULL y el índice ignora los nulos). Tres columnas de marca, todas `timestamptz NULL`: `anulado_en`, `baja_en` y, para Personas, el propio valor en NULL. Un `CHECK` mantiene coherente la marca con el estado (`estado = 'baja' <=> baja_en IS NOT NULL`). La clasificación de cada clave, con su requisito, está en `indices-claves-naturales.md`; los índices se llaman `uq_<tabla>__<clave>` (el nombre es parte del contrato: ADR-18 lo usa para traducir `23505`) |
| Claves con campo opcional | `UNIQUE ... NULLS NOT DISTINCT` donde una columna de la clave puede ser nula y aun así debe contarse (ubicación bajo el mismo superior cuando el superior es nulo, RF-CAT-006: sin esa opción dos "Sede Central" raíz conviven) |
| Extensiones | `pg_trgm`, `btree_gist`, `pgcrypto`, y `btree_gin` solo si H10 elige esa variante (ADR-17). **Ya no** `citext` ni `unaccent`. DevOps confirma en el proveedor |

### Prisma y SQL
`schema.prisma` describe el modelo, pero lo que Prisma no puede expresar va en **SQL escrito a mano dentro de la migración** (llamadas a la macro, particiones, parciales, generadas, funciones, políticas, permisos, `EXCLUDE`).
- **Solo se usa `prisma migrate deploy`** (nunca `migrate dev` contra el esquema real: podría generar una migración que borre lo que Prisma no modela). Las migraciones se escriben a mano.
- La divergencia **no** se controla con `prisma migrate diff` sobre todo el esquema (daría falsos positivos con cada índice parcial, columna generada, política, disparador y partición, y el equipo aprendería a ignorarlo). Se controla con una **fotografía normalizada del esquema** (`pg_dump --schema-only` de una base creada solo con las migraciones, sin comentarios ni orden) guardada en el repositorio y comparada en CI; `migrate diff` se usa solo para las tablas y columnas que Prisma sí modela.
- `src/db/objetos-solo-sql.md` se **genera** desde el catálogo en lugar de mantenerse a mano. H10 confirma el comportamiento con las versiones elegidas.
- Toda migración es versionada y revisada; ninguna se aplica "a mano" en producción (D-003).

## Opciones descartadas
- Identificadores numéricos: adivinables; se descartan por seguridad.
- UUID v4: fragmenta los índices de tablas grandes (movimientos, auditoría).
- Un ORM distinto: no hay hechos que lo justifiquen; plan B es Kysely en la capa de datos (ADR-03).
- `citext`/`unaccent` para claves: ver Normalización.
- Tipos `enum`: ver Estados.

## Consecuencias
- Más SQL en las migraciones que un proyecto Prisma típico; a cambio, las garantías viven en la base.
- Cada migración que crea tabla pasa por la macro; una tabla sin ella falla en CI.
- Cambiar una función de normalización es una migración con recálculo y reindexado.

## Qué prueba lo valida
- La prueba genérica de aislamiento (ADR-03) y la fotografía del esquema sin divergencias (H10).
- Prueba de convenciones: toda tabla de negocio tiene `id uuid`, `empresa_id`, `creado_en`; toda entidad editable tiene `version`; ningún `float` para dinero; todo índice único de clave natural está en `indices-claves-naturales.md` y al revés.
- Casos de normalización de las funciones SQL contra el normalizador del código; `NULLS NOT DISTINCT` en ubicación raíz; solape de historial rechazado; las columnas generadas no las escribe Prisma.
- Ejemplos de redondeo de D-044.7 y D-072.4 como pruebas unitarias de `Dinero`.

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| D06-1 (bloqueante) | Incorporado: funciones `IMMUTABLE` versionadas; fuera `citext` y `unaccent`; las extensiones cambian. |
| D06-2 | Incorporado: clases P/L/B/V/A y tres marcas, con predicados solo `IS NULL`. |
| D06-3 | Incorporado: PostgreSQL 15 o superior y `NULLS NOT DISTINCT`. |
| D06-4 | Incorporado: `EXCLUDE` contra solapes. |
| D06-5 | Incorporado: fotografía del esquema y solo `migrate deploy`. |
| D06-6, D06-7, D06-8 | Incorporados; D06-7 queda como propuesta a confirmar por el Analista. |
| H-SEG-41 (5) | Las particiones y el recorrido de índices únicos están en ADR-03; aquí se fija que toda clave única empieza por `empresa_id`. |
