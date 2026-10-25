# Módulo: Gestión de problemas (`gestion-problemas`, sigla PRB)

**Versión:** 0.1 (borrador del analista funcional, Oleada B, escuadrón E)
**Se apoya en:** `docs/equipo/decisiones.md` (D-001 a D-029) y `docs/documento-funcional.md` v0.1.
**Marcas:** [SUPUESTO] = decisión propuesta por el analista, a confirmar por el Gerente de TI. [ESCALAR AL CEO] = solo dinero, tema legal o algo irreversible.

---

## 1. Propósito, alcance y fase

**Propósito.** Un **incidente** es "algo se rompió, hay que arreglarlo ya" (lo atiende la mesa de ayuda). Un **problema** es "¿por qué se sigue rompiendo?". Este módulo sirve para dejar de apagar el mismo fuego cada semana: agrupa incidentes repetidos, busca la causa raíz, deja una solución temporal a la mano mientras tanto y enlaza el cambio que lo arregla de fondo.

**Ejemplo.** Siete personas reportaron en dos semanas que su celular Samsung A14 pierde el Wi-Fi cada mañana. Cada reporte es un incidente cerrado con "reiniciar el Wi-Fi". Un técnico crea el problema "Celulares A14 pierden Wi-Fi", vincula los 7 incidentes, descubre que el router del piso 2 renueva direcciones cada 8 horas, publica la solución temporal ("desactivar y activar Wi-Fi") y pide un cambio para ajustar el router. Cuando el cambio sale bien, el problema se resuelve y, tras dos semanas sin nuevos reportes, se cierra.

**Entra en este módulo**
1. Registro de problemas con prioridad, responsable y elementos afectados (CMDB).
2. Vínculo con incidentes de la mesa de ayuda (un incidente pertenece a un solo problema).
3. Sugerencia automática de problemas cuando se repiten incidentes parecidos.
4. Análisis de causa raíz con bitácora de hallazgos y una causa raíz final.
5. Registro de errores conocidos con su solución temporal, visible para quien atiende incidentes.
6. Vínculo con cambios que dan la solución definitiva.
7. Estados, resolución, periodo de observación y cierre.

**No entra:** tomar decisiones de incidentes (es de `mesa-de-ayuda`), ejecutar la solución (es de `gestion-cambios`), costos, métodos de análisis avanzados. Ver sección 13.

**Fase.** [SUPUESTO] Posterior a `mesa-de-ayuda`, `cmdb-ligera` y `gestion-cambios`. Puede entregarse con vínculos a incidentes aunque Cambios aún no exista (el vínculo con cambios se activa cuando exista).

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Incidente** | Caso reportado a la mesa de ayuda: algo dejó de funcionar. Pertenece a `mesa-de-ayuda`. |
| **Problema** | Causa común, aún sin resolver, de uno o más incidentes. Número `PRB-0001`, correlativo por empresa (D-007). |
| **Causa raíz** | La razón de fondo por la que ocurre. Ej.: "El router del piso 2 renueva direcciones cada 8 horas". |
| **Error conocido** | Problema cuya causa ya se sabe pero que aún no tiene solución definitiva. Se publica con su solución temporal. |
| **Solución temporal** | Pasos para aliviar el efecto mientras no hay arreglo de fondo. Ej.: "Apagar y encender el Wi-Fi del celular". |
| **Solución definitiva** | Lo que elimina la causa, normalmente un cambio de `gestion-cambios`. |
| **Análisis** | Bitácora de lo que se ha probado y descubierto, con fecha y autor. |
| **Categoría de causa** | Hardware, Software, Configuración, Red, Proceso o error humano, Proveedor externo, Desconocida. Lista cerrada [SUPUESTO]. |
| **Periodo de observación** | Días que se espera tras resolver para confirmar que el problema no volvió. |
| **Prioridad** | Baja, Media o Alta. |
| **Reaparición** | Un problema ya cerrado que vuelve a ocurrir; se registra como un problema nuevo enlazado al anterior. |

## 3. Roles y permisos

Alcance por defecto "todo"; "propio" = problemas de los que soy responsable.

