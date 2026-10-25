# Módulo: Presupuesto y costos de TI (PRE)

**Versión:** 0.1 (borrador del escuadrón F, Oleada B) · **Fecha:** 2026-10-25 · **Autor:** analista-funcional
**Base:** `CLAUDE.md`, `docs/equipo/decisiones.md` (D-001 a D-029), documento funcional v0.1.
**Estado:** propuesta. Lo no decidido está marcado **[SUPUESTO]** (lo confirma el Gerente de TI) o **[ESCALAR AL CEO]** (dinero, legal o irreversible).

---

## 1. Propósito, alcance y fase

**Propósito.** Responder cuatro preguntas del área de TI: cuánto planificamos gastar, cuánto ya gastamos o tenemos comprometido, qué renovaciones vienen y cuánto valen (de forma referencial) los equipos con el paso del tiempo.

**Entra**
1. Presupuesto anual por centro de costo y rubro (categoría de equipos o tipo de gasto recurrente), en una moneda por presupuesto.
2. Modificaciones del presupuesto con aprobación y motivo.
3. Costo real leído de órdenes de compra (OC), recepciones, contratos, licencias, líneas móviles, dominios y certificados, garantías y mantenimiento, y órdenes de servicio (OS) con costo.
4. Gasto manual para lo que no tiene documento en la plataforma (con motivo).
5. Proyección de renovaciones de los próximos 12 meses y plan de reposición de equipos que llegan al fin de su vida útil.
6. Depreciación de gestión (método simple: línea recta) y vida útil por categoría.
7. Alertas de sobre-ejecución y cierre mensual de periodos.

**No entra:** contabilidad oficial, asientos contables, cálculo de impuestos, conversión de monedas, facturación, pagos (ver sección 13).

**Fase.** **[SUPUESTO]** No está en la v1 de D-023 (el documento v0.1 deja fuera "reportes avanzados"). Se construye después de la Etapa 5, porque necesita OC y recepción con costo del activo (D-014.5). Dos entregas: **PRE-A** (presupuesto, costo real de compras y servicios, gasto manual, alertas, cierre) y **PRE-B** (costos de contratos, licencias, líneas y dominios, proyección, depreciación). PRE-B espera a los módulos de los escuadrones A y B.

---

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Presupuesto** | Plan de gasto de un año fiscal, en una sola moneda. Tiene líneas. |
| **Línea de presupuesto** | Monto anual para un centro de costo y un rubro. |
| **Rubro** | Tipo de gasto. Dos clases: (a) cada **categoría de SKU** (Laptops, Celulares, Periféricos...) y (b) **rubros fijos del sistema**: Contratos de servicio, Licencias, Líneas móviles, Dominios y certificados, Garantías y mantenimiento, Servicios (OS). |
| **Centro de costo** | Área a la que se le atribuye el gasto (catálogo de la empresa, D-008). |
| **Año fiscal** | Periodo de 12 meses del presupuesto. Por defecto enero a diciembre. |
| **Presupuesto vigente** | Monto original más las modificaciones aprobadas. |
| **Registro de costo** | Hecho de gasto que PRE reconoce: de dónde viene, fecha, importe, moneda, centro de costo y rubro. Nunca se edita ni se borra; se corrige con otro registro de signo contrario. |
| **Ejecutado** | Suma de los registros de costo del periodo, en la moneda del presupuesto. |
| **Comprometido** | Importe aún no recibido de OC aprobadas, emitidas o recibidas parcialmente (cantidad pendiente por precio). |
| **Disponible** | Vigente menos ejecutado menos comprometido. Puede ser negativo. |
| **Ejecución (%)** | (Ejecutado + comprometido) dividido entre el vigente. |
| **Proyección de cierre** | Ejecutado + comprometido + renovaciones y cuotas previstas hasta fin del año fiscal. |
| **Sobre-ejecución** | Ejecución mayor o igual a un umbral de la empresa (atención 80 %, excedido 100 %). |
| **Vida útil** | Meses durante los cuales se reparte el valor de un equipo. |
| **Valor residual** | Parte del costo que se supone queda al final de la vida útil (porcentaje del costo). |
| **Depreciación de gestión** | Reparto mensual del costo de un activo. **Es referencial, no contable ni tributaria.** |
| **Valor en libros referencial** | Costo menos depreciación acumulada. |
| **Cierre de periodo** | Congelar un mes: sus cifras ya no cambian. |

