# Módulo: Personas, áreas y ubicaciones (PER)

**Versión:** 0.1 (borrador del Analista de Negocio, Oleada B, Escuadrón D)
**Sigla de requisitos:** PER
**Fuente de verdad:** `docs/documento-funcional.md` y `docs/equipo/decisiones.md` (D-001 a D-029). Donde este módulo dice algo distinto de decisiones.md, manda decisiones.md.
**Marcas:** **[SUPUESTO]** = lo propongo yo con motivo, el Gerente de TI lo confirma. **[ESCALAR AL CEO]** = solo dinero, tema legal o algo irreversible.

---

## 1. Propósito, alcance y fase

**Propósito.** Llevar el directorio de las personas que reciben equipos de TI (empleados, externos y custodios) y la estructura de la empresa donde viven esos equipos: áreas, centros de costo, sedes, pisos y salas. Sin este módulo no se puede saber **quién tiene qué** ni **dónde está**.

**Fase.** Directorio de Personas, áreas, centros de costo y ubicaciones: **Etapa 2** (D-006, D-023.3), para que el inventario (Etapa 4) ya pueda asignar. Importación de personas: junto con la importación del Excel (Etapa 4, D-020). Anonimización manual: Etapa 2; anonimización automática: **no se activa** hasta que legal confirme los plazos (D-024).

**Entra**
1. Persona (quien recibe equipos), distinta de Usuario (quien entra a la plataforma), con estados Activa y Cesada.
2. Áreas o departamentos, centros de costo y tipos de puesto (catálogos por empresa).
3. Sedes y ubicaciones jerárquicas: Sede > Piso > Sala.
4. Jefe directo de cada Persona.
5. Vínculo opcional Persona con Usuario.
6. Bloqueo del cese de una Persona con activos asignados (D-006).
7. Importación de personas desde Excel, exportación, y atención de pedidos de datos personales (acceso, corrección, eliminación).
8. Anonimización (propuesta pendiente de legal).

**No entra:** ver sección 13.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Persona** | Alguien que puede recibir equipos: un empleado, un externo (contratista) o un custodio. No necesita cuenta en la plataforma. |
| **Usuario** | Quien entra a la plataforma con su correo. Puede estar vinculado a una Persona o no. |
| **Custodio** | Persona responsable de equipos compartidos (por ejemplo, el proyector de la sala de reuniones o las laptops de capacitación). |
| **Externo** | Persona que no es empleada (contratista, practicante de una agencia) pero recibe equipos. |
| **Área** | Departamento u oficina de la empresa (Ventas, Finanzas, Logística). |
| **Centro de costo** | Código contable al que se cargan los gastos de un área. Lo define la empresa. |
| **Tipo de puesto** | Clase de cargo que determina qué equipos y accesos necesita (Vendedor en campo, Administrativo, Desarrollador). |
| **Sede, Piso, Sala** | Tres niveles de ubicación. Una Sala está dentro de un Piso y un Piso dentro de una Sede. |
| **Cese** | Registro de que la Persona dejó de formar parte de la empresa (la Persona pasa a "Cesada"). No borra nada. |
| **Anonimización** | Reemplazar nombre y correo de una Persona cesada por una referencia genérica. No se puede deshacer. El historial de equipos se conserva. |
| **Referencia** | Código corto y legible de la Persona (P-0042). No se reutiliza nunca. |
| **Jefe directo** | Persona de la que depende otra Persona. |

## 3. Roles y permisos

Cada permiso tiene nombre y alcance. "Propio" = solo lo que le pertenece a la Persona vinculada a ese Usuario. Los permisos con * son **sensibles** (D-004.4) y se asignan por separado. Todo se comprueba en el servidor.

