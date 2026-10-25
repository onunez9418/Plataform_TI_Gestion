# Módulo: Reportes y tableros (REP)

**Versión:** 0.2 (corrección de la Oleada D, escuadrón F) · **Fecha:** 25/10/2026 · **Autor:** analista-funcional
**Base:** `CLAUDE.md`, `docs/equipo/decisiones.md` (D-001 a D-064), `docs/equipo/plan-correcciones.md`, `docs/registro-permisos.md`, documento funcional v0.2.
**Estado:** propuesta. **[SUPUESTO]** = lo confirma el Gerente de TI. **[ESCALAR AL CEO]** = dinero, legal o irreversible.
**Leyenda de "Cuándo":** **A** = REP-A, **B** = REP-B, **C** = REP-C (todas Fase 3, ola F; REP-A puede adelantarse si el Gerente de TI lo decide).

---

## 1. Propósito, alcance y fase

**Propósito.** Dar a cada rol las cifras que necesita: qué tenemos, en qué estado, qué vence, cuánto cuesta, si la mesa de ayuda cumple sus plazos y si las licencias alcanzan.

**Entra**
1. Tres tableros por rol (Jefatura, Técnico, Almacén) como tarjetas del Inicio y pantallas de detalle.
2. Reportes de inventario, ciclo de vida, garantías y vencimientos, costos, SLA de la mesa de ayuda y cumplimiento de licencias.
3. Filtros comunes y vistas guardadas personales.
4. Exportación de cada reporte **por la puerta única del núcleo** (REP no exporta por su cuenta).
5. Reportes programados por correo (resumen y enlace, sin adjuntos).
6. Foto mensual de indicadores y catálogo de indicadores definidos una sola vez.

**No entra:** constructor de reportes, tableros a medida, análisis predictivo, reportes contables (sección 13).

**Fase (D-056).** **REP-A** (Almacén y Técnico, inventario, ciclo de vida, vencimientos): Fase 3, ola F, solo pide el núcleo. **REP-B** (costos, tablero de Jefatura): después de PRE. **REP-C** (SLA y licencias, programación por correo): después de AYU, LIC y NOT-completo.
**Ya existe en la v1:** toda lista tiene buscador, filtros y exportación (D-021.3) y el Inicio por tarjetas (RNF-008). **REP-A no construye una segunda pantalla de inicio**: aporta tarjetas y pantallas de detalle al Inicio existente. La prueba de carga corre en integración nocturna desde la Etapa 4. Nada de REP se construye antes de aprobar la Etapa 7, salvo decisión del Gerente de TI.

---

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Tablero** | Conjunto fijo de tarjetas de cifras para un rol. |
| **Indicador** | Cifra con definición exacta (sección 4.4). Se define **una sola vez** como un filtro reutilizable que produce la cifra y la lista. |
| **Agregado precalculado** | Cifra que el trabajador en segundo plano guarda con su fecha de corte. |
| **Activo vigente** | Activo con serie, de naturaleza "equipo físico", en estado En stock, Asignado o En reparación (D-012, D-045). |
| **Fecha de corte** | Momento al que se refiere una cifra ("Datos al 25/10/2026 14:05"). |
| **Vista guardada** | Filtros que un usuario guarda para sí. |
| **Programación** (`PRG-`) | Orden de enviar un reporte por correo cada cierto tiempo. |
| **Foto mensual** | Cifras de indicadores guardadas cada fin de mes para ver la tendencia. |
| **SLA** | Plazo interno de la mesa de ayuda para responder y resolver; lo mide mesa-de-ayuda. |
| **Puerta única de exportación** | Servicio del núcleo (D-061.1) por el que pasa toda descarga de datos. |
| **Alcance** | "Todo" o "propio" de un permiso (D-036.4). |

---

## 3. Roles y permisos

Solo nombres y PS-nn de `docs/registro-permisos.md` (D-036). Un reporte muestra únicamente lo que el usuario ya podría ver en el módulo de origen; los precios exigen `precios.ver` (PS-23) y los nombres de Personas `datos_personales.ver` (PS-22; sin él se muestra la referencia `PRS-NNNN`). Las columnas sin permiso se **omiten con aviso**, no se dejan vacías.

| Acción | Permiso (PS) | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver tablero de Jefatura | `tableros.ver_jefatura` (PS-121) | Sí | Sí | No | No | No | No |
| Ver tablero de Técnico | `tableros.ver_tecnico` (PS-122) | Sí | Sí | Sí | No | No | No |
| Ver tablero de Almacén | `tableros.ver_almacen` (PS-123) | Sí | Sí | No | Sí | No | No |
| Ver reportes de inventario y ciclo de vida | `reportes.ver_inventario` (PS-124) | Sí | Sí | Sí | Sí | No | Sí |
| Ver garantías y vencimientos | `reportes.ver_vencimientos` (PS-125) | Sí | Sí | Sí | No | No | Sí |
| Ver reportes de costos | `reportes.ver_costos` (PS-126) + `precios.ver` | Sí | Sí | No | No | No | No |
| Ver reporte de SLA | `reportes.ver_sla` (PS-127) | Sí | Sí | Sí | No | No | No |
| Ver cumplimiento de licencias | `reportes.ver_licencias` (PS-128) | Sí | Sí | No | No | No | No |
| Guardar vistas de filtros | Ninguno propio: quien ve el reporte puede guardar vistas | Sí | Sí | Sí | Sí | No | Sí |
| Exportar cualquier reporte | `datos.exportar` (PS-20; sensible, único) | Sí | No | No | No | No | No |
| Crear y editar programaciones | `reportes.programar` (PS-129; todo / propio) | Sí (todas) | Sí (propias) | No | No | No | No |
| Ver todas las programaciones | `reportes.ver_programaciones` (PS-130) | Sí | No | No | No | No | No |
| Cambiar parámetros de indicadores | `reportes.configurar` (PS-131) | Sí | No | No | No | No | No |
| Ver el registro de exportaciones | `auditoria.ver` (PS-18) | Sí | Sí | No | No | No | No |

