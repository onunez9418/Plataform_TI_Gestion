# Módulo: Onboarding y offboarding (ONB)

**Versión:** 0.1 (borrador del Analista de Negocio, Oleada B, Escuadrón D)
**Sigla de requisitos:** ONB
**Fuente de verdad:** `docs/documento-funcional.md` y `docs/equipo/decisiones.md`. Aplican D-006 (no se da de baja a una Persona con activos asignados), D-002.6 (baja de acceso corta sesiones), D-011 (licencias por total de puestos), D-018 (auditoría).
**Marcas:** **[SUPUESTO]** = propuesta mía que confirma el Gerente de TI. **[ESCALAR AL CEO]** = solo dinero, tema legal o algo irreversible.

---

## 1. Propósito, alcance y fase

**Propósito.** Que nadie olvide nada cuando alguien entra o sale de la empresa. Al **ingresar**: tiene su laptop, su celular, su línea, sus licencias y sus accesos. Al **salir**: devuelve los equipos, se le quitan los accesos y se recuperan las licencias. Hoy esto se hace de memoria o por correos sueltos; este módulo lo convierte en una lista con responsables y fechas.

**Fase.** **Después de la versión 1** (fase posterior a la Etapa 7), porque depende de Personas (Etapa 2) y de entregas (Etapa 4) ya funcionando. **Excepción:** el bloqueo del cese con activos asignados es de la versión 1 y vive en el módulo PER (RN-PER-008); aquí solo se muestra y se guía.

**Entra**
1. Plantillas de listas de verificación de ingreso y de salida, por tipo de puesto.
2. Procesos de ingreso y de salida de una Persona, con tareas, responsables y fechas.
3. Tareas que se completan solas cuando ocurre el hecho (equipos devueltos, cese registrado).
4. Panel de pendientes de la Persona (equipos, líneas, licencias, dominios).
5. Avisos de tareas por vencer, vencidas y salidas atrasadas.

**No entra:** ver sección 13.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Onboarding** | Proceso de ingreso de una Persona a la empresa. |
| **Offboarding** | Proceso de salida de una Persona. Termina con el cese. |
| **Plantilla** | Lista modelo de tareas, por ejemplo "Ingreso: Vendedor en campo". |
| **Proceso** | Aplicación de una plantilla a una Persona concreta, con fechas y responsables. |
| **Tarea** | Un paso con responsable y fecha límite (entregar laptop, crear correo, recuperar licencia). |
| **Tarea automática** | Tarea que el sistema marca Hecha cuando ocurre el hecho (ejemplo: se registra la devolución del último equipo). |
| **Fecha de referencia** | Fecha de ingreso (en un ingreso) o fecha de salida prevista (en una salida). Los plazos de las tareas se cuentan desde ella. |
| **Tipo de puesto** | Clase de cargo definida en PER; elige la plantilla sugerida. |
| **Cese** | Registro final de que la Persona dejó la empresa (módulo PER). |

## 3. Roles y permisos

| Acción | Permiso | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura | Empleado (portal) |
|---|---|---|---|---|---|---|---|---|
| Ver procesos y tareas | `onboarding.ver` | Todo | Todo | Todo | Propio | Propio | Todo | No |
| Iniciar un proceso | `onboarding.iniciar` | Sí | Sí | Sí | No | No | No | No |
| Completar tareas | `onboarding.completar_tarea` | Todo | Todo | Todo | Propio | Propio | No | No |
| Reasignar tareas y cambiar fechas | `onboarding.reasignar` | Sí | Sí | No | No | No | No | No |
| Agregar tarea manual o marcar "No aplica" | `onboarding.editar_proceso` | Sí | Sí | Sí | No | No | No | No |
| Cancelar un proceso | `onboarding.cancelar` | Sí | Sí | No | No | No | No | No |
| Crear y editar plantillas | `onboarding.plantillas` | Sí | Sí | No | No | No | No | No |
| Registrar el cese (último paso de una salida) | `personas.cesar` | Sí | Sí | No | No | No | No | No |

