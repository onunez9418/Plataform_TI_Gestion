# Arquitectura: registros de decisión (ADR)

**Autor:** Arquitecto de Software · **Fecha:** 2026-10-26 · **Estado:** Propuesto (pasa a "Aceptado" cuando el Gerente de TI firma cada uno)
**Base:** decisiones D-025, D-030, D-032, D-035, D-038, D-039, D-045, D-048, D-050, D-055, D-061, D-062, D-065, D-070, D-073 de `docs/equipo/decisiones.md` y hallazgos de `docs/revision-cruzada/arquitecto-software.md`.

## Para el CEO, sin jerga

Estos documentos explican **cómo se construye por dentro** la plataforma, para que sea segura y fácil de mantener: cómo se separan los datos de cada empresa, cómo se guardan las claves, cómo se registran los cambios y qué hace la plataforma "en segundo plano" (por ejemplo, enviar correos o avisar de vencimientos). No le piden ninguna decisión: todo lo que tiene costo (alojamiento, correo, almacenamiento de copias) ya estaba en su lista de gastos, y nada de lo que aquí se describe borra o anonimiza información real antes de que un abogado lo confirme. Antes de escribir la primera pantalla real, el equipo hará una **prueba técnica de 3 a 4 días** con datos inventados para comprobar que estas ideas funcionan; si algo falla, se corrige antes de gastar tiempo en construir encima.

## Índice de ADR

Cada ADR es corto: contexto, opciones, decisión, consecuencias y **qué prueba lo valida**.

| ADR | Tema | Decisión técnica (D-055) |
|---|---|---|
| [01](adr-01-ejecucion-alojamiento.md) | Ejecución continua, trabajador y base gestionada | T-1 |
| [02](adr-02-cola-trabajos-eventos.md) | Cola de trabajos en PostgreSQL, eventos, programador, reloj | T-2 |
| [03](adr-03-aislamiento-empresa-rls.md) | Aislamiento por empresa con seguridad por fila; **lectura de soporte** | T-3 |
| [04](adr-04-roles-base-tablas-globales.md) | Cinco roles de base y lista cerrada de tablas globales | T-3 |
| [05](adr-05-empresa-activa-en-direccion.md) | La empresa activa va en la dirección | T-3 |
| [06](adr-06-convenciones-esquema.md) | Convenciones del esquema de datos | T-4 |
| [07](adr-07-secretos-llaves.md) | Secretos y llaves (maestra fuera de la base) | T-5 |
| [08](adr-08-acceso-sesiones-2fa.md) | Acceso: sesiones en base, segunda verificación, enlace con botón | T-6 |
| [09](adr-09-huellas-rs51-codigo-corto.md) | Huellas de valores de entrada, prueba RS-51, código corto | T-6 / RS-51 |
| [10](adr-10-catalogo-permisos.md) | Registro de permisos como catálogo del código | T-7 |
| [11](adr-11-auditoria.md) | Auditoría: tres autores, partición mensual, purga | T-8 |
| [12](adr-12-registro-anonimizaciones.md) | Registro de anonimizaciones fuera de la base | T-8 |
| [13](adr-13-doble-control.md) | Servicio único de segunda persona (`requiereSegundaPersona`) | T-9 |
| [14](adr-14-estructura-modulos.md) | Estructura de carpetas, capa de servicios, registro de módulo | T-10 |
| [15](adr-15-contadores-concurrencia.md) | Correlativos atómicos y patrones de concurrencia | T-11 |
| [16](adr-16-limitador-correo.md) | Limitador de uso en base y capa única de correo | T-12 |
| [17](adr-17-campos-personalizados.md) | Marco único de campos personalizados | T-13 |
| [18](adr-18-importacion.md) | Importación con huella de archivo y filas en preparación | T-13 |
| [19](adr-19-puerta-exportacion.md) | Puerta única de exportación | D-061.1 |
| [20](adr-20-observabilidad.md) | Registros técnicos sin datos personales ni secretos | T-14 |

Además: [prototipo-tecnico.md](prototipo-tecnico.md) (alcance, criterios de éxito y fracaso de los 3 a 4 días previos a la Etapa 1).

## Piezas del sistema

```
 Personas (navegador)
        |
        v
 +--------------------+      +---------------------------+
 | Aplicación web     |      | Trabajador en segundo     |
 | (Next.js)          |      | plano (misma imagen)      |
 | /e/{empresa}/...   |      | cola, programador diario, |
 +---------+----------+      | correos, importaciones,   |
           |                 | exportaciones, PDF        |
   agrupador de conexiones   +------+----+----+----------+
   (modo transacción)               |    |    |
           |                conexión  |    |    |
           v                directa   |    |    |
 +-------------------------------+    |    |    +--> Correo (proveedor + segundo proveedor)
 | PostgreSQL gestionado         |<---+    |
 |  roles: app_empresa           |         +-------> Copia externa de la auditoría
 |         app_plataforma        |                   (solo agregar, encadenada, inmutable)
 |         migraciones           |
 |         mantenimiento         |         +-------> Almacén de anonimizaciones
 |         lector_auditoria      |                   (fuera de la base que se restaura)
 |  datos de negocio con empresa |
 |  + tablas globales (lista     |         +-------> Respaldo propio cifrado
 |    cerrada) + esquema `cola`  |                   (otro proveedor y otra cuenta)
 +-------------------------------+
                                            Gestor de secretos: llave maestra
                                            (fuera de la base y de los respaldos)
```