| Acción | Permiso | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura | Empleado (portal) |
|---|---|---|---|---|---|---|---|---|
| Ver la lista y la ficha de Personas | `personas.ver` | Todo | Todo | Todo | Todo | Propio | Todo | Propio |
| Ver nombre, correo y código de empleado | `datos_personales.ver`* | Sí | Sí | Sí | Sí | Propio | No | Propio |
| Crear Persona | `personas.crear` | Sí | No | Sí | No | No | No | No |
| Editar Persona | `personas.editar` | Sí | No | Sí | No | No | No | No |
| Registrar cese | `personas.cesar` | Sí | Sí | No | No | No | No | No |
| Reactivar Persona cesada | `personas.reactivar` | Sí | Sí | No | No | No | No | No |
| Vincular o desvincular Usuario | `personas.vincular_usuario`* | Sí | No | No | No | No | No | No |
| Importar personas | `importar.personas`* | Sí | No | No | No | No | No | No |
| Exportar la lista de Personas | `exportar.personas`* | Sí | No | No | No | No | No | No |
| Anonimizar una Persona | `personas.anonimizar`* | Sí | No | No | No | No | No | No |
| Atender pedido de datos personales (copia, corrección) | `personas.atender_derechos`* | Sí | No | No | No | No | No | No |
| Ver áreas, centros de costo y ubicaciones | `estructura.ver` | Sí | Sí | Sí | Sí | Sí | Sí | No |
| Crear y editar áreas y tipos de puesto | `areas.gestionar` | Sí | Sí | No | No | No | No | No |
| Crear y editar centros de costo | `centros_costo.gestionar` | Sí | No | No | No | No | No | No |
| Crear, mover e inactivar ubicaciones | `ubicaciones.gestionar` | Sí | Sí | No | No | No | No | No |

Notas:
- "Empleado (portal)" es una plantilla de rol nueva, con solo permisos de alcance propio. **[SUPUESTO]** (S-PER-01) Las 6 plantillas de D-004 no sirven para el portal: Solicitante podría crear compras. La empresa la puede editar como cualquier rol.
- Ver la lista de Personas **sin** `datos_personales.ver` muestra solo referencia (P-0042), área y tipo; el nombre aparece oculto. Es lo que pide D-004.4 para "Solo lectura".
- Nadie puede registrar el cese ni cambiar el vínculo de su propia Persona (RN-PER-009).

## 4. Requisitos

### 4.1 Requisitos funcionales