| Acción | Permiso | Admin. | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver problemas | `problemas.ver` | Todo | Todo | Todo | No | No | Todo |
| Ver errores conocidos vigentes (solución temporal, en el formulario del incidente) | `problemas.ver_errores_conocidos` | Sí | Sí | Sí | No | No | Sí |
| Crear un problema | `problemas.crear` | Sí | Sí | Sí | No | No | No |
| Editar, analizar y asignar responsable | `problemas.editar` | Todo | Todo | Propio | No | No | No |
| Vincular y desvincular incidentes, cambios y elementos | `problemas.vincular` | Sí | Sí | Sí | No | No | No |
| Publicar o retirar un error conocido | `problemas.publicar_error_conocido` | Sí | Sí | No | No | No | No |
| Resolver | `problemas.resolver` | Sí | Sí | Propio | No | No | No |
| Cerrar | `problemas.cerrar` | Sí | Sí | No | No | No | No |
| Descartar | `problemas.descartar` | Sí | Sí | No | No | No | No |
| Configurar umbral de sugerencias y periodo de observación | `problemas.configurar` | Sí | No | No | No | No | No |
| Exportar a Excel | `problemas.exportar` | Sí | No | No | No | No | No |

Notas: (1) Todo se comprueba en el servidor. (2) Vincular un incidente exige además que la persona pueda ver ese incidente según los permisos de `mesa-de-ayuda`. (3) Publicar un error conocido es un permiso aparte porque su texto se muestra a quien atiende incidentes y puede indicar acciones sobre equipos de usuarios. (4) Este módulo no mueve dinero; no hay separación de funciones obligatoria, salvo que quien publica sea revisado por Jefatura (RN-PRB-009).

## 4. Requisitos

### 4.1 Funcionales

| ID | Requisito |
|---|---|
| RF-PRB-001 | Crear un problema con título, descripción del síntoma, prioridad, responsable y, opcionalmente, incidentes y elementos afectados. |
| RF-PRB-002 | Crear un problema desde un incidente de la mesa de ayuda, con el incidente ya vinculado. |
| RF-PRB-003 | Vincular y desvincular incidentes; el problema muestra el número de incidentes vinculados, cuántos siguen abiertos y la fecha del último. |
| RF-PRB-004 | Sugerencia automática: cuando hay 3 o más incidentes con la misma categoría de ayuda o el mismo elemento afectado en 30 días, y ninguno está vinculado a un problema abierto, el sistema muestra la sugerencia "Posible problema" con esos incidentes. No crea nada solo. |
| RF-PRB-005 | La prioridad sugerida es Alta si hay un elemento de criticidad Alta o 5 o más incidentes vinculados; en otro caso Media; la persona puede cambiarla. |
| RF-PRB-006 | Bitácora de análisis: cada entrada lleva autor, fecha y texto; solo se agrega. |
| RF-PRB-007 | Registrar la causa raíz (texto) y su categoría. |
| RF-PRB-008 | Marcar el problema como Error conocido: exige causa raíz, categoría y solución temporal (o la declaración "no hay solución temporal posible"). |
| RF-PRB-009 | Publicar el error conocido: desde ese momento se muestra como texto de lectura en el formulario de la mesa de ayuda cuando el incidente indica un elemento vinculado o una categoría igual al problema. |
| RF-PRB-010 | Vincular uno o más cambios como solución definitiva; mostrar su estado actual en la ficha del problema. |
| RF-PRB-011 | Resolver el problema indicando la solución definitiva aplicada. |
| RF-PRB-012 | Cerrar el problema tras el periodo de observación. |
| RF-PRB-013 | Descartar el problema con motivo (duplicado, no reproducible, no es un problema). |
| RF-PRB-014 | Registrar una reaparición: crea un problema nuevo con referencia al cerrado. |
| RF-PRB-015 | Lista de problemas y "Base de errores conocidos" con buscador, filtros (estado, prioridad, responsable, elemento, categoría de causa) y exportación (D-021). |
| RF-PRB-016 | La ficha del elemento de la CMDB lista problemas abiertos y errores conocidos vigentes. |
| RF-PRB-017 | Comentarios del equipo, que solo se agregan. |
| RF-PRB-018 | Cada incidente nuevo vinculado a un problema Resuelto lo avisa al responsable (posible falla de la solución). |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-PRB-001 | Un problema pertenece a una empresa y solo se vincula a incidentes, cambios y elementos de esa misma empresa. |
| RN-PRB-002 | Un incidente pertenece a un solo problema a la vez. Para pasarlo a otro se desvincula con motivo y se vincula al nuevo. |
| RN-PRB-003 | Un problema se puede crear sin incidentes (análisis proactivo), pero con una nota "origen" obligatoria. |
| RN-PRB-004 | Pasar a Error conocido exige causa raíz, categoría y solución temporal (RF-PRB-008). |
| RN-PRB-005 | Solo un error conocido con estado Vigente se muestra a la mesa de ayuda. Retirarlo la deja de mostrar. |
| RN-PRB-006 | Resolver exige al menos uno de: (a) un cambio vinculado Cerrado con resultado Exitoso o Exitoso con observaciones; (b) un motivo escrito de por qué no se necesita cambio (ej. "se reemplazó el equipo defectuoso"). |
| RN-PRB-007 | Resolver un problema **no cierra** ni modifica los incidentes vinculados; cada incidente sigue su flujo en la mesa de ayuda. |
| RN-PRB-008 | Cerrar exige haber pasado el periodo de observación (por defecto 14 días desde Resuelto) sin nuevos incidentes vinculados, o motivo escrito de cierre anticipado. [SUPUESTO] |
| RN-PRB-009 | La solución temporal de un error conocido la redacta quien analiza, y debe publicarla alguien con `problemas.publicar_error_conocido` distinto de quien la redactó. [SUPUESTO] |
| RN-PRB-010 | Un problema Cerrado o Descartado no se reabre. Si ocurre otra vez, se registra como reaparición (RF-PRB-014). |
| RN-PRB-011 | Si llegan incidentes nuevos con el problema en Resuelto, el responsable puede devolverlo a En análisis con motivo. |
| RN-PRB-012 | Descartar exige motivo. Al descartar se desvinculan los incidentes automáticamente (quedan libres para otro problema) y se conserva el historial. |
| RN-PRB-013 | Un problema no se borra (D-019). Un borrador sin incidentes ni análisis puede borrarlo su creador. |
| RN-PRB-014 | Todo cambio de estado guarda quién, cuándo y motivo (obligatorio en descartar, cierre anticipado y retiro de error conocido). |
| RN-PRB-015 | El responsable es un Usuario activo con `problemas.editar`. |
| RN-PRB-016 | La solución temporal y la causa raíz no deben contener contraseñas, claves de licencia ni datos personales; la pantalla lo advierte (D-011, D-018.5). |
| RN-PRB-017 | La sugerencia automática solo cuenta incidentes de la misma empresa y respeta el umbral de configuración (por defecto 3 incidentes en 30 días). |

