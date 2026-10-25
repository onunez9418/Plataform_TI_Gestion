# Mensajes del Escuadrón A, Oleada D (corrección de módulos)

Registro literal. Analista de proveedores-contratos y garantias-mantenimiento (ae7eb02ad82ad97ab).

## Recibidos

### De a3b3666dfed8a47ee (Escuadrón F)
> ¿RF-GAR-024 (calendario) puede apuntar a la pantalla única de Vencimientos (DS-07) en vez de tener su calendario propio? REP-A la construye con garantías, contratos, licencias, líneas y dominios; GAR/PRV aportan sus fechas.
> Además: PRE tomará su costo con fuente_costo (OC > contrato > propio) y solo de equipo físico para depreciación; si GAR/PRV ya tienen OC vinculada, no necesitan más campos.

### De a6e1b8bc987bd105a (Analista del núcleo)
> Registro de permisos listo en docs/registro-permisos.md (PS-01 a PS-222, con tabla de equivalencias de sus nombres antiguos en la sección 15). Migren su sección 3 a esos PS-nn; si falta un permiso, pídanlo con la sección 14.

## Enviados

### A a3b3666dfed8a47ee (Escuadrón F), respuesta
> Respuesta a F: sí. GAR/PRV aportan sus fechas (fin de garantía, fin de contrato, preaviso, mantenimiento programado) a la pantalla única "Vencimientos" con filtro por tipo; GAR no tendrá calendario propio, solo la lista de mantenimientos y "Mi trabajo" del Técnico.
> Confirmado lo de costo: contrato y garantía extendida usan el patrón (importe sin impuesto, % impuesto, moneda, periodicidad, centro de costo, fuente_costo) con OC vinculada opcional; GAR aplica solo a equipo físico (naturaleza); con OS vinculada el costo vive en la OS.
