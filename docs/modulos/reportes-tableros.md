# Módulo: Reportes y tableros (REP)

**Versión:** 0.1 (borrador del escuadrón F, Oleada B) · **Fecha:** 2026-10-25 · **Autor:** analista-funcional
**Base:** `CLAUDE.md`, `docs/equipo/decisiones.md` (D-001 a D-029), documento funcional v0.1.
**Estado:** propuesta. Lo no decidido está marcado **[SUPUESTO]** o **[ESCALAR AL CEO]**.

---

## 1. Propósito, alcance y fase

**Propósito.** Dar a cada rol las cifras que necesita para decidir y vigilar: qué tenemos, en qué estado, qué vence, cuánto cuesta, si la mesa de ayuda cumple sus plazos y si las licencias alcanzan.

**Entra**
1. Tres tableros por rol: Jefatura, Técnico y Almacén (el Administrador ve los que su rol permita).
2. Reportes de inventario, ciclo de vida, garantías y vencimientos, costos, SLA de la mesa de ayuda y cumplimiento de licencias.
3. Filtros comunes y vistas guardadas personales.
4. Exportación a Excel (.xlsx) y CSV con permiso sensible y auditoría de cada exportación.
5. Reportes programados por correo (resumen y enlace, sin adjuntos).
6. Foto mensual de indicadores para ver la evolución en el tiempo.
7. Definición precisa de cada indicador (sección 4.4).

**No entra:** constructor de reportes a medida, tableros que cada usuario diseña, análisis predictivo, reportes contables (ver sección 13).

**Fase.** **[SUPUESTO]** Los listados con filtros y exportación simple ya existen en la v1 (D-021.3: toda lista tiene buscador, filtros y exportación). Este módulo agrega los tableros, el catálogo de indicadores, los reportes programados y la foto mensual. Se entrega en tres partes: **REP-A** (tableros de Almacén y Técnico, reportes de inventario, ciclo de vida, garantías y vencimientos; después de la Etapa 4), **REP-B** (costos, tablero de Jefatura y exportación con auditoría reforzada; después de la Etapa 5 y de PRE), **REP-C** (SLA, cumplimiento de licencias y programación por correo; cuando existan mesa de ayuda, licencias y notificaciones).

---

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Tablero** | Pantalla con tarjetas de cifras clave para un rol. Las tarjetas son fijas. |
| **Indicador** | Una cifra con definición exacta (sección 4.4), por ejemplo "garantías por vencer en 30 días". |
| **Reporte** | Lista o tabla detallada de un tema, con filtros y exportación. |
| **Activo vigente** | Activo con serie cuyo estado es En stock, Asignado o En reparación (D-012). No incluye Extraviado o robado ni De baja. |
| **Periodo** | Rango de fechas del reporte; por defecto, el mes en curso. |
| **Fecha de corte** | Momento al que se refiere la cifra; se muestra en cada tablero ("datos al 2026-10-25 14:05"). |
| **Vista guardada** | Combinación de filtros que un usuario guarda para sí. |
| **Programación** | Orden de enviar un reporte por correo cada cierto tiempo. |
| **Foto mensual** | Cifras de indicadores guardadas el último día de cada mes para ver la tendencia. |
| **SLA** | Plazo comprometido por la mesa de ayuda para responder y resolver. Lo define y mide mesa-de-ayuda. |
| **Exportación** | Descarga de datos a un archivo; es una acción sensible. |
| **Alcance** | "Todo" o "solo lo propio" de un permiso (D-004.3). |

---

## 3. Roles y permisos

Un reporte muestra solo lo que el usuario ya podría ver en el módulo de origen. Los precios exigen `precios.ver`; los datos de personas exigen `personas.ver_datos` (permiso sensible del núcleo). Sin esos permisos, las columnas se **omiten** (no se muestran vacías).

