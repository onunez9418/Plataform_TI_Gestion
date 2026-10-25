# Módulo: Proveedores y contratos (PRV)

**Slug:** `proveedores-contratos` · **Sigla:** PRV · **Versión:** 0.1 (borrador del analista funcional, Oleada B)
**Base:** `docs/equipo/decisiones.md` (D-001 a D-029, vinculantes) y `docs/documento-funcional.md` v0.1.
**Marcas:** **[SUPUESTO]** = propuesta del analista que el Gerente de TI confirma. **[ESCALAR AL CEO]** = implica dinero, tema legal o algo irreversible.

---

## 1. Propósito, alcance y fase

**Propósito.** Que el área de TI sepa en un solo lugar a quién le compra, a quién le contrata servicios, qué contratos tiene firmados, hasta cuándo valen, qué nivel de servicio prometió cada proveedor y cuándo hay que actuar (renovar o avisar que no se renueva) antes de perder dinero o quedarse sin soporte.

**Fases (propuesta).** Los avisos automáticos de vencimiento están fuera de la v1 (D-023), por eso el módulo se parte en dos:

| Parte | Qué contiene | Cuándo | Por qué |
|---|---|---|---|
| **Fase A** | Ficha ampliada del proveedor y contactos | Etapa 2 (catálogos) y Etapa 5 (compras) | La orden de compra y la orden de servicio ya necesitan proveedor (D-008, D-013, D-027). |
| **Fase B** | Contratos, renovaciones, SLA, documentos de referencia, alertas | Después de la v1 (propuesta: tras la Etapa 7, con demo y aprobación del CEO) | Es valor agregado que no bloquea la operación diaria. |

**Entra en este módulo**
1. Proveedores (extienden el catálogo "proveedor" de D-008; es la misma lista, no una segunda).
2. Contactos de cada proveedor.
3. Contratos con vigencia, renovación (manual o automática), cambios de condiciones, terminación y anulación.
4. Compromisos de servicio (SLA) del proveedor, siempre dentro de un contrato.
5. Documentos de referencia (datos de dónde está el documento; no el archivo).
6. Alertas de vencimiento y de fecha límite para avisar la no renovación.
7. Activos cubiertos por un contrato (por ejemplo, "soporte de las 40 laptops Dell").

**No entra:** ver sección 13.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Proveedor** | Empresa o persona que vende bienes o presta servicios a la empresa. Es el mismo del catálogo (D-008). |
| **Contacto** | Persona del proveedor con quien se trata (comercial, soporte). No es Persona (quien recibe equipos) ni Usuario (quien entra a la plataforma). |
| **Identificación fiscal** | Número tributario del proveedor (RUC, NIT, RFC u otro según país). |
| **Contrato** | Acuerdo firmado con un proveedor por un periodo (soporte, licenciamiento, arrendamiento, telecomunicaciones, servicio administrado, acuerdo marco). |
| **Vigencia** | Periodo entre la fecha de inicio y la de fin del contrato. El día de fin se cuenta completo. |
| **Renovación manual** | Al llegar el fin, alguien debe registrar la renovación; si no, el contrato queda Vencido. |
| **Renovación automática** | El contrato se renueva solo según su texto, salvo que se avise a tiempo que no se renueva. |
| **Preaviso** | Días de anticipación que el contrato exige para avisar que no se renovará. |
| **Fecha límite de preaviso** | Fecha de fin menos los días de preaviso. Pasada esa fecha, ya no se puede evitar la renovación. |
| **Adenda** | Cambio escrito a las condiciones de un contrato ya firmado (precio, fecha, alcance). |
| **SLA (acuerdo de nivel de servicio)** | Compromiso medible del proveedor, por ejemplo "responde en 4 horas a una falla crítica" o "disponibilidad 99,5 %". |
| **Responsable interno** | Usuario de la plataforma que cuida el contrato y recibe sus alertas. |
| **Valor del periodo** | Importe que se paga por cada periodo de facturación (sin impuesto). |
| **Valor total estimado** | Valor del periodo por la cantidad de periodos de la vigencia. Si la facturación es única, es el importe único. |
| **Documento de referencia** | Registro que dice qué documento es y dónde está guardado (carpeta física o enlace externo). No contiene el archivo (D-022). |
| **Por vencer** | Etiqueta calculada (no es un estado): faltan menos días que el umbral de alerta. |
| **Monto límite de aprobación** | El de D-015, configurado por cada empresa en su moneda base. |

## 3. Roles y permisos