Notas
- **Empleado (portal): no aplica.** El portal no ve tableros ni reportes.
- Las tarjetas "mi trabajo" del Técnico (OS y casos asignados a su Persona) usan el resolvedor de "propio" del registro. **Sin Persona vinculada ven una lista vacía, nunca un error** (D-036.4). Para las programaciones, "propias" son las que creó la membresía **[SUPUESTO]**, a incluir en los resolvedores del registro.
- Los permisos de este cuadro se suman a los del módulo de origen: quien exporta sin `precios.ver` exporta sin precios.
- "Exportar" se muestra **visible y desactivado con la razón** a quien no tiene `datos.exportar` (D-061.1, D-053).
- Ninguno de los permisos propios de REP es sensible; sí lo son `datos.exportar`, `precios.ver` y `datos_personales.ver` (exigen segunda verificación). Todo se comprueba en el servidor (regla 6 de `CLAUDE.md`).

---

## 4. Requisitos

### 4.1 Funcionales

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-REP-001 | Tablero de Jefatura: órdenes por aprobar, ejecución del presupuesto, garantías y vencimientos próximos, SLA, cumplimiento de licencias, activos en fin de vida útil. | B | CA-REP-12 |
| RF-REP-002 | Tablero de Técnico: mis OS y casos abiertos, SLA por vencer, activos en reparación, tiempo medio de reparación. Se integra a "Mi trabajo". | A | CA-REP-04 |
| RF-REP-003 | Tablero de Almacén: recepciones pendientes, SKU bajo el mínimo, activos En stock sin asignar hace mucho, traslados del mes. | A | CA-REP-01 |
| RF-REP-004 | Cada tarjeta abre la lista que la compone con el mismo filtro. | A | CA-REP-01 |
| RF-REP-005 | Reporte de inventario: activos por estado, categoría, ubicación y marca; stock por cantidad por SKU y ubicación. | A | CA-REP-01 |
| RF-REP-006 | Reporte de ciclo de vida: antigüedad por tramos, fin de vida útil, tiempo en reparación, bajas del periodo. | A | CA-REP-14 |
| RF-REP-007 | Reporte de garantías y vencimientos sobre la **pantalla única de Vencimientos** (DS-07), con ventanas de 30, 60 y 90 días; no hay otro calendario. | A | CA-REP-02 |
| RF-REP-008 | Reporte de costos con las definiciones y los servicios de PRE. | B | CA-REP-12 |
| RF-REP-009 | Reporte de SLA: cumplimiento de respuesta y resolución, tiempo medio, casos vencidos, por categoría y técnico. | C | CA-REP-10 |
| RF-REP-010 | Reporte de cumplimiento de licencias con los estados de licencias-software. | C | CA-REP-13 |
| RF-REP-011 | Filtros comunes: periodo, ubicación, categoría, estado, centro de costo, proveedor, marca. | A | CA-REP-04 |
| RF-REP-012 | Guardar, renombrar y quitar vistas de filtros personales (hasta 20 por usuario). | A | CA-REP-15 |
| RF-REP-013 | Exportar el reporte como se ve (.xlsx o .csv) **por la puerta única**; REP no tiene otro camino de descarga. | A | CA-REP-05, CA-REP-08 |
| RF-REP-014 | La confirmación de la puerta muestra motivo, filas y columnas sensibles que saldrán. | A | CA-REP-06 |
| RF-REP-015 | Cada exportación queda en la auditoría (quién, cuándo, reporte, **nombres de los campos filtrados sin sus valores**, formato, filas, columnas sensibles; sin el contenido). Un filtro por texto de una Persona nunca guarda el texto buscado (D-030). | A | CA-REP-06 |
| RF-REP-016 | Programar el envío de un reporte (diaria, semanal o mensual, hora, destinatarios de la empresa). Jefatura TI gestiona solo las suyas. | C | CA-REP-11 |
| RF-REP-017 | El correo programado lleva cifras clave y un enlace que exige iniciar sesión; no lleva adjuntos. | C | CA-REP-11 |
| RF-REP-018 | Pausar, reanudar y desactivar programaciones; ver el historial de envíos. | C | CA-REP-11 |
| RF-REP-019 | Guardar la foto mensual y mostrar la evolución de 24 meses. | B | CA-REP-16 |
| RF-REP-020 | Mostrar fecha de corte y la definición de cada indicador. | A | CA-REP-01 |
| RF-REP-021 | Mostrar el dinero en bloques por moneda, sin total general (D-014, D-049.8). | B | CA-REP-12 |
| RF-REP-022 | Avisar con mensaje claro cuando un reporte supera el límite de filas y sugerir filtros. | A | CA-REP-09 |
| RF-REP-023 | Un trabajador en segundo plano precalcula los agregados de los tableros y registra la fecha de corte; las listas de detalle se consultan en vivo. | A | CA-REP-01, CA-REP-17 |
| RF-REP-024 | Los tableros aportan tarjetas al Inicio por tarjetas (máximo seis visibles, una principal por rol). | A | CA-REP-04 |

### 4.2 Reglas de negocio