### 4.3 De calidad medible

| ID | Requisito |
|---|---|
| RNF-PRB-001 | La lista de problemas carga en 2 segundos o menos con 5.000 problemas por empresa. |
| RNF-PRB-002 | El error conocido publicado aparece en el formulario del incidente en 2 segundos o menos desde que se elige el elemento o la categoría. |
| RNF-PRB-003 | La sugerencia de "posible problema" se actualiza en 5 minutos o menos desde el incidente que completa el umbral. |
| RNF-PRB-004 | Ninguna consulta devuelve problemas, análisis o vínculos de otra empresa; prueba de aislamiento por tabla (D-025). |
| RNF-PRB-005 | El 100 % de altas, cambios de estado, vínculos, publicaciones y exportaciones queda en la auditoría (D-018). |
| RNF-PRB-006 | La ficha del problema es legible en tablet y celular; el estado y la prioridad llevan texto (D-021.1). |
| RNF-PRB-007 | Una prueba automática intenta vincular cada tipo de dato de otra empresa por la API y todas devuelven "no encontrado". |

## 5. Estados y transiciones

**Estados del problema:** Registrado, En análisis, Error conocido, Resuelto, Cerrado, Descartado.

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Registrado | `problemas.crear` | Título, síntoma, origen (RN-PRB-003) |
| Registrado | En análisis | `problemas.editar` | Responsable asignado |
| Registrado | Descartado | `problemas.descartar` | Motivo |
| En análisis | Error conocido | `problemas.editar` | RN-PRB-004 |
| En análisis | Resuelto | `problemas.resolver` | RN-PRB-006 (cuando la causa se corrigió sin pasar por error conocido) |
| En análisis | Descartado | `problemas.descartar` | Motivo |
| Error conocido | En análisis | `problemas.editar` | Motivo (la causa resultó ser otra); el error conocido se retira solo |
| Error conocido | Resuelto | `problemas.resolver` | RN-PRB-006; el error conocido se retira solo |
| Resuelto | En análisis | `problemas.editar` | RN-PRB-011 |
| Resuelto | Cerrado | `problemas.cerrar` | RN-PRB-008 |
| Cerrado y Descartado | (finales) | Nadie | RN-PRB-010 |

