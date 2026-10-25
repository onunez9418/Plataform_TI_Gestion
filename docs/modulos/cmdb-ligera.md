# Módulo: CMDB ligera (`cmdb-ligera`, sigla CMD)

**Versión:** 0.2 (corrección tras la revisión cruzada, Oleada D; escuadrón E)
**Cuándo se construye:** Fase 3, ola E (primero de la ola: CMD, luego CAM, luego PRB). No entra a la v1 (D-056).
**Se apoya en:** `docs/equipo/decisiones.md` (D-001 a D-064), `docs/equipo/plan-correcciones.md` y el núcleo `docs/documento-funcional.md`.
**Marcas:** [SUPUESTO] = decisión propuesta por el analista; el resultado de cada uno está en la sección 12. [ESCALAR AL CEO] = solo dinero, tema legal o algo irreversible.

---

## 1. Propósito, alcance y fase

**Propósito.** Responder dos preguntas que hoy se contestan "de memoria": **"si cae X, ¿qué se afecta?"** y **"¿de qué depende X y quién responde por él?"**. La CMDB ligera es un mapa de los elementos de TI y de cómo se conectan. **No copia el inventario: lo lee** de donde vive. Solo guarda lo que el inventario no sabe: servicios, dependencias, criticidad y revisiones (CMDB delgada, D-062).

**Ejemplo.** El servicio "Correo corporativo" depende del dominio `miempresa.com` y del contrato de licencia "Microsoft 365 (50 puestos)". Si el dominio vence, la vista de impacto muestra: correo corporativo (criticidad Alta), 50 personas con puesto asignado y los 3 cambios programados que tocan ese dominio.

**Entra en este módulo**
1. Seis tipos de elemento de configuración (EC): Activo, Licencia, Línea móvil, Dominio o certificado, Servicio y Persona.
2. Lectura de los EC desde su origen (inventario, licencias, líneas, dominios, personas) y registro manual de Servicios.
3. Cuatro relaciones: depende de, instalado en, usa, asignado a (esta última, derivada).
4. Vista de impacto ("si cae X") y vista de dependencias ("de qué depende X").
5. Panel de calidad de datos y detección de huérfanos.
6. Importación de Servicios y relaciones con el marco único de importación (D-050).

**No entra:** descubrimiento automático de redes, diagramas gráficos, campos personalizados propios, relación con proveedores y contratos, costos. Ver sección 13.

**Cuándo.** Fase 3, ola E. Necesita el inventario (Etapa 4) y las Personas (Etapa 2); LIC, LIN y DOM (Fase 2, ola B) le dan contratos, líneas y dominios.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Elemento de configuración (EC)** | Cualquier cosa de TI que se quiere mapear: una laptop, un contrato de licencia, un servicio, un dominio. |
| **EC de origen** | EC que vive en otro módulo (activo, contrato de licencia, línea, dominio, Persona). La CMDB lo lee; no lo copia. |
| **EC materializado** | EC de origen que participa en una relación manual o tiene datos propios de la CMDB; entonces sí tiene una fila `EC-000001` para guardar esos datos. |
| **Servicio** | Algo que la empresa ofrece o usa y que se nota si falla: correo corporativo, VPN, Wi-Fi de la oficina. Es el único EC que se crea a mano. |
| **Relación** | Vínculo con dirección entre dos EC: "A depende de B". Tiene fecha desde y hasta. |
| **Depende de** | A deja de funcionar bien si B cae. Ej.: "Correo corporativo depende de Dominio miempresa.com". |
| **Instalado en** | Un software vive dentro de un equipo. Ej.: "Contrato Autodesk instalado en Laptop LAP-0042". |
| **Usa** | A utiliza B pero puede seguir sin él, con molestias. Ej.: "Sistema de ventas usa Línea móvil de alertas". |
| **Asignado a** | Un equipo, una línea o un puesto de licencia está en manos de una Persona. Se deriva de las asignaciones; nadie la escribe. |
| **Criticidad** | Qué tanto duele que falle: Baja, Media o Alta. |
| **Responsable** | Persona (con o sin Usuario) que responde por el EC. En equipos coincide con la Persona asignada. |
| **Vista de impacto** | Lista de lo que se afecta si un EC cae, siguiendo las relaciones hacia atrás hasta 5 niveles. |
| **Huérfano** | EC vigente sin relaciones ni responsable (RN-CMD-017). |
| **De baja** | EC que ya no opera. No se borra (D-019). |

## 3. Roles y permisos

Nombres y valores según `docs/registro-permisos.md` (D-036); este módulo no cambia celdas del núcleo (D-037). Alcance "todo". **Empleado (portal): no aplica**, no tiene acceso a este módulo.

