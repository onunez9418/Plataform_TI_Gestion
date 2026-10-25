# Módulo: Personas, áreas y ubicaciones (PRS)

**Versión:** 0.2 (corregida tras la revisión cruzada, Mesa #002; Oleada D, Escuadrón D)
**Sigla de requisitos:** PRS (antes PER; el núcleo conserva `RF-PER-001` a `RF-PER-010`, D-049.1). Los identificadores de supuestos `S-PER-nn` se conservan porque `decisiones.md` los cita.
**Fuente de verdad:** `docs/documento-funcional.md` y `docs/equipo/decisiones.md` (D-001 a D-064). Si este módulo dice algo distinto, manda `decisiones.md`; si choca con el núcleo, el módulo agrega filas pero no cambia celdas (D-037).
**Marcas:** **[SUPUESTO]** = propuesta mía que confirma el Gerente de TI. **[ESCALAR AL CEO]** = solo dinero, tema legal o algo irreversible. "Cuándo" = `v1, Etapa N`, `Fase 2` o `Fase 3` (D-056).

---

## 1. Propósito, alcance y fase

**Propósito.** Llevar el directorio de las personas que reciben equipos de TI (empleados, externos y custodios) y la estructura donde viven esos equipos: áreas, centros de costo, sedes, pisos y salas. Sin este módulo no se puede saber **quién tiene qué** ni **dónde está**.

**Cuándo.** `v1, Etapa 2`: directorio de Personas, uso de áreas, centros de costo, tipos de puesto y ubicaciones (D-006, D-023.3, D-040), registro de solicitudes de derechos y anonimización manual solo para derechos. `v1, Etapa 4`: importación de Personas con el marco único (D-050). La anonimización automática **no se activa** hasta que legal confirme los plazos (D-033.4).

**Entra**
1. Persona (quien recibe equipos), distinta de Usuario (quien entra a la plataforma), con estados Activa, Cesada y Anonimizada.
2. Uso de áreas, centros de costo, tipos de puesto y ubicaciones jerárquicas (Sede > Piso > Sala). **Los catálogos son del núcleo** (D-040); aquí solo se exige cómo los usa la Persona.
3. Jefe directo y organigrama simple.
4. Cese de una Persona **sin bloqueo por recursos** (D-034, D-061.7): genera pendientes de la persona y bloquea la anonimización.
5. Vínculo opcional de la Persona con una membresía de Usuario (1 a 1).
6. Importación de Personas, exportación por la puerta única, registro de solicitudes de derechos y anonimización.

**No entra:** ver sección 13.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Persona** | Alguien que puede recibir equipos: empleado, externo o custodio. No necesita cuenta. |
| **Usuario / membresía** | Quien entra a la plataforma; en cada empresa tiene una membresía con rol (D-041). |
| **Custodio** | Persona responsable de equipos compartidos (el proyector de la sala de reuniones). |
| **Externo** | Persona que no es empleada (contratista) pero recibe equipos. |
| **Cese** | Registro de que la Persona dejó la empresa (pasa a "Cesada"). No borra nada y **nunca se bloquea** por recursos. |
| **Pendientes de la persona** | Lista, en su ficha, de lo que sigue a su nombre tras el cese: equipos, líneas, puestos de licencia, dominios, elementos de CMDB, órdenes y casos abiertos. Cada módulo la declara (D-038.6). |
| **Pendiente de devolución** | Marca del equipo cuya Persona cesó: sigue "Asignado" a ella, con fecha del cese. **No es un estado** ni cuenta como pérdida (D-034.1 y 2). |
| **Anonimización** | Sobrescribir el registro de la Persona con una referencia genérica. No se deshace y no toca la auditoría (D-030.3). |
| **Referencia** | Código legible `PRS-0042`, mínimo 4 dígitos, no se reutiliza (D-049.2). |
| **Solicitud de derechos** | Pedido de una Persona de ver, corregir o eliminar sus datos (acceso, corrección, eliminación). |
| **Tipo de puesto** | Clase de cargo (Vendedor en campo, Administrativo) que elige la lista de verificación de ONB. |

## 3. Roles y permisos

Solo nombres del registro único `docs/registro-permisos.md` (D-036), con su identificador PS-nn. * = sensible (segunda verificación obligatoria). "Propio" = la Persona vinculada a la membresía; sin Persona vinculada, lista vacía, nunca error (D-036.4). Todo se comprueba en el servidor.

| Acción | PS | Permiso | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura | Empleado (portal) |
|---|---|---|---|---|---|---|---|---|---|
| Ver la lista y la ficha (sin nombre: ver `PRS-0042`, tipo y estado) | PS-24 | `personas.ver` | Todo | Todo | Todo | Todo | Propio | Todo | Propio |
| Ver nombre, correo, código de empleado, jefe directo y área | PS-22 | `datos_personales.ver`* | Sí | Sí | Sí | **No** | No | No | No (ve lo propio por el portal) |
| Crear y editar Personas (incluye el alta rápida al entregar) | PS-25 | `personas.crear_editar` | Sí | No | Sí | No | No | No | No |
| Cesar y reactivar una Persona | PS-26 | `personas.cesar` | Sí | Sí | No | No | No | No | No |
| Suspender la membresía vinculada al cesar | PS-14 | `usuarios.suspender`* (núcleo) | Sí | No | No | No | No | No | No |
| Vincular o desvincular Usuario | PS-27 | `personas.vincular_usuario` | Sí | No | No | No | No | No | No |
| Importar Personas (asistente "Importar datos") | PS-21 | `datos.importar`* | Sí | No | No | No | No | No | No |
| Exportar la lista (puerta única, con motivo) | PS-20 | `datos.exportar`* | Sí | No | No | No | No | No | No |
| Registrar y atender solicitudes de derechos | PS-29 | `personas.derechos_atender`* | Sí | No | No | No | No | No | No |
| Anonimizar (ejecutar, tras la propuesta de otra persona) | PS-28 | `personas.anonimizar`* | Sí | No | No | No | No | No | No |
| Ver catálogos (áreas, centros, ubicaciones, puestos) | PS-30 | `catalogos.ver` | Sí | Sí | Sí | Sí | Sí | Sí | No |
| Crear, mover e inactivar ubicaciones | PS-32 | `ubicaciones.gestionar` | Sí | No | Sí | No | No | No | No |
| Áreas, centros de costo y tipos de puesto | PS-33 | `estructura.gestionar` | Sí | No | No | No | No | No | No |

Notas:
- Esta tabla copia las celdas del registro único (`docs/registro-permisos.md`); no cambia ninguna. "Solicitante" y "Solo lectura" no tienen `datos_personales.ver` por defecto (PS-22): ven la referencia, y el Solicitante ve su propia Persona con `personas.ver` de alcance propio.
- Matriz resuelta por D-037 (filas 1, 4, 5, 7, 8): cese Administrador y Jefatura TI; si la Persona tiene membresía vinculada, quien cesa necesita además `usuarios.suspender`; ubicaciones Administrador y Técnico; centros, áreas y puestos solo Administrador; Almacén no ve nombres.
- "Empleado (portal)" es la séptima plantilla de lista cerrada y alcance propio (D-037 fila 11); la lista completa está en `portal-autoservicio.md`.
- Quien tenga permisos sensibles (`*`) debe tener segunda verificación (D-048.1).
- Nadie registra el cese, el vínculo ni la anonimización de su propia Persona (RN-PRS-009).
- Los permisos de módulos aún no activos no aparecen en la pantalla de roles (D-036.8).

## 4. Requisitos

Los RN y RNF rigen desde el "Cuándo" del requisito que protegen. Cada RF indica los criterios que lo cubren.

### 4.1 Requisitos funcionales

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-PRS-001 | Crear una Persona con nombre completo, tipo (Empleado, Externo, Custodio), área y, opcionalmente, correo, código de empleado, tipo de puesto, centro de costo, ubicación habitual, jefe directo y fecha de ingreso. | v1, Etapa 2 | CA-PRS-01, 02 |
| RF-PRS-002 | Editar una Persona. La auditoría guarda **qué campo cambió, sin el valor** de nombre, correo, área ni código de empleado (D-030.2); sí guarda valores de campos ordinarios. | v1, Etapa 2 | CA-PRS-13 |
| RF-PRS-003 | Lista con buscador (nombre, correo, referencia, código), filtros (estado, área, sede, tipo de puesto, jefe, "con pendientes") y exportación por la puerta única (motivo, columnas sensibles visibles, hoja "Aviso"; el botón se ve desactivado con la razón si falta el permiso, D-061.1). | v1, Etapa 2 | CA-PRS-07 |
| RF-PRS-004 | Ficha de la Persona con cabecera fija y pestañas: Resumen · Entregas y actas (ENT) · Pendientes de la persona · Procesos (ONB) · Historial. Muestra "correo no verificado" cuando corresponde. | v1, Etapa 2 | CA-PRS-03 |
| RF-PRS-005 | Cada Persona tiene **una sola área** (catálogo del núcleo, un nivel). Un área inactiva no se asigna a nadie nuevo. | v1, Etapa 2 | CA-PRS-01 |
| RF-PRS-006 | El centro de costo de la Persona es opcional; si falta, rige el del área. El catálogo, su responsable y su código externo son del núcleo (RF-CAT-001, 023, 024). | v1, Etapa 2 | CA-PRS-01 |
| RF-PRS-007 | La ubicación habitual de la Persona es un nodo del árbol del núcleo (RF-CAT-006, D-040.1): máximo 3 niveles, nombre único por superior, activos y stock en cualquier nivel. **Mover un nodo no escribe movimientos por activo**; el historial guarda la ruta en texto en el momento del movimiento. | v1, Etapa 2 | CA-PRS-08 |
| RF-PRS-008 | Una ubicación puede marcarse "almacén de TI"; es el destino sugerido de las devoluciones (ENT). Campo pedido al catálogo de ubicaciones. | v1, Etapa 2 | CA-PRS-08 |
| RF-PRS-009 | Asignar jefe directo y ver el organigrama simple con su lista equivalente (accesible sin ratón). Solo con `datos_personales.ver`. | v1, Etapa 2 | CA-PRS-09 |
| RF-PRS-010 | Los tipos de puesto son un catálogo del núcleo; este módulo los referencia desde la Persona y los usa ONB. | v1, Etapa 2 | CA-PRS-01 |
| RF-PRS-011 | Registrar el cese con fecha y motivo de lista cerrada, mediante un asistente que **muestra los pendientes sin bloquear**: equipos, líneas, puestos, dominios, elementos de CMDB, órdenes y casos abiertos, membresía vinculada. Al cesar: los equipos pasan a "Pendiente de devolución", se crea una tarea de salida y se avisa a Jefatura TI. | v1, Etapa 2 | CA-PRS-03, 04, 05 |
| RF-PRS-012 | Reactivar una Persona cesada (recontratación) en el mismo registro, con fecha de ingreso nueva y motivo. | v1, Etapa 2 | CA-PRS-12 |
| RF-PRS-013 | Vincular una Persona con una membresía de la misma empresa (1 a 1) y desvincularla, con permiso y auditoría. | v1, Etapa 2 | CA-PRS-10 |
| RF-PRS-014 | Importar Personas con el marco único (D-050): la fila exige código de empleado o correo; sin ninguno, error de la fila. Áreas, puestos y ubicaciones desconocidos se listan para aprobar, no se crean solos. | v1, Etapa 4 | CA-PRS-11 |
| RF-PRS-015 | Anonimizar una Persona cesada: manual, solo para solicitudes de derechos y con dos personas (una propone, otra ejecuta) y vista previa; automática **apagada** hasta decisión escrita tras la opinión de legal. | v1, Etapa 2 | CA-PRS-06, 14 |
| RF-PRS-016 | Registro de solicitudes de derechos (acceso, corrección, eliminación): fecha, quién la presenta, tipo, quién la atiende, plazo, resultado. La copia se entrega por descarga única con vencimiento y registro, nunca por correo. | v1, Etapa 2 | CA-PRS-15 |
| RF-PRS-017 | Mostrar los pendientes de la persona (ver RF-PRS-011) y una marca "por regularizar" en Personas importadas con equipos que eran de alguien ya ausente. | v1, Etapa 4 | CA-PRS-04 |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-PRS-001 | Una Persona no necesita cuenta. Persona y Usuario son registros distintos, unidos solo por un vínculo opcional (D-006). |
| RN-PRS-002 | Datos permitidos, cada uno con su finalidad (sección 6). El código de empleado se rotula "código interno" con aviso en pantalla de que no es un documento de identidad. |
| RN-PRS-003 | Datos prohibidos en la v1: documento de identidad, dirección, teléfono personal, fecha de nacimiento, foto, sueldo, datos de salud. |
| RN-PRS-004 | La referencia `PRS-NNNN` es correlativa por empresa (D-007.8), mínimo 4 dígitos, no se reutiliza ni al anonimizar. |
| RN-PRS-005 | El correo es único por empresa entre Personas no anonimizadas (comparación Unicode, sin quitar puntos ni etiquetas `+`, D-054.6). El código de empleado es único por empresa cuando se llena. |
| RN-PRS-006 | Los homónimos se permiten con aviso en la alta manual. La **importación** nunca crea homónimos: exige código o correo (D-050.4). |
| RN-PRS-007 | Una Persona pertenece a una sola empresa. La misma persona real en dos empresas son dos registros que no se ven (una empresa nunca sabe a qué otras pertenece alguien, D-041.5). |
| RN-PRS-008 | **El cese nunca se bloquea por recursos** (D-034.1, D-061.7). Los activos quedan "Pendiente de devolución" (siguen Asignados a esa Persona); líneas, puestos, dominios y elementos de CMDB generan pendientes. Pasar un equipo a "Extraviado o robado" exige una decisión explícita con motivo. |
| RN-PRS-009 | Nadie registra el cese, el vínculo ni la anonimización de su propia Persona. |
| RN-PRS-010 | Las órdenes y casos abiertos de la Persona se ofrecen para reasignar o cancelar con motivo (RF-PER-007 del núcleo); si no se resuelven en el acto quedan como pendientes. |
| RN-PRS-011 | Al cesar, la membresía vinculada se suspende y sus sesiones se cortan (D-002.6). Quien cesa necesita además `usuarios.suspender`; sin él, el cese se rechaza con "pida a un administrador". Si fuera la última administradora activa, se rechaza (D-004.7). |
| RN-PRS-012 | **Se bloquea la anonimización** mientras haya pendientes sin cerrar: equipos Asignados o "Pendiente de devolución", equipos "Extraviado o robado" con caso abierto, líneas, procesos ONB abiertos (D-033.3). El plazo se cuenta desde el cese y no vence antes del cierre de esos casos (rige el mayor). |
| RN-PRS-013 | Una Persona cesada no puede recibir activos, ser jefe directo ni custodio. Sí puede **devolver** equipos y ser origen de un traspaso. Sigue visible en el historial. |
| RN-PRS-014 | El jefe directo es una Persona Activa de la misma empresa, distinta de sí misma, sin ciclos. |
| RN-PRS-015 | Si un jefe directo cesa, sus dependientes quedan "sin jefe directo" y se avisa al administrador. No se bloquea. |
| RN-PRS-016 | Una Persona cesada se reactiva con permiso y motivo. Una anonimizada no se reactiva nunca. |
| RN-PRS-017 | La Persona se vincula a la membresía, 1 a 1 y único por empresa (D-041.2). Si el correo verificado de la membresía es el de la Persona, se sugiere; si no coincide, se exige `personas.vincular_usuario` y queda auditado. Nunca en automático. |
| RN-PRS-018 | **Anonimizar = sobrescribir el registro de la Persona** (D-030.3): nombre pasa a "Persona anonimizada 0042"; se borran correo, código de empleado, puesto y datos de contacto (D-033.2); se desvincula la membresía sin tocar la cuenta global (D-041.2). Se conservan referencia, tipo, área y fechas. La auditoría **no se toca**. |
| RN-PRS-019 | Plazo propuesto: 2 años desde el cese, configurable por empresa solo dentro de límites fijados por la plataforma (D-033.5, provisional hasta legal). |
| RN-PRS-020 | La anonimización manual exige: solicitud documentada (RF-PRS-016), vista previa de lo que se afectará, una persona que propone y **otra distinta** que ejecuta, y que quien presentó el pedido no lo atienda. Queda como evento en la auditoría y en el registro de anonimizaciones fuera de la base (D-052.3). |
| RN-PRS-021 | **Excepción declarada (D-051):** el acta de entrega guarda una copia del nombre y área en columnas propias con `retener_hasta` (activo más 5 años). La anonimización de la Persona **no** la toca; la función de anonimización la limpia al vencer `retener_hasta`. No se escribe en la auditoría. |
| RN-PRS-022 | La jerarquía de ubicaciones es la del núcleo: Sede no tiene superior, Piso cuelga de Sede, Sala de Piso; Piso y Sala son opcionales. |
| RN-PRS-023 | Nombre de ubicación único entre las que tienen el mismo superior (sin distinguir mayúsculas). Código externo opcional único por empresa. |
| RN-PRS-024 | No se mueve una ubicación dentro de sí misma ni se cambia su nivel. Mover lleva consigo todo su contenido. |
| RN-PRS-025 | Una ubicación con activos, stock o hijas activas no se inactiva (D-008.6). |
| RN-PRS-026 | Un área, centro de costo o puesto inactivo no se asigna a nadie nuevo; quienes ya lo tienen lo conservan. |
| RN-PRS-027 | Nada se borra: Personas, áreas, ubicaciones se inactivan, cesan o anonimizan (D-019). |
| RN-PRS-028 | Todo lleva la empresa. Un identificador de otra empresa responde "no encontrado" (D-021.5). |
| RN-PRS-029 | Los duplicados no se fusionan en la v1: se traspasan los equipos al registro correcto (ENT) y se cesa el duplicado. |
| RN-PRS-030 | Las solicitudes de derechos se excluyen de búsquedas, listas, reportes, exportaciones, tableros, avisos y API; las ve solo `personas.derechos_atender` (PS-29). Consultarlas queda en la auditoría (D-061.2, D-061.6). |
| RN-PRS-031 | El motivo de cese es una lista cerrada (Salida de la empresa, Fin de contrato, Traslado, Otro) **sin texto libre** (D-034.5). |
| RN-PRS-032 | Las listas y fichas respetan `datos_personales.ver`: sin él se muestra `PRS-0042`, tipo y estado (tres formas de dato oculto, D-053). |

### 4.3 Requisitos de calidad

| ID | Requisito medible |
|---|---|
| RNF-PRS-001 | La lista de 5.000 Personas responde en menos de 2 segundos (p95) con filtros. El volumen de referencia es el único de RNF-010 del núcleo. |
| RNF-PRS-002 | La búsqueda por nombre, correo o referencia responde en menos de 1 segundo (p95) con 20.000 Personas. |
| RNF-PRS-003 | La vista previa de importar 2.000 Personas termina en menos de 60 segundos, en el trabajador con barra de avance (D-038.7). |
| RNF-PRS-004 | Anonimizar una Persona termina en menos de 5 segundos y conserva el 100 % de las filas de historial. |
| RNF-PRS-005 | El 100 % de los cambios queda en la auditoría en la misma operación, sin valores de campos personales (D-018.2, D-030). |
| RNF-PRS-006 | Cada tabla del módulo tiene prueba de aislamiento con `app_empresa` y por **identificador interno** (D-039.3, D-063.6). |
| RNF-PRS-007 | Pantallas operables por teclado, a 360 px, con contraste AA, estado con texto y objetivos táctiles de 44 px; el organigrama trae su lista equivalente (D-053). |
| RNF-PRS-008 | Ningún mensaje de error contiene nombre, correo o código de otra Persona (D-021.7). |
| RNF-PRS-009 | Una búsqueda de un valor "canario" (nombre y correo de prueba) tras anonimizar no encuentra nada en tablas, exportaciones ni correos pendientes, salvo la copia del acta hasta `retener_hasta`. |

## 5. Estados y transiciones

**Persona** (Activa, Cesada, Anonimizada)

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) | Activa | `personas.crear_editar` (PS-25) | Datos mínimos completos |
| Activa | Cesada | `personas.cesar` (PS-26) (+ `usuarios.suspender` PS-14 si hay membresía vinculada) | Fecha y motivo de lista. **Sin condición por recursos** |
| Cesada | Activa | `personas.cesar` (PS-26 incluye reactivar) | Motivo y nueva fecha de ingreso; no anonimizada |
| Cesada | Anonimizada | `personas.anonimizar` (otra persona propuso) o proceso programado (apagado) | Solicitud documentada o plazo cumplido y confirmado; sin pendientes; ver RN-PRS-012 y 020 |