**Error conocido publicado** (marca dentro del estado Error conocido): Borrador de solución, Vigente, Retirado. Borrador a Vigente: `problemas.publicar_error_conocido` (RN-PRB-009). Vigente a Retirado: `problemas.publicar_error_conocido`, con motivo; ocurre sola al salir de Error conocido.

## 6. Datos

**Problema:** empresa; número `PRB-0001` (único por empresa, no se reutiliza); título; síntoma; origen; estado; prioridad; responsable (Usuario); fecha de detección; causa raíz; categoría de causa; solución temporal (texto) o marca "no hay solución temporal posible"; estado de publicación del error conocido; solución definitiva aplicada; motivo de resolución, de descarte o de cierre anticipado; fechas de cada estado; problema anterior (si es reaparición); calculados: incidentes vinculados, abiertos, último incidente.

**Entrada de análisis:** empresa, problema, autor, fecha, texto. Solo se agrega.

**Vínculo problema-incidente:** empresa, problema, incidente, quién vinculó, cuándo, desvinculado cuándo y por qué. Un incidente tiene un solo vínculo vigente.

**Vínculo problema-cambio:** empresa, problema, cambio, rol (solución definitiva o solución temporal), quién vinculó, cuándo.

**Vínculo problema-elemento:** empresa, problema, EC de la CMDB.

**Comentario:** empresa, problema, autor, fecha, texto. Solo se agrega.

**Configuración:** umbral de sugerencia (3 incidentes), ventana (30 días), periodo de observación (14 días).

Claves y unicidad: (empresa, número); un vínculo vigente por incidente; no se repite el mismo cambio o EC en un problema. Todo vínculo se valida contra la misma empresa en la base de datos.

**Qué se audita:** altas; cambios con antes y después en prioridad, responsable, causa raíz y solución temporal; cada cambio de estado; publicaciones y retiros; vínculos; descartes; exportaciones; cambios de configuración.

## 7. Pantallas necesarias

| # | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| 1 | Lista de problemas | Buscar, filtrar y exportar. | Técnico |
| 2 | Ficha del problema | Datos, incidentes, cambios, elementos, análisis, línea de tiempo, comentarios. | Técnico |
| 3 | Nuevo problema | Alta, con opción de partir de incidentes elegidos. | Técnico |
| 4 | Sugerencias de problemas | "Posible problema": grupos de incidentes parecidos con botón Crear problema o Descartar sugerencia. | Jefatura TI |
| 5 | Análisis | Bitácora y campos de causa raíz. | Técnico |
| 6 | Base de errores conocidos | Lista consultable con solución temporal. | Técnico |
| 7 | Resolver / cerrar | Formularios cortos con las condiciones de RN-PRB-006 y 008. | Jefatura TI |
| 8 | Configuración de problemas | Umbral, ventana y periodo de observación. | Administrador |

## 8. Notificaciones y automatismos

| Cuándo | A quién | Qué dice |
|---|---|---|
| Se asigna un problema | Responsable | "Se le asignó PRB-0007 'Celulares A14 pierden Wi-Fi'. 7 incidentes vinculados. Prioridad Alta." |
| Aparece una sugerencia de posible problema | Usuarios con `problemas.crear` (aviso en la pantalla de inicio, sin correo) | "Posible problema: 4 incidentes de 'Wi-Fi' en las últimas 2 semanas." |
| Un problema Alta lleva 15 días En análisis sin entradas nuevas | Responsable y Jefatura TI | "PRB-0007 no tiene movimiento hace 15 días." |
| Se publica un error conocido | Responsables de los incidentes abiertos vinculados | "Hay solución temporal para PRB-0007. Puede aplicarla al caso." |
| Llega un incidente nuevo vinculable a un problema en Resuelto (RF-PRB-018) | Responsable del problema | "Llegó un incidente parecido a PRB-0007 que está Resuelto. Revise si la solución funcionó." |
| El cambio vinculado se cierra con éxito | Responsable | "El cambio CAM-0012 se cerró con éxito. Puede resolver PRB-0007." |
| El cambio vinculado termina Revertido o Fallido | Responsable | "El cambio CAM-0012 no funcionó. PRB-0007 sigue abierto." |
| Termina el periodo de observación | Responsable y Jefatura TI | "Pasaron 14 días de PRB-0007 sin nuevos incidentes. Puede cerrarlo." |
| Problema asignado a un responsable dado de baja | Jefatura TI | "PRB-0007 quedó sin responsable activo." |