| Acción | Permiso | PS | Admin. | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|---|
| Ver EC, relaciones, impacto y dependencias | `cmdb.ver` | PS-190 | Sí | Sí | Sí | No | No | Sí |
| Ver nombres de Personas (sin él, "12 personas" o `PRS-0042`) | `datos_personales.ver` (sensible) | PS-22 | Sí | Sí | Sí | No | No | No |
| Crear un Servicio | `cmdb.crear_servicio` | PS-191 | Sí | No | Sí | No | No | No |
| Editar datos propios de la CMDB y marcar "revisado" | `cmdb.editar` | PS-192 | Sí | No | Sí | No | No | No |
| Crear y terminar relaciones manuales | `cmdb.gestionar_relaciones` | PS-193 | Sí | No | Sí | No | No | No |
| Dar de baja un Servicio | `cmdb.dar_de_baja` | PS-194 | Sí | No | No | No | No | No |
| Ver el panel de calidad de datos | `cmdb.ver_calidad` | PS-195 | Sí | Sí | No | No | No | No |
| Importar Servicios y relaciones | `datos.importar` (sensible) | PS-21 | Sí | No | No | No | No | No |
| Exportar a Excel | `datos.exportar` (sensible) | PS-20 | Sí | No | No | No | No | No |

Notas: (1) Todo se comprueba en el servidor. (2) Importar y exportar pasan por el marco y la puerta únicos del núcleo (D-050, D-061.1); este módulo no exporta ni importa por su cuenta. (3) "Solo lo propio" significa "EC de los que soy responsable"; ningún rol inicial lo usa. (4) `cmdb.reconciliar` (PS-196) quedó Retirado en el registro: el reconciliador es automático.

## 4. Requisitos

Columnas: **Cuándo** (Fase 3 = ola E) y **CA** (criterio de la sección 10 que lo prueba). Los ID retirados no se reutilizan.

### 4.1 Funcionales

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-CMD-001 | Seis tipos de EC, lista cerrada: Activo, Licencia, Línea móvil, Dominio o certificado, Servicio, Persona. | Fase 3 | CMD-01 |
| RF-CMD-002 | Cada unidad física con serie de una categoría de naturaleza "equipo físico" es un EC de tipo Activo, leído del inventario. La unidad de una licencia no es EC. | Fase 3 | CMD-01 |
| RF-CMD-003 | Cada contrato de licencia, línea móvil y dominio o certificado es un EC leído de su módulo. El EC de una licencia es el contrato. | Fase 3 | CMD-01 |
| RF-CMD-004 | Cada Persona del directorio es un EC de lectura, mostrado con su referencia `PRS-NNNN`. | Fase 3 | CMD-09 |
| RF-CMD-005 | Un EC de origen refleja al instante los cambios de su origen, porque se lee de él. | Fase 3 | CMD-11 |
| RF-CMD-006 | Una persona con permiso crea un Servicio con nombre, descripción, criticidad y responsable. | Fase 3 | CMD-04 |
| RF-CMD-007 | Una persona con permiso completa en cualquier EC los datos propios de la CMDB: criticidad, responsable (si no viene del origen), descripción de uso y notas. | Fase 3 | CMD-12 |
| RF-CMD-008 | Se crean relaciones manuales depende de, instalado en y usa, solo en las combinaciones de RN-CMD-005. | Fase 3 | CMD-04 |
| RF-CMD-009 | Una relación se termina con fecha y motivo; no se borra. | Fase 3 | CMD-07 |
| RF-CMD-010 | "Asignado a" se muestra siempre y se deriva de las asignaciones de equipos, líneas y puestos de licencia. | Fase 3 | CMD-02 |
| RF-CMD-011 | Vista de impacto en tres grupos: "Se afecta" (depende de, instalado en), "Podría afectarse" (usa) y "Personas" (asignado a y responsables). | Fase 3 | CMD-03, CMD-09 |
| RF-CMD-012 | Vista de dependencias: de qué depende un EC, hasta 5 niveles. | Fase 3 | CMD-10 |
| RF-CMD-013 | La ficha de un EC muestra datos, relaciones vigentes y terminadas, cambios que lo afectaron, problemas abiertos e historial. | Fase 3 | CMD-01 |
| RF-CMD-014 | Listas con buscador, filtros (tipo, estado, criticidad, responsable, origen) y exportación por la puerta única (D-021, D-061.1). | Fase 3 | CMD-06 |
| RF-CMD-015 | Panel de calidad con los hallazgos de RN-CMD-017 a 021 y el porcentaje de EC sin hallazgos, con fecha de corte. | Fase 3 | CMD-08 |
| RF-CMD-016 | "Marcar como revisado" registra quién y cuándo. | Fase 3 | CMD-13 |
| RF-CMD-017 | Dar de baja un Servicio exige motivo y termina sus relaciones en el mismo acto. | Fase 3 | CMD-07 |
| RF-CMD-018 | **Retirado** (carga inicial de todo el inventario): ya no hace falta, la CMDB lee de su origen (D-062). | n/a | n/a |
| RF-CMD-019 | Importación de Servicios y relaciones con el marco único: simulacro con error por fila, todo o nada, solo crea, lote deshacible por anulación (D-050). | Fase 3 | CMD-14 |
| RF-CMD-020 | Operación para Cambios y Problemas: "calcular impacto de un conjunto de EC" (sección 9). | Fase 3 | CMD-03 |