"Anonimizada" es final. La membresía suspendida no se reactiva sola al reactivar la Persona.

**Área, centro de costo, tipo de puesto y ubicación:** Activa a Inactiva y de vuelta, con el permiso de gestión. La ubicación cumple RN-PRS-025.

**Solicitud de derechos:** Registrada, En atención, Atendida, Rechazada (con motivo de lista). La atiende una persona distinta de quien la presentó.

## 6. Datos

**Persona.** Empresa; identificador interno no adivinable; referencia `PRS-NNNN`; tipo; área; tipo de puesto; centro de costo; ubicación habitual; jefe directo; fechas de ingreso y de cese; motivo de cese (lista); estado; membresía vinculada; fecha de anonimización; versión del registro; creada y modificada por (membresía). Los **datos personales viven en una tabla aparte** (nombre, correo, código de empleado, marca "correo verificado"); lo demás apunta por identificador (D-041.3).

**Área.** Nombre único por empresa; código opcional; centro de costo por defecto; estado. **Centro de costo, tipo de puesto, ubicación:** del núcleo; PRS pide a la ubicación el campo "almacén de TI".

**Solicitud de derechos.** Empresa; Persona afectada; tipo; fecha de recepción; quién la presenta; quién la atiende; plazo (lo fija legal); resultado; fecha de entrega de la copia. Sin contenido de datos.