---

## 3. Roles y permisos

El acceso a cifras exige **dos permisos**: el de entrar al módulo (`presupuesto.ver`) y el sensible de ver precios (`precios.ver`, D-004.4). Alcance: **todo** o **solo mis centros de costo** (centros donde el usuario figura como responsable).

| Acción | Permiso (alcance) | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver presupuestos, ejecución, proyección y depreciación | `presupuesto.ver` (todo / mis centros) + `precios.ver` | Sí (todo) | Sí (todo) | No | No | No | Solo si el administrador activa precios |
| Crear y editar borradores de presupuesto o modificación | `presupuesto.crear` | Sí | Sí | No | No | No | No |
| Aprobar o rechazar presupuesto o modificación | `presupuesto.aprobar` (sensible) | Sí | Sí | No | No | No | No |
| Anular borrador, pendiente o rechazado | `presupuesto.anular` | Sí | Sí | No | No | No | No |
| Registrar gasto manual | `presupuesto.gasto_registrar` | Sí | Sí | No | No | No | No |
| Anular gasto manual | `presupuesto.gasto_anular` (sensible) | Sí | Sí | No | No | No | No |
| Reclasificar un costo (cambiar centro de costo o rubro) | `presupuesto.reclasificar` (sensible) | Sí | Sí | No | No | No | No |
| Cerrar un periodo mensual | `presupuesto.cerrar_periodo` (sensible) | Sí | Sí | No | No | No | No |
| Configurar vida útil, residual, umbrales, año fiscal | `presupuesto.configurar` (sensible) | Sí | No | No | No | No | No |
| Exportar cifras | `reportes.exportar` (sensible, ver REP) | Sí | No (activable) | No | No | No | No |

Notas
- El **responsable de un centro de costo** no es un rol: es un usuario designado en el centro. Recibe alertas aunque no tenga `presupuesto.ver`; sin ese permiso la alerta no trae importes.
- Todo rol nuevo parte sin permisos (D-004.5). Las reglas de separación de funciones aplican también al Administrador (D-004.8).
- Todas las comprobaciones se hacen en el servidor (regla 6 de `CLAUDE.md`).

---

## 4. Requisitos

### 4.1 Funcionales

