# Módulo: CMDB ligera (`cmdb-ligera`, sigla CMD)

**Versión:** 0.1 (borrador del analista funcional, Oleada B, escuadrón E)
**Se apoya en:** `docs/equipo/decisiones.md` (D-001 a D-029) y `docs/documento-funcional.md` v0.1.
**Marcas:** [SUPUESTO] = decisión propuesta por el analista, a confirmar por el Gerente de TI. [ESCALAR AL CEO] = solo dinero, tema legal o algo irreversible.

---

## 1. Propósito, alcance y fase

**Propósito.** Responder dos preguntas que hoy se contestan "de memoria": **"si cae X, ¿qué se afecta?"** y **"¿de qué depende X y quién responde por él?"**. La CMDB ligera es un mapa de los elementos de TI de la empresa y de cómo se conectan entre sí. No duplica el inventario: lo **lee** y le agrega lo que el inventario no sabe (servicios, dependencias, criticidad, responsables).

**Ejemplo.** El servicio "Correo corporativo" depende del dominio `miempresa.com` y de la licencia "Microsoft 365 (50 puestos)". Si el dominio vence, la vista de impacto muestra: correo corporativo (criticidad Alta), 50 personas con laptop asignada que usan el correo, y los 3 cambios programados que tocan ese dominio.

**Entra en este módulo**
1. Elementos de configuración (EC) de seis tipos fijos: Activo, Licencia, Línea móvil, Dominio o certificado, Servicio y Persona.
2. Sincronización automática desde el inventario y desde los módulos de licencias, líneas y dominios.
3. Registro manual de Servicios y de relaciones entre elementos.
4. Cuatro relaciones tipificadas: depende de, instalado en, usa, asignado a.
5. Vista de impacto ("si cae X") y vista de dependencias ("de qué depende X").
6. Panel de calidad de datos y detección de elementos huérfanos.
7. Importación de servicios y relaciones desde plantilla Excel (mismas reglas que D-020).

**No entra:** descubrimiento automático de redes o servidores, diagramas gráficos, campos personalizados propios de la CMDB, relaciones con proveedores y contratos, costos. Ver sección 13.

**Fase.** [SUPUESTO] Posterior a la Etapa 4 (necesita el inventario) y fuera de las 7 etapas de la v1. Orden recomendado de la Oleada B: primero CMDB, luego Cambios, luego Problemas (Problemas necesita además la Mesa de ayuda). Motivo: Cambios y Problemas usan la CMDB para calcular impacto.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Elemento de configuración (EC)** | Cualquier cosa de TI que la empresa quiere mapear: una laptop, una licencia, un servicio, un dominio. Cada uno tiene código `EC-00001` (único por empresa, no se reutiliza, D-007). |
| **EC automático** | EC que el sistema crea y mantiene a partir de otro módulo (inventario, licencias, líneas, dominios, personas). Sus datos de origen no se editan aquí. |
| **EC manual** | EC creado por una persona. En la v1 solo los **Servicios**. |
| **Servicio** | Algo que la empresa ofrece o usa y que las personas notan si falla: correo corporativo, VPN, Wi-Fi de la oficina, sistema de ventas. No es una unidad física. |
| **Relación** | Vínculo con dirección entre dos EC: "A depende de B". Tiene fecha desde y hasta. |
| **Depende de** | A deja de funcionar bien si B cae. Ej.: "Correo corporativo depende de Dominio miempresa.com". |
| **Instalado en** | Un software vive dentro de un equipo. Ej.: "Licencia AutoCAD instalado en Laptop LAP-0042". |
| **Usa** | A utiliza B pero puede seguir funcionando sin él (con molestias). Ej.: "Sistema de ventas usa Línea móvil de alertas". |
| **Asignado a** | Un equipo, línea o licencia está en manos de una Persona. Siempre automática desde el inventario. |
| **Criticidad** | Qué tanto duele que el EC falle: Baja, Media o Alta. |
| **Responsable** | Persona (no necesariamente Usuario, D-006) que responde por el EC. En equipos coincide con la persona a quien está asignado. |
| **Vista de impacto** | Lista de lo que se afecta si un EC cae, siguiendo las relaciones hacia atrás hasta 5 niveles. |
| **Huérfano** | EC vigente sin ninguna relación y sin responsable (definición exacta en RN-CMD-017). |
| **Retirado** | EC que ya no existe en la operación. No se borra (D-019). |

