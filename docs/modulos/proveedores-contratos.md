# Módulo: Proveedores y contratos (PRV)

**Slug:** `proveedores-contratos` · **Sigla:** PRV · **Versión:** 0.2 (corregida tras la revisión cruzada, Oleada D)
**Base:** `docs/equipo/decisiones.md` (D-001 a D-064, vinculantes), `docs/documento-funcional.md` y `docs/equipo/plan-correcciones.md`.
**Marcas:** **[SUPUESTO]** = propuesta del analista que el Gerente de TI confirma. **[ESCALAR AL CEO]** = implica dinero, tema legal o algo irreversible. "Cliente (CEO)" es quien pidió la plataforma.

---

## 1. Propósito, alcance y fase

**Propósito.** Que el área de TI sepa a quién le compra y a quién le contrata servicios, qué contratos tiene, hasta cuándo valen, qué compromiso de servicio asumió cada proveedor y cuándo actuar (renovar o avisar que no se renueva) antes de perder dinero o soporte.

| Parte | Qué contiene | Cuándo (D-056) |
|---|---|---|
| **PRV-A** | Proveedor ampliado y contactos: una sola tabla del núcleo desde la Etapa 2; la orden de compra y la de servicio la usan en las Etapas 5 y 6. | `v1, Etapa 2` |
| **PRV-B** | Contratos, renovaciones, compromisos de servicio, documentos de referencia y avisos de vencimiento. | `Fase 2`, ola B (después de NOT-completo y antes de GAR-B, LIC, LIN) |

**Entra:** proveedores (el mismo del catálogo, D-040.3); contactos; contratos con vigencia, renovación, cambios, terminación y anulación; compromisos de servicio; documentos de referencia; activos cubiertos; reglas de aviso de vencimiento. PRV-B se activa por empresa (`empresa.configurar_modulos`); apagarlo oculta, no borra.
**No entra:** ver sección 13.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Proveedor** | Quien vende bienes o presta servicios a la empresa. Operador de línea, registrador de dominio, emisor de certificados y garante también son proveedores de esta tabla. |
| **Contacto** | Persona del proveedor con quien se trata. No es Persona (quien recibe equipos) ni Usuario (quien entra a la plataforma). |
| **Identificación fiscal** | Número tributario del proveedor (RUC, NIT, RFC u otro según país), guardado normalizado. |
| **Contrato** | Acuerdo con un proveedor por un periodo. Es único en toda la plataforma: el contrato de licencia es una extensión 1 a 1 de este (D-044.4). |
| **Vigencia** | Periodo entre inicio y fin; el día de fin cuenta completo. |
| **Renovación manual / automática** | Manual: alguien la registra. Automática: el contrato se renueva solo según su texto, salvo que se avise a tiempo. |
| **Preaviso y fecha límite de preaviso** | Días de anticipación para avisar que no se renueva; la fecha límite es el fin menos esos días. |
| **Adenda** | Cambio escrito a un contrato firmado (precio, fecha, alcance). |
| **Compromiso de servicio del proveedor** | Promesa medible del proveedor, por ejemplo "responde en 4 horas a una falla crítica". Reemplaza a "SLA" (D-049.7); "SLA" queda para los plazos internos de la mesa de ayuda. |
| **Responsable** | Persona de la empresa que cuida el contrato; su vínculo con una membresía es opcional (D-044.5). |
| **Estado mostrado** | Programado, Vigente o Vencido: se calcula al leer con las fechas y la zona horaria de la empresa; no se guarda (D-062.2). |
| **Valor total comprometido** | Valor del periodo contratado, con impuesto, en la moneda base: la medida única de monto de RN-017 (D-043.3). |
| **Documento de referencia** | Registro de qué documento es y dónde está; no contiene el archivo (D-022). |

## 3. Roles y permisos

Los permisos son los del registro único `docs/registro-permisos.md` (PS-nn, D-036); el número manda y el nombre técnico se repite en el texto por legibilidad. Este módulo agrega filas y no cambia celdas del núcleo (D-037). Valores iguales a los del registro. **Empleado (portal): no aplica.** "Propio" = contratos donde la Persona vinculada del usuario es responsable (sin Persona vinculada, lista vacía).

| Acción | PS y permiso | Admin. | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver ficha básica del proveedor | PS-35 `proveedores.ver` | Todo | Todo | Todo | Todo | No | Todo |
| Ver contactos (datos de terceros) | PS-36 `proveedores.ver_contactos` | Sí | Sí | Sí | No | No | No |
| Crear y editar proveedor y contactos | PS-37 `proveedores.crear_editar` | Sí | No | No | No | No | No |
| Desactivar y reactivar proveedor | PS-38 `proveedores.desactivar` | Sí | No | No | No | No | No |
| Ver contratos y compromisos | PS-74 `contratos.ver` | Todo | Todo | Todo | No | No | Todo |
| Ver importes (sensible) | PS-23 `precios.ver` | Sí | Sí | No | No | No | No |
| Crear y editar contratos en Borrador | PS-75 `contratos.crear_editar` | Sí | No | No | No | No | No |
| Activar contrato (RN-PRV-015) | PS-76 `contratos.activar` | Sí | Sí | No | No | No | No |
| Renovar, adenda, marcar "no renovar" | PS-77 `contratos.renovar` | Sí | Sí | No | No | No | No |
| Terminar o anular | PS-78 `contratos.terminar_anular` | Sí | Sí | No | No | No | No |
| Gestionar compromisos de servicio | PS-79 `contratos.gestionar_compromisos` | Sí | Sí | No | No | No | No |
| Gestionar documentos de referencia | PS-80 `contratos.gestionar_referencias` | Sí | Sí | Sí | No | No | No |
| Recibir avisos de contratos | PS-81 `contratos.recibir_avisos` | Todo | Todo | Propio | No | No | No |
| Exportar listas | PS-20 `datos.exportar` | Sí | No | No | No | No | No |
| Importar maestro de proveedores | PS-21 `datos.importar` | Sí | No | No | No | No | No |
| Ver actividad del módulo | PS-18 `auditoria.ver` | Sí | Sí | No | No | No | No |
| Activar o apagar el módulo | PS-09 `empresa.configurar_modulos` | Sí | No | No | No | No | No |