**Datos personales declarados por este módulo (D-061.3)**

| Dato | Finalidad | Quién lo ve | Plazo y rutina |
|---|---|---|---|
| Nombre, correo, código de empleado | Saber quién tiene qué | `datos_personales.ver` | 2 años tras el cese, mayor con pendientes (provisional); se sobrescribe |
| Área, tipo de puesto, centro de costo, ubicación habitual | Reparto de equipos y costos | `datos_personales.ver` (área) | Puesto, centro y ubicación se borran al anonimizar; el área se conserva |
| Jefe directo | Aprobar y organigrama | `datos_personales.ver` | Se borra al anonimizar |
| Fechas de ingreso y cese, motivo de lista | Plazos y reportes | `personas.ver` | Se conservan sin nombre |
| Copia de nombre y área en el acta | Prueba de lo firmado | `datos_personales.ver` | Hasta `retener_hasta` (excepción D-051) |
| Solicitudes de derechos | Cumplir derechos | `personas.derechos_atender` | Plazo de la auditoría (5 años, provisional) |

**Qué se audita (D-018.4):** altas y cambios (campo, sin valores personales), cese, reactivación, vínculos, anonimizaciones, solicitudes de derechos y su consulta, movimientos de ubicaciones, importaciones (una entrada por lote) y exportaciones.

