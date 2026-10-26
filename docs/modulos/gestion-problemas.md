# Módulo: Gestión de problemas (`gestion-problemas`, sigla PRB)

**Versión:** 0.3 (aplica D-065 a D-076; sobre la v0.2 de la revisión cruzada; escuadrón E)
**Cuándo se construye:** Fase 3, ola E, después de `mesa-de-ayuda`, `cmdb-ligera` y `gestion-cambios`. No entra a la v1 (D-056).
**Se apoya en:** `docs/equipo/decisiones.md` (D-001 a D-064), `docs/equipo/plan-correcciones.md` y el núcleo `docs/documento-funcional.md`.
**Marcas:** [SUPUESTO] = decisión propuesta por el analista; el resultado de cada uno está en la sección 12. [ESCALAR AL CEO] = solo dinero, tema legal o algo irreversible.

---

## 1. Propósito, alcance y fase

**Propósito.** Un **incidente** (caso de la mesa de ayuda) es "algo se rompió, hay que arreglarlo ya". Un **problema** es "¿por qué se sigue rompiendo?". Este módulo agrupa incidentes repetidos, busca la causa raíz, deja una solución temporal a la mano y enlaza el cambio que arregla de fondo.

**Ejemplo.** Siete personas reportaron en dos semanas que su celular Samsung A14 pierde el Wi-Fi cada mañana. Un técnico crea el problema "Celulares A14 pierden Wi-Fi", vincula los 7 incidentes, descubre que el router del piso 2 renueva direcciones cada 8 horas, publica la solución temporal ("apagar y encender el Wi-Fi del celular") y pide un cambio para ajustar el router. Cuando el cambio sale bien, el problema se resuelve y, tras dos semanas sin nuevos reportes, se cierra.

**Entra en este módulo**
1. Registro de problemas con prioridad, responsable y elementos afectados (CMDB).
2. Vínculo con incidentes de la mesa de ayuda (un incidente pertenece a un solo problema).
3. Sugerencia de problemas cuando se repiten incidentes parecidos.
4. Análisis de causa raíz con bitácora y una causa raíz final.
5. Errores conocidos con su solución temporal, visibles en el formulario de la mesa de ayuda.
6. Vínculo con los cambios que dan la solución definitiva.
7. Estados, resolución, periodo de observación y cierre.

**No entra:** atender o cerrar incidentes (es de la mesa de ayuda), ejecutar la solución (es de cambios), costos, métodos de análisis avanzados. Ver sección 13.

**Cuándo.** Fase 3, ola E. Necesita la mesa de ayuda, la CMDB y cambios (ese vínculo se activa cuando exista).

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Incidente** | Caso de tipo Incidente de `mesa-de-ayuda`: algo dejó de funcionar. Le pertenece a ese módulo. |
| **Problema** | Causa común, sin resolver, de uno o más incidentes. Número `PRB-000001`, por empresa (D-049). |
| **Causa raíz** | La razón de fondo. Ej.: "El router del piso 2 renueva direcciones cada 8 horas". |
| **Error conocido** | Problema con causa sabida y sin solución definitiva; se publica con su solución temporal. |
| **Solución temporal** | Pasos para aliviar el efecto mientras no hay arreglo de fondo. |
| **Solución definitiva** | Lo que elimina la causa, normalmente un cambio de `gestion-cambios`. |
| **Categoría de causa** | Hardware, Software, Configuración, Red, Proceso o error humano, Proveedor externo, Desconocida. |
| **Periodo de observación** | Días corridos tras resolver para confirmar que no volvió (14 por defecto). |
| **Prioridad** | Baja, Media o Alta. |
| **Reaparición** | Problema cerrado que vuelve a ocurrir; se registra como uno nuevo enlazado al anterior. |
| **Creador o editor** | Quien creó el problema o editó su solución temporal desde la última publicación. Definición única (D-043.1). |

## 3. Roles y permisos

Nombres y valores según `docs/registro-permisos.md` (D-036); este módulo no cambia celdas del núcleo (D-037). Alcance "todo". **Empleado (portal): no aplica**; ve, a lo sumo, el texto de la solución temporal que muestre el formulario de ayuda cuando ese módulo lo permita.