| Acción | Permiso (alcance) | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver tablero de Jefatura | `tablero.jefatura.ver` | Sí | Sí | No | No | No | No |
| Ver tablero de Técnico | `tablero.tecnico.ver` (todo / lo propio) | Sí (todo) | Sí (todo) | Sí (lo propio) | No | No | No |
| Ver tablero de Almacén | `tablero.almacen.ver` | Sí | Sí | No | Sí | No | No |
| Ver reportes de inventario y ciclo de vida | `reportes.inventario.ver` | Sí | Sí | Sí | Sí | No | Sí |
| Ver reporte de garantías y vencimientos | `reportes.vencimientos.ver` | Sí | Sí | Sí | No | No | Sí |
| Ver reportes de costos | `reportes.costos.ver` + `precios.ver` | Sí | Sí | No | No | No | No |
| Ver reporte de SLA | `reportes.sla.ver` (todo / lo propio) | Sí (todo) | Sí (todo) | Sí (lo propio) | No | No | No |
| Ver cumplimiento de licencias | `reportes.licencias.ver` | Sí | Sí | Sí | No | No | No |
| Guardar vistas de filtros | Sin permiso propio: quien puede ver el reporte puede guardar vistas | Sí | Sí | Sí | Sí | No | Sí |
| Exportar a Excel o CSV | `reportes.exportar` (sensible, D-004.4) | Sí | No (activable) | No | No | No | No |
| Crear y editar programaciones | `reportes.programar` | Sí | Sí | No | No | No | No |
| Ver todas las programaciones de la empresa | `reportes.programaciones_ver_todas` | Sí | Sí | No | No | No | No |
| Cambiar umbrales y parámetros de indicadores | `reportes.configurar` | Sí | No | No | No | No | No |
| Ver el registro de exportaciones | `auditoria.ver` (núcleo, D-018.7) | Sí | Sí | No | No | No | No |

Notas
- Los permisos de este cuadro se **suman** a los del módulo de origen: quien puede exportar pero no ver precios, exporta sin precios.
- "Lo propio" del Técnico = sus OS y casos asignados.
- Todo se comprueba en el servidor (regla 6 de `CLAUDE.md`).

---

## 4. Requisitos

### 4.1 Funcionales