La consola de plataforma es una ruta aparte de la misma aplicación que usa solo el rol `app_plataforma`. La **lectura de soporte** no usa ese rol: es una transacción de solo lectura de una sola empresa (ADR-03).

## Una sola forma de hacer cada cosa

| Necesidad | Única función o servicio | ADR |
|---|---|---|
| Consultar datos de una empresa | `conEmpresa(empresaId, fn)` | 03 |
| Comprobar un permiso | `exigirPermiso(principal, permiso, recurso)` vía `definirServicio` | 10 |
| ¿Hace falta otra persona? | `requiereSegundaPersona(acto, monto, moneda)` y `dobleControl` | 13 |
| Número correlativo | `siguiente(empresa, clave, n)` | 15 |
| Guardar un valor que sirve para entrar | `huella(tipo, valor)` | 09 |
| Cifrar un secreto | `cifrar(proposito, alcance, valor)` | 07 |
| Escribir auditoría | `registrarAuditoria(...)` | 11 |
| Exportar datos | `puertaExportacion` | 19 |
| Enviar correo | `enviarCorreo(plantilla, ...)` | 16 |
| "Hoy" de una empresa | `hoyEnEmpresa()` | 02 |

## Orden de construcción recomendado

Principio: primero lo que todos usan; después lo que solo depende del núcleo; al final lo que mira a varios módulos (D-056).

### Núcleo (versión 1)

| Etapa | Qué se construye | ADR que la sostienen |
|---|---|---|
| 0 | **Prototipo técnico de 3 a 4 días**, estos ADR | todos |
| 1 | Contexto de empresa en la dirección; cinco roles de base, seguridad por fila y tablas globales; acceso con segunda verificación y sesiones en base; usuarios, membresías, invitaciones; roles y catálogo de permisos; **auditoría** (tres autores, partición mensual); gestión de secretos; **cola de trabajos y bus de eventos**; correo básico con reintentos y topes; consola de plataforma y lectura de soporte; contadores; calendario y zona horaria de la empresa; `modulo_activo`; esqueletos de campos e importación | 01 a 05, 07 a 11, 14 a 16, 20 |
| 2 | Catálogos (ubicación con superior, proveedor ampliado, centro de costo, área), **Personas** con datos personales aparte, categorías con naturaleza, **motor de campos** (tipo secreto e identificador), **registro de anonimizaciones**, **puerta de exportación** | 06, 12, 17, 19 |
| 3 | Maestro de SKU (stock mínimo opcional) | 15, 17 |
| 4 | Inventario, estados, asignación y actas, **importación** (marco único), búsqueda y exportación, cifrado de claves de licencia, pendientes de la persona (registro de módulo), costo del activo corregible; **prueba de carga nocturna** | 07, 14, 18 |
| 5 | Órdenes de compra y recepción, **doble control**, aprobaciones, avisos de aprobación | 13 |
| 6 | Órdenes de servicio (con costo) | 13, 14 |
| 7 | Pulido, restauración por empresa, salida a producción | todos |

### Olas después de la Etapa 7 (no se construyen antes de que el CEO apruebe la Etapa 7)

| Ola | Módulos | Depende de |
|---|---|---|
| A | Notificaciones completas | Cola y bus (Etapa 1) |
| B | Dominios; Proveedores y contratos (parte B); Licencias; Líneas; Garantías (parte B) | Ola A, Personas, Inventario; Proveedores B antes que Garantías B |
| C | Mesa de ayuda; Altas y bajas | Órdenes de servicio, Personas, Inventario, Ola A |
| D | Portal de autoservicio | Mesa de ayuda, Actas, Personas |
| E | CMDB, luego Cambios, luego Problemas; Presupuesto, Reportes, Integraciones y API según su parte | Inventario, Personas y los de la ola B si están |

Lo que cada módulo futuro necesita del núcleo (cola, bus, registro de módulo, tipo de autor "sistema", campo secreto, naturaleza de categoría, ubicación con superior, proveedor ampliado) se **prepara en la Etapa 1 a 4** aunque el módulo llegue después.

## Cómo se cambia un ADR

Un ADR aceptado no se edita en silencio: se agrega una sección "Cambios" con fecha y decisión que lo motiva. Si un ADR contradice una decisión D-0xx, vale la D-0xx hasta que el Gerente de TI decida; las diferencias que este conjunto introduce están en la nota final de la entrega y en cada sección "Consecuencias".