Automatismos: el conteo de incidentes, la sugerencia de prioridad, la sugerencia de problemas, el retiro automático del error conocido al salir de ese estado, la desvinculación al descartar y el aviso del fin del periodo de observación. Los avisos usan el motor del módulo `notificaciones`.

## 9. Integración con el núcleo y con otros módulos

| Con | Qué se intercambia | Dueño del dato |
|---|---|---|
| Núcleo | Usuarios, roles, permisos, empresa activa, auditoría, contadores por empresa. | Núcleo |
| `mesa-de-ayuda` | El incidente es de la mesa. Los vínculos incidente-problema viven aquí; la mesa los muestra en solo lectura. Un incidente pertenece a un solo problema. La mesa agrega un elemento afectado opcional en el incidente, muestra la sugerencia de "posible problema" que calcula este módulo y muestra como texto de lectura la solución temporal del error conocido vigente. Resolver un problema no cierra incidentes. | Mesa (incidente), Problemas (vínculo, sugerencia, error conocido) |
| `gestion-cambios` | El cambio es la solución definitiva. El vínculo vive aquí y el cambio lo muestra. | Cambios (cambio), Problemas (vínculo) |
| `cmdb-ligera` | Elegir elementos afectados; la ficha del elemento lista problemas abiertos y errores conocidos. La criticidad del elemento alimenta la prioridad sugerida. | CMDB (elementos), Problemas (vínculo) |
| `notificaciones` | Entrega de los avisos de la sección 8. | Notificaciones |
| `reportes-tableros` | Expone: problemas abiertos por prioridad, incidentes por problema, tiempo hasta causa raíz, reapariciones. | Problemas |
| `portal-autoservicio` | Los usuarios finales no ven problemas; si el portal muestra avisos, usa solo el texto de la solución temporal que Jefatura marque como "público" (fuera de la v1). | n/a |

## 10. Criterios de aceptación

**CA-PRB-01 · Crear desde incidentes.** Dado un Técnico con `problemas.crear` y 3 incidentes de la misma categoría, cuando crea un problema desde el primero y vincula los otros dos, entonces el problema muestra 3 incidentes vinculados, número `PRB-` correlativo y estado Registrado.

**CA-PRB-02 · Un incidente, un problema.** Dado un incidente ya vinculado a PRB-0001, cuando un Técnico intenta vincularlo a PRB-0002, entonces el sistema lo impide con "Este incidente ya pertenece a PRB-0001" y ofrece desvincularlo con motivo.

**CA-PRB-03 · Aislamiento entre empresas.** Dado un Técnico de la Empresa B, cuando abre la dirección de un problema de la Empresa A, o intenta vincular a su problema un incidente de la Empresa A, entonces recibe "no encontrado" igual que para algo inexistente.

**CA-PRB-04 · Permiso denegado.** Dado un Técnico sin `problemas.cerrar`, cuando intenta cerrar un problema Resuelto por pantalla o directamente contra el servidor, entonces el servidor lo rechaza con "No tiene permiso para esta acción" y la auditoría registra el intento.

**CA-PRB-05 · Error conocido completo.** Dado un problema En análisis, cuando el Técnico intenta pasarlo a Error conocido sin solución temporal ni la declaración de que no existe, entonces el sistema lo impide indicando qué falta.

**CA-PRB-06 · Publicación por otra persona.** Dado que Marta redactó la solución temporal, cuando Marta intenta publicarla, entonces el sistema lo rechaza; cuando Carlos (Jefatura TI) la publica, entonces queda Vigente y se muestra en el formulario de la mesa de ayuda al elegir el elemento afectado.

**CA-PRB-07 · Resolver con cambio.** Dado un problema Error conocido con el cambio CAM-0012 vinculado en estado Cerrado y resultado Exitoso, cuando el responsable lo resuelve, entonces pasa a Resuelto, el error conocido se retira solo, y los incidentes vinculados no cambian de estado.

**CA-PRB-08 · Resolver sin cambio ni motivo.** Dado un problema sin cambio Cerrado exitoso, cuando se intenta resolver sin escribir motivo, entonces el sistema lo impide.

**CA-PRB-09 · Cierre con observación.** Dado un problema Resuelto hace 5 días, cuando Jefatura intenta cerrarlo sin motivo de cierre anticipado, entonces el sistema lo impide; a los 14 días sin incidentes nuevos permite cerrarlo.