## 7. Pantallas necesarias

Se reutilizan la pantalla genérica **Catálogos** (con vista de árbol para ubicaciones), el asistente único **Importar datos** (tipo Personas), el asistente **Entregar** (con alta rápida de Persona) y el **diálogo de motivo** (D-053).

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-PRS-01 | Directorio de Personas (PR-15) | Buscar, filtrar y exportar | Técnico, Administrador |
| PAN-PRS-02 | Ficha de la Persona | Equipos, pendientes, procesos, historial, vínculo | Técnico |
| PAN-PRS-03 | Crear o editar Persona | Alta con pocos campos | Técnico |
| PAN-PRS-04 | Asistente de cese | Mostrar pendientes y completar el cese | Jefatura TI, Administrador |
| PAN-PRS-05 | Organigrama simple (con lista equivalente) | Ver dependencias | Jefatura TI |
| PAN-PRS-06 | Solicitudes de derechos y anonimización | Atender, previsualizar y anonimizar con dos personas | Administrador |

## 8. Notificaciones y automatismos

**En la v1 este módulo no envía correos** (D-061.4: solo invitación, acceso y aprobación). **Procesos diarios en la v1: ninguno**; la lista de elegibles para anonimizar se calcula al leer (D-062.2). Lo siguiente es `Fase 2` con NOT-completo; el correo a una Persona sin Usuario o sin verificar lleva solo tipo de aviso, código `PRS-0042`, fecha y nombre de la empresa.