Con `contratos.crear_editar` solo del Administrador y `contratos.activar` también de Jefatura TI, la persona que prepara y la que aprueba son distintas por diseño. Reglas: todo permiso se comprueba en el servidor; nadie se asigna permisos ni crea un rol con más de los suyos (D-004.6); quien crea proveedores es distinto del permiso de crear órdenes (D-015.5).

## 4. Requisitos

Columnas: **Cuándo** = `v1, Etapa 2` (PRV-A) o `Fase 2` (PRV-B). **CA** = criterio que lo cubre (sección 10).

### 4.1 Requisitos funcionales

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-PRV-001 | Registrar un proveedor: razón social, nombre comercial, tipo (Empresa o Persona natural), identificación fiscal, país, "vende bienes", "presta servicios", sitio web, notas. | v1, Etapa 2 | 01, 03 |
| RF-PRV-002 | Editar un proveedor. La auditoría guarda antes y después de campos ordinarios; de campos personales solo "el campo cambió" (D-030). | v1, Etapa 2 | 03, 20 |
| RF-PRV-003 | Desactivar y reactivar un proveedor, con motivo. | v1, Etapa 2 | 04 |
| RF-PRV-004 | Lista de proveedores con buscador, filtros (estado, vende, presta, país) y exportación por la puerta única (D-061.1), sin columnas de contactos. | v1, Etapa 2 | 15 |
| RF-PRV-005 | Contactos: nombre, cargo, rol (Comercial, Soporte técnico, Facturación, Escalamiento), correo, teléfono laboral, principal. | v1, Etapa 2 | 03 |
| RF-PRV-006 | Desactivar un contacto sin borrarlo; un contacto inactivo se anonimiza a los 2 años (RN-PRV-034). | v1, Etapa 2 | 16 |
| RF-PRV-007 | Ficha del proveedor con resumen: órdenes abiertas y, con PRV-B activo, contratos. | v1, Etapa 2 | 02 |
| RF-PRV-008 | Registrar un contrato en Borrador: proveedor, tipo, título, número del proveedor, objeto, firma, inicio, fin, renovación, preaviso, patrón de costo (RN-PRV-012), responsable, orden de compra relacionada (opcional). | Fase 2 | 05 |
| RF-PRV-009 | Número correlativo por empresa `CTR-000012` (D-007.8, D-049). | Fase 2 | 05 |
| RF-PRV-010 | Activar un contrato, con otra persona cuando RN-017 lo exige. | Fase 2 | 05, 06, 17 |
| RF-PRV-011 | Renovar un contrato (nuevo fin y, si cambia, nuevo valor) conservando el fin anterior. | Fase 2 | 07 |
| RF-PRV-012 | Renovación automática: el sistema extiende la vigencia al llegar el fin, salvo marca "no renovar". | Fase 2 | 08, 18 |
| RF-PRV-013 | Marcar "no renovar" (fecha y motivo) y deshacer la marca mientras no haya pasado el fin. | Fase 2 | 18 |
| RF-PRV-014 | Registrar una adenda (valor, fin o alcance) con descripción y fecha. | Fase 2 | 13 |
| RF-PRV-015 | Revertir una renovación registrada por error, con motivo, si no hay cambios posteriores. | Fase 2 | 07 |
| RF-PRV-016 | Terminar un contrato antes de su fin, con fecha efectiva y motivo. | Fase 2 | 09 |
| RF-PRV-017 | Anular un contrato registrado por error, con motivo. | Fase 2 | 09 |
| RF-PRV-018 | Mostrar el estado calculado al leer (Programado, Vigente, Vencido); el proceso diario solo emite avisos y renovaciones automáticas. | Fase 2 | 09, 19 |
| RF-PRV-019 | Vincular activos cubiertos (uno por uno o por filtro de SKU, categoría o ubicación). | Fase 2 | 02 |
| RF-PRV-020 | Registrar compromisos de servicio dentro de un contrato: nombre, prioridad, métrica, objetivo, cobertura, consecuencia pactada (texto). | Fase 2 | 12 |
| RF-PRV-021 | Registrar documentos de referencia de un proveedor o contrato. | Fase 2 | 11 |
| RF-PRV-022 | Lista de contratos con filtros (estado mostrado, proveedor, tipo, responsable, vence en N días, preaviso próximo) y exportación por la puerta única. | Fase 2 | 10 |
| RF-PRV-023 | Los contratos por activar aparecen en la bandeja única "Por aprobar" (D-053), con el verbo "Aprobar". | Fase 2 | 05 |
| RF-PRV-024 | Administrar los tipos de contrato de la empresa. La configuración de avisos vive solo en Notificaciones (NOT-05). | Fase 2 | 10 |
| RF-PRV-025 | En la orden de compra o de servicio, mostrar (informativo) los contratos vigentes del proveedor y sus compromisos. | Fase 2 | 12 |
| RF-PRV-026 | Al cerrar una orden de servicio con compromiso aplicable, mostrar el tiempo real frente al objetivo, en horas corridas, solo como dato. | Fase 2 | 12 |
| RF-PRV-027 | Historial del contrato: cambios de estado, renovaciones y adendas, con quién y cuándo. | Fase 2 | 07 |
| RF-PRV-028 | Contrato de licencia: PRV expone el contrato (CTR-) y LIC agrega su extensión 1 a 1 (tipo y puestos); no existe otro contrato (D-044.4). | Fase 2 | 21 |
| RF-PRV-029 | Declarar en el registro de módulo los contratos de los que una Persona es responsable como "pendiente de la persona" (D-061.7). | Fase 2 | 22 |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-PRV-001 | La identificación fiscal es única por empresa una vez normalizada (sin espacios, guiones ni mayúsculas); puede quedar vacía con aviso visible. |
| RN-PRV-002 | Una razón social casi igual a otra muestra un aviso con los parecidos; no bloquea. |
| RN-PRV-003 | Un proveedor con historial no se borra: se desactiva (D-019). |
| RN-PRV-004 | No se desactiva un proveedor con contratos activados vigentes o programados, ni con órdenes de compra o de servicio sin cerrar ni anular. |
| RN-PRV-005 | Un proveedor inactivo no se elige en nuevas órdenes, contratos ni mantenimientos; sigue visible en el historial. |
| RN-PRV-006 | No se guardan datos bancarios del proveedor. |
| RN-PRV-007 | Un contacto guarda solo nombre, cargo, correo y teléfono laborales; nada de documento, dirección ni datos personales. |
| RN-PRV-008 | Un contacto necesita correo o teléfono; el correo no se repite dentro del proveedor. |
| RN-PRV-009 | Máximo un contacto principal activo por proveedor. |
| RN-PRV-010 | El fin de un contrato no es anterior al inicio. |
| RN-PRV-011 | Un contrato se crea solo con un proveedor activo de la misma empresa. |
| RN-PRV-012 | Patrón de costo común (D-044.1): importe sin impuesto del periodo, % de impuesto, moneda (una por contrato, sin conversión), periodicidad (Única, Mensual, Trimestral, Anual), inicio, fin, centro de costo y `fuente_costo`. Importe mayor o igual a 0. |
| RN-PRV-013 | `fuente_costo` es "contrato"; si hay orden de compra relacionada, es "orden_compra" y el libro de costos cuenta la orden y no el contrato (precedencia D-044.3). |
| RN-PRV-014 | Valor total comprometido = valor del periodo con impuesto × periodos entre inicio y fin (hacia arriba); con periodicidad Única, el importe único con impuesto. Redondeo según D-044.7. |
| RN-PRV-015 | Activar exige a otra persona cuando RN-017 (núcleo) lo dispone: el valor total comprometido, en moneda base, supera estrictamente el límite; con límite 0 siempre; en otra moneda siempre. Se calcula con la función única `requiereSegundaPersona` (D-043.3). Este módulo no define otra regla de monto. |
| RN-PRV-016 | El servicio único de doble control aplica la definición única: no activa quien haya creado o editado el contrato desde la última aprobación, ni siquiera el Administrador (D-043.1). |
| RN-PRV-017 | La excepción de una sola persona de TI es la casilla "contratos" del interruptor único de la empresa (apagada, vence a los 90 días, con aviso visible y uso auditado). Este módulo no tiene excepción propia (D-031, D-043.2). |
| RN-PRV-018 | Para activar se exige responsable: una Persona activa con vínculo a una membresía que tenga `contratos.ver`. |
| RN-PRV-019 | Un contrato activado no cambia valor, fechas ni alcance editando: se usa renovación o adenda. Sí se editan responsable, notas y activos cubiertos. |
| RN-PRV-020 | Una renovación o adenda que sube el valor total comprometido o alarga el fin vuelve a aplicar RN-PRV-015 con las cifras nuevas. |
| RN-PRV-021 | El nuevo fin de una renovación es posterior al anterior; el anterior se conserva. |
| RN-PRV-022 | La renovación automática es una acción del autor "sistema" (D-041.4) que registra la regla aplicada y la persona que aprobó el contrato; repite las condiciones vigentes y no pide segunda persona (D-043.5). |
| RN-PRV-023 | Un precio nuevo del proveedor en una renovación automática se registra con una adenda; hasta entonces se mantiene el valor anterior. |
| RN-PRV-024 | Renovar un contrato Vencido es posible; si hoy es posterior al fin, el motivo es obligatorio y queda "renovado con retraso". |
| RN-PRV-025 | Terminar o anular exige motivo. Terminado y Anulado son finales; no se reabren, se crea otro contrato. |
| RN-PRV-026 | Solo se borra de verdad un contrato en Borrador que nunca se activó (D-019). |
| RN-PRV-027 | Un compromiso de servicio pertenece a un contrato, se edita solo en Borrador o con adenda, y no repite métrica y prioridad dentro del contrato. |
| RN-PRV-028 | El objetivo de un compromiso es mayor que 0; una disponibilidad está entre 0 y 100 %. |
| RN-PRV-029 | Un documento de referencia no guarda archivo. Un enlace externo solo acepta `https://` y muestra el aviso de salida (D-063.2). Todo texto libre pasa por el validador común que rechaza bloques de clave privada. |
| RN-PRV-030 | Las fechas son de calendario en la zona horaria de la empresa; un contrato vale hasta el final del día de su fin. "Hoy" se obtiene con la utilidad única `hoyEnEmpresa()` (D-062.2). |
| RN-PRV-031 | No se vinculan a un contrato activos De baja o Extraviado o robado; los ya vinculados quedan como historial. |
| RN-PRV-032 | Un identificador de otra empresa (proveedor, contrato, contacto, activo, Persona, orden) responde "no encontrado", también al escribir una referencia cruzada (D-021.5, D-039.7). |
| RN-PRV-033 | Los importes no aparecen en pantallas, exportaciones, correos ni avisos de quien no tenga `precios.ver`; las columnas se omiten. |
| RN-PRV-034 | Los datos de contactos están en la lista cerrada de campos personales (D-030.6): la auditoría guarda "el campo cambió" sin valor. Un contacto inactivo se anonimiza a los 2 años; la anonimización automática permanece apagada hasta la confirmación legal (D-033.4), y entonces se sobrescribe la fila. |
| RN-PRV-035 | El número interno no se reutiliza ni se edita (D-007). |
| RN-PRV-036 | Las reglas de aviso se declaran a Notificaciones con los umbrales por defecto de NOT: 90, 60, 30, 15 y 7 días; la empresa los edita en NOT-05. |
| RN-PRV-037 | Los datos de contacto no salen en exportaciones generales ni en el visor de la auditoría; solo se ven en pantalla con `proveedores.ver_contactos`. |
| RN-PRV-038 | Las fechas de cobro no se guardan: se derivan de inicio y periodicidad. Presupuesto lee las columnas del patrón de costo (RN-PRV-012). |
| RN-PRV-039 | Si el proveedor es Persona natural, su nombre, nombre comercial e identificación fiscal son campos personales: la auditoría guarda solo "el campo cambió" y la exportación los omite sin `datos_personales.ver`. |
| RN-PRV-040 | Una renovación automática sin marca "no renovar" no se muestra Vencida mientras el proceso diario no haya corrido; el estado mostrado Vencido solo aplica a contratos manuales o con marca. |
| RN-PRV-041 | Cada proceso diario es idempotente y recuperable: al arrancar procesa los días pendientes en orden, empresa por empresa con la empresa fijada en la transacción, salta empresas suspendidas y deja registro de la corrida (D-038.4). |
| RN-PRV-042 | Una decisión simultánea (activar, renovar, terminar) se resuelve con actualización condicional y columna `version`: gana una y la otra recibe "ya fue decidido". |
| RN-PRV-043 | Quien deja de ser responsable (cese de la Persona) no bloquea nada: el contrato aparece en sus pendientes y los avisos se resuelven Persona, membresía, correo, grupo (D-044.5). |