| Acción | Permiso | PS | Admin. | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|---|
| Ver problemas | `problemas.ver` | PS-180 | Sí | Sí | Sí | No | No | Sí |
| Ver errores conocidos publicados (solo el resumen para usuarios) | `problemas.ver_errores_conocidos` | PS-181 | Sí | Sí | Sí | Sí | Sí | Sí |
| Crear un problema | `problemas.crear` | PS-182 | Sí | Sí | Sí | No | No | No |
| Editar, analizar y asignar responsable | `problemas.editar` | PS-183 | Sí | Sí | Sí | No | No | No |
| Vincular y desvincular incidentes, cambios y elementos | `problemas.vincular` | PS-184 | Sí | Sí | Sí | No | No | No |
| Publicar o desactivar un error conocido | `problemas.publicar_error_conocido` | PS-185 | Sí | Sí | No | No | No | No |
| Resolver | `problemas.resolver` | PS-186 | Sí | No | Sí | No | No | No |
| Cerrar | `problemas.cerrar` | PS-187 | Sí | Sí | No | No | No | No |
| Descartar | `problemas.descartar` | PS-188 | Sí | Sí | No | No | No | No |
| Configurar umbral y periodo de observación | `problemas.configurar` | PS-189 | Sí | No | No | No | No | No |
| Redactar por seguridad un texto (sensible) | `problemas.redactar` | PS-222 | Sí | No | No | No | No | No |
| Exportar a Excel | `datos.exportar` (sensible) | PS-20 | Sí | No | No | No | No | No |

Notas: (1) Todo se comprueba en el servidor. (2) Vincular un incidente exige además poder verlo según la mesa de ayuda. (3) Publicar es un permiso aparte: su texto llega a mucha gente y puede indicar acciones sobre equipos. (4) Como Almacén y Solicitante ven los errores conocidos publicados, ven solo el resumen para usuarios (claro y sin detalles internos, RN-PRB-016); el detalle técnico lo ven solo los roles con `problemas.ver` (RN-PRB-021, D-071.2).

## 4. Requisitos

Columnas: **Cuándo** (Fase 3 = ola E) y **CA** (criterio de la sección 10). Los ID retirados no se reutilizan.

### 4.1 Funcionales

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-PRB-001 | Crear un problema con título, síntoma, prioridad, responsable y, opcionalmente, incidentes y elementos afectados. | Fase 3 | CA-PRB-01 |
| RF-PRB-002 | Crear un problema desde un incidente, con el incidente ya vinculado. | Fase 3 | CA-PRB-01 |
| RF-PRB-003 | Vincular y desvincular incidentes; el problema muestra cuántos hay, cuántos siguen abiertos y la fecha del último. | Fase 3 | CA-PRB-01, CA-PRB-02 |
| RF-PRB-004 | Sugerencia "Posible problema": 3 o más incidentes con la misma categoría de ayuda o el mismo elemento en 30 días, sin problema abierto. Se calcula al leer; no crea nada solo. | Fase 3 | CA-PRB-10 |
| RF-PRB-005 | Prioridad sugerida: Alta si hay un elemento de criticidad Alta o 5 o más incidentes vinculados; si no, Media. La persona puede cambiarla. | Fase 3 | CA-PRB-10 |
| RF-PRB-006 | Bitácora de análisis: autor, fecha y texto; solo se agrega. | Fase 3 | CA-PRB-05 |
| RF-PRB-007 | Registrar la causa raíz (texto) y su categoría. | Fase 3 | CA-PRB-05 |
| RF-PRB-008 | Pasar a Error conocido exige causa raíz, categoría y solución temporal (o la declaración "no hay solución temporal posible"). | Fase 3 | CA-PRB-05 |
| RF-PRB-009 | Publicar el error conocido: su resumen para usuarios se muestra como texto de lectura en el formulario de la mesa de ayuda cuando el caso indica un elemento vinculado o una categoría igual. | Fase 3 | CA-PRB-06 |
| RF-PRB-010 | Vincular cambios como solución definitiva y mostrar su estado. | Fase 3 | CA-PRB-07 |
| RF-PRB-011 | Resolver indicando la solución definitiva aplicada. | Fase 3 | CA-PRB-07, CA-PRB-08 |
| RF-PRB-012 | Cerrar tras el periodo de observación. | Fase 3 | CA-PRB-09 |
| RF-PRB-013 | Descartar con motivo (duplicado, no reproducible, no es un problema). | Fase 3 | CA-PRB-12 |
| RF-PRB-014 | Registrar una reaparición: crea un problema nuevo enlazado al cerrado. | Fase 3 | CA-PRB-11 |
| RF-PRB-015 | Lista de problemas y "Base de errores conocidos" con buscador, filtros y exportación por la puerta única (D-021, D-061.1). | Fase 3 | CA-PRB-04 |
| RF-PRB-016 | La ficha del elemento de la CMDB lista problemas abiertos y errores conocidos vigentes. | Fase 3 | CA-PRB-03 |
| RF-PRB-017 | Comentarios que solo se agregan; se pueden redactar por seguridad. | Fase 3 | CA-PRB-14 |
| RF-PRB-018 | Un incidente nuevo vinculado a un problema Resuelto avisa al responsable. | Fase 3 | CA-PRB-09 |