| ID | Requisito | Etapa |
|---|---|---|
| RF-PER-001 | Crear una Persona con nombre completo, tipo (Empleado, Externo, Custodio), área y, opcionalmente, correo, código de empleado, tipo de puesto, centro de costo, ubicación habitual, jefe directo y fecha de ingreso. | 2 |
| RF-PER-002 | Editar los datos de una Persona. Cada cambio guarda valor anterior y nuevo. | 2 |
| RF-PER-003 | Lista de Personas con buscador (nombre, correo, referencia, código), filtros (estado, área, sede, tipo de puesto, jefe, "con equipos a cargo") y exportación a Excel con permiso aparte (D-021.3). | 2 |
| RF-PER-004 | Ficha de la Persona: datos, jefe y equipo a cargo, equipos asignados hoy, historial de entregas y devoluciones (módulo ENT), procesos de ingreso/salida (ONB), Usuario vinculado y estado. | 2 |
| RF-PER-005 | Administrar áreas: crear, editar, inactivar. Cada área puede tener centro de costo por defecto y una Persona responsable. | 2 |
| RF-PER-006 | Administrar centros de costo: crear, editar, inactivar. | 2 |
| RF-PER-007 | Administrar sedes y ubicaciones en tres niveles (Sede > Piso > Sala): crear, renombrar, mover a otro padre, inactivar. Se muestra la ruta completa ("Lima > Piso 3 > Sala TI"). | 2 |
| RF-PER-008 | Marcar una ubicación como "almacén de TI" para que sea el destino sugerido de las devoluciones. | 2 |
| RF-PER-009 | Asignar jefe directo a una Persona y ver el organigrama simple (quién depende de quién). | 2 |
| RF-PER-010 | Catálogo de tipos de puesto por empresa (lo usa ONB para elegir la lista de verificación). | 2 |
| RF-PER-011 | Registrar el cese de una Persona con fecha, motivo general y un asistente que muestra lo pendiente: equipos asignados, líneas, órdenes abiertas, personas que dependen de ella y Usuario vinculado. | 2 |
| RF-PER-012 | Reactivar una Persona cesada (recontratación) en el mismo registro, con fecha de ingreso nueva y motivo. | 2 |
| RF-PER-013 | Vincular una Persona con un Usuario de la misma empresa, y desvincularlos, con permiso y auditoría. | 2 |
| RF-PER-014 | Importar personas desde plantilla Excel con vista previa, todo o nada por lote y lote deshacible (reglas de D-020). | 4 |
| RF-PER-015 | Anonimizar una Persona cesada, de forma manual con permiso y motivo, o por proceso automático (desactivado hasta confirmación de legal). | 2 |
| RF-PER-016 | Atender un pedido de datos personales: exportar a un archivo todo lo que la plataforma guarda sobre una Persona, corregirlo o anonimizarla, dejando constancia (D-024.6). | 2 |
| RF-PER-017 | Marcar en la lista las Personas "por regularizar": Activas importadas con equipos que pertenecían a alguien ya ausente. | 4 |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-PER-001 | Una Persona no necesita cuenta. Persona y Usuario son registros distintos; solo se unen por un vínculo opcional (D-006). |
| RN-PER-002 | Datos permitidos: nombre, tipo, área, correo (opcional), código de empleado (opcional), tipo de puesto, centro de costo, ubicación habitual, jefe directo, fechas de ingreso y cese. |
| RN-PER-003 | Datos prohibidos en la versión 1: documento de identidad, dirección, teléfono personal, fecha de nacimiento, foto, sueldo y datos de salud (D-006, auditor de cumplimiento R1). |
| RN-PER-004 | Cada Persona recibe una referencia P-NNNN, correlativa por empresa (mismo mecanismo de D-007.8). No se reutiliza nunca, aunque la Persona se anonimice. |
| RN-PER-005 | El correo de una Persona es único por empresa entre Personas no anonimizadas, sin distinguir mayúsculas ni espacios en los bordes. El código de empleado es único por empresa cuando se llena. |
| RN-PER-006 | Dos Personas con el mismo nombre se permiten (homónimos). El sistema avisa al crear y pide confirmar. |
| RN-PER-007 | Una Persona pertenece a una sola empresa. La misma persona real en dos empresas son dos registros independientes que no se ven entre sí. |
| RN-PER-008 | **No se puede cesar a una Persona con activos asignados** (D-006). Se resuelve devolviendo cada equipo, traspasándolo a otra Persona (ENT) o registrándolo como "Extraviado o robado" con motivo. No existe forma de saltarse el bloqueo. |
| RN-PER-009 | Nadie registra el cese, el vínculo ni la anonimización de su propia Persona. |
| RN-PER-010 | Al cesar, las órdenes y solicitudes abiertas de la Persona se reasignan a otro Usuario o se cancelan con motivo (D-006). El asistente no deja terminar con alguna sin resolver. |
| RN-PER-011 | **[SUPUESTO]** (S-PER-04) Al cesar, el Usuario vinculado queda suspendido en esa empresa y se cortan sus sesiones (D-002.6). Si fuera el último administrador activo, el cese se bloquea (D-004.7). |
| RN-PER-012 | **[SUPUESTO]** (S-PER-05, acordado con los Escuadrones B y E) Las líneas móviles Activas o Suspendidas a cargo de la Persona también bloquean el cese. Los puestos de licencia se liberan solos al cesar (con motivo "Baja de la persona"). Ser responsable de un dominio, certificado o elemento de la CMDB no bloquea: queda "responsable inactivo" y ONB crea una tarea. |
| RN-PER-013 | Una Persona cesada no puede recibir activos, ser jefe directo, custodio o responsable de área. Sigue apareciendo en el historial. |
| RN-PER-014 | El jefe directo debe ser una Persona Activa de la misma empresa, distinta de sí misma, y no puede formar ciclos (A jefe de B, B jefe de A). |
| RN-PER-015 | Si un jefe directo cesa, sus dependientes quedan "sin jefe directo" y se avisa al administrador. No se bloquea el cese. |
| RN-PER-016 | Una Persona cesada se puede reactivar con permiso y motivo. Una Persona anonimizada no se reactiva nunca. |
| RN-PER-017 | Un Usuario se vincula a una sola Persona por empresa y una Persona a un solo Usuario. Si el correo del Usuario (verificado) es igual al de la Persona, el sistema lo sugiere; si no coincide, se exige permiso y queda auditado. Nunca se vincula en automático. |
| RN-PER-018 | La anonimización es irreversible: reemplaza nombre por "Persona dada de baja NNNN", borra correo y código de empleado y desvincula al Usuario. Conserva referencia, área, fechas, tipo y todo el historial de equipos (D-024.2). |
| RN-PER-019 | Plazo propuesto: 2 años desde el cese (D-024.2), configurable por la empresa. No hay anonimización automática hasta que legal confirme (ver 12). |
| RN-PER-020 | No se anonimiza a una Persona con equipos asignados ni con un proceso de ingreso/salida abierto. Un pedido de eliminación antes del plazo se atiende con permiso y motivo, cumpliendo la misma condición. |
| RN-PER-021 | Las actas de entrega y devolución guardan una copia del nombre y área **al momento del acto** (S-PER-06). Cambiar el nombre después no reescribe actas. La anonimización sí las alcanza. |
| RN-PER-022 | La jerarquía de ubicaciones tiene como máximo tres niveles. Sede no tiene padre; Piso solo cuelga de Sede; Sala solo de Piso. Piso y Sala son opcionales: un activo puede estar "en la Sede". |
| RN-PER-023 | El nombre de una ubicación es único entre las que tienen el mismo padre, sin distinguir mayúsculas. El código opcional es único por empresa. |
| RN-PER-024 | Mover una ubicación lleva consigo todo lo que contiene. No se permite mover una ubicación dentro de sí misma ni cambiar su nivel. |
| RN-PER-025 | Una ubicación con activos, stock o hijas activas no se inactiva. Una inactiva no recibe nada nuevo, pero se ve en el historial (D-008.6). |
| RN-PER-026 | Un área o centro de costo inactivo no se asigna a nadie nuevo. Las Personas que ya lo tienen lo conservan hasta que alguien las cambie. |
| RN-PER-027 | Nada se borra: ni Personas, ni áreas, ni ubicaciones. Se inactivan, cesan o anonimizan (D-019). |
| RN-PER-028 | Cada Persona, área, centro de costo y ubicación lleva la empresa. Un identificador de otra empresa responde "no encontrado" (D-021.5). |
| RN-PER-029 | Los duplicados no se fusionan en la versión 1. Se traspasan los equipos al registro correcto (ENT) y se cesa el duplicado. |