### 4.3 Requisitos de calidad

| ID | Requisito medible |
|---|---|
| RNF-PRV-001 | Con el volumen de referencia de RNF-010 del núcleo, listas y buscador responden en menos de 2 segundos en el 95 % de las consultas. |
| RNF-PRV-002 | Ejecutar dos veces el proceso diario del mismo día no duplica avisos ni renovaciones. |
| RNF-PRV-003 | Los avisos salen a la hora única de la empresa (08:00 por defecto, D-058) y con tolerancia de 1 hora. |
| RNF-PRV-004 | El 100 % de altas, cambios, activaciones, renovaciones, terminaciones y anulaciones queda en la auditoría en la misma operación (D-018). |
| RNF-PRV-005 | Cada tabla lleva empresa, clave foránea compuesta y prueba de aislamiento por identificador interno (D-039, D-063.6). |
| RNF-PRV-006 | Exportar 5 000 contratos corre en el trabajador y entrega en menos de 30 segundos. |
| RNF-PRV-007 | Pantallas de consulta usables a 360 px, con teclado completo y estados con texto (WCAG AA). |
| RNF-PRV-008 | Los errores no muestran datos internos ni importes a quien no los puede ver. |

## 5. Estados y transiciones

**Proveedor:** Activo e Inactivo (motivo en ambas direcciones; `proveedores.desactivar`; RN-PRV-004).