| Cuándo | A quién | Qué dice |
|---|---|---|
| Se vincula una membresía | Persona (correo) y administradores | "Se vinculó una cuenta a PRS-0042 en [Empresa]. Si no lo esperaba, avise a TI." |
| Se cesa con membresía vinculada | Administradores | "El acceso de PRS-0042 quedó suspendido por cese." |
| Cese con pendientes | Jefatura TI | "PRS-0042 cesó con N pendientes." |
| Un jefe directo cesa | Administradores | "N personas quedaron sin jefe directo." |
| Hay Personas elegibles | Administradores | "Hay N Personas elegibles para anonimizar." (solo aviso) |

**Si legal autoriza la anonimización automática:** trabajo diario idempotente, recuperable (procesa los días pendientes en orden), empresa por empresa con "hoy" en su zona horaria, con registro de corrida (D-038.4) y prueba con dos empresas (D-039.6).

## 9. Integración con el núcleo y con otros módulos

- **Núcleo.** Empresas y aislamiento (D-039, D-046); membresías (D-041); catálogos (RF-CAT-001, 006, 023, 024); importación (D-050); puerta de exportación (D-061.1); auditoría (D-030); contadores (T-11). El núcleo conserva `RF-PER-001` a `010`; este módulo no los repite.
- **Inventario (Etapa 4).** El responsable de un activo es una Persona (RF-INV-024: la asignación abierta). "Pendiente de devolución" se calcula: asignación abierta de una Persona Cesada.
- **ENT.** Crea asignaciones y actas; consume Personas y ubicaciones; aporta las pestañas de historial.
- **ONB.** Usa puesto, fechas y cese; el cese es el paso final de una salida.
- **POR.** Se apoya en el vínculo Persona-membresía y en el registro de solicitudes de derechos.
- **Mesa de ayuda.** Un caso "restringido" de derechos guarda solo una referencia al registro de PRS (D-061.2). El solicitante es una Persona.
- **LIN, LIC, DOM, CMD.** Declaran sus pendientes en el registro de módulo; ninguno bloquea el cese (acordado con los Escuadrones B y E). Las líneas ya no bloquean (cambia S-PER-05).
- **Presupuesto y reportes.** Consumen área y centro de costo.