### 4.2 Reglas de negocio

| ID | Regla | Cuándo | CA |
|---|---|---|---|
| RN-PRB-001 | Un problema solo se vincula con incidentes, cambios y elementos de su empresa; la base lo impone con clave compuesta (D-039). | Fase 3 | CA-PRB-03 |
| RN-PRB-002 | Un incidente pertenece a un solo problema a la vez; para pasarlo a otro se desvincula con motivo. | Fase 3 | CA-PRB-02 |
| RN-PRB-003 | Un problema puede crearse sin incidentes (análisis proactivo) con una nota de origen obligatoria. | Fase 3 | CA-PRB-01 |
| RN-PRB-004 | Pasar a Error conocido exige causa raíz, categoría y solución temporal. | Fase 3 | CA-PRB-05 |
| RN-PRB-005 | Solo un error conocido Vigente se muestra a la mesa de ayuda; al desactivarlo deja de mostrarse. | Fase 3 | CA-PRB-06 |
| RN-PRB-006 | Resolver exige (a) un cambio vinculado Cerrado con resultado Exitoso o Exitoso con observaciones, o (b) un motivo escrito de por qué no hace falta cambio. | Fase 3 | CA-PRB-07, CA-PRB-08 |
| RN-PRB-007 | Resolver un problema no cierra ni modifica los incidentes vinculados. | Fase 3 | CA-PRB-07 |
| RN-PRB-008 | Cerrar exige haber pasado el periodo de observación (14 días corridos desde Resuelto, ajustable) sin incidentes nuevos, o un motivo de cierre anticipado. | Fase 3 | CA-PRB-09 |
| RN-PRB-009 | Publicar una solución temporal exige a una persona que no la redactó ni editó desde la última publicación (acto "Publicar error conocido", RN-017 del núcleo). Con la casilla «problemas» del interruptor único encendida (apagada por defecto, vence a los 90 días) puede publicarla quien la redactó; cada uso queda en el aviso y la auditoría. No existe excepción propia del módulo. | Fase 3 | CA-PRB-06, CA-PRB-13 |
| RN-PRB-010 | Cerrado y Descartado no se reabren; si ocurre otra vez se registra una reaparición. | Fase 3 | CA-PRB-11 |
| RN-PRB-011 | Con incidentes nuevos y el problema Resuelto, el responsable puede devolverlo a En análisis con motivo. | Fase 3 | CA-PRB-09 |
| RN-PRB-012 | Al descartar se desvinculan los incidentes (quedan libres) y se conserva el historial. | Fase 3 | CA-PRB-12 |
| RN-PRB-013 | Un problema no se borra (D-019); un borrador sin incidentes ni análisis lo puede borrar quien lo creó. | Fase 3 | CA-PRB-12 |
| RN-PRB-014 | Todo cambio de estado guarda quién, cuándo y motivo (obligatorio al descartar, cerrar antes de tiempo y desactivar un error conocido). | Fase 3 | CA-PRB-12 |
| RN-PRB-015 | El responsable es una Persona con Usuario vinculado activo y con `problemas.editar`. | Fase 3 | CA-PRB-15 |
| RN-PRB-016 | Los textos pasan por el validador común (rechaza bloques de clave privada y patrones de claves) y advierten no escribir claves ni datos personales; el resumen para usuarios se redacta sin detalles internos porque lo ven más roles (D-063.2, D-071.2). | Fase 3 | CA-PRB-14 |
| RN-PRB-017 | La sugerencia cuenta solo incidentes de la misma empresa, con el umbral configurado (3 en 30 días por defecto), y no cuenta casos restringidos de derechos de datos. | Fase 3 | CA-PRB-10 |
| RN-PRB-018 | Los casos restringidos de derechos de datos no se pueden vincular a un problema (D-061.2). | Fase 3 | CA-PRB-03 |
| RN-PRB-019 | La auditoría guarda "el campo X cambió" para síntoma, causa raíz, solución temporal, análisis y comentarios (texto libre); las Personas solo por `PRS-NNNN`. El texto vive en el historial del módulo (D-030). Los **motivos** de una acción sí se guardan por valor en la auditoría y se declaran texto libre no anonimizable de forma garantizada (D-077, RF-AUD-003). | Fase 3 | CA-PRB-14 |
| RN-PRB-020 | Redactar por seguridad reemplaza el texto por `[REDACTADO]` y registra quién, cuándo y por qué, sin el texto (D-061.5). | Fase 3 | CA-PRB-14 |
| RN-PRB-021 | Cada error conocido tiene dos textos: un **resumen para usuarios** (lo ven todos los roles con `problemas.ver_errores_conocidos` y el formulario de la mesa de ayuda; sin datos internos; pasa por el validador común; lo publica una segunda persona) y un **detalle técnico** (solo roles con `problemas.ver`). La mesa de ayuda recibe únicamente el resumen. Publicar exige ambos textos. | Fase 3 | CA-PRB-17 |

