# Arquitectura: registros de decisión (ADR)

**Autor:** Arquitecto de Software · **Fecha:** 2026-10-26 · **Revisado:** 2026-10-29 (tras la ronda 6 de Seguridad) · **Estado:** Propuesto (pasa a "Aceptado" cuando el Gerente de TI firma cada uno)
**Base:** decisiones D-025, D-030, D-032, D-035, D-038, D-039, D-045, D-048, D-050, D-055, D-061, D-062, D-065, D-070, D-073, D-077, D-080 de `docs/equipo/decisiones.md`; hallazgos de `docs/revision-cruzada/arquitecto-software.md`; revisión de Seguridad `docs/revision-cruzada/ronda5-seguridad-adr.md` (H-SEG-33 a 62) y `ronda6-seguridad-adr.md` (verificación de los 30 y H-SEG-63 a 78); decisiones D-102 a D-110 (chat de admisión de casos); revisión de Datos `revision-datos.md`, `indices-claves-naturales.md` y `adr-18-importacion-revision-datos.md`; módulos `docs/modulos/microsoft-entra-intune.md` y `docs/modulos/asistente-ia.md`.

## Para el CEO, sin jerga

Estos documentos explican **cómo se construye por dentro** la plataforma, para que sea segura y fácil de mantener: cómo se separan los datos de cada empresa, cómo se guardan las claves, cómo se registran los cambios y qué hace la plataforma "en segundo plano" (por ejemplo, enviar correos o avisar de vencimientos). Nada de lo que aquí se describe borra o anonimiza información real antes de que un abogado lo confirme.

**Qué cambió esta semana.** Seguridad y el área de datos revisaron los 20 registros originales y encontraron 30 y más de 60 puntos de mejora; los más serios eran de papel (cuatro de Seguridad y ocho de Datos) y ya están corregidos antes de escribir código. Lo más visible: quien administra la plataforma queda todavía más separado de los datos de las empresas (tendrá su propia dirección, su propio acceso con llave física y no podrá abrir información cifrada), los archivos exportados solo los puede bajar quien los pidió y solo una vez, y las claves de ingreso no dependen de una sola llave maestra. Se agregaron cuatro registros nuevos: la conexión con Microsoft (Entra ID e Intune), el asistente de IA con su botón flotante, la forma de pausar borrados durante un incidente de seguridad y el chat de admisión de casos. En la ronda 6 Seguridad volvió a revisar todo: no halló fallos graves; las mejoras que pidió (quién puede generar los enlaces de acceso, cómo aprueba un contacto externo, dos personas para abrir el envío de textos al proveedor de IA) ya están escritas, y tres de ellas esperan la ratificación del Gerente de TI.

**Lo que le tocará decidir a usted, y solo si ocurre:**
1. **Posible gasto pequeño nuevo:** poner la consola de la plataforma en su propio servicio puede sumar un costo mensual al alojamiento. No damos cifras: DevOps las verifica. El equipo recomienda hacerlo igual por seguridad. **[ESCALAR AL CEO]**
2. **Asistente de IA:** cobra por uso y envía texto de las empresas a un proveedor externo. Antes de activarlo usted deberá aprobar el proveedor, el tope mensual y, con un abogado, el envío de datos. Ya estaba marcado en el módulo del asistente; aquí queda un diseño con **dos topes independientes** (uno nuestro y otro en la cuenta del proveedor, que verifica DevOps; mientras el segundo no exista no se promete un gasto «acotado por construcción»). El proveedor es Claude (Anthropic), decisión suya, y el primer uso será un chat para que los empleados llenen bien un caso de mesa de ayuda. **[ESCALAR AL CEO]**
3. **Conexión con Microsoft:** solo lee (nunca modifica nada en Microsoft). Las licencias de Intune son de cada empresa. Si algún día quiere bloquear o borrar equipos desde la plataforma, eso es irreversible y se le consultará. **[ESCALAR AL CEO] solo en ese caso.**

Antes de escribir la primera pantalla real, el equipo hará una **prueba técnica de 4 días, más 1 de reserva** (antes 3 a 4), con datos inventados para comprobar que estas ideas funcionan; si algo falla, se corrige antes de gastar tiempo en construir encima.

## Índice de ADR

Cada ADR es corto: contexto, opciones, decisión, consecuencias, **qué prueba lo valida** y **qué cambió tras la revisión**.