| ID | Requisito | Etapa |
|---|---|---|
| RF-PRE-001 | Crear un presupuesto para un año fiscal, con nombre, moneda y líneas (centro de costo × rubro × monto anual). | PRE-A |
| RF-PRE-002 | Copiar un presupuesto anterior como base de uno nuevo (copia montos; el usuario puede ajustar un porcentaje general). | PRE-A |
| RF-PRE-003 | Enviar el presupuesto a aprobación; un aprobador distinto del creador lo aprueba o rechaza con motivo. | PRE-A |
| RF-PRE-004 | Modificar un presupuesto aprobado solo mediante una **modificación** (aumento, disminución o traspaso entre líneas) con motivo y aprobación. | PRE-A |
| RF-PRE-005 | Mostrar por centro de costo y rubro: original, vigente, ejecutado, comprometido, disponible y ejecución %. | PRE-A |
| RF-PRE-006 | Mostrar el detalle de cada cifra hasta el documento de origen (OC, recepción, contrato...), si el usuario tiene permiso sobre ese documento. | PRE-A |
| RF-PRE-007 | Reconocer como ejecutado el valor de cada recepción confirmada de OC (cantidad recibida × precio sin impuesto). | PRE-A |
| RF-PRE-008 | Reconocer como comprometido el valor pendiente de recibir de las OC aprobadas, emitidas o recibidas parcialmente. | PRE-A |
| RF-PRE-009 | Revertir el costo cuando una recepción se revierte (D-017) o cuando se cierra una OC con faltante (el comprometido pendiente se libera). | PRE-A |
| RF-PRE-010 | Reconocer el costo de OS cerradas que tengan costo (módulo de la Etapa 6). | PRE-A |
| RF-PRE-011 | Reconocer cada cuota o renovación de contratos, licencias, líneas, dominios y garantías/mantenimiento desde sus módulos, sin volver a capturarlos. | PRE-B |
| RF-PRE-012 | Registrar un gasto manual (rubro, centro de costo, fecha, importe, moneda, descripción, motivo); anularlo con otro registro. | PRE-A |
| RF-PRE-013 | Reclasificar un costo a otro centro de costo o rubro, con motivo; se genera un registro contrario y uno nuevo. | PRE-A |
| RF-PRE-014 | Alertar por correo y en pantalla cuando la ejecución llegue a los umbrales de atención y excedido, por línea, por centro y por presupuesto total. | PRE-A |
| RF-PRE-015 | Al aprobar una OC, mostrar al aprobador el efecto en el presupuesto del centro de costo ("quedaría en 112 %") y exigir una justificación escrita si lo excede; no bloquea. | PRE-A |
| RF-PRE-016 | Cerrar un periodo mensual: congela ejecutado, comprometido y depreciación de ese mes. | PRE-A |
| RF-PRE-017 | Proyección de renovaciones de los próximos 12 meses por mes, rubro y moneda, a partir de los vencimientos y del último importe conocido. | PRE-B |
| RF-PRE-018 | Permitir un porcentaje de incremento esperado por rubro para la proyección (por defecto 0 %). | PRE-B |
| RF-PRE-019 | Plan de reposición: activos que llegan al fin de su vida útil en los próximos 12 y 24 meses, con costo estimado igual al último precio de compra del mismo SKU (o el costo original). | PRE-B |
| RF-PRE-020 | Configurar por categoría: método (línea recta o sin depreciación), vida útil en meses y valor residual en porcentaje. Las subcategorías heredan y pueden cambiar. | PRE-B |
| RF-PRE-021 | Calcular la depreciación mensual y el valor en libros referencial de cada activo con serie y costo conocido. | PRE-B |
| RF-PRE-022 | Listar activos "sin costo" y categorías "sin parámetros", para completarlos. | PRE-B |
| RF-PRE-023 | Mostrar siempre los totales **por moneda**; nunca sumar monedas distintas (ver RN-PRE-004). | PRE-A |
| RF-PRE-024 | Foto anual: comparar el año fiscal con el anterior (ejecutado por rubro y centro), por moneda. | PRE-B |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-PRE-001 | Un presupuesto tiene una sola moneda (código de 3 letras, D-014). Todas sus líneas están en esa moneda. |
| RN-PRE-002 | Solo puede haber un presupuesto aprobado por empresa, año fiscal y moneda. |
| RN-PRE-003 | Un costo se compara solo con el presupuesto de su misma moneda. Si no hay presupuesto en esa moneda, el costo aparece como "Gasto sin presupuesto en <moneda>". |
| RN-PRE-004 | No hay conversión de monedas. En reportes con varias monedas se muestra un bloque o una fila por moneda y **no existe "total general"**. |
| RN-PRE-005 | Quien creó o editó un presupuesto o una modificación no puede aprobarlo. Aplica a todos los roles, incluido el Administrador. |
| RN-PRE-006 | La excepción de empresa con una sola persona de TI (D-015.4) **[SUPUESTO]** también cubre la aprobación de presupuestos; muestra aviso visible y cada uso queda en la auditoría. |
| RN-PRE-007 | Quien registra un gasto manual no puede anularlo ni reclasificarlo. |
| RN-PRE-008 | Un presupuesto aprobado no se edita: se modifica solo con una modificación aprobada (el original se conserva). |
| RN-PRE-009 | Los registros de costo no se editan ni se borran. Las correcciones son registros contrarios con motivo (D-019). |
| RN-PRE-010 | El costo se mide **sin impuesto** por defecto. Qué impuestos cuentan como costo lo decide contabilidad (**[ESCALAR AL CEO]**, S-PRE-02). |
| RN-PRE-011 | Ejecutado de una OC = cantidad recibida confirmada × precio unitario sin impuesto, en la fecha de la recepción. |
| RN-PRE-012 | Una OC en Borrador, Pendiente de aprobación, Rechazada o Anulada no cuenta como comprometido. |
| RN-PRE-013 | Cada costo entra a PRE desde **una sola fuente**. Si una renovación se compra con OC, cuenta la OC; el contrato o licencia guarda solo la referencia. |
| RN-PRE-014 | Un costo sin centro de costo se asigna a "Sin centro de costo" y genera aviso a Jefatura TI. |
| RN-PRE-015 | El costo se imputa al mes de su fecha. Si ese mes ya está cerrado, se imputa al primer mes abierto y se marca "imputado por cierre". |
| RN-PRE-016 | Un periodo cerrado no se reabre. Las correcciones entran en el mes abierto, con motivo. |
| RN-PRE-017 | Los umbrales de alerta los fija cada empresa; por defecto 80 % (atención) y 100 % (excedido); el de excedido no puede ser menor que el de atención. |
| RN-PRE-018 | Cada umbral avisa una sola vez por línea mientras se mantenga superado. Si el vigente sube y la ejecución baja del umbral, se rearma. |
| RN-PRE-019 | La alerta es informativa: **no bloquea** compras ni recepciones. |
| RN-PRE-020 | Cuota mensual de depreciación = (costo − valor residual) ÷ vida útil en meses, redondeada a 2 decimales; la última cuota absorbe la diferencia para que el total sea exacto. |
| RN-PRE-021 | Valor residual = costo × porcentaje residual de la categoría (de 0 % a 90 %). |
| RN-PRE-022 | La depreciación empieza el mes siguiente a la recepción y termina al completar la vida útil o en el mes de baja o de extravío. |
| RN-PRE-023 | Un activo "Extraviado o robado" o "De baja" deja de depreciarse desde ese mes. Si se reingresa (D-009), reanuda con los meses que le faltaban. |
| RN-PRE-024 | Cada activo guarda al ingresar una copia de sus parámetros (vida útil, residual, método). Cambiar la categoría después solo afecta a activos nuevos. |
| RN-PRE-025 | Reevaluar la vida útil de activos existentes es una acción aparte, con motivo y permiso; aplica hacia adelante desde el siguiente mes abierto y no reescribe meses cerrados. |
| RN-PRE-026 | Los SKU controlados por cantidad no se deprecian (no hay unidad individual); su compra cuenta como gasto del periodo. **[SUPUESTO]** |
| RN-PRE-027 | Un activo sin costo (por ejemplo, cargado del Excel) no se deprecia y aparece en la lista "sin costo". |
| RN-PRE-028 | Todo importe de depreciación, valor en libros y proyección lleva la leyenda "Referencial de gestión; no sustituye la contabilidad". |
| RN-PRE-029 | Un centro de costo desactivado conserva sus líneas e historial; no se le pueden cargar costos nuevos. Los costos nuevos de un documento viejo van a "Sin centro de costo". |
| RN-PRE-030 | Un identificador de otra empresa responde "no encontrado". Ningún cálculo mezcla empresas. |