## 10. Criterios de aceptación

- **CA-PRS-01** (RF-PRS-001, 005, 006, 010; RN-PRS-001). Dado un técnico con `personas.crear_editar`, cuando crea "Ana Ruiz" sin correo ni cuenta, entonces queda Activa con referencia `PRS-0001`, puede recibir un equipo y no aparece entre los Usuarios.
- **CA-PRS-02** (RF-PRS-001; RN-PRS-005). Dada una Persona con `ana@x.com`, cuando se crea otra con `ANA@x.com ` en la misma empresa, entonces se rechaza con "ese correo ya está en uso" sin mostrar datos de la otra.
- **CA-PRS-03** (RF-PRS-004, 011; RN-PRS-008). Dada una Persona con una laptop asignada, cuando Jefatura TI registra su cese, entonces el cese **se completa**, la laptop sigue Asignada con la marca "Pendiente de devolución", aparece en sus pendientes y no cuenta como pérdida en reportes.
- **CA-PRS-04** (RF-PRS-011, 017; RN-PRS-011, 012). Dada una Persona cesada con un equipo pendiente, cuando se intenta anonimizar, entonces se rechaza con la lista de pendientes; al devolver el equipo se permite proponerla.
- **CA-PRS-05** (RF-PRS-011; RN-PRS-011). Dada una Persona con membresía vinculada, cuando Jefatura TI (sin `usuarios.suspender`) intenta el cese, entonces se rechaza y nada cambia; con el Administrador, la Persona queda Cesada, la membresía Suspendida y sus sesiones se cortan al instante, con auditoría.
- **CA-PRS-06 (permiso denegado)** (RF-PRS-015; RN-PRS-020). Dado un usuario "Solo lectura" o Técnico, cuando intenta anonimizar, crear Personas (Solo lectura) o ver nombres sin permiso, por pantalla o llamando al servidor, entonces se rechaza y no cambia nada. La misma persona no puede proponer y ejecutar la anonimización.
- **CA-PRS-07** (RF-PRS-003; RN-PRS-032). Dado un usuario Almacén o "Solo lectura" sin `datos_personales.ver`, cuando abre la lista, entonces ve `PRS-0042`, tipo y estado, pero no nombre, correo ni jefe; y el botón Exportar se ve desactivado con la razón.
- **CA-PRS-08** (RF-PRS-007, 008; RN-PRS-024). Dado el Piso 3 con 40 equipos, cuando se intenta moverlo dentro de la Sala "TI", entonces se rechaza por ciclo; cuando se mueve a otra Sede, entonces se mueve con su contenido y **no se escribe ningún movimiento por activo**.
- **CA-PRS-09** (RF-PRS-009; RN-PRS-014). Dado un jefe A de B, cuando se intenta poner a B como jefe de A, entonces se rechaza por ciclo.
- **CA-PRS-10** (RF-PRS-013; RN-PRS-017). Dada una membresía ya vinculada a otra Persona, cuando se intenta vincular a una segunda, entonces se rechaza (1 a 1).
- **CA-PRS-11** (RF-PRS-014). Dado un archivo de 100 filas con 1 error y otro con una fila sin código ni correo, cuando se confirma, entonces no se carga nada y se descarga el reporte; el **mismo archivo ya importado** se rechaza entero con la fecha del lote; el archivo corregido carga las 100.
- **CA-PRS-12** (RF-PRS-012; RN-PRS-013, 016). Dada una Persona Cesada, cuando alguien intenta asignarle un equipo, entonces se rechaza; al reactivarla con motivo, se permite. Una Persona anonimizada no se reactiva.
- **CA-PRS-13** (RF-PRS-002; RN-PRS-018). Dada una Persona cuyo nombre cambió, cuando se revisa la auditoría, entonces dice "nombre cambió" sin valor anterior ni nuevo.
- **CA-PRS-14** (RF-PRS-015; RN-PRS-018, 021; RNF-PRS-009). Dada una Persona cesada hace más de 2 años, sin pendientes, con solicitud documentada, cuando una persona propone y otra ejecuta, entonces el nombre pasa a "Persona anonimizada 0042", el correo desaparece, la auditoría sigue completa y sin nombres, el historial de equipos queda íntegro, y la copia del nombre en las actas sigue hasta `retener_hasta`.
- **CA-PRS-15 (aislamiento)** (RF-PRS-016; RN-PRS-028, 030). Dadas las empresas A y B, cuando un usuario de B pide por **identificador interno** una Persona, una ubicación o una solicitud de derechos de A, entonces responde "no encontrado"; las listas de B no incluyen nada de A. Una solicitud de derechos no aparece en búsquedas, reportes ni exportaciones de quien no tiene `personas.derechos_atender`.
- **CA-PRS-16** (RN-PRS-004; RF-PRS-001). Dado un usuario "Solicitante" sin Persona vinculada con alcance "propio", cuando abre Personas, entonces ve una lista vacía y no un error.