### 4.2 Reglas de negocio

| ID | Regla | Cuándo | CA |
|---|---|---|---|
| RN-CMD-001 | Todo EC guardado y toda relación llevan empresa y solo unen EC de la misma empresa; la base lo impone con clave compuesta (D-039). | Fase 3 | CMD-05 |
| RN-CMD-002 | Un EC de origen no se crea ni se borra a mano: existe mientras exista su origen. | Fase 3 | CMD-01 |
| RN-CMD-003 | Los datos del origen (serie, SKU, estado, ubicación, vencimientos) se editan solo en su módulo. | Fase 3 | CMD-12 |
| RN-CMD-004 | Ningún EC se borra: se da de baja o queda De baja por su origen (D-019). | Fase 3 | CMD-07 |
| RN-CMD-005 | Combinaciones válidas (origen a destino). **Depende de:** Servicio a Servicio, Activo, Dominio, Línea, Licencia; Activo a Activo; Dominio a Servicio. **Instalado en:** Licencia a Activo; Servicio a Activo. **Usa:** Servicio a Servicio, Dominio, Línea, Licencia; Activo a Servicio. | Fase 3 | CMD-04 |
| RN-CMD-006 | "Asignado a" no se guarda ni se edita: se deriva de las asignaciones (Activo, Línea y puesto de Licencia hacia Persona). | Fase 3 | CMD-02 |
| RN-CMD-007 | No hay dos relaciones vigentes iguales (mismo origen, destino y tipo). | Fase 3 | CMD-04 |
| RN-CMD-008 | Un EC no se relaciona consigo mismo. | Fase 3 | CMD-04 |
| RN-CMD-009 | No se crean relaciones nuevas con un EC De baja. | Fase 3 | CMD-07 |
| RN-CMD-010 | Cuando un EC de origen queda De baja, sus relaciones manuales siguen vigentes y se marcan "relación con elemento de baja" para que alguien las corrija. | Fase 3 | CMD-15 |
| RN-CMD-011 | No se da de baja un Servicio del que dependan otros EC vigentes, hasta terminar o reasignar esas dependencias. | Fase 3 | CMD-07 |
| RN-CMD-012 | Un Servicio exige criticidad y responsable (Persona Activa) al crearse. Los demás EC nacen con criticidad Baja. | Fase 3 | CMD-04 |
| RN-CMD-013 | El nombre de un Servicio es único por empresa, sin distinguir mayúsculas ni espacios en los bordes. | Fase 3 | CMD-16 |
| RN-CMD-014 | El impacto sigue solo relaciones y EC vigentes, hasta 5 niveles, sin repetir ningún EC y sin quedarse en ciclos (consulta recursiva con control de ciclos). | Fase 3 | CMD-03, CMD-10 |
| RN-CMD-015 | "Depende de" e "instalado en" son "Se afecta"; "usa" es "Podría afectarse". La criticidad del resultado es la más alta entre los EC afectados. | Fase 3 | CMD-03 |
| RN-CMD-016 | Los nombres de Personas se ven solo con `datos_personales.ver`; antes se muestra la referencia `PRS-NNNN` o un conteo. Una Persona Anonimizada se muestra como "Persona anonimizada 0042" (D-006, D-030). | Fase 3 | CMD-09 |
| RN-CMD-017 | **Huérfano:** EC vigente de tipo Servicio, Licencia, Línea o Dominio sin relación vigente y sin responsable. Los Activos "En stock" no cuentan. | Fase 3 | CMD-08 |
| RN-CMD-018 | Hallazgo "sin dueño": Servicio, Dominio o Línea sin responsable, o con una Persona Cesada. | Fase 3 | CMD-17 |
| RN-CMD-019 | Hallazgo "crítico sin dependencias": Servicio de criticidad Alta sin ninguna relación "depende de". | Fase 3 | CMD-08 |
| RN-CMD-020 | Hallazgo "sin revisar": Servicio cuya última revisión supera los días configurados (180 por defecto), calculado con la fecha de la empresa. | Fase 3 | CMD-13 |
| RN-CMD-021 | Hallazgos adicionales: relación con elemento de baja y dependencia circular (A depende de B y B de A). | Fase 3 | CMD-10, CMD-15 |
| RN-CMD-022 | **Retirada** (la CMDB nunca impide el inventario): con el gancho en la misma operación ya no aplica; ver RN-CMD-026. | n/a | n/a |
| RN-CMD-023 | El stock por cantidad (cables, ratones) no genera EC. | Fase 3 | CMD-01 |
| RN-CMD-024 | Dar de baja o cesar a la Persona responsable no se bloquea por la CMDB: el EC queda con "responsable cesado" y aparece como pendiente de la Persona (D-061.7). | Fase 3 | CMD-17 |
| RN-CMD-025 | Solo se guardan como filas los Servicios y los EC materializados; el resto se lee de su origen. Los códigos `EC-000001` se reservan por bloque y pueden quedar saltos. | Fase 3 | CMD-01 |
| RN-CMD-026 | Un EC se materializa al crearle una relación manual o completarle un dato propio. Lo hace un gancho en la misma operación y el mismo bloqueo de la base que el origen; un reconciliador nocturno corrige diferencias, sin aviso. | Fase 3 | CMD-11 |
| RN-CMD-027 | La CMDB identifica cada EC de origen por su identificador interno estable, no por su código ni nombre. Cada módulo origen lo ofrece (sección 9). | Fase 3 | CMD-05 |
| RN-CMD-028 | La auditoría guarda "el campo X cambió" para notas, descripciones y motivos (texto libre) y el identificador de las Personas, nunca nombres (D-030). | Fase 3 | CMD-18 |
| RN-CMD-029 | Cada consulta de impacto que muestre 100 o más nombres de Personas, y toda exportación, deja una entrada de auditoría con el EC y la cantidad, sin los nombres. | Fase 3 | CMD-19 |
| RN-CMD-030 | Las notas y descripciones pasan por el validador común de texto libre (rechaza claves privadas y patrones de claves) y advierten no escribir datos personales (D-063.2). | Fase 3 | CMD-20 |