### 4.3 Calidad medible

| ID | Requisito |
|---|---|
| RNF-PRE-001 | Con 100 000 registros de costo en la empresa, la pantalla de ejecución carga en 3 segundos o menos (percentil 95). |
| RNF-PRE-002 | Un costo nuevo (recepción confirmada) se refleja en la ejecución en 1 minuto o menos. |
| RNF-PRE-003 | La alerta de umbral sale en 5 minutos o menos tras superar el umbral. |
| RNF-PRE-004 | El cierre mensual de una empresa con 100 000 activos termina en 60 segundos o menos o muestra avance. |
| RNF-PRE-005 | Los importes se guardan como decimales exactos con 4 decimales y se muestran con 2 (D-014.3). |
| RNF-PRE-006 | Sumar las cuotas de depreciación de un activo da exactamente costo menos residual (prueba automática con 1 000 casos). |
| RNF-PRE-007 | Cada cifra del tablero se puede reconstruir sumando sus registros de costo (diferencia cero). |
| RNF-PRE-008 | Cada tabla nueva lleva su prueba de aislamiento entre empresas (D-025). |

---

## 5. Estados y transiciones

**Presupuesto**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Borrador | `presupuesto.crear` | Moneda y año definidos |
| Borrador | Pendiente de aprobación | Quien lo creó | Al menos una línea; montos mayores o iguales a 0 |
| Pendiente de aprobación | Aprobado | `presupuesto.aprobar`, distinto del creador | RN-PRE-002 y RN-PRE-005 |
| Pendiente de aprobación | Rechazado | `presupuesto.aprobar`, distinto del creador | Motivo obligatorio |
| Rechazado | Borrador | Quien lo creó | Conserva el motivo visible |
| Pendiente de aprobación | Borrador | Quien lo creó | Retira el envío; queda en auditoría |
| Borrador / Pendiente / Rechazado | Anulado | `presupuesto.anular` | Motivo obligatorio; final |
| Aprobado | Cerrado | Automático al cerrar el último mes del año, o `presupuesto.cerrar_periodo` | Solo con todos los meses cerrados; final |