### 4.3 De calidad medible

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RNF-PRB-001 | La lista carga en 2 s o menos con 5.000 problemas por empresa. | Fase 3 | CA-PRB-04 |
| RNF-PRB-002 | El error conocido publicado aparece en el formulario de ayuda en 2 s o menos tras elegir elemento o categoría. | Fase 3 | CA-PRB-06 |
| RNF-PRB-003 | La pantalla de sugerencias responde en 3 s o menos con 5.000 incidentes en 30 días. | Fase 3 | CA-PRB-10 |
| RNF-PRB-004 | Ninguna consulta ni escritura cruza empresas; pruebas por identificador interno y con dos empresas (D-039, D-063.6). | Fase 3 | CA-PRB-03 |
| RNF-PRB-005 | El 100 % de altas, estados, vínculos, publicaciones, redacciones y exportaciones queda en la auditoría (D-018). | Fase 3 | CA-PRB-14 |
| RNF-PRB-006 | La ficha se lee en tablet y celular; estado y prioridad llevan texto (D-021.1). | Fase 3 | CA-PRB-01 |
| RNF-PRB-007 | Una prueba automática intenta vincular cada tipo de dato de otra empresa por la API y todas devuelven "no encontrado". | Fase 3 | CA-PRB-03 |
| RNF-PRB-008 | El proceso diario es idempotente, recuperable y por empresa; se prueba con dos empresas y con el reloj fijable (D-038.4, D-038.8, D-039.6). | Fase 3 | CA-PRB-16 |

## 5. Estados y transiciones

**Estados del problema:** Registrado, En análisis, Error conocido, Resuelto, Cerrado, Descartado.

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Registrado | `problemas.crear` | Título, síntoma, origen (RN-PRB-003) |
| Registrado | En análisis | `problemas.editar` | Responsable asignado |
| Registrado | Descartado | `problemas.descartar` | Motivo |
| En análisis | Error conocido | `problemas.editar` | RN-PRB-004 |
| En análisis | Resuelto | `problemas.resolver` | RN-PRB-006 |
| En análisis | Descartado | `problemas.descartar` | Motivo |
| Error conocido | En análisis | `problemas.editar` | Motivo; el error conocido se desactiva solo |
| Error conocido | Resuelto | `problemas.resolver` | RN-PRB-006; el error conocido se desactiva solo |
| Resuelto | En análisis | `problemas.editar` | RN-PRB-011 |
| Resuelto | Cerrado | `problemas.cerrar` | RN-PRB-008 |
| Cerrado, Descartado | (finales) | Nadie | RN-PRB-010 |

**Publicación del error conocido** (dentro del estado Error conocido): Borrador, Vigente, Desactivado. Borrador a Vigente: `problemas.publicar_error_conocido` (RN-PRB-009). Vigente a Desactivado: ese mismo permiso, con motivo, o solo al salir de Error conocido. Editar una solución Vigente la devuelve a Borrador.

## 6. Datos

**Problema:** empresa; número `PRB-000001` (único por empresa, no se reutiliza); título; síntoma; origen; estado; prioridad; responsable (Persona con Usuario activo); fecha de detección; causa raíz; categoría de causa; solución temporal o marca "no hay solución temporal posible"; estado de publicación; solución definitiva aplicada; motivos de resolución, descarte o cierre anticipado; fechas de cada estado; problema anterior (reaparición); versión; calculados: incidentes vinculados, abiertos y último.
**Entrada de análisis:** empresa, problema, autor, fecha, texto; solo se agrega.
**Vínculo problema-incidente:** empresa, problema, incidente (por identificador interno), quién, cuándo, desvinculado cuándo y por qué. Un vínculo vigente por incidente.
**Vínculo problema-cambio:** empresa, problema, cambio, rol (solución definitiva o temporal), quién, cuándo.
**Vínculo problema-elemento:** empresa, problema, elemento de la CMDB o de su origen, por identificador interno.
**Comentario:** empresa, problema, autor, fecha, texto; solo se agrega.
**Configuración:** umbral (3), ventana (30 días), periodo de observación (14 días corridos).