### 4.3 Requisitos de calidad

| ID | Requisito medible |
|---|---|
| RNF-PER-001 | La lista de Personas con 5.000 registros responde en menos de 2 segundos (p95), con filtros y búsqueda. |
| RNF-PER-002 | La búsqueda por nombre, correo o referencia en una empresa con 20.000 Personas responde en menos de 1 segundo (p95). |
| RNF-PER-003 | Importar 2.000 Personas muestra la vista previa en menos de 60 segundos. |
| RNF-PER-004 | El árbol de 500 ubicaciones se muestra en menos de 2 segundos. |
| RNF-PER-005 | Anonimizar una Persona termina en menos de 5 segundos y conserva el 100 % de las filas de historial de equipos. |
| RNF-PER-006 | El 100 % de los cambios a Personas, áreas, centros de costo y ubicaciones queda en la auditoría en la misma operación (D-018.2). |
| RNF-PER-007 | Cada tabla del módulo tiene una prueba automática de aislamiento entre empresas (D-025). |
| RNF-PER-008 | Todas las pantallas se usan solo con teclado y en pantalla de 360 px de ancho; los estados se distinguen con texto, no solo con color (D-021.1). |
| RNF-PER-009 | Ningún mensaje de error contiene nombre, correo ni código de otra Persona (D-021.7). |

## 5. Estados y transiciones

**Persona**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) | Activa | `personas.crear` | Datos mínimos completos |
| Activa | Cesada | `personas.cesar` | Sin activos ni líneas asignados; órdenes abiertas resueltas; motivo general; fecha de cese |
| Cesada | Activa | `personas.reactivar` | Motivo y nueva fecha de ingreso; no anonimizada |
| Cesada | Anonimizada | `personas.anonimizar` o proceso programado | Plazo cumplido o pedido de eliminación con motivo; sin activos ni procesos abiertos |

"Anonimizada" es estado final. No hay otra transición. El Usuario vinculado se suspende al cesar y no se reactiva solo al reactivar la Persona.

**Área, centro de costo y ubicación:** Activa a Inactiva (con `areas.gestionar`, `centros_costo.gestionar` o `ubicaciones.gestionar`) y de vuelta a Activa. La ubicación cumple RN-PER-025.