**Modificación presupuestaria:** Borrador → Pendiente de aprobación → Aprobada o Rechazada; Rechazada → Borrador; Borrador/Pendiente/Rechazada → Anulada (motivo). Misma regla de aprobador. Una modificación Aprobada ya no cambia.

**Periodo mensual:** Abierto → Cerrado (`presupuesto.cerrar_periodo`; solo se cierra el mes más antiguo abierto; el mes en curso no se cierra antes de terminar). No hay reapertura.

**Gasto manual:** Vigente → Anulado (`presupuesto.gasto_anular`, otra persona, motivo). Final.

**Depreciación de un activo (estado calculado):** Sin parámetros · Sin costo · En depreciación · Totalmente depreciado · Detenida (baja o extravío). Cambia sola según el estado del activo (D-012); nadie la edita.

---

## 6. Datos

| Entidad | Campos principales (lenguaje simple) | Clave y unicidad | Se audita |
|---|---|---|---|
| Presupuesto | empresa, nombre, año fiscal, moneda, estado, creado por, aprobado por, motivo de rechazo | Único por empresa + año + moneda mientras esté Aprobado | Altas, cambios con antes/después, aprobación, rechazo, anulación |
| Línea de presupuesto | presupuesto, centro de costo, rubro, monto anual | Única por presupuesto + centro + rubro | Cambios con antes/después |
| Modificación | presupuesto, tipo, estado, motivo, creado por, aprobado por; líneas con monto (+/-) | Número correlativo por empresa (D-007.8) | Todo cambio de estado |
| Registro de costo | empresa, origen (OC, recepción, contrato, licencia, línea, dominio, garantía, OS, manual, reclasificación), id de origen, fecha, periodo, centro de costo, rubro, importe sin impuesto, impuesto informativo, moneda, motivo | Único por origen + id de origen + tipo de hecho (evita duplicar) | Cada alta; nunca se edita |
| Comprometido | se calcula en vivo desde OC; no se guarda | n/a | n/a |
| Gasto manual | empresa, fecha, descripción, importe, moneda, centro, rubro, motivo, registrado por, estado | Correlativo por empresa | Alta y anulación |
| Parámetros de depreciación | categoría, método, vida útil (meses), residual (%), vigente desde | Una vigente por empresa + categoría | Cambios con antes/después |
| Depreciación del activo | activo, costo, moneda, fecha de inicio, copia de parámetros, estado calculado | Una por activo | Reevaluaciones |
| Cuota de depreciación | activo, mes, importe, moneda | Única por activo + mes | Se congela al cerrar el mes |
| Periodo | empresa, año, mes, estado, cerrado por, cerrado el | Único por empresa + año + mes | Cierre |
| Configuración de presupuesto | mes de inicio del año fiscal, umbrales, incrementos por rubro, uso de la excepción de aprobación | Una por empresa | Cambios con antes/después |
| Alerta emitida | línea, umbral, ejecución en ese momento, destinatarios, fecha | Única por línea + umbral + rearme | Alta |
| Centro de costo (catálogo del núcleo) | agrega: usuario responsable opcional y código externo | Único por empresa | Cambios |

Todo dato lleva la empresa (regla 5 de `CLAUDE.md`). Las alertas y exportaciones no incluyen datos personales.

---

## 7. Pantallas necesarias