Unicidad: (empresa, número); un vínculo vigente por incidente; un cambio o elemento no se repite en un problema. Los vínculos se validan contra la misma empresa en la base (clave compuesta).

**Datos personales:** no se guardan nombres; autores y responsables son identificadores. Los textos libres no deben llevar datos personales (declarado en la tabla del núcleo, D-061.3). Aviso en pantalla al escribir.

**Qué se audita:** altas; cambios de campos no textuales; cada estado; publicaciones y desactivaciones; vínculos; descartes; redacciones; exportaciones; usos de la casilla; cambios de configuración. Textos libres: solo "el campo X cambió" (D-030).

**Pendientes de la persona (D-038.6):** problemas no cerrados donde es responsable. El cese no se bloquea; se bloquea anonimizarla mientras queden.

## 7. Pantallas necesarias

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-PRB-01 | Lista de problemas | Buscar, filtrar y exportar. | Técnico |
| PAN-PRB-02 | Ficha del problema | Datos, incidentes, cambios, elementos, análisis, línea de tiempo, comentarios. | Técnico |
| PAN-PRB-03 | Nuevo problema | Alta, con opción de partir de incidentes elegidos. | Técnico |
| PAN-PRB-04 | Sugerencias de problemas | Grupos de incidentes parecidos; Crear problema o Descartar sugerencia. | Jefatura TI |
| PAN-PRB-05 | Análisis | Bitácora, causa raíz y categoría. | Técnico |
| PAN-PRB-06 | Base de errores conocidos | Lista consultable con el resumen para usuarios y, con `problemas.ver`, el detalle técnico. | Técnico |
| PAN-PRB-07 | Resolver o cerrar | Formularios cortos con las condiciones de RN-PRB-006 y RN-PRB-008 (bloque común de decisión). | Técnico / Jefatura TI |
| PAN-PRB-08 | Configuración de problemas | Umbral, ventana y periodo de observación. | Administrador |

## 8. Notificaciones y automatismos

Los avisos usan el motor y la tabla únicos de Notificaciones (D-062.3). Sin nombres de terceros; a una Persona sin Usuario solo llegan tipo, código, fecha y empresa (D-061.4).

| Cuándo | A quién | Qué dice |
|---|---|---|
| Se asigna un problema | Responsable | "Se le asignó PRB-000007. 7 incidentes vinculados. Prioridad Alta." |
| Un problema de prioridad Alta lleva 15 días En análisis sin entradas | Responsable y Jefatura TI | "PRB-000007 no tiene movimiento hace 15 días." |
| Se publica un error conocido | Responsables de los incidentes abiertos vinculados | "Hay solución temporal para PRB-000007." |
| Llega un incidente parecido a un problema Resuelto (RF-PRB-018) | Responsable | "Llegó un incidente parecido a PRB-000007, ya Resuelto. Revise si la solución funcionó." |
| El cambio vinculado se cierra con éxito | Responsable | "CAM-000012 se cerró con éxito. Puede resolver PRB-000007." |
| El cambio vinculado termina Revertido o Fallido | Responsable | "CAM-000012 no funcionó. PRB-000007 sigue abierto." |
| Termina el periodo de observación | Responsable y Jefatura TI | "Pasaron 14 días de PRB-000007 sin incidentes nuevos. Puede cerrarlo." |
| El responsable es cesado | Jefatura TI | "PRB-000007 quedó sin responsable activo." |
| Uso de la casilla «problemas» | Administradores | "Se publicó una solución sin segunda persona (excepción activa)." |

La sugerencia "Posible problema" se muestra en la tarjeta de inicio de Jefatura TI sin correo.

**Proceso automático (D-038.4).** *Diario*: a la hora configurada de la empresa (08:00), "hoy" en su zona; calcula fin de observación y problemas sin movimiento, registra cada aviso en la tabla única (idempotente) y al reiniciar procesa los días pendientes. Los estados no los cambia ningún proceso. El retiro del error conocido y la desvinculación al descartar ocurren en la misma operación.

## 9. Integración con el núcleo y con otros módulos