| ID | Regla | Cuándo | CA |
|---|---|---|---|
| RN-REP-001 | Todo reporte filtra por la empresa de la sesión. Un identificador de otra empresa responde "no encontrado". | A | CA-REP-04 |
| RN-REP-002 | Un reporte nunca muestra más de lo que el módulo de origen permitiría ver al mismo usuario. | A | CA-REP-18 |
| RN-REP-003 | Las columnas de precios se omiten sin `precios.ver` y los nombres de Personas se sustituyen por `PRS-NNNN` sin `datos_personales.ver`. | A | CA-REP-07 |
| RN-REP-004 | Las claves de licencia nunca aparecen en reportes ni exportaciones, ni enmascaradas (D-035.2). IMEI y número de línea se tratan como datos personales. | A | CA-REP-07 |
| RN-REP-005 | Exportar exige `datos.exportar` además de poder ver el reporte; por defecto solo el Administrador. | A | CA-REP-05 |
| RN-REP-006 | Solo las celdas **de texto** que empiezan con `=`, `+`, `-`, `@`, tabulador o retorno se escriben como texto; las celdas numéricas, incluidos importes negativos, siguen siendo números (D-050.8). | A | CA-REP-08 |
| RN-REP-007 | Toda exportación queda en la auditoría aunque falle; se guardan los datos de la acción, no el contenido. El archivo con datos personales lleva una hoja "Aviso" (quién, cuándo, que contiene datos personales). | A | CA-REP-06 |
| RN-REP-008 | Si el usuario pierde el permiso o su membresía, deja de descargar al instante; lo ya descargado no se puede retirar. | A | CA-REP-05 |
| RN-REP-009 | Máximo 50.000 filas por exportación; el reporte en pantalla muestra páginas de **50** por defecto (selector 25, 50, 100) y hasta 10.000 filas consultables. | A | CA-REP-09 |
| RN-REP-010 | Topes de la puerta (D-054): 10 exportaciones por usuario por hora y 100 por empresa por día; alerta a administradores si un usuario pasa de 5 por hora. | A | CA-REP-19 |
| RN-REP-011 | El periodo máximo por consulta es 24 meses. **[SUPUESTO]** | A | CA-REP-09 |
| RN-REP-012 | Los destinatarios de una programación son usuarios activos de la misma empresa; no se admiten correos externos. **[SUPUESTO]** | C | CA-REP-11 |
| RN-REP-013 | En cada envío se comprueba otra vez el permiso del destinatario; si ya no lo tiene se lo omite y se avisa a quien creó la programación. | C | CA-REP-11 |
| RN-REP-014 | El correo programado tiene contenido mínimo (D-061.4): cantidades y estados, sin nombres, series, IMEI, importes ni datos personales; los detalles se ven al abrir el enlace con permiso. | C | CA-REP-11 |
| RN-REP-015 | Máximo 20 programaciones activas por empresa y 10 destinatarios por programación. **[SUPUESTO]** | C | CA-REP-11 |
| RN-REP-016 | Si quien creó una programación deja de ser usuario activo o pierde `reportes.programar`, la programación se pausa y se avisa a los administradores. | C | CA-REP-11 |
| RN-REP-017 | Una programación mensual con día 29, 30 o 31 se envía el último día del mes cuando el mes es más corto. | C | CA-REP-11 |
| RN-REP-018 | Los reportes muestran datos actuales. La evolución histórica sale solo de la foto mensual, desde la activación del módulo. **[SUPUESTO]** | B | CA-REP-16 |
| RN-REP-019 | La foto mensual la toma el trabajador en el primer ciclo posterior al fin del mes en la zona horaria de la empresa; si estuvo caído, la toma al volver y la marca "tomada con retraso" con su fecha de corte real. No se modifica después. | B | CA-REP-16 |
| RN-REP-020 | Las fechas de garantía y vencimiento son fechas de calendario sin hora; el día de vencimiento cuenta como vigente. Se muestran día/mes/año. | A | CA-REP-02 |
| RN-REP-021 | El reporte de costos llama a los servicios de PRE; no recalcula ejecutado, comprometido ni disponible ni lee sus tablas. | B | CA-REP-12 |
| RN-REP-022 | En SLA, REP cuenta los resultados de mesa-de-ayuda (cumplió respuesta y cumplió resolución: sí, no o no aplica) llamando a sus servicios; no recalcula relojes, horarios ni pausas. | C | CA-REP-10 |
| RN-REP-023 | Una cifra sin dato base se excluye del promedio y se muestra aparte como "sin dato: N". | A | CA-REP-14 |
| RN-REP-024 | Los tableros no incluyen datos personales: cantidades, estados y listas con identificadores de activo. | A | CA-REP-07 |
| RN-REP-025 | Una vista guardada solo la ve quien la creó y solo guarda filtros. | A | CA-REP-15 |
| RN-REP-026 | Cada indicador se define **una sola vez** como un filtro reutilizable; la cifra y la lista que abre salen del mismo filtro (por construcción coinciden). | A | CA-REP-01 |
| RN-REP-027 | La tarjeta muestra el agregado precalculado y su fecha de corte; la lista abre en vivo y muestra su propia hora. Tras cada precálculo, cifra y lista coinciden (diferencia cero). El botón "Actualizar" tiene tope de uno cada 5 minutos por usuario. **[SUPUESTO]** | A | CA-REP-17 |
| RN-REP-028 | Los **casos restringidos** (derechos de datos) no cuentan en ningún indicador ni lista, ni en el SLA (D-061.2). | C | CA-REP-20 |
| RN-REP-029 | Solo la naturaleza "equipo físico" cuenta como activo vigente; licencias y servicios se informan en sus reportes (D-045). | A | CA-REP-14 |
| RN-REP-059 | Los trabajos de REP (precálculo, foto mensual, envíos) son idempotentes, recuperables (procesan los días pendientes en orden), corren empresa por empresa con "hoy" de cada una, saltan empresas suspendidas y registran cada corrida; escriben con autor "sistema" (D-038.4). | A | CA-REP-17 |
| RN-REP-060 | Si un módulo está apagado en la empresa, sus reportes y tarjetas no aparecen y la API responde "no encontrado". | A | CA-REP-21 |
| RN-REP-061 | Una lectura de 5.000 filas o más en una operación se audita como lectura masiva (D-061.6). | A | CA-REP-06 |
| RN-REP-062 | Prefijo `PRG-` (mínimo 6 dígitos, correlativo por empresa) para programaciones; reservado en la tabla de prefijos. | C | CA-REP-11 |