| Pantalla | Propósito | Rol principal |
|---|---|---|
| Lista de presupuestos | Ver presupuestos por año y moneda, con estado | Jefatura TI |
| Editor de presupuesto | Matriz centro de costo × rubro con montos; copiar del año anterior | Jefatura TI |
| Ejecución del presupuesto | Original, vigente, ejecutado, comprometido, disponible, semáforo con texto (no solo color) | Jefatura TI, responsable de centro |
| Detalle de costos | Registros de costo con filtros y enlace al documento de origen | Jefatura TI |
| Modificaciones | Crear, enviar y aprobar modificaciones | Jefatura TI |
| Gasto manual | Registrar, anular y reclasificar | Jefatura TI |
| Proyección de renovaciones | Próximos 12 meses por mes, rubro y moneda | Jefatura TI |
| Plan de reposición | Activos que llegan al fin de vida útil y costo estimado | Jefatura TI |
| Depreciación | Por categoría y por activo; valor en libros referencial; listas "sin costo" y "sin parámetros" | Jefatura TI, Administrador |
| Cierre de periodo | Lista de meses, vista previa de cifras y botón de cierre | Jefatura TI |
| Configuración | Año fiscal, umbrales, parámetros por categoría, incrementos | Administrador |
| Aviso en la aprobación de OC | Panel dentro de la pantalla de aprobación con el efecto en el presupuesto | Aprobador de OC |

---

## 8. Notificaciones y automatismos

| Cuándo | A quién | Qué dice |
|---|---|---|
| Presupuesto o modificación pasa a Pendiente | Usuarios con `presupuesto.aprobar` | "El presupuesto 2027 (USD) espera su aprobación." |
| Se aprueba o rechaza | Quien lo creó | Resultado y motivo |
| Ejecución llega a 80 % | Responsable del centro y Jefatura TI | "Laptops en Soporte: 80 % ejecutado." |
| Ejecución llega a 100 % | Los mismos | "Laptops en Soporte superó su presupuesto." |
| Proyección de cierre supera 100 % | Jefatura TI (una vez al mes) | "Al ritmo actual, Celulares cerraría en 118 %." |
| OC aprobada que excede el presupuesto | Responsable del centro | "OC-0042 deja Periféricos en 112 %. Justificación: ..." |
| Costo sin centro de costo | Jefatura TI (resumen semanal) | "5 costos sin centro de costo." |
| Faltan 5 días para fin de mes | Quienes tengan `presupuesto.cerrar_periodo` | "Recuerde cerrar el mes anterior." |
| Categoría sin parámetros o activo sin costo | Administrador (resumen mensual) | "12 activos sin costo y 2 categorías sin vida útil." |

Automatismos: cada noche se actualizan comprometido y alertas (el costo de recepción se refleja de inmediato, RNF-PRE-002). El envío usa el servicio de notificaciones (escuadrón C).

---

## 9. Integración con el núcleo y con otros módulos

- **Núcleo:** empresa y zona horaria; usuarios y roles; auditoría (D-018); catálogo de centros de costo y categorías; costo y moneda del activo (D-014.5); líneas de OC con impuesto por línea; recepción (D-016, D-017); estados del activo (D-012); baja y reingreso (D-009).
- **Pedidos al núcleo (marcados [SUPUESTO] hasta confirmar):** la OC lleva **centro de costo**; el centro de costo admite **usuario responsable** y **código externo**; el costo del activo puede completarse después con permiso, motivo y auditoría (para activos del Excel).
- **proveedores-contratos y garantias-mantenimiento (A)** (confirmado por mensaje): cada contrato guarda proveedor, moneda, valor del periodo sin impuesto, frecuencia, inicio, fin y centro de costo; las fechas de cobro **no se guardan, se derivan** de inicio más frecuencia. Renovaciones y adendas son filas de historial. El contrato y la renovación tienen "OC relacionada" (opcional) y la marca "costo ya registrado por OC". Garantía extendida y mantenimiento sin OS guardan costo y moneda; si hay OS, el costo vive en la OS.
- **licencias-software, lineas-moviles, dominios-certificados (B)** (confirmado por mensaje): guardan importe sin impuesto, % de impuesto, moneda, periodicidad (mensual, anual, única), fechas de inicio y vencimiento y centro de costo, y exponen un "costo mensual equivalente". Cada registro tiene "orden de compra vinculada" (opcional): si existe, cuenta la OC (RN-PRE-013); si no, queda marcado "sin orden de compra".
- **Órdenes de servicio (Etapa 6):** PRE lee el costo de las OS cerradas.
- **reportes-tableros (REP):** REP muestra las cifras y usa las definiciones de este módulo; no las recalcula distinto.
- **integraciones-api (INT):** el código externo del centro de costo sirve para la exportación hacia SAP; la API puede leer presupuestos solo con el alcance `precios` y `presupuesto:lectura`.
- **notificaciones (C):** envío de alertas y avisos.