| Con | Qué se intercambia | Dueño del dato |
|---|---|---|
| Núcleo | Usuarios, roles, permisos, empresa activa, auditoría, contadores, interruptor único de excepciones, servicio de doble control. | Núcleo |
| `mesa-de-ayuda` | El incidente es de la mesa y se referencia por identificador interno (D-039.7). Los vínculos viven aquí; la mesa los muestra en solo lectura. Un incidente, un problema. La mesa agrega el elemento afectado opcional, muestra la sugerencia que calcula este módulo y el resumen para usuarios del error conocido vigente (nunca el detalle técnico). Resolver no cierra incidentes. Los casos restringidos no se vinculan ni cuentan. | Mesa (incidente), Problemas (vínculo, sugerencia, error conocido) |
| `gestion-cambios` | El cambio es la solución definitiva; el vínculo vive aquí y el cambio lo muestra. | Cambios (cambio), Problemas (vínculo) |
| `cmdb-ligera` | Elegir elementos afectados; la ficha del elemento lista problemas abiertos y errores conocidos; la criticidad alimenta la prioridad sugerida. | CMDB (elementos), Problemas (vínculo) |
| `notificaciones` | Entrega de los avisos; eventos `problemas.error_conocido_publicado` y similares en el catálogo único. | Notificaciones |
| `reportes-tableros` | Problemas abiertos por prioridad, incidentes por problema, tiempo hasta la causa raíz, reapariciones, como filtros reutilizables. | Problemas |
| `portal-autoservicio` | Sin acceso a problemas. | n/a |

## 10. Criterios de aceptación

Cada criterio indica el requisito que cubre.

**CA-PRB-01** (RF-PRB-001, RF-PRB-002, RF-PRB-003, RN-PRB-003, RNF-PRB-006). Dado un Técnico con `problemas.crear` y 3 incidentes de la misma categoría, cuando crea un problema desde el primero y vincula los otros dos, entonces el problema muestra 3 incidentes, número `PRB-` correlativo y estado Registrado; sin incidentes exige la nota de origen.

**CA-PRB-02** (RF-PRB-003, RN-PRB-002). Dado un incidente vinculado a PRB-000001, cuando un Técnico intenta vincularlo a PRB-000002, entonces el sistema lo impide con "Este incidente ya pertenece a PRB-000001" y ofrece desvincularlo con motivo.

**CA-PRB-03** (RF-PRB-016, RN-PRB-001, RN-PRB-018, RNF-PRB-004, RNF-PRB-007; aislamiento entre empresas). Dado un Técnico de la Empresa B, cuando abre por identificador interno un problema de la Empresa A, o vincula a su problema un incidente, cambio o elemento de la Empresa A, entonces recibe "no encontrado" y la base rechaza la escritura aunque se salte la aplicación; y un caso restringido de derechos de datos de su propia empresa tampoco se puede vincular.

**CA-PRB-04** (RF-PRB-015, RNF-PRB-001; permiso denegado). Dado un Técnico sin `problemas.cerrar`, cuando intenta cerrar un problema Resuelto por pantalla o directo al servidor, entonces el servidor responde "No tiene permiso para esta acción", no cambia nada y se audita el intento; igual al exportar sin `datos.exportar`.

**CA-PRB-05** (RF-PRB-006, RF-PRB-007, RF-PRB-008, RN-PRB-004). Dado un problema En análisis, cuando el Técnico intenta pasarlo a Error conocido sin solución temporal ni la declaración de que no existe, entonces se impide indicando qué falta.

**CA-PRB-06** (RF-PRB-009, RN-PRB-005, RN-PRB-009, RNF-PRB-002). Dado que un Técnico redactó la solución temporal, cuando intenta publicarla, entonces se rechaza (además no tiene el permiso); cuando Jefatura TI la publica, queda Vigente y aparece en el formulario de ayuda al elegir el elemento afectado, en menos de 2 segundos.

**CA-PRB-07** (RF-PRB-010, RF-PRB-011, RN-PRB-006, RN-PRB-007). Dado un Error conocido con el cambio CAM-000012 Cerrado y Exitoso, cuando el responsable lo resuelve, entonces pasa a Resuelto, el error conocido se desactiva solo y los incidentes no cambian de estado.

**CA-PRB-08** (RF-PRB-011, RN-PRB-006). Dado un problema sin cambio Cerrado exitoso, cuando se intenta resolver sin escribir motivo, entonces el sistema lo impide.

**CA-PRB-09** (RF-PRB-012, RF-PRB-018, RN-PRB-008, RN-PRB-011). Dado un problema Resuelto hace 5 días, cuando se intenta cerrar sin motivo de cierre anticipado, entonces se impide; con el reloj de pruebas en el día 14 sin incidentes nuevos se permite; si llega un incidente nuevo, avisa al responsable y se puede devolver a En análisis.