### 4.3 De calidad medible

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RNF-CMD-001 | La vista de impacto responde en 3 s o menos con 5.000 EC y 20.000 relaciones por empresa. | Fase 3 | CMD-03 |
| RNF-CMD-002 | **Retirado** (sincronización en 1 minuto). | n/a | n/a |
| RNF-CMD-003 | **Retirado** (carga inicial de 100.000 activos). | n/a | n/a |
| RNF-CMD-004 | Las listas cargan en 2 s o menos con páginas de 50 filas (selector 25/50/100). | Fase 3 | CMD-06 |
| RNF-CMD-005 | Ninguna consulta ni escritura cruza empresas; pruebas de aislamiento por identificador interno y con dos empresas (D-039, D-063.6). | Fase 3 | CMD-05 |
| RNF-CMD-006 | La vista de impacto se entiende sin color, funciona a 360 px y con teclado (D-021.1). | Fase 3 | CMD-03 |
| RNF-CMD-007 | El 100 % de altas, cambios, bajas, relaciones, importaciones, exportaciones y acciones automáticas queda en la auditoría; las automáticas con autor "sistema" (D-041.4). | Fase 3 | CMD-18 |
| RNF-CMD-008 | El reconciliador nocturno es idempotente, recuperable y corre por empresa con "hoy" de su zona (D-038.4); se prueba con dos empresas. | Fase 3 | CMD-21 |
| RNF-CMD-009 | Los hallazgos de tiempo ("sin revisar") se prueban con el reloj fijable de la plataforma (D-038.8). | Fase 3 | CMD-13 |

## 5. Estados y transiciones

**Estados del EC** (lista cerrada): **Vigente** y **De baja**. El estado propio del origen (por ejemplo "En stock" o "En reparación") se muestra aparte y no es un estado de la CMDB.

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Vigente | `cmdb.crear_servicio` | Solo Servicios; RN-CMD-012 y 013 |
| (nuevo) | Vigente | Sistema | Un EC de origen se materializa (RN-CMD-026) |
| Vigente | De baja | Sistema | El activo queda De baja o Extraviado o robado; el contrato, línea o dominio se da de baja |
| Vigente | De baja | `cmdb.dar_de_baja` | Solo Servicios; motivo obligatorio; RN-CMD-011 |
| De baja (de origen) | Vigente | Sistema | Solo con "reingreso" en el origen (D-009, D-012) |
| De baja (Servicio) | (final) | Nadie | Si el servicio vuelve, se crea otro y se anota el anterior |

**Estados de la relación:** Vigente y Terminada. Pasa a Terminada por `cmdb.gestionar_relaciones` (con motivo) o al dar de baja un Servicio; nunca vuelve: se crea otra.

## 6. Datos