## 6. Datos

**Persona.** Empresa; identificador interno no adivinable; referencia P-NNNN (única por empresa); nombre completo; tipo (Empleado, Externo, Custodio); correo (opcional, único por empresa); código de empleado (opcional, único por empresa); área; tipo de puesto (opcional); centro de costo (opcional; si falta, el del área); ubicación habitual (opcional); jefe directo (otra Persona de la misma empresa); fecha de ingreso; fecha de cese; motivo general de cese (Salida de la empresa, Fin de contrato o servicio, Traslado, Otro); estado (Activa, Cesada, Anonimizada); Usuario vinculado (opcional); fecha de anonimización; quién y cuándo creó y modificó.

**Área.** Empresa; nombre (único por empresa); código opcional; centro de costo por defecto; Persona responsable (opcional, Activa); estado.

**Centro de costo.** Empresa; código (único por empresa); nombre; estado.

**Tipo de puesto.** Empresa; nombre (único por empresa); estado.

**Ubicación.** Empresa; nombre; nivel (Sede, Piso, Sala, deducido del padre); ubicación padre; código opcional (único por empresa); dirección (solo en Sede, texto libre); "es almacén de TI" (sí/no); estado.

**Qué se audita (D-018.4):** altas, cambios con antes y después, cese y reactivación con motivo, vínculos y desvinculaciones, anonimizaciones, pedidos de datos personales atendidos, movimientos de ubicaciones, importaciones y exportaciones. **No se guarda** en la auditoría el contenido completo de datos personales: se guarda el cambio de campo; tras anonimizar, los valores personales anteriores en la auditoría se reemplazan por la referencia **[SUPUESTO]** (S-PER-07; excepción a "solo se agrega" que debe revisar Cumplimiento: ver 12).

## 7. Pantallas necesarias

| Pantalla | Propósito | Rol principal |
|---|---|---|
| Directorio de Personas | Buscar, filtrar y exportar | Técnico, Administrador |
| Ficha de Persona | Ver equipos a cargo, historial, procesos y vínculo | Técnico |
| Crear o editar Persona | Alta rápida (pocos campos) | Técnico |
| Asistente de cese | Mostrar pendientes y completar el cese | Jefatura TI, Administrador |
| Importar personas | Plantilla, vista previa, errores por fila, confirmar | Administrador |
| Áreas y centros de costo | Mantener los catálogos | Administrador |
| Sedes y ubicaciones (árbol) | Crear, mover e inactivar ubicaciones | Administrador, Jefatura TI |
| Tipos de puesto | Mantener el catálogo | Administrador |
| Organigrama simple | Ver dependencias por jefe directo | Jefatura TI |
| Datos personales y derechos | Atender copias, correcciones y anonimizaciones | Administrador |

## 8. Notificaciones y automatismos

| Cuándo | A quién | Qué dice |
|---|---|---|
| Se vincula un Usuario con una Persona (evento enviado también a la Persona sin Usuario, a su correo, sin enlaces de acción) | Correo de la Persona y administradores | "Tu cuenta quedó vinculada a la Persona P-0042 de [empresa]. Si no lo esperabas, avisa a TI." |
| Se cesa una Persona con Usuario vinculado | Administradores | "El acceso de [Persona] quedó suspendido por cese." |
| Un jefe directo cesa | Administradores | "N personas quedaron sin jefe directo." |
| Falta 30 días para poder anonimizar | Administradores | "Hay N Personas elegibles para anonimizar desde [fecha]." (solo aviso) |
| Termina una importación | Quien la hizo | Filas cargadas, rechazadas y enlace al reporte. |
| Proceso diario de anonimización | (sistema) | **Desactivado.** Solo lista elegibles y avisa. Se enciende únicamente por decisión escrita tras la confirmación de legal. |

## 9. Integración con el núcleo y con otros módulos