Notas:
- "Propio" = tareas asignadas a ese Usuario. El jefe directo de una Persona que tenga Usuario con rol Solicitante recibe tareas como "Confirmar qué equipo necesita" y solo ve esas.
- "Solo lectura" ve el avance de los procesos pero sin nombre de la Persona (sin `datos_personales.ver`, solo la referencia P-0042).
- El rol "Empleado (portal)" no ve procesos de onboarding ni offboarding, ni siquiera el propio (S-ONB-06).
- Todo se comprueba en el servidor (regla 6 de CLAUDE.md).

## 4. Requisitos

### 4.1 Requisitos funcionales

| ID | Requisito | Fase |
|---|---|---|
| RF-ONB-001 | Crear plantillas de tipo Ingreso o Salida, con nombre, tipo de puesto asociado (o "General") y una lista ordenada de tareas. | Posterior |
| RF-ONB-002 | Cada tarea de plantilla define: título, descripción, categoría (Equipo, Accesos, Licencias, Línea, Otro), responsable por defecto (un rol, "Jefe directo de la Persona" o "Quien inicia el proceso"), plazo en días respecto a la fecha de referencia (por ejemplo -3 o +1), obligatoria u opcional y acción vinculada (Entregar equipo, Devolver equipo, Suspender acceso de Usuario, Registrar cese, Ninguna). | Posterior |
| RF-ONB-003 | Duplicar, inactivar y reordenar plantillas y tareas. | Posterior |
| RF-ONB-004 | Iniciar un proceso de **ingreso** para una Persona Activa: el sistema sugiere la plantilla según su tipo de puesto (o la General), se confirma la fecha de ingreso y se crean las tareas con responsable y fecha. | Posterior |
| RF-ONB-005 | Iniciar un proceso de **salida** para una Persona Activa con fecha de salida prevista. | Posterior |
| RF-ONB-006 | Las tareas del proceso son una **copia** de la plantilla al momento de iniciar. | Posterior |
| RF-ONB-007 | Agregar tareas manuales a un proceso y marcar una tarea "No aplica" con motivo. | Posterior |
| RF-ONB-008 | Completar una tarea con nota opcional; reasignarla o cambiarle la fecha (con auditoría). | Posterior |
| RF-ONB-009 | Tareas automáticas: "Devolver equipos" se marca Hecha cuando la Persona queda sin activos asignados; "Suspender acceso" cuando el Usuario vinculado queda suspendido; "Registrar cese" cuando la Persona pasa a Cesada. | Posterior |
| RF-ONB-010 | Panel de la Persona dentro del proceso de salida con: equipos asignados (enlace a Devolver o Traspasar), líneas móviles, licencias, dominios y certificados de los que es responsable, órdenes y casos abiertos. | Posterior |
| RF-ONB-011 | Botón "Registrar cese" en el proceso de salida, activo solo cuando se cumple el bloqueo de PER; si no, muestra qué falta. | Posterior |
| RF-ONB-012 | Bandeja "Mis tareas" con las tareas asignadas al Usuario, ordenadas por fecha límite. | Posterior |
| RF-ONB-013 | Lista de procesos con filtros (tipo, estado, atrasados, responsable, área, rango de fechas) y exportación con permiso aparte. | Posterior |
| RF-ONB-014 | Cerrar el proceso cuando todas las tareas obligatorias están Hechas o No aplica (y, en salidas, la Persona está Cesada); cancelar con motivo. | Posterior |
| RF-ONB-015 | Plantillas de ejemplo ("Ingreso general" y "Salida general") sembradas al crear la empresa, editables. | Posterior |
| RF-ONB-016 | Iniciar un ingreso para la Persona recién creada con un solo botón desde su ficha o desde la importación. | Posterior |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-ONB-001 | Una Persona tiene como máximo un proceso abierto de cada tipo (uno de ingreso y uno de salida). |
| RN-ONB-002 | Las tareas del proceso son copia de la plantilla; editar la plantilla después no cambia procesos abiertos. |
| RN-ONB-003 | El responsable de una tarea es siempre un Usuario activo de la empresa. Si el responsable por defecto no se puede resolver (el jefe directo no tiene Usuario), se asigna a quien inició el proceso. |
| RN-ONB-004 | Un Usuario sin `onboarding.completar_tarea` de alcance "todo" solo puede completar tareas asignadas a él. |
| RN-ONB-005 | Las tareas no se borran. Una tarea que no aplica se marca "No aplica" con motivo obligatorio. |
| RN-ONB-006 | **Bloqueo del cese.** En un proceso de salida, la Persona no puede cesar con activos o líneas móviles asignados (RN-PER-008, RN-PER-012). El panel lista cada pendiente y la acción que lo resuelve: devolver, traspasar o registrar extravío. |
| RN-ONB-007 | La tarea "Devolver equipos" no puede marcarse "No aplica" mientras la Persona tenga activos asignados. |
| RN-ONB-008 | Las tareas con acción vinculada "Registrar cese" y "Devolver equipos" no se marcan a mano: se completan solas al ocurrir el hecho. |
| RN-ONB-009 | Un proceso de salida pasa a Completado solo con la Persona Cesada y todas las tareas obligatorias resueltas. |
| RN-ONB-010 | Si la fecha de salida prevista pasó y la Persona sigue con equipos, el proceso figura como **Atrasado**. Se avisa el día de la fecha, a los 3 días, a los 7 días y luego cada semana, al responsable y a Jefatura TI. |
| RN-ONB-011 | Los plazos se cuentan en días corridos (S-ONB-02). |
| RN-ONB-012 | No se inicia un ingreso ni una salida para una Persona Cesada o Anonimizada. |
| RN-ONB-013 | La recontratación de una Persona cesada se hace reactivándola (PER) y luego iniciando un ingreso nuevo. |
| RN-ONB-014 | Los puestos de licencia se liberan solos al cesar la Persona (RN-LIC-010). La tarea "Recuperar licencias" se marca sola al ocurrir; antes del cese se completa a mano tras liberar los puestos desde el módulo de licencias (S-ONB-03). |
| RN-ONB-015 | Una tarea de accesos externos (correo corporativo, VPN, sistema de ventas) es manual: la plataforma no entra a esos sistemas. |
| RN-ONB-016 | Una Persona sin tipo de puesto usa la plantilla General. |
| RN-ONB-017 | Todo dato lleva la empresa; un proceso o plantilla de otra empresa responde "no encontrado" (D-021.5). |
| RN-ONB-018 | Nadie completa tareas de un proceso cuya Persona es su propia Persona vinculada (no te das de baja a ti mismo, RN-PER-009). |
| RN-ONB-019 | Inactivar una plantilla no afecta a los procesos abiertos con ella. |
| RN-ONB-020 | Los avisos a la Persona que sale solo se envían a su correo, si lo tiene, antes del cese y sin enlaces de acción. |