Los roles son las plantillas de D-004; cada empresa las edita. "Todo" es el alcance completo; "Propio" son los contratos donde el usuario es responsable interno. Los importes se ven solo con el permiso sensible `precios.ver` (del núcleo, D-004.4).

| Acción | Permiso | Admin. | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver ficha básica del proveedor (nombre, tipo, estado) | `proveedores.ver` | Todo | Todo | Todo | Todo | Todo | Todo |
| Ver contactos | `proveedores.ver_contactos` | Todo | Todo | Todo | Todo | No | No |
| Crear y editar proveedor y contactos | `proveedores.crear_editar` | Sí | Sí | No | No | No | No |
| Desactivar y reactivar proveedor | `proveedores.desactivar` | Sí | Sí | No | No | No | No |
| Ver contratos y SLA (sin importes) | `contratos.ver` | Todo | Todo | Todo | No | No | Todo |
| Ver importes de contratos | `precios.ver` | Sí | Sí | No | No | No | No |
| Crear y editar contratos en Borrador | `contratos.crear_editar` | Sí | Sí | No | No | No | No |
| Activar contrato | `contratos.activar` | Sí | Sí | No | No | No | No |
| Renovar, registrar adenda, marcar "no renovar" | `contratos.renovar` | Sí | Sí | No | No | No | No |
| Terminar o anular contrato | `contratos.terminar_anular` | Sí | Sí | No | No | No | No |
| Gestionar SLA | `sla.gestionar` | Sí | Sí | No | No | No | No |
| Gestionar documentos de referencia | `referencias.gestionar` | Sí | Sí | Sí | No | No | No |
| Recibir alertas de contratos | `contratos.recibir_alertas` | Todo | Todo | Propio | No | No | No |
| Exportar listas | `exportar` (núcleo) | Sí | No | No | No | No | No |
| Ver actividad (auditoría) del módulo | `auditoria.ver` (núcleo) | Sí | Sí | No | No | No | No |

Reglas de la matriz
- El permiso para crear proveedores es distinto del de crear órdenes de compra (D-015.5).
- Todo permiso se comprueba en el servidor (CLAUDE.md, regla 6).
- Nadie se asigna permisos a sí mismo ni crea un rol con más permisos que el suyo (D-004.6).

## 4. Requisitos

Etapa: **A** = Fase A, **B** = Fase B (sección 1).

### 4.1 Requisitos funcionales