## 3. Roles y permisos

Permisos con nombre y alcance. Salvo que se diga otra cosa, el alcance es "todo". Los permisos sensibles (importar, exportar, ver datos personales) están separados (D-004).

| Acción | Permiso | Admin. | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver EC, relaciones, impacto y dependencias | `cmdb.ver` | Sí | Sí | Sí | Sí | No | Sí |
| Ver nombres de personas en asignaciones y responsables | `datos_personales.ver` (núcleo) | Sí | Sí | Sí | No | No | No (activable) |
| Crear un Servicio | `cmdb.crear_servicio` | Sí | Sí | Sí | No | No | No |
| Editar campos propios de la CMDB (criticidad, responsable, descripción, notas, "revisado") | `cmdb.editar` | Sí | Sí | Sí | No | No | No |
| Crear y terminar relaciones manuales | `cmdb.gestionar_relaciones` | Sí | Sí | Sí | No | No | No |
| Retirar un Servicio | `cmdb.retirar` | Sí | Sí | No | No | No | No |
| Ver panel de calidad de datos | `cmdb.ver_calidad` | Sí | Sí | Sí | No | No | No |
| Reconciliar con el inventario (forzar sincronización) | `cmdb.reconciliar` | Sí | No | No | No | No | No |
| Importar servicios y relaciones | `cmdb.importar` | Sí | No | No | No | No | No |
| Exportar a Excel | `cmdb.exportar` | Sí | No | No | No | No | No |

Notas: (1) Todo se comprueba en el servidor. (2) Sin `datos_personales.ver`, la vista de impacto muestra solo el **número** de personas afectadas, no sus nombres. (3) El alcance "solo lo propio" significa "EC de los que soy responsable"; existe para roles personalizados, ningún rol inicial lo usa.

## 4. Requisitos

### 4.1 Funcionales