**Contrato.** Se guardan solo decisiones; Programado, Vigente y Vencido se calculan (RN-PRV-030).

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Borrador | `contratos.crear_editar` | Campos mínimos de RF-PRV-008. |
| Borrador | Programado o Vigente | `contratos.activar` | Otra persona si RN-PRV-015; Programado si el inicio es futuro. |
| Borrador | Borrador (devuelto) | Quien puede activar | Motivo; queda en el historial. |
| Borrador | (borrado) | Quien lo creó | Solo si nunca se activó. |
| Programado | Vigente | Calculado | Llega la fecha de inicio. |
| Vigente | Vencido | Calculado | Pasó el fin sin renovación (RN-PRV-040). |
| Vigente o Vencido | Vigente | `contratos.renovar` o sistema | Renovación (RN-PRV-020, 022, 024). |
| Vigente | Terminado | `contratos.terminar_anular` | Fecha efectiva y motivo. |
| Programado, Vigente o Vencido | Anulado | `contratos.terminar_anular` | Motivo. |

Ninguna otra transición. Terminado y Anulado son finales. "Por vencer" y "preaviso próximo" son etiquetas calculadas.

## 6. Datos

Todo registro lleva empresa; claves internas no consecutivas (D-019); autor = membresía, integración o sistema (D-041).