**Elemento de configuración (guardado):** empresa; código `EC-000001` (por empresa, no se reutiliza, D-007; reservado por bloque); tipo; origen (manual o referencia al origen por identificador interno estable); nombre (en Servicios; en los de origen se lee); estado; criticidad; responsable (Persona; en los de origen se lee salvo que el origen no lo tenga); descripción de uso; notas; última revisión (fecha y quién); motivo de baja (Servicios). Unicidad: (empresa, código); (empresa, tipo y referencia de origen); (empresa, nombre normalizado) en Servicios.

**Relación:** empresa; extremo origen y extremo destino (cada uno apunta a un solo tipo, con clave compuesta con la empresa; la base exige que solo uno esté lleno); tipo; vigente desde y hasta; creada por; nota; motivo de término. Una vigente por (empresa, origen, destino, tipo).

**Lo que no se guarda:** el contenido de activos, contratos, líneas, dominios y Personas; "asignado a"; los hallazgos (se calculan; el panel guarda solo cifras con fecha de corte).

**Datos personales:** la CMDB no guarda nombres. El responsable es un identificador de Persona; los textos libres (notas, descripción) no deben llevar datos personales (aviso en pantalla). Declarado en la tabla de datos personales del núcleo (D-061.3).

**Qué se audita:** altas, bajas y materializaciones; cambios de criticidad y responsable (solo identificadores); relaciones creadas y terminadas; revisiones; importaciones (lote) y exportaciones; consultas de RN-CMD-029; acciones del reconciliador (autor "sistema"). Textos libres: solo "el campo X cambió" (D-030).

**Pendientes de la persona (registro de módulo, D-038.6):** EC de los que la Persona es responsable. El cese no se bloquea; se bloquea anonimizarla mientras queden sin reasignar.

## 7. Pantallas necesarias

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-CMD-01 | Lista de elementos | Buscar y filtrar por tipo, estado, criticidad, responsable. | Técnico |
| PAN-CMD-02 | Ficha del elemento | Datos, relaciones, cambios, problemas, historial. | Técnico |
| PAN-CMD-03 | Vista de impacto | "Si cae X": tres grupos, criticidad máxima, conteo de personas. | Jefatura TI |
| PAN-CMD-04 | Vista de dependencias | "De qué depende X", árbol de hasta 5 niveles. | Técnico |
| PAN-CMD-05 | Crear o editar Servicio | Alta con criticidad, responsable y primeras relaciones. | Técnico |
| PAN-CMD-06 | Agregar relación | Tipo, destino con buscador y aviso si la combinación no vale. | Técnico |
| PAN-CMD-07 | Calidad de datos | Hallazgos, porcentaje, "marcar revisado". | Jefatura TI |
| PAN-CMD-08 | Configuración de la CMDB | Días de revisión (solo el valor; la profundidad 5 es fija). | Administrador |

La importación usa el asistente único "Importar datos" y la exportación la puerta única del núcleo (no hay pantallas propias). No hay diagrama gráfico en la v1 de este módulo.

## 8. Notificaciones y automatismos

Los avisos usan el motor y la tabla únicos de Notificaciones (D-062.3). A una Persona sin Usuario solo se envía tipo de aviso, código, fecha y nombre de la empresa (D-061.4); sin nombres de terceros.

| Cuándo | A quién | Qué dice |
|---|---|---|
| Se crea un Servicio de criticidad Alta sin dependencias | Jefatura TI | "Se registró el servicio EC-000012 como crítico. Falta registrar de qué depende." |
| La Persona responsable de un EC pasa a Cesada | Jefatura TI | "Una Persona cesada responde por 5 elementos. Asigne un nuevo responsable." |
| Un EC de origen queda de baja y deja relaciones vigentes | Responsables de los EC relacionados y Jefatura TI | "El equipo LAP-000042 fue dado de baja y EC-000012 dependía de él. Revise la relación." |
| Servicio sin revisar más de 180 días | Responsable del Servicio | Resumen semanal: "Tiene 3 servicios por confirmar." |

**Procesos automáticos (D-038.4).** (1) *Reconciliador nocturno*: por empresa, a la hora local de la empresa; corrige filas materializadas que difieran de su origen; idempotente; al reiniciar procesa los días pendientes; deja registro de cada corrida (fecha lógica, filas corregidas). (2) *Cifras del panel de calidad*: mismo horario, con fecha de corte. Los hallazgos de tiempo no cambian estados; se calculan al leer con la fecha de la empresa (D-062.2).

## 9. Integración con el núcleo y con otros módulos