| ADR | Tema | Decisión técnica (D-055) |
|---|---|---|
| [01](adr-01-ejecucion-alojamiento.md) | Ejecución continua, trabajador, **consola aparte**, credenciales por proceso, cabeceras de seguridad | T-1 |
| [02](adr-02-cola-trabajos-eventos.md) | Cola de trabajos en PostgreSQL, eventos, programador, reloj, **errores sin datos personales** | T-2 |
| [03](adr-03-aislamiento-empresa-rls.md) | Aislamiento por empresa con seguridad por fila; puerta de las funciones; **lectura de soporte en tres pasos** | T-3 |
| [04](adr-04-roles-base-tablas-globales.md) | **Seis** roles de base (con **dos cuentas** para `app_empresa`, propuesta), lista cerrada de tablas globales (18) y de funciones (completa tras la ronda 6) | T-3 |
| [05](adr-05-empresa-activa-en-direccion.md) | La empresa activa va en la dirección | T-3 |
| [06](adr-06-convenciones-esquema.md) | Convenciones del esquema de datos (normalización, claves naturales, PostgreSQL 15+) | T-4 |
| [07](adr-07-secretos-llaves.md) | Secretos y llaves (maestra fuera de la base; pérdida y filtración) | T-5 |
| [08](adr-08-acceso-sesiones-2fa.md) | Acceso: sesiones en base, segunda verificación, enlace con botón, **sesión de plataforma** | T-6 |
| [09](adr-09-huellas-rs51-codigo-corto.md) | Huellas de valores de entrada (**dos niveles**), prueba RS-51, código corto | T-6 / RS-51 |
| [10](adr-10-catalogo-permisos.md) | Registro de permisos como catálogo del código | T-7 |
| [11](adr-11-auditoria.md) | Auditoría: **cuatro** autores, partición mensual, **copia externa**, purga | T-8 |
| [12](adr-12-registro-anonimizaciones.md) | Registro de anonimizaciones y de constancias de purga fuera de la base | T-8 |
| [13](adr-13-doble-control.md) | Servicio único de segunda persona (`requiereSegundaPersona`) | T-9 |
| [14](adr-14-estructura-modulos.md) | Estructura de carpetas, capa de servicios, registro de módulo | T-10 |
| [15](adr-15-contadores-concurrencia.md) | Correlativos atómicos y patrones de concurrencia | T-11 |
| [16](adr-16-limitador-correo.md) | Limitador de uso en base y capa única de correo | T-12 |
| [17](adr-17-campos-personalizados.md) | Marco único de campos personalizados | T-13 |
| [18](adr-18-importacion.md) | Importación: huella, filas en preparación y deshacer (incorpora [la propuesta de Datos](adr-18-importacion-revision-datos.md)) | T-13 |
| [19](adr-19-puerta-exportacion.md) | Puerta única de exportación (descarga única atada al solicitante) | D-061.1 |
| [20](adr-20-observabilidad.md) | Registros técnicos sin datos personales ni secretos | T-14 |
| [21](adr-21-integracion-microsoft-graph.md) | **Nuevo.** Integración con Microsoft Graph (Entra ID e Intune) | Módulo MSF |
| [22](adr-22-asistente-ia.md) | **Nuevo.** Asistente de IA (proveedor Claude, D-102) | Módulo ASI |
| [23](adr-23-acciones-plataforma-congelacion.md) | **Nuevo.** Acciones de plataforma con segunda persona dentro de la base, contacto autorizado y congelación por incidente | H-SEG-38, 62 a 67; D-080(b) |
| [24](adr-24-admision-casos-asistente.md) | **Nuevo.** Chat de admisión de casos del asistente (ASI-A): el modelo propone una ficha y la persona envía el formulario normal | D-102 a D-110 |

Además: [prototipo-tecnico.md](prototipo-tecnico.md) (alcance, criterios de éxito y fracaso de los 4 días previos a la Etapa 1), [indices-claves-naturales.md](indices-claves-naturales.md) y [revision-datos.md](revision-datos.md) (insumos de Datos).

## Decisiones técnicas propuestas, a ratificar por el Gerente de TI

Seguridad las dejó al Gerente de TI; las propone el Arquitecto, por delegación, y **ninguna está firmada**. Las tres últimas filas son de la ronda 6:

| Propuesta | Hallazgo | ADR | Qué se hace si no se ratifica |
|---|---|---|---|
| **Sexto rol de base `app_soporte`** (solo lectura, sin acceso a las tablas restringidas) | H-SEG-36 | 03, 04 | Se vuelve a `app_empresa` en solo lectura con la variable `modo_soporte` y política restrictiva (más débil: se protege por una variable, no por permisos). H2 mide ambas |
| **Verificación reciente solo con autenticador o llave** (el enlace de correo no la renueva) | H-SEG-52 | 08 | Se mantiene D-048.2 ("enlace nuevo o segundo factor") y el control se reduce al control del buzón |
| **Consola de plataforma en un tercer despliegue**, sin la llave maestra y sin acceso a las bases de las empresas | H-SEG-42 | 01 | Consola como ruta del servicio `web`; Seguridad lo considera una pérdida real de aislamiento. **[ESCALAR AL CEO]** si el tercer servicio sube el costo (sin cifras) |
| **Cuentas de base distintas para la web y el trabajador** (`app_empresa_web`, `app_empresa_trabajador`, mismo rol de grupo); solo la del trabajador emite valores de entrada | H-SEG-46 (cond. 1) | 04, 08, 01 | Se escribe en ADR-04 y ADR-08 que «la web comprometida puede emitir valores» y la prueba P1 lo registra. **Recomendación: ratificar** (casi sin costo; ya hay direcciones de conexión distintas) |
| **Dos personas de plataforma, aviso, 24 horas y veto para levantar el texto libre del asistente; techo del tope global fuera de la base** (cambiarlo es una publicación aprobada por el CEO) | H-SEG-67 | 23, 22, 04 | Quedan las funciones de una persona del texto anterior y el riesgo se declara. **Recomendación: ratificar.** El consentimiento expreso de la empresa lo decide Cumplimiento (L-19) |
| **Congelación provisional inmediata**: declarar protege al instante durante 72 horas; confirmar la hace firme; levantar exige dos | H-SEG-64 | 23, 12 | La congelación solo protege una vez confirmada (con una sola persona de plataforma depende del contacto autorizado). **Recomendación: ratificar**; Cumplimiento ajusta las 72 horas |