| ID | Requisito |
|---|---|
| RF-CMD-001 | El sistema maneja seis tipos de EC, lista cerrada: Activo, Licencia, Línea móvil, Dominio o certificado, Servicio, Persona. |
| RF-CMD-002 | Cada unidad física del inventario controlada por serie genera un EC de tipo Activo en el momento en que el activo existe (recepción, importación o alta directa). |
| RF-CMD-003 | Cada licencia, línea móvil y dominio o certificado de sus módulos respectivos genera un EC automático del tipo correspondiente. |
| RF-CMD-004 | Cada Persona del directorio genera un EC de tipo Persona. |
| RF-CMD-005 | Un EC automático refleja los cambios de su origen (nombre, estado, ubicación, persona asignada) sin intervención humana. |
| RF-CMD-006 | Una persona con permiso puede crear un Servicio con: nombre, descripción, criticidad y responsable. |
| RF-CMD-007 | Una persona con permiso puede completar en cualquier EC los campos propios de la CMDB: criticidad, responsable (si no es automático), descripción de uso y notas. |
| RF-CMD-008 | Se pueden crear relaciones manuales depende de, instalado en y usa entre EC, solo en las combinaciones de RN-CMD-005. |
| RF-CMD-009 | Una relación se termina con fecha y motivo; no se borra. |
| RF-CMD-010 | La relación "asignado a" se crea y termina sola cuando el inventario asigna o recibe de vuelta un equipo, línea o licencia. |
| RF-CMD-011 | Vista de impacto: al elegir un EC, el sistema lista lo que se afecta si cae, en tres grupos: "Se afecta" (depende de, instalado en), "Podría afectarse" (usa) y "Personas" (asignado a y responsables). |
| RF-CMD-012 | Vista de dependencias: al elegir un EC, el sistema lista de qué depende, hasta 5 niveles. |
| RF-CMD-013 | La ficha de un EC muestra: datos, relaciones vigentes y terminadas, cambios que lo afectaron, problemas abiertos, historial de modificaciones. |
| RF-CMD-014 | Todas las listas tienen buscador, filtros (tipo, estado, criticidad, responsable, origen) y exportación (D-021). |
| RF-CMD-015 | Panel de calidad de datos con los hallazgos de RN-CMD-017 a RN-CMD-021 y un porcentaje general de EC sin hallazgos. |
| RF-CMD-016 | "Marcar como revisado" registra quién y cuándo confirmó que un EC y sus relaciones siguen vigentes. |
| RF-CMD-017 | Un Servicio se retira con motivo; sus relaciones vigentes se terminan en el mismo acto. |
| RF-CMD-018 | Carga inicial: al habilitar el módulo se crean los EC de todo lo ya existente (sin duplicar si se repite). |
| RF-CMD-019 | Importación de Servicios y relaciones por plantilla Excel: simulacro con error por fila, todo o nada, lote deshacible (D-020). |
| RF-CMD-020 | El módulo ofrece a Cambios y Problemas la operación "calcular impacto de un conjunto de EC" (sección 9). |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-CMD-001 | Todo EC y toda relación llevan empresa. Una relación solo une EC de la misma empresa. |
| RN-CMD-002 | Un EC automático no se crea ni se borra a mano: existe mientras exista su origen. |
| RN-CMD-003 | Los datos que vienen del origen (serie, SKU, estado, ubicación, fechas de vencimiento) se editan solo en su módulo. |
| RN-CMD-004 | Ningún EC se borra. Se retira (Servicio) o queda "Retirado" por su origen (baja del activo, dominio vencido y dado de baja). |
| RN-CMD-005 | Combinaciones válidas de relación (origen → destino): **depende de**: Servicio → Servicio, Activo, Dominio, Línea móvil, Licencia; Activo → Activo; Dominio → Servicio. **Instalado en**: Licencia → Activo; Servicio → Activo. **Usa**: Servicio → Servicio, Dominio, Línea móvil, Licencia; Activo → Servicio. **Asignado a**: Activo, Línea móvil, Licencia → Persona. |
| RN-CMD-006 | "Asignado a" solo la crea el sistema desde el inventario. Nadie la crea ni la edita a mano. |
| RN-CMD-007 | No puede haber dos relaciones vigentes iguales (mismo origen, destino y tipo). |
| RN-CMD-008 | Un EC no se relaciona consigo mismo. |
| RN-CMD-009 | No se crean relaciones nuevas con un EC Retirado. |
| RN-CMD-010 | Al retirarse un EC por su origen, terminan solas sus relaciones "asignado a". Las demás quedan vigentes y se marcan "relación con elemento retirado" para que alguien las corrija (aparece en calidad de datos). |
| RN-CMD-011 | No se puede retirar un Servicio del que dependan otros EC vigentes, hasta terminar o reasignar esas dependencias. |
| RN-CMD-012 | Todo Servicio exige criticidad y responsable activo al crearse. Los EC automáticos nacen con criticidad Baja. |
| RN-CMD-013 | El nombre de un Servicio es único por empresa, sin distinguir mayúsculas ni espacios en los bordes. |
| RN-CMD-014 | La vista de impacto sigue solo relaciones vigentes y EC vigentes, hasta 5 niveles, sin repetir ningún EC y sin quedarse en ciclos. |
| RN-CMD-015 | En el impacto, "depende de" e "instalado en" cuentan como "Se afecta"; "usa" como "Podría afectarse". La criticidad del resultado es la más alta entre los EC afectados. |
| RN-CMD-016 | Los nombres de Personas se muestran solo con `datos_personales.ver`. Una Persona dada de baja se muestra con su referencia anonimizada (D-006, D-024). |
| RN-CMD-017 | **Huérfano:** EC vigente de tipo Servicio, Licencia, Línea móvil o Dominio, sin ninguna relación vigente y sin responsable. Los Activos "En stock" no cuentan como huérfanos. |
| RN-CMD-018 | Hallazgo "sin dueño": Servicio, Dominio o Línea cuyo responsable está sin asignar o es una Persona inactiva. |
| RN-CMD-019 | Hallazgo "crítico sin dependencias": Servicio con criticidad Alta y ninguna relación "depende de" registrada. |
| RN-CMD-020 | Hallazgo "sin revisar": Servicio con última revisión de más de 180 días [SUPUESTO]. |
| RN-CMD-021 | Hallazgos adicionales: relación con elemento retirado, dependencia circular (A depende de B y B de A), y "desfase de sincronización" cuando el origen cambió y la CMDB no lo refleja. |
| RN-CMD-022 | La CMDB nunca impide una operación del inventario. Si la sincronización falla, se reintenta y se muestra el desfase en calidad de datos. |
| RN-CMD-023 | Stock por cantidad (cables, ratones) no genera EC. [SUPUESTO] Un SKU por cantidad solo es EC si es una licencia de su módulo. |
| RN-CMD-024 | Si la Persona responsable de un EC se da de baja, la baja **no se bloquea**; el EC queda con "responsable inactivo" y aparece en calidad de datos. |