### 4.3 Requisitos de calidad

| ID | Requisito medible |
|---|---|
| RNF-ONB-001 | Iniciar un proceso con 15 tareas toma menos de 3 segundos y menos de 4 clics desde la ficha de la Persona. |
| RNF-ONB-002 | La bandeja "Mis tareas" con 200 tareas carga en menos de 2 segundos (p95). |
| RNF-ONB-003 | El panel de pendientes de la Persona se calcula con datos al momento, nunca de una copia vieja. |
| RNF-ONB-004 | El 100 % de las acciones (iniciar, completar, reasignar, cancelar, plantillas) queda en auditoría con quién, cuándo y motivo. |
| RNF-ONB-005 | Un aviso de tarea vencida llega el mismo día de la fecha límite antes de las 09:00 hora de la empresa. |
| RNF-ONB-006 | Cada tabla del módulo tiene prueba de aislamiento entre empresas (D-025). |
| RNF-ONB-007 | Las pantallas se usan por teclado, en 360 px de ancho, y el estado de cada tarea se indica con texto además del color. |

## 5. Estados y transiciones

**Proceso**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Abierto | `onboarding.iniciar` | Persona Activa; sin otro proceso abierto del mismo tipo |
| Abierto | Completado | Sistema o `onboarding.iniciar` | Tareas obligatorias resueltas; en salidas, Persona Cesada |
| Abierto | Cancelado | `onboarding.cancelar` | Motivo obligatorio |