### 4.3 Calidad medible

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RNF-REP-001 | Con el volumen de referencia de RNF-010, un tablero carga en 3 s o menos (percentil 95). La prueba de carga corre en integración nocturna desde la Etapa 4. | A | CA-REP-17 |
| RNF-REP-002 | Un reporte con filtros muestra su primera página en 5 s o menos con ese volumen. | A | CA-REP-17 |
| RNF-REP-003 | Una exportación de 50.000 filas termina en 60 s o menos, en segundo plano con barra de avance (D-038.7). | A | CA-REP-09 |
| RNF-REP-004 | Tras cada precálculo, la cifra de una tarjeta coincide con su lista (diferencia cero). | A | CA-REP-01 |
| RNF-REP-005 | El correo programado sale en menos de 10 minutos desde la hora fijada. | C | CA-REP-11 |
| RNF-REP-006 | Teclado completo, texto además del color, contraste AA y uso a 360 px (D-053). | A | CA-REP-22 |
| RNF-REP-007 | Un reporte pesado no vuelve más lenta la operación diaria (se mide en la prueba de carga de QA). | A | CA-REP-17 |
| RNF-REP-008 | Cada indicador tiene al menos una prueba automática con datos conocidos y resultado esperado. | A | CA-REP-01 a 03 |

### 4.4 Catálogo de indicadores (definición en palabras)

"Hoy" es la fecha actual en la zona horaria de la empresa. Los CA de la última columna ejemplifican; cada indicador tiene además su prueba (RNF-REP-008).

| ID | Indicador | Fórmula en palabras | Cuándo | CA |
|---|---|---|---|---|
| RN-REP-030 | Activos vigentes | Cantidad de activos de equipo físico en En stock, Asignado o En reparación. | A | CA-REP-01 |
| RN-REP-031 | Activos por estado | Cantidad en cada uno de los cinco estados de D-012. | A | CA-REP-01 |
| RN-REP-032 | Stock por SKU | Suma de los saldos de todas las ubicaciones del SKU por cantidad. | A | — |
| RN-REP-033 | SKU bajo el mínimo | SKU por cantidad con stock mínimo definido (mayor que cero) y stock total menor que ese mínimo. Solo es un dato del SKU (S-26), sin avisos propios. | A | — |
| RN-REP-034 | Tasa de asignación | Activos Asignado entre (En stock + Asignado), en porcentaje. | A | CA-REP-03 |
| RN-REP-035 | En stock sin asignar | Activos En stock con última salida o ingreso de hace más de 90 días (configurable). | A | — |
| RN-REP-036 | Pendientes de completar | Activos o SKU con campos obligatorios sin llenar (D-005). | A | — |
| RN-REP-037 | Antigüedad promedio | Promedio, en meses, de (hoy menos fecha de compra) de los activos vigentes con fecha de compra. | A | CA-REP-14 |
| RN-REP-038 | Tramos de antigüedad | Activos vigentes con 0 a 12, más de 12 a 24, más de 24 a 36, más de 36 a 48 y más de 48 meses. | A | — |
| RN-REP-039 | En fin de vida útil | Activos vigentes cuya antigüedad es mayor o igual a la vida útil de **la copia de parámetros que PRE guardó en el activo al ingresar**. Sin copia, "sin parámetro: N". | B | CA-REP-14 |
| RN-REP-040 | Cerca del fin de vida útil | Activos vigentes que cumplen su vida útil en los próximos 6 meses. | B | CA-REP-14 |
| RN-REP-041 | Tiempo medio en reparación | Promedio de días entre entrada y salida de En reparación, de las reparaciones terminadas en el periodo; las abiertas aparte. | A | — |
| RN-REP-042 | Bajas del periodo | Activos que pasaron a De baja o Extraviado o robado en el periodo, por motivo. | A | — |
| RN-REP-043 | Garantías por vencer | Activos vigentes con fin de garantía entre hoy y hoy + 30, 60 o 90 días (inclusive). | A | CA-REP-02 |
| RN-REP-044 | Garantías vencidas | Activos vigentes con fin de garantía anterior a hoy; los sin garantía, aparte. | A | — |
| RN-REP-045 | Vencimientos próximos | Contratos, licencias, líneas, dominios y certificados con vencimiento entre hoy y hoy + 30, 60 o 90 días, por tipo. La vigencia se calcula al leer (D-062.2). | A | — |
| RN-REP-046 | Vencidos sin renovar | Elementos de la regla anterior con vencimiento anterior a hoy y sin renovación registrada. | A | — |
| RN-REP-047 | OC por estado | Cantidad e importe (por moneda) de OC en cada estado de D-013. | B | CA-REP-12 |
| RN-REP-048 | Tiempo medio de aprobación | Promedio de horas entre el paso a Pendiente de aprobación y la aprobación o rechazo, de las órdenes resueltas en el periodo. | B | — |
| RN-REP-049 | Tiempo medio de entrega | Promedio de días entre Emitida y la primera recepción confirmada, de las órdenes con recepción en el periodo. | B | — |
| RN-REP-050 | Ejecutado, comprometido, disponible, ejecución % | Como los define PRE, siempre por moneda. | B | CA-REP-12 |
| RN-REP-051 | Compras por proveedor | Valor recibido sin impuesto en el periodo por proveedor y moneda. | B | — |
| RN-REP-052 | Casos abiertos | Casos no resueltos ni cerrados a la fecha de corte, sin los restringidos. | C | CA-REP-20 |
| RN-REP-053 | Cumplimiento SLA de respuesta | Casos con "cumplió respuesta = sí" entre los de "sí" o "no" cuya meta cayó en el periodo; se excluyen "no aplica" y los aún dentro de plazo. | C | CA-REP-10 |
| RN-REP-054 | Cumplimiento SLA de resolución | Igual, con "cumplió resolución". | C | CA-REP-10 |
| RN-REP-055 | Tiempo medio de resolución | Promedio de horas, medidas como las mide mesa-de-ayuda, entre creación y resolución de los casos resueltos en el periodo. | C | — |
| RN-REP-056 | Casos vencidos abiertos | Casos abiertos con meta de respuesta o resolución ya pasada. | C | — |
| RN-REP-057 | Cumplimiento de licencias | Por producto, el estado que informa licencias-software: En regla, Déficit (faltan puestos), Excedente (sobran) o Sin verificar (sin dato de uso reciente). Muestra puestos adquiridos vigentes, asignados y en uso con la fecha del último dato. No es una auditoría de licencias. | C | CA-REP-13 |
| RN-REP-058 | Licencias en riesgo | Productos en Déficit o Sin verificar. | C | CA-REP-13 |