| ID | Requisito | Parte |
|---|---|---|
| RF-REP-001 | Tablero de Jefatura: órdenes por aprobar, ejecución del presupuesto, garantías y vencimientos próximos, SLA, cumplimiento de licencias, activos en fin de vida útil. | REP-B |
| RF-REP-002 | Tablero de Técnico: mis OS y casos abiertos, SLA por vencer, activos en reparación, tiempo medio de reparación. | REP-A |
| RF-REP-003 | Tablero de Almacén: recepciones pendientes, stock bajo mínimo, activos En stock sin asignar hace mucho, traslados del mes. | REP-A |
| RF-REP-004 | Cada tarjeta se puede abrir para ver la lista detallada que la compone. | REP-A |
| RF-REP-005 | Reporte de inventario: activos por estado, categoría, ubicación y marca; stock por cantidad por SKU y ubicación. | REP-A |
| RF-REP-006 | Reporte de ciclo de vida: antigüedad por tramos, activos en o cerca del fin de su vida útil, tiempo en reparación, bajas del periodo con motivo. | REP-A |
| RF-REP-007 | Reporte de garantías y vencimientos: un calendario único de garantías, licencias, contratos, líneas, dominios y certificados con ventanas de 30, 60 y 90 días. | REP-A |
| RF-REP-008 | Reporte de costos: ejecutado por centro de costo, rubro, proveedor y mes; compras por proveedor; usa las definiciones de PRE. | REP-B |
| RF-REP-009 | Reporte de SLA: cumplimiento de respuesta y de resolución, tiempo medio de resolución, casos vencidos, por categoría y por técnico. | REP-C |
| RF-REP-010 | Reporte de cumplimiento de licencias por producto con los estados que informa licencias-software: En regla, Déficit, Excedente y Sin verificar. | REP-C |
| RF-REP-011 | Filtros comunes: periodo, ubicación, categoría, estado, centro de costo, proveedor, marca; cada reporte indica cuáles admite. | REP-A |
| RF-REP-012 | Guardar, renombrar y quitar vistas de filtros personales (hasta 20 por usuario). | REP-A |
| RF-REP-013 | Exportar el reporte tal como se ve (con los filtros aplicados) a .xlsx o .csv. | REP-B |
| RF-REP-014 | Cada exportación pide confirmar el motivo de uso (texto corto opcional) y muestra cuántas filas y qué columnas sensibles saldrán. | REP-B |
| RF-REP-015 | Registrar en la auditoría cada exportación (quién, cuándo, reporte, filtros, formato, cantidad de filas, si incluyó precios o datos personales, IP). | REP-B |
| RF-REP-016 | Programar el envío de un reporte por correo: frecuencia diaria, semanal o mensual, hora, destinatarios (usuarios de la empresa). | REP-C |
| RF-REP-017 | El correo programado lleva cifras clave y un enlace al reporte; el enlace exige iniciar sesión. No lleva archivo adjunto. | REP-C |
| RF-REP-018 | Pausar, reanudar y desactivar programaciones; ver el historial de envíos. | REP-C |
| RF-REP-019 | Guardar la foto mensual de los indicadores y mostrar su evolución de los últimos 24 meses. | REP-B |
| RF-REP-020 | Mostrar en cada reporte la fecha de corte y, junto a cada indicador, el texto de su definición. | REP-A |
| RF-REP-021 | Mostrar las cifras con dinero en bloques por moneda, sin total general (D-014, igual que RN-PRE-004). | REP-B |
| RF-REP-022 | Avisar con un mensaje claro cuando un reporte supera el límite de filas y sugerir filtros. | REP-A |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-REP-001 | Todo reporte filtra por la empresa de la sesión. Un identificador de otra empresa responde "no encontrado". |
| RN-REP-002 | Un reporte nunca muestra más de lo que el módulo de origen permitiría ver al mismo usuario. |
| RN-REP-003 | Las columnas de precios se omiten sin `precios.ver`; las de datos personales, sin `personas.ver_datos`. |
| RN-REP-004 | Las claves de licencia nunca aparecen en reportes ni exportaciones, ni siquiera enmascaradas con parte visible (D-011.3). |
| RN-REP-005 | Exportar exige `reportes.exportar` además de poder ver el reporte. Por defecto solo el Administrador lo tiene. |
| RN-REP-006 | Toda celda que empiece con `=`, `+`, `-` o `@` se escribe como texto en .xlsx y .csv (D-020.8). |
| RN-REP-007 | Toda exportación queda en la auditoría aunque falle a mitad; la auditoría guarda los datos de la acción, **no el contenido** del archivo. |
| RN-REP-008 | Si el usuario pierde el permiso o la empresa lo da de baja, deja de poder descargar al instante; lo ya descargado no se puede retirar. |
| RN-REP-009 | Una exportación interactiva tiene un máximo de 50 000 filas; un reporte en pantalla muestra páginas de hasta 100 filas y un máximo de 10 000 filas consultables. **[SUPUESTO]** |
| RN-REP-010 | Un usuario puede hacer hasta 10 exportaciones por hora y la empresa hasta 100 por día. Al pasar el límite se informa cuándo podrá repetir. **[SUPUESTO]** |
| RN-REP-011 | El rango máximo de un periodo es 24 meses por consulta. **[SUPUESTO]** |
| RN-REP-012 | Los destinatarios de una programación deben ser usuarios activos de la misma empresa; no se admiten correos externos en la v1. **[SUPUESTO]** |
| RN-REP-013 | En cada envío programado se vuelve a comprobar el permiso del destinatario; si ya no lo tiene, se omite ese destinatario y se avisa a quien creó la programación. |
| RN-REP-014 | El cuerpo del correo no incluye datos personales ni precios; solo cantidades y estados. Los importes se ven al abrir el enlace con permiso. **[SUPUESTO]** |
| RN-REP-015 | Máximo 20 programaciones activas por empresa y 10 destinatarios por programación. **[SUPUESTO]** |
| RN-REP-016 | Si quien creó una programación deja de ser usuario activo o pierde `reportes.programar`, la programación se pausa y se avisa a los administradores. |
| RN-REP-017 | Una programación mensual con día 29, 30 o 31 se envía el último día del mes cuando el mes es más corto. |
| RN-REP-018 | El reporte muestra datos actuales. La evolución histórica sale solo de la foto mensual; no se reconstruyen fotos de meses anteriores a la activación del módulo. **[SUPUESTO]** |
| RN-REP-019 | La foto mensual se toma el último día del mes a las 23:59 en la zona horaria de la empresa y no se modifica después. |
| RN-REP-020 | Las fechas de garantía y vencimiento son fechas de calendario sin hora (D-021.4); el día de vencimiento cuenta como vigente. |
| RN-REP-021 | Un reporte de costos usa exactamente las definiciones de PRE (ejecutado, comprometido, disponible). REP no las recalcula de otra forma. |
| RN-REP-022 | En SLA, REP cuenta los resultados que guarda mesa-de-ayuda (cumplió respuesta y cumplió resolución: sí, no o no aplica); no recalcula relojes, horarios laborales ni pausas. |
| RN-REP-023 | Una cifra sin dato base (por ejemplo, activo sin fecha de compra) se excluye del promedio y se muestra aparte como "sin dato: N". |
| RN-REP-024 | Los tableros no incluyen datos personales; muestran cantidades, estados y listas con identificadores de activos. |
| RN-REP-025 | Una vista guardada solo la ve quien la creó y solo guarda filtros, nunca datos. |