## Piezas del sistema

```
 Personas de las empresas          Equipo de plataforma (llave física)
        |                                     |
        v                                     v
 +--------------------+   +--------------------+   +---------------------------+
 | web (Next.js)      |   | consola            |   | trabajador en segundo     |
 | /e/{empresa}/...   |   | (otra dirección,   |   | plano: cola, programador, |
 | asistente de IA    |   |  red restringida)  |   | correos, importaciones,   |
 +---------+----------+   +---+-------+--------+   | exportaciones, Microsoft  |
           |                  |       |            +----+----+----+------------+
   agrupador de conexiones    |       |                 |    |    |
   (modo transacción)         |       |        conexión |    |    +--> Correo (proveedor + segundo)
           |            app_plataforma  app_soporte     directa|
           v                  |       |                 |    |    +--> Microsoft Graph (solo lectura)
 +--------------------------------------------------------+    |
 | PostgreSQL gestionado                                  |<---+
 |  roles: app_empresa  app_plataforma  app_soporte       |
 |         migraciones  mantenimiento   lector_auditoria  |   Tareas programadas (misma imagen):
 |  datos de negocio con empresa + tablas globales        |   - purga (mantenimiento)
 |  (lista cerrada) + esquema `cola`                      |   - copia externa de auditoría
 +--------------------------------------------------------+     (lector_auditoria, solo agregar)

   web -----------------------> Proveedor de IA (un solo destino, solo `web`)
   Almacén de anonimizaciones y de constancias de purga (fuera de la base que se restaura)
   Respaldo propio cifrado (otro proveedor y otra cuenta)
   Gestor de secretos: llave maestra (fuera de la base y de los respaldos; la consola NO la recibe)
```

La **lectura de soporte** no usa el rol de plataforma: es una transacción de solo lectura de una sola empresa con `app_soporte` (ADR-03).

## Una sola forma de hacer cada cosa

| Necesidad | Única función o servicio | ADR |
|---|---|---|
| Consultar datos de una empresa | `conEmpresa(empresaId, fn)` | 03 |
| Comprobar un permiso | `exigirPermiso(principal, permiso, recurso)` vía `definirServicio` | 10 |
| ¿Hace falta otra persona? | `requiereSegundaPersona(acto, monto, moneda)` y `dobleControl` | 13 |
| Acción de plataforma con dos personas | funciones de plataforma que reciben la huella de la sesión | 23 |
| Número correlativo | `siguiente(empresa, clave, n)` (función SQL de un viaje) | 15 |
| Guardar un valor que sirve para entrar | `huella(tipo, valor)` (nivel A o B según el tipo) | 09 |
| Cifrar un secreto | `cifrar(proposito, alcance, valor)` | 07 |
| Escribir auditoría | `registrarAuditoria(...)` | 11 |
| Exportar datos | `puertaExportacion` | 19 |
| Enviar correo | `enviarCorreo(plantilla, ...)` (el valor de acceso nace en el trabajador) | 16, 08 |
| Emitir un valor de entrada (enlace, invitación, acceso de emergencia, aprobación del contacto) | `*_emitir(id, huella)`: una sentencia atómica, solo la cuenta del trabajador | 08, 04 |
| Registrar un error sin datos personales | envoltorio único de `nucleo/cola` y `nucleo/observabilidad` | 02, 20 |
| Llamar a Microsoft | cliente único `nucleo/integraciones/microsoft` | 21 |
| Llamar al modelo de IA | puerto `ProveedorModelo` | 22 |
| Crear un caso con el chat | el formulario normal «Pedir ayuda»; el modelo solo devuelve una ficha que el servidor valida | 24 |
| "Hoy" de una empresa | `hoyEnEmpresa()` | 02 |

## Orden de construcción recomendado

Principio: primero lo que todos usan; después lo que solo depende del núcleo; al final lo que mira a varios módulos (D-056).