| ID | Requisito | Fase |
|---|---|---|
| RF-PRV-001 | Registrar un proveedor con razón social, nombre comercial, identificación fiscal, país, si vende bienes, si presta servicios, sitio web y notas. | A |
| RF-PRV-002 | Editar un proveedor; los cambios en razón social e identificación fiscal quedan en la auditoría con valor anterior y nuevo. | A |
| RF-PRV-003 | Desactivar y reactivar un proveedor con motivo obligatorio. | A |
| RF-PRV-004 | Lista de proveedores con buscador (nombre, identificación fiscal), filtros (estado, vende bienes, presta servicios, país) y exportación (D-021.3). | A |
| RF-PRV-005 | Registrar contactos de un proveedor: nombre, cargo, rol (Comercial, Soporte técnico, Facturación, Escalamiento), correo, teléfono laboral; marcar un contacto principal. | A |
| RF-PRV-006 | Desactivar un contacto sin borrarlo. | A |
| RF-PRV-007 | Ficha del proveedor con resumen: contratos, órdenes de compra y de servicio abiertas, últimos movimientos. | A |
| RF-PRV-008 | Registrar un contrato en Borrador: proveedor, tipo, título, número del contrato del proveedor, objeto, fechas de firma, inicio y fin, tipo de renovación, preaviso, moneda, valor del periodo, frecuencia de facturación, centro de costo y responsable interno. | B |
| RF-PRV-009 | Asignar número interno correlativo por empresa (`CTR-0001`) con el mecanismo de D-007.8. | B |
| RF-PRV-010 | Activar un contrato (pasa a Programado o Vigente) cumpliendo la regla de segunda persona cuando corresponda. | B |
| RF-PRV-011 | Renovar un contrato (nueva fecha de fin y, si cambia, nuevo valor), guardando la fecha de fin anterior. | B |
| RF-PRV-012 | Renovación automática: el sistema extiende la vigencia al llegar el fin, salvo que el contrato esté marcado "no renovar". | B |
| RF-PRV-013 | Marcar un contrato "no renovar" (con fecha y motivo) y deshacer la marca mientras no haya pasado el fin. | B |
| RF-PRV-014 | Registrar una adenda: cambio de valor, fecha de fin o alcance, con descripción y fecha de la adenda. | B |
| RF-PRV-015 | Revertir una renovación registrada por error, con motivo, si no hay cambios posteriores. | B |
| RF-PRV-016 | Terminar un contrato antes de su fin, con fecha efectiva y motivo. | B |
| RF-PRV-017 | Anular un contrato registrado por error, con motivo. | B |
| RF-PRV-018 | Pasar a Vencido, automáticamente, el contrato Vigente cuyo fin ya pasó y no se renovó. | B |
| RF-PRV-019 | Vincular activos (unidades con serie) cubiertos por el contrato: uno por uno o por filtro (SKU, categoría, ubicación). | B |
| RF-PRV-020 | Registrar compromisos SLA dentro de un contrato: nombre, prioridad, métrica, objetivo, horario de cobertura, consecuencia pactada (texto). | B |
| RF-PRV-021 | Registrar documentos de referencia de un proveedor o contrato: tipo, título, número, fecha, dónde está, quién lo custodia. | B |
| RF-PRV-022 | Lista de contratos con filtros (estado, proveedor, tipo, responsable, "por vencer en N días", "fecha límite de preaviso próxima") y exportación. | B |
| RF-PRV-023 | Bandeja "Pendientes de activación" para quien puede activar contratos. | B |
| RF-PRV-024 | Configurar por empresa los días de alerta y los tipos de contrato. | B |
| RF-PRV-025 | En la orden de compra o de servicio a un proveedor, mostrar (solo informativo) los contratos Vigentes de ese proveedor. | B |
| RF-PRV-026 | Mostrar al elegir un proveedor con SLA vigente el SLA aplicable, para las órdenes de servicio (ver sección 9). | B |
| RF-PRV-027 | Historial del contrato: todo cambio de estado, renovación, adenda y alerta enviada, con quién y cuándo. | B |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-PRV-001 | La identificación fiscal de un proveedor es única por empresa, sin espacios, guiones ni distinción de mayúsculas; puede quedar vacía solo con un aviso visible. |
| RN-PRV-002 | Al crear un proveedor con razón social casi igual a otra existente, se muestra un aviso con los parecidos; no se bloquea. |
| RN-PRV-003 | Un proveedor con historial no se borra: se desactiva (D-019). |
| RN-PRV-004 | No se puede desactivar un proveedor con contratos Pendiente de activación, Programado o Vigente, ni con órdenes de compra o de servicio no cerradas ni anuladas. |
| RN-PRV-005 | Un proveedor inactivo no se puede elegir en nuevas órdenes, contratos ni mantenimientos; sigue visible en el historial. |
| RN-PRV-006 | Esta fase no guarda datos bancarios del proveedor (reduce el riesgo de fraude por cambio de cuenta). |
| RN-PRV-007 | Un contacto guarda solo datos laborales: nombre, cargo, correo y teléfono laboral. No se guardan documento de identidad, dirección ni datos personales (alineado con D-006). |
| RN-PRV-008 | Un contacto necesita correo o teléfono; el correo no se repite dentro del mismo proveedor. |
| RN-PRV-009 | Un proveedor tiene como máximo un contacto principal activo. |
| RN-PRV-010 | La fecha de fin de un contrato no puede ser anterior a la de inicio. |
| RN-PRV-011 | Un contrato se crea solo con un proveedor activo y de la misma empresa. |
| RN-PRV-012 | Cada contrato tiene una sola moneda (código de 3 letras); no hay conversión (D-014). El importe siempre se guarda con su moneda y es mayor o igual a 0. |
| RN-PRV-013 | El importe se ingresa sin impuesto. |
| RN-PRV-014 | Valor total estimado = valor del periodo × número de periodos de facturación entre inicio y fin (redondeado hacia arriba); con facturación única, es el importe único. |
| RN-PRV-015 | Para pasar de Borrador a activo, el contrato necesita **segunda persona** si su valor total estimado, en la moneda base, supera el monto límite de aprobación (D-015). Un contrato en otra moneda siempre la necesita (D-014.6). |
| RN-PRV-016 | Cuando se exige segunda persona, quien activa no puede ser quien creó o editó el contrato, ni siquiera siendo Administrador (D-015.3). |
| RN-PRV-017 | La excepción por empresa de D-015.4 (una sola persona de TI) aplica igual a contratos: desactivada por defecto, con aviso visible y cada uso en la auditoría. |
| RN-PRV-018 | Para activar se exige responsable interno: un Usuario activo con permiso `contratos.ver`. |
| RN-PRV-019 | Un contrato activo no cambia valor, fechas ni alcance editando: esos cambios se hacen con renovación o adenda. Sí se editan responsable, notas y activos cubiertos. |
| RN-PRV-020 | Una renovación o una adenda que sube el valor total estimado o alarga el fin vuelve a aplicar RN-PRV-015 con las cifras nuevas. |
| RN-PRV-021 | La nueva fecha de fin de una renovación es posterior a la anterior; la anterior se conserva. |
| RN-PRV-022 | La renovación automática del sistema repite las condiciones vigentes, no pide segunda persona (ya se aprobó el contrato) y queda en la auditoría como acción del sistema. |
| RN-PRV-023 | Las condiciones nuevas del proveedor en una renovación automática (otro precio) se registran con una adenda; hasta entonces el sistema mantiene el valor anterior. |
| RN-PRV-024 | Renovar un contrato Vencido es posible; si la fecha de hoy es posterior al fin, el motivo es obligatorio y queda marcado "renovado con retraso". |
| RN-PRV-025 | Terminar o anular exige motivo. Terminado y Anulado son estados finales; no se reabren (se crea un contrato nuevo). |
| RN-PRV-026 | Solo se borra de verdad un contrato en Borrador que nunca se activó (D-019). |
| RN-PRV-027 | Un SLA pertenece a un contrato; solo se edita en Borrador o mediante adenda. No se repite la misma métrica con la misma prioridad en un contrato. |
| RN-PRV-028 | El objetivo de un SLA es mayor que 0; una disponibilidad está entre 0 y 100 %. |
| RN-PRV-029 | Un documento de referencia no guarda archivo (D-022). El enlace externo solo se acepta si empieza con `https://` y se muestra con la advertencia "enlace externo: la plataforma no controla quién lo abre". |
| RN-PRV-030 | Las fechas de contrato son fechas de calendario en la zona horaria de la empresa; un contrato está vigente hasta el final del día de su fecha de fin (D-021.4). |
| RN-PRV-031 | No se vinculan a un contrato activos De baja o Extraviado o robado; los ya vinculados quedan como historial. |
| RN-PRV-032 | Un identificador de otra empresa (proveedor, contrato, contacto, activo) responde "no encontrado" (D-021.5). |
| RN-PRV-033 | Los importes no aparecen en pantallas, exportaciones ni correos para quien no tenga `precios.ver`. |
| RN-PRV-034 | Los datos de contactos de un proveedor siguen el plazo de anonimización de D-024; no se activa ninguna anonimización antes de la confirmación legal. |
| RN-PRV-035 | El número interno del contrato no se reutiliza ni se edita (D-007). |
| RN-PRV-037 | Un contrato o una renovación puede indicar la orden de compra que lo originó (opcional, de la misma empresa). Con orden relacionada, el costo ya cuenta por la orden y el contrato queda marcado "costo ya registrado por OC" para que presupuesto no lo cuente dos veces. |
| RN-PRV-038 | Las fechas de cobro no se guardan: se derivan de la fecha de inicio y la frecuencia. Presupuesto solo lee proveedor, moneda, valor del periodo, frecuencia, fechas, centro de costo y la marca de RN-PRV-037. |
| RN-PRV-036 | Cada empresa define de 1 a 5 días de alerta (entre 1 y 365); los valores por defecto son 60, 30 y 7. |