- **Núcleo.** Empresas y aislamiento (D-025); Usuarios, roles y permisos (D-004); auditoría (D-018); catálogos (D-008.7: ubicación y centro de costo son catálogos con tabla propia; este módulo les agrega jerarquía y reglas); importación (D-020); correlativos (D-007.8).
- **Inventario (Etapa 4).** El responsable de un activo es una Persona (D-006). La ubicación del activo usa este árbol. El bloqueo de RN-PER-008 consulta los activos asignados.
- **ENT.** Crea las asignaciones y las actas; consume Personas y ubicaciones; aporta el historial de la ficha.
- **ONB.** Usa tipo de puesto, fecha de ingreso y fecha de cese; el cese de la Persona es el último paso de una salida.
- **POR.** El portal se apoya en el vínculo Persona-Usuario (alcance "propio").
- **Mesa de ayuda.** El solicitante de un ticket puede ser Persona o Usuario; el cese obliga a reasignar los tickets abiertos (RN-PER-010).
- **Licencias y líneas móviles.** Ver S-PER-05: se confirma con ese escuadrón si se asignan a Persona.
- **Presupuesto y costos, reportes.** Consumen centro de costo y área para reparto de gastos y tableros.

## 10. Criterios de aceptación

- **CA-PER-01.** Dado un técnico con `personas.crear`, cuando crea la Persona "Ana Ruiz" sin correo y sin cuenta, entonces queda Activa con referencia P-0001, puede recibir un equipo y no aparece en la lista de Usuarios.
- **CA-PER-02.** Dada una Persona con correo `ana@x.com`, cuando se crea otra con `ANA@x.com ` en la misma empresa, entonces se rechaza con "ese correo ya está en uso" sin mostrar los datos de la otra Persona.
- **CA-PER-03.** Dada una Persona con una laptop asignada, cuando Jefatura TI intenta registrar su cese, entonces el sistema lo impide, lista la laptop con un enlace a "Devolver" y la Persona sigue Activa.
- **CA-PER-04.** Dada una Persona sin equipos pero con un Usuario vinculado, cuando se registra el cese, entonces la Persona queda Cesada, el Usuario queda suspendido en esa empresa, sus sesiones se cortan al instante y todo consta en la auditoría con quién, cuándo y motivo.
- **CA-PER-05 (aislamiento).** Dada la empresa A y la empresa B, cuando un usuario de B pide la ficha de una Persona de A por su identificador, entonces responde "no encontrado", igual que para un identificador inexistente; y la lista de B nunca contiene Personas de A.
- **CA-PER-06 (permiso denegado).** Dado un usuario "Solo lectura", cuando intenta crear o editar una Persona (en pantalla o llamando directo al servidor), entonces la acción se rechaza y no cambia nada.
- **CA-PER-07.** Dado un usuario "Solo lectura" sin `datos_personales.ver`, cuando abre la lista de Personas, entonces ve referencia, área y tipo, pero no nombre ni correo.
- **CA-PER-08.** Dada la Sala "TI" dentro del Piso 3, cuando se intenta mover el Piso 3 dentro de la Sala "TI", entonces se rechaza por ciclo y el árbol no cambia.
- **CA-PER-09.** Dado un jefe A de B, cuando se intenta poner a B como jefe de A, entonces se rechaza con "esto crearía un ciclo".
- **CA-PER-10.** Dada una Persona cesada hace más de 2 años sin equipos, cuando el administrador la anonimiza con motivo, entonces el nombre pasa a "Persona dada de baja 0042", el correo desaparece, el historial de equipos sigue completo y la acción no se puede deshacer.
- **CA-PER-11.** Dado un archivo de 100 filas con 1 fila con error, cuando se confirma la importación, entonces no se carga ninguna Persona y se descarga el reporte con fila, columna y motivo; al corregir y volver a subir, no se duplican las ya cargadas.
- **CA-PER-12.** Dada una Persona Cesada, cuando alguien intenta asignarle un equipo, entonces se rechaza con "la Persona está cesada".

## 11. Casos límite