### 4.3 De calidad medible

| ID | Requisito |
|---|---|
| RNF-CMD-001 | La vista de impacto responde en 3 segundos o menos con 5.000 EC y 20.000 relaciones por empresa. |
| RNF-CMD-002 | Un cambio en el inventario aparece en la CMDB en 1 minuto o menos en el 99 % de los casos. |
| RNF-CMD-003 | La carga inicial de 100.000 activos se completa en 1 hora o menos sin impedir el uso del sistema. |
| RNF-CMD-004 | Las listas cargan en 2 segundos o menos con paginación de 50 filas. |
| RNF-CMD-005 | Ninguna consulta de la CMDB devuelve datos de otra empresa; cada tabla nueva tiene su prueba de aislamiento (D-025). |
| RNF-CMD-006 | La vista de impacto se entiende sin color: cada grupo y criticidad lleva texto (D-021.1) y funciona en tablet y celular. |
| RNF-CMD-007 | El 100 % de altas, cambios, retiros, relaciones, importaciones, exportaciones y sincronizaciones queda en la auditoría (D-018); las automáticas con el actor "Sistema". |

## 5. Estados y transiciones

**Estados del EC** (lista cerrada): **Vigente**, **En stock** (solo Activos, línea o licencia sin asignar, espejo del inventario), **Retirado**.

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Vigente / En stock | Sistema (automáticos) | Nace con su origen |
| (nuevo) | Vigente | `cmdb.crear_servicio` | Solo Servicios; RN-CMD-012 y RN-CMD-013 |
| Vigente | En stock | Sistema | El inventario deja el equipo sin asignar |
| En stock | Vigente | Sistema | El inventario lo asigna |
| Vigente / En stock | Retirado (automático) | Sistema | Baja o extravío del activo; vencida y dada de baja la licencia o el dominio |
| Vigente | Retirado (Servicio) | `cmdb.retirar` | Motivo obligatorio; RN-CMD-011 |
| Retirado (automático) | Vigente / En stock | Sistema | Solo si el origen hace "reingreso" (D-009, D-012) |
| Retirado (Servicio) | (final) | Nadie | Si el servicio vuelve, se crea otro con su relación al anterior en las notas |

**Estados de la relación:** **Vigente** y **Terminada**. Pasa a Terminada por `cmdb.gestionar_relaciones` (con motivo), por el sistema (asignado a, retiro de Servicio) y nunca vuelve; si se necesita de nuevo se crea otra.

## 6. Datos

**Elemento de configuración (EC)**
| Campo | Detalle |
|---|---|
| Empresa | Obligatorio. |
| Código | `EC-00001`, correlativo por empresa, no se reutiliza (D-007). |
| Tipo | Lista cerrada de 6. |
| Origen | Automático (con referencia al registro de origen) o Manual. |
| Nombre | Texto. En automáticos, lo arma el sistema (ej. "LAP-0042 · Dell Latitude 5440 · serie ABC123"). |
| Estado | Vigente, En stock, Retirado. |
| Criticidad | Baja, Media, Alta. |
| Responsable | Persona. En Activo, Línea y Licencia asignados es la persona asignada y no se edita. |
| Descripción de uso, notas | Texto libre; no admite datos personales sensibles (aviso en pantalla). |
| Última revisión | Fecha y quién. |
| Motivo de retiro | Solo Servicios. |

