# Módulo: Dominios y certificados (DOM)

**Versión:** 0.2 · **Autor:** Analista de Negocio, escuadrón B · **Estado:** corregido tras la revisión cruzada (plan de correcciones, Mesa #002); pendiente de verificación del Auditor Técnico, QA, Seguridad y Cumplimiento
**Base:** decisiones D-001 a D-064 (`docs/equipo/decisiones.md`), en especial D-030, D-036, D-037, D-038, D-043, D-044, D-048, D-049, D-050, D-056, D-058, D-061, D-062 y D-063.
**Fase:** Fase 2, ola B, **primero de la ola** (D-056). Cada fila de requisito indica "Cuándo" y el criterio que lo cubre.

---

## 1. Propósito, alcance y fase

**Propósito.** Que ningún dominio ni certificado de seguridad venza sin que alguien lo sepa a tiempo. Un dominio vencido deja sin página web y sin correo a la empresa; un certificado vencido hace que los navegadores muestren "sitio no seguro". El módulo guarda qué existe, de quién es, quién responde por él, cuándo vence y avisa antes.

**Entra**
- Dominios: nombre, registrador, titular, responsable, vencimiento, renovación y costo.
- Certificados digitales (sobre todo TLS/SSL): nombre cubierto, emisor, vigencia, dónde está instalado y responsable.
- Vínculo entre un certificado y los dominios que protege.
- Avisos de vencimiento con varios umbrales.
- Registro de cada renovación (historial de fechas y costos).
- Informe de riesgos.
- Importación inicial (marco común) y exportación (puerta común).

**No entra**
- Comprobar en internet si el dominio o el certificado existe o cuándo vence (SUP-DOM-02).
- Renovar, comprar o emitir certificados; configurar DNS.
- **Guardar claves privadas, archivos de certificado o contraseñas del registrador.**
- Monitoreo de disponibilidad del sitio.
- Adjuntos (D-022).

**Fase.** Fase 2, ola B (D-056.3), después de la Etapa 7. Es el primero de la ola porque no depende del inventario: solo de Empresas, Personas, proveedores y NOT-completo. Cada empresa activa el módulo en Configuración (`empresa.configurar_modulos`); apagarlo oculta, no borra, y la API responde "no encontrado".

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Dominio** | Nombre de internet de la empresa (ej. `miempresa.com`). Se alquila por años a un registrador. |
| **Registrador** | Donde se compró el dominio (ej. GoDaddy, NIC). Es un proveedor de la tabla única de proveedores (D-040.3). |
| **Titular** | A nombre de quién está registrado el dominio. Debe ser la empresa; si figura una persona o un tercero, es un riesgo. Un titular persona natural es **dato personal** de la lista cerrada de D-030.6. |
| **Certificado digital** | Archivo que prueba la identidad de un sitio y activa el candado del navegador. Caduca. |
| **TLS/SSL** | El tipo más común: protege sitios web. |
| **Nombre común y nombres alternativos** | Los sitios que cubre (ej. `www.miempresa.com`, `*.miempresa.com`). El asterisco cubre todos los subdominios. |
| **Emisor (CA)** | Quien emite el certificado (ej. DigiCert, Let's Encrypt). Es un proveedor. |
| **Responsable / Suplente** | Personas (D-006) que responden por renovar. Una Persona está Activa, Cesada o Anonimizada. |
| **Responsable inactivo** | El responsable fue Cesado. Se calcula al leer; no es un estado guardado. |
| **Pendiente de la persona** | Cosa que una Persona aún tiene a su nombre. Aquí: dominios y certificados a su cargo. |
| **Vencimiento** | Fecha de calendario hasta la que vale (incluida). |
| **Por vencer** | Indicador (no estado): quedan menos días que el umbral. |
| **Costo comprometido** | Importe total, con impuesto, de la compra o renovación. Es la medida que se compara con el límite de la empresa. |
| **Renovación automática** | El proveedor renueva solo y cobra. Es un dato informativo. |

## 3. Roles y permisos

Los módulos agregan filas al registro único, no cambian celdas del núcleo (D-036, D-037). Los PS-nn son los de `docs/registro-permisos.md`. Alcance "todo" salvo donde se indica. Valores predeterminados: T = todo, P = lo propio, - = no puede. Empleado (portal): **no aplica** (este módulo no se ofrece en el portal).

| Acción | Permiso (PS) | Adm | Jef | Téc | Alm | Sol | SL | Emp |
|---|---|---|---|---|---|---|---|---|
| Ver dominios y certificados | `dominios.ver` (PS-97) | T | T | T | - | - | T | no aplica |
| Ver costos | `precios.ver` (PS-23) | T | T | - | - | - | - | no aplica |
| Ver titular persona natural y nombres de responsables | `datos_personales.ver` (PS-22) | T | T | T | - | - | - | no aplica |
| Crear y editar (incluye cambiar responsable o suplente) | `dominios.crear_editar` (PS-98) | T | - | T | - | - | - | no aplica |
| Registrar una renovación | `dominios.registrar_renovacion` (PS-227) | T | T | T | - | - | - | no aplica |
| Confirmar un costo que supera el límite | `dominios.confirmar_costo` (PS-228) | T | T | - | - | - | - | no aplica |
| Dar de baja un dominio, o dar de baja o revocar un certificado | `dominios.baja` (PS-99) | T | - | - | - | - | - | no aplica |
| **Cambiar el titular** (sensible) | `dominios.cambiar_titular` (PS-100) | T | - | - | - | - | - | no aplica |
| Configurar el módulo | `dominios.configurar` (PS-101) | T | - | - | - | - | - | no aplica |
| Recibir avisos de vencimiento | `dominios.recibir_avisos` (PS-229) | T | T | T | - | - | - | no aplica |
| Exportar (permiso único; módulo "dominios") | `datos.exportar` (PS-20) | T | - | - | - | - | - | no aplica |
| Importar (permiso único; módulo "dominios") | `datos.importar` (PS-21) | T | - | - | - | - | - | no aplica |
| Ver auditoría | `auditoria.ver` (PS-18) | T | T | - | - | - | - | no aplica |

Controles (D-036.5, D-048): `dominios.cambiar_titular` lleva segundo factor (2F), **reautenticación reciente (R)** y auditoría de cada uso (A); `datos.exportar` y `datos.importar`, 2F, R, A y los topes del núcleo. Jefatura TI no exporta ni importa salvo que el administrador se lo active. Cambiar el titular puede hacer perder el control del dominio, por eso es un permiso aparte de editar. Todo se comprueba en el servidor. Un rol nuevo parte sin permisos. Los permisos PS-227, PS-228 y PS-229 se agregaron al registro a pedido de este módulo.

## 4. Requisitos

### 4.1 Requisitos funcionales

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-DOM-001 | Registrar un dominio: nombre, registrador, titular, responsable, suplente (opcional), fecha de registro, vencimiento, renovación automática, costo anual, centro de costo, dónde se administra el DNS (texto) y notas. | Fase 2, ola B | CA-DOM-01 |
| RF-DOM-002 | Registrar un certificado: tipo, nombre común, nombres alternativos, emisor, número de serie (opcional), emisión, vencimiento, forma de renovación, dónde está instalado (texto), responsable, suplente, costo y centro de costo. | Fase 2, ola B | CA-DOM-05 |
| RF-DOM-003 | Vincular un certificado a uno o más dominios de la empresa. | Fase 2, ola B | CA-DOM-05 |
| RF-DOM-004 | Mostrar la vigencia **calculada al leer** y los días que faltan. | Fase 2, ola B | CA-DOM-02 |
| RF-DOM-005 | Panel "Por vencer": dominios y certificados ordenados por fecha, con filtro por días y responsable. | Fase 2, ola B | CA-DOM-02 |
| RF-DOM-006 | Declarar a Notificaciones las reglas de aviso del módulo (sección 8). | Fase 2, ola B | CA-DOM-03 |
| RF-DOM-007 | Registrar la renovación de un dominio: nueva fecha, importe, moneda, fecha de pago y orden de compra (opcional). El dominio sigue siendo el mismo registro. | Fase 2, ola B | CA-DOM-04 |
| RF-DOM-008 | Registrar la renovación de un certificado creando un certificado nuevo enlazado; el anterior pasa a Reemplazado. | Fase 2, ola B | CA-DOM-05 |
| RF-DOM-009 | Dar de baja un dominio o un certificado con motivo; revocar un certificado con motivo. | Fase 2, ola B | CA-DOM-10 |
| RF-DOM-010 | Cambiar el titular o el responsable con motivo; el historial conserva todos. | Fase 2, ola B | CA-DOM-07 |
| RF-DOM-011 | Marcar "Responsable inactivo" (calculado) cuando la Persona responsable es Cesada, y avisar al suplente y al grupo. | Fase 2, ola B | CA-DOM-09 |
| RF-DOM-012 | Informe de riesgos: titular distinto de la empresa, sin responsable activo, vencidos, certificados sin dominio, dominios con certificados vencidos, costos sin confirmar. | Fase 2, ola B | CA-DOM-10 |
| RF-DOM-013 | Importar dominios y certificados con el marco único de importación. | Fase 2, ola B | CA-DOM-12 |
| RF-DOM-014 | Buscar por nombre, emisor, registrador o responsable; filtrar por estado, vencimiento y centro de costo; exportar solo por la puerta única. | Fase 2, ola B | CA-DOM-13 |
| RF-DOM-015 | Historial de cada registro: cambios, renovaciones, titulares y responsables. | Fase 2, ola B | CA-DOM-04 |
| RF-DOM-016 | Declarar el costo con el patrón común y su `fuente_costo`, y marcar "Sin respaldo de compra". | Fase 2, ola B | CA-DOM-11 |
| RF-DOM-017 | Confirmar el costo de una compra o renovación cuando supera el límite, por una segunda persona. | Fase 2, ola B | CA-DOM-11 |
| RF-DOM-018 | Declarar en el registro de módulo el pendiente "dominio o certificado a cargo de la Persona". | Fase 2, ola B | CA-DOM-09 |
| RF-DOM-019 | Configurar por empresa los umbrales de aviso (dentro de lo que Notificaciones permite) y el grupo destinatario. | Fase 2, ola B | CA-DOM-03 |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-DOM-001 | Todo dato lleva empresa. Registrador, Persona, orden de compra, centro de costo y dominio vinculado deben ser de la misma empresa: la base lo impide y un identificador de otra empresa responde "no encontrado" (D-025, D-039, D-021.5). **La plataforma nunca avisa que otra empresa tiene el mismo dominio.** |
| RN-DOM-002 | El nombre del dominio se guarda en minúsculas, sin espacios, sin punto final ni "www." inicial; los caracteres especiales se comparan en su forma técnica. Es **único por empresa** entre los registros no dados de baja (marca "identificador", D-050.4). |
| RN-DOM-003 | Un certificado exige nombre común y vencimiento. El vencimiento no puede ser anterior a la emisión. |
| RN-DOM-004 | Un certificado puede cubrir dominios con comodín (`*.miempresa.com`); se vincula al dominio registrado `miempresa.com`. Se permite certificado sin dominio (servicios internos); sale en el informe de riesgos. |
| RN-DOM-005 | El número de serie del certificado, si se escribe, es único por empresa y emisor. |
| RN-DOM-006 | El vencimiento es de calendario (sin hora) y vale **hasta el final de ese día** en la zona horaria de la empresa. La vigencia (Activo, Vencido) se **calcula al leer** con `hoyEnEmpresa()`; no se guarda un estado "Vencido" que un proceso cambie. Solo se guardan las decisiones: renovado, reemplazado, revocado, dado de baja (D-062.2). |
| RN-DOM-007 | Un dominio Vencido que se renueva dentro del período de gracia del registrador vuelve a Activo al registrar la renovación. Si no se recupera, se da de baja con el motivo "Perdido". |
| RN-DOM-008 | Un certificado no se "renueva": se **reemplaza**. El anterior queda Reemplazado y enlazado. Un dominio sí conserva su registro y suma un evento de renovación. |
| RN-DOM-009 | Los eventos de renovación no se editan ni se borran. Un error se corrige con una corrección con motivo, auditada. |
| RN-DOM-010 | **La plataforma no guarda claves privadas, archivos de certificado, usuarios ni contraseñas de registradores o de DNS.** Los campos de texto avisan "No escriba claves ni contraseñas aquí". Un texto con forma de clave privada se rechaza con el **validador común de texto libre** (D-063.2); no hay validador propio de este módulo. |
| RN-DOM-011 | El responsable es una Persona Activa; el suplente, si existe, también y distinta del responsable. |
| RN-DOM-012 | **El cese de una Persona nunca se bloquea por dominios o certificados** (D-061.7). Los registros a su cargo son pendientes de la persona (visibles en su ficha), quedan con "responsable inactivo", los avisos van al suplente y al grupo, y `onboarding-offboarding` crea una tarea. Lo que sí se bloquea es **anonimizar** a la Persona mientras tenga pendientes sin cerrar (D-033.3). |
| RN-DOM-013 | Titular: "La empresa" u "Otro" (razón social o nombre, en texto). "Otro" marca el registro como de riesgo. **El titular persona natural es un dato personal de la lista cerrada de D-030.6**: la auditoría solo registra que el campo titular cambió, nunca su valor; solo se ve con `datos_personales.ver`; el formulario pide razón social y avisa "No escriba documentos de identidad". |
| RN-DOM-014 | Cambiar el titular exige `dominios.cambiar_titular`, reautenticación reciente y motivo. El historial de negocio guarda el valor anterior y el nuevo en la tabla de titulares (dato personal declarado, anonimizable); la auditoría, no. Cambiar el responsable es una edición normal. |
| RN-DOM-015 | **Costo:** patrón compartido (D-044.1): importe sin impuesto (4 decimales exactos), % de impuesto, moneda de 3 letras, periodicidad, inicio, fin, centro de costo y `fuente_costo` ∈ {propia, orden de compra, contrato}. Una moneda por registro, sin conversión; nunca un total general entre monedas. Se ven solo con `precios.ver`. |
| RN-DOM-016 | **Fuente única:** orden de compra, luego contrato de proveedor enlazado, luego registro propio (D-044.3). Con costo y sin orden ni contrato enlazados, el registro queda **"Sin respaldo de compra"** (marca visible; informe mensual a quien aprueba); no se bloquea. |
| RN-DOM-017 | **Segunda persona (RN-017 del núcleo):** si el costo comprometido de una compra o renovación supera **estrictamente** el límite de la empresa (total con impuesto en la moneda base; otra moneda siempre), el costo debe confirmarlo otra persona con `dominios.confirmar_costo`: no confirma quien creó o editó el registro desde la última confirmación. Aplica al Administrador. El registro opera y avisa mientras tanto (no se pierde un dominio por esperar), pero su costo queda "pendiente de confirmación" y no entra al libro de costos hasta confirmarse. La excepción es solo una casilla del interruptor único (D-031, D-043) que el Gerente de TI debe asignar a dominios y certificados (propuesta: «contratos»; ver SUP-DOM-13); no hay excepción propia, y mientras no se asigne la casilla la excepción no existe para este módulo. [SUPUESTO] SUP-DOM-13 |
| RN-DOM-018 | Los umbrales de aviso son los por defecto de Notificaciones (90, 60, 30, 15 y 7 días antes) más 1 día antes y el día del vencimiento; la empresa los edita. Un certificado con renovación automática avisa a 15, 7 y 1 día por si la renovación falló. No hay recordatorios propios después de vencer: el registro aparece en el panel y en el informe de riesgos como "Vencido sin atender". |
| RN-DOM-019 | Registrada la renovación o la baja, los avisos pendientes se cancelan. Si el vencimiento se corrige a una fecha futura, se cancelan y recalculan (D-062). |
| RN-DOM-020 | Los avisos no incluyen costos ni nombres de personas; solo nombre del elemento, fecha y días restantes (D-061.4). |
| RN-DOM-021 | Nada con historial se borra: se da de baja, se revoca o se reemplaza. Solo se borra un Borrador sin efecto (importación no confirmada). |
| RN-DOM-022 | Sin `datos_personales.ver` no se ve el titular persona natural ni los nombres de responsables (se ve `PRS-0042`). Sin `precios.ver` no se ven costos. |
| RN-DOM-023 | Al anonimizar una Persona (D-030.3), responsable y suplente históricos siguen apuntando a su identificador, que muestra "Persona anonimizada 0042"; el titular persona natural en la tabla de titulares se sobrescribe con la referencia. |
| RN-DOM-024 | Un dominio de baja puede registrarse otra vez como dominio nuevo (si se vuelve a comprar); el anterior queda en el historial. No hay reingreso. |
| RN-DOM-025 | Textos libres (notas, DNS, "instalado en", motivo "Otro"): la auditoría solo dice que el campo cambió. "Instalado en" es texto libre hasta que la CMDB defina el enlace (SUP-DOM-11). |
| RN-DOM-026 | Reemplazar un certificado de producción puede ser un cambio; el vínculo con `gestion-cambios` es opcional y lo define ese módulo. |

### 4.3 Requisitos de calidad

| ID | Requisito medible | Cuándo | CA |
|---|---|---|---|
| RNF-DOM-001 | El panel "Por vencer" con 2.000 registros carga en 2 segundos o menos (95 %), con 50 filas por página. Volumen de referencia: el único de RNF-010 del núcleo. | Fase 2, ola B | CA-DOM-02 |
| RNF-DOM-002 | Los avisos del día los emite Notificaciones a la hora única de la empresa (08:00 por defecto) sin repetir (elemento, umbral, destinatario); el proceso es idempotente y recuperable (D-038.4). | Fase 2, ola B | CA-DOM-03 |
| RNF-DOM-003 | La vigencia se calcula con el reloj de la plataforma, que las pruebas pueden fijar y adelantar en entornos de prueba; no depende de ningún proceso. | Fase 2, ola B | CA-DOM-02 |
| RNF-DOM-004 | El 100 % de los cambios de fecha, titular, responsable, estado y costo deja auditoría (los campos personales y el texto libre, sin valor). | Fase 2, ola B | CA-DOM-07 |
| RNF-DOM-005 | Una prueba automática no encuentra en base, auditoría ni registros técnicos ningún texto con formato de clave privada (secretos de prueba propios, no los de producción). | Fase 2, ola B | CA-DOM-06 |
| RNF-DOM-006 | Dos personas que registran el mismo dominio a la vez: exactamente un registro se crea. | Fase 2, ola B | CA-DOM-01 |
| RNF-DOM-007 | Lista y ficha usables en 360 px y con teclado; contraste AA; estado con texto, no solo color (D-021.1). | Fase 2, ola B | CA-DOM-13 |

## 5. Estados y transiciones

Los estados visibles se calculan al leer; solo se guardan las decisiones.

### 5.1 Dominio

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Activo | `dominios.crear_editar` | Vencimiento hoy o futuro |
| (nuevo) | Vencido | `dominios.crear_editar` | Alta de un dominio ya vencido (importación o recuperación) |
| Activo | Vencido | Calculado | Pasa el vencimiento (RN-DOM-006) |
| Vencido | Activo | `dominios.registrar_renovacion` | Nueva fecha de vencimiento |
| Activo, Vencido | Dado de baja | `dominios.baja` | Motivo: No se renueva; Transferido a otro titular; Perdido; Otro (con texto) |

Dado de baja es final. "Por vencer" no es estado.

### 5.2 Certificado

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Vigente | `dominios.crear_editar` | Vencimiento hoy o futuro |
| Vigente | Vencido | Calculado | Pasa el vencimiento |
| Vigente, Vencido | Reemplazado | `dominios.registrar_renovacion` | Existe un certificado nuevo enlazado |
| Vigente, Vencido | Revocado | `dominios.baja` | Motivo obligatorio (ej. clave comprometida) |
| Vigente, Vencido | Dado de baja | `dominios.baja` | Motivo: Ya no se usa; Otro (con texto) |

Reemplazado, Revocado y Dado de baja son finales. No hay otras transiciones.

## 6. Datos

**Dominio.** Empresa; identificador interno estable (lo usa la CMDB); nombre normalizado (único por empresa si no está de baja); registrador (proveedor); titular (La empresa u Otro + texto); responsable; suplente; fecha de registro; vencimiento; renovación automática; costo (patrón D-044.1, `fuente_costo`); centro de costo; DNS administrado en (texto); decisión guardada (Activo o Dado de baja + motivo); costo "pendiente de confirmación" y quién lo confirmó; marca "Sin respaldo de compra"; orden de compra o contrato de proveedor enlazados (opcionales); notas.

**Certificado.** Empresa; identificador estable; tipo (TLS/SSL, firma de código, correo seguro, otro); nombre común; nombres alternativos; emisor (proveedor); número de serie (opcional, único por empresa y emisor); emisión; vencimiento; renovación (manual o automática); instalado en (texto); responsable; suplente; costo; centro de costo; decisión guardada (Vigente, Reemplazado, Revocado, Dado de baja + motivo); certificado anterior; notas.

**Vínculo certificado-dominio.** Certificado; dominio; desde; hasta.

**Evento de renovación (dominio).** Dominio; fecha de pago; vencimiento anterior y nuevo; importe y moneda; orden de compra (opcional); quién lo registró; confirmación del costo. No se edita.

**Titulares y responsables (historial).** Registro; valor anterior y nuevo; motivo; fecha; quién. La columna del titular es dato personal declarado.

**Configuración de la empresa.** Umbrales de aviso y grupo destinatario.

**Datos personales de este módulo (lista declarada, D-061.3).** Titular persona natural; responsable y suplente (por identificador `PRS-`); notas de texto libre. Plazo: el de la auditoría (5 años desde la baja del registro); el titular persona natural se sobrescribe al anonimizar (L-09 pendiente de legal). La tabla única de retención del núcleo incluye este módulo.

**Se audita** (D-018, D-030): altas, cambios con antes y después (el titular y el texto libre, solo "el campo cambió"), renovaciones, reemplazos, bajas, revocaciones, cambios de titular, confirmaciones de costo, importaciones y exportaciones (por el marco y la puerta únicos), cambios de configuración y consultas a la auditoría del módulo. No se guarda ninguna clave, archivo ni contraseña.

## 7. Pantallas necesarias

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-DOM-01 | Panel "Por vencer" | Lo que vence pronto y lo vencido sin atender | Jefatura TI |
| PAN-DOM-02 | Lista de dominios | Buscar, filtrar; "Exportar" visible y desactivado con la razón si falta el permiso | Técnico |
| PAN-DOM-03 | Ficha del dominio | Datos, certificados vinculados, renovaciones, historial | Técnico |
| PAN-DOM-04 | Lista de certificados | Buscar y filtrar | Técnico |
| PAN-DOM-05 | Ficha del certificado | Datos, dominios cubiertos, certificado anterior | Técnico |
| PAN-DOM-06 | Alta / edición | Formularios con la advertencia de no escribir claves | Técnico |
| PAN-DOM-07 | Registrar renovación / reemplazo | Asistente corto | Técnico |
| PAN-DOM-08 | Baja o revocación | Diálogo con motivo | Administrador |
| PAN-DOM-09 | Informe de riesgos | Titular ajeno, sin responsable activo, sin certificado vigente, costos sin confirmar | Jefatura TI |
| PAN-DOM-10 | Confirmar costos | Costos pendientes de confirmación | Jefatura TI |
| PAN-DOM-11 | Configuración del módulo | Umbrales y destinatarios | Administrador |

La importación usa el asistente único "Importar datos" y la exportación la puerta única.

## 8. Notificaciones y automatismos

Este módulo **no tiene procesos propios**. Declara reglas al motor único de avisos de `notificaciones` (RF-NOT-024, D-062.3): entidad, campo de fecha, umbrales y permiso de destinatarios. Notificaciones evalúa una vez al día a la hora única de la empresa (08:00 por defecto), no repite el mismo aviso (elemento, umbral, destinatario), usa su tabla única y es idempotente y recuperable (D-038.4). Si la fecha se corrige a una futura, se cancelan y recalculan los avisos. Texto con variables cerradas: nombre del elemento, fecha, días.

| Regla / evento | Fecha o hecho | Umbrales | Destinatarios | Texto |
|---|---|---|---|---|
| `dominios.dominio_por_vencer` | Vencimiento del dominio | 90, 60, 30, 15, 7 (Notificaciones) y 1 y 0 | Responsable, suplente y quienes tengan `dominios.recibir_avisos` | "El dominio miempresa.com vence el 20/03/2027 (faltan 30 días)." |
| `dominios.certificado_por_vencer` | Vencimiento del certificado | Igual; si es automático, solo 15, 7 y 1 | Mismos | "El certificado *.miempresa.com vence el 20/03/2027 (faltan 7 días). Renueve o reemplácelo." |
| `dominios.responsable_cesado` | Evento: se cesa al responsable | Una vez | Suplente y grupo | "El dominio miempresa.com no tiene responsable activo." |
| `dominios.costo_pendiente_confirmacion` | Evento: costo sobre el límite | Una vez | Quienes tengan `dominios.confirmar_costo` | "Hay un costo de dominio o certificado pendiente de confirmación." |

Se aparta de los umbrales por defecto de Notificaciones solo para agregar el aviso a 1 día y el del día del vencimiento, porque un dominio o certificado vencido corta servicios de inmediato (D-058 fila 3). Si el responsable no tiene correo, el aviso va al grupo; si el grupo está vacío, a los Administradores. Los avisos de Fase 2 no entran a la v1. Depende del servicio de correo ya escalado al Cliente (CEO); no agrega gasto.

## 9. Integración con el núcleo y otros módulos

- **Personas (D).** Responsable y suplente son Personas. El cese **no se bloquea**: DOM declara el pendiente; `onboarding-offboarding` lo muestra y crea la tarea; se bloquea anonimizar (D-061.7).
- **Proveedores (PRV, escuadrón A).** El registrador y el emisor salen de la tabla única de proveedores. Un contrato de PRV puede enlazarse (opcional) y entonces es la fuente del costo; PRV es dueño del contrato y su valor.
- **Órdenes de compra.** Vínculo opcional por renovación; con orden, `fuente_costo` = orden de compra.
- **Presupuesto y reportes (F).** `presupuesto-costos` posee el libro único de costos y toma el costo solo si no hay orden ni contrato, y solo confirmado; `reportes-tableros` llama a los servicios del módulo. No escriben.
- **Notificaciones (C).** Sección 8.
- **CMDB (E).** La CMDB lee de DOM (referencia, nombre y estado; el vencimiento se consulta, no se copia) y materializa un elemento solo cuando participa en una relación manual (gancho síncrono más reconciliador). Las relaciones ("el servicio X depende del certificado Y") viven en la CMDB. DOM da un identificador estable y emite el evento cuando un registro pasa a Dado de baja, Reemplazado o Revocado. "Instalado en" puede reemplazarse luego por un enlace de solo lectura a esa relación.
- **Gestión de cambios (E).** Vínculo opcional definido por ese módulo (RN-DOM-026).
- **Importación y exportación.** Marco único (D-050) y puerta única (D-061.1).
- **Auditoría (núcleo).** D-018 y D-030; referencias con clave compuesta con empresa (D-039.7).

## 10. Criterios de aceptación

Cada criterio cita el requisito que cubre. Las pruebas de aislamiento usan identificador interno y dos empresas (D-063.6).

- **CA-DOM-01 (alta y unicidad; RF-DOM-001, RN-DOM-002, RNF-DOM-006).** Dado que existe `miempresa.com`, cuando un técnico registra `WWW.MiEmpresa.com ` (con espacio), entonces se rechaza como repetido indicando dónde está; con dos intentos simultáneos de un nombre nuevo se crea uno solo.
- **CA-DOM-02 (vigencia con reloj fijado; RF-DOM-004, 005, RN-DOM-006, RNF-DOM-003).** Dado un dominio que vence el 20/03/2027 y el reloj fijado en 20/03/2027 23:59 de la zona de la empresa, entonces sigue Activo; con el reloj en 21/03/2027 00:00 aparece Vencido en el panel sin que corra ningún proceso.
- **CA-DOM-03 (avisos con dos empresas; RF-DOM-006, 019, RNF-DOM-002).** Dado un certificado de la empresa A que vence en 30 días y otro de la B que vence en 7, cuando se dispara manualmente el proceso diario con el reloj fijado, dos veces, entonces cada aviso queda en su empresa, con sus destinatarios, una sola vez por elemento, umbral y destinatario, sin costos ni nombres de personas; un corte a la mitad se recupera al reiniciar sin perder avisos.
- **CA-DOM-04 (renovación de dominio; RF-DOM-007, 015).** Dado un dominio Vencido dentro del período de gracia, cuando un técnico registra la renovación con nueva fecha, entonces vuelve a Activo, el evento queda en el historial con el vencimiento anterior y el nuevo, y los avisos pendientes se cancelan.
- **CA-DOM-05 (reemplazo de certificado; RF-DOM-002, 003, 008).** Dado un certificado Vigente, cuando se registra uno nuevo como su reemplazo, entonces el anterior pasa a Reemplazado, queda enlazado y el nuevo hereda los dominios vinculados.
- **CA-DOM-06 (sin secretos; RN-DOM-010, RNF-DOM-005).** Dado un formulario de certificado, cuando alguien pega en las notas un texto que empieza con `-----BEGIN PRIVATE KEY-----`, entonces el validador común lo rechaza con "No guardamos claves privadas" y el texto no se almacena ni se audita.
- **CA-DOM-07 (permiso denegado; RF-DOM-010, RN-DOM-014, RNF-DOM-004).** Dado un Técnico sin `dominios.cambiar_titular`, cuando intenta cambiar el titular por pantalla o por llamada directa al servidor, entonces recibe "Sin permiso" y el titular no cambia; el Administrador con reautenticación vencida debe reautenticarse, y la auditoría guarda que el campo cambió, **sin el nombre** del titular.
- **CA-DOM-08 (aislamiento; RN-DOM-001).** Dado el dominio D de la empresa A, cuando la empresa B registra el mismo nombre, entonces se crea sin ningún aviso de duplicado y B no ve ningún dato de A; si B pide el identificador interno de D, recibe "No encontrado"; el rol de la aplicación no ve filas de A aunque la consulta omita el filtro.
- **CA-DOM-09 (cese sin bloqueo; RF-DOM-011, 018, RN-DOM-012).** Dado un dominio con responsable Ana y suplente Luis, cuando Ana es cesada, entonces el cese se completa, el dominio aparece en su ficha como pendiente y queda con "responsable inactivo", los avisos van a Luis y al grupo y se crea la tarea en offboarding; anonimizar a Ana se rechaza mientras no se reasigne.
- **CA-DOM-10 (riesgo de titular y baja; RF-DOM-009, 012).** Dado un dominio con titular "Otro", cuando Jefatura TI abre el informe de riesgos, entonces aparece con la marca; al cambiar el titular a "La empresa" con motivo sale del informe; un Técnico que intenta dar de baja el dominio recibe "Sin permiso".
- **CA-DOM-11 (segunda persona y respaldo; RF-DOM-016, 017, RN-DOM-016, 017).** Dado un límite de aprobación de 1.000 en moneda base, cuando un técnico registra una renovación de exactamente 1.000, entonces no se exige otra persona; con 1.000,01 el costo queda pendiente de confirmación, el mismo técnico no puede confirmarlo, Jefatura TI sí, y solo entonces entra al libro de costos; el dominio sigue avisando durante la espera; sin orden ni contrato queda "Sin respaldo de compra"; con la casilla «contratos» apagada ninguna llamada directa a la API permite la excepción.
- **CA-DOM-12 (importación; RF-DOM-013).** Dado una plantilla de 50 registros con una fecha de vencimiento anterior a la de emisión en una fila, cuando se confirma, entonces no se carga ninguno y el reporte indica fila, columna y motivo; un archivo ya confirmado se rechaza entero al volver a subirlo.
- **CA-DOM-13 (exportación y alcance; RF-DOM-014, RNF-DOM-007).** Dado un usuario Solo lectura sin `datos.exportar`, cuando abre la lista, entonces "Exportar" está visible y desactivado con la razón, no ve costos ni el titular persona natural (ve `PRS-`), y con el permiso la exportación pide motivo y omite esas columnas según sus permisos.
- **CA-DOM-14 (escritura con referencias cruzadas; RN-DOM-001).** Dado un usuario de B con permiso de editar, cuando envía por llamada directa un certificado de B que apunta a un dominio, un registrador o un responsable de A (por identificador interno), entonces recibe "No encontrado" y no se escribe nada.

## 11. Casos límite

- Dominio con un certificado comodín y otro específico: ambos se vinculan; el informe no los marca como duplicados.
- Certificado de 90 días con renovación automática (ej. Let's Encrypt): avisa solo a 15, 7 y 1 día; si la renovación falla, el aviso de 7 días sirve de alarma.
- Dominio transferido a otro titular: se da de baja con "Transferido a otro titular"; si vuelve, se registra uno nuevo (RN-DOM-024).
- Dominio internacional con tildes o ñ: se compara en su forma técnica.
- Un certificado cubre dominios que luego se dan de baja: el vínculo se cierra con fecha y queda "sin dominio" en el informe.
- Responsable y suplente ambos cesados: los avisos van al grupo; si está vacío, a los Administradores.
- Costo sobre el límite pendiente de confirmación cuando el dominio está por vencer: el registro sigue avisando; se informa a quien confirma.
- Dominio vencido hace meses al importar: entra Vencido y avisa una vez (umbral 0); aparece en "Vencido sin atender".
- Titular persona natural: dato personal; solo se ve con `datos_personales.ver` y se sobrescribe al anonimizar.
- Dos empresas del mismo grupo con el mismo dominio: cada una lo registra aparte; no hay aviso ni vínculo entre ellas.
- Zona horaria cambiada: las fechas de calendario no cambian; la vigencia y los avisos pendientes se recalculan.
- Texto con forma de clave privada pegado en "instalado en": se rechaza (RN-DOM-010).
- Corte de conexión durante una importación: queda todo o nada.

## 12. Decisiones propuestas y supuestos

Resultado de cada supuesto según D-057 y D-058.

| ID | Supuesto | Resultado |
|---|---|---|
| SUP-DOM-01 | Fase 2; se construye primero de los tres. | **Confirmado** (D-056: DOM abre la ola B). |
| SUP-DOM-02 | No hay consulta automática a internet. | **Confirmado** como diseño del módulo; una consulta automática exigiría salir a internet desde el servidor y se evaluaría con Seguridad y Arquitecto. |
| SUP-DOM-03 | No se guardan claves privadas, archivos ni contraseñas. | **Confirmado.** Se rechaza con el validador común (D-063.2). |
| SUP-DOM-04 | Umbrales 90/60/30/15/7/1 y recordatorio semanal tras vencer. | **Cambiado:** umbrales por defecto de Notificaciones más 1 día y el día del vencimiento; se retira el recordatorio semanal propio. |
| SUP-DOM-05 | El titular persona natural es dato personal. | **Confirmado** (D-058): dato de la lista cerrada de D-030.6; la auditoría no guarda su valor; L-09 pendiente de legal. |
| SUP-DOM-06 | La baja de una Persona no se bloquea por dominios o certificados. | **Confirmado** (D-058, D-061.7): el cese nunca se bloquea; se bloquea anonimizar. |
| SUP-DOM-07 | El dominio se renueva en el mismo registro; el certificado se reemplaza. | **Confirmado** como diseño del módulo. |
| SUP-DOM-08 | "Sin respaldo de compra" marca y avisa, no bloquea. | **Confirmado** (D-043.5). |
| SUP-DOM-09 | Cuatro motivos fijos de baja de dominio. | **Confirmado.** |
| SUP-DOM-10 | Los avisos pasan por Notificaciones con variables cerradas. | **Confirmado** (D-062.3). |
| SUP-DOM-11 | "Instalado en" es texto libre hasta que la CMDB defina el enlace. | **Confirmado.** |
| SUP-DOM-12 | Módulo activable por empresa. | **Confirmado** (D-037 fila 12). |
| SUP-DOM-13 | Costo comprometido = importe total con impuesto de la compra o renovación; sobre el límite lo confirma otra persona; el registro opera mientras tanto; la casilla del interruptor único para dominios y certificados no está asignada en D-043 (se propone «contratos»). | **Propuesto**, a confirmar por el Gerente de TI (D-043 no define esta medida para dominios y certificados). |
| SUP-DOM-14 | Clave natural de importación: dominio = nombre normalizado; certificado = emisor + número de serie, o nombre común + emisor + vencimiento si no hay serie. | **Propuesto**, a confirmar por el Ingeniero de Datos (D-050.4). |

No hay [ESCALAR AL CEO]: los costos de correo ya están escalados; este módulo no agrega dinero, tema legal nuevo ni nada irreversible. La pregunta legal L-09 sobre el titular persona natural ya está en el escalado de Cumplimiento.

## 13. Fuera de alcance

- Comprar, renovar o transferir dominios; emitir certificados.
- Configurar o administrar el DNS.
- Almacenar claves privadas, archivos de certificado o contraseñas.
- Monitoreo de que el sitio esté en línea o de que el certificado instalado coincida con el registrado.
- Consulta automática de fechas en internet (SUP-DOM-02).
- Adjuntos (certificado, contrato; D-022).
- Conversión de monedas.
- Vínculo automático con servicios (lo hace la CMDB).
- Portal del empleado: este módulo no se ofrece allí.

## 14. Historial de cambios

| Cambio | Decisión o hallazgo que lo motiva |
|---|---|
| Versión 0.2. Requisitos con columnas ID · Requisito · Cuándo · CA; cada criterio cita su requisito; supuestos resueltos en tabla. | Plan de correcciones, regla 0.2; H-AUD-21; D-057, D-058 |
| Segunda persona con la regla única RN-017 (supera estrictamente el límite): el costo sobre el límite lo confirma otra persona; marca "Sin respaldo de compra" (no bloquea); casilla «contratos» del interruptor único; sin excepción propia. Costo comprometido definido como SUP-DOM-13. | D-043, D-031; H-CUM-02, H-QA-09 |
| El titular persona natural es dato personal de la lista cerrada: la auditoría no guarda su valor; solo se ve con `datos_personales.ver`; `dominios.cambiar_titular` con reautenticación reciente; el historial de titulares es dato personal declarado y anonimizable. | D-030.6, D-048.2, D-058; H-CUM-01, H-SEG |
| Permisos con los PS-nn del registro; `datos.exportar` (PS-20) y `datos.importar` (PS-21) únicos; se retiraron `dominios.exportar` y `dominios.importar`; Jefatura TI sin exportar; baja de dominios solo Administrador; columna "Empleado (portal): no aplica". | D-036, D-037 fila 1; registro de permisos |
| Responsable y suplente son Personas; el cese genera pendiente y tarea, "responsable inactivo" calculado, no bloquea; se bloquea anonimizar. | D-061.7, D-034, D-033.3, D-058 |
| Vigencia calculada al leer; se retiraron las transiciones "Automático", el RNF de "1 hora" y el cambio nocturno de estado. Estados visibles Activo/Vencido y Vigente/Vencido se calculan. | D-062.2 |
| Avisos por el motor único de Notificaciones con los umbrales por defecto más 1 día y el día del vencimiento (apartamiento justificado); se retiraron los recordatorios semanales propios; el módulo no tiene procesos propios. | D-062.3, D-058 fila 3, D-038.4 |
| El texto con forma de clave privada se rechaza con el validador común, no con uno propio. | D-063.2 |
| "Instalado en" queda como texto libre hasta que la CMDB defina el enlace; la CMDB lee de DOM y da identificador estable. | D-062.1; plan de correcciones, fila DOM (7) |
| Patrón de costo común con `fuente_costo`; orden de compra > contrato > propio; libro único en `presupuesto-costos`. | D-044.1 a 3 |
| Importación con el marco único (claves naturales propuestas) y exportación con la puerta única; se retiró la pantalla de importación propia. | D-050, D-061.1 |
| Datos personales declarados en la sección 6; "Persona anonimizada 0042"; Persona Cesada; vocabulario "Cliente (CEO)", "usted". | D-061.3, D-049.5 |
| Pruebas nuevas: procesos con dos empresas y reloj fijable (CA-DOM-03), vigencia con reloj fijado (CA-DOM-02), borde exacto del límite (CA-DOM-11), escritura con referencias cruzadas (CA-DOM-14), aislamiento por identificador interno y rol de la aplicación (CA-DOM-08), permiso denegado con reautenticación (CA-DOM-07). | D-039.6, D-063.6, D-038.8; QA y Seguridad |
| Prefijos `PAN-DOM-nn`. | D-049 |