---

## 5. Estados y transiciones

**Programación de reporte**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) | Activa | `reportes.programar` | Reporte, frecuencia y un destinatario válido |
| Activa | Pausada | Quien la creó, `reportes.ver_programaciones` o el sistema (RN-REP-016) | Queda el motivo |
| Pausada | Activa | Quien la creó o `reportes.ver_programaciones` | El creador sigue activo y con permiso |
| Activa / Pausada | Desactivada | Quien la creó o `reportes.ver_programaciones` | Final; no se borra |

**Envío programado:** Pendiente → Enviado | Reintentando (hasta 3 veces) → Enviado | Fallido (se avisa al creador); Pendiente → Omitido (sin destinatarios con permiso o programación pausada). Lo hace el sistema.
Las exportaciones son una acción inmediata de la puerta única; su rastro es la auditoría.

---

## 6. Datos

| Entidad | Campos principales | Clave y unicidad | Se audita |
|---|---|---|---|
| Vista guardada | empresa, membresía, reporte, filtros, nombre | Única por membresía + nombre | No (preferencia) |
| Programación (`PRG-`) | empresa, reporte, filtros, frecuencia, día, hora, destinatarios (membresías), estado, creada por, motivo de pausa | Correlativo por empresa | Altas, cambios con antes/después, pausa, desactivación |
| Envío programado | programación, fecha prevista, estado, destinatarios, omitidos, intentos | Único por programación + fecha prevista | No; se conserva 12 meses |
| Agregado precalculado | empresa, indicador, dimensión, valor, moneda, fecha de corte | Único por empresa + indicador + dimensión + moneda | No (derivado) |
| Foto mensual | empresa, mes, indicador, dimensión, valor, moneda, "tomada con retraso" | Única por empresa + mes + indicador + dimensión + moneda | Creación; nunca se edita |
| Parámetros de reportes | días sin asignar (90), ventanas 30/60/90, ventana de fin de vida (6 meses) | Uno por empresa | Cambios con antes/después |
| Corrida de trabajo | fecha lógica, resultado, cantidad | Única por empresa + trabajo + fecha lógica | No (registro técnico) |
| Registro de exportación | **vive en la auditoría general**: quién, cuándo, reporte, nombres de los campos filtrados sin sus valores (D-030), formato, filas, columnas sensibles (sí/no) | Entrada de auditoría | Siempre |

- Los reportes no guardan copia de los datos, salvo agregados y foto mensual (solo cantidades). No se guardan archivos exportados (D-022).
- **Datos personales declarados:** ninguno por valor. Destinatarios y autores son referencias a membresías.
- Tablas calientes (agregados, envíos, foto): índices que empiezan por empresa; envíos particionables (para Datos).

---

## 7. Pantallas necesarias

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-REP-01 | Tablero de Jefatura | Lo urgente y la tendencia | Jefatura TI |
| PAN-REP-02 | Tablero de Técnico | Mi trabajo y plazos (dentro de "Mi trabajo") | Técnico |
| PAN-REP-03 | Tablero de Almacén | Lo pendiente de recibir y mover | Almacén |
| PAN-REP-04 | Centro de reportes | Reportes disponibles según permisos y módulos activos | Todos con permiso |
| PAN-REP-05 | Reporte (pantalla común) | Filtros, tabla, definiciones, fecha de corte, Exportar y Programar | Según reporte |
| PAN-REP-06 | Vencimientos (la única, DS-07) | Garantías, contratos, licencias, líneas, dominios, certificados | Jefatura TI, Técnico |
| PAN-REP-07 | Evolución mensual | Foto mensual de un indicador, con tabla | Jefatura TI |
| PAN-REP-08 | Programaciones | Crear, pausar, ver envíos | Jefatura TI |
| PAN-REP-09 | Configuración de reportes | Parámetros | Administrador |

La confirmación de exportación pertenece a la puerta única del núcleo. Reglas: los tres mensajes del catálogo (No encontrado, No tiene permiso, No se puede por una regla); estados con texto y color; uso a 360 px.

---

## 8. Notificaciones y automatismos

Los correos salen por el motor único de Notificaciones (plantilla, 3 reintentos, registro; sin adjuntos).

| Cuándo | A quién | Qué dice |
|---|---|---|
| Hora de una programación | Destinatarios con permiso | "Resumen semanal de garantías: 7 por vencer en 30 días. Ver el reporte: (enlace)." |
| Programación pausada por el sistema | Quien la creó y administradores | "Se pausó la programación PRG-000012 porque su creador ya no está activo." |
| Envío fallido tras 3 intentos | Quien creó la programación | "No pudimos enviar PRG-000012 el 03/11/2026." |
| Destinatario omitido por falta de permiso | Quien creó la programación | "Se omitió a un destinatario por falta de permiso." |
| Exportaciones al 80 % del tope diario | Administradores | "Se usaron 80 de 100 exportaciones de hoy." |
| Usuario con más de 5 exportaciones en una hora | Administradores | "Un usuario exportó 6 veces en una hora." |

**Trabajos** (programador único, D-038): precálculo de agregados cada 15 minutos por empresa activa **[SUPUESTO]**; foto mensual; envíos programados; limpieza del historial de envíos a los 12 meses. Todos con RN-REP-059.

---

## 9. Integración con el núcleo y con otros módulos