Unicidad: (empresa, código); (empresa, referencia de origen) para automáticos; (empresa, nombre normalizado) para Servicios.

**Relación:** empresa, EC origen, EC destino, tipo, vigente desde, vigente hasta, creada por (persona o "Sistema"), nota, motivo de término. Unicidad: una vigente por (empresa, origen, destino, tipo). Ambos EC deben ser de la misma empresa (la base de datos lo exige, D-025).

**Hallazgo de calidad:** se calcula, no se guarda, salvo "revisado" (EC, fecha, quién).

**Qué se audita:** altas y retiros de Servicios; cambios de criticidad y responsable (antes y después); creación y término de relaciones; revisiones; importaciones (lote) y exportaciones; reconciliaciones forzadas; sincronizaciones automáticas (actor "Sistema"); consultas de nombres de personas desde la vista de impacto no se auditan en la v1 [SUPUESTO] por ser lectura habitual.

## 7. Pantallas necesarias

| # | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| 1 | Lista de elementos | Buscar y filtrar EC por tipo, estado, criticidad, responsable. | Técnico |
| 2 | Ficha del elemento | Datos, relaciones, cambios, problemas, historial; acciones de editar y relacionar. | Técnico |
| 3 | Vista de impacto | "Si cae X": tres grupos, criticidad máxima, conteo de personas. | Jefatura TI |
| 4 | Vista de dependencias | "De qué depende X" en árbol de hasta 5 niveles. | Técnico |
| 5 | Crear / editar Servicio | Alta rápida de un Servicio con su criticidad, responsable y primeras relaciones. | Técnico |
| 6 | Agregar relación | Elegir tipo, destino (con buscador) y ver aviso si la combinación no es válida. | Técnico |
| 7 | Calidad de datos | Hallazgos por tipo, porcentaje general, botón "marcar revisado". | Jefatura TI |
| 8 | Importar servicios y relaciones | Plantilla, simulacro, confirmación, deshacer lote. | Administrador |
| 9 | Configuración de la CMDB | Días de revisión, profundidad máxima visible (solo lectura 5), activar carga inicial. | Administrador |

La vista de impacto no usa diagrama gráfico en la v1; el diseñador la resuelve con listas y árbol expandible.

## 8. Notificaciones y automatismos

| Cuándo | A quién | Qué dice |
|---|---|---|
| Se crea un Servicio con criticidad Alta | Jefatura TI | "Se registró el servicio 'Correo corporativo' como crítico. Responsable: Ana Pérez. Falta registrar de qué depende." (si no tiene dependencias) |
| Un EC pasa a "responsable inactivo" (RN-CMD-024) | Jefatura TI | "La persona X fue dada de baja y responde por N elementos. Asigne un nuevo responsable." |
| Un activo se retira y deja relaciones vigentes (RN-CMD-010) | Responsables de los EC relacionados y Jefatura TI | "El equipo LAP-0042 fue dado de baja y 'Servidor de archivos' sigue dependiendo de él. Revise la relación." |
| Servicio sin revisar más de 180 días | Responsable del Servicio | "Hace 6 meses que no confirma que 'VPN' sigue vigente. Confirme o actualice." Resumen semanal, no un aviso por elemento. |
| Desfase de sincronización de más de 15 minutos | Administrador | "La CMDB no refleja N cambios del inventario. El sistema sigue reintentando." |

Automatismos (sin aviso): creación y actualización de EC desde el inventario (RF-CMD-002 a 005), creación y término de "asignado a" (RF-CMD-010), cálculo continuo de hallazgos, carga inicial al habilitar el módulo. Los avisos usan el motor de notificaciones del módulo `notificaciones`; aquí solo se define el qué y el cuándo.

## 9. Integración con el núcleo y con otros módulos