### 4.3 Requisitos de calidad

| ID | Requisito medible |
|---|---|
| RNF-PRV-001 | Con 2 000 proveedores y 5 000 contratos por empresa, listas y buscador responden en menos de 2 segundos en el 95 % de las consultas. |
| RNF-PRV-002 | El proceso diario de vencimientos y alertas es repetible: ejecutarlo dos veces el mismo día no duplica avisos ni renovaciones. |
| RNF-PRV-003 | Las alertas del día salen dentro de 1 hora de la hora configurada (por defecto 08:00, hora local de la empresa). |
| RNF-PRV-004 | El 100 % de las altas, cambios, activaciones, renovaciones, terminaciones y anulaciones quedan en la auditoría en la misma operación (D-018). |
| RNF-PRV-005 | Toda tabla del módulo lleva empresa y tiene su prueba de aislamiento (D-025). |
| RNF-PRV-006 | La exportación de 5 000 contratos se entrega en menos de 30 segundos. |
| RNF-PRV-007 | Las pantallas se usan en tablet y celular; los estados se muestran con texto, no solo con color (D-021.1). |
| RNF-PRV-008 | Los mensajes de error no muestran datos internos ni importes a quien no los puede ver. |

## 5. Estados y transiciones

### 5.1 Proveedor

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Activo | `proveedores.crear_editar` | Razón social obligatoria. |
| Activo | Inactivo | `proveedores.desactivar` | Motivo; cumple RN-PRV-004. |
| Inactivo | Activo | `proveedores.desactivar` | Motivo. |