| Entidad | Campos principales | Unicidad | Qué se audita |
|---|---|---|---|
| **Proveedor** | Razón social, nombre comercial, tipo, identificación fiscal normalizada, país, vende, presta, sitio web, notas, estado, motivo | Identificación fiscal normalizada por empresa (parcial, si no está vacía) | Todo cambio; campos personales sin valor (RN-PRV-039). |
| **Contacto** | Proveedor, nombre, cargo, rol, correo, teléfono, principal, estado, `retener_hasta` | Correo por proveedor | Altas y cambios sin valor de campos personales; anonimización. |
| **Tipo de contrato** | Nombre, activo | Nombre por empresa | Altas y cambios. Iniciales: Soporte y mantenimiento, Licenciamiento o suscripción, Arrendamiento, Telecomunicaciones, Servicio administrado, Acuerdo marco, Otro. |
| **Contrato** | Número `CTR-`, número del proveedor, proveedor, tipo, título, objeto, firma, inicio, fin, renovación (Ninguna, Manual, Automática), meses por renovación, preaviso, marca "no renovar", patrón de costo (RN-PRV-012), orden de compra (opcional), responsable (Persona), decisión de activación (quién, cuándo, valor, si usó excepción), `version` | Número por empresa | Todo; uso de la excepción. |
| **Cambio de condiciones** | Contrato, tipo (Renovación, Renovación automática, Adenda, Terminación), fecha, fin y valor anterior y nuevo, descripción, autor, motivo, revertida | — | Todo (historial). |
| **Activo cubierto** | Contrato, activo, desde, hasta | Activo una vez por contrato | Altas y bajas. |
| **Compromiso de servicio** | Contrato, nombre, prioridad (Crítica, Alta, Media, Baja), métrica (respuesta en horas, resolución en horas, disponibilidad %), objetivo, cobertura, consecuencia | Contrato + métrica + prioridad | Altas y cambios. |
| **Documento de referencia** | Proveedor o contrato, tipo, título, número, fecha, dónde está (texto o `https`), custodio (texto) | — | Altas y cambios. |

Los avisos usan la tabla única de Notificaciones (empresa, regla, entidad, umbral, destinatario); este módulo no tiene tabla propia de avisos (D-062.3).

**Campos personales declarados (D-061.3):** contactos (nombre, correo, teléfono, cargo); razón social, nombre comercial e identificación fiscal de proveedor Persona natural; responsable (referencia a Persona, no copia). Finalidad: comunicarse con el proveedor y contratar. Los ve quien tiene `proveedores.ver_contactos`. Plazo: 2 años tras quedar inactivo (propuesta, pendiente de legal).

## 7. Pantallas necesarias

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-PRV-01 | Lista de proveedores | Buscar, filtrar y exportar. | Administrador |
| PAN-PRV-02 | Ficha del proveedor | Pestañas: datos, contactos, contratos, compromisos, documentos, actividad. | Jefatura TI |
| PAN-PRV-03 | Alta y edición de proveedor | Registrar con aviso de parecidos. | Administrador |
| PAN-PRV-04 | Lista de contratos | Filtros y etiquetas calculadas. | Jefatura TI |
| PAN-PRV-05 | Ficha del contrato | Datos, historial, cobertura, compromisos, documentos. | Jefatura TI |
| PAN-PRV-06 | Alta y edición de contrato | Asistente en pasos. | Jefatura TI |
| PAN-PRV-07 | Diálogos de renovar, adenda, terminar, anular y "no renovar" | Usan el diálogo único de motivo (D-053). | Jefatura TI |
| PAN-PRV-08 | Tipos de contrato | Ajuste de la empresa. | Administrador |

La bandeja de activación es la pestaña "Contratos" de "Por aprobar"; los vencimientos se ven en la pantalla única "Vencimientos" y su configuración en NOT-05; ambas pertenecen al núcleo y a NOT.

## 8. Notificaciones y automatismos

Reglas declaradas al motor único de Notificaciones (RF-NOT-024); NOT envía, agrupa y no repite (clave empresa, regla, entidad, umbral, destinatario). Contenido mínimo (D-061.4): código, fecha y nombre de la empresa; sin importes ni datos de contactos.

| Evento (catálogo único `<módulo>.<entidad>_<hecho>`) | Cuándo | A quién | Qué dice |
|---|---|---|---|
| `vencimiento.umbral_alcanzado` (contrato por vencer) | A cada umbral antes del fin, contratos activados sin renovación posterior | Responsable y quienes tienen `contratos.recibir_avisos` | "El contrato CTR-000012 vence el 30/11/2026 (faltan 30 días). Revíselo." |
| `vencimiento.umbral_alcanzado` (preaviso) | A cada umbral antes de la fecha límite de preaviso | Igual | "Si no desea que CTR-000012 se renueve, avise antes del 31/10/2026." |
| `contratos.contrato_vencido` | El día siguiente al fin sin renovación | Igual | "CTR-000012 venció el 30/11/2026. Renueve o termine el contrato." |
| `contratos.contrato_renovado_automatico` | Al ejecutarse | Responsable | "CTR-000012 se renovó hasta el 30/11/2027 con las mismas condiciones. Si el proveedor cambió el precio, registre una adenda." |
| `contratos.contrato_por_activar` | Al pedir activación (no a quien lo creó) | Quienes tienen `contratos.activar` | "El contrato CTR-000015 espera su aprobación." |
| `contratos.contrato_activado` o devuelto | Al decidir | Quien lo creó | "Su contrato CTR-000015 fue aprobado" o "fue devuelto: <motivo>". |
| `contratos.contrato_sin_responsable` | Cuando el responsable cesa | Quienes tienen `contratos.activar` | "CTR-000003 y CTR-000007 quedaron sin responsable. Asigne uno." |