---

## 10. Criterios de aceptación

**CA-PRE-01 Presupuesto con una moneda.** Dado que existe un presupuesto 2027 en USD, cuando el usuario intenta agregar una línea en PEN, entonces el sistema la rechaza con el mensaje "El presupuesto es en USD".

**CA-PRE-02 Aprobación con separación de funciones.** Dado que Ana creó el presupuesto y lo envió a aprobación, cuando Ana intenta aprobarlo, entonces el sistema lo impide aunque sea Administradora; cuando lo aprueba Luis (Jefatura TI), entonces pasa a Aprobado y queda en la auditoría quién aprobó y cuándo.

**CA-PRE-03 Costo desde recepción.** Dado una OC de 10 laptops a 1 200,00 USD sin impuesto con centro "Soporte", cuando se confirma la recepción de 4, entonces el ejecutado de Laptops en Soporte sube 4 800,00 USD y el comprometido es 7 200,00 USD.

**CA-PRE-04 Reversión.** Dado esa recepción de 4, cuando se revierte según D-017, entonces el ejecutado baja 4 800,00 USD mediante un registro contrario y el registro original sigue visible.

**CA-PRE-05 Varias monedas.** Dado costos en USD y PEN en el mismo año, cuando se abre el reporte de ejecución, entonces se muestran dos bloques (uno por moneda), no aparece "total general" y la exportación trae una columna "Moneda".

**CA-PRE-06 Alerta única.** Dado una línea con presupuesto de 10 000,00 y ejecución de 7 900,00, cuando entra un costo de 200,00, entonces se envía una alerta de atención (80 %) al responsable; cuando entra otro costo de 100,00, entonces no se envía otra alerta de atención.

**CA-PRE-07 Aviso en la aprobación de OC.** Dado que la OC-0042 dejaría Periféricos en 112 %, cuando el aprobador la abre, entonces ve el aviso y debe escribir una justificación para aprobarla; la OC no se bloquea.

**CA-PRE-08 Depreciación exacta.** Dado una laptop de 1 200,00 USD, vida útil 36 meses, residual 10 %, recibida el 15 de marzo, cuando se calcula, entonces la cuota es 30,00 USD desde abril, la suma de las 36 cuotas es 1 080,00 y el valor en libros final es 120,00.

**CA-PRE-09 Cierre de periodo.** Dado que enero está cerrado, cuando se confirma una recepción con fecha de enero, entonces el costo se imputa a febrero (mes abierto) con la marca "imputado por cierre" y las cifras de enero no cambian.

**CA-PRE-10 Aislamiento entre empresas.** Dado que el usuario de la empresa A conoce el identificador de un presupuesto de la empresa B, cuando intenta abrirlo, entonces recibe "no encontrado" y sus totales nunca incluyen datos de B.

**CA-PRE-11 Permiso denegado.** Dado un Técnico sin `presupuesto.ver`, cuando intenta abrir la ejecución o llamar a la acción desde otra dirección, entonces el servidor responde acceso denegado y se registra el intento.

**CA-PRE-12 Precios ocultos.** Dado un usuario de Solo lectura con `presupuesto.ver` pero sin `precios.ver`, cuando abre el módulo, entonces no ve importes y se le indica que no tiene permiso para ver precios.

**CA-PRE-13 Baja detiene la depreciación.** Dado un activo en depreciación, cuando se da de baja en junio, entonces la última cuota es la de junio; si se reingresa en octubre, la depreciación continúa con los meses pendientes.

---

## 11. Casos límite

