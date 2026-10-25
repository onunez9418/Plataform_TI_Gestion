# Módulo: Onboarding y offboarding (ONB)

**Versión:** 0.2 (corregida tras la revisión cruzada, Mesa #002; Oleada D, Escuadrón D)
**Sigla de requisitos:** ONB
**Fuente de verdad:** `docs/documento-funcional.md` y `docs/equipo/decisiones.md`. Aplican D-034 y D-061.7 (el cese nunca se bloquea por recursos), D-002.6 (baja de acceso), D-044.6 y D-035 (licencias), D-053 (Mi trabajo), D-061.4 (correos), D-062 (vigencias, avisos, calendario).
**Marcas:** **[SUPUESTO]** = propuesta mía que confirma el Gerente de TI. **[ESCALAR AL CEO]** = solo dinero, tema legal o algo irreversible. "Cuándo": `Fase 2, ola C` (D-056.3).

---

## 1. Propósito, alcance y fase

**Propósito.** Que nadie olvide nada cuando alguien entra o sale de la empresa. Al **ingresar**: tiene su laptop, su celular, su línea, sus licencias y sus accesos. Al **salir**: devuelve los equipos, se le quitan los accesos y se recuperan las licencias. Este módulo lo convierte en una lista con responsables y fechas.

**Cuándo.** **Fase 2, ola C** (junto con la mesa de ayuda), después de la Etapa 7 (S-ONB-01, D-056). Depende de Personas (Etapa 2), Inventario y ENT-A (Etapa 4), Órdenes de servicio (Etapa 6) y NOT-completo. **Lo que sí es de la v1 y vive en PRS:** el cese de una Persona, que **nunca se bloquea** por recursos (RN-PRS-008).

**Entra:** plantillas de ingreso y de salida por tipo de puesto; procesos con tareas, responsables y fechas; tareas que se completan solas cuando ocurre el hecho; panel de pendientes de la persona; avisos de tareas por vencer, vencidas y salidas atrasadas.
**No entra:** ver sección 13.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Onboarding / Offboarding** | Proceso de ingreso / de salida de una Persona. La salida termina con el cese (PRS). |
| **Plantilla** | Lista modelo de tareas, por ejemplo "Ingreso: Vendedor en campo". |
| **Proceso** | Aplicación de una plantilla a una Persona, con fechas y responsables. |
| **Tarea** | Un paso con responsable y fecha límite (entregar laptop, crear correo, recuperar licencia). |
| **Tarea automática** | La que el sistema marca Hecha cuando ocurre el hecho. |
| **Fecha de referencia** | Fecha de ingreso, o fecha de salida prevista; los plazos se cuentan desde ella. |
| **Pendientes de la persona** | Lo que sigue a su nombre: equipos, líneas, puestos, dominios, elementos de CMDB, órdenes y casos (cada módulo lo declara, D-038.6). |
| **Pendiente de devolución** | Equipo de una Persona cesada que sigue Asignado (D-034). No es pérdida. |
| **Mi trabajo** | Bandeja única del Técnico con pestañas por tipo; las tareas de ONB son una pestaña (D-053). |

## 3. Roles y permisos

Solo nombres del registro `docs/registro-permisos.md`. Todo se comprueba en el servidor. Este módulo **copia las celdas del registro** y no cambia ninguna (D-037).

| Acción | PS | Permiso | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura | Empleado (portal) |
|---|---|---|---|---|---|---|---|---|---|
| Ver procesos y tareas | PS-197 | `onboarding.ver` | Todo | Todo | Todo | No | No | Todo (con referencia, sin nombre) | No aplica |
| Iniciar un proceso | PS-198 | `onboarding.iniciar` | Sí | Sí | No | No | No | No | No aplica |
| Completar tareas | PS-199 | `onboarding.completar_tarea` | Todo | Propio | Propio | Propio | No | No | No aplica |
| Reasignar tareas y fechas | PS-200 | `onboarding.reasignar` | Sí | Sí | No | No | No | No | No aplica |
| Agregar tarea manual, marcar "No aplica" | PS-201 | `onboarding.editar_proceso` | Sí | Sí | No | No | No | No | No aplica |
| Cancelar un proceso | PS-202 | `onboarding.cancelar` | Sí | Sí | No | No | No | No | No aplica |
| Crear y editar plantillas | PS-203 | `onboarding.plantillas` | Sí | No | No | No | No | No | No aplica |
| Registrar el cese (paso final de una salida) | PS-26 | `personas.cesar` | Sí | Sí | No | No | No | No | No aplica |
| Suspender la membresía vinculada | PS-14 | `usuarios.suspender`* | Sí | No | No | No | No | No | No aplica |
| Ver nombres de las Personas | PS-22 | `datos_personales.ver`* | Sí | Sí | Sí | No | No | No | No aplica |
| Exportar la lista de procesos (puerta única) | PS-20 | `datos.exportar`* | Sí | No | No | No | No | No | No aplica |

Notas:
- "Propio" = tareas asignadas a esa membresía (registro, sección 2). Quien tenga la tarea la ve en **"Mi trabajo"**.
- El Solicitante no tiene `onboarding.completar_tarea`: una tarea cuyo responsable por defecto sea el jefe directo con ese rol se asigna a quien inició el proceso (RN-ONB-003).
- El Empleado (portal) no ve procesos de ingreso ni salida, ni el propio (S-ONB-06).

## 4. Requisitos

Los RN y RNF rigen desde el "Cuándo" del requisito que protegen (todo el módulo es `Fase 2, ola C`).

### 4.1 Requisitos funcionales

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-ONB-001 | Plantillas de tipo Ingreso o Salida, con nombre, tipo de puesto asociado (o "General") y tareas ordenadas. | Fase 2 | CA-ONB-01 |
| RF-ONB-002 | Cada tarea de plantilla define título, descripción, categoría (Equipo, Accesos, Licencias, Línea, Otro), responsable por defecto (un rol, "Jefe directo" o "Quien inicia"), plazo en días respecto a la fecha de referencia, obligatoria u opcional y acción vinculada (Entregar equipo, Devolver equipo, Suspender acceso, Registrar cese, Ninguna). | Fase 2 | CA-ONB-01 |
| RF-ONB-003 | Duplicar, inactivar y reordenar plantillas y tareas. | Fase 2 | CA-ONB-02 |
| RF-ONB-004 | Iniciar un **ingreso** para una Persona Activa: se sugiere la plantilla según su tipo de puesto (o la General), se confirma la fecha y se crean las tareas con responsable y fecha. | Fase 2 | CA-ONB-01 |
| RF-ONB-005 | Iniciar una **salida** con fecha de salida prevista. | Fase 2 | CA-ONB-03 |
| RF-ONB-006 | Las tareas del proceso son una copia de la plantilla al iniciar. | Fase 2 | CA-ONB-02 |
| RF-ONB-007 | Agregar tareas manuales y marcar una tarea "No aplica" con motivo. | Fase 2 | CA-ONB-10 |
| RF-ONB-008 | Completar una tarea con nota opcional; reasignarla o cambiarle la fecha, con auditoría. | Fase 2 | CA-ONB-12 |
| RF-ONB-009 | Tareas automáticas: "Devolver equipos" al quedar la Persona sin equipos asignados; "Suspender acceso" al suspenderse la membresía vinculada; "Registrar cese" al pasar la Persona a Cesada; "Recuperar licencias" al liberarse sus puestos. | Fase 2 | CA-ONB-04 |
| RF-ONB-010 | Panel de la salida con los **pendientes de la persona** que cada módulo activo declara (equipos, líneas, puestos, dominios, elementos de CMDB, cambios y problemas abiertos, órdenes y casos), con enlace a la acción que cada uno pide. | Fase 2 | CA-ONB-03 |
| RF-ONB-011 | Botón **"Registrar cese"** siempre disponible para quien tiene `personas.cesar`: muestra los pendientes y avisa "N equipos quedarán como Pendiente de devolución"; **no bloquea**. Con membresía vinculada pide además `usuarios.suspender`. | Fase 2 | CA-ONB-03, 13 |
| RF-ONB-012 | Pestaña **"Tareas"** dentro de "Mi trabajo" con las tareas asignadas al usuario, ordenadas por fecha límite. No hay una bandeja aparte. | Fase 2 | CA-ONB-15 |
| RF-ONB-013 | Lista de procesos con filtros (tipo, estado, atrasados, responsable, área, fechas) y exportación por la puerta única (`datos.exportar`; las columnas con nombre se omiten sin `datos_personales.ver`). | Fase 2 | CA-ONB-07 |
| RF-ONB-014 | Cerrar el proceso cuando se cumplen las condiciones (RN-ONB-009); cancelar con motivo. | Fase 2 | CA-ONB-05 |
| RF-ONB-015 | Plantillas de ejemplo ("Ingreso general" y "Salida general") sembradas al crear la empresa, editables. | Fase 2 | CA-ONB-01 |
| RF-ONB-016 | Iniciar un ingreso con un botón desde la ficha de una Persona recién creada. | Fase 2 | CA-ONB-01 |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-ONB-001 | Una Persona tiene como máximo un proceso abierto de cada tipo. |
| RN-ONB-002 | Las tareas son copia de la plantilla; editarla después no cambia procesos abiertos ni inactivarla (RN-ONB-019). |
| RN-ONB-003 | El responsable de una tarea es un usuario activo con permiso para completarla. Si el responsable por defecto no puede actuar (el jefe directo no tiene Usuario o no tiene `onboarding.completar_tarea`), se asigna a quien inició el proceso. |
| RN-ONB-004 | Quien no tiene alcance "todo" en `onboarding.completar_tarea` solo completa tareas asignadas a él. |
| RN-ONB-005 | Las tareas no se borran. "No aplica" exige motivo. |
| RN-ONB-006 | **El cese nunca se bloquea por recursos** (D-034, D-061.7). La salida muestra los pendientes y crea las tareas; los equipos quedan "Pendiente de devolución". **Se retira el bloqueo del cese** (S-ONB-08); lo que se bloquea es la anonimización (RN-PRS-012). |
| RN-ONB-007 | "Devolver equipos" no se marca "No aplica" ni Hecha a mano mientras la Persona tenga activos asignados (incluidos los pendientes de devolución). |
| RN-ONB-008 | Las tareas con acción vinculada "Registrar cese", "Devolver equipos", "Suspender acceso" y "Recuperar licencias" se completan solas; no se marcan a mano. |
| RN-ONB-009 | Una salida pasa a Completado con la Persona Cesada y todas las tareas obligatorias resueltas. Si tras el cese queda un equipo pendiente de devolución, **el proceso sigue abierto** hasta que se devuelva, se decida su extravío con motivo (ENT), o se cancele el proceso con motivo. |
| RN-ONB-010 | "Atrasado" se **calcula al leer** (D-062.2): fecha de salida pasada y Persona con pendientes, o tareas vencidas. El proceso diario solo emite avisos: el día de la fecha, a los 3 días, a los 7 días y luego cada semana, al responsable y a Jefatura TI. |
| RN-ONB-011 | Los plazos se cuentan en días corridos; la empresa puede optar por su calendario compartido (zona, horario, feriados, D-062.4). |
| RN-ONB-012 | No se inicia un ingreso ni una salida para una Persona Cesada o Anonimizada. |
| RN-ONB-013 | La recontratación se hace reactivando a la Persona (PRS) y luego iniciando un ingreso nuevo. |
| RN-ONB-014 | Los puestos de licencia se liberan solos al cesar la Persona (RN-LIC-011); "Recuperar licencias" se marca sola. Antes del cese puede liberarlos el técnico desde licencias. |
| RN-ONB-015 | Las tareas de accesos externos (correo corporativo, VPN, CRM) son manuales: la plataforma no entra a esos sistemas. |
| RN-ONB-016 | Una Persona sin tipo de puesto usa la plantilla General. |
| RN-ONB-017 | Todo lleva la empresa; un proceso o plantilla de otra empresa responde "no encontrado" (D-021.5). |
| RN-ONB-018 | Nadie completa tareas de un proceso de su propia Persona vinculada. |
| RN-ONB-019 | Inactivar una plantilla no afecta a los procesos abiertos con ella. |
| RN-ONB-020 | **Contenido mínimo de los avisos** (D-061.4): a un usuario, lo necesario para actuar con la referencia `PRS-0042`; a una Persona sin Usuario o a una dirección sin verificar, solo tipo de aviso, código, fecha y nombre de la empresa; nunca nombres de terceros, series, listas de equipos ni enlaces de acción. |
| RN-ONB-021 | El recordatorio de salida a la Persona que se va queda **apagado** hasta la opinión legal (E-ONB-01); encendido, no lista equipos. |
| RN-ONB-022 | Las notas son texto libre: el validador común rechaza claves; se advierte "no escriba datos personales ni claves"; pueden redactarse por seguridad. |
| RN-ONB-023 | "Suspender acceso" usa la suspensión de membresía del núcleo y exige `usuarios.suspender`; la baja del usuario siempre se permite (D-057 S-03). |

### 4.3 Requisitos de calidad

| ID | Requisito medible |
|---|---|
| RNF-ONB-001 | Iniciar un proceso de 15 tareas toma menos de 3 segundos y menos de 4 clics desde la ficha. |
| RNF-ONB-002 | La pestaña "Tareas" de "Mi trabajo" con 200 tareas carga en menos de 2 segundos (p95). |
| RNF-ONB-003 | El panel de pendientes se calcula al leer, nunca de una copia. |
| RNF-ONB-004 | El 100 % de las acciones queda en la auditoría con quién, cuándo y motivo, sin nombres (D-030). |
| RNF-ONB-005 | Los avisos salen a la hora única del motor de NOT (por defecto 08:00 de la zona de la empresa, D-058 #3); dos corridas el mismo día no duplican ningún aviso (idempotente, recuperable, por empresa, D-038.4). |
| RNF-ONB-006 | Cada tabla tiene prueba de aislamiento con `app_empresa` y por identificador interno; el proceso diario se prueba con dos empresas (D-039.6). |
| RNF-ONB-007 | Pantallas operables por teclado, a 360 px, con contraste AA y estado en texto (D-053, DS-11). |

## 5. Estados y transiciones

**Proceso**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Abierto | `onboarding.iniciar` | Persona Activa; sin otro proceso abierto del mismo tipo |
| Abierto | Completado | Sistema o `onboarding.iniciar` | RN-ONB-009 |
| Abierto | Cancelado | `onboarding.cancelar` | Motivo obligatorio |

"Atrasado" no es un estado: se calcula al leer. Completado y Cancelado son finales.

**Tarea**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| Pendiente | En curso | Responsable | Ninguna |
| Pendiente o En curso | Hecha | Responsable o sistema | RN-ONB-007 y 008 |
| Pendiente o En curso | No aplica | `onboarding.editar_proceso` | Motivo; RN-ONB-007 |
| Hecha | Pendiente | `onboarding.editar_proceso` | Motivo; no vale para automáticas |

**Plantilla:** Activa a Inactiva y de vuelta, con `onboarding.plantillas`.

## 6. Datos

**Plantilla.** Empresa; nombre (único por empresa y tipo); tipo; tipo de puesto (vacío = General); estado. **Tarea de plantilla.** Plantilla; orden; título; descripción; categoría; responsable por defecto; plazo; obligatoria; acción vinculada.
**Proceso.** Empresa; Persona (por identificador); tipo; plantilla de origen; fecha de referencia; estado; iniciado y cerrado por (membresía) y cuándo; motivo de cancelación; versión del registro.
**Tarea de proceso.** Proceso; título; categoría; origen (Plantilla, Manual, Sistema); responsable (membresía); fecha límite; obligatoria; acción vinculada; estado; completada por y cuándo; nota; motivo de "No aplica".

**Datos personales declarados por este módulo (D-061.3)**

| Dato | Finalidad | Quién lo ve | Plazo y rutina |
|---|---|---|---|
| Proceso y tareas ligados a una Persona | Controlar entradas y salidas | `onboarding.ver`; nombre solo con `datos_personales.ver` | Mismo plazo que la Persona; se leen anonimizados porque apuntan por identificador |
| Notas (texto libre) | Seguimiento | `onboarding.ver` | No se pueden anonimizar de forma garantizada (se declara); redacción por seguridad |
| Responsable y quien completó | Trazabilidad | `onboarding.ver` | Plazo de la auditoría (provisional) |

**Qué se audita:** plantillas (alta y cambios), inicio, cierre y cancelación de procesos, y cada cambio de estado, responsable o fecha de una tarea.

## 7. Pantallas necesarias

Se reutilizan "Mi trabajo" (pestaña Tareas), la ficha de la Persona (botón de iniciar) y el diálogo de motivo (D-053).

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-ONB-01 | Plantillas (lista y editor) | Armar las listas por tipo de puesto | Administrador |
| PAN-ONB-02 | Iniciar proceso (asistente corto) | Elegir plantilla y fecha de referencia | Jefatura TI |
| PAN-ONB-03 | Detalle del proceso con panel de pendientes | Ver avance, tareas y pendientes; registrar el cese | Jefatura TI, Técnico |
| PAN-ONB-04 | Lista de procesos | Seguimiento y atrasados | Jefatura TI |

## 8. Notificaciones y automatismos

Todo es `Fase 2`, por el motor único de NOT (una tabla de avisos, hora única de envío). Contenido según RN-ONB-020.

| Cuándo | A quién | Qué dice |
|---|---|---|
| Se asigna una tarea | Responsable | "Tiene la tarea [título] para PRS-0042; vence el 20/11/2026." |
| Falta 1 día | Responsable | "Mañana vence la tarea [título]." |
| Tarea vencida | Responsable y Jefatura TI | "La tarea [título] de PRS-0042 venció el 20/11/2026." |
| Se inicia un ingreso | Jefe directo (usuario; si no tiene Usuario, a su correo) | Usuario: "Se programó el ingreso de PRS-0042 el 15/11/2026." Sin Usuario: tipo de aviso, código, fecha y empresa. |
| Se inicia una salida | Responsables y Jefatura TI | "Se programó la salida de PRS-0042 el 30/11/2026; hay N pendientes." |
| Salida atrasada | Responsable y Jefatura TI | RN-ONB-010. |
| Proceso completado | Quien lo inició | "Terminó el proceso de [ingreso/salida] de PRS-0042." |
| **Recordatorio de salida a la Persona** | **Apagado** (RN-ONB-021) | Si se enciende tras la opinión legal: "Su salida es el 30/11/2026; tiene pendientes con TI. Consulte con TI." |

**Proceso diario:** recalcula avisos; idempotente, recuperable (procesa los días pendientes en orden), empresa por empresa con "hoy" en su zona, con registro de corrida; no guarda estados "vencido" (se calculan al leer, D-062.2).
**Personas sin Usuario:** solo el aviso al jefe directo sin Usuario y, apagado, el recordatorio de salida (acordado con Notificaciones).

## 9. Integración con el núcleo y con otros módulos

- **PRS.** Tipo de puesto, fechas, cese (que no se bloquea) y suspensión de la membresía (RN-PRS-011).
- **ENT-A.** Las tareas "Entregar equipo" y "Devolver equipo" abren el asistente con la Persona cargada y se completan solas.
- **Registro de módulo (D-038.6).** El panel consulta los "pendientes de la persona" que declaran Inventario, Líneas (LIN), Licencias (LIC), Dominios (DOM), CMDB (CMD), Cambios (CAM) y Problemas (PRB); ninguno bloquea el cese, todos bloquean la anonimización.
- **Licencias.** Liberan los puestos al cesar (RN-LIC-011). **Dominios y CMDB:** "responsable inactivo".
- **Mesa de ayuda.** Una tarea puede enlazar un servicio del catálogo de AYU con la Persona como solicitante; el flujo del caso es de AYU.
- **Usuarios.** "Suspender acceso" usa la suspensión del núcleo.
- **Notificaciones.** Entrega todos los avisos.
- **Reportes.** Tiempo de ingreso, salidas atrasadas, tareas vencidas.

## 10. Criterios de aceptación

- **CA-ONB-01** (RF-ONB-001, 002, 004, 015, 016). Dada una Persona con tipo de puesto "Vendedor en campo" y su plantilla de ingreso, cuando Jefatura TI inicia el ingreso con fecha 15/11/2026, entonces se crean las tareas con fechas relativas y cada una con responsable.
- **CA-ONB-02** (RF-ONB-003, 006; RN-ONB-002). Dado un proceso abierto, cuando el administrador agrega una tarea a la plantilla, entonces el proceso abierto no la recibe y uno nuevo sí.
- **CA-ONB-03** (RF-ONB-005, 010, 011; RN-ONB-006). Dada una salida de Ana con una laptop asignada, cuando Jefatura TI pulsa "Registrar cese", entonces el sistema avisa "1 equipo quedará como Pendiente de devolución" y **completa el cese**; el panel lista la laptop con las acciones Devolver, Traspasar y Cambiar estado, y la laptop sigue Asignada.
- **CA-ONB-04** (RF-ONB-009; RN-ONB-008). Dada la misma salida, cuando el técnico registra la devolución de la laptop, entonces "Devolver equipos" pasa sola a Hecha y "Registrar cese", si ya ocurrió, figura Hecha.
- **CA-ONB-05** (RF-ONB-014; RN-ONB-009). Dada una salida con la Persona Cesada y todo resuelto, cuando se evalúa, entonces pasa a Completado y avisa a quien la inició; si queda un equipo pendiente, sigue abierta.
- **CA-ONB-06** (RN-ONB-010; RNF-ONB-005). Dada una fecha de salida pasada con pendientes, cuando se lee el proceso, entonces figura Atrasado; y cuando el aviso corre dos veces el mismo día, entonces el responsable recibe un solo aviso.
- **CA-ONB-07 (permiso denegado)** (RF-ONB-013; PS-203). Dado un usuario con rol Almacén o Jefatura TI sin `onboarding.plantillas`, cuando intenta editar una plantilla, por pantalla o llamando al servidor, entonces se rechaza y no cambia nada; un "Solo lectura" no ve el nombre de la Persona.
- **CA-ONB-08 (aislamiento)** (RN-ONB-017; RNF-ONB-006). Dado un proceso de la empresa A, cuando un usuario de B lo pide por **identificador interno**, entonces responde "no encontrado"; y al ejecutar el proceso diario con dos empresas, cada aviso y destinatario queda en la suya.
- **CA-ONB-09** (RN-ONB-001). Con un ingreso abierto, cuando se intenta otro ingreso para la misma Persona, entonces se rechaza.
- **CA-ONB-10** (RF-ONB-007). Cuando alguien marca "No aplica" sin motivo, entonces se rechaza; con motivo se acepta y queda auditado.
- **CA-ONB-11** (RN-ONB-007, 008). Con activos aún asignados (incluso pendientes de devolución), cuando se intenta marcar "Devolver equipos" "No aplica" o Hecha a mano, entonces se rechaza.
- **CA-ONB-12** (RF-ONB-008; RN-ONB-018). Cuando un usuario intenta completar tareas de su propia salida, entonces se rechaza.
- **CA-ONB-13** (RF-ONB-011; RN-ONB-023). Dada una Persona con membresía vinculada, cuando Jefatura TI (sin `usuarios.suspender`) intenta el cese, entonces se rechaza con "pida a un administrador"; con el Administrador, la membresía queda suspendida y "Suspender acceso" pasa sola a Hecha.
- **CA-ONB-14** (RN-ONB-020). Dado un aviso al jefe directo sin Usuario, cuando se revisa el correo, entonces contiene solo tipo, código `PRS-0042`, fecha y empresa; una búsqueda de un nombre "canario" no lo encuentra.
- **CA-ONB-15** (RF-ONB-012). Dado un Técnico con tareas asignadas, cuando abre "Mi trabajo", entonces las ve en la pestaña "Tareas" ordenadas por fecha y no existe otra bandeja.

## 11. Casos límite

1. **Salida inmediata (el mismo día).** Se inicia con fecha de hoy; las tareas con plazo negativo nacen vencidas.
2. **Jefe directo sin Usuario.** Sus tareas pasan a quien inició; el aviso va a su correo si lo tiene, con contenido mínimo.
3. **El responsable sale de la empresa.** Al cesar, sus tareas abiertas pasan a Jefatura TI y se avisa.
4. **Cambia el tipo de puesto en medio del proceso.** No cambia las tareas ya creadas.
5. **Plantilla inactivada con proceso abierto.** El proceso sigue con su copia.
6. **Equipo nunca devuelto.** Queda "Pendiente de devolución" y el proceso abierto y atrasado; se cierra devolviéndolo, decidiendo su extravío con motivo (ENT) o cancelando el proceso con motivo. El cese ya se pudo registrar.
7. **Persona sin correo.** No recibe avisos; las tareas siguen.
8. **Última administradora que sale.** Su cese se rechaza hasta tener otro administrador activo (D-004.7).
9. **Muchas salidas a la vez.** Cada Persona tiene su proceso; la lista filtra por fecha.
10. **Cese registrado sin proceso.** Se permite; los pendientes igual se muestran en la ficha.
11. **Licencias o dominios a su cargo.** Las licencias se liberan solas; los dominios, certificados y elementos de CMDB quedan "responsable inactivo" y generan tarea.
12. **Restaurar un respaldo.** Se reaplican anonimizaciones, suspensiones y bajas posteriores (D-052.4); los procesos abiertos se recalculan al leer.

## 12. Decisiones propuestas y supuestos

| ID | Estado | Propuesta y resultado |
|---|---|---|
| S-ONB-01 | Aceptado (D-056) | Módulo de Fase 2, ola C; solo el cese (sin bloqueo) es de la v1 y vive en PRS. |
| S-ONB-02 | Aceptado (diseño) | Plazos en días corridos, con calendario de empresa opcional (D-062.4). |
| S-ONB-03 | Aceptado (D-058) | Los puestos de licencia se liberan al cesar (RN-LIC-011). |
| S-ONB-04 | Aceptado (diseño) | Dos plantillas de ejemplo sembradas. |
| S-ONB-05 | Aceptado (diseño) | Sin procesos masivos en la versión inicial. |
| S-ONB-06 | Aceptado (diseño) | El empleado no ve su proceso en el portal. |
| S-ONB-07 | **Apagado** (D-058, E-ONB-01) | El recordatorio de salida a la Persona queda apagado hasta la opinión legal. |
| S-ONB-08 | **Cambiado y retirado** (D-058, D-061.7) | Las líneas ya no bloquean el cese: generan pendientes; se bloquea la anonimización. |
| S-ONB-09 | [SUPUESTO] | Si el responsable por defecto no puede actuar, la tarea va a quien inició (RN-ONB-003); no se pide al registro una celda nueva para Solicitante. |
| E-ONB-01 | [ESCALAR AL CEO] | **Legal.** El recordatorio de salida a la Persona, que se envía a su correo, y la reclamación de equipos por la plataforma pueden tener efectos laborales. Se pide opinión legal sobre el texto antes de encenderlo (L-11, D-034.6). Apagado por defecto. |

## 13. Fuera de alcance

- Entrar a otros sistemas (correo corporativo, directorio, CRM) para crear o quitar accesos: se verá en integraciones.
- Reclutamiento, contratos, trámites de nómina y documentos de RR. HH.
- Procesos masivos en un solo clic.
- Entrevista de salida o encuestas.
- Cobros o descuentos por equipos no devueltos.
- Aprobaciones de varios niveles para las tareas.
- Avisos de ONB en la v1 (D-061.4).

## 14. Historial de cambios

| Cambio en la v0.2 | Decisión o hallazgo que lo motiva |
|---|---|
| Retirado el bloqueo del cese (RN-ONB-006, RF-ONB-011, CA-ONB-03/04/05): el cese genera pendientes y tareas; el equipo queda "Pendiente de devolución"; el proceso sigue abierto | D-034, D-061.7, D-058, H-CUM-15, H-AUD-10 |
| Recordatorio de salida apagado hasta la opinión legal | D-058, E-ONB-01, H-CUM-06 |
| Correos con contenido mínimo: sin "Ingresa [nombre]", sin lista de equipos con serie | D-061.4, H-SEG-16, H-CUM-06 |
| Plazos en días corridos con calendario de empresa opcional | D-062.4, H-QA-22(8) |
| "Atrasado" y "vencida" se calculan al leer; avisos a la hora única; proceso diario declarado | D-062.2, D-058 #3, D-038.4, H-QA-12, H-DAT-17 |
| Exportación por la puerta única con `datos.exportar` | D-036.3, D-061.1, H-QA-07, H-CUM-07 |
| "Mis tareas" pasa a la pestaña "Tareas" de "Mi trabajo" | D-053, H-UX-05, H-UX-11 |
| Permisos migrados al registro: completar tarea propio para Técnico, Almacén y Jefatura; iniciar, editar y cancelar solo Administrador y Jefatura; plantillas solo Administrador | D-036, registro de permisos, D-037 |
| Columna "Cuándo" y CA que cita el requisito; pantallas con ID `PAN-ONB`; panel con pendientes de cada módulo mediante el registro de módulo | H-AUD-21, D-049.4, D-038.6, H-UX-12 |
| Puestos de licencia se liberan al cesar; dominios, CMDB, CAM y PRB generan pendientes y solo bloquean la anonimización | D-061.7, acuerdo con B y E |
| Datos personales del módulo declarados; notas con validador común | D-061.3, D-063.2, H-CUM-09, H-CUM-10 |
| Aislamiento por identificador interno y proceso diario con dos empresas | D-063.6, D-039.6, H-SEG-02 |
| Referencias de Persona `PRS-0042` y tono "usted" en avisos | D-049.2, DS-09 |