### 4.3 Calidad medible

| ID | Requisito |
|---|---|
| RNF-REP-001 | Un tablero carga en 3 segundos o menos (percentil 95) con 100 000 activos y 500 000 movimientos en la empresa. |
| RNF-REP-002 | Un reporte con filtros muestra su primera página en 5 segundos o menos con 100 000 activos. |
| RNF-REP-003 | Una exportación de 50 000 filas termina en 60 segundos o menos o se informa avance. |
| RNF-REP-004 | Las cifras de un tablero coinciden con la lista detallada que se abre desde la tarjeta (diferencia cero). |
| RNF-REP-005 | El correo programado sale a más tardar 10 minutos después de la hora fijada. |
| RNF-REP-006 | Los reportes se pueden usar con teclado y con texto además del color, y se ven bien en tablet (D-021.1). |
| RNF-REP-007 | Un reporte pesado no hace más lenta la operación diaria (recepción, asignación): se mide con la prueba de carga de QA. |
| RNF-REP-008 | Cada indicador tiene al menos una prueba automática con datos conocidos y resultado esperado. |

### 4.4 Catálogo de indicadores (definición en palabras)

Cada fila es una regla de negocio. "Hoy" es la fecha actual en la zona horaria de la empresa.

| ID | Indicador | Fórmula en palabras |
|---|---|---|
| RN-REP-030 | Activos vigentes | Cantidad de activos con estado En stock, Asignado o En reparación. |
| RN-REP-031 | Activos por estado | Cantidad de activos en cada uno de los cinco estados de D-012. |
| RN-REP-032 | Stock por SKU | Suma de los saldos de todas las ubicaciones del SKU controlado por cantidad. |
| RN-REP-033 | SKU bajo el mínimo | Cantidad de SKU por cantidad que tienen stock mínimo definido (mayor que cero) y cuyo stock total es menor que ese mínimo. Los que no tienen mínimo no cuentan. **[SUPUESTO]** (campo opcional S-26 del núcleo, solo dato, sin avisos propios) |
| RN-REP-034 | Tasa de asignación | Activos Asignado dividido entre (activos En stock + Asignado), expresado en porcentaje. |
| RN-REP-035 | En stock sin asignar | Activos En stock cuya última salida de stock o fecha de ingreso es de hace más de 90 días (umbral configurable). |
| RN-REP-036 | Pendientes de completar | Activos o SKU con campos obligatorios sin llenar (D-005). |
| RN-REP-037 | Antigüedad promedio | Promedio, en meses, de (hoy menos fecha de compra) de los activos vigentes con fecha de compra. Los sin fecha se cuentan aparte. |
| RN-REP-038 | Tramos de antigüedad | Cantidad de activos vigentes con antigüedad de 0 a 12, más de 12 a 24, más de 24 a 36, más de 36 a 48 y más de 48 meses. |
| RN-REP-039 | En fin de vida útil | Activos vigentes cuya antigüedad es mayor o igual a la vida útil de su categoría (parámetro de PRE). Sin vida útil definida, no cuentan y se muestran como "sin parámetro: N". |
| RN-REP-040 | Cerca del fin de vida útil | Activos vigentes que cumplirán su vida útil en los próximos 6 meses. |
| RN-REP-041 | Tiempo medio en reparación | Promedio de días entre la entrada y la salida del estado En reparación, de las reparaciones terminadas en el periodo. Las que siguen abiertas se muestran como "aún en reparación: N". |
| RN-REP-042 | Bajas del periodo | Cantidad de activos que pasaron a De baja o Extraviado o robado en el periodo, por motivo. |
| RN-REP-043 | Garantías por vencer | Activos vigentes cuya fecha de fin de garantía está entre hoy y hoy + 30, 60 o 90 días (inclusive). |
| RN-REP-044 | Garantías vencidas | Activos vigentes cuya fecha de fin de garantía es anterior a hoy. Los sin garantía registrada se cuentan aparte. |
| RN-REP-045 | Vencimientos próximos | Cantidad de contratos, licencias, líneas, dominios y certificados con vencimiento entre hoy y hoy + 30, 60 o 90 días, por tipo. |
| RN-REP-046 | Vencidos sin renovar | Elementos del punto anterior con fecha de vencimiento anterior a hoy y sin renovación registrada. |
| RN-REP-047 | OC por estado | Cantidad e importe (por moneda) de OC en cada estado de D-013. |
| RN-REP-048 | Tiempo medio de aprobación | Promedio de horas entre el paso a Pendiente de aprobación y la aprobación o el rechazo, de las órdenes resueltas en el periodo. |
| RN-REP-049 | Tiempo medio de entrega | Promedio de días entre el paso a Emitida y la primera recepción confirmada, de las órdenes con recepción en el periodo. |
| RN-REP-050 | Ejecutado, comprometido, disponible, ejecución % | Como se definen en PRE (glosario y reglas de PRE), siempre por moneda. |
| RN-REP-051 | Compras por proveedor | Suma del valor recibido sin impuesto en el periodo por proveedor, por moneda. |
| RN-REP-052 | Casos abiertos | Casos de mesa de ayuda que no están resueltos ni cerrados a la fecha de corte. |
| RN-REP-053 | Cumplimiento SLA de respuesta | Casos con "cumplió respuesta = sí" dividido entre casos con "sí" o "no" cuya meta de respuesta cayó en el periodo. Los "no aplica" y los que aún están dentro de plazo se excluyen. |
| RN-REP-054 | Cumplimiento SLA de resolución | Igual que el anterior, con "cumplió resolución", para casos cuya meta de resolución cayó en el periodo. |
| RN-REP-055 | Tiempo medio de resolución | Promedio de horas (medidas como las mide mesa-de-ayuda) entre creación y resolución, de los casos resueltos en el periodo. |
| RN-REP-056 | Casos vencidos abiertos | Casos abiertos cuya meta de respuesta o de resolución ya pasó. |
| RN-REP-057 | Cumplimiento de licencias | Por producto, el estado que informa licencias-software: En regla, Déficit (faltan puestos), Excedente (sobran puestos) o Sin verificar (sin dato de uso reciente). REP no recalcula; muestra puestos adquiridos vigentes (solo contratos vigentes), asignados y en uso con la fecha del último dato. |
| RN-REP-058 | Licencias en riesgo | Cantidad de productos en estado Déficit o Sin verificar. |