"Atrasado" no es un estado: se calcula cuando hay tareas vencidas o la fecha de salida pasó. Completado y Cancelado son finales: para volver a empezar se inicia un proceso nuevo.

**Tarea**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| Pendiente | En curso | Responsable | Ninguna |
| Pendiente o En curso | Hecha | Responsable o sistema | RN-ONB-008 para las automáticas |
| Pendiente o En curso | No aplica | `onboarding.editar_proceso` | Motivo; RN-ONB-007 |
| Hecha | Pendiente | `onboarding.editar_proceso` | Motivo; no vale para tareas automáticas |

**Plantilla:** Activa a Inactiva y de vuelta, con `onboarding.plantillas`.

## 6. Datos

**Plantilla.** Empresa; nombre (único por empresa y tipo); tipo (Ingreso, Salida); tipo de puesto (opcional, vacío = General); estado.

**Tarea de plantilla.** Plantilla; orden; título; descripción; categoría; responsable por defecto; plazo en días; obligatoria; acción vinculada.

**Proceso.** Empresa; Persona; tipo (Ingreso, Salida); plantilla de origen; fecha de referencia; estado; iniciado por y cuándo; cerrado por y cuándo; motivo de cancelación.

**Tarea de proceso.** Proceso; título; descripción; categoría; origen (Plantilla, Manual, Sistema); responsable (Usuario); fecha límite; obligatoria; acción vinculada; estado; completada por y cuándo; nota; motivo de "No aplica".

**Qué se audita (D-018.4):** creación y cambios de plantillas; inicio, cierre y cancelación de procesos; cada cambio de estado, responsable o fecha de una tarea; marcas "No aplica". Las notas libres no deben contener datos personales sensibles: la pantalla lo advierte.

## 7. Pantallas necesarias

| Pantalla | Propósito | Rol principal |
|---|---|---|
| Plantillas (lista y editor) | Armar las listas de verificación por tipo de puesto | Jefatura TI |
| Iniciar proceso | Elegir Persona, plantilla y fecha de referencia | Técnico |
| Detalle del proceso | Ver avance, tareas, responsables y panel de pendientes | Técnico, Jefatura TI |
| Mis tareas | Ver y completar lo que me toca | Técnico, Almacén, Solicitante |
| Lista de procesos | Seguimiento, atrasados y filtros | Jefatura TI |
| Panel de pendientes de la Persona (dentro de la salida) | Resolver el bloqueo del cese | Técnico |

## 8. Notificaciones y automatismos

| Cuándo | A quién | Qué dice |
|---|---|---|
| Se asigna una tarea | Responsable | "Tienes la tarea [título] para [P-0042], vence el [fecha]." |
| Falta 1 día para el vencimiento | Responsable | "Mañana vence la tarea [título]." |
| Tarea vencida | Responsable y Jefatura TI | "La tarea [título] de [P-0042] está vencida desde el [fecha]." |
| Se inicia un ingreso | Jefe directo (por la bandeja o, si no tiene Usuario, al correo de su Persona, sin enlaces) | "Ingresa [nombre] el [fecha]. TI preparará su equipo. Indica si necesita algo especial." |
| Se inicia una salida | Responsables de las tareas y Jefatura TI | "Sale [P-0042] el [fecha]. Hay N equipos por devolver." |
| 3 días antes y el día de la salida | **Persona que sale** (a su correo, si lo tiene) | "Tu fecha de salida es el [fecha]. Debes devolver a TI: [lista de equipos con serie]." Sin enlaces de acción. |
| Salida atrasada con equipos | Responsable y Jefatura TI | Según RN-ONB-010. |
| Proceso completado | Quien lo inició | "Terminó el proceso de [ingreso/salida] de [P-0042]." |
| Diario (automático) | (sistema) | Recalcula vencidas y atrasadas; marca las tareas automáticas cuando corresponde. |