### 5.2 Contrato

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Borrador | `contratos.crear_editar` | Campos mínimos de RF-PRV-008. |
| Borrador | Pendiente de activación | Quien lo creó | Solo si aplica RN-PRV-015. |
| Borrador | Programado o Vigente | `contratos.activar` | Si no aplica segunda persona. Programado si el inicio es futuro. |
| Pendiente de activación | Programado o Vigente | `contratos.activar`, distinta persona | RN-PRV-016. |
| Pendiente de activación | Borrador | Quien puede activar | Devuelto con motivo. |
| Borrador | (borrado) | Quien lo creó | Solo si nunca se activó (RN-PRV-026). |
| Programado | Vigente | Sistema | Llega la fecha de inicio. |
| Vigente | Vigente | `contratos.renovar` o Sistema | Renovación (manual o automática). |
| Vigente | Vencido | Sistema | Pasó el fin sin renovación (manual o con marca "no renovar"). |
| Vencido | Vigente | `contratos.renovar` | RN-PRV-024. |
| Programado o Vigente | Terminado | `contratos.terminar_anular` | Fecha efectiva y motivo. |
| Programado, Vigente o Vencido | Anulado | `contratos.terminar_anular` | Motivo. |

No se permite ninguna otra transición. Terminado y Anulado son finales. **Por vencer** y **Fecha límite de preaviso próxima** son etiquetas calculadas, no estados.

## 6. Datos

Todo registro lleva empresa. Las claves internas no son consecutivas (D-019). Los importes siempre van con su moneda.

| Entidad | Campos principales (lenguaje simple) | Unicidad | Qué se audita |
|---|---|---|---|
| **Proveedor** (extiende el catálogo) | Razón social, nombre comercial, identificación fiscal, país, vende bienes (sí/no), presta servicios (sí/no), sitio web, notas, estado, motivo de baja | Identificación fiscal por empresa (RN-PRV-001) | Altas; cambios con antes y después; desactivación y reactivación. |
| **Contacto** | Proveedor, nombre, cargo, rol, correo, teléfono laboral, principal (sí/no), estado | Correo por proveedor | Altas, cambios, desactivación; consultas masivas por exportación. |
| **Tipo de contrato** (lista de la empresa) | Nombre, activo | Nombre por empresa | Altas y cambios. Valores iniciales: Soporte y mantenimiento, Licenciamiento o suscripción, Arrendamiento de equipos, Telecomunicaciones, Servicio administrado, Acuerdo marco, Otro. |
| **Contrato** | Número interno, número del proveedor, proveedor, tipo, título, objeto, fecha de firma, inicio, fin, renovación (Ninguna, Manual, Automática), meses por renovación automática, días de preaviso, marca "no renovar" (fecha, motivo), orden de compra relacionada (opcional), marca "costo ya registrado por OC", moneda, valor del periodo, frecuencia (Única, Mensual, Trimestral, Anual), centro de costo, responsable interno, estado, motivo de terminación o anulación | Número interno por empresa | Todo cambio de estado y de campo con antes y después; uso de la excepción D-015.4. |
| **Cambio de condiciones** | Contrato, tipo (Renovación, Renovación automática, Adenda, Terminación), fecha, fin anterior, fin nuevo, valor anterior, valor nuevo, descripción, quién, motivo, revertida (sí/no) | — | Todo (es historial que no se borra). |
| **Activo cubierto** | Contrato, activo, desde, hasta | Un activo una vez por contrato | Altas y bajas del vínculo. |
| **SLA** | Contrato, nombre, prioridad (Crítica, Alta, Media, Baja), métrica (Tiempo de respuesta en horas, Tiempo de resolución en horas, Disponibilidad en %), objetivo, cobertura (24x7 u horario escrito), consecuencia pactada | Contrato + métrica + prioridad | Altas y cambios. |
| **Documento de referencia** | Proveedor o contrato, tipo (Contrato firmado, Anexo, Adenda, Propuesta, SLA, Certificado, Otro), título, número, fecha, dónde está (texto o enlace https), custodio (texto) | — | Altas, cambios, desactivación. |
| **Alerta enviada** | Contrato, tipo de alerta, umbral, fecha, destinatarios | Contrato + tipo + umbral + vigencia | No es auditoría: evita duplicados y prueba que se avisó. |
| **Configuración de alertas** (por empresa) | Días de alerta de vencimiento, días de alerta de preaviso, hora de envío | Una por empresa | Cambios. |