---

## 5. Estados y transiciones

REP no tiene documentos de negocio; solo tiene dos objetos con estado.

**Programación de reporte**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) | Activa | `reportes.programar` | Reporte, frecuencia y al menos un destinatario válido |
| Activa | Pausada | Quien la creó, `reportes.programaciones_ver_todas` o el sistema (RN-REP-016) | Queda el motivo |
| Pausada | Activa | Quien la creó o `reportes.programaciones_ver_todas` | El creador debe seguir activo y con permiso |
| Activa / Pausada | Desactivada | Quien la creó o `reportes.programaciones_ver_todas` | Final. No se borra |

**Envío programado (cada ejecución)**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| Pendiente | Enviado | Sistema | El servicio de correo lo aceptó |
| Pendiente | Reintentando | Sistema | Falla del servicio de correo; hasta 3 reintentos |
| Reintentando | Enviado / Fallido | Sistema | Fallido tras el tercer intento; se avisa al creador |
| Pendiente | Omitido | Sistema | Sin destinatarios con permiso, o programación pausada |

Las exportaciones son una acción inmediata, no un documento con estados; su rastro es la auditoría.

---

## 6. Datos

| Entidad | Campos principales | Clave y unicidad | Se audita |
|---|---|---|---|
| Vista guardada | empresa, usuario, reporte, filtros, nombre | Única por usuario + nombre | No (es preferencia personal) |
| Programación | empresa, reporte, filtros, frecuencia, día, hora, destinatarios, estado, creada por, motivo de pausa | Correlativo por empresa | Altas, cambios con antes/después, pausa, reactivación, desactivación |
| Envío programado | programación, fecha prevista, estado, cantidad de destinatarios, cantidad omitidos, intentos | Único por programación + fecha prevista | No se audita cada envío; se conserva 12 meses **[SUPUESTO]** |
| Foto mensual de indicadores | empresa, mes, indicador, dimensión (por ejemplo categoría), valor, moneda cuando aplique | Única por empresa + mes + indicador + dimensión + moneda | Creación; nunca se edita |
| Parámetros de reportes | días sin asignar (90), ventanas de vencimiento (30/60/90), ventana de fin de vida (6 meses) | Uno por empresa | Cambios con antes/después |
| Registro de exportación | **vive en la auditoría general** (D-018): quién, cuándo, reporte, filtros, formato, filas, columnas sensibles incluidas (sí/no), IP | Entrada de auditoría | Siempre |