## 11. Casos límite

1. **Homónimos.** Se permiten en la alta manual con aviso; la importación exige código o correo.
2. **Persona sin correo.** Válida; no se puede invitar al portal ni recibir avisos.
3. **Correo que cambia.** Se edita con auditoría ("correo cambió"); la ficha muestra "correo no verificado" hasta verificarlo.
4. **Cese con fecha futura.** El cese se registra el día en que ocurre; la fecha de salida prevista vive en ONB.
5. **Equipo no devuelto por quien se fue.** Queda "Pendiente de devolución"; pasa a Extraviado o robado solo por decisión explícita con motivo (ENT). No existe el tipo "No devuelto tras el cese".
6. **Excel con equipos de alguien ya ausente.** La Persona se importa Activa y queda "por regularizar" (RF-PRS-017).
7. **Última administradora.** Su cese se rechaza porque suspender a la última administradora no se permite (D-004.7).
8. **Recontratación.** Se reactiva el mismo registro; se conservan fechas anteriores en el historial.
9. **Pedido de eliminación con equipos pendientes.** La anonimización se bloquea; se informa a la Persona que debe devolverlos. Si esa condición es legítima, es pregunta legal (L-06).
10. **Restaurar un respaldo antiguo.** Se reaplica el registro de anonimizaciones, guardado fuera de la base, antes de abrir el sistema (D-032, D-052.3); los respaldos mensuales viven 12 meses.
11. **Mover un Piso con 40 equipos.** Los equipos van con el Piso; el historial de cada uno conserva la ruta en texto de cuando se movió (RF-PRS-007).
12. **Persona externa que también es empleada de otra empresa.** Son dos registros independientes (RN-PRS-007); si hay obligación legal distinta, es pregunta legal (L-13).
13. **Cese por Jefatura TI de alguien con cuenta.** Se rechaza hasta que alguien con `usuarios.suspender` lo haga; el mensaje lo explica.
14. **Empresa con un solo administrador.** No puede anonimizar a mano (hace falta una segunda persona con el permiso); debe asignarlo a otra persona con segunda verificación.

## 12. Decisiones propuestas y supuestos

| ID | Estado | Propuesta y resultado |
|---|---|---|
| S-PER-01 | Decidido (D-037 fila 11, D-058) | Plantilla "Empleado (portal)": séptima plantilla de lista cerrada, alcance propio. |
| S-PER-02 | Aceptado (D-058) | Tipos: Empleado, Externo, Custodio. |
| S-PER-03 | Aceptado (D-058) | Código de empleado opcional y único; "código interno", no documento de identidad. Cumplimiento: L-09. |
| S-PER-04 | Aceptado, con condición (D-034.4) | El cese suspende la membresía vinculada, con `usuarios.suspender`. |
| S-PER-05 | **Cambiado** (D-058, D-061.7) | Las líneas **no** bloquean el cese; generan pendientes. Se bloquea la anonimización. |
| S-PER-06 | **Decidido: D-051** | Copia del nombre y área en el acta como excepción declarada con `retener_hasta`; la anonimización no la toca antes. |
| S-PER-07 | **Rechazado y retirado** (D-030, D-058) | La auditoría no guarda valores personales; anonimizar sobrescribe el registro. |
| S-PER-08 | Aceptado | Áreas de un solo nivel, ahora catálogo del núcleo. |
| S-PER-09 | Aceptado (D-040.1, D-058) | Tres niveles fijos; árbol del núcleo desde la Etapa 2. |
| S-PER-10 | Aceptado | Una sola área por Persona; sin fusión de duplicados. |
| S-PRS-11 | [SUPUESTO] | Límites del plazo de anonimización configurable: de 1 a 5 años, fijados por la plataforma; los confirma el Gerente de TI con legal. |
| S-PRS-12 | [SUPUESTO] | Al anonimizar se conserva el área (no es dato de contacto, D-033.2) para reportes. Cumplimiento confirma. |
| S-PRS-13 | [SUPUESTO] | Pedir la marca "almacén de TI" al catálogo de ubicaciones del núcleo. |
| E-PRS-01 | [ESCALAR AL CEO] | **Legal e irreversible.** Plazos de anonimización (2 años tras el cese, mayor con pendientes), de auditoría (5 años) y de respaldos (30 días y 12 meses) son provisionales (D-024, D-032, D-033). Hasta la respuesta escrita de legal no se activa nada automático. Preguntas: si el directorio exige registro ante la autoridad, si el código de empleado y el correo son datos personales en el país de cada empresa, si el nombre del acta debe anonimizarse antes (L-05, L-12), si se puede condicionar la eliminación a devolver equipos (L-06). |