Eventos que se envían a una Persona **sin Usuario**: solo el recordatorio de salida y el aviso al jefe directo sin Usuario, ambos por correo, sin enlaces de acción (acordado con Notificaciones).

## 9. Integración con el núcleo y con otros módulos

- **PER.** Tipo de puesto, fecha de ingreso, cese, bloqueo (RN-PER-008) y suspensión del Usuario vinculado (RN-PER-011).
- **ENT.** Las tareas "Entregar equipo" y "Devolver equipo" abren la entrega o devolución con la Persona prellenada y se completan solas con el acta.
- **Licencias y líneas móviles.** Exponen los "pendientes de la persona" (puestos, líneas) con enlaces. Acordado: las líneas activas bloquean el cese; las licencias y los dominios o certificados de los que la Persona es responsable generan tarea, no bloqueo.
- **Dominios y certificados.** Una Persona responsable queda "sin responsable" tras el cese y aparece en su calidad de datos.
- **CMDB.** Recibe los cambios de estado de la Persona.
- **Mesa de ayuda.** Una tarea puede enlazar a un servicio del catálogo de AYU con la Persona como solicitante; el proceso del caso lo define ese módulo.
- **Usuarios y roles.** La acción "Suspender acceso" usa la suspensión de membresía del núcleo (D-002.6).
- **Notificaciones.** Entrega de todos los avisos de la sección 8.
- **Reportes.** Tiempo promedio de ingreso, salidas atrasadas, tareas vencidas por responsable.

## 10. Criterios de aceptación

- **CA-ONB-01.** Dada una Persona con tipo de puesto "Vendedor en campo" y la plantilla "Ingreso: Vendedor en campo", cuando un técnico inicia el ingreso con fecha 15 de noviembre, entonces se crean las tareas de la plantilla con fechas relativas a esa fecha y cada una con su responsable.
- **CA-ONB-02.** Dado un proceso abierto, cuando el administrador agrega una tarea a la plantilla, entonces el proceso abierto no la recibe; uno nuevo sí.
- **CA-ONB-03.** Dada una salida de Ana con una laptop asignada, cuando Jefatura TI intenta registrar el cese, entonces el sistema lo impide, el panel lista la laptop con las acciones Devolver, Traspasar y Extravío, y Ana sigue Activa.
- **CA-ONB-04.** Dada la misma salida, cuando el técnico registra la devolución de la laptop, entonces la tarea "Devolver equipos" pasa sola a Hecha y el botón "Registrar cese" se habilita.
- **CA-ONB-05.** Dada la salida con todas las tareas resueltas y la Persona Cesada, cuando el sistema evalúa el proceso, entonces pasa a Completado y avisa a quien lo inició.
- **CA-ONB-06.** Dada una fecha de salida pasada con equipos asignados, cuando corre el aviso diario, entonces el proceso figura como Atrasado y el responsable y Jefatura TI reciben el aviso según RN-ONB-010.
- **CA-ONB-07 (permiso denegado).** Dado un usuario con rol Almacén sin `onboarding.plantillas`, cuando intenta editar una plantilla (en pantalla o llamando al servidor), entonces se rechaza y la plantilla no cambia.
- **CA-ONB-08 (aislamiento).** Dado un proceso de la empresa A, cuando un usuario de la empresa B pide el proceso o la plantilla por su identificador, entonces responde "no encontrado" y las listas de B no incluyen nada de A.
- **CA-ONB-09.** Dado que la Persona ya tiene un ingreso abierto, cuando se intenta iniciar otro ingreso, entonces se rechaza con "ya hay un ingreso abierto".
- **CA-ONB-10.** Dada una tarea, cuando alguien la marca "No aplica" sin motivo, entonces se rechaza; con motivo se acepta y queda en la auditoría.
- **CA-ONB-11.** Dada la tarea "Devolver equipos" con activos aún asignados, cuando se intenta marcarla "No aplica" o Hecha a mano, entonces se rechaza.
- **CA-ONB-12.** Dado un Usuario que es la Persona de la salida, cuando intenta completar tareas de su propia salida, entonces se rechaza.