Reglas: los avisos de PRV-B no entran a la v1 (D-023, D-061.4); los de la misma persona del mismo día se agrupan en el resumen diario (RF-NOT-011); si el responsable no tiene membresía, el aviso va al grupo con `contratos.recibir_avisos`.

## 9. Integración con el núcleo y con otros módulos

| Con | Cómo |
|---|---|
| Catálogos (Etapa 2) | Una sola tabla de proveedor (D-040.3). Centro de costo y moneda del núcleo. El maestro de proveedores se importa por el marco único (clave: identificación fiscal normalizada); la carga SAP exige `proveedores.crear_editar` (D-063.6). |
| Órdenes de compra y de servicio (Etapas 5 y 6) | Solo proveedores activos con "vende bienes" o "presta servicios". Una orden de compra puede originar un contrato y entonces la orden es la fuente de costo (RN-PRV-013). |
| Doble control y excepciones | Servicio único y casilla "contratos" (D-043); ninguna regla propia. |
| Libro de costos (`presupuesto-costos`) | PRE lee solo el patrón de costo y su `fuente_costo`; PRV no captura presupuesto (D-044.2). |
| `licencias-software` (B) | Acordado: el contrato de licencia es la extensión 1 a 1 del CTR-; LIC guarda puestos y derecho de uso. Soporte de software contratado va aquí. |
| `lineas-moviles`, `dominios-certificados` (B) | Usan el proveedor (operador, registrador); pueden enlazar un contrato de PRV; su vencimiento propio es de cada módulo. |
| `garantias-mantenimiento` (GAR) | GAR referencia proveedor y contrato; no los duplica. PRV-B va antes que GAR-B (D-056). |
| `mesa-de-ayuda` (C) y `notificaciones` (C) | Ayuda consulta los compromisos; NOT envía y no repite. |
| `cmdb-ligera` (E) | Contrato y proveedor son datos que la CMDB lee de su origen (D-062.1). |
| Registro de módulo (D-038.6) | PRV declara permisos, eventos, pendientes de la persona y reglas de aviso. |

## 10. Criterios de aceptación

| ID | Requisito | Criterio |
|---|---|---|
| CA-PRV-01 | RF-PRV-001 | **Dado** un proveedor con identificación fiscal 20123456789 en la empresa A, **cuando** se crea otro con "20-123 456789", **entonces** se rechaza por repetido; en la empresa B se acepta. |
| CA-PRV-02 | RF-PRV-007, 019, RN-PRV-032 | **Dado** un contrato de la empresa A, **cuando** un usuario de la empresa B consulta su identificador interno o intenta vincularlo con un activo o proveedor propio, **entonces** recibe "no encontrado" y no se escribe nada. |
| CA-PRV-03 | RF-PRV-001, 002, 005 | **Dado** un Técnico sin `proveedores.crear_editar`, **cuando** intenta crear o editar un proveedor o contacto (por pantalla o directo al servidor), **entonces** se rechaza y el intento queda en los eventos de seguridad. |
| CA-PRV-04 | RF-PRV-003 | **Dado** un proveedor con un contrato Vigente, **cuando** se intenta desactivar, **entonces** se rechaza con "Tiene el contrato CTR-000012 vigente". |
| CA-PRV-05 | RF-PRV-008, 010, 023 | **Dado** un contrato de USD 60 000 con impuesto creado por Ana y límite de 50 000 USD, **cuando** Ana intenta activarlo, **entonces** se rechaza; **cuando** Luis (con `contratos.activar`) lo aprueba, **entonces** pasa a Vigente y se guarda quién y por qué valor. |
| CA-PRV-06 | RF-PRV-010, RN-PRV-015 | **Dado** un contrato en EUR en una empresa con moneda base USD, **cuando** se activa, **entonces** exige a otra persona sin importar el importe. |
| CA-PRV-07 | RF-PRV-011, 015, 027 | **Dado** un contrato Vigente con fin 30/11/2026, **cuando** Luis lo renueva hasta 30/11/2027, **entonces** el fin es 30/11/2027, queda el anterior, y los avisos de umbral se reinician; **cuando** hubo otra renovación posterior, revertir la primera se rechaza. |
| CA-PRV-08 | RF-PRV-012 | **Dado** un contrato con renovación automática sin marca, **cuando** pasa el fin y corre el proceso, **entonces** se renueva con las mismas condiciones, autor "sistema", y avisa al responsable. |
| CA-PRV-09 | RF-PRV-016, 017, 018 | **Dado** un contrato manual con fin 30/11/2026 y el reloj fijado al 01/12/2026, **cuando** se lee, **entonces** se muestra Vencido sin que haya corrido ningún proceso; con el reloj al 30/11/2026 a las 23:59 aún es Vigente. |
| CA-PRV-10 | RF-PRV-022, 024 | **Dado** un usuario sin `precios.ver`, **cuando** abre la lista, la ficha o exporta un contrato, **entonces** las columnas de importe no existen en pantalla ni en el archivo. |
| CA-PRV-11 | RF-PRV-021 | **Dado** un documento de referencia, **cuando** se escribe un enlace `http://...`, **entonces** se rechaza; con `https://` se acepta y se muestra el aviso de salida. |
| CA-PRV-12 | RF-PRV-020, 025, 026 | **Dado** un compromiso "Resolución, Crítica, 4 horas", **cuando** se agrega otro con la misma métrica y prioridad, **entonces** se rechaza como repetido. |
| CA-PRV-13 | RF-PRV-014, RN-PRV-019 | **Dado** un contrato Vigente, **cuando** se intenta editar su fin directamente, **entonces** se indica usar renovación o adenda. |
| CA-PRV-14 | RN-PRV-041, 036 | **Dado** dos empresas con un contrato cada una que vence en 30 días, **cuando** corre el proceso diario con el reloj fijado y un disparador manual, **entonces** cada aviso, registro de corrida y destinatario queda en su empresa y una segunda corrida no duplica nada. |
| CA-PRV-15 | RF-PRV-004, RN-PRV-037 | **Dado** una lista de proveedores con contactos, **cuando** se exporta, **entonces** el archivo no trae columnas de contactos y la exportación queda en la auditoría con la hoja "Aviso". |
| CA-PRV-16 | RF-PRV-006, RN-PRV-034 | **Dado** un contacto con nombre canario anonimizado, **cuando** se busca ese nombre en tablas, auditoría, exportaciones y correos, **entonces** no aparece; la auditoría sigue completa. |
| CA-PRV-17 | RN-PRV-042 | **Dado** un contrato por activar, **cuando** dos aprobadores lo activan a la vez (20 conexiones), **entonces** una operación gana y las demás reciben "ya fue decidido". |
| CA-PRV-18 | RF-PRV-013, RN-PRV-040 | **Dado** un contrato con renovación automática, **cuando** se marca "no renovar" el día anterior al fin, **entonces** al llegar el fin pasa a Vencido sin renovarse; **cuando** la marca se pone después de correr el proceso del día del fin, se rechaza. |
| CA-PRV-19 | RN-PRV-015 | **Dado** el límite 50 000 USD, **cuando** un contrato vale exactamente 50 000,00 y otro 50 000,01, **entonces** solo el segundo exige a otra persona. |
| CA-PRV-20 | RF-PRV-002, RN-PRV-039 | **Dado** un proveedor Persona natural, **cuando** se cambia su nombre, **entonces** la auditoría dice "el campo cambió" sin los valores. |
| CA-PRV-21 | RF-PRV-028 | **Dado** un contrato de tipo Licenciamiento, **cuando** LIC agrega su extensión, **entonces** hay un solo número CTR- y no existe otro contrato de licencia. |
| CA-PRV-22 | RF-PRV-029, RN-PRV-043 | **Dado** el cese de la Persona responsable de un contrato Vigente, **cuando** se cesa, **entonces** el cese no se bloquea, el contrato aparece en sus pendientes y se avisa a quienes activan. |