Los reportes no guardan copia de los datos: se calculan al consultar (salvo la foto mensual). No se almacenan archivos exportados (D-022).

---

## 7. Pantallas necesarias

| Pantalla | Propósito | Rol principal |
|---|---|---|
| Tablero de Jefatura | Ver lo urgente y la tendencia | Jefatura TI |
| Tablero de Técnico | Ver mi trabajo y plazos | Técnico |
| Tablero de Almacén | Ver lo pendiente de recibir y mover | Almacén |
| Centro de reportes | Lista de reportes disponibles según permisos | Todos con permiso |
| Reporte (pantalla común) | Filtros, tabla, indicadores con su definición, fecha de corte, botones Exportar y Programar | Según el reporte |
| Confirmación de exportación | Cantidad de filas, columnas sensibles, motivo opcional | Administrador |
| Calendario de vencimientos | Garantías, licencias, contratos, líneas, dominios, certificados por fecha | Jefatura TI, Técnico |
| Evolución mensual | Gráfico de la foto mensual de un indicador, con tabla de valores | Jefatura TI |
| Programaciones | Crear, pausar y ver historial de envíos | Jefatura TI |
| Configuración de reportes | Umbrales y parámetros | Administrador |

---

## 8. Notificaciones y automatismos

| Cuándo | A quién | Qué dice |
|---|---|---|
| Hora de una programación | Destinatarios con permiso vigente | "Resumen semanal de garantías: 7 por vencer en 30 días. Ver reporte: (enlace)". |
| Programación pausada por el sistema | Quien la creó y administradores | "Se pausó 'Vencimientos mensuales' porque su creador ya no está activo". |
| Envío fallido tras 3 intentos | Quien creó la programación | "No pudimos enviar 'SLA semanal' el 3 de noviembre". |
| Destinatario sin permiso omitido | Quien creó la programación | "Se omitió a María por falta de permiso". |
| Exportaciones al 80 % del límite diario de la empresa | Administradores | "Se usaron 80 de 100 exportaciones de hoy". |
| Más de 5 exportaciones en una hora por un usuario | Administradores | "Carlos exportó 6 veces en una hora". **[SUPUESTO]** |

Automatismos: foto mensual el último día de cada mes; limpieza del historial de envíos a los 12 meses. Los correos salen por el servicio de notificaciones (escuadrón C: plantilla, 3 reintentos, registro de envíos; sin adjuntos, D-022).

---

## 9. Integración con el núcleo y con otros módulos

- **Núcleo:** empresa, zona horaria, usuarios, roles y permisos (incluidos `precios.ver` y `personas.ver_datos`), auditoría (D-018), inventario, movimientos, estados de activos (D-012), OC y recepciones.
- **Pedido al núcleo:** SKU con **stock mínimo** opcional (aceptado por el analista del núcleo como S-26, [SUPUESTO] pendiente del Gerente de TI, solo dato y sin avisos); fecha de garantía y fecha de compra del activo deben ser campos consultables.
- **presupuesto-costos (PRE):** fuente única de definiciones de costos y de la vida útil por categoría.
- **proveedores-contratos y garantias-mantenimiento (A):** vencimientos de contratos y garantías; las fechas de cobro se derivan de inicio más frecuencia.
- **licencias-software, lineas-moviles, dominios-certificados (B):** vencimientos, y para licencias los puestos adquiridos vigentes, asignados y en uso con su estado de cumplimiento (confirmado por mensaje).
- **mesa-de-ayuda (C):** por caso guarda "cumplió respuesta" y "cumplió resolución" (sí, no, no aplica), fechas meta y reales y pausas; REP solo cuenta (confirmado por mensaje).
- **notificaciones (C):** servicio común de correo para programaciones (plantilla, 3 reintentos, registro; sin adjuntos).
- **integraciones-api (INT):** la API ofrece lectura de los mismos datos con alcances propios; una lectura masiva por API se trata como exportación (ver INT). Los webhooks no sustituyen a los reportes.
- **cmdb-ligera (E):** puede reutilizar los reportes de inventario; no los duplica.