| Con | Qué se intercambia | Quién es dueño del dato |
|---|---|---|
| Inventario (Etapa 4) | Cada activo con serie genera un EC; asignación crea "asignado a"; baja y reingreso cambian el estado. | Inventario |
| `personas-ubicaciones` | Personas como EC; responsable y asignado a son Personas; baja de Persona avisa a la CMDB. | Personas |
| `licencias-software` | Licencias como EC; "instalado en" se crea a mano en la v1 (no hay asignación por puesto, D-011). | Licencias |
| `lineas-moviles` | Líneas como EC; "asignado a" automática. | Líneas |
| `dominios-certificados` | Dominios y certificados como EC; el vencimiento no se copia, se consulta. | Dominios |
| `gestion-cambios` | Un cambio se vincula a EC; la CMDB devuelve el impacto de un conjunto de EC (EC afectados directos, indirectos, criticidad máxima, número de personas) y la ficha del EC lista sus cambios. | Cambios (vínculo), CMDB (impacto) |
| `gestion-problemas` | Un problema se vincula a EC; la ficha del EC lista problemas abiertos y errores conocidos vigentes. | Problemas (vínculo) |
| `mesa-de-ayuda` | El incidente puede indicar el EC afectado; la ficha del EC cuenta incidentes de los últimos 90 días. | Mesa de ayuda |
| `proveedores-contratos` | Fuera de la v1: relación "provisto por". | Proveedores |
| `reportes-tableros` | Expone: número de EC por tipo y criticidad, porcentaje de calidad, huérfanos. | CMDB |
| Auditoría, empresa activa, permisos | Mecanismos generales del núcleo (D-018, D-025, D-004). | Núcleo |

## 10. Criterios de aceptación

**CA-CMD-01 · Nace un activo y nace su EC.** Dado que el módulo está habilitado y Almacén confirma una recepción con 3 laptops por serie, cuando termina la confirmación, entonces existen 3 EC de tipo Activo con código `EC-` correlativo, estado En stock y criticidad Baja, y la auditoría registra "Sistema" como actor.

**CA-CMD-02 · Asignar crea "asignado a".** Dado un activo En stock, cuando el Técnico lo asigna a la Persona "Luis Rojas", entonces su EC pasa a Vigente y existe una relación "asignado a" vigente hacia el EC de Luis; al registrar la devolución esa relación queda Terminada con fecha.

**CA-CMD-03 · Impacto con tres grupos.** Dado el Servicio "Correo corporativo" con relación "depende de" hacia el dominio `miempresa.com` y 40 laptops con "usa" hacia el servicio, cuando la Jefatura abre el impacto del dominio, entonces ve "Se afecta: Correo corporativo", "Podría afectarse: 40 activos" y la criticidad máxima Alta.

**CA-CMD-04 · Combinación inválida.** Dado un Técnico en la pantalla Agregar relación, cuando elige "Línea móvil instalado en Dominio", entonces el sistema rechaza con el mensaje "Un Línea móvil no puede estar instalado en un Dominio" y no guarda nada.

**CA-CMD-05 · Aislamiento entre empresas.** Dado un Técnico de la Empresa B, cuando abre la dirección de un EC de la Empresa A, entonces recibe "no encontrado" igual que para un EC inexistente; y al crear una relación hacia un EC de otra empresa, el servidor responde "no encontrado".

**CA-CMD-06 · Permiso denegado.** Dado un usuario con rol Solo lectura, cuando intenta crear un Servicio por la pantalla o llamando al servidor directamente, entonces el servidor lo rechaza con "No tiene permiso para esta acción" y se registra el intento denegado.

**CA-CMD-07 · No retirar con dependientes.** Dado el Servicio "VPN" del que dependen 2 EC vigentes, cuando Jefatura intenta retirarlo, entonces el sistema lo impide y muestra la lista de los 2 EC; tras terminar esas relaciones, el retiro se permite con motivo.

**CA-CMD-08 · Huérfanos.** Dado una Línea móvil vigente, sin relaciones y sin responsable, cuando se abre Calidad de datos, entonces aparece en "Huérfanos"; al asignarle un responsable deja de aparecer.

**CA-CMD-09 · Nombres de personas protegidos.** Dado un usuario sin `datos_personales.ver`, cuando abre el impacto de un servidor con 12 laptops asignadas, entonces ve "12 personas" sin nombres.

**CA-CMD-10 · Ciclo.** Dado "A depende de B", cuando se crea "B depende de A", entonces se guarda con aviso "dependencia circular", aparece en calidad de datos y la vista de impacto de A termina sin repetir elementos.

