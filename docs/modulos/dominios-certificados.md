# Módulo: Dominios y certificados (DOM)

**Versión:** 0.1 · **Autor:** Analista de Negocio, escuadrón B · **Estado:** borrador para revisión del Gerente de TI
**Base:** decisiones D-001 a D-029 (`docs/equipo/decisiones.md`), en especial D-004, D-006, D-014, D-018, D-019, D-021 y D-024.

---

## 1. Propósito, alcance y fase

**Propósito.** Que ningún dominio ni certificado de seguridad venza sin que alguien lo sepa a tiempo. Un dominio vencido deja sin página web y sin correo a la empresa; un certificado vencido hace que los navegadores muestren "sitio no seguro". El módulo guarda qué existe, de quién es, quién responde por él, cuándo vence y avisa antes.

**Entra**
- Dominios: nombre, registrador, titular, responsable, vencimiento, renovación automática y costo.
- Certificados digitales (principalmente TLS/SSL): nombre cubierto, emisor, vigencia, dónde está instalado y responsable.
- Vínculo entre un certificado y los dominios que protege.
- Alertas de vencimiento con varios umbrales.
- Registro de cada renovación (historial de fechas y costos).
- Importación inicial y exportación.

**No entra**
- Comprobar en internet si el dominio o certificado realmente existe o vence (no hay consulta automática, ver SUP-DOM-02).
- Renovar, comprar o emitir certificados; configurar DNS.
- **Guardar claves privadas, archivos de certificado o contraseñas del registrador.**
- Monitoreo de disponibilidad del sitio.
- Adjuntos (D-022).