**CA-PRB-10 · Sugerencia.** Dado que 3 incidentes de "Impresoras" ocurren en 30 días y ninguno está vinculado a un problema abierto, cuando se actualiza la sugerencia, entonces Jefatura ve "Posible problema" con esos 3 incidentes y no se crea ningún problema sin acción humana.

**CA-PRB-11 · Reaparición.** Dado un problema Cerrado, cuando se vuelve a presentar, entonces no hay opción de reabrirlo; "Registrar reaparición" crea un problema nuevo enlazado al anterior.

**CA-PRB-12 · Descartar libera incidentes.** Dado un problema con 2 incidentes, cuando Jefatura lo descarta con motivo, entonces los incidentes quedan libres y el historial del problema se conserva.

## 11. Casos límite

1. Un incidente vinculado se elimina o anula en la mesa de ayuda: el vínculo se conserva con la etiqueta "incidente anulado"; no cuenta en los conteos.
2. Dos Técnicos vinculan el mismo incidente a problemas distintos a la vez: la base de datos rechaza el segundo vínculo.
3. El cambio vinculado se cancela: el problema avisa al responsable y sigue Error conocido; se vincula otro cambio.
4. El responsable es dado de baja: el problema queda sin responsable activo, avisa a Jefatura y no se puede avanzar de estado hasta reasignar.
5. Un elemento vinculado pasa a Retirado: el vínculo se conserva y el elemento aparece como retirado.
6. Empresa sin módulo de cambios habilitado: se puede resolver solo con motivo escrito (RN-PRB-006 b).
7. Un incidente que afecta dos elementos distintos con errores conocidos vigentes: la mesa muestra los dos.
8. La sugerencia vuelve a aparecer tras descartarla: no, hasta que llegue un incidente nuevo al grupo.
9. Problema creado sin incidentes y sin origen: el sistema pide el origen.
10. La solución temporal necesita una clave: se escribe "solicitar clave a Jefatura TI", nunca la clave (RN-PRB-016).

## 12. Decisiones propuestas y supuestos

| # | Tipo | Propuesta | Motivo |
|---|---|---|---|
| 1 | [SUPUESTO] | Seis estados; el error conocido es un estado con su propia publicación. | Es el concepto que pidió el CEO y es lo que más se usa a diario. |
| 2 | [SUPUESTO] | Un incidente pertenece a un solo problema (confirmado con `mesa-de-ayuda`). | Conteos claros. |
| 3 | [SUPUESTO] | Resolver el problema no cierra incidentes (confirmado con `mesa-de-ayuda`). | Cada caso tiene su dueño y su flujo. |
| 4 | [SUPUESTO] | Umbral de sugerencia: 3 incidentes en 30 días, ajustable. | Valor de partida sin datos reales. |
| 5 | [SUPUESTO] | Periodo de observación de 14 días, ajustable. | Equilibrio entre rapidez y seguridad de que se arregló. |
| 6 | [SUPUESTO] | Dos personas para publicar una solución temporal (redactor y publicador). | La solución llega a muchos técnicos y puede afectar equipos. |
| 7 | [SUPUESTO] | Categorías de causa: lista cerrada de 7. | Reportes confiables; ampliable luego. |
| 8 | [SUPUESTO] | Un problema Cerrado no se reabre. | Mismo criterio que órdenes de servicio (D-027). |
| 9 | [SUPUESTO] | Sin método formal de análisis (como "5 porqués" estructurado); basta la bitácora. | Ligero; se puede ampliar. |
| 10 | [SUPUESTO] | Fase posterior a mesa de ayuda, CMDB y cambios. | Dependencias. |

**[ESCALAR AL CEO]:** ninguno. No mueve dinero, no guarda datos personales nuevos y no es irreversible.

## 13. Fuera de alcance

- Atender, clasificar o cerrar incidentes (es de `mesa-de-ayuda`).
- Ejecutar la solución definitiva (es de `gestion-cambios`).
- Métodos de análisis avanzados (diagramas de causa y efecto, análisis estadístico).
- Costo del problema o de las interrupciones.
- Acuerdos de nivel de servicio y tiempos objetivo de resolución.
- Publicar errores conocidos a usuarios finales en el portal.
- Archivos adjuntos (D-022).
- Detección automática de patrones por inteligencia artificial.