Datos personales: solo los contactos (nombre, correo, teléfono laboral). Finalidad: comunicarse con el proveedor. Los ve quien tiene `proveedores.ver_contactos`.

## 7. Pantallas necesarias

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| P-PRV-01 | Lista de proveedores | Buscar, filtrar y exportar. | Jefatura TI |
| P-PRV-02 | Ficha del proveedor | Pestañas: datos, contactos, contratos, SLA, documentos, actividad. | Jefatura TI |
| P-PRV-03 | Alta y edición de proveedor | Registrar con aviso de parecidos. | Jefatura TI |
| P-PRV-04 | Lista de contratos | Filtros, etiquetas "por vencer" y "preaviso próximo". | Jefatura TI |
| P-PRV-05 | Ficha del contrato | Datos, historial, activos cubiertos, SLA, documentos. | Jefatura TI |
| P-PRV-06 | Alta y edición de contrato | Asistente en pasos (datos, condiciones económicas, cobertura, SLA). | Jefatura TI |
| P-PRV-07 | Diálogos de renovar, adenda, terminar, anular, "no renovar" | Cambios con motivo. | Jefatura TI |
| P-PRV-08 | Pendientes de activación | Bandeja para quien activa. | Jefatura TI |
| P-PRV-09 | Configuración de alertas y tipos de contrato | Ajustes de la empresa. | Administrador |
| P-PRV-10 | Panel "Vencimientos" | Recuadro de la pantalla de inicio de Jefatura (D-021.6): contratos por vencer y preaviso próximo. | Jefatura TI |

## 8. Notificaciones y automatismos

El envío lo hace el módulo de notificaciones (escuadrón C); aquí se fijan las reglas. Un proceso diario corre a la hora local de la empresa (RNF-PRV-003). Los umbrales son los de RN-PRV-036.

| Evento | Cuándo | A quién | Qué dice |
|---|---|---|---|
| Contrato por vencer | A cada umbral de días antes del fin, solo si está Vigente y no tiene renovación posterior | Responsable interno y quienes tienen `contratos.recibir_alertas` | "El contrato CTR-0012 con Dell vence el 30/11/2026 (faltan 30 días). Renovación: manual. Revíselo." |
| Fecha límite de preaviso próxima | A cada umbral antes de la fecha límite, contratos con renovación automática o preaviso | Igual que arriba | "Si no desea que CTR-0012 se renueve solo, avise al proveedor antes del 31/10/2026." |
| Contrato venció | El día siguiente al fin, sin renovación | Igual | "CTR-0012 venció el 30/11/2026. Renueve o termine el contrato." |
| Renovación automática hecha | Al ejecutarse | Responsable interno | "CTR-0012 se renovó solo hasta el 30/11/2027 con las mismas condiciones. Si el proveedor cambió el precio, registre una adenda." |
| Contrato pendiente de activación | Al enviarlo | Quienes tienen `contratos.activar`, excepto quien lo creó | "El contrato CTR-0015 espera su activación." |
| Contrato activado o devuelto | Al decidir | Quien lo creó | "Su contrato CTR-0015 fue activado" o "fue devuelto: <motivo>". |
| Responsable inactivo | Al desactivar un Usuario que es responsable de contratos Vigentes | Quienes tienen `contratos.activar` | "Los contratos CTR-0003 y CTR-0007 quedaron sin responsable. Asigne uno." |

Reglas
- Cada aviso se envía una vez por contrato, tipo y umbral; al renovar, los umbrales se reinician.
- Si no hay responsable, el aviso va a quienes tienen `contratos.recibir_alertas`.
- Los avisos no incluyen importes ni datos de contactos (RN-PRV-033).
- Las alertas por correo de esta fase quedan fuera de la v1 (D-023); en la v1 solo hay etiquetas y filtros en pantalla.

## 9. Integración con el núcleo y con otros módulos

