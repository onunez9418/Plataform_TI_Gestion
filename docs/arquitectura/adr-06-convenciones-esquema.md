# ADR-06 · Convenciones del esquema de datos (T-4)

**Estado:** Propuesto · **Decide:** Gerente de TI (con Ingeniero de Datos) · **Base:** D-055 T-4, H-ARQ-24, D-044.7, D-072

## Contexto
Sin convenciones, 17 módulos escriben el esquema de 17 maneras. Prisma no expresa la seguridad por fila, particiones, índices parciales, columnas generadas ni funciones.

## Decisión

| Tema | Regla |
|---|---|
| Identificadores | **UUID v7** (ordenado en el tiempo, no adivinable), generado por el servicio (o `uuid(7)` de Prisma si el prototipo lo confirma). Nunca autoincrementales visibles |
| Empresa | Toda tabla de negocio nace con `aplicar_aislamiento` (ADR-03): `empresa_id`, clave `UNIQUE (empresa_id, id)`, claves foráneas compuestas, índices que empiezan por `empresa_id` |
| Nombres | Tablas en singular y en español sin tildes, `snake_case`; `creado_en`, `creado_por_membresia_id`; los "autor" apuntan a la **membresía** (D-041) |
| Normalización (RN-012) | Columnas generadas `*_norm` (minúsculas, sin tildes donde corresponda, solo dígitos en teléfonos, forma técnica en dominios) con `citext` o índice único parcial |
| Dinero | `numeric(19,4)` con moneda (clave foránea a `moneda`); porcentajes `numeric(7,4)`; tipos `Dinero` y `ObligacionRecurrente` en código y **una** función de costo mensual equivalente (D-044) |
| Fechas | `date` para fechas de calendario (vencimientos); `timestamptz` en hora universal para momentos. "Hoy" siempre con `hoyEnEmpresa()` (D-062.2) |
| Concurrencia | Columna `version integer` en toda entidad editable (RN-014); patrones del ADR-15 |
| Estados | `CHECK` con la lista cerrada y una función de transiciones válidas; vocabulario de D-049.5 |
| "Una abierta a la vez" | Columnas `desde`/`hasta` + índice único parcial `WHERE hasta IS NULL` |
| Borrado | Físico **solo** en borradores sin hijos; lo demás se desactiva o anula |
| Claves naturales | Todo índice único de clave natural excluye lo anulado (D-070.6) |
| Extensiones | `citext`, `unaccent`, `pg_trgm`, `btree_gist`, `pgcrypto` (DevOps confirma en el proveedor) |

### Prisma y SQL
`schema.prisma` describe el modelo, pero lo que Prisma no puede expresar va en **SQL escrito a mano dentro de la migración** (llamadas a la macro, particiones, parciales, generadas, funciones, permisos). CI ejecuta `prisma migrate diff` y falla si el esquema y las migraciones divergen; los objetos "solo SQL" se listan en `src/db/objetos-solo-sql.md` para que nadie los borre al regenerar. Toda migración es versionada y revisada; ninguna se aplica "a mano" en producción (D-003).

## Opciones descartadas
- Identificadores numéricos: adivinables y fragmentan menos solo si son locales; se descarta por seguridad.
- UUID v4: fragmenta los índices de tablas grandes (movimientos, auditoría).
- Un ORM distinto: no hay hechos que lo justifiquen; plan B es Kysely en la capa de datos (ADR-03).

## Consecuencias
- Más SQL en las migraciones que un proyecto Prisma típico; a cambio, las garantías viven en la base.
- Cada migración que crea tabla pasa por la macro; una tabla sin ella falla en CI.

## Qué prueba lo valida
- La prueba genérica de aislamiento (ADR-03) y `migrate diff` sin divergencias (H10).
- Prueba de convenciones: toda tabla de negocio tiene `id uuid`, `empresa_id`, `creado_en`; toda entidad editable tiene `version`; ningún `float` para dinero.
- Ejemplos de redondeo de D-044.7 y D-072.4 como pruebas unitarias de `Dinero`.