| Con | Qué se intercambia | Dueño del dato |
|---|---|---|
| Inventario (Etapa 4) | Lee activos con serie de naturaleza "equipo físico" y sus asignaciones. Pide: identificador interno estable y un evento `inventario.activo_dado_de_baja`. | Inventario |
| `personas-ubicaciones` | Lee Personas; la baja o cese avisa para el pendiente de la Persona. | Personas |
| `licencias-software` | Lee contratos (el EC es el contrato) y puestos asignados. | Licencias |
| `lineas-moviles`, `dominios-certificados` | Leen líneas, dominios y certificados; el vencimiento se consulta, no se copia. "Servicio que depende" de un dominio es la relación de esta CMDB. | Líneas, Dominios |
| `gestion-cambios` | Recibe "calcular impacto de un conjunto de EC": directos, indirectos, criticidad máxima y número de personas. La ficha del EC lista sus cambios. | CMDB (impacto), Cambios (vínculo) |
| `gestion-problemas` | La ficha del EC lista problemas abiertos y errores conocidos vigentes. | Problemas (vínculo) |
| `mesa-de-ayuda` | El caso puede indicar un EC afectado; la ficha cuenta casos de los últimos 90 días. | Mesa de ayuda |
| `notificaciones` | Motor y tabla de avisos; catálogo de eventos `<módulo>.<entidad>_<hecho>`. | Notificaciones |
| `reportes-tableros` | Expone EC por tipo y criticidad, calidad y huérfanos mediante filtros reutilizables. | CMDB |
| Núcleo | Empresa activa en la dirección, permisos, auditoría, contadores, marco de importación y puerta de exportación, calendario de empresa. | Núcleo |

## 10. Criterios de aceptación

Cada criterio indica el requisito que cubre.

**CA-CMD-01** (RF-CMD-001, 002, 003, 013, RN-CMD-002, 023, 025). Dado el módulo activo, cuando Almacén confirma una recepción de 3 laptops por serie, un cable por cantidad y una clave de licencia, entonces la CMDB muestra 3 EC de tipo Activo, ninguno por el cable ni por la unidad de licencia, y no existe ninguna fila `EC-` hasta que alguien los relacione.

**CA-CMD-02** (RF-CMD-010, RN-CMD-006). Dado un activo En stock, cuando el Técnico lo asigna a la Persona `PRS-0042`, entonces la vista del activo muestra "asignado a PRS-0042" sin que exista ninguna relación guardada; al registrar la devolución deja de mostrarse.

**CA-CMD-03** (RF-CMD-011, 020, RN-CMD-014, 015, RNF-CMD-001, 006). Dado el Servicio "Correo corporativo" que depende del dominio `miempresa.com`, con 40 laptops que lo usan, cuando Jefatura abre el impacto del dominio, entonces ve "Se afecta: Correo corporativo", "Podría afectarse: 40 activos" y criticidad máxima Alta, en menos de 3 segundos.

**CA-CMD-04** (RF-CMD-006, 008, RN-CMD-005, 007, 008, 012). Dado un Técnico en "Agregar relación", cuando elige "Línea móvil instalado en Dominio", entonces el servidor rechaza con "Una Línea móvil no puede estar instalada en un Dominio" y no guarda nada; con una combinación válida se guarda y el EC de origen se materializa.

**CA-CMD-05** (RN-CMD-001, 027, RNF-CMD-005). Dado un Técnico de la Empresa B, cuando abre por su identificador interno un EC de la Empresa A, o intenta crear una relación hacia ese EC (escritura con referencia cruzada), entonces recibe "no encontrado", igual que para uno inexistente, y la base rechaza el intento aunque se salte la aplicación.

**CA-CMD-06** (RF-CMD-014, RNF-CMD-004; permiso denegado). Dado un usuario con rol Solo lectura, cuando intenta crear un Servicio, o exportar, por pantalla o directo al servidor, entonces el servidor responde "No tiene permiso para esta acción", no se crea nada y se audita el intento.

**CA-CMD-07** (RF-CMD-009, 017, RN-CMD-004, 009, 011). Dado el Servicio "VPN" del que dependen 2 EC, cuando el Administrador intenta darlo de baja, entonces el sistema lo impide y lista los 2 EC; tras terminar esas relaciones se permite con motivo y las relaciones del Servicio quedan Terminadas.

**CA-CMD-08** (RF-CMD-015, RN-CMD-017, 019). Dado una Línea sin relaciones ni responsable, cuando se abre Calidad de datos, entonces aparece en "Huérfanos"; al asignarle responsable deja de aparecer en la siguiente lectura.

**CA-CMD-09** (RF-CMD-004, 011, RN-CMD-016). Dado un usuario sin `datos_personales.ver`, cuando abre el impacto de un servidor con 12 laptops asignadas, entonces ve "12 personas" o `PRS-NNNN`, sin nombres, tampoco en errores ni en exportaciones.

**CA-CMD-10** (RF-CMD-012, RN-CMD-014, 021). Dado "A depende de B", cuando se crea "B depende de A", entonces se guarda con aviso "dependencia circular", aparece en calidad y el impacto de A termina sin repetir elementos.