---

## 10. Criterios de aceptación

**CA-REP-01 Cifra coherente.** Dado 12 laptops Asignado, 8 En stock, 3 En reparación y 2 De baja, cuando se abre el tablero de Almacén, entonces "Activos vigentes" muestra 23 y al abrir la tarjeta aparecen exactamente esas 23 filas.

**CA-REP-02 Garantías por vencer.** Dado una laptop con garantía hasta el 2026-11-24 y hoy 2026-10-25, cuando se consulta "Garantías por vencer en 30 días", entonces aparece (30 días); una con garantía hasta 2026-11-25 no aparece en 30 días (31 días) y aparece en 60.

**CA-REP-03 Tasa de asignación.** Dado 12 Asignado y 8 En stock, cuando se muestra la tasa, entonces es 60 %; los 3 En reparación y los De baja no entran en el cálculo.

**CA-REP-04 Aislamiento entre empresas.** Dado dos empresas con activos, cuando un usuario de la empresa A abre cualquier reporte o la tarjeta de un tablero, entonces las cifras incluyen solo la empresa A; con el identificador de una programación de B recibe "no encontrado".

**CA-REP-05 Permiso de exportación denegado.** Dado una Jefatura TI sin `reportes.exportar`, cuando intenta exportar o llama a la acción de descarga directamente, entonces el servidor la rechaza, el botón no se muestra y el intento queda en la auditoría.

**CA-REP-06 Auditoría de exportación.** Dado un Administrador que exporta 1 200 filas de activos con precios, cuando confirma la descarga, entonces la auditoría registra usuario, fecha, reporte, filtros, formato, 1 200 filas, "incluyó precios: sí", IP y no guarda el contenido del archivo.

**CA-REP-07 Columnas sensibles omitidas.** Dado un usuario con `reportes.exportar` y sin `precios.ver`, cuando exporta inventario, entonces el archivo no tiene columnas de precio y la pantalla de confirmación lo indica.

**CA-REP-08 Fórmulas neutralizadas.** Dado un activo cuya observación es `=HYPERLINK("http://x")`, cuando se exporta, entonces la celda se escribe como texto y no se ejecuta al abrir en Excel.

**CA-REP-09 Límite de filas.** Dado un reporte con 80 000 filas, cuando el Administrador pide exportar, entonces se muestra "Máximo 50 000 filas; agregue filtros" y no se genera archivo.

**CA-REP-10 SLA sin recalcular.** Dado 10 casos con meta de resolución en el periodo: 7 "sí", 2 "no", 1 "no aplica", cuando se muestra el cumplimiento de resolución, entonces es 77,8 % (7 de 9).

**CA-REP-11 Programación con permiso cambiado.** Dado una programación semanal con destinatarios Ana y Luis, y Luis pierde el permiso del reporte, cuando llega la hora, entonces el correo sale solo a Ana y quien creó la programación recibe el aviso de omisión.

**CA-REP-12 Costos por moneda.** Dado costos en USD y PEN, cuando se abre el reporte de costos, entonces hay dos bloques y no hay total general.

**CA-REP-13 Licencias.** Dado un producto con 50 puestos adquiridos vigentes y 53 en uso informados el 2026-10-20, cuando se abre el reporte, entonces muestra el estado que informa licencias-software (Déficit) con ambas cifras y esa fecha.

---

## 11. Casos límite