## 11. Casos límite

1. **Salida inmediata (despido el mismo día).** Se inicia con fecha de hoy; las tareas con plazo negativo nacen vencidas y se marcan así sin error.
2. **El jefe directo no tiene Usuario.** Sus tareas pasan a quien inició el proceso y el aviso va a su correo si lo tiene.
3. **El responsable de una tarea sale de la empresa.** Al cesar, sus tareas abiertas se reasignan a Jefatura TI y se avisa.
4. **Cambia el tipo de puesto en medio del proceso.** No cambia las tareas ya creadas; se pueden agregar manuales.
5. **Plantilla inactivada con proceso abierto.** El proceso sigue con su copia.
6. **Equipo nunca devuelto.** Se registra "Extraviado o robado, No devuelto tras el cese" (ENT); eso destraba el cese.
7. **Persona sin correo.** No recibe el recordatorio de salida; las tareas siguen.
8. **Ingreso para una Persona que ya tiene equipos** (por importación). Las tareas de entrega se pueden marcar "No aplica" con motivo, salvo que falten equipos.
9. **Última administradora que sale.** El cese se bloquea hasta tener otro administrador activo (RN-PER-011).
10. **Muchas salidas a la vez** (reducción de personal). Cada Persona tiene su proceso; la lista permite filtrar por fecha. Procesos masivos con un solo clic quedan fuera (S-ONB-05).
11. **Cese ya registrado sin proceso.** Se permite cesar a una Persona sin proceso de salida; el bloqueo aplica igual.

## 12. Decisiones propuestas y supuestos

| ID | Tipo | Propuesta y motivo |
|---|---|---|
| S-ONB-01 | [SUPUESTO] | El módulo es posterior a la versión 1; solo el bloqueo del cese es de la versión 1. Motivo: depende de PER y ENT, y D-023 no lo lista en la versión 1. |
| S-ONB-02 | [SUPUESTO] | Plazos en días corridos, sin calendario de feriados. Motivo: simple y suficiente; un calendario se puede sumar después. |
| S-ONB-03 | [SUPUESTO] | Los puestos de licencia se liberan al cesar (lo define el módulo de licencias en RN-LIC-010); durante la salida el técnico puede liberarlos antes. Acordado con el Escuadrón B. |
| S-ONB-04 | [SUPUESTO] | Se siembran dos plantillas de ejemplo por empresa. Motivo: el administrador no empieza de cero. |
| S-ONB-05 | [SUPUESTO] | Sin procesos masivos en la versión inicial. |
| S-ONB-06 | [SUPUESTO] | El empleado no ve su proceso de ingreso o salida en el portal. Motivo: contiene tareas internas de TI. |
| S-ONB-07 | [SUPUESTO] | Un recordatorio de devolución de equipos se envía a la Persona que sale. Motivo: es lo que más reduce equipos no devueltos. |
| S-ONB-08 | [SUPUESTO] | Líneas bloquean el cese; licencias, dominios y certificados no (acordado con B y E). |
| E-ONB-01 | [ESCALAR AL CEO] | **Legal.** El recordatorio de salida al correo personal de un exempleado o la reclamación de equipos por la plataforma pueden tener implicancias laborales. Se pide opinión legal sobre el texto del recordatorio antes de activarlo (decisiones.md, "Legal", punto 3). Hasta entonces el recordatorio queda desactivado por defecto. |

## 13. Fuera de alcance

- Entrar a otros sistemas (correo corporativo, directorio, CRM) para crear o quitar accesos: se verá en integraciones.
- Flujo de reclutamiento, contratos, documentos de RR. HH. o trámites de nómina.
- Calendario de feriados y cálculo de días hábiles.
- Procesos masivos en un solo clic.
- Entrevista de salida o encuestas.
- Cobros o descuentos por equipos no devueltos (tema laboral).
- Aprobaciones de varios niveles para las tareas.