### Núcleo (versión 1)

| Etapa | Qué se construye | ADR que la sostienen |
|---|---|---|
| 0 | **Prototipo técnico de 4 días y 1 de reserva**, estos ADR | todos |
| 1 | Contexto de empresa en la dirección; **seis** roles de base, seguridad por fila, políticas de las funciones y tablas globales; acceso con segunda verificación, **sesión de plataforma con llave física** y sesiones en base; usuarios, membresías, invitaciones; roles y catálogo de permisos; **auditoría** (cuatro autores, partición mensual, copia externa); gestión de secretos; **cola y bus de eventos**; correo básico con reintentos y topes; **consola de plataforma, acciones con dos personas, congelación por incidente** y lectura de soporte; contadores; calendario y zona horaria de la empresa; `modulo_activo`; esqueletos de campos e importación | 01 a 05, 07 a 11, 14 a 16, 20, 23 |
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
| G (propuesta de los módulos) | **Microsoft Entra ID e Intune** (ADR-21); **Asistente de IA** (ADR-22 y ADR-24) en cuatro entregas (D-103: ASI-A admisión, ASI-B respondedor, ASI-C borradores, ASI-D acciones) | Personas, Inventario, Órdenes de compra y recepción, Notificaciones completas; el asistente además Mesa de ayuda |

Lo que cada módulo futuro necesita del núcleo (cola, bus, registro de módulo con **limpieza al anonimizar** y **herramientas del asistente**, tipo de autor "sistema", marca de origen "asistente", campo secreto, naturaleza de categoría con "se gestiona en MDM", ubicación con superior, proveedor ampliado, propósito de cifrado `integracion_graph`, filas del cuadro de topes) se **prepara en las Etapas 1 a 4** aunque el módulo llegue después.

## Trazabilidad: hallazgo → ADR

Disposición: **Incorporado** = tal como se pidió; **Incorporado, con ajuste** = se hizo con una variante que se explica en el ADR; **Propuesta** = a ratificar; **Pendiente** = depende de otro rol; **Descartado** = no se hace, con la razón.

### Seguridad, ronda 5 (30 hallazgos)