**CA-CMD-11** (RF-CMD-005, RN-CMD-026). Dado un activo materializado, cuando el Técnico lo da de baja, entonces en la misma operación su EC queda De baja; si la operación falla, no queda nada a medias; y el reconciliador de la noche no encuentra diferencias.

**CA-CMD-12** (RF-CMD-007, RN-CMD-003). Dado un EC de origen, cuando el Técnico intenta cambiar su serie desde la CMDB, entonces no existe el campo; criticidad y notas sí se pueden completar.

**CA-CMD-13** (RF-CMD-016, RN-CMD-020, RNF-CMD-009). Dado un Servicio revisado el 01/01, cuando el reloj de pruebas se fija en el día 181, entonces aparece "sin revisar"; al marcarlo revisado desaparece.

**CA-CMD-14** (RF-CMD-019). Dado un archivo de 10 Servicios con una fila con nombre repetido, cuando el Administrador lo simula, entonces la vista previa marca la fila y no se carga nada; subir el mismo archivo ya confirmado se rechaza entero.

**CA-CMD-15** (RN-CMD-010, 021). Dado un Servicio que depende de un servidor, cuando el servidor queda De baja, entonces la relación sigue vigente con la marca "relación con elemento de baja" y aparece en calidad.

**CA-CMD-16** (RN-CMD-013). Dado que dos personas crean "VPN" a la vez, cuando ambas guardan, entonces la base rechaza la segunda por nombre repetido.

**CA-CMD-17** (RN-CMD-018, 024). Dado un Servicio cuyo responsable es cesado, cuando se cesa a la Persona, entonces el cese se permite, el Servicio queda "sin dueño", aparece en sus pendientes y no se puede anonimizar hasta reasignarlo.

**CA-CMD-18** (RN-CMD-028, RNF-CMD-007). Dado que el Técnico cambia las notas y el responsable de un Servicio, cuando se consulta la auditoría, entonces ve "notas cambió" sin el texto y el responsable solo como `PRS-NNNN`.

**CA-CMD-19** (RN-CMD-029). Dado un impacto con 150 Personas, cuando Jefatura lo abre con `datos_personales.ver`, entonces queda una entrada de auditoría con el EC y "150 personas", sin nombres.

**CA-CMD-20** (RN-CMD-030). Dado un texto con un bloque de clave privada en las notas, cuando se intenta guardar, entonces se rechaza con un mensaje que no repite el texto.

**CA-CMD-21** (RNF-CMD-008). Dado dos empresas con filas materializadas desfasadas, cuando se dispara dos veces el reconciliador de prueba, entonces cada empresa queda corregida solo en sus filas y la segunda corrida no cambia nada.

## 11. Casos límite

1. Un activo reingresado: su EC, si existe, vuelve a Vigente; nunca se crea otro.
2. Una Persona se anonimiza: relaciones y responsables conservan el identificador y muestran "Persona anonimizada 0042".
3. Importación del Excel con la CMDB activa: no se crea ningún EC; los activos se leen.
4. Cadena de más de 5 niveles: se muestran 5 y el aviso "hay más niveles".
5. Una empresa sin LIC, LIN o DOM activos: esos tipos no aparecen.
6. Cambio de empresa activa: no se arrastra ningún EC (D-046).
7. Una Persona que tiene equipo asignado y es responsable de un Servicio aparece una sola vez en "Personas".
8. Un contrato de licencia vencido sigue como EC mientras el contrato exista; el vencimiento se calcula al leer.
9. Un activo cuya categoría no es "equipo físico" no es EC Activo.
10. Dos relaciones iguales creadas a la vez: la base rechaza la segunda.

## 12. Decisiones propuestas y supuestos

| ID | Tipo | Propuesta | Resultado |
|---|---|---|---|
| S-CMD-01 | [SUPUESTO] | Fase posterior a la Etapa 4, primero de la ola. | Resuelto: Fase 3, ola E (D-056). |
| S-CMD-02 | [SUPUESTO] | Solo los Servicios se crean a mano. | Aceptado con la CMDB delgada (D-058, D-062). |
| S-CMD-03 | [SUPUESTO] | Seis tipos fijos y sin campos personalizados. | Aceptado (D-058). |
| S-CMD-04 | [SUPUESTO] | Cuatro relaciones, lista cerrada. | Aceptado (D-058). |
| S-CMD-05 | [SUPUESTO] | El stock por cantidad no es EC. | Aceptado (D-058). |
| S-CMD-06 | [SUPUESTO] | Revisión de Servicios cada 180 días, configurable. | Aceptado (D-058). |
| S-CMD-07 | [SUPUESTO] | Cesar a un responsable no se bloquea. | Aceptado y reforzado (D-061.7). |
| S-CMD-08 | [SUPUESTO] | Criticidad de 3 niveles, igual a Cambios. | Aceptado (D-058). |
| S-CMD-09 | [SUPUESTO] | Permiso de datos personales con otro nombre. | Resuelto: `datos_personales.ver` (D-036). |
| S-CMD-10 | [SUPUESTO] | Importar Servicios con reglas propias. | Ajustado: marco único (D-050). |
| S-CMD-11 | [SUPUESTO] | Un EC de origen se materializa al relacionarlo o completarle datos propios. | Nuevo; pendiente de visto bueno del Gerente de TI. |
| S-CMD-12 | [SUPUESTO] | Se audita toda consulta de impacto con 100 o más nombres. | Nuevo; pendiente (D-061.6 fija 5.000 para lecturas masivas generales). |
| S-CMD-13 | [SUPUESTO] | El EC de una licencia es el contrato; la unidad no es EC. | Aceptado (D-062, D-045). |

