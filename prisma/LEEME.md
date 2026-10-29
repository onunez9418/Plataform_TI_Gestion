# Base de datos (Datos) · Versión local 0.1

Todo lo que toca la base vive aquí y en `src/nucleo/aislamiento` y `src/nucleo/contadores`.

## Cómo se arma
1. Los **roles** (`migraciones`, `app_empresa`, `app_plataforma`, `lector_auditoria`) los crea `scripts/db-init/` (DevOps) con contraseñas del entorno. La base debe ser **UTF-8** y su dueño `migraciones`.
2. `npm run db:migrar` aplica `prisma/migrations/*` con el rol `migraciones` (SQL escrito a mano; solo `prisma migrate deploy`, nunca `migrate dev`).
3. `npm run db:semilla` carga Alfa y Beta (datos inventados). Es repetible: si la empresa ya tiene datos, la omite.
4. `npm run db:reiniciar` ejecuta `prisma/reiniciar.sql` (borra el esquema), migra y siembra. Solo para la versión local.

| Migración | Contenido |
|---|---|
| `0001_base_acceso` | funciones de apoyo, macro `aplicar_aislamiento`, `empresa`, `usuario`, `sesion`, `enlace_ingreso` (globales); `rol`, `rol_permiso`, `membresia`, `auditoria` (empresa); `mis_empresas()` |
| `0002_catalogos_sku` | `ubicacion`, `proveedor`, `persona`, `categoria`, `campo_definicion`, `contador` + `siguiente()`, `sku` |
| `0003_inventario` | `activo`, `existencia`, `asignacion`, `valor_campo`, transiciones de estado |
| `0004_compras` | `orden_compra`, `orden_linea`, `orden_aprobacion`, `recepcion`, `recepcion_linea` |
| `0005_siguiente_sin_residuo` | corrige `siguiente()`: no deja la empresa fijada (DEF-AIS-01 de QA) |

## Reglas de oro
- Toda tabla de empresa se crea con `SELECT aplicar_aislamiento('tabla')`: `empresa_id`, FORCE RLS, política única, permisos mínimos. Sin la empresa fijada: **cero filas, sin error**.
- La empresa solo se fija en `conEmpresa(empresaId, fn)`. Nadie más llama a `set_config` (el SQL de los servicios que lo intente se rechaza).
- Nada se borra: `app_empresa` no tiene `DELETE` salvo en `rol_permiso` y `orden_linea` (borradores). La auditoría y las aprobaciones y recepciones **solo se agregan**.
- Una tabla nueva = una migración nueva (`0005_...`); nunca se edita una migración ya publicada.

## Cómo probar el aislamiento
- Guion SQL (entra como `app_empresa`): `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/verificar-aislamiento.sql` (14 líneas `PASA`).
- Pruebas con base real (200 y tantas peticiones intercaladas, conexión cortada, contadores, reglas): `PRUEBAS_BD=1 DATABASE_URL=... PLATFORM_DATABASE_URL=... npx vitest run --config vitest.base.config.mts src/nucleo`.