| Hallazgo | Gravedad | ADR | Disposición |
|---|---|---|---|
| H-SEG-33 | Alta | 03, 04, 23 | Incorporado: `app_plataforma` sin escritura directa; disparador de campos mutables; registros solo agregar |
| H-SEG-34 | Media | 03, 04, 23 | Incorporado: las funciones reciben la huella de la sesión, no un identificador |
| H-SEG-35 | Media | 03 | Incorporado: flujo de soporte en tres pasos (escritura, apertura de solo lectura, lecturas) |
| H-SEG-36 | Media | 03, 04, 14 | Propuesta: sexto rol `app_soporte`; texto honesto del alcance de la seguridad por fila; regla de código sin SQL crudo |
| H-SEG-37 | Media | 03, 10, 11, 19 | Incorporado: cuarto autor `plataforma`, soporte no exporta; el permiso `empresa.autorizar_soporte` ya existe (PS-247, D-094) |
| H-SEG-38 | Media | 04, 23, 12, 02, 08 | Incorporado; **parcial en la ronda 5, completado en la ronda 6** (ocho omisiones: veto de rescate, marca de intención de purga, funciones de emisión, validación de la sesión de plataforma, particiones mensuales, constancia de congelaciones, firma de `congelacion_activa`, encolar desde plataforma) |
| H-SEG-39 | Media | 03, 04 | Incorporado: `PUBLIC`, `search_path`, `CREATE`, matriz rol por función |
| H-SEG-40 | Media | 11, 03 | Incorporado: `crear_particion_auditoria` con `FORCE` y sin permisos |
| H-SEG-41 | Media | 03, 06, prototipo | Incorporado: los cinco casos de la prueba genérica |
| H-SEG-42 | Media | 01 | Propuesta: tercer despliegue; **[ESCALAR AL CEO]** si el costo sube |
| H-SEG-43 | Media | 11, 04 | Incorporado: la copia externa va sin `ip` ni `motivo`; la integridad la da una cadena con llave sobre la fila completa (reconciliado en la ronda 6, H-SEG-77); frase de ADR-04 corregida |
| H-SEG-44 | Media | 02, 20, 04 | Incorporado: envoltorio de errores, `cola` solo por funciones de la librería |
| H-SEG-45 | **Alta** | 09, 07, 08 | Incorporado: dos niveles de huella; códigos de recuperación de 100 bits con SHA-256 (se descarta `scrypt`: costo de CPU en un punto sin autenticar sin ganancia a 100 bits) |
| H-SEG-46 | **Alta** | 08, 04, 01, 09, 16, 02 | Incorporado, con ajuste: el valor nace en el trabajador (descartadas las opciones (a) y (b) por las razones de ADR-08). **Seguridad avala la variante (ronda 6)** y pide cuatro condiciones de texto: emisión atómica y acotada, huella anulada si el envío falla y lista completa, **incorporadas**; la de «quién puede emitir» (dos cuentas) es **propuesta, a ratificar**. Se cierra cuando H6 pase P1 a P8 |
| H-SEG-47 | Media | 07 | Incorporado: versiones retiradas archivadas hasta que expire el último respaldo |
| H-SEG-48 | Baja | 07 | Incorporado los cinco puntos (`AUTH_SECRET` no existe en la v1) |
| H-SEG-49 | Baja | 09, 20 | Incorporado; descartado poner el valor en el fragmento `#` de la dirección (obliga a JavaScript); riesgo residual del alojamiento anotado |
| H-SEG-50 | Media | 08, 01, 14 | Incorporado: cookies `__Host-` y cabeceras de seguridad |
| H-SEG-51 | Media | 08 | Incorporado: sesión de plataforma solo con llave física, 15 min y 4 h. Pendiente: alta de nuevas personas (Seguridad y DevOps) |
| H-SEG-52 | Media | 08, 10 | Propuesta: solo el autenticador renueva la verificación; enmienda D-048.2 |
| H-SEG-53 | Baja | 08 | Incorporado los cuatro puntos |
| H-SEG-54 | **Alta** | 19 | Incorporado: descarga atada al solicitante, `POST`, atómica, borrado inmediato |
| H-SEG-55 | Media | 19 | Incorporado: `exportacion_solicitud` y recomprobación de permisos al generar |
| H-SEG-56 | Media | 19, 07 | Incorporado: bloques de 1 MiB, topes, alarma de 25 h, aviso de privacidad. El tope de 100 MB por empresa es propuesta que mide H12 |
| H-SEG-57 | Media | 19 | Pendiente: canal de entrega de derechos de datos (Cumplimiento); propuesta de partida escrita; el paso no se construye |
| H-SEG-58 | Baja | 19 | Incorporado: huella del archivo, Personas distintas, eventos de descarga y vencimiento |
| H-SEG-59 | Media | 13 | Incorporado: lista cerrada de campos que comprometen; el Analista confirma |
| H-SEG-60 | Media | 13 | Incorporado: tabla solo agregar, índice único de membresía, atribución a la clave de API |
| H-SEG-61 | Baja | 13 | Incorporado (era recomendación): disparador de aprobación |
| H-SEG-62 | Media | 23, 11, 12 | Incorporado: congelación dentro de la base; pospone toda purga de particiones (ajusta RF-AUD-016) |
| Obs. ADR-15 | - | 15 | Incorporado: `siguiente` INVOKER |
| Obs. ADR-16 | - | 16 | Incorporado: falla cerrada del limitador |
| Obs. ADR-18 | - | 18 | Incorporado: tipo de archivo por contenido |
| D-050.5 (secuencia global) | Baja | 18 | Incorporado: la marca nunca se expone; prueba de contrato |
| Prototipo (sección 6) | - | prototipo | Incorporado: H9 obligatoria, H8 mínimo el día 3, H2 (9 a 13), H1/H6/H11 ampliadas, H12 nueva |

### Seguridad, ronda 6 (verificación de los 30 y H-SEG-63 a 78)

De los 30 de la ronda 5, Seguridad cerró 27; quedaban parciales H-SEG-38 y H-SEG-46 (ver sus filas arriba) y abierto por diseño H-SEG-57. Los 16 nuevos (0 altos, 11 medios, 5 bajos):