**CA-CMD-11 · Desfase sin bloqueo.** Dado que la sincronización falla, cuando Almacén registra un activo, entonces el activo se guarda igual, la CMDB lo refleja tras el reintento y el Administrador recibe aviso si pasan 15 minutos.

## 11. Casos límite

1. Un activo con serie dado de baja y luego reingresado: el mismo EC vuelve a Vigente o En stock (nunca se crea otro).
2. Un activo cuyo SKU pasa a inactivo: el EC sigue vigente mientras el activo exista.
3. Importación del Excel de inventario de 100.000 filas con la CMDB habilitada: los EC se crean al confirmar el lote; si el lote se deshace, los EC pasan a Retirado con motivo "lote deshecho" (no se borran).
4. Una Persona se anonimiza (D-024): su EC conserva relaciones y muestra "Persona dada de baja 0042".
5. Dos personas crean el mismo Servicio a la vez: la base de datos rechaza al segundo por nombre repetido.
6. Cadena de más de 5 niveles: el impacto muestra hasta el nivel 5 y un aviso "hay más niveles".
7. Un Servicio que depende de un EC retirado: sigue visible con la etiqueta "relación con elemento retirado".
8. Una empresa sin módulos de licencias, líneas o dominios habilitados: esos tipos simplemente no tienen EC.
9. Cambiar de empresa activa en pantalla: no se arrastra ningún EC de la anterior (D-025).
10. Un equipo "asignado a" una Persona que además es responsable de un Servicio: aparece una sola vez en "Personas" del impacto.

## 12. Decisiones propuestas y supuestos

| # | Tipo | Propuesta | Motivo |
|---|---|---|---|
| 1 | [SUPUESTO] | Fase posterior a la Etapa 4, orden CMDB, Cambios, Problemas. | Cambios y Problemas necesitan el impacto. |
| 2 | [SUPUESTO] | Solo los Servicios se crean a mano; el resto es automático. | Evita duplicar el inventario y que se desactualice. |
| 3 | [SUPUESTO] | Seis tipos fijos, sin campos personalizados propios. | Lo que se puede ampliar después se deja simple hoy (criterio general). |
| 4 | [SUPUESTO] | Cuatro tipos de relación, lista cerrada. | Son los pedidos y cubren el impacto; más tipos confunden. |
| 5 | [SUPUESTO] | Stock por cantidad no es EC. | Un cable no tiene dependencias que mapear. |
| 6 | [SUPUESTO] | Revisión de Servicios cada 180 días, ajustable en configuración. | Equilibrio entre dato vivo y trabajo. |
| 7 | [SUPUESTO] | Dar de baja a una Persona responsable no se bloquea. | Bloquear frena al área de RR. HH.; el hallazgo de calidad basta. Confirmado con `personas-ubicaciones` (bloquean solo activos y líneas, D-006); ese módulo avisa a la CMDB de persona creada, editada, cesada, reactivada y anonimizada. |
| 8 | [SUPUESTO] | Las criticidades son 3 niveles, iguales a los de Cambios. | Un solo lenguaje para el CEO. |
| 9 | [SUPUESTO] | Nombre del permiso de datos personales: `datos_personales.ver`; el núcleo lo confirma. | Alinear con D-004 punto 4. |
| 10 | [SUPUESTO] | Importación de servicios con las reglas de D-020. | Reutiliza algo ya decidido. |

**[ESCALAR AL CEO]:** ninguno. El módulo no mueve dinero ni crea costos nuevos; los nombres de personas ya están cubiertos por D-024, pendiente de legal.

## 13. Fuera de alcance

- Descubrimiento automático de equipos, programas y redes; agentes instalados.
- Diagramas gráficos de dependencias.
- Campos personalizados propios de los EC y tipos de EC creados por la empresa.
- Relación con proveedores y contratos; costos del servicio.
- Asignación de licencias puesto por puesto (D-011).
- Acuerdos de nivel de servicio (SLA) y tiempos de recuperación por servicio.
- Cálculo de probabilidad de falla o disponibilidad histórica.
- Integración con SAP u otras herramientas externas.