**CA-PRB-10** (RF-PRB-004, RF-PRB-005, RN-PRB-017, RNF-PRB-003). Dado que 3 incidentes de "Impresoras" ocurren en 30 días sin problema abierto, cuando Jefatura abre las sugerencias, entonces ve "Posible problema" con esos 3 y no se crea nada sin acción humana; un caso restringido no cuenta.

**CA-PRB-11** (RF-PRB-014, RN-PRB-010). Dado un problema Cerrado, cuando se vuelve a presentar, entonces no hay opción de reabrir; "Registrar reaparición" crea uno nuevo enlazado al anterior.

**CA-PRB-12** (RF-PRB-013, RN-PRB-012, RN-PRB-013, RN-PRB-014). Dado un problema con 2 incidentes, cuando Jefatura lo descarta sin motivo, entonces se impide; con motivo los incidentes quedan libres y el historial se conserva.

**CA-PRB-13** (RN-PRB-009). Dado que un Administrador único activó la casilla «problemas», cuando publica una solución que él redactó, entonces se permite con aviso y auditoría; con la casilla apagada o vencida (90 días) se rechaza, incluso llamando al servidor.

**CA-PRB-14** (RF-PRB-017, RN-PRB-016, RN-PRB-019, RN-PRB-020, RNF-PRB-005). Dado un comentario con un dato personal, cuando el Administrador lo redacta por seguridad, entonces queda `[REDACTADO]` y la auditoría dice quién, cuándo y por qué, sin el texto; un texto con un bloque de clave privada se rechaza al guardar; al cambiar la causa raíz la auditoría dice "causa raíz cambió" sin el valor.

**CA-PRB-15** (RN-PRB-015). Dado un responsable cesado, cuando se cesa a la Persona, entonces el cese se permite, el problema aparece en sus pendientes, avisa a Jefatura y no se avanza de estado hasta reasignar; no se puede anonimizar mientras tanto.

**CA-PRB-16** (RNF-PRB-008). Dado dos empresas con problemas Resueltos hace 14 días, cuando se dispara dos veces el proceso diario con el reloj fijado, entonces cada aviso queda en su empresa y la segunda corrida no duplica nada.

**CA-PRB-17** (RN-PRB-021, RF-PRB-009; permiso denegado). Dado un error conocido Vigente con resumen y detalle técnico, cuando un usuario Almacén (sin `problemas.ver`) abre la base de errores conocidos, la mesa de ayuda o pide el detalle directo al servidor, entonces ve solo el resumen y el servidor responde "No tiene permiso para esta acción" al pedir el detalle; un Técnico con `problemas.ver` ve los dos textos. Intentar publicar sin resumen se impide.

## 11. Casos límite

1. Un incidente vinculado se anula en la mesa: el vínculo se conserva con la etiqueta "incidente anulado" y no cuenta.
2. Dos Técnicos vinculan el mismo incidente a problemas distintos a la vez: la base rechaza el segundo vínculo.
3. El cambio vinculado se cancela: avisa al responsable y el problema sigue Error conocido hasta vincular otro.
4. Un elemento vinculado queda De baja: el vínculo se conserva y se muestra como de baja.
5. Empresa sin cambios activo: se resuelve solo con motivo escrito.
6. Un incidente con dos elementos con errores conocidos vigentes: la mesa muestra los dos.
7. La sugerencia descartada no reaparece hasta que llegue un incidente nuevo al grupo.
8. La solución temporal necesita una clave: se escribe "pedir la clave a Jefatura TI", nunca la clave.
9. Cambio de zona horaria de la empresa: se recalculan los avisos pendientes (D-060.9).

## 12. Decisiones propuestas y supuestos