| Hallazgo | Gravedad | ADR | Disposición |
|---|---|---|---|
| H-SEG-63 | Media | 23, 04, 08 | Incorporado: camino completo del contacto autorizado (función del trabajador, valor atado a la acción, contacto confirmado 24 horas antes, cambio con espera). El Analista confirma RF-PLA-011 |
| H-SEG-64 | Media | 23, 12 | **Propuesta, a ratificar:** congelación provisional inmediata de 72 horas. Cumplimiento ajusta el plazo |
| H-SEG-65 | Baja | 23, 02, 04 | Incorporado, con ajuste: disparador en las dos raíces de datos personales (no en toda tabla del mapa) más regla de código; clasificación obligatoria de trabajos; una sola firma de `congelacion_activa` |
| H-SEG-66 | Media | 11, 23, 04 | Incorporado: los registros de plataforma y las actas van a la copia externa con la misma cadena |
| H-SEG-67 | Media | 23, 22, 04 | **Propuesta, a ratificar:** dos personas con aviso, espera y veto para el texto libre; techo del tope global fuera de la base. Pendiente de Cumplimiento: consentimiento expreso de la empresa |
| H-SEG-68 | Media | 03, 04 | Incorporado como mejora: política restrictiva `TO app_soporte`; H2 mide el costo y puede retirarla |
| H-SEG-69 | Media | 21, 04 | Incorporado: reserva del directorio solo tras probar control, pendiente 1 hora, mensaje idéntico |
| H-SEG-70 | Media | 21, 01 | Incorporado: límites duros del cliente propio (valores propuestos). Pendiente de DevOps: lista de salidas de red |
| H-SEG-71 | Baja | 21 | Incorporado: condiciones del token. **Pendiente** que Seguridad firme la lista de permisos tras verificarla, y la prueba con un directorio real sin personas |
| H-SEG-72 | Media | 22, 24 | Incorporado: lista permitida de tipo cerrado, canarios en texto libre. Pendiente de Cumplimiento: la frase final de la promesa |
| H-SEG-73 | Media | 22, 24 | Incorporado: marca de contaminación por turno e historial como no verificado. Pendiente de QA: casos `IO-S73a` e `IO-S73b` (D-110 reserva IO-15 en adelante a la admisión). **Descartado por ahora:** el botón «preparar borrador» como única vía (se reevalúa en ASI-C) |
| H-SEG-74 | Media | 22, 24 | Incorporado: reservas con barrido, liquidar al máximo, segundo muro en la cuenta del proveedor (**verifica DevOps**), fracción por empresa. Se retira «por construcción» |
| H-SEG-75 | Baja | 22, 03 | Incorporado: clasificación de las tablas del asistente y texto viejo de ADR-03 |
| H-SEG-76 | Media | 08 | Incorporado: flujo del código de recuperación; QA agrega R1 a R6 |
| H-SEG-77 | Baja | 11, 04 | Incorporado: cadena con llave sobre la fila completa; **descartados** los resúmenes sueltos de `ip` y `motivo` (reversibles) |
| H-SEG-78 | Baja | 15, 19, 10, 01, 08 | Incorporados los puntos 1 a 5. **Pendiente** el 6: Cumplimiento confirma H-SEG-43 y 56 y define H-SEG-57; DevOps reescribe el plan 6.7 |

Estado de los ADR según Seguridad (ronda 6): aprobados 01, 02, 07, 09, 10, 12, 13, 16, 19, 20; 03 y 04 con la condición H-SEG-38 (ya escrita); 08 cuando se escriban H-SEG-46 y 76 (ya escritos); 11 con H-SEG-77 (ya reconciliado); 21 y 23 aprobados con condiciones (ya escritas); **22 no aprobado hasta que Seguridad revise H-SEG-72, 73 y 74** (ya escritos). Los ADR siguen en «Propuesto» hasta que el Gerente de TI firme.

### Datos, revisión de los ADR 03, 04, 06, 11, 12, 15, 17 y 18

| Hallazgo | Gravedad | ADR | Disposición |
|---|---|---|---|
| D03-1 | Menor | 03 | Incorporado |
| D03-2 | **Bloqueante** | 03, 04 | Incorporado: políticas `TO migraciones` con lista cerrada (añadí 4 tablas que las funciones leen y la nota sobre migraciones de datos) |
| D03-3 | **Bloqueante** | 03, 11 | Incorporado: variante `particionada`, permisos solo en el padre |
| D03-4 | Importante | 03, 06 | Incorporado: clave primaria `(empresa_id, id)`; H10 mide |
| D03-5, D03-6 | Importante | 03 | Incorporado |
| D03-7 | Importante | 03 | Incorporado (con H-SEG-33 a 35) |
| D03-8 | Importante | 03, 01 | Incorporado, con ajuste: las prohibiciones valen para el agrupador; el trabajador usa conexión directa; el tope de 4 minutos se aplica con `transaction_timeout` o en `conEmpresa` porque `statement_timeout` no limita la transacción |
| D03-9, D03-10 | Menor | 03 | Incorporado (D03-10 como riesgo residual aceptado por escrito) |
| D04-1 | Importante | 04 | Incorporado: categorías A, B, C |
| D04-2 | Importante | 04 | Incorporado (alternativa preferida): `invitacion` y `clave_api` a tablas de empresa |
| D04-3 | Importante | 04, 12, 23 | Incorporado: constancia de purga externa y congelación |
| D04-4 | Importante | 16 | Incorporado como medición (H5/H10) |
| D04-5 | Importante | 04, 09, 11 | Incorporado: correo de intento fallido como huella |
| D04-6, D04-7 | Menor | 04 | Incorporado; `search_path` de las funciones sin `public` (H-SEG-39 es más estricto que la propuesta de Datos para roles) |
| D06-1 | **Bloqueante** | 06 | Incorporado: funciones `IMMUTABLE` versionadas; fuera `citext` y `unaccent` |
| D06-2, D06-3, D06-4, D06-5 | Importante | 06 | Incorporado |
| D06-6, D06-8 | Menor | 06 | Incorporado |
| D06-7 | Menor | 06 | Propuesta de Datos, a confirmar por el Analista (decimales de cantidades) |
| D11-1 | **Bloqueante** | 11, 03 | Incorporado |
| D11-2 | **Bloqueante** | 11 | Incorporado: cuarto autor |
| D11-3 | **Bloqueante** | 11, 03 | Incorporado, con ajuste: tope de 4 min, margen de 15 min, relectura nocturna, conteos y marca de agua por transacción más antigua; descartado el método `xmin` (32 bits, se reinicia) |
| D11-4, D11-5, D11-6 | Importante | 11 | Incorporado |
| D11-7 a D11-10 | Menor | 11 | Incorporado |
| D12-1, D12-2 | Importante | 12 | Incorporado |
| D12-3 | Importante | 12 | Incorporado y ampliado a seis pasos (pausar integraciones) |
| D12-4, D12-5 | Menor | 12 | Incorporado |
| D15-1 | Importante | 15 | Incorporado: INVOKER (compatible con la observación de Seguridad) |
| D15-2, D15-3, D15-4, D15-6 | Importante | 15 | Incorporado |
| D15-5 | Importante | 15 | Incorporado: `doc:ACTV` en lugar de `activo` |
| D15-7, D15-8 | Menor | 15 | Incorporado |
| D17-1 a D17-4 | Importante | 17 | Incorporado (la unicidad del IMEI entre categorías es pregunta abierta al Analista) |
| D17-5 a D17-7 | Menor | 17 | Incorporado |
| D18-1 | Importante | 18, 09 | Incorporado: huella HMAC |
| D18-2, D18-3 | **Bloqueante** | 18 | Incorporado: `lote_registro` eliminada; estados completos y dos índices parciales |
| D18-4 a D18-8 | Importante | 18 | Incorporado |
| D18-9, D18-10 | Menor | 18 | Incorporado |