- **Núcleo:** empresa y zona horaria, membresías y Personas, roles y permisos, auditoría (con autor "sistema" y lecturas masivas), inventario, estados (D-012), OC y recepciones, Inicio por tarjetas (RNF-008), puerta única de exportación, calendario de empresa, interruptor de módulos.
- **Pedidos al núcleo:** stock mínimo opcional en el SKU (S-26, aceptado); fecha de compra y fin de garantía del activo consultables; resolvedor de "propio" para programaciones de reportes (las que creó la membresía), a agregar al registro de permisos.
- **presupuesto-costos (PRE):** REP llama a sus servicios y lee la copia de parámetros del activo (no la vida útil de la categoría).
- **proveedores-contratos y garantias-mantenimiento (A):** aportan fechas (fin de garantía, fin de contrato, preaviso, mantenimiento programado) a la pantalla única de Vencimientos; GAR no tiene calendario propio (confirmado por mensaje).
- **licencias-software, lineas-moviles, dominios-certificados (B):** vencimientos; para licencias, puestos adquiridos vigentes, asignados y en uso con sus cuatro estados.
- **mesa-de-ayuda (C):** resultados de cumplimiento (sí, no, no aplica), metas, fechas y pausas; excluye casos restringidos.
- **notificaciones (C):** motor único de envío y umbrales por defecto (90/60/30/15/7); las ventanas 30/60/90 son solo de los reportes (confirmado por mensaje).
- **integraciones-api (INT):** una lectura masiva por API (más de 5.000 filas por día por clave) se audita como exportación; los reportes no se obtienen por API, solo los datos base.
- **cmdb-ligera (E):** reutiliza los reportes de inventario; no los duplica.
- **Registro de módulo (D-038.6):** permisos `tableros.*` y `reportes.*`; declara los indicadores como filtros reutilizables y proveedor de vencimientos; no emite eventos de negocio.

---

## 10. Criterios de aceptación

Cada criterio cita el requisito que cubre. Fechas día/mes/año.
- **CA-REP-01 Cifra coherente.** *Cubre RF-REP-003, 004, 020, 023, RN-REP-026, 030, 031, RNF-REP-004.* Dado 12 laptops Asignado, 8 En stock, 3 En reparación y 2 De baja, y 5 licencias por serie, cuando corre el precálculo, entonces "Activos vigentes" muestra 23, al abrir la tarjeta aparecen esas 23 filas y las licencias no cuentan.
- **CA-REP-02 Garantías por vencer.** *Cubre RF-REP-007, RN-REP-020, 043.* Dado una laptop con garantía hasta el 24/11/2026 y hoy 25/10/2026, entonces aparece en 30 días; una con garantía hasta el 25/11/2026 no aparece en 30 días y sí en 60.
- **CA-REP-03 Tasa de asignación.** *Cubre RN-REP-034.* Dado 12 Asignado y 8 En stock, la tasa es 60 %; los En reparación y De baja no entran.
- **CA-REP-04 Aislamiento entre empresas.** *Cubre RN-REP-001, RF-REP-002, 011, 024.* Dado dos empresas, cuando un usuario de A abre un reporte o una tarjeta, entonces ve solo datos de A; con el identificador interno de una programación de B recibe "no encontrado"; las tarjetas "mi trabajo" de un Técnico sin Persona vinculada muestran una lista vacía.
- **CA-REP-05 Exportar sin permiso.** *Cubre RF-REP-013, RN-REP-005, 008.* Dado una Jefatura TI sin `datos.exportar`, cuando abre un reporte, entonces "Exportar" está visible y desactivado con la razón; si llama directo al servidor recibe "No tiene permiso" y el intento queda en el registro de seguridad.
- **CA-REP-06 Auditoría de exportación.** *Cubre RF-REP-014, 015, RN-REP-007, 061.* Dado un Administrador que exporta 1.200 filas con precios, cuando confirma con su motivo, entonces la auditoría registra usuario, fecha, reporte, nombres de los campos filtrados (nunca el texto buscado), formato, 1.200 filas y "precios: sí", sin el contenido; si las filas fueran 5.000 o más se anota como lectura masiva; con datos personales el archivo trae la hoja "Aviso".
- **CA-REP-07 Columnas omitidas.** *Cubre RN-REP-003, 004, 024.* Dado un usuario con `datos.exportar` sin `precios.ver` ni `datos_personales.ver`, cuando exporta inventario, entonces el archivo no tiene precios, muestra `PRS-NNNN` en vez de nombres, no trae claves de licencia y la confirmación lo indica.
- **CA-REP-08 Fórmulas.** *Cubre RF-REP-013, RN-REP-006.* Dado un activo con observación `=HYPERLINK("http://x")` y otra que empieza con tabulador, cuando se exporta, entonces ambas celdas son texto; un importe negativo sigue siendo número.
- **CA-REP-09 Límites.** *Cubre RF-REP-022, RN-REP-009, 011, RNF-REP-003.* Dado un reporte de 80.000 filas, cuando se pide exportar, entonces se muestra "Máximo 50.000 filas; agregue filtros" y no se genera archivo; con 50.000 filas se genera en segundo plano con avance; un periodo de 25 meses se rechaza.
- **CA-REP-10 SLA sin recalcular.** *Cubre RF-REP-009, RN-REP-022, 053, 054.* Dado 10 casos con meta de resolución en el periodo: 7 "sí", 2 "no", 1 "no aplica", entonces el cumplimiento es 77,8 % (7 de 9).
- **CA-REP-11 Programación.** *Cubre RF-REP-016 a 018, RN-REP-012 a 017, 062, RNF-REP-005.* Dado PRG-000001 semanal con Ana y Luis, y Luis pierde el permiso, cuando llega la hora, entonces el correo sale solo a Ana, sin nombres ni importes y con enlace que exige iniciar sesión, y el creador recibe el aviso de omisión; una Jefatura TI no ve ni edita las programaciones de otra persona.
- **CA-REP-12 Costos por moneda.** *Cubre RF-REP-001, 008, 021, RN-REP-021, 047, 050.* Dado costos en USD y PEN, cuando se abre el reporte, entonces hay dos bloques, no hay total general y las cifras coinciden con las que muestra PRE.
- **CA-REP-13 Licencias.** *Cubre RF-REP-010, RN-REP-057, 058.* Dado un producto con 50 puestos adquiridos vigentes y 53 en uso informados el 20/10/2026, entonces muestra el estado que informa licencias-software con ambas cifras y esa fecha; sin dato de uso reciente muestra Sin verificar.
- **CA-REP-14 Ciclo de vida con copia de parámetros.** *Cubre RF-REP-006, RN-REP-023, 029, 037, 039, 040.* Dado un activo con copia de vida útil de 36 meses y su categoría cambiada después a 48, cuando se calcula "fin de vida útil", entonces se usa 36; un activo sin fecha de compra aparece en "sin dato".
- **CA-REP-15 Vistas guardadas.** *Cubre RF-REP-012, RN-REP-025.* Dado una vista de Ana, cuando Luis abre el listado de vistas, entonces no la ve.
- **CA-REP-16 Foto mensual.** *Cubre RF-REP-019, RN-REP-018, 019.* Dado que el trabajador estuvo caído el último día del mes, cuando vuelve, entonces toma la foto marcada "tomada con retraso" con su fecha de corte real, y una segunda corrida no la duplica.
- **CA-REP-17 Procesos y rendimiento con dos empresas.** *Cubre RF-REP-023, RN-REP-027, 059, RNF-REP-001, 002, 007.* Dado dos empresas con zonas distintas (una suspendida) y el volumen de RNF-010, cuando el precálculo corre dos veces y tras una caída de dos días, entonces no hay duplicados, cada agregado queda en su empresa, la suspendida se salta, el tablero carga en 3 s o menos (percentil 95) y tarjeta y lista coinciden.
- **CA-REP-18 Cruce de módulos sin permiso.** *Cubre RN-REP-002.* Dado un reporte que combina inventario y costos y un usuario sin `reportes.ver_costos`, entonces ve inventario sin columnas de costo.
- **CA-REP-19 Topes.** *Cubre RN-REP-010.* Dado un usuario que hizo 10 exportaciones en una hora, cuando intenta la 11, entonces se rechaza informando cuándo podrá repetir; con la sexta en una hora los administradores reciben alerta.
- **CA-REP-20 Casos restringidos.** *Cubre RN-REP-028, 052.* Dado un caso restringido, cuando se calculan casos abiertos y SLA, entonces no cuenta ni aparece en ninguna lista, exportación o tablero.
- **CA-REP-21 Módulo apagado.** *Cubre RN-REP-060.* Dado el módulo de licencias apagado, entonces su reporte y tarjeta no aparecen y su dirección directa responde "no encontrado".
- **CA-REP-22 Accesibilidad.** *Cubre RNF-REP-006.* Dado un tablero a 360 px, entonces se usa solo con teclado, con contraste AA y cada estado con texto.