**Fase.** [SUPUESTO] SUP-DOM-01: **Fase 2, después de la v1**, y es el primero que se recomienda construir de los tres módulos de esta oleada porque no depende del inventario (solo de Empresas, Personas y proveedores) y evita caídas de servicio. Cada empresa puede activarlo o no.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Dominio** | Nombre de internet de la empresa (ej. `miempresa.com`). Se alquila por años a un registrador. |
| **Registrador** | La empresa donde se compró el dominio (ej. GoDaddy, NIC). Es un proveedor del catálogo. |
| **Titular** | A nombre de quién está registrado el dominio. Debe ser la empresa; si figura una persona o un tercero, es un riesgo. |
| **Certificado digital** | Archivo que prueba la identidad de un sitio o servicio y activa el candado del navegador. Caduca. |
| **TLS/SSL** | Tipo más común de certificado: protege sitios web. |
| **Nombre común y nombres alternativos** | Los sitios que cubre (ej. `www.miempresa.com`, `*.miempresa.com`). El asterisco cubre todos los subdominios. |
| **Emisor (CA)** | Quien emite el certificado (ej. DigiCert, Let's Encrypt). |
| **Responsable / Suplente** | Personas (D-006) que responden por renovarlo. |
| **Responsable inactivo** | El responsable fue dado de baja; hay que asignar otro. |
| **Vencimiento** | Fecha de calendario hasta la que vale (incluida). |
| **Por vencer** | Indicador (no estado): quedan menos días que el umbral. |
| **Renovación** | Extender un dominio o reemplazar un certificado. |
| **Renovación automática** | El proveedor renueva solo y cobra. Es un dato informativo. |

## 3. Roles y permisos

Alcance: **Todo** o **Propio** (lo que la Persona vinculada tiene como responsable o suplente). Valores predeterminados, editables.

| Acción | Permiso | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver dominios y certificados | `dominios.ver` | Todo | Todo | Todo | — | Propio | Todo |
| Ver costos | `precios.ver` | Sí | Sí | — | — | — | — |
| Ver nombre de responsable y titular persona | `datos-personales.ver` | Sí | Sí | Sí | — | Propio | — |
| Crear y editar dominios y certificados | `dominios.crear` / `dominios.editar` | Sí | — | Sí | — | — | — |
| Registrar una renovación | `dominios.registrar-renovacion` | Sí | Sí | Sí | — | — | — |
| Dar de baja o revocar | `dominios.baja` | Sí | Sí | — | — | — | — |
| Cambiar titular o responsable | `dominios.cambiar-titular` | Sí | Sí | — | — | — | — |
| Importar | `dominios.importar` | Sí | — | — | — | — | — |
| Exportar | `dominios.exportar` | Sí | Sí | — | — | — | — |
| Configurar umbrales de aviso | `dominios.configurar` | Sí | — | — | — | — | — |
| Recibir avisos | `dominios.recibir-avisos` | Sí | Sí | Sí | — | — | — |
| Ver auditoría del módulo | `auditoria.ver` | Sí | Sí | — | — | — | — |

Separación de funciones: cambiar el **titular** es sensible (se puede perder el control del dominio), por eso es un permiso aparte de editar. Un rol nuevo parte sin permisos. Todo se comprueba en el servidor.

## 4. Requisitos

### 4.1 Requisitos funcionales

- **RF-DOM-001** Registrar un dominio con: nombre, registrador, titular, responsable, suplente (opcional), fecha de registro, fecha de vencimiento, renovación automática, costo anual, centro de costo, dónde se administra el DNS (texto) y notas.
- **RF-DOM-002** Registrar un certificado con: tipo, nombre común, nombres alternativos, emisor, proveedor, número de serie (opcional), fecha de emisión, fecha de vencimiento, forma de renovación (manual o automática), dónde está instalado (texto), responsable, suplente, costo y centro de costo.
- **RF-DOM-003** Vincular un certificado a uno o más dominios de la empresa.
- **RF-DOM-004** Mostrar el estado de cada registro y los días que faltan para su vencimiento.
- **RF-DOM-005** Panel "Por vencer": dominios y certificados ordenados por fecha, con filtro por días y responsable.
- **RF-DOM-006** Avisos por correo con umbrales configurables, al responsable, al suplente y al grupo.
- **RF-DOM-007** Registrar la renovación de un dominio: nueva fecha de vencimiento, importe, moneda, fecha de pago, orden de compra (opcional) y quién la registró. El dominio sigue siendo el mismo registro.
- **RF-DOM-008** Registrar la renovación de un certificado creando un certificado nuevo enlazado al anterior; el anterior pasa a Reemplazado.
- **RF-DOM-009** Dar de baja un dominio o un certificado con motivo; revocar un certificado con motivo.
- **RF-DOM-010** Cambiar el titular o el responsable con motivo; el historial conserva todos.
- **RF-DOM-011** Marcar "Responsable inactivo" automáticamente cuando la Persona responsable es dada de baja, y avisar al grupo.
- **RF-DOM-012** Informe de riesgos: titular distinto de la empresa, sin responsable activo, vencidos, certificados sin dominio, dominios con certificados vencidos.
- **RF-DOM-013** Importar dominios y certificados desde la plantilla (vista previa, todo o nada, D-020).
- **RF-DOM-014** Buscar por nombre, emisor, registrador, responsable; filtrar por estado, vencimiento y centro de costo; exportar (D-021).
- **RF-DOM-015** Historial de cada registro: cambios, renovaciones, titulares y responsables.
- **RF-DOM-016** "Mis dominios y certificados": lo que tengo a mi cargo.
- **RF-DOM-017** Calcular el costo mensual equivalente (anual ÷ 12) y exponerlo a `presupuesto-costos`.
- **RF-DOM-018** Listar "pendientes de la Persona" (dominios y certificados vigentes a su cargo) para `onboarding-offboarding`.
- **RF-DOM-019** Configurar por empresa los umbrales de aviso y el grupo destinatario.

### 4.2 Reglas de negocio

- **RN-DOM-001** Todo dato lleva empresa. Registrador, Persona, orden de compra, centro de costo y dominio vinculado deben ser de la misma empresa. Un identificador de otra empresa responde "no encontrado" (D-025, D-021.5). **La plataforma nunca avisa que otra empresa tiene el mismo dominio.**
- **RN-DOM-002** El nombre del dominio se guarda en minúsculas, sin espacios, sin punto final ni "www." inicial; los caracteres especiales se comparan en su forma técnica. Es **único por empresa** entre los registros que no están dados de baja.
- **RN-DOM-003** Un certificado exige nombre común y fecha de vencimiento. La fecha de vencimiento no puede ser anterior a la de emisión.
- **RN-DOM-004** El certificado puede cubrir dominios con comodín (`*.miempresa.com`); se vincula al dominio registrado `miempresa.com`. Se permite certificado sin dominio vinculado (servicios internos); sale en el informe de riesgos.
- **RN-DOM-005** El número de serie del certificado, si se escribe, es único por empresa y emisor.
- **RN-DOM-006** La fecha de vencimiento es de calendario (sin hora) y vale **hasta el final de ese día** en la zona horaria de la empresa (D-021.4). Pasa a Vencido al empezar el día siguiente.
- **RN-DOM-007** Un dominio Vencido que se renueva a tiempo del período de gracia del registrador vuelve a Activo al registrar la renovación. Si no se recupera, se da de baja con el motivo "Perdido".
- **RN-DOM-008** Un certificado no se "renueva": se **reemplaza**. El anterior queda Reemplazado y enlazado. Un dominio sí conserva su registro y suma un evento de renovación.
- **RN-DOM-009** Los eventos de renovación no se editan ni se borran. Una equivocación se corrige con una corrección con motivo, auditada.
- **RN-DOM-010** **La plataforma no guarda claves privadas, archivos de certificado, usuarios ni contraseñas de registradores o de DNS.** Los campos de texto avisan: "No escriba claves ni contraseñas aquí". Si un texto parece una clave privada, se rechaza.
- **RN-DOM-011** El responsable debe ser una Persona activa de la empresa. El suplente, si existe, también y distinta del responsable.
- **RN-DOM-012** Si la Persona responsable es dada de baja, el registro **no se bloquea**: pasa a "Responsable inactivo", los avisos van al suplente y al grupo, y se crea una tarea para el Administrador (acuerdo con el escuadrón D). La baja de la Persona **no** se impide por esto.
- **RN-DOM-013** Titular: se elige "La empresa" u "Otro (razón social o nombre, texto)". Si es "Otro", el registro se marca de riesgo y aparece en el informe. [SUPUESTO] SUP-DOM-05
- **RN-DOM-014** Cambiar el titular o el responsable exige `dominios.cambiar-titular` y motivo, y queda con valor anterior y nuevo en la auditoría.
- **RN-DOM-015** Costos: importe **sin impuesto** con 4 decimales exactos, % de impuesto, moneda de 3 letras, periodicidad anual o única. Una moneda por registro y sin conversión (D-014). Se ven solo con `precios.ver`.
- **RN-DOM-016** Si se enlaza una orden de compra, el gasto cuenta en la orden y `presupuesto-costos` no lo duplica. Si el costo supera el monto límite de aprobación de la empresa (D-015.1; en otra moneda siempre cuenta como superior) y no hay orden de compra, el registro queda **"Sin respaldo de compra"**, visible y avisado a Jefatura TI. No se bloquea para no perder un dominio.
- **RN-DOM-017** Los avisos usan los umbrales de la empresa: por defecto 90, 60, 30, 15, 7 y 1 día antes de vencer, el día del vencimiento, y luego cada 7 días (máximo 4) mientras siga Vencido sin atender. Un certificado con renovación automática avisa solo a 15, 7 y 1 día (por si la renovación falló).
- **RN-DOM-018** Los avisos no incluyen costos ni nombres de personas. Solo nombre del elemento, fecha y días restantes.
- **RN-DOM-019** Una vez registrada la renovación o la baja, los avisos pendientes se cancelan. Si el vencimiento se corrige a una fecha futura, se cancelan y recalculan.
- **RN-DOM-020** Nada con historial se borra: se da de baja, se revoca o se reemplaza. Solo se borra un Borrador sin efecto (importación no confirmada).
- **RN-DOM-021** "Solo lectura" no ve costos ni nombres de responsables salvo que se active (D-004.4). El nombre del titular, si es una persona natural, solo se ve con `datos-personales.ver`.
- **RN-DOM-022** Al anonimizar una Persona (D-024), responsable y suplente históricos conservan la referencia "Persona dada de baja 0042".
- **RN-DOM-023** Un dominio de baja puede registrarse otra vez como dominio nuevo (cuando se vuelve a comprar); el anterior queda en el historial. No hay reingreso.

### 4.3 Requisitos de calidad

- **RNF-DOM-001** El panel "Por vencer" con 2.000 registros carga en 2 segundos o menos (95 %). Volumen supuesto hasta tener la cifra real (pendiente #4).
- **RNF-DOM-002** Los avisos del día se generan antes de las 08:00 hora de la empresa y nunca se repite el mismo aviso (elemento, umbral, destinatario) en el mismo día.
- **RNF-DOM-003** Un registro pasa a Vencido a más tardar 1 hora después de medianoche de la empresa.
- **RNF-DOM-004** El 100 % de los cambios de fecha, titular, responsable, estado y costo deja auditoría con antes y después.
- **RNF-DOM-005** Una prueba automática no encuentra en la base de datos, auditoría ni registros técnicos ningún texto con formato de clave privada.
- **RNF-DOM-006** Dos personas registrando el mismo dominio a la vez: exactamente un registro se crea.
- **RNF-DOM-007** Lista y ficha usables en celular y teclado; el estado se muestra con texto, no solo color (D-021.1).

## 5. Estados y transiciones

### 5.1 Dominio

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Activo | `dominios.crear` | Vencimiento hoy o futuro |
| (nuevo) | Vencido | `dominios.crear` | Alta de un dominio ya vencido (importación o recuperación) |
| Activo | Vencido | Automático | Pasa el vencimiento (RN-DOM-006) |
| Vencido | Activo | `dominios.registrar-renovacion` | Registra renovación con nueva fecha |
| Activo, Vencido | Dado de baja | `dominios.baja` | Motivo: No se renueva; Transferido a otro titular; Perdido; Otro (con texto) |

"Por vencer" no es estado. Dado de baja es final.

### 5.2 Certificado

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Vigente | `dominios.crear` | Vencimiento hoy o futuro |
| Vigente | Vencido | Automático | Pasa el vencimiento |
| Vigente, Vencido | Reemplazado | `dominios.registrar-renovacion` | Existe un certificado nuevo enlazado |
| Vigente, Vencido | Revocado | `dominios.baja` | Motivo obligatorio (ej. clave comprometida) |
| Vigente, Vencido | Dado de baja | `dominios.baja` | Motivo: Ya no se usa; Otro |

Reemplazado, Revocado y Dado de baja son finales. No hay otras transiciones.

## 6. Datos

**Dominio.** Empresa; identificador interno estable; nombre normalizado (único por empresa si no está de baja); registrador (proveedor); titular (La empresa u Otro + texto); responsable; suplente; fecha de registro; vencimiento; renovación automática; costo anual (importe sin impuesto, % impuesto, moneda); centro de costo; DNS administrado en (texto); estado; marca de "Sin respaldo de compra"; notas; contrato de PRV enlazado (opcional).

**Certificado.** Empresa; identificador estable; tipo (TLS/SSL, firma de código, correo seguro, otro); nombre común; nombres alternativos (lista de texto); emisor; proveedor; número de serie (opcional; único por empresa y emisor); emisión; vencimiento; renovación (manual/automática); instalado en (texto); responsable; suplente; costo; centro de costo; estado; certificado anterior (si reemplaza); notas.

**Vínculo certificado-dominio.** Certificado; dominio; desde; hasta.

**Evento de renovación (dominio).** Dominio; fecha de pago; vencimiento anterior y nuevo; importe y moneda; orden de compra (opcional); quién lo registró. No se edita.

**Cambio de titular o responsable.** Registro; valor anterior y nuevo; motivo; fecha; quién.

**Configuración de la empresa.** Umbrales de aviso para dominios y para certificados; grupo destinatario.

**Se audita** (D-018): altas, cambios con antes y después, renovaciones, reemplazos, bajas y revocaciones, cambios de titular y responsable, importaciones, exportaciones, cambios de configuración y consultas a la auditoría del módulo. No se guarda ninguna clave, archivo ni contraseña.

## 7. Pantallas necesarias

| Pantalla | Propósito | Rol principal |
|---|---|---|
| Panel "Por vencer" | Vista de lo que vence pronto y lo ya vencido | Jefatura TI |
| Lista de dominios | Buscar, filtrar y exportar | Técnico |
| Ficha del dominio | Datos, certificados vinculados, renovaciones, historial | Técnico |
| Lista de certificados | Buscar, filtrar y exportar | Técnico |
| Ficha del certificado | Datos, dominios cubiertos, certificado anterior | Técnico |
| Alta / edición | Formularios con advertencia de no escribir claves | Técnico |
| Registrar renovación / reemplazo | Asistente corto | Técnico |
| Baja o revocación | Diálogo con motivo | Jefatura TI |
| Informe de riesgos | Titular ajeno, sin responsable, sin certificado vigente | Jefatura TI |
| Importación | Plantilla, simulacro y confirmación | Administrador |
| Configuración de avisos | Umbrales y destinatarios | Administrador |
| Mis dominios y certificados | Lo que tengo a mi cargo | Solicitante |

## 8. Notificaciones y automatismos

Declaramos las reglas; `notificaciones` envía, evalúa una vez al día y no repite (acuerdo con el escuadrón C). Textos con nombre del elemento, fecha y días.

| Cuándo | A quién | Qué dice |
|---|---|---|
| 90, 60, 30, 15, 7 y 1 día antes del vencimiento de un dominio | Responsable, suplente y grupo con `dominios.recibir-avisos` | "El dominio miempresa.com vence el 20/03/2027 (faltan 30 días)." |
| Igual para certificados (si es automático, solo 15, 7 y 1) | Mismos | "El certificado *.miempresa.com vence el 20/03/2027 (faltan 7 días). Renueve o reemplácelo." |
| Día del vencimiento y cada 7 días (máximo 4) | Mismos y Jefatura TI | "El dominio miempresa.com venció. Un dominio vencido puede dejar sin web ni correo." |
| El responsable pasa a inactivo | Suplente y grupo | "El dominio miempresa.com no tiene responsable activo. Asigne uno." |
| Registro confirmado "Sin respaldo de compra" | Jefatura TI | "La renovación de miempresa.com se registró sin orden de compra." |
| Todas las noches | Automático | Pasar a Vencido; marcar responsables inactivos; cancelar avisos de lo ya renovado o dado de baja. |

Depende del servicio de correo ya escalado al CEO; no agrega gasto.

## 9. Integración con el núcleo y otros módulos

- **Empresas y Personas (núcleo y D).** Responsable y suplente son Personas. La baja de una Persona **no se bloquea** por esto: `onboarding-offboarding` muestra "pendientes de la Persona" (dominios y certificados a su cargo) y crea una tarea; DOM marca "Responsable inactivo".
- **Proveedores (PRV, escuadrón A).** El registrador y el emisor salen del catálogo de proveedores. Un contrato de PRV puede enlazarse (opcional); PRV es dueño de contrato, SLA y valor del período.
- **Órdenes de compra.** Vínculo opcional por renovación. Con orden, cuenta la orden.
- **Presupuesto y reportes (F).** Leen costo mensual equivalente, centro de costo, vencimientos y estados. No escriben.
- **Notificaciones (C).** Ejecutan el envío de la sección 8.
- **CMDB (E).** Crea un elemento por dominio y por certificado (referencia, nombre y estado; el vencimiento se consulta). Las relaciones ("el servicio X depende del certificado Y") viven en la CMDB. DOM da un identificador estable y avisa cuando un registro pasa a Dado de baja, Reemplazado o Revocado. Hoy "instalado en" es un texto libre; se puede reemplazar por un enlace de solo lectura a la relación de la CMDB.
- **Gestión de cambios (E).** Reemplazar un certificado de producción puede ser un cambio; el vínculo es opcional y lo define ese módulo.
- **Auditoría (núcleo).** D-018.

## 10. Criterios de aceptación

- **CA-DOM-01 (alta y unicidad).** Dado que existe `miempresa.com`, cuando un técnico registra `WWW.MiEmpresa.com `, entonces se rechaza como repetido y se indica dónde está; con dos intentos simultáneos de un nombre nuevo se crea uno solo.
- **CA-DOM-02 (vencimiento).** Dado un dominio que vence el 20/03/2027, cuando llega el 21/03/2027 en la zona horaria de la empresa, entonces pasa a Vencido y aparece en el panel como vencido.
- **CA-DOM-03 (aviso sin duplicados).** Dado un certificado que vence en 30 días, cuando el proceso diario corre dos veces el mismo día, entonces el responsable, el suplente y el grupo reciben un solo aviso cada uno, sin costos ni nombres de personas.
- **CA-DOM-04 (renovación de dominio).** Dado un dominio Vencido dentro del período de gracia, cuando un técnico registra la renovación con nueva fecha, entonces vuelve a Activo, el evento queda en el historial con el vencimiento anterior y nuevo, y los avisos pendientes se cancelan.
- **CA-DOM-05 (reemplazo de certificado).** Dado un certificado Vigente, cuando se registra un certificado nuevo como su reemplazo, entonces el anterior pasa a Reemplazado, queda enlazado y el nuevo hereda los dominios vinculados.
- **CA-DOM-06 (sin secretos).** Dado un formulario de certificado, cuando alguien pega en las notas un texto que empieza con `-----BEGIN PRIVATE KEY-----`, entonces se rechaza con "No guardamos claves privadas" y el texto no se almacena ni se audita.
- **CA-DOM-07 (permiso denegado).** Dado un Técnico sin `dominios.cambiar-titular`, cuando intenta cambiar el titular por pantalla o por llamada directa al servidor, entonces recibe "Sin permiso" y el titular no cambia.
- **CA-DOM-08 (aislamiento).** Dado el dominio D de la empresa A, cuando la empresa B registra el mismo nombre, entonces se crea sin ningún aviso de duplicado y B no ve ningún dato de A; si B pide el identificador de D, recibe "No encontrado".
- **CA-DOM-09 (responsable inactivo).** Dado un dominio con responsable Ana y suplente Luis, cuando Ana es dada de baja, entonces la baja se permite, el dominio queda "Responsable inactivo", los avisos van a Luis y al grupo, y se crea la tarea en offboarding.
- **CA-DOM-10 (riesgo de titular).** Dado un dominio con titular "Otro", cuando Jefatura TI abre el informe de riesgos, entonces aparece con la marca de riesgo; al cambiar el titular a "La empresa" con motivo, sale del informe y la auditoría guarda anterior y nuevo.
- **CA-DOM-11 (sin respaldo de compra).** Dado un límite de aprobación de 1.000 y una renovación de 1.500 en la moneda base sin orden de compra, cuando se registra, entonces se guarda con la marca "Sin respaldo de compra" y Jefatura TI recibe el aviso.
- **CA-DOM-12 (importación).** Dado una plantilla con 50 registros y una fecha de vencimiento anterior a la de emisión en una fila, cuando se confirma, entonces no se carga ninguno y el reporte indica fila, columna y motivo.

## 11. Casos límite

- Dominio con un certificado comodín y otro específico: ambos se vinculan; el informe no los marca como duplicados.
- Certificado de 90 días con renovación automática (ej. Let's Encrypt): solo avisa a 15, 7 y 1 día; si la renovación automática falla, el aviso de 7 días sirve de alarma.
- Dominio que pasa por transferencia: se da de baja con "Transferido a otro titular"; si vuelve, se registra uno nuevo (RN-DOM-023).
- Dominio internacional con tildes o ñ: se compara en su forma técnica.
- Un certificado cubre dominios que luego se dan de baja: el vínculo se cierra con fecha y el certificado queda "sin dominio" en el informe.
- Responsable y suplente ambos inactivos: avisos al grupo; si el grupo está vacío, a los Administradores.
- Fecha de vencimiento corregida a una fecha futura: se recalculan los avisos (RN-DOM-019).
- Dominio vencido hace meses al importar: entra Vencido; avisa una vez y repite cada 7 días hasta 4 veces.
- Titular persona natural: puede ser dato personal; solo se ve con `datos-personales.ver` (RN-DOM-021).
- Dos empresas del mismo grupo con el mismo dominio: cada una lo registra aparte; no hay aviso ni vínculo entre ellas.
- Zona horaria cambiada: se recalcula con la zona nueva sin cambiar las fechas.

## 12. Decisiones propuestas y supuestos

- **SUP-DOM-01** [SUPUESTO] Fase 2; se recomienda construirlo primero de los tres por su bajo costo y su valor de prevención.
- **SUP-DOM-02** [SUPUESTO] No hay consulta automática a internet (por ejemplo, leer la fecha real de un certificado). Motivo: la fecha la escribe una persona; una consulta automática exige salir a internet desde el servidor y plantea riesgos de seguridad. Se puede proponer luego como mejora a Seguridad y Arquitecto.
- **SUP-DOM-03** [SUPUESTO] No se guardan claves privadas, archivos de certificado ni contraseñas. Motivo: son secretos de alto valor y su gestión cabe en una herramienta de claves, no en este módulo.
- **SUP-DOM-04** [SUPUESTO] Umbrales: dominios 90, 60, 30, 15, 7 y 1 día; certificados con renovación automática 15, 7 y 1; recordatorio semanal hasta 4 veces tras vencer. Editables por empresa.
- **SUP-DOM-05** [SUPUESTO] El titular es "La empresa" u "Otro (texto)"; "Otro" es riesgo. Cumplimiento debe revisar si un titular con nombre propio es dato personal.
- **SUP-DOM-06** [SUPUESTO] La baja de una Persona no se bloquea por dominios o certificados; genera "Responsable inactivo" y una tarea (acuerdo con escuadrón D). Motivo: las líneas cuestan dinero cada mes; esto es continuidad y la resuelve la tarea.
- **SUP-DOM-07** [SUPUESTO] El dominio se renueva en el mismo registro; el certificado se reemplaza con un registro nuevo. Motivo: el dominio es un bien que dura; el certificado es un documento con número y fechas propios.
- **SUP-DOM-08** [SUPUESTO] "Sin respaldo de compra" marca y avisa, no bloquea.
- **SUP-DOM-09** [SUPUESTO] Las bajas de dominio tienen cuatro motivos fijos (No se renueva; Transferido; Perdido; Otro).
- **SUP-DOM-10** [SUPUESTO] Los avisos pasan por `notificaciones` con variables cerradas; los umbrales se cancelan al renovar.
- **SUP-DOM-11** [SUPUESTO] "Instalado en" es texto libre hasta que la CMDB defina el enlace.
- **SUP-DOM-12** [SUPUESTO] El módulo se activa por empresa.
- **Sin [ESCALAR AL CEO]:** los costos de correo ya están escalados; no se agrega dinero, tema legal ni irreversible.

## 13. Fuera de alcance

- Comprar, renovar o transferir dominios; emitir certificados.
- Configurar o administrar el DNS.
- Almacenar claves privadas, archivos de certificado o contraseñas.
- Monitoreo de que el sitio esté en línea o de que el certificado instalado coincida con el registrado.
- Consulta automática de fechas en internet (SUP-DOM-02).
- Adjuntos (certificado, contrato; D-022).
- Conversión de monedas.
- Vínculo automático con servicios (lo hace la CMDB).