| Con | Cómo |
|---|---|
| Catálogos (Etapa 2) | El proveedor es el del catálogo (D-008); este módulo le agrega campos. Centro de costo y moneda vienen del núcleo. |
| Órdenes de compra (Etapa 5) | La orden elige solo proveedores activos con "vende bienes". Crear proveedor es permiso distinto de crear órdenes (D-015.5). Se muestran contratos marco vigentes (informativo). |
| Órdenes de servicio (Etapa 6) | El responsable externo es un proveedor activo con "presta servicios" (D-027). Al cerrar una orden con SLA aplicable se muestra el tiempo real frente al objetivo, en horas corridas, solo como dato. |
| Inventario (Etapa 4) | Activos cubiertos por contrato; se ve el contrato en la ficha del activo. |
| Auditoría (Etapa 1) | Todo cambio usa el mecanismo general (D-018). |
| `garantias-mantenimiento` (GAR) | La garantía extendida y el mantenimiento pueden referir a un contrato y a un proveedor de PRV. PRV es dueño del proveedor y del contrato; GAR solo los referencia. |
| `licencias-software`, `lineas-moviles`, `dominios-certificados` (escuadrón B) | Acordado por mensaje: el proveedor (registrador, operador, fabricante) sale del catálogo de PRV; esos módulos guardan solo su derecho de uso y su vencimiento propio, y pueden enlazar un contrato de PRV de forma opcional. Soporte de software cubierto por contrato va en PRV. |
| `presupuesto-costos` (F) | Acordado por mensaje: PRV expone, solo para lectura, valor del periodo sin impuesto, moneda, frecuencia, fechas, centro de costo, proveedor, historial de renovaciones y la marca "costo ya registrado por OC" (RN-PRV-037). F proyecta renovaciones con el fin y el último importe. El presupuesto es de F. |
| `mesa-de-ayuda` (C) y `notificaciones` (C) | Ayuda usa el SLA como consulta; notificaciones envía los avisos. |
| `cmdb-ligera` (E) | Contrato y proveedor son datos que la CMDB puede relacionar con activos. |

## 10. Criterios de aceptación

| ID | Criterio |
|---|---|
| CA-PRV-01 | **Dado** un proveedor con identificación fiscal 20123456789 en la empresa A, **cuando** se crea otro con "20-123 456789", **entonces** se rechaza por repetido; en la empresa B sí se acepta. |
| CA-PRV-02 | **Dado** un contrato de la empresa A, **cuando** un usuario de la empresa B consulta su identificador, **entonces** recibe "no encontrado", igual que con un identificador inexistente. |
| CA-PRV-03 | **Dado** un Técnico sin `proveedores.crear_editar`, **cuando** intenta crear un proveedor (por pantalla o directo al servidor), **entonces** se rechaza y queda un intento denegado en la auditoría. |
| CA-PRV-04 | **Dado** un proveedor con un contrato Vigente, **cuando** se intenta desactivar, **entonces** se rechaza con el mensaje "Tiene el contrato CTR-0012 vigente". |
| CA-PRV-05 | **Dado** un contrato de USD 60 000 creado por Ana en una empresa con límite 50 000 USD, **cuando** Ana intenta activarlo, **entonces** se rechaza; **cuando** Luis (con `contratos.activar`) lo activa, **entonces** pasa a Vigente y se guarda quién y por qué valor. |
| CA-PRV-06 | **Dado** un contrato en EUR en una empresa con moneda base USD, **cuando** se crea con cualquier importe, **entonces** exige segunda persona. |
| CA-PRV-07 | **Dado** un contrato Vigente con fin 30/11/2026, **cuando** Luis lo renueva hasta 30/11/2027, **entonces** el fin nuevo es 30/11/2027, queda registrado el anterior y los umbrales de alerta se reinician. |
| CA-PRV-08 | **Dado** un contrato con renovación automática sin marca "no renovar", **cuando** pasa el fin, **entonces** el sistema lo renueva con las mismas condiciones, no cambia a Vencido y avisa al responsable. |
| CA-PRV-09 | **Dado** un contrato de renovación manual cuyo fin ya pasó, **cuando** corre el proceso diario, **entonces** pasa a Vencido y avisa; al correr de nuevo el mismo día no hay un segundo aviso. |
| CA-PRV-10 | **Dado** un usuario sin `precios.ver`, **cuando** abre la ficha de un contrato o lo exporta, **entonces** no ve importes ni en pantalla ni en el archivo. |
| CA-PRV-11 | **Dado** un documento de referencia, **cuando** se escribe un enlace `http://...`, **entonces** se rechaza; con `https://` se acepta y se muestra la advertencia de enlace externo. |
| CA-PRV-12 | **Dado** un SLA "Resolución, Crítica, 4 horas" en un contrato, **cuando** se agrega otro con la misma métrica y prioridad, **entonces** se rechaza como repetido. |
| CA-PRV-13 | **Dado** un contrato Vigente, **cuando** se intenta editar su fecha de fin directamente, **entonces** el sistema indica que debe usar renovación o adenda. |

## 11. Casos límite