---

## 11. Casos límite

1. Activo sin fecha de compra: fuera del promedio de antigüedad, aparte como "sin dato".
2. Categoría sin copia de vida útil: sus activos no entran en "fin de vida útil" y se muestran como "sin parámetro".
3. Empresa sin datos: ceros y mensaje de ayuda, no errores.
4. Reparación abierta hace 200 días: fuera del promedio, aparte como "aún en reparación".
5. Garantía que vence hoy: vigente y "por vencer en 30 días".
6. Cambio de zona horaria de la empresa: afecta el "hoy" desde ese momento; no reescribe fotos.
7. Programación mensual el día 31 en un mes de 28 días: se envía el 28.
8. Usuario con dos empresas: reportes, vistas y programaciones son de la empresa activa de la dirección; cambiar de empresa no deja nada en pantalla de la anterior.
9. Exportación abierta en dos pestañas: cuenta como dos exportaciones.
10. Caso reabierto en mesa de ayuda: REP toma el último resultado que informe AYU.
11. SKU por cantidad con mínimo cero: se considera sin mínimo.
12. Persona anonimizada: los históricos muestran "Persona anonimizada 0042".
13. Destinatario dado de baja: se omite y se avisa al creador.
14. Producto de licencia sin dato de uso reciente: Sin verificar, nunca En regla.
15. Tarjeta con agregado de hace 20 minutos y lista nueva: la tarjeta muestra su fecha de corte; tras "Actualizar" coinciden.

---

## 12. Decisiones propuestas y supuestos