## 11. Casos límite

1. Dos proveedores con la misma razón social e identificación distinta (sucursales): se permite con aviso.
2. Proveedor extranjero sin identificación fiscal: vacío con aviso.
3. Contrato con inicio y fin el mismo día: válido, dura un día completo.
4. Fin un 29 de febrero y renovación a un año: el nuevo fin es el 28 de febrero.
5. El proceso diario no corrió un día (caída): al arrancar procesa los días pendientes en orden sin perder avisos ni renovaciones (D-038.4).
6. Cambio de zona horaria de la empresa: los avisos pendientes se recalculan; los enviados no se repiten (D-060.9).
7. Contrato sin activos cubiertos: válido.
8. Activo cubierto que se da de baja: el vínculo queda como historial.
9. Contrato en Programado que se anula antes de empezar: permitido con motivo.
10. Archivo de proveedores con codificación distinta de UTF-8 o con identificaciones repetidas: se maneja según el marco de importación; el archivo ya cargado se rechaza entero (D-050).
11. Proveedor desactivado con contratos Terminados o Anulados: permitido.
12. Orden de compra relacionada que luego se anula: el contrato vuelve a `fuente_costo` "contrato".

## 12. Decisiones propuestas y supuestos

| ID | Resultado | Propuesta y motivo |
|---|---|---|
| S-PRV-01 | Confirmado (D-056) | Dos partes: PRV-A (v1, Etapa 2) y PRV-B (Fase 2, ola B). |
| S-PRV-02 | Confirmado (D-040.3) | Proveedor del catálogo y de PRV son la misma tabla. |
| S-PRV-03 | Confirmado (D-058, D-043) | Segunda persona con el límite de RN-017; sin regla de monto propia. |
| S-PRV-04 | Confirmado (D-043.5) | Renovación automática como acción del sistema con la regla y quien aprobó el contrato. |
| S-PRV-05 | Confirmado (D-022) | Documentos de referencia sin archivo hasta que el Cliente (CEO) habilite adjuntos. |
| S-PRV-06 | Confirmado | Un compromiso de servicio siempre vive dentro de un contrato; las condiciones generales se registran como contrato tipo Otro. |
| S-PRV-07 | Aceptado con condiciones (D-058) | Contactos sin `datos_personales.ver`, pero solo los ve `proveedores.ver_contactos`, no salen en exportaciones generales y tienen ciclo de vida. |
| S-PRV-08 | Confirmado | Sin dígito verificador de la identificación fiscal hasta saber los países (P-004). |
| S-PRV-09 | Confirmado | Sin datos bancarios. |
| S-PRV-10 | Cambiado | Los avisos agrupados son el resumen diario de NOT (RF-NOT-011). |
| S-PRV-11 | **[SUPUESTO]** | Proveedor Persona natural: campos personales sin valor en la auditoría. Cumplimiento lo confirma. |
| S-PRV-12 | **[SUPUESTO]** | El contrato se guarda solo con decisiones; Programado, Vigente y Vencido se calculan, y se retira el estado "Pendiente de activación" (D-062.2). |
| E-PRV-01 | **[ESCALAR AL CEO] (legal)** | La plataforma registra datos de contratos, no tiene valor legal ni sustituye al documento firmado; legal confirma esa frase en los términos de uso. |
| E-PRV-02 | **[ESCALAR AL CEO] (legal)** | Plazo de conservación y anonimización de contactos (D-024, L-04); no se activa nada automático antes de la confirmación. |
| E-PRV-03 | **[ESCALAR AL CEO] (dinero)** | Archivos de contratos implican almacenamiento con costo (D-022); se consulta al cierre de la Etapa 4. |