1. Activo sin fecha de compra: se excluye de la antigüedad promedio y aparece en "sin dato".
2. Categoría sin vida útil: sus activos no entran en "fin de vida útil"; se muestran como "sin parámetro".
3. Empresa sin datos: los tableros muestran ceros y un mensaje de ayuda, no errores.
4. Reparación abierta hace 200 días: no entra al promedio del periodo y aparece en "aún en reparación".
5. Garantía que vence hoy: cuenta como vigente y como "por vencer en 30 días".
6. Cambio de zona horaria de la empresa: afecta el "hoy" desde ese momento y no reescribe fotos mensuales.
7. Mes con 28 días y programación mensual el día 31: se envía el 28.
8. Un usuario con dos empresas: los reportes, vistas y programaciones son de la empresa activa; al cambiar de empresa no queda nada en pantalla de la anterior.
9. Exportación abierta en dos pestañas: cada una cuenta como una exportación.
10. Caso de mesa de ayuda reabierto: se vuelve a evaluar según lo informe mesa-de-ayuda; REP no conserva el dato anterior.
11. SKU por cantidad con stock mínimo en cero: se considera sin mínimo.
12. Persona dada de baja y anonimizada (D-024): los reportes históricos muestran "Persona dada de baja 0042".
13. Destinatario de programación dado de baja: se omite y se avisa al creador.
14. Producto de licencia sin dato de uso reciente: aparece como Sin verificar, no como En regla.

---

## 12. Decisiones propuestas y supuestos

| ID | Tipo | Propuesta y motivo |
|---|---|---|
| S-REP-01 | [SUPUESTO] | Tableros fijos por rol (sin constructor). Motivo: más simple de probar y explicar. |
| S-REP-02 | [SUPUESTO] | Límites: 50 000 filas por exportación, 10 000 por consulta en pantalla, 10 exportaciones por usuario por hora, 100 por empresa por día, 24 meses por consulta. Se ajustan con datos reales (pendiente #4). |
| S-REP-03 | [SUPUESTO] | Los correos programados llevan resumen y enlace, sin adjuntos ni precios. Motivo: el correo no es un canal seguro y D-022 aplaza los adjuntos. |
| S-REP-04 | [SUPUESTO] | Destinatarios solo usuarios de la empresa. Motivo: evita sacar datos a terceros. |
| S-REP-05 | [SUPUESTO] | Foto mensual desde la activación del módulo; sin reconstrucción del pasado. |
| S-REP-06 | [SUPUESTO] | Stock mínimo opcional por SKU (campo nuevo en el núcleo, ya aceptado como S-26 por el analista del núcleo). |
| S-REP-07 | [SUPUESTO] | Umbrales: 90 días sin asignar; ventanas de 30, 60 y 90 días; 6 meses de aviso de fin de vida. Configurables. |
| S-REP-08 | [SUPUESTO] | Aviso a administradores ante exportaciones inusuales (más de 5 por hora por usuario). |
| S-REP-09 | [SUPUESTO] | Jefatura TI no exporta por defecto (D-004.4); el administrador puede activarlo. |
| S-REP-10 | [SUPUESTO] | Se omiten las columnas sensibles, no se enmascaran, para que nadie deduzca datos por el formato. |
| S-REP-11 | Aviso | El volumen mensual de correos programados cuenta dentro del servicio de correo ya escalado al CEO (decisiones.md, "Dinero" 1). Si el volumen superara el plan contratado, DevOps lo avisa; no se escala nada nuevo hoy. |

Todo lo anterior lo confirma el Gerente de TI. No hay temas legales nuevos; los datos personales en reportes siguen D-024 y el permiso `personas.ver_datos`.

---

## 13. Fuera de alcance

- Constructor de reportes o tableros personalizados.
- Reportes en lenguaje libre ("pregúntale a la plataforma").
- Alertas automáticas de vencimiento de garantía o licencia (D-023): aquí solo se **ven** en reportes y se pueden recibir en un resumen programado.
- Envío de reportes a correos externos o por mensajería.
- Archivos adjuntos en correos y almacenamiento de archivos exportados (D-022).
- Exportación a PDF de reportes (solo se imprime desde el navegador).
- Reconstrucción histórica de inventario a una fecha pasada.
- Reportes contables, tributarios o de depreciación oficial (ver PRE).
- Análisis entre empresas o comparaciones de varias empresas.
- Conexión con herramientas externas de análisis (se usa la API de INT).