## 13. Fuera de alcance

- Sincronización con RR. HH. o directorios (Active Directory, Google Workspace): integraciones.
- Documento de identidad, dirección, teléfono personal, foto, sueldo (RN-PRS-003).
- Organigrama completo con áreas jerárquicas y varias jefaturas.
- Restricción de qué ve cada rol por sede (D-023.2).
- Fusión de Personas duplicadas.
- Cobro o descuento al empleado por equipos perdidos (tema laboral).
- Nómina, asistencia o evaluación del desempeño.
- Motivo de cese en texto libre (D-034.5).

## 14. Historial de cambios

| Cambio en la v0.2 | Decisión o hallazgo que lo motiva |
|---|---|
| Renumeración `RF-PER` a `RF-PRS`; RN, RNF, CA, PAN con el mismo prefijo | D-049.1, H-AUD-03, H-QA-22(1), H-UX-25(a) |
| Retirado S-PER-07; anonimizar = sobrescribir el registro; la auditoría guarda "campo cambió" sin valores | D-030, D-058 #2, H-CUM-01, H-AUD-02, H-SEG-11, H-QA-05 |
| Copia de nombre y área en el acta como excepción declarada con `retener_hasta` | D-051, D-033.1-2, H-CUM-08, H-DAT-02 |
| El cese no se bloquea por recursos; pendientes de la persona; se bloquea anonimizar; "Pendiente de devolución" | D-034, D-061.7, D-057 S-03, H-CUM-15, H-AUD-10, H-QA-19 |
| El cese suspende la membresía solo con `usuarios.suspender` | D-034.4, D-037 fila 4, H-CUM-05(b), H-SEG-08 |
| Motivo de cese de lista cerrada sin texto libre | D-034.5, D-058 #7, H-CUM-15 |
| Datos con finalidad declarada; jefe directo solo con `datos_personales.ver`; tabla de datos personales del módulo | D-058 #7, D-061.3, H-AUD-20, H-CUM-09 |
| Ubicación: remite al árbol del núcleo; mover no escribe movimientos por activo | D-040.1, D-058 #4, H-AUD-09, H-DAT-16 |
| Área, tipo de puesto y centro de costo pasan a catálogos del núcleo; sin responsable en el área | D-040.2, H-DAT-16 |
| Matriz: cese Administrador y Jefatura TI; ubicaciones Administrador y Técnico; centros solo Administrador; Almacén sin nombres; `datos.exportar` y `datos.importar` únicos | D-037 filas 1, 4, 5, 7, 8, D-036.3, H-CUM-05, H-QA-08 |
| Anonimización manual solo para derechos y con dos personas; plazo con límites; automática apagada | D-033.4-5, H-CUM-17 |
| Registro de solicitudes de derechos desde la Etapa 2, excluido de todas las vías | D-061.2, H-CUM-11, H-SEG-10, H-QA-13 |
| Persona vinculada 1 a 1 a la membresía; referencia `PRS-NNNN`; datos personales en tabla aparte | D-041, D-049.2, H-DAT-03 |
| Importación de Personas con el marco único; exige código o correo; archivo ya importado se rechaza | D-050, H-DAT-11, H-QA-04 |
| Se retira la importación de personas como pantalla propia; pantallas con ID `PAN-PRS` y reutilización de Catálogos e Importar datos | D-053 DS-07, H-UX-10, H-UX-12, H-UX-25(f) |
| Correos de la v1: ninguno; contenido mínimo en la Fase 2; sin proceso diario en la v1 | D-061.4, D-062.2, H-CUM-06, H-SEG-16 |
| Cita D-024.4 sustituida por D-032 (caso límite 10) | D-032, H-AUD-24 |
| Columna "Cuándo" y CA que cita el requisito; CA de aislamiento por identificador interno, de alcance propio sin Persona, de canario y de doble control | H-AUD-21, D-063.6, D-036.4, H-SEG-25f, H-QA-05 |
| Etiqueta "Persona anonimizada 0042" | H-UX-25(d), D-049.2 |