1. Dos proveedores con la misma razón social y distinta identificación fiscal (sucursales): se permite con aviso.
2. Proveedor extranjero sin identificación fiscal: se permite vacío con aviso (RN-PRV-001).
3. Contrato con inicio y fin el mismo día: válido, dura un día completo.
4. Fin de contrato un 29 de febrero y renovación a un año: el nuevo fin es el 28 de febrero.
5. Renovación automática con marca "no renovar" puesta el mismo día del fin: se respeta la marca si se registró antes de que corra el proceso de ese día.
6. Dos personas activan el mismo contrato a la vez: solo una operación se aplica; la otra recibe "ya fue activado".
7. El responsable interno es dado de baja como Usuario: el contrato queda "Sin responsable" y se avisa (sección 8).
8. Contrato sin ningún activo cubierto (por ejemplo, un servicio general): válido.
9. Activo cubierto que luego se da de baja: el vínculo queda como historial y se marca "ya no existe cobertura".
10. Reversión de una renovación cuando ya hubo otra posterior: se rechaza; hay que revertir primero la última.
11. Contrato en Programado que se anula antes de empezar: permitido con motivo.
12. Dos alertas el mismo día (vencimiento y preaviso): se agrupan en un solo correo por destinatario.
13. Cambio de zona horaria de la empresa: las alertas futuras usan la nueva; las enviadas no se repiten.
14. Proveedor desactivado con contratos Terminados o Anulados: permitido.

## 12. Decisiones propuestas y supuestos

| ID | Propuesta | Motivo |
|---|---|---|
| S-PRV-01 | **[SUPUESTO]** El módulo se divide en Fase A (proveedor y contactos, Etapas 2 y 5) y Fase B (contratos, SLA, alertas, después de la v1). | D-023 deja fuera avisos de vencimiento de la v1, pero el proveedor sí se necesita desde compras. |
| S-PRV-02 | **[SUPUESTO]** El proveedor del catálogo y el de este módulo son la misma tabla. | Evita dos listas de proveedores. |
| S-PRV-03 | **[SUPUESTO]** La segunda persona para activar usa el monto límite de D-015 y su excepción. | Una sola regla de dinero para toda la plataforma. |
| S-PRV-04 | **[SUPUESTO]** La renovación automática la hace el sistema con las condiciones vigentes. | Refleja lo que ocurre en la realidad legal; la alerta de preaviso da tiempo de evitarla. |
| S-PRV-05 | **[SUPUESTO]** Los documentos de referencia son solo datos de ubicación; el archivo llega si el CEO habilita adjuntos (D-022). | D-022 difiere los archivos. |
| S-PRV-06 | **[SUPUESTO]** Un SLA siempre vive dentro de un contrato; las "condiciones generales" se registran como contrato de tipo Otro. | Menos entidades. |
| S-PRV-07 | **[SUPUESTO]** Los contactos de proveedor son datos laborales y no requieren `datos personales.ver`; Cumplimiento lo confirma. | Son datos de negocio. |
| S-PRV-08 | **[SUPUESTO]** Sin validación del dígito verificador de la identificación fiscal en esta fase. | Falta saber los países (insumo pendiente del CEO). |
| S-PRV-09 | **[SUPUESTO]** Sin datos bancarios de proveedores (RN-PRV-006). | Reduce riesgo de fraude. |
| S-PRV-10 | **[SUPUESTO]** Alertas por correo agrupadas en un solo mensaje diario por persona. | Evita saturar. |
| E-PRV-01 | **[ESCALAR AL CEO] (legal)** La plataforma registra datos del contrato, no tiene valor legal ni sustituye al documento firmado. Conviene que legal confirme esa frase en los términos de uso (D-024, escalado legal 3). | Evita que se entienda como respaldo jurídico. |
| E-PRV-02 | **[ESCALAR AL CEO] (legal)** Plazo de conservación y anonimización de los datos de contactos (D-024 pendiente de legal). | Dato personal de terceros. |
| E-PRV-03 | **[ESCALAR AL CEO] (dinero)** Guardar los archivos de contratos implica almacenamiento con costo mensual (D-022); se consultará al cierre de la Etapa 4. | Costo recurrente. |

## 13. Fuera de alcance

1. Archivos adjuntos de contratos y facturas (D-022).
2. Datos bancarios, pagos, facturas y cuentas por pagar.
3. Evaluación o calificación de proveedores.
4. Firma electrónica de contratos y flujo legal de redacción.
5. Cálculo de penalidades por incumplimiento de SLA; medición continua de disponibilidad.
6. Conversión de monedas.
7. Portal para que el proveedor entre a la plataforma.
8. Alertas por mensaje de texto o aplicación móvil.
9. Contratos de varias monedas o con varios proveedores en un mismo contrato.
10. Integración con SAP.