### Módulos nuevos y D-077

| Insumo | ADR | Disposición |
|---|---|---|
| D-077 (motivos por valor) | 11, 12, 19 | Alineado: motivo por valor (500 caracteres), texto libre no anonimizable, fuera de la copia externa |
| `microsoft-entra-intune.md` (S-MSF-20 y otros) | 21 | ADR escrito y contrastado; cuatro correcciones al módulo anotadas en el ADR |
| `asistente-ia.md` (pendientes del Arquitecto, 12.4) | 22 | ADR escrito y contrastado; parámetros propuestos; ASI-S05 descartado con razón |

## Decisiones D-0xx por registrar y ajustes pendientes (no se escribió nada fuera de `docs/arquitectura/`)

**Decisiones que la Jefatura debe registrar en `docs/equipo/decisiones.md`** (los números los asigna la Jefatura; D-087 a D-110 ya existen; las propuestas de la ronda 6 (16 a 20) esperan número):
1. Sexto rol `app_soporte` — enmienda D-039.3 *(propuesta, a ratificar)*.
2. Verificación reciente solo con segundo factor — enmienda D-048.2 *(propuesta, a ratificar)*.
3. Consola de plataforma en un tercer despliegue y credenciales por proceso — complementa D-038, D-048.5 y el plan de entornos *(propuesta; posible **[ESCALAR AL CEO]** por costo)*.
4. Huella en dos niveles (códigos de recuperación y claves de API sin depender de la maestra) — enmienda D-065 S-34(e) y corrige el escenario A del plan 6.7.
5. El valor de los correos de acceso nace en el trabajador, no viaja por la cola — precisa D-061.4 y D-073.4.
6. Copia externa sin IP ni motivo, con cadena con llave sobre la fila completa (ronda 6: sin resúmenes sueltos) y con los registros de plataforma — enmienda D-052.2 y D-030.5 *(Cumplimiento revisa)*.
7. Tablas globales: `invitacion` y `clave_api` pasan a empresa; nuevas `accion_plataforma`, `congelacion_incidente`, `directorio_microsoft` — enmienda D-039.4.
8. Cuarto tipo de autor `plataforma` (solo lecturas de soporte) y marca de origen `asistente` — enmienda D-041 / RF-AUD-013.
9. Congelación por incidente implementada en la base; pospone toda purga de particiones — implementa D-080(b).
10. Correo del intento fallido como huella — enmienda D-054.
11. PostgreSQL 15 o superior; normalización con funciones propias; clases de clave P/L/B/V/A; clave primaria `(empresa_id, id)` — precisa D-055 T-4 y D-070.6.
12. Exportación: descarga única atada al solicitante, borrado inmediato — precisa D-061.1.
13. Prototipo de 4 días y 1 de reserva — enmienda D-055.
14. Integración con Microsoft: aplicación por empresa, solo lectura, lectura programada (ADR-21) — decisión nueva.
15. Asistente de IA: sin estado en el servidor, proyecciones de campos, topes con reserva, proveedor por prueba H-IA (ADR-22) — decisión nueva. *(Actualizada: el proveedor lo fijó el CEO, D-102; el modelo sigue por la prueba H-IA.)*
16. *(Ronda 6, propuesta)* Dos cuentas de base para el mismo rol `app_empresa`: web y trabajador; solo el trabajador emite valores de entrada — precisa D-087 (no cambia la cantidad de roles).
17. *(Ronda 6, propuesta)* Levantar el texto libre del asistente con dos personas, aviso, 24 horas y veto; techo del tope global fuera de la base — precisa D-086.4 y la fila PS-240.
18. *(Ronda 6, propuesta)* Congelación provisional inmediata de 72 horas al declarar — precisa D-080(b).
19. *(Ronda 6)* El contacto autorizado como segunda persona: valor de un solo uso atado a la acción, contacto confirmado 24 horas antes — precisa RF-PLA-011.
20. *(Ronda 6)* El gasto del asistente se acota con dos topes independientes (el nuestro y el de la cuenta del proveedor) — precisa D-101 y D-110.2.