## 13. Fuera de alcance

1. Archivos adjuntos (D-022). 2. Datos bancarios, pagos, facturas y cuentas por pagar. 3. Evaluación o calificación de proveedores. 4. Firma electrónica y redacción legal. 5. Cálculo de penalidades y medición continua de disponibilidad. 6. Conversión de monedas. 7. Portal para el proveedor. 8. Avisos por mensaje de texto o aplicación móvil. 9. Contratos de varias monedas o con varios proveedores. 10. Integración con SAP más allá de la carga de maestros. 11. Presupuesto y libro de costos (de `presupuesto-costos`).

## 14. Historial de cambios (v0.1 a v0.2)

| Cambio | Decisión o hallazgo |
|---|---|
| Partido en PRV-A (Etapa 2) y PRV-B (Fase 2, ola B); columna "Cuándo" y CA por requisito | D-056, H-AUD-08, H-AUD-21, plan fila PRV (1, 13) |
| Crear, editar y desactivar proveedor solo Administrador; `ver_contactos` sin Almacén | D-037 fila 3, H-AUD-04, H-QA-08, H-UX-03 |
| Permisos migrados a los PS-nn del registro (PS-35 a PS-38, PS-74 a PS-81, PS-23, PS-18, PS-20, PS-21, PS-09); `proveedores.desactivar` separado; `contratos.crear_editar` solo Administrador; Solicitante sin ver proveedores; sin `exportar` propio | D-036, D-037, H-AUD-05, H-SEG-07, registro de permisos |
| Columna "Empleado (portal): no aplica" | D-037 fila 11, H-AUD-17 |
| Contactos con ciclo de vida, fuera de exportaciones, sin valor en la auditoría | D-058 (S-PRV-07), D-030.6, D-061.3, H-CUM-01, H-CUM-09 |
| Proveedor Persona natural con campos personales | D-030.6, H-CUM-01 |
| Contrato único `CTR-` de 6 dígitos con extensión de licencia | D-044.4, D-049.2, H-DAT-08 |
| Regla de segunda persona remitida a RN-017 (estrictamente mayor, con impuesto, moneda base); borde exacto | D-043.3, D-043.4, D-057 (S-30), H-QA-09, H-ARQ-10 |
| Retirada la excepción propia (RN-PRV-017); casilla "contratos" del interruptor único | D-031.6, D-043.2, H-AUD-07, H-CUM-02 |
| Definición única de creó o editó | D-043.1, H-ARQ-10 |
| Renovación automática como acción del autor "sistema" | D-041.4, D-043.5, H-CUM-03 |
| Estados guardados vs calculados; retirado "Pendiente de activación"; Vencido sin proceso nocturno | D-062.2, D-049.5, H-ARQ-16, H-DAT-17 |
| Retirada la tabla "Alerta enviada"; avisos por Notificaciones con umbrales 90/60/30/15/7 | D-062.3, D-058 (NOT-S08), H-DAT-17, H-AUD-19 |
| Patrón de costo y `fuente_costo` sustituye la marca "costo ya registrado por OC" | D-044.1, D-044.3, H-ARQ-08, H-DAT-07 |
| "SLA" pasa a "Compromiso de servicio del proveedor" | D-049.7, H-AUD-19 |
| Responsable pasa de Usuario a Persona; cese sin bloqueo | D-044.5, D-041, D-061.7 |
| Pantallas `PAN-PRV-nn`; bandeja única "Por aprobar"; sin pantalla de avisos propia | D-049.4, H-UX-06, H-UX-11 |
| Orden de RN-PRV-036 a 038 corregido | H-AUD-24 |
| Evento renombrado a `vencimiento.umbral_alcanzado` (catálogo de NOT) | D-038.5, notificaciones.md |
| Reglas de proceso diario, concurrencia y aislamiento; CA-PRV-14 a 22 (dos empresas, reloj fijable, referencia cruzada, concurrencia, borde, canario) | D-038.4, D-039.6, D-063.6, H-SEG-02, H-QA-12, H-ARQ-17, QA fila PRV |
| Volumen de referencia citado de RNF-010; hora única de avisos | S-19 (D-057), H-AUD-24, H-QA-22 |
| Supuestos resueltos como confirmados, cambiados o nuevos | D-057, D-058 |
| Correos con contenido mínimo; "usted" y fechas día/mes/año | D-061.4, D-049 |