1. **Homónimos.** Dos "Juan Pérez" en áreas distintas: se permiten; el correo o el código de empleado los distinguen.
2. **Persona sin correo.** Válido. No puede ser invitada al portal ni recibir avisos por correo hasta que se complete.
3. **Correo que cambia.** Se edita con auditoría; si hay Usuario vinculado, el vínculo se mantiene y se avisa a los administradores.
4. **Cese con fecha futura.** El cese solo se registra el día en que ocurre. La fecha de salida prevista vive en ONB; hasta que se registre el cese, la Persona sigue Activa.
5. **Equipo no devuelto por quien se fue.** Se registra como "Extraviado o robado" con motivo "No devuelto tras el cese" (ENT) y recién entonces se puede cesar.
6. **Excel con equipos asignados a alguien ya ausente.** La Persona se importa Activa y queda marcada "por regularizar" (RF-PER-017) hasta que se devuelvan o traspasen los equipos.
7. **Último administrador.** Si su Persona fuera cesada, el cese se bloquea hasta tener otro administrador activo.
8. **Recontratación.** Se reactiva el mismo registro; se conservan fechas de ingreso y cese anteriores en el historial.
9. **Pedido de eliminación con equipos asignados.** No se anonimiza; se informa a la Persona que primero debe devolver los equipos.
10. **Restaurar un respaldo antiguo.** Reaparecen Personas ya anonimizadas; DevOps debe volver a aplicar las anonimizaciones pendientes (D-024.4).
11. **Mover un Piso con 40 equipos.** Los equipos van con el Piso y cada uno registra el movimiento de ubicación.
12. **Persona en dos áreas.** No se permite: una sola área por Persona. Los casos matriciales se resuelven con el jefe directo.

## 12. Decisiones propuestas y supuestos

| ID | Tipo | Propuesta y motivo |
|---|---|---|
| S-PER-01 | [SUPUESTO] | Se agrega la plantilla de rol "Empleado (portal)" con solo permisos propios. Motivo: evitar que un empleado del portal pueda crear compras. Confirma el Gerente de TI. |
| S-PER-02 | [SUPUESTO] | Tres tipos de Persona: Empleado, Externo, Custodio. Motivo: D-006 nombra empleado y custodio; el externo es el caso real de contratistas. |
| S-PER-03 | [SUPUESTO] | Código de empleado opcional y único. Motivo: distingue homónimos y permite cruzar con el Excel. No es documento de identidad. Cumplimiento confirma que no cuenta como dato prohibido. |
| S-PER-04 | [SUPUESTO] | El cese suspende al Usuario vinculado. Motivo: un exempleado no debe conservar acceso. |
| S-PER-05 | [SUPUESTO] | Las líneas móviles bloquean el cese y las licencias no. Motivo: la línea es un recurso físico con costo recurrente y D-011 no asigna licencias a Personas en la versión 1. Se confirma con el Escuadrón B. |
| S-PER-06 | [SUPUESTO] | Las actas guardan copia del nombre y área al momento del acto. Motivo: una reimpresión debe mostrar lo que se firmó. Datos y Cumplimiento revisan que la copia entre en la anonimización. |
| S-PER-07 | [SUPUESTO] | Al anonimizar, los valores personales dentro de la auditoría se reemplazan por la referencia, sin tocar quién, cuándo ni qué. Es una excepción mínima a D-018.1 y la decide el Gerente de TI con Cumplimiento y Seguridad. |
| S-PER-08 | [SUPUESTO] | Áreas de un solo nivel, sin áreas dentro de áreas. Motivo: simple hoy y ampliable sin rehacer datos (criterio de decisiones.md). |
| S-PER-09 | [SUPUESTO] | Tres niveles fijos de ubicación. Motivo: es lo que pidió el CEO (sede > piso > sala). |
| S-PER-10 | [SUPUESTO] | Una sola área por Persona; sin fusión de duplicados en la versión 1. |
| E-PER-01 | [ESCALAR AL CEO] | **Legal e irreversible.** Los plazos de anonimización (2 años tras el cese) y de auditoría (5 años) son propuesta (D-024). La anonimización no se activa de forma automática hasta que legal los confirme. Debe consultarse además si el directorio de empleados exige registro ante la autoridad de datos personales y si el código de empleado o el correo son datos personales en el país de cada empresa. |

## 13. Fuera de alcance

- Sincronización con un sistema de RR. HH. o con el directorio de la empresa (Active Directory, Google Workspace); se trata en integraciones.
- Documento de identidad, dirección, teléfono personal, foto, sueldo (RN-PER-003).
- Organigrama completo con áreas jerárquicas y varias jefaturas.
- Restricción de qué ve cada rol por sede (queda fuera de la versión 1, D-023.2).
- Fusión automática de Personas duplicadas.
- Cobro o descuento al empleado por equipos perdidos (tema laboral, no de la plataforma).
- Nómina, asistencia o evaluación del desempeño.