**[ESCALAR AL CEO]:** ninguno. Sin dinero, tema legal nuevo ni acciones irreversibles; la retención de nombres sigue en D-024 y D-033, ya escaladas.

## 13. Fuera de alcance

- Descubrimiento automático de equipos, programas y redes.
- Diagramas gráficos de dependencias.
- Campos personalizados propios de la CMDB y tipos de EC creados por la empresa.
- Relación con proveedores y contratos de servicio; costos.
- Asignación de licencias puesto por puesto como relación guardada (los puestos los lleva LIC).
- Acuerdos de nivel de servicio y tiempos de recuperación.
- Integración con SAP u otras herramientas.
- Copia de todo el inventario a la CMDB (retirada por D-062).

## 14. Historial de cambios

| Cambio | Decisión o hallazgo |
|---|---|
| CMDB delgada: solo Servicios y EC materializados se guardan; el resto se lee (RF-CMD-002 a 005, RN-CMD-025, 026) | D-062.1, H-DAT-15, H-ARQ-12 |
| "Asignado a" derivado, no almacenado (RN-CMD-006, RF-CMD-010) | D-062.1 |
| La unidad de licencia no es EC; el EC es el contrato (RF-CMD-002, 003) | D-062.1, D-045, H-AUD-12 |
| Activo EC solo con naturaleza "equipo físico" | D-045 |
| Retirados RF-CMD-018, RNF-CMD-002, RNF-CMD-003, RN-CMD-022 y el "desfase de sincronización" | D-062.1, plan CMD (3) |
| CA-CMD-11 simplificado a la baja en la misma operación | plan CMD (3) |
| Relaciones con clave compuesta con la empresa; extremos por tipo | D-039.1 y 7, H-DAT |
| Impacto recursivo de hasta 5 niveles con control de ciclos (RN-CMD-014) | D-062.1 |
| Códigos `EC-` de 6 dígitos reservados por bloque | D-049.2, D-062.1 |
| Identificador interno estable del origen (RN-CMD-027, sección 9) | H-DAT-15, D-019 |
| Auditoría sin valores de texto libre ni nombres; autor "sistema" (RN-CMD-028, RNF-CMD-007) | D-030, D-041.4 |
| Auditar lecturas masivas de nombres del impacto (RN-CMD-029) | D-061.6 |
| Permisos del registro con sus PS-nn (PS-190 a 195, PS-20, 21, 22); se eliminan `cmdb.importar`, `cmdb.exportar`, `cmdb.reconciliar`; "retirar" pasa a `cmdb.dar_de_baja`; se adoptan las celdas del registro (Jefatura TI sin crear, editar ni relacionar; Almacén sin ver) | D-036, D-037, H-SEG, registro de permisos |
| Almacén sin `datos_personales.ver`; Solo lectura sin nombres | D-037.7 |
| Columna "Empleado (portal)": no aplica | D-037.11 |
| Importación con el marco y la puerta únicos (RF-CMD-019) | D-050, D-061.1 |
| Estados "De baja" en lugar de "Retirado"; Persona Cesada | D-049.5 |
| Pendientes de la persona (cese no bloquea, anonimizar sí) | D-061.7, D-038.6 |
| Avisos por la tabla única, contenido mínimo y sin nombres de terceros | D-062.3, D-061.4 |
| Procesos con idempotencia, recuperación y "hoy" por empresa; reloj fijable | D-038.4 y 8 |
| Validador común de texto libre (RN-CMD-030) | D-063.2 |
| Columna Cuándo y CA por requisito; criterios citan su requisito; IDs PAN-CMD y S-CMD | plan sección 0 (2), D-049.4, H-AUD-21 |
| Pruebas: dos empresas, escritura con referencia cruzada, por identificador interno, reloj fijable (CA-CMD-05, 13, 21) | D-039.6, D-063.6, QA y Seguridad |
| Fase: Fase 3, ola E, primero de la ola | D-056 |