**Documento funcional y módulos que deben ajustarse** (lo hacen el Analista y los escuadrones; yo no los toqué):
- `documento-funcional.md`: RF-AUD-013 (cuatro autores y marca de origen), RF-AUD-016 ("omite a las empresas" → pospone la purga de la partición), RF-ACC sobre verificación reciente, RF-PLA-001 (ingreso de la consola solo con llave física; vencimientos 15 min y 4 h), RF-PLA-005, §18.1 y aviso de privacidad (respaldos conservan la exportación cifrada; motivo; datos de Microsoft; envío al proveedor de IA), nuevos RS de cabeceras, cookies y asistente.
- `registro-permisos.md`: el permiso `empresa.autorizar_soporte` ya existe (PS-247); **si el Gerente ratifica la propuesta de H-SEG-67**, la fila PS-240 (levantar el texto libre) pasa a «dos personas, aviso y veto» y el interruptor general se separa de los topes (que no suben por encima de un techo de publicación). La duplicación de PS-235 a PS-240 ya se resolvió en D-084 (Microsoft pasó a PS-241 a PS-246); `microsoft-entra-intune.md` todavía cita algunos PS-236/PS-239 antiguos.
- `microsoft-entra-intune.md`: PS-236/PS-239 sueltos (ahora PS-242/PS-245), RF-MSF-004 (el vencimiento del secreto lo escribe quien conecta), sección 6 (tabla global del directorio con huella), RN-MSF-022 (nivel B), RN-MSF-042 (barrera de la mitad), periodicidades iniciales.
- `asistente-ia.md`: RN-ASI-013 (el estado lo guarda el navegador), 9.1 punto 13 (sin tabla global nueva), RF-AUD-013.
- `personas-ubicaciones.md` y `indices-claves-naturales.md`: gancho "al anonimizar", mapa de columnas personales, IMEI y decimales (preguntas de Datos al Analista).
- `integraciones-api.md` y `presupuesto-costos.md`: texto de D-077 (pendiente del escuadrón F, ya decidido).
- Otros roles: **DevOps** (plan 6.7 escenario A, variables por proceso, tareas programadas, costo de la consola, versión de PostgreSQL, `pg_read_all_stats`, cabeceras, límites de conexión por rol), **Seguridad** (confirmar la variante de H-SEG-46, la lista de permisos de Graph, las librerías de TOTP y llave física), **Cumplimiento** (aviso de privacidad, copia externa, canal de H-SEG-57, quién ejerce los papeles de la congelación), **QA** (las pruebas nuevas de cada ADR), **Datos** (migraciones y macros).

## Cómo se cambia un ADR

Un ADR aceptado no se edita en silencio: se agrega una sección "Cambios" con fecha y decisión que lo motiva. Si un ADR contradice una decisión D-0xx, vale la D-0xx hasta que el Gerente de TI decida; las diferencias que este conjunto introduce están en la lista de arriba y en la sección "Qué cambió tras la revisión" de cada ADR.

## Qué cambió tras la ronda 6 (2026-10-29)
- Todo H-SEG-38, 46 y 63 a 78 está incorporado, descartado con razón o pendiente de otro rol (tabla de trazabilidad de arriba).
- **Nuevo:** ADR-24 (chat de admisión de casos; D-102 a D-110 ya estaban registradas).
- **Tres propuestas a ratificar por el Gerente** (con recomendación de ratificar las tres): cuentas distintas para web y trabajador, dos personas y techo del tope para el asistente, congelación provisional inmediata.
- **Pendientes de otros roles:** Analista (RF-PLA-011, fila PS-240, aviso del permiso de usuarios de Microsoft, renombrado ASI), Cumplimiento (frase de H-SEG-72, consentimiento de la empresa, plazo de 72 horas, H-SEG-43/56/57), DevOps (tope duro en la cuenta del proveedor, salidas de red, dos cuentas en el guion, plan 6.7), QA (casos IO nuevos, R1 a R6), Seguridad (firmar la lista de permisos de Graph; revisar ADR-22 y la suite IO).
- El prototipo puede arrancar: las tres condiciones de papel de Seguridad están escritas (`prototipo-tecnico.md`).