1. Activo recibido el último día del mes: empieza a depreciarse el mes siguiente, igual que uno recibido el día 1.
2. OC cerrada con faltante: el comprometido de lo no recibido se libera en el mismo acto.
3. OC editada después de aprobada (vuelve a Pendiente, D-013.5): mientras no se reapruebe deja de contar como comprometida.
4. OC en moneda distinta de todo presupuesto: aparece en "Gasto sin presupuesto en <moneda>".
5. Presupuesto aprobado a mitad de año: los costos anteriores a la aprobación se cuentan igual (la ejecución es del año fiscal completo).
6. Año fiscal que no coincide con el calendario (por ejemplo abril a marzo): los periodos y la depreciación siguen los meses de ese año.
7. Cambio de la vida útil de una categoría con activos existentes: no los afecta (RN-PRE-024).
8. Activo con costo cero (donación): se deprecia como cero y se marca "costo cero"; no entra en "sin costo".
9. Costo del activo corregido después de cerrar meses: el cambio aplica desde el mes abierto; los meses cerrados no se reescriben.
10. Responsable de centro de costo dado de baja: las alertas van a Jefatura TI y se avisa al Administrador.
11. Contrato en una moneda y centro de costo con presupuesto en otra: se muestra sin presupuesto en esa moneda.
12. Vida útil de 1 mes: la única cuota es costo menos residual.
13. Tres centros comparten un mismo gasto: se registran tres gastos manuales; PRE no prorratea.
14. Dos personas cierran el mismo mes a la vez: solo se registra un cierre; el segundo recibe "ya cerrado".

---

## 12. Decisiones propuestas y supuestos

| ID | Tipo | Propuesta y motivo |
|---|---|---|
| S-PRE-01 | [SUPUESTO] | Módulo posterior a la v1, después de la Etapa 5, en dos entregas. Motivo: depende de compras y de módulos nuevos. |
| S-PRE-02 | [ESCALAR AL CEO] | **Impuestos como costo.** El costo se mide sin impuesto. Si el impuesto de compras (IGV, IVA) se recupera o se capitaliza depende del país y de contabilidad. Hasta que contabilidad lo confirme, se usa "sin impuesto". |
| S-PRE-03 | [ESCALAR AL CEO] | **Tratamiento contable y tributario de la depreciación:** tasas o vidas útiles legales, umbral desde el cual un bien se capitaliza, inclusión de fletes e instalación, revaluación. La plataforma entrega depreciación **referencial de gestión**; si el CEO quiere usarla en libros o impuestos, contabilidad o legal fija las reglas antes. Mientras tanto, no se prellenan vidas útiles. |
| S-PRE-04 | [ESCALAR AL CEO] | **Totales en una sola moneda** (consolidado de empresas con varias monedas) exigiría un tipo de cambio oficial y una política de contabilidad (y quizá una fuente de pago). Queda fuera; se muestran bloques por moneda. |
| S-PRE-05 | [SUPUESTO] | Año fiscal enero-diciembre, con mes de inicio configurable. |
| S-PRE-06 | [SUPUESTO] | El presupuesto es anual (sin reparto mensual); la vista mensual se calcula sobre lo ejecutado. Motivo: más simple; el reparto mensual se puede sumar después. |
| S-PRE-07 | [SUPUESTO] | Las alertas no bloquean compras; el aprobador de OC debe justificar si excede (sin segundo nivel de aprobación, D-015/D-023). |
| S-PRE-08 | [SUPUESTO] | Umbrales por defecto 80 % y 100 %. |
| S-PRE-09 | [SUPUESTO] | Línea recta es el único método; la depreciación empieza el mes siguiente a la recepción. Motivo: simple y explicable. |
| S-PRE-10 | [SUPUESTO] | Se congela la configuración del activo al ingresar (RN-PRE-024). Motivo: evita que cambiar un parámetro reescriba años de historia. |
| S-PRE-11 | [SUPUESTO] | El stock por cantidad no se deprecia (RN-PRE-026). |
| S-PRE-12 | [SUPUESTO] | La excepción de una sola persona de TI (D-015.4) también cubre presupuestos. Lo confirma el Gerente de TI. |
| S-PRE-13 | [SUPUESTO] | Los parámetros de depreciación y rubros fijos son del sistema; las empresas no crean rubros nuevos en la v1 del módulo. |

---

## 13. Fuera de alcance

- Contabilidad oficial, asientos, libros, declaración de impuestos.
- Conversión de monedas y consolidado en una moneda (S-PRE-04).
- Métodos de depreciación acelerada o por unidades de uso.
- Reparto mensual o trimestral del presupuesto (S-PRE-06).
- Prorrateo automático de un gasto entre centros de costo.
- Aprobación de presupuesto en varios niveles (D-023).
- Pagos, facturas de proveedores, conciliación bancaria.
- Bloqueo automático de compras por falta de presupuesto.
- Presupuesto de personal o de proyectos que no sean compras y servicios de TI.
- Adjuntos de sustento (D-022).