| ID | Tipo | Propuesta y motivo |
|---|---|---|
| S-REP-01 | [SUPUESTO] | Tableros fijos por rol, sin constructor. |
| S-REP-02 | Resuelto (D-054, D-061.1) | Topes de exportación: 50.000 filas, 10 por usuario por hora, 100 por empresa por día, alerta sobre 5 por hora. Lo demás (10.000 consultables, 24 meses) sigue [SUPUESTO] y se ajusta con datos reales (pendiente #4). |
| S-REP-03 | [SUPUESTO] | Correos programados con resumen mínimo y enlace; sin adjuntos ni precios (D-022, D-061.4). |
| S-REP-04 | [SUPUESTO] | Destinatarios solo usuarios de la empresa. |
| S-REP-05 | [SUPUESTO] | Foto mensual desde la activación; sin reconstruir el pasado. |
| S-REP-06 | Resuelto (D-057 S-26) | Stock mínimo opcional por SKU, solo dato. |
| S-REP-07 | [SUPUESTO] | Umbrales: 90 días sin asignar, ventanas de 30/60/90 días y 6 meses de fin de vida; configurables. Los umbrales de aviso por defecto los fija NOT. |
| S-REP-08 | Resuelto (D-061.1) | Alerta por uso inusual: más de 5 exportaciones por hora por usuario. |
| S-REP-09 | Resuelto (D-037 fila 1) | Jefatura TI no exporta por defecto. |
| S-REP-10 | [SUPUESTO] | Las columnas sin permiso se omiten con aviso, no se enmascaran. |
| S-REP-11 | **[ESCALAR AL CEO]** | El volumen de correos programados cuenta dentro del servicio de correo ya escalado (D1). Si superara el plan, DevOps avisa; no se compromete gasto nuevo hoy. |
| S-REP-12 | [SUPUESTO] | Precálculo cada 15 minutos por empresa activa; botón "Actualizar" con tope de uno cada 5 minutos. |
| S-REP-13 | [SUPUESTO] | REP-A reutiliza el Inicio por tarjetas del núcleo y la pantalla única de Vencimientos; no construye otras. |
| S-REP-14 | [SUPUESTO] | Para `reportes.programar` (alcance "propio") las programaciones propias son las que creó la membresía; se pide agregarlo a los resolvedores del registro. |

---

## 13. Fuera de alcance

- Constructor de reportes o tableros personalizados; reportes en lenguaje libre.
- Alertas automáticas de vencimiento (las da NOT-completo); aquí solo se ven y se pueden recibir en un resumen programado.
- Correos externos, mensajería, adjuntos y archivos guardados (D-022).
- Exportación a PDF (se imprime desde el navegador).
- Reconstrucción histórica de inventario a una fecha pasada.
- Reportes contables, tributarios o de depreciación oficial (ver PRE).
- Análisis entre empresas.
- Auditoría de licencias por puesto; el panel es informativo.

---

## 14. Historial de cambios (v0.1 a v0.2)

| Cambio | Decisión o hallazgo que lo motiva |
|---|---|
| Cada indicador se define una vez como filtro reutilizable (cifra y lista) (RN-REP-026) | D-062.5; H-ARQ-19 |
| Tableros con agregados precalculados, fecha de corte y listas en vivo; "diferencia cero" se redefine tras cada precálculo (RN-REP-027, RF-REP-023) | D-062.5; H-ARQ-19 |
| La exportación usa la puerta única del núcleo; `reportes.exportar` pasa a `datos.exportar` PS-20; topes de D-054 (RN-REP-005 a 010) | D-061.1, D-036.3, D-054; H-CUM-07, H-CUM-05 |
| "Exportar" visible y desactivado con la razón (antes "no se muestra") | D-053, D-061.1; H-UX |
| Fórmulas: solo celdas de texto, también tabulador y retorno; importes negativos siguen numéricos (RN-REP-006) | D-050.8; H-SEG-13 |
| Hoja "Aviso" y lectura masiva desde 5.000 filas (RN-REP-007, 061) | D-061.1, D-061.6 |
| Fechas día/mes/año, páginas de 50 con selector 25/50/100 | D-049.8; H-UX-17, H-UX (b) |
| Permisos reemplazados por PS-nn (PS-121 a 131); valores por rol del registro: Técnico ve el tablero de Técnico sin alcance propio, Técnico sin cumplimiento de licencias, Jefatura TI sin ver todas las programaciones y con `reportes.programar` solo propio; se declara "Empleado (portal): no aplica"; alcance "propio" sin Persona = lista vacía | D-036, D-037; `docs/registro-permisos.md`; H-QA-20 |
| REP-A reutiliza el Inicio por tarjetas de RNF-008 y no construye uno segundo (RF-REP-024) | H-AUD (fila 24); plan de correcciones |
| Calendario propio sustituido por la pantalla única de Vencimientos, confirmada con A y C (RF-REP-007) | DS-07 (D-053); H-AUD (calendarios) |
| Fin de vida útil usa la copia de parámetros del activo, no la de la categoría (RN-REP-039) | H-QA-22 (4); D-044.9 |
| Solo "equipo físico" cuenta como activo vigente (RN-REP-029) | D-045; H-ARQ-06 |
| Casos restringidos excluidos de todo (RN-REP-028) | D-061.2; H-QA-13 |
| Foto mensual por el trabajador, recuperable, con marca "tomada con retraso"; se quita "23:59" (RN-REP-019, RN-REP-059) | D-038.4; H-ARQ-01, H-SEG-02, H-QA |
| Reportes llaman a los servicios de PRE y AYU (RN-REP-021, 022) | D-062.5 |
| Contenido mínimo en correos programados (RN-REP-014) | D-061.4 |
| Se llena el hueco de numeración RN-REP-026 a 029 | H-AUD (saltos de numeración) |
| Estados de licencias de LIC (En regla, Déficit, Excedente, Sin verificar) y resultados de SLA de AYU, confirmados por mensaje | Coordinación Oleada B |
| Módulo apagado: reportes ocultos y API "no encontrado" (RN-REP-060) | D-037 fila 12 |
| Volumen citado desde RNF-010 y prueba de carga nocturna desde la Etapa 4 (RNF-REP-001) | D-057 S-19 |
| Columnas "Cuándo" y "CA"; cada CA cita lo que cubre; 22 criterios (nuevos: fórmulas con tabulador, topes, casos restringidos, módulo apagado, copia de parámetros, procesos con dos empresas, foto con retraso, accesibilidad) | Plan de correcciones regla 2; H-AUD-21; QA y Seguridad |
| Pantallas con ID `PAN-REP-nn`; prefijo `PRG-` reservado; "usted" y "Cliente (CEO)"; "Persona anonimizada 0042" | D-049, D-053 |
| La auditoría de exportaciones guarda solo los nombres de los campos filtrados, sin el texto buscado (RF-REP-015, sección 6, CA-REP-06) | D-030; Auditor de Cumplimiento R-07 (ronda 3) |
| S-REP-02, 06, 08 y 09 quedan resueltos por decisiones; S-REP-11 marcado dentro del escalado de correo; S-REP-14 nuevo | D-054, D-057, D-061.1, D-037 |