| ID | Tipo | Propuesta | Resultado |
|---|---|---|---|
| S-PRB-01 | [SUPUESTO] | Seis estados; el error conocido es un estado con publicación propia. | Aceptado (D-058). |
| S-PRB-02 | [SUPUESTO] | Un incidente pertenece a un solo problema. | Aceptado; confirmado por la mesa de ayuda. |
| S-PRB-03 | [SUPUESTO] | Resolver no cierra incidentes. | Aceptado; confirmado por la mesa de ayuda. |
| S-PRB-04 | [SUPUESTO] | Umbral de sugerencia 3 incidentes en 30 días. | Aceptado. |
| S-PRB-05 | [SUPUESTO] | Observación de 14 días corridos. | Aceptado (D-062.4). |
| S-PRB-06 | [SUPUESTO] | Dos personas para publicar una solución temporal. | Aceptado como acto de RN-017 del núcleo (D-043); sin excepción propia: casilla «problemas». |
| S-PRB-07 | [SUPUESTO] | Categorías de causa: lista cerrada de 7. | Aceptado. |
| S-PRB-08 | [SUPUESTO] | Cerrado no se reabre (como D-027). | Aceptado. |
| S-PRB-09 | [SUPUESTO] | Sin método formal de análisis; basta la bitácora. | Aceptado. |
| S-PRB-10 | [SUPUESTO] | Posterior a mesa de ayuda, CMDB y cambios. | Resuelto: Fase 3, ola E (D-056). |
| S-PRB-11 | [SUPUESTO] | La sugerencia se calcula al leer y se ve en la tarjeta de inicio. | Nuevo; pendiente de visto bueno. |
| S-PRB-12 | [SUPUESTO] | Los errores conocidos publicados los ven todos los roles con `problemas.ver_errores_conocidos` (incluye Almacén y Solicitante, por el registro). | **Aceptado con condición** (D-071.2): dos textos, resumen para usuarios y detalle técnico solo para `problemas.ver` (RN-PRB-021). |

**[ESCALAR AL CEO]:** ninguno.

## 13. Fuera de alcance

- Atender, clasificar o cerrar incidentes (es de `mesa-de-ayuda`).
- Ejecutar la solución definitiva (es de `gestion-cambios`).
- Métodos de análisis avanzados.
- Costo del problema o de las interrupciones.
- Tiempos objetivo de resolución.
- Publicar errores conocidos a usuarios finales en el portal.
- Adjuntos (D-022); detección automática con inteligencia artificial.

## 14. Historial de cambios

| Cambio | Decisión o hallazgo |
|---|---|
| Sin excepción propia: la casilla «problemas» del interruptor único para publicar (RN-PRB-009) | D-031.6, D-043.2, H-ARQ-10 |
| Validador común de texto libre y operación "redactar por seguridad" (RN-PRB-016, RN-PRB-020; `problemas.redactar`) | D-063.2, D-061.5 |
| `problemas.exportar` pasa a `datos.exportar`; permisos con PS-nn y celdas del registro (PS-180 a PS-189, PS-222, PS-20) | D-036, D-037 fila 1, registro de permisos |
| Resolver sin Jefatura TI y ver errores conocidos para Almacén y Solicitante, según el registro (S-PRB-12) | registro de permisos |
| Supuestos `S-PRB-nn` y pantallas `PAN-PRB-nn`; prefijo `PRB-` con 6 dígitos | D-049.2 y 4, H-AUD-03 |
| Vínculo con la mesa de ayuda por identificador interno; casos restringidos no se vinculan (RN-PRB-018) | D-061.2, D-039.7, acuerdo con AYU |
| Consume la CMDB delgada para elementos | D-062.1 |
| Auditoría sin valores de texto libre ni nombres (RN-PRB-019) | D-030 |
| Sugerencia calculada al leer; proceso diario solo avisa; reloj fijable | D-062.2, D-038.4, D-038.8 |
| Responsable = Persona con Usuario activo; pendiente de la persona (cese no bloquea, anonimizar sí) | D-041, D-061.7, D-038.6, acuerdo con Personas |
| Avisos por la tabla única, hora diaria única, contenido mínimo y sin nombres | D-062.3, D-058.3, D-061.4 |
| Vocabulario: error conocido se "desactiva" en lugar de "retirar"; Persona Cesada | D-049.5 |
| Observación en días corridos | D-062.4 |
| Vínculos con clave compuesta con la empresa (RN-PRB-001) | D-039.1, D-039.7 |
| Columna "Empleado (portal)": no aplica | D-037.11 |
| Columna Cuándo y CA por requisito; criterios citan su requisito; fase Fase 3, ola E | plan sección 0 (2), H-AUD-21, D-056 |
| Pruebas nuevas: dos empresas, escritura cruzada, reloj fijable, casilla vencida (CA-PRB-03, CA-PRB-13, CA-PRB-16) | D-039.6, D-043.6, D-063.6, QA y Seguridad |
| v0.3: S-PRB-12 "Aceptado con condición": dos textos, resumen para usuarios y detalle técnico (RN-PRB-021, CA-PRB-17); nombre de casilla «problemas» como en el mapa de D-066 y RF-OC-026 | D-071.2, D-066, N-AUD-06 (D-075), plan-aplicacion fila E |
| Todas las citas escritas completas: CA-PRB-nn en la columna CA, y RF-, RN- y RNF-PRB-nnn sin abreviar | Auditor Técnico, ronda 3 |
