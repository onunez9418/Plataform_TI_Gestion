# Módulo: Microsoft Entra ID e Intune (MSF)

**Versión:** 0.2 (ajustada a D-081, D-084 y D-085) · **Fecha:** 29/10/2026 · **Autor:** analista-funcional
**Base:** `CLAUDE.md`, `docs/documento-funcional.md` v0.3 (en especial la sección 18), `docs/equipo/decisiones.md` (D-001, D-030, D-048, D-056, D-065 a D-085), `docs/registro-permisos.md` v1.2, y como modelo `integraciones-api.md`, `cmdb-ligera.md`, `personas-ubicaciones.md`, `licencias-software.md` y `onboarding-offboarding.md`.
**Estado:** alcance aceptado por el Gerente de TI; el texto queda pendiente de la verificación del Auditor Técnico, QA, Seguridad y Cumplimiento. **[SUPUESTO]** = propuesta que confirma el Gerente de TI; los ya confirmados dicen "Confirmado (D-085)". **[ESCALAR AL CEO]** = dinero, tema legal o algo irreversible. **[LEGAL]** = depende de la opinión de un abogado (se suma al paquete L-01 a L-16 con las preguntas L-MSF-01 a L-MSF-06 de la sección 12). **[PENDIENTE]** = dato que no está definido y no se inventa.
**Leyenda de "Cuándo":** la columna usa las palabras del núcleo (`Fase 3`) y, entre paréntesis, la parte: **(MSF-1)** conexión y Personas (necesita las Etapas 1 y 2); **(MSF-2)** equipos y conciliación (necesita además las Etapas 4 y 5). **MSF-3 (acciones remotas) no existe en esta versión** (sección 12, S-MSF-03).

---

## 1. Propósito, alcance y fase

**Propósito.** Que cada empresa que lo desee conecte su directorio de cuentas (**Microsoft Entra ID**) y su administración de dispositivos (**Microsoft Intune**) con la plataforma, para tres cosas:
1. Tener al día el directorio de **Personas** con las cuentas de sus empleados, **sin crear nunca usuarios de la plataforma** (D-001).
2. Saber, equipo por equipo, si lo que se compró y se recibió **está de verdad en Intune** y en qué estado: si cumple las reglas de la empresa, cuándo se comunicó por última vez, qué versión del sistema tiene, si está cifrado y quién es su usuario principal.
3. Detectar las **diferencias** entre lo que dice el inventario y lo que ve Intune.

**En esta versión la plataforma solo lee. Nunca modifica nada en Microsoft** ni ejecuta acciones sobre los equipos. Cada empresa decide si conecta; sin conexión, la plataforma funciona igual que hoy.

**Ejemplo.** Se aprueba la OC-000042 por 10 laptops. Almacén confirma la recepción y, como la categoría Laptop está marcada «se gestiona en MDM», los 10 activos nacen con la marca **«Pendiente de enrolar»**. El técnico enrola los equipos en Intune. En la lectura siguiente, 9 aparecen en Intune y se vinculan solos por su número de serie; la marca desaparece y cada ficha muestra su cumplimiento, última comunicación, versión del sistema, cifrado y usuario principal. La décima laptop ya se entregó a Ana Ruiz (`PRS-0042`) hace más días que el umbral de la empresa y sigue sin enrolar: aparece en la conciliación. Además, Intune tiene 2 laptops que no están en el inventario.

**Entra**
1. Conexión de la empresa con su Entra ID e Intune: consentimiento del administrador de **esa** empresa, credenciales por empresa guardadas como secreto, solo permisos de lectura (flujo 1).
2. Lectura de cuentas de Entra y **propuestas** de altas, cambios, bajas y reingresos en Personas, siempre con revisión humana (flujo 2).
3. Marca «se gestiona en MDM» en la categoría y marca calculada «Pendiente de enrolar» en el activo (flujo 3).
4. Lectura de los equipos de Intune, vínculo con el activo por número de serie o IMEI y bloque «Intune» en la ficha del activo (flujo 3).
5. Conciliación: equipos de Intune sin inventario, activos que deberían estar en Intune y no están, diferencias de «asignado a», estados incoherentes y duplicados (flujo 4).
6. Avisos, historial de cumplimiento, lista de equipos con exportación por la puerta única.

**No entra:** acciones remotas (bloquear, borrar, retirar), cualquier escritura en Microsoft, crear Usuarios de la plataforma desde Entra, otros MDM, equipos personales de empleados, medición de uso de licencias, avisos a los empleados, exposición por API pública. Ver sección 13.

**Fase y orden (D-056, D-081).** **Fase 3, ola G**, después de la ola F, con este orden junto al Asistente de IA (ASI): G-1 ASI-A, **G-2 MSF-1**, **G-3 MSF-2**, G-4 ASI-B, G-5 ASI-C. **MSF-1** (conexión y Personas) necesita las Etapas 1 y 2, la gestión de secretos, la cola y NOT-completo (Fase 2, ola A) para los avisos por fecha; es independiente de ASI y no escribe en Microsoft. **MSF-2** (equipos y conciliación) necesita MSF-1 y las Etapas 4 (inventario) y 5 (órdenes de compra y recepción). **Sin adelantos:** MSF-1 podría pasar a después de la ola D solo por decisión escrita del Gerente de TI al cerrar la Etapa 7 (D-056.2); nunca antes. Cada paso termina con una demo que el CEO aprueba antes del siguiente. **Datos reales:** el módulo se construye y se demuestra con datos inventados; usar datos reales de una empresa exige las respuestas legales L-MSF-01 a L-MSF-06; esto no frena la salida de la v1.

**Preparaciones del núcleo aprobadas (D-081.4; ya en el documento funcional):**
- Un campo «se gestiona en MDM» en la categoría, apagado por defecto (Etapa 2; RF-CAT-030).
- Un gancho síncrono para que cada módulo limpie sus datos al anonimizar una Persona (Etapa 2, cuando nace la anonimización manual; RF-DAT-018).

---

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Microsoft Entra ID** | Directorio de cuentas de la empresa en Microsoft (antes llamado Azure Active Directory). Ahí viven las cuentas de los empleados. |
| **Microsoft Intune** | Servicio de Microsoft que administra los dispositivos de la empresa: laptops, celulares, tabletas. |
| **MDM** | Administración de dispositivos móviles. En esta versión **MDM significa solo Microsoft Intune**; otros sistemas (Jamf, Workspace ONE, SOTI, Google) están fuera de alcance. |
| **Microsoft Graph** | La puerta técnica por la que Microsoft permite leer el directorio y Intune. La plataforma solo la usa desde el servidor. |
| **Directorio (tenant)** | El espacio de Microsoft de **una** empresa, con su identificador y su nombre (por ejemplo `miempresa.onmicrosoft.com`). |
| **Consentimiento del administrador** | Autorización que da, dentro de Microsoft, una persona con rol de administrador **de esa empresa**, para que la plataforma lea ciertos datos. Se puede retirar en cualquier momento. |
| **Credencial** | Dato secreto con el que la plataforma se identifica ante Microsoft para leer. Es **por empresa**; se guarda cifrada y nunca se vuelve a mostrar. |
| **Lectura (sincronización)** | Una pasada en la que la plataforma pide a Microsoft los datos y los compara con los suyos. Sucede por programación o a pedido. |
| **Identificador inmutable** | Código que Microsoft asigna a una cuenta y que no cambia aunque la persona cambie de nombre o de correo. Es la forma segura de reconocer a la misma cuenta. |
| **Cuenta vinculada** | Cuenta de Microsoft unida 1 a 1 con una Persona. No es un Usuario de la plataforma. |
| **Propuesta** | Cambio que la lectura sugiere en Personas (alta, cambio, baja, reingreso). **No se aplica sola**: una persona la revisa. |
| **Enrolar** | Registrar un equipo en Intune para que la empresa lo administre. «Pendiente de enrolar» = el activo existe en el inventario y aún no aparece en Intune. |
| **«Se gestiona en MDM»** | Marca de una categoría de equipos físicos (laptop, celular, tableta, PDA) que **deberían** estar en Intune. |
| **Conciliar** | Comparar el inventario con Intune y unir cada activo con su equipo por **número de serie** o **IMEI**. |
| **Vínculo del equipo** | Unión 1 a 1 entre un activo y su registro en Intune. Sigue a la serie, no al identificador de Intune. |
| **Coincidencia dudosa** | Hay más de un candidato o los datos chocan; la plataforma **no vincula sola** y pide decidir. |
| **Cumplimiento** | Resultado de las reglas que la empresa definió dentro de Intune: Cumple, No cumple, En plazo de gracia, Con problema de evaluación, Sin evaluar. La plataforma lo **muestra**, no lo define. |
| **Última comunicación** | Última vez que el equipo habló con Intune. **No** es la última vez que alguien lo usó. Es lo que el pedido llama «última conexión». |
| **Usuario principal** | Persona que Intune registra como usuaria habitual del equipo. |
| **Equipo corporativo / personal** | Intune distingue equipos de la empresa y equipos personales del empleado (BYOD). La plataforma trabaja solo con los corporativos. |
| **Hallazgo** | Diferencia detectada al conciliar. Se calcula al leer; solo se guardan las decisiones de las personas. |
| **Dato al…** | Fecha y hora de la última lectura correcta. Todo dato de Microsoft se muestra con ella. |
| **Reautenticación reciente** | Enlace nuevo o segundo factor de los últimos 10 minutos (D-048.2). |

---

## 3. Roles y permisos

Solo nombres y PS-nn de `docs/registro-permisos.md`. Las filas **PS-241 a PS-246 ya están en el registro** (sección 12B, valores finales de D-084). `microsoft.*` es la lectura del directorio y de Intune; el **ingreso de usuarios con Microsoft** es otro permiso, `integraciones.configurar_metodos_ingreso` (PS-137). Alcance siempre **«todo»**. Todo se comprueba en el servidor (regla 6 de `CLAUDE.md`). **Empleado (portal): no aplica** en esta versión.

| Acción | Permiso (PS) | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver la conexión, las lecturas, la lista de equipos de Intune y el bloque «Intune» de un activo (sin datos personales) | `microsoft.ver` (**PS-241**) | Sí | Sí | Sí | No | No | Sí |
| Ver el activo (requisito para ver su bloque «Intune») | `activos.ver` (PS-43) | Sí | Sí | Sí | Sí | No | Sí |
| Ver usuario principal, IMEI y nombre del equipo en Intune; ver nombres y correos de las propuestas | `datos_personales.ver` (PS-22, sensible) | Sí | Sí | Sí | No | No | No |
| Conectar, reemplazar la credencial, pausar, reanudar y desconectar | `microsoft.conectar` (**PS-242**; **sensible**, el n.º 54 del registro: 2F, R, A) | Sí | No | No | No | No | No |
| Configurar qué se lee (filtros, exclusiones, equivalencias de área, umbrales de días) | `microsoft.configurar` (**PS-243**; A) | Sí | No | No | No | No | No |
| Pedir una lectura manual («Sincronizar ahora») | `microsoft.sincronizar_ahora` (**PS-244**; A, T) | Sí | Sí | Sí | No | No | No |
| Revisar propuestas sobre Personas, descartarlas con motivo y desvincular una cuenta | `microsoft.revisar_personas` (**PS-245**; A) | Sí | Sí | Sí | No | No | No |
| Aplicar una propuesta de alta o de cambio | además `personas.crear_editar` (PS-25) | Sí | No | Sí | No | No | No |
| Aplicar una propuesta de baja o de reingreso | además `personas.cesar` (PS-26) y, si la Persona tiene membresía, `usuarios.suspender` (PS-14) | Sí | Sí (PS-14 solo Admin) | No | No | No | No |
| Aprobar un área nueva que trae la lectura | `estructura.gestionar` (PS-33) | Sí | No | No | No | No | No |
| Conciliar equipos: vincular, desvincular, resolver coincidencias dudosas, ignorar con motivo | `microsoft.conciliar` (**PS-246**; A) | Sí | Sí | Sí | No | No | No |
| Registrar en el inventario un equipo hallado en Intune | además `activos.ingreso_manual` (PS-44) | Sí | No | Sí | No | No | No |
| Marcar una categoría «se gestiona en MDM» | `categorias.gestionar` (PS-34) | Sí | No | No | No | No | No |
| Exportar listas con datos de Intune | `datos.exportar` (PS-20, sensible) | Sí | No | No | No | No | No |
| Ver la auditoría del módulo | `auditoria.ver` (PS-18) | Sí | Sí | No | No | No | No |
| Suspender a toda la empresa (la conexión queda Pausada) | Administrador de plataforma (`plataforma.empresas_gestionar`, PS-01); no ve datos del negocio | n/a | n/a | n/a | n/a | n/a | n/a |

Notas
1. **Una sola fila nueva es sensible: PS-242** (el sensible n.º 54 del registro, D-084.5), porque cambia la puerta de entrada a todos los datos de personas y equipos de la empresa. Seguridad la revisa (D-068, sección 14 del registro).
2. **Revisar no es aplicar.** Quien revisa propuestas necesita además el permiso del módulo Personas que corresponda para aplicarlas; este módulo no da permisos de Personas a nadie (nadie se da más permisos de los que tiene).
3. **Destinatarios de avisos, sin permiso nuevo:** los titulares de PS-242 (conexión y credencial), de PS-245 (propuestas) y de PS-246 (equipos). No se crea un `microsoft.recibir_avisos`.
4. **Ni el Administrador de plataforma ni el soporte** pueden conectar, reemplazar o ver credenciales de una empresa (D-003, D-039.10).
5. **No existe ningún permiso para acciones remotas.** Si algún día se proponen, cada acción tendrá su propio permiso sensible (S-MSF-03).
6. **Casillas del interruptor único (D-066):** este módulo no mueve dinero ni aprueba nada; **no usa ni agrega casillas**. La autoentrega y la anonimización siguen sin casilla.
7. Los errores usan los tres mensajes del catálogo: «No encontrado», «No tiene permiso» y «No se puede por una regla» (D-053).

---

## 4. Requisitos

### 4.1 Funcionales

**Conexión (flujo 1)**

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-MSF-001 | Asistente para conectar la empresa: explica en lenguaje simple qué se leerá y qué no, guía el consentimiento del administrador de Microsoft de esa empresa, prueba la conexión y muestra el **nombre del directorio** para que el Administrador confirme que es el suyo. | Fase 3 (MSF-1) | CA-MSF-01, CA-MSF-02 |
| RF-MSF-002 | Guardar la credencial **por empresa** como secreto: cifrada, aparte, nunca visible después de guardarla. | Fase 3 (MSF-1) | CA-MSF-03 |
| RF-MSF-003 | Conectar **por partes**: solo usuarios (Entra), solo equipos (Intune) o ambos. Cada parte pide y usa únicamente sus propios permisos de lectura. | Fase 3 (MSF-1) | CA-MSF-02 |
| RF-MSF-004 | Mostrar el estado de la conexión, los permisos que tiene concedidos (comprobados antes de cada lectura, RN-MSF-007), la fecha de vencimiento de la credencial cuando Microsoft la informa y la fecha de la última lectura correcta. | Fase 3 (MSF-1) | CA-MSF-04 |
| RF-MSF-005 | Reemplazar la credencial: la nueva se prueba antes; solo si funciona se descarta la anterior. | Fase 3 (MSF-1) | CA-MSF-05 |
| RF-MSF-006 | Pausar y reanudar las lecturas, con motivo al pausar. | Fase 3 (MSF-1) | CA-MSF-06 |
| RF-MSF-007 | Desconectar con motivo: la credencial se elimina en el acto; lo ya leído se conserva marcado «desconectado» según la sección 6. | Fase 3 (MSF-1) | CA-MSF-07 |
| RF-MSF-008 | «Sincronizar ahora» manual, con tope por empresa. | Fase 3 (MSF-1) | CA-MSF-08 |
| RF-MSF-009 | Historial de lecturas: fecha, tipo (cuentas o equipos), resultado y cifras, sin datos personales. | Fase 3 (MSF-1) | CA-MSF-09 |

**Personas (flujo 2)**

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-MSF-010 | Configurar qué cuentas se leen: tipo (miembros; invitados), solo habilitadas, un grupo de Entra opcional y exclusiones por cuenta con motivo. | Fase 3 (MSF-1) | CA-MSF-10 |
| RF-MSF-011 | La **primera lectura** de cuentas es una vista previa: cuántas cuentas hay, cuántas cumplen el filtro, cuántas ya coinciden con una Persona, cuántas serían altas y cuántas no tienen datos suficientes. No crea ni aplica nada. | Fase 3 (MSF-1) | CA-MSF-10 |
| RF-MSF-012 | Unir cuentas con Personas: primero por identificador inmutable ya vinculado; si no, por código de empleado; si no, por correo. Se vincula sola solo la coincidencia única con una Persona Activa. | Fase 3 (MSF-1) | CA-MSF-11 |
| RF-MSF-013 | Generar propuestas: **alta**, **cambio**, **baja** (posible cese), **reingreso** y **para revisión** (coincidencia dudosa o conflicto). | Fase 3 (MSF-1) | CA-MSF-12 |
| RF-MSF-014 | Revisar propuestas (lista con filtros por tipo y estado), aplicarlas una por una o descartarlas con motivo. Aplicar usa el mismo servicio y las mismas reglas que el módulo Personas. | Fase 3 (MSF-1) | CA-MSF-13 |
| RF-MSF-015 | Aplicar propuestas **en bloque** con vista previa obligatoria, informe de las que fallan con su motivo y un lote que se puede anular (RN-MSF-026); la pantalla dice que no es «todo o nada». | Fase 3 (MSF-1) | CA-MSF-14 |
| RF-MSF-016 | Una propuesta de baja abre el asistente de cese de Personas con sus pendientes; si ONB está activo, ofrece iniciar una salida. **Nunca cesa por sí sola.** | Fase 3 (MSF-1) | CA-MSF-15 |
| RF-MSF-017 | Equivalencia entre el departamento de Entra y el área de la plataforma; los departamentos desconocidos se listan para aprobar o mapear y no se crean solos. | Fase 3 (MSF-1) | CA-MSF-16 |
| RF-MSF-018 | La ficha de la Persona indica si tiene cuenta de Microsoft vinculada (sin mostrar el identificador) y permite desvincularla con motivo. | Fase 3 (MSF-1) | CA-MSF-17 |
| RF-MSF-019 | Al anonimizar una Persona se borran el vínculo con su cuenta y toda copia de su nombre de usuario en las lecturas del módulo, en la misma operación. | Fase 3 (MSF-1) | CA-MSF-18 |

**Equipos (flujo 3)**

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-MSF-020 | Usar la marca «se gestiona en MDM» de la categoría (la define el núcleo, sección 9). Al activarla en una categoría con activos existentes, informar cuántos pasarán a «Pendiente de enrolar». | Fase 3 (MSF-2) | CA-MSF-19 |
| RF-MSF-021 | Mostrar la marca calculada **«Pendiente de enrolar»** en la ficha, en la lista de activos y como filtro. No es un estado del activo. | Fase 3 (MSF-2) | CA-MSF-19 |
| RF-MSF-022 | En el resumen previo a confirmar una recepción, indicar «N activos quedarán pendientes de enrolar en Intune». | Fase 3 (MSF-2) | CA-MSF-20 |
| RF-MSF-023 | Leer los equipos de Intune con la lista cerrada de datos de la sección 6, solo los de propiedad corporativa. | Fase 3 (MSF-2) | CA-MSF-21 |
| RF-MSF-024 | Conciliar cada equipo de Intune con un activo por serie y, si no hay, por IMEI; vincular solo la coincidencia única y sin conflicto. | Fase 3 (MSF-2) | CA-MSF-22 |
| RF-MSF-025 | Al crearse un activo (recepción, ingreso manual o importación), buscarlo de inmediato en la última lectura de Intune, sin esperar a la siguiente. | Fase 3 (MSF-2) | CA-MSF-20 |
| RF-MSF-026 | Bloque «Intune» en la ficha del activo: cumplimiento, última comunicación, versión del sistema, cifrado, usuario principal, propiedad, fecha de enrolamiento y «dato al…». | Fase 3 (MSF-2) | CA-MSF-24 |
| RF-MSF-027 | Historial de cambios de cumplimiento de cada equipo (fecha, de qué estado a cuál). | Fase 3 (MSF-2) | CA-MSF-25 |
| RF-MSF-028 | Lista de equipos con Intune, con buscador, filtros (cumplimiento, sin comunicación reciente, cifrado, pendiente de enrolar, categoría, ubicación) y exportación por la puerta única. | Fase 3 (MSF-2) | CA-MSF-26 |
| RF-MSF-029 | Resolver una coincidencia dudosa eligiendo el activo correcto, y desvincular un par con motivo; la decisión se recuerda. | Fase 3 (MSF-2) | CA-MSF-23 |

**Conciliación (flujo 4)**

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-MSF-030 | Panel de conciliación con los nueve hallazgos de la sección 5.3, sus cifras, su prioridad y la fecha de corte. | Fase 3 (MSF-2) | CA-MSF-27 |
| RF-MSF-031 | **En Intune y no en el inventario:** registrar en el inventario (abre el ingreso manual precargado), vincular a un activo existente o ignorar con motivo. | Fase 3 (MSF-2) | CA-MSF-28 |
| RF-MSF-032 | **En el inventario y no en Intune:** listar los activos de categorías marcadas, entregados y sin vínculo pasado el umbral de días de la empresa («entregado sin enrolar»). | Fase 3 (MSF-2) | CA-MSF-20, CA-MSF-27 |
| RF-MSF-033 | **Diferencia de asignado a:** mostrar la Persona asignada y la del usuario principal; la corrección lleva al asistente de Entregas. | Fase 3 (MSF-2) | CA-MSF-29 |
| RF-MSF-034 | **Estado incoherente:** equipo Extraviado o robado que se comunica con Intune, y equipo De baja que sigue en Intune. | Fase 3 (MSF-2) | CA-MSF-30 |
| RF-MSF-035 | **Duplicados y datos distintos:** registros repetidos de la misma serie en Intune, IMEI distinto, propiedad distinta. | Fase 3 (MSF-2) | CA-MSF-31 |
| RF-MSF-036 | Ignorar un hallazgo con motivo (quién y cuándo) y reabrirlo. | Fase 3 (MSF-2) | CA-MSF-28 |
| RF-MSF-037 | En el asistente de cese de Personas, mostrar la línea informativa «N equipos en Intune la tienen como usuario principal». No bloquea. | Fase 3 (MSF-2) | CA-MSF-32 |

**Acciones remotas (flujo 5) y transversales**

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-MSF-038 | **La plataforma no ejecuta ninguna acción sobre equipos ni cuentas de Microsoft** (bloquear, borrar, retirar, restablecer, reiniciar, cambiar contraseñas, deshabilitar cuentas, asignar políticas o aplicaciones). No hay botón, permiso ni ruta para ello. | Fase 3 (MSF-1) | CA-MSF-33 |
| RF-MSF-039 | Declarar a Notificaciones los avisos de la sección 8; no enviar correos por cuenta propia. | Fase 3 (MSF-1) | CA-MSF-34 |
| RF-MSF-040 | Toda pantalla con datos de Microsoft muestra «dato al [fecha y hora de la empresa]» y «dato desactualizado desde…» si la última lectura falló. | Fase 3 (MSF-1) | CA-MSF-35 |
| RF-MSF-041 | Con la empresa suspendida o el módulo apagado, las lecturas se detienen y los datos se ocultan sin borrarse; la API responde «No encontrado» (RF-EMP-005). | Fase 3 (MSF-1) | CA-MSF-36 |
| RF-MSF-042 | Ofrecer a `reportes-tableros` los indicadores «no cumplen», «sin enrolar» y «sin comunicación reciente» mediante filtros reutilizables. | Fase 3 (MSF-2) | CA-MSF-43 |

### 4.2 Reglas de negocio

**Aislamiento, secretos y límites de lo que se lee**

| ID | Regla | Cuándo | CA |
|---|---|---|---|
| RN-MSF-001 | Toda conexión, lectura, propuesta, vínculo y hallazgo lleva empresa. La base impone que las referencias sean de la misma empresa (D-039). Un identificador de otra empresa responde «No encontrado». | Fase 3 (MSF-1) | CA-MSF-37 |
| RN-MSF-002 | Las credenciales son **por empresa** y nunca se comparten ni se reutilizan: una credencial solo sirve para leer su propio directorio. Un fallo o un exceso de uso de una conexión no afecta a las de otras empresas. | Fase 3 (MSF-1) | CA-MSF-03, CA-MSF-37 |
| RN-MSF-003 | La credencial se guarda **cifrada**, con llave derivada por empresa (D-048.4, RS-46), en columna aparte; nunca en el repositorio, en JSON de campos, registros técnicos, auditoría, errores, exportaciones ni respaldos en claro. No se vuelve a mostrar. A diferencia de las claves de API, no puede guardarse solo como huella porque la plataforma debe presentarla a Microsoft (misma excepción declarada que el secreto del webhook, RN-INT-025). Una pérdida o filtración de credencial es un incidente de seguridad (D-059, D-080): se revoca en Microsoft y se reemplaza. | Fase 3 (MSF-1) | CA-MSF-03 |
| RN-MSF-004 | Conectar, reemplazar la credencial y desconectar exigen PS-242 (sensible) con **reautenticación reciente (10 minutos) y segunda verificación**. Nadie puede conectar «por» una empresa: ni el Administrador de plataforma ni el soporte. | Fase 3 (MSF-1) | CA-MSF-01 |
| RN-MSF-005 | Un directorio de Microsoft se conecta a **una sola empresa a la vez**. Si ya está conectado a otra, el rechazo dice «No se puede conectar este directorio» y **no revela a qué empresa** (D-041.5). Si dos empresas del grupo comparten un directorio, solo una lo conecta y la otra espera; dividir un directorio por grupos sería un módulo aparte. **Confirmado (D-085.1, S-MSF-08).** | Fase 3 (MSF-1) | CA-MSF-01 |
| RN-MSF-006 | El consentimiento lo da una persona con rol de administrador en el Microsoft **de esa empresa**. La plataforma no concede ni simula consentimientos. Puede ser la misma persona que administra la plataforma en la empresa o una distinta; si es otra, la plataforma entrega un texto con los pasos, sin credenciales. | Fase 3 (MSF-1) | CA-MSF-01 |
| RN-MSF-007 | **Solo lectura, comprobada en cada lectura.** La plataforma solo pide permisos de lectura. Antes de **conectar** y **antes de cada lectura** (programada o manual) comprueba los permisos concedidos. Si descubre que la credencial tiene además permisos para **modificar o ejecutar operaciones** sobre cuentas o equipos, **no la activa** (al conectar) o **la pasa a «Pendiente de consentimiento»** (si ya estaba Conectada), **no lee**, avisa a los titulares de PS-242 y muestra «Quite los permisos de más y vuelva a probar» con la lista exacta de permisos concedidos. La plataforma **nunca usa** un permiso de escritura u operaciones aunque exista. Si el mecanismo de credencial elegido no permite comprobarlo en cada lectura, el Arquitecto vuelve a mesa antes de seguir (decisión sobre la conexión con Microsoft, ADR-21). **Confirmado y reforzado (D-085.4).** | Fase 3 (MSF-1) | CA-MSF-02 |
| RN-MSF-008 | **Mínimo necesario.** Solo se guarda la lista cerrada de datos de la sección 6, aunque Microsoft entregue más. **Nunca** se traen: ubicación del equipo, aplicaciones instaladas, contenido, número de teléfono, claves de recuperación del cifrado, contraseñas, registros de inicio de sesión, foto, ni los datos prohibidos de RN-PRS-003 (documento, dirección, teléfono personal, fecha de nacimiento, sueldo, salud). | Fase 3 (MSF-1, MSF-2) | CA-MSF-21 |
| RN-MSF-009 | La plataforma solo llama a las direcciones fijas de la nube pública de Microsoft. **No existe un campo para escribir direcciones.** Las nubes soberanas o gubernamentales quedan fuera (S-MSF-15). | Fase 3 (MSF-1) | CA-MSF-21 |
| RN-MSF-010 | Solo se guardan los equipos de **propiedad corporativa**. Los personales (BYOD) se descartan sin guardarse y solo se muestra su conteo. **Excepción:** si la serie de un equipo personal coincide con un activo del inventario, se guarda **solo el hallazgo «propiedad distinta», sin usuario principal ni nombre del equipo**, y se señala la diferencia de propiedad (hallazgo «datos distintos»). **Confirmado (D-085.2, S-MSF-09).** | Fase 3 (MSF-2) | CA-MSF-21 |
| RN-MSF-011 | **Intune informa; el inventario decide.** Nada que llegue de Microsoft cambia por sí solo el estado, la asignación, la ubicación, la serie, el costo, el responsable ni la categoría de un activo. Las diferencias se muestran y una persona decide. | Fase 3 (MSF-2) | CA-MSF-28 |
| RN-MSF-012 | **Nunca se crean Usuarios (membresías) ni se cambian roles desde Entra** (D-001). La plataforma tampoco vincula una Persona con una membresía en automático (RN-PRS-017). Un correo traído de Entra **no se considera verificado**. | Fase 3 (MSF-1) | CA-MSF-15 |
| RN-MSF-013 | Nada se borra porque Microsoft deje de informarlo: se marca «ya no aparece en Microsoft» con fecha (D-019, RF-AUD-011). La purga por plazos de privacidad la rigen la sección 6 y RN-MSF-059. | Fase 3 (MSF-1, MSF-2) | CA-MSF-07 |

**Personas**

| ID | Regla | Cuándo | CA |
|---|---|---|---|
| RN-MSF-014 | **Orden de coincidencia:** (1) identificador inmutable ya vinculado; (2) código de empleado igual (si Entra lo trae); (3) correo, comparado como en RN-PRS-005 (Unicode, sin quitar puntos ni etiquetas `+`). Si no hay correo de buzón, el nombre principal de usuario sirve solo como **propuesta para revisión**. | Fase 3 (MSF-1) | CA-MSF-11 |
| RN-MSF-015 | La cuenta se vincula sola **solo si hay exactamente una Persona candidata, Activa y sin otro conflicto**. Si hay cero, se propone un alta. Si hay dos o más, o la candidata está **Cesada o Anonimizada**, va «para revisión» (el correo de un exempleado puede reasignarse a otra persona). | Fase 3 (MSF-1) | CA-MSF-11 |
| RN-MSF-016 | Una cuenta se vincula a una sola Persona y una Persona a una sola cuenta (1 a 1, único por empresa). Quien tiene dos cuentas (una normal y una de administración) vincula la normal; la otra se excluye con motivo. | Fase 3 (MSF-1) | CA-MSF-11 |
| RN-MSF-017 | Una cuenta **sin correo ni código de empleado** no genera propuesta de alta (como la importación, RF-PRS-014); se cuenta como «sin datos suficientes». | Fase 3 (MSF-1) | CA-MSF-12 |
| RN-MSF-018 | Tipo de la Persona propuesta: cuenta de miembro = Empleado; cuenta de invitado = Externo; **nunca Custodio**. Los invitados no se leen por defecto. **[SUPUESTO]** | Fase 3 (MSF-1) | CA-MSF-12 |
| RN-MSF-019 | **Ninguna propuesta se aplica sola.** No existe un modo automático en esta versión. | Fase 3 (MSF-1) | CA-MSF-13 |
| RN-MSF-020 | Aplicar una propuesta exige el permiso de Personas que corresponda: alta y cambio, PS-25; baja y reingreso, PS-26 (y PS-14 si la Persona tiene membresía); área nueva, PS-33. Tener PS-245 no basta. Se comprueba en el servidor. | Fase 3 (MSF-1) | CA-MSF-13 |
| RN-MSF-021 | Una cuenta **deshabilitada o eliminada** en Microsoft produce solo una **propuesta de cese**. No equivale a un cese (puede ser una licencia o una ausencia). El cese se registra con el asistente de Personas y **nunca se bloquea por recursos** (D-034, D-061.7). | Fase 3 (MSF-1) | CA-MSF-15 |
| RN-MSF-022 | Una Persona Cesada no se reactiva por la lectura (solo se propone un «reingreso»). Una Anonimizada nunca se reactiva (RN-PRS-016) y **no se vuelve a proponer un alta para su misma cuenta**: se guarda una huella irreversible del identificador de la cuenta. **[LEGAL: L-MSF-04]** | Fase 3 (MSF-1) | CA-MSF-18 |
| RN-MSF-023 | Campos que se proponen (lista cerrada): nombre, correo, código de empleado, área (por equivalencia) y jefe directo (solo si ambas Personas están vinculadas). Los demás campos de la Persona no se tocan. Un dato editado a mano que difiere de Entra **se propone como cambio, no se pisa**. Se respetan los límites de largo de D-072 (por ejemplo, nombre de 120 caracteres): una cuenta que no cabe es error de esa fila. | Fase 3 (MSF-1) | CA-MSF-12 |
| RN-MSF-024 | Un área, tipo de puesto o ubicación desconocidos **no se crean solos**: se listan para aprobar o mapear (RF-IMP-007). | Fase 3 (MSF-1) | CA-MSF-16 |
| RN-MSF-025 | Una propuesta pendiente vence a los **30 días** y se vuelve a generar si la diferencia persiste. Una descartada no se repite mientras el valor propuesto sea el mismo (se guarda una huella del valor, no el valor). **[SUPUESTO]** | Fase 3 (MSF-1) | CA-MSF-12 |
| RN-MSF-026 | Aplicar en bloque, **excepción confirmada a D-050 (D-085.3, S-MSF-12)**: **vista previa obligatoria**; cada propuesta se valida por separado; las que fallan se listan **con su motivo** y no se aplican, las demás sí (no es «todo o nada» porque son decisiones independientes y la plataforma no es dueña del origen; mismo criterio que las invitaciones por persona, D-053 DS-08). El conjunto queda como un **lote con una sola entrada de auditoría**, **anulable** con el mismo criterio de RF-IMP-006 (D-072), con los **mismos límites de tamaño de D-050**, y la pantalla dice que no es «todo o nada». | Fase 3 (MSF-1) | CA-MSF-14 |

**Equipos y conciliación**

| ID | Regla | Cuándo | CA |
|---|---|---|---|
| RN-MSF-027 | «Se gestiona en MDM» solo puede marcarse en categorías de naturaleza **equipo físico**; se hereda a las subcategorías; viene **apagada**; cambiarla se audita y avisa antes cuántos activos cambian. | Fase 3 (MSF-2) | CA-MSF-19 |
| RN-MSF-028 | «Pendiente de enrolar» **no es un estado** (RF-INV-009 no cambia). Se **calcula al leer** (D-062.2): categoría marcada, sin vínculo con Intune y activo que no esté De baja ni Extraviado o robado. No escribe movimientos. | Fase 3 (MSF-2) | CA-MSF-19 |
| RN-MSF-029 | La marca **no bloquea nada**: ni recibir, ni entregar, ni cesar a una Persona. | Fase 3 (MSF-2) | CA-MSF-19 |
| RN-MSF-030 | Orden de conciliación: (1) **serie** normalizada igual que RF-INV-002 (sin distinguir mayúsculas ni espacios en los bordes); (2) **IMEI** contra el campo identificador del activo. Un equipo con más de un IMEI se compara con cada uno. | Fase 3 (MSF-2) | CA-MSF-22 |
| RN-MSF-031 | Una serie vacía o de una **lista de valores genéricos no válidos** (por ejemplo «0» o un texto de fábrica sin completar) no se usa para vincular. La lista la mantiene la plataforma. **[SUPUESTO]** | Fase 3 (MSF-2) | CA-MSF-22 |
| RN-MSF-032 | El vínculo es **1 a 1**: un activo, un registro vigente de Intune. Si Intune repite la misma serie (por ejemplo tras un reenrolamiento), el vigente es el de **comunicación más reciente** y los demás se marcan «registro duplicado en Intune». | Fase 3 (MSF-2) | CA-MSF-22, CA-MSF-31 |
| RN-MSF-033 | El vínculo es automático solo con **un candidato único, sin diferencia de IMEI y de propiedad corporativa**. En cualquier otro caso queda «coincidencia dudosa»: nunca se vincula sola. | Fase 3 (MSF-2) | CA-MSF-22, CA-MSF-23 |
| RN-MSF-034 | El vínculo sigue a la **serie**, no al identificador de Intune: si el equipo se borra y se reenrola (identificador nuevo, misma serie), el vínculo se conserva. | Fase 3 (MSF-2) | CA-MSF-23 |
| RN-MSF-035 | Desvincular exige motivo; la decisión se recuerda y la lectura no vuelve a vincular el mismo par. | Fase 3 (MSF-2) | CA-MSF-23 |
| RN-MSF-036 | La conciliación busca entre **todos los activos de naturaleza equipo físico**, esté o no marcada su categoría. Si hay vínculo con una categoría no marcada, se sugiere marcarla. La marca solo decide qué equipos **deberían** estar en Intune. | Fase 3 (MSF-2) | CA-MSF-22 |
| RN-MSF-037 | **Cumplimiento: lista cerrada en español** — Cumple, No cumple, En plazo de gracia, Con problema de evaluación, Sin evaluar. Cualquier valor que Intune informe fuera de la lista se muestra «Sin evaluar». El estado se muestra **con texto**, no solo con color. | Fase 3 (MSF-2) | CA-MSF-24 |
| RN-MSF-038 | «Última comunicación» es la última vez que el equipo habló con Intune. Es «sin comunicación reciente» cuando supera los días configurados por la empresa, contados con su fecha y zona horaria. | Fase 3 (MSF-2) | CA-MSF-24 |
| RN-MSF-039 | Cifrado: **Sí, No o Sin dato** (algunos sistemas no lo informan). | Fase 3 (MSF-2) | CA-MSF-24 |
| RN-MSF-040 | El usuario principal se muestra como Persona si su cuenta está vinculada; si no, como «Usuario sin Persona vinculada» (el nombre solo con `datos_personales.ver`) y se ofrece proponer el alta. | Fase 3 (MSF-2) | CA-MSF-24 |
| RN-MSF-041 | Todo dato de Microsoft se muestra con «dato al…». Si la última lectura falló, con «dato desactualizado desde…». Nunca se presenta como tiempo real. | Fase 3 (MSF-1, MSF-2) | CA-MSF-35 |
| RN-MSF-042 | Un equipo o una cuenta solo pasa a «ya no aparece en Microsoft» tras una lectura **completa y correcta**. Una lectura fallida o parcial no marca desapariciones. | Fase 3 (MSF-1, MSF-2) | CA-MSF-27, CA-MSF-35 |
| RN-MSF-043 | Los hallazgos **se calculan al leer**; solo se guardan las decisiones (vincular, desvincular, ignorar con motivo). Un hallazgo cuya causa desaparece se resuelve solo. | Fase 3 (MSF-2) | CA-MSF-27 |
| RN-MSF-044 | Un activo **Extraviado o robado que se comunica con Intune** genera un hallazgo de prioridad Alta y un aviso inmediato. **No cambia el estado**: el reingreso es una decisión humana con motivo (PS-48). | Fase 3 (MSF-2) | CA-MSF-30 |
| RN-MSF-045 | Un activo **De baja que sigue en Intune** genera el hallazgo «retirar de Intune». Esa acción la hace una persona **fuera de la plataforma**. | Fase 3 (MSF-2) | CA-MSF-30 |
| RN-MSF-046 | «Diferencia de asignado a» = el activo está **Asignado** a una Persona y el usuario principal de Intune es otra Persona vinculada. **No es diferencia** si el equipo no tiene usuario principal en Intune y el activo está asignado a un Custodio (equipos compartidos), ni si el activo no está Asignado. | Fase 3 (MSF-2) | CA-MSF-29 |
| RN-MSF-047 | Asignar, traspasar y devolver sigue siendo **exclusivo de Entregas, con acta**. La conciliación solo lleva al asistente; nunca cambia una asignación (la autoentrega y los actos con acta no se exceptúan). | Fase 3 (MSF-2) | CA-MSF-29 |
| RN-MSF-048 | «Registrar en el inventario» usa el **ingreso manual** existente (PS-44: serie única, motivo obligatorio, costo opcional). Serie, fabricante y modelo van precargados como ayuda; el **SKU no se crea solo**: se elige uno existente. Si no hay SKU, se pide crearlo primero. | Fase 3 (MSF-2) | CA-MSF-28 |
| RN-MSF-049 | Ignorar un hallazgo exige motivo (texto libre declarado); queda quién y cuándo; se puede reabrir. | Fase 3 (MSF-2) | CA-MSF-28 |

**Procesos, auditoría y privacidad**

| ID | Regla | Cuándo | CA |
|---|---|---|---|
| RN-MSF-050 | Todo proceso del módulo (lecturas, vencimiento de propuestas, limpieza) es **idempotente y recuperable**, corre **empresa por empresa** con el «hoy» de cada una, **salta las empresas suspendidas** y las de módulo apagado, deja registro de corrida y escribe con autor «sistema» (D-038.4, RF-AUD-013). Se prueba con dos empresas. | Fase 3 (MSF-1) | CA-MSF-09 |
| RN-MSF-051 | Se respetan los límites de Microsoft: si pide esperar, la plataforma espera ese tiempo; los reintentos usan esperas crecientes y nunca un bucle; una conexión que agota su cupo no frena a las demás. «Sincronizar ahora» tiene un tope por empresa en el cuadro único de topes (RS-45). Los valores los fijan Microsoft y el Arquitecto; no se prometen cifras. | Fase 3 (MSF-1) | CA-MSF-08 |
| RN-MSF-052 | **Auditoría sin valores personales (D-030):** conexión (quién, cuándo, motivo; nunca la credencial); configuración (antes y después de valores no personales); propuestas decididas (identificador de la Persona y **nombres** de los campos que cambiaron, sin valores); vínculos (identificador del activo y del equipo en Intune); decisiones de ignorar (el **motivo sí se guarda por valor**, D-077); cada lectura es una sola entrada de resumen con cifras; un lote es una entrada de lote (RF-AUD-019). | Fase 3 (MSF-1, MSF-2) | CA-MSF-39 |
| RN-MSF-053 | Una consulta que muestre **100 o más nombres de Personas** (umbral de D-071.4) y toda exportación dejan una entrada con la cantidad, sin los nombres. Exportar pasa por la puerta única (motivo, topes de RS-45, hoja «Aviso»). | Fase 3 (MSF-2) | CA-MSF-39, CA-MSF-26 |
| RN-MSF-054 | **Usuario principal, IMEI y nombre del equipo en Intune** (que suele llevar el nombre de su usuario) solo se ven con `datos_personales.ver`; sin él se muestra `PRS-0042` o enmascarado, también en exportaciones. | Fase 3 (MSF-2) | CA-MSF-24, CA-MSF-26 |
| RN-MSF-055 | Avisos con contenido mínimo (D-061.4): sin series, IMEI, nombres ni listas de equipos; el activo se nombra por su código `ACTV-NNNNNN` (D-079). **A los empleados no se les envía ningún aviso** en esta versión. | Fase 3 (MSF-1, MSF-2) | CA-MSF-34 |
| RN-MSF-056 | Los errores de Microsoft **no se muestran en crudo**: se traducen a los mensajes del catálogo; el detalle técnico va a un registro sin datos personales (RNF-009). | Fase 3 (MSF-1) | CA-MSF-04 |
| RN-MSF-057 | Los textos libres (motivos de pausa, desconexión, descarte, desvinculación e ignorar) pasan por el validador común y llevan el aviso «No escriba datos personales ni claves» (D-063.2). | Fase 3 (MSF-1, MSF-2) | CA-MSF-40 |
| RN-MSF-058 | Con la **empresa suspendida** o el **módulo apagado** (`modulo_activo`): las lecturas se detienen, los datos se ocultan sin borrarse, la API responde «No encontrado». Al reactivar se hace una lectura completa antes de marcar nada como desaparecido. | Fase 3 (MSF-1) | CA-MSF-36 |
| RN-MSF-059 | **Retención y anonimización** según la sección 6. Al anonimizar una Persona se borran su vínculo y sus copias de nombre de usuario en lecturas, en la misma operación. **[LEGAL: L-MSF-03]** | Fase 3 (MSF-1, MSF-2) | CA-MSF-18 |
| RN-MSF-060 | Al **desconectar**, la credencial se elimina en el acto. Las Personas, los activos, los vínculos y el historial de cumplimiento se conservan marcados «desconectado»; se **purgan** las lecturas de equipos sin activo y los nombres de usuario no vinculados (se pueden volver a leer al reconectar). Reconectar abre un asistente nuevo. | Fase 3 (MSF-1) | CA-MSF-07 |
| RN-MSF-061 | **Sin acciones remotas (código I-06 del documento funcional: no se construyen).** El módulo no solicita ni usa permisos de escritura u operaciones, **aunque la credencial los tenga**, y no ofrece ninguna ruta que los use (RF-MSF-038, RN-MSF-007). | Fase 3 (MSF-1) | CA-MSF-33 |
| RN-MSF-062 | Conectar Entra para leer cuentas **no activa** el ingreso a la plataforma con Microsoft (PS-137, INT-3). Son consentimientos y configuraciones separadas. | Fase 3 (MSF-1) | CA-MSF-41 |
| RN-MSF-063 | Los datos de este módulo **no se exponen por la API pública ni por webhooks** en esta versión; una clave de API responde «No encontrado» (S-MSF-18). | Fase 3 (MSF-1) | CA-MSF-41 |
| RN-MSF-064 | **Al restaurar un respaldo**, toda conexión queda **Pausada** hasta que un administrador reemplace la credencial (una credencial eliminada al desconectar podría reaparecer); antes de abrir el sistema se reaplican las anonimizaciones (RS-49). | Fase 3 (MSF-1) | CA-MSF-36 |
| RN-MSF-065 | Cada parte (usuarios, equipos) se conecta con sus propios permisos de lectura. Una empresa que conecta solo usuarios no concede acceso a Intune, y al revés. | Fase 3 (MSF-1) | CA-MSF-02 |

### 4.3 Calidad medible

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RNF-MSF-001 | Con el volumen de referencia de RNF-010 (100.000 activos por empresa), la primera página de la lista de equipos y del panel de conciliación responde en 2 segundos o menos (percentil 95), con páginas de 50 filas. | Fase 3 (MSF-2) | CA-MSF-42 |
| RNF-MSF-002 | La lectura corre en segundo plano con barra de avance (D-038.7); mientras corre, el resto de la plataforma y las demás empresas responden igual. | Fase 3 (MSF-1) | CA-MSF-42 |
| RNF-MSF-003 | Una caída a mitad de una lectura se retoma al reiniciar sin duplicar ni perder propuestas, vínculos ni avisos. | Fase 3 (MSF-1) | CA-MSF-09 |
| RNF-MSF-004 | Ninguna credencial aparece en base, auditoría, registros técnicos, errores, exportaciones ni respaldos en claro (prueba automática de búsqueda con credenciales de prueba propias). | Fase 3 (MSF-1) | CA-MSF-03 |
| RNF-MSF-005 | Pruebas de aislamiento con el rol de la aplicación, por identificador interno, con escritura de referencias cruzadas y con los procesos corriendo con dos empresas (D-039.6, D-063.6). | Fase 3 (MSF-1) | CA-MSF-37, CA-MSF-09 |
| RNF-MSF-006 | Todas las pruebas usan un **simulador de Microsoft** con datos inventados; ninguna credencial, directorio ni nombre real entra al repositorio ni al entorno de pruebas (RF-DAT-010). | Fase 3 (MSF-1) | CA-MSF-44 |
| RNF-MSF-007 | Pantallas operables por teclado, a 360 px, con contraste AA y el estado de cumplimiento en texto; los objetivos táctiles de 44 px (RNF-004). | Fase 3 (MSF-2) | CA-MSF-24 |
| RNF-MSF-008 | El 100 % de las acciones humanas y automáticas queda en la auditoría con su autor (usuario o «sistema»). | Fase 3 (MSF-1, MSF-2) | CA-MSF-39 |
| RNF-MSF-009 | La pérdida de acceso (credencial vencida o consentimiento retirado) y la aparición de un permiso de escritura u operaciones se detectan en la siguiente lectura programada (la comprobación de permisos se hace en **cada** lectura, RN-MSF-007) y se avisa a los titulares de PS-242. | Fase 3 (MSF-1) | CA-MSF-02, CA-MSF-04 |
| RNF-MSF-010 | Al cambiar de empresa activa ninguna pantalla arrastra datos de Microsoft de la empresa anterior (D-046). | Fase 3 (MSF-1) | CA-MSF-37 |

---

## 5. Flujos, estados y transiciones

### 5.1 Flujos

**Flujo 1 · La empresa conecta su Entra ID e Intune** (MSF-1)
1. El Administrador (PS-242, con reautenticación reciente y segunda verificación) abre «Conectar Microsoft» y elige qué conectar: usuarios, equipos o ambos.
2. La plataforma muestra qué leerá y qué **no** (lista cerrada de la sección 6) y los permisos de **solo lectura** que Microsoft va a pedir.
3. El administrador de Microsoft de **esa empresa** da el consentimiento dentro de Microsoft (si es otra persona, recibe un texto con los pasos).
4. La empresa entrega la credencial según el mecanismo que fije el Arquitecto (S-MSF-20). La plataforma la guarda como **secreto** y no la vuelve a mostrar.
5. La plataforma prueba la conexión: lee el nombre del directorio, comprueba que no esté conectado a otra empresa y que **no** haya permisos de escritura. **Esta comprobación de permisos se repite antes de cada lectura** (RN-MSF-007).
6. El Administrador confirma que el nombre del directorio es el de su empresa. La conexión queda **Conectada** y se programa la primera lectura en vista previa.
- **Si falla:** consentimiento incompleto, permisos de más o credencial inválida → «Pendiente de consentimiento» con la razón en palabras simples.
- **Si más adelante aparece un permiso de escritura u operaciones** (en una lectura programada o manual): la conexión vuelve a «Pendiente de consentimiento», esa lectura no se hace, se avisa a los titulares de PS-242 y no se lee nada hasta que se quiten los permisos de más y se pruebe de nuevo.

**Flujo 2 · Sincronizar cuentas de Entra con Personas** (MSF-1)
1. La lectura programada (o manual) trae las cuentas que cumplen los filtros.
2. La **primera vez** solo se muestra una vista previa con cifras; no se crea nada.
3. Cada cuenta se une con una Persona (RN-MSF-014): identificador inmutable, luego código de empleado, luego correo. La coincidencia única con una Persona Activa se vincula sola.
4. La lectura genera **propuestas**: alta (cuenta sin Persona), cambio (nombre, correo, código, área, jefe), baja (cuenta deshabilitada o eliminada), reingreso (cuenta rehabilitada de una Persona Cesada) y «para revisión».
5. Quien tiene PS-245 revisa la lista; para aplicar necesita además el permiso de Personas que corresponda. Lo descartado se recuerda.
6. Una baja abre el asistente de cese (sin bloqueo por recursos); un reingreso, la reactivación de Personas. **Nunca se crea ni se toca un Usuario de la plataforma.**
7. Todo lo aplicado queda en la auditoría con el identificador de la Persona y los campos que cambiaron, sin valores.

**Flujo 3 · Ciclo del equipo: de la orden de compra a Intune** (MSF-2)
1. La OC se aprueba y el proveedor entrega. Almacén confirma la **recepción** con las series (y el IMEI en celulares); la recepción crea los activos con su código `ACTV-` (RF-OC-035).
2. Si la categoría está marcada «se gestiona en MDM» (laptop, celular, tableta, PDA), el resumen previo avisa «N activos quedarán pendientes de enrolar» y los activos nacen con la marca calculada **«Pendiente de enrolar»**.
3. El técnico prepara y **enrola** el equipo en Intune (fuera de la plataforma).
4. Al crearse el activo la plataforma lo busca en la última lectura; si no está, lo encuentra la lectura siguiente. Si la serie (o el IMEI) coincide de forma única, el activo queda **vinculado**, la marca desaparece y la ficha muestra el bloque «Intune».
5. Cada lectura actualiza cumplimiento, última comunicación, versión del sistema, cifrado y usuario principal. Los cambios de cumplimiento quedan en el historial del equipo.
6. La entrega a la Persona se hace con acta, en Entregas (como hoy). Si el usuario principal de Intune no es la Persona asignada, aparece una diferencia.
7. Al final de su vida (baja, extravío), los hallazgos avisan si el equipo sigue o aparece en Intune.

**Flujo 4 · Conciliación** (MSF-2)
1. Tras cada lectura, el panel calcula los hallazgos de la sección 5.3 con la fecha de corte.
2. **En Intune y no en el inventario:** registrar en el inventario (ingreso manual precargado), vincular a un activo existente o ignorar con motivo.
3. **En el inventario y no en Intune:** activos entregados de categorías marcadas, sin vínculo pasado el umbral de días.
4. **Diferencias de asignado a:** se corrige en Entregas con acta, o se ignora con motivo. La plataforma nunca cambia una asignación sola.
5. **Estado incoherente:** Extraviado o robado que se comunica (prioridad Alta, aviso inmediato) y De baja que sigue en Intune.
6. Un hallazgo cuya causa desaparece se resuelve solo en la lectura siguiente.

**Flujo 5 · Acciones remotas (bloquear, borrar, retirar)** — **NO en esta versión.** La plataforma solo observa. Si en el futuro se proponen, se tratan como **[ESCALAR AL CEO]** por ser irreversibles, con doble control (una persona propone y otra ejecuta), permisos sensibles distintos por acción y motivo obligatorio (S-MSF-03). Hasta entonces, para bloquear o borrar un equipo, la persona de TI lo hace directamente en Intune.

### 5.2 Estados y transiciones

**Conexión con Microsoft** (lista cerrada): Pendiente de consentimiento · Conectada · Con problema · Pausada · Desconectada. (Antes de empezar no hay registro.)

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) | Pendiente de consentimiento | `microsoft.conectar` (PS-242) | Reautenticación reciente y segunda verificación. El asistente abandonado vence a los 7 días **[SUPUESTO]** |
| Pendiente de consentimiento | Conectada | Sistema, tras confirmar el Administrador el nombre del directorio; o, si volvió desde Conectada, tras una prueba de conexión correcta | Permisos de solo lectura concedidos; directorio libre (RN-MSF-005, 007) |
| Conectada | Pendiente de consentimiento | Sistema, en una lectura | Aparece un permiso de escritura o de operaciones (RN-MSF-007, D-085.4): no lee, avisa a los titulares de PS-242 |
| Conectada | Con problema | Sistema | Credencial vencida, consentimiento retirado, Microsoft rechaza el acceso |
| Con problema | Conectada | Sistema (lectura correcta) o PS-242 (credencial nueva) | La causa se corrigió |
| Conectada o Con problema | Pausada | PS-242 con motivo, o sistema | Empresa suspendida, módulo apagado, respaldo restaurado (RN-MSF-058, 064) |
| Pausada | Conectada | PS-242 | Tras una prueba de conexión; tras restaurar, solo con credencial reemplazada |
| Cualquiera | Desconectada | PS-242 con motivo | La credencial se elimina; final. Para volver se crea una conexión nueva |

**Lectura (corrida):** En cola → En curso → Completada · Completada con avisos · Fallida · Cancelada. Solo una lectura **Completada** puede marcar «ya no aparece» (RN-MSF-042).

**Propuesta sobre una Persona:** Pendiente → Aplicada (PS-245 más el permiso de Personas) · Descartada (PS-245, motivo) · Vencida (sistema, 30 días) · Obsoleta (sistema, la diferencia ya no existe).

**Cuenta vinculada:** Vinculada → Desvinculada (PS-245 con motivo, o sistema al anonimizar la Persona). «Ya no aparece en Microsoft» es una marca con fecha, no un estado.

**Vínculo del equipo:** Dudoso → Vinculado (PS-246, o sistema si la coincidencia es única) · Vinculado → Desvinculado (PS-246 con motivo; la decisión se recuerda).

**Hallazgo:** Abierto ↔ Ignorado (PS-246, motivo) · Abierto → Resuelto (sistema, desaparece la causa).

**Relación de un activo con Intune** (derivada, se calcula al leer; no es un estado del activo): No aplica · Pendiente de enrolar · En Intune · En Intune sin comunicación reciente · Ya no aparece en Intune · Coincidencia dudosa.

### 5.3 Hallazgos de la conciliación (lista cerrada)

| N.º | Hallazgo | Cuándo aparece | Prioridad |
|---|---|---|---|
| H1 | Equipo en Intune sin inventario | Equipo corporativo sin activo vinculado ni candidato | Media |
| H2 | Equipo entregado sin enrolar | Activo Asignado de categoría marcada, sin vínculo, pasado el umbral de días desde la asignación | Media |
| H3 | Diferencia de asignado a | RN-MSF-046 | Media |
| H4 | Equipo extraviado o robado que se comunica | Activo Extraviado o robado cuyo equipo informa comunicación posterior al cambio de estado | **Alta** |
| H5 | Equipo de baja que sigue en Intune | Activo De baja con registro vigente en Intune | Media |
| H6 | Registro duplicado en Intune | RN-MSF-032 | Baja |
| H7 | Datos de identificación distintos | IMEI o propiedad distintos entre inventario e Intune | Media |
| H8 | Coincidencia dudosa | RN-MSF-033 | Media |
| H9 | Usuario principal sin Persona vinculada | Cuenta del usuario principal sin Persona | Baja |

---

## 6. Datos

**Qué se lee de Entra (lista cerrada):** identificador inmutable de la cuenta; nombre para mostrar; correo; nombre principal de usuario (solo para coincidir); código de empleado; departamento; tipo de cuenta (miembro o invitado); cuenta habilitada (sí o no); identificador de la cuenta del jefe.
**Qué se lee de Intune (lista cerrada, solo equipos corporativos):** identificador del equipo en Intune; nombre del equipo; fabricante; modelo; sistema operativo y versión; número de serie; IMEI; propiedad (corporativa o personal); estado de cumplimiento; cifrado; fecha de enrolamiento; última comunicación; usuario principal (identificador de la cuenta y nombre de usuario). El campo exacto de Microsoft de cada uno lo fija el Arquitecto.
**Qué nunca se guarda:** lo de RN-MSF-008. De un equipo personal (BYOD) con serie coincidente solo se guarda el hallazgo «propiedad distinta», sin usuario principal ni nombre del equipo (RN-MSF-010, D-085.2).

| Entidad | Campos principales | Clave y unicidad | Se audita |
|---|---|---|---|
| Conexión con Microsoft | empresa, partes conectadas (usuarios, equipos), estado, identificador y nombre del directorio, permisos concedidos, vencimiento informado, conectada por y cuándo, última lectura correcta, motivo de pausa o desconexión | Una vigente por empresa | Conectar, reemplazar, pausar, desconectar (sin la credencial) |
| Credencial (secreto) | empresa, valor cifrado, versión de llave, fecha de cambio | Una por conexión | Cambio, sin valor |
| Directorio conectado (**tabla global**) | huella del identificador del directorio, empresa | Único global | Solo por función puntual auditada (D-039.5) |
| Configuración de lectura | empresa, filtros de cuentas, grupo opcional, exclusiones con motivo, equivalencias de área, umbrales de días | Una por empresa | Cambios con antes y después de valores no personales |
| Corrida de lectura | empresa, tipo, inicio, fin, resultado, cifras | Por empresa y fecha lógica | Una entrada de resumen |
| Cuenta vinculada | empresa, Persona, identificador inmutable, desde, estado, marca «ya no aparece» | Único por empresa + identificador; una por Persona | Vinculación y desvinculación (sin identificador) |
| Propuesta sobre una Persona | empresa, tipo, Persona o cuenta, campos afectados, valores propuestos, estado, vence | Una abierta por cuenta y tipo | Decisión (aplicada o descartada) |
| Huella de propuesta descartada | empresa, cuenta, campo, huella del valor | Única por cuenta + campo + huella | No |
| Huella de exclusión por derechos | empresa, huella irreversible del identificador | Única por empresa | Creación **[LEGAL: L-MSF-04]** |
| Lote de aplicación | empresa, número, aplicadas, fallidas, estado | Correlativo por empresa | Una entrada de lote |
| Lectura de equipo (estado actual) | empresa, identificador en Intune, datos de la lista cerrada, marca «ya no aparece», lectura al | Único por empresa + identificador de Intune | Resumen en la corrida |
| Vínculo activo ↔ equipo | empresa, activo, equipo de Intune, estado, quién vinculó (usuario o sistema), motivo si se desvinculó | Un vigente por activo y uno por equipo (índice único parcial) | Vincular y desvincular |
| Historial de cumplimiento | empresa, activo o equipo, fecha, estado anterior, estado nuevo | Una fila por cambio | No (histórico del activo) |
| Decisión de conciliación | empresa, hallazgo, activo o equipo, ignorada por, cuándo, motivo | Una por hallazgo vigente | Sí (el motivo por valor) |

**Datos personales declarados por este módulo (D-061.3; filas para la tabla 18.1 del documento funcional).** Todos los plazos son propuestos hasta que legal responda; no se activa ninguna purga automática antes **[LEGAL: L-MSF-03]**.

| Dato | Finalidad | Quién lo ve | Plazo propuesto | Rutina |
|---|---|---|---|---|
| Identificador de la cuenta de Microsoft vinculada a una Persona | Reconocer a la misma persona entre Microsoft y la plataforma | Nadie lo ve; solo el sistema | Mientras la Persona esté vinculada | Se borra al desvincular o anonimizar |
| Nombre, correo, código de empleado, área y jefe dentro de propuestas pendientes | Revisar altas y cambios | PS-245 con `datos_personales.ver` | Hasta aplicar o descartar, y como máximo 30 días | Se borran al decidir o vencer |
| Huella del valor de una propuesta descartada | No repetir una propuesta ya rechazada | Nadie; solo el sistema | Mientras la cuenta esté vinculada o aparezca en Microsoft | Se borra al desvincular o anonimizar |
| Huella del identificador de una cuenta de una Persona anonimizada | No volver a importar a quien ejerció su derecho de eliminación | Nadie; solo el sistema | Hasta que legal diga **[LEGAL: L-MSF-04]** | Conservar |
| Usuario principal (nombre de usuario) de un equipo de Intune sin Persona vinculada | Conciliar y proponer el alta | `datos_personales.ver` | Mientras el equipo siga en la lectura | Se purga al dejar de aparecer, al vincular la Persona o al desconectar |
| Usuario principal de un equipo vinculado a una Persona (referencia `PRS-`) | Seguimiento del equipo | `datos_personales.ver` para el nombre | Igual que la asignación del activo | Referencia a la Persona; se anonimiza con ella |
| Nombre del equipo en Intune (suele llevar el nombre del usuario) | Reconocer el equipo | `datos_personales.ver` | Mientras el equipo siga en la lectura | Se sobrescribe en cada lectura; se purga al desconectar |
| IMEI leído de Intune | Conciliar celulares | `datos_personales.ver` | Igual que el IMEI del activo (L-09) | Se trata como dato personal hasta que legal diga |
| Historial de cumplimiento (con usuario por referencia) | Seguimiento | `microsoft.ver` | El del historial del activo | Referencia a la Persona |
| Motivos de pausa, desconexión, descarte, desvinculación e ignorar | Explicar por qué | Quien ve el registro | El del registro; la copia en la auditoría vence con la auditoría (D-077) | **Texto libre no anonimizable de forma garantizada** (D-075 R-09); redacción por seguridad (PS-234) |

**Qué se audita (D-018.4, D-030):** conexión, cambios de configuración, lecturas (una entrada de resumen), propuestas decididas, lotes, vínculos y desvinculaciones, decisiones de ignorar, consultas de 100 o más nombres, exportaciones y cambios de la marca de categoría. Lo automático con autor «sistema».
**Todo lleva empresa;** la única tabla sin empresa es la de directorios conectados, consultada solo por una función puntual auditada (D-039.5); el Arquitecto la incluye en la lista corta de tablas globales.

---

## 7. Pantallas necesarias

Se reutilizan: la ficha del activo (nuevo bloque), la ficha de la Persona (indicador), el asistente de cese (línea informativa), el resumen de la recepción (línea), la pantalla de Categorías (marca), el asistente «Importar datos» y la puerta única de exportación (sin pantallas propias), el diálogo de motivo y la tarjeta de Inicio.

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-MSF-01 | Conexión con Microsoft | Estado, permisos concedidos, vencimiento, pausar, reemplazar credencial, desconectar | Administrador |
| PAN-MSF-02 | Asistente «Conectar Microsoft» | Pasos del flujo 1, con explicación en lenguaje simple | Administrador |
| PAN-MSF-03 | Qué se lee | Filtros de cuentas, exclusiones, equivalencias de área, umbrales de días | Administrador |
| PAN-MSF-04 | Vista previa de la primera lectura | Cifras antes de crear nada | Administrador |
| PAN-MSF-05 | Propuestas sobre Personas | Revisar, aplicar, descartar y aplicar en bloque | Técnico, Jefatura TI |
| PAN-MSF-06 | Equipos con Intune | Lista con filtros, cumplimiento y exportación | Técnico |
| PAN-MSF-07 | Conciliación | Panel de hallazgos, acciones y decisiones | Técnico, Jefatura TI |
| PAN-MSF-08 | Coincidencias dudosas | Elegir el activo correcto o desvincular | Técnico |
| PAN-MSF-09 | Historial de lecturas | Corridas, resultado y cifras | Administrador |
| PAN-MSF-10 | Tarjeta de Inicio «Equipos en Intune» | Pendientes de enrolar, no conformes, sin comunicación reciente | Jefatura TI, Técnico |

Bloques en pantallas existentes: «Intune» en la ficha del activo, marca «Pendiente de enrolar» en la ficha y la lista de activos, indicador «Cuenta de Microsoft vinculada» en la ficha de la Persona, línea en el asistente de cese, línea en el resumen de la recepción, casilla «Se gestiona en MDM» en Categorías.
Reglas: tres mensajes del catálogo; botones sin permiso visibles y desactivados con la razón; uso a 360 px; el estado de cumplimiento siempre con texto; «dato al…» en toda pantalla; tarea «Conectar Microsoft (opcional)» en «Primeros pasos».

---

## 8. Notificaciones y automatismos

Los avisos salen por el motor único de Notificaciones (RF-NOT-024); contenido mínimo (D-061.4, RN-MSF-055). **No hay avisos a empleados.** El valor por defecto de cada umbral de días lo fija el Gerente de TI **[PENDIENTE]**.

| Cuándo | A quién | Qué dice |
|---|---|---|
| La credencial vence en 30 días, 7 días y el día **[SUPUESTO]** (como las claves de API) | Titulares de PS-242 | «La conexión con Microsoft vence el 20/11/2026. Reemplace la credencial a tiempo.» |
| La conexión pasa a «Con problema» | Titulares de PS-242 | «La conexión con Microsoft dejó de funcionar. Revísela.» |
| La conexión pasa a «Pendiente de consentimiento» porque apareció un permiso de escritura u operaciones (inmediato) | Titulares de PS-242 | «La conexión con Microsoft se detuvo: tiene permisos de más. Quítelos y vuelva a probar.» |
| Propuestas por revisar (resumen semanal) | Titulares de PS-245 | «Tiene 14 propuestas sobre Personas por revisar.» |
| Equipos en Intune sin inventario (resumen semanal) | Titulares de PS-246 | «Hay 12 equipos en Intune que no están en el inventario.» |
| Activo entregado sin enrolar pasado el umbral | Titulares de PS-246 | «El equipo ACTV-000123 sigue sin enrolar en Intune.» |
| Equipos que pasaron a «No cumple» (resumen semanal) **[SUPUESTO]** | Titulares de PS-246 | «3 equipos pasaron a No cumple esta semana.» |
| **Extraviado o robado que se comunicó con Intune** (inmediato, no se resume) | Jefatura TI y administradores | «El equipo ACTV-000123, marcado como extraviado o robado, se comunicó con Intune el 28/10/2026.» |
| Lote de aplicación terminado | Quien lo aplicó | «Se aplicaron 295 propuestas; 5 no se pudieron aplicar.» |

**Eventos que emite** (catálogo `<módulo>.<entidad>_<hecho>`, Notificaciones es dueña): `microsoft.conexion_establecida`, `microsoft.conexion_con_problema`, `microsoft.conexion_pendiente_consentimiento`, `microsoft.conexion_desconectada`, `microsoft.propuesta_generada`, `microsoft.equipo_vinculado`, `microsoft.equipo_desvinculado`, `microsoft.equipo_cumplimiento_cambiado`, `microsoft.equipo_extraviado_comunicado`. No se agregan al catálogo público de webhooks en esta versión (S-MSF-18).
**Eventos que escucha:** `inventario.activo_creado`, `inventario.activo_estado_cambiado`, `inventario.activo_asignado`, `inventario.activo_devuelto`, `personas.persona_creada`, `personas.persona_cesada`, y el **evento síncrono de anonimización** de una Persona (D-038.5; no está en el catálogo, se pide al núcleo).
**Trabajos** (programador único, D-038): lectura de cuentas, lectura de equipos, vencimiento de propuestas y limpieza de lecturas sin vínculo. La periodicidad de cada lectura es configurable por empresa dentro de límites fijados por la plataforma; el valor inicial lo fija el Arquitecto con los límites de Microsoft **[PENDIENTE]**. Todos cumplen RN-MSF-050.
Si el motor de avisos por fecha no puede expresar una condición (por ejemplo «entregado sin enrolar»), el módulo emite el evento al detectar el cambio en la lectura, de forma idempotente.

---

## 9. Integración con el núcleo y con otros módulos

### 9.1 Tabla de trazabilidad

| Con | Qué se intercambia | Dueño del dato | Pedido o efecto |
|---|---|---|---|
| Núcleo | Empresa activa, permisos, auditoría con tres tipos de autor, gestión de secretos y llaves derivadas por empresa, cola y bus, marco de lotes, puerta de exportación, calendario de empresa, módulos activables, «Primeros pasos» | Núcleo | Ver 9.2 |
| Categorías y catálogos (Etapa 2) | La marca «se gestiona en MDM» de la categoría; las áreas que se mapean con el departamento de Entra | Núcleo | Campo nuevo en categoría (9.2) |
| `personas-ubicaciones` (PRS) | Vínculo cuenta ↔ Persona; propuestas que se aplican con los servicios de Personas; limpieza al anonimizar; línea informativa en el cese | Personas | Gancho de limpieza al anonimizar; MSF no crea Usuarios ni membresías |
| Inventario (Etapa 4) | Lee activos, series, IMEI, estado y asignación; muestra el bloque «Intune» y la marca; el ingreso manual recibe un activo hallado en Intune | Inventario | Bloque en la ficha y filtro en la lista; MSF nunca escribe en el activo |
| Órdenes de compra y recepción (Etapa 5) | La recepción crea los activos (RF-OC-035); el resumen previo informa los «pendientes de enrolar» | Compras | Una línea en el resumen de la recepción; la recepción no se bloquea |
| `entregas-devoluciones` (ENT) | La diferencia de «asignado a» lleva al asistente de Entregas; toda asignación sigue con acta | Entregas | Ninguna escritura desde MSF |
| `licencias-software` (LIC) | La empresa puede registrar allí su contrato de Microsoft 365 o Intune; MSF **no** lee licencias asignadas en esta versión | Licencias | Posterior: informar el «en uso» desde Entra (SUP-LIC-04) |
| `lineas-moviles` (LIN) | El IMEI del celular se compara con el del activo; el número de línea de Intune **no se trae** (dato personal, RN-LIN-018) | Líneas | Sin cambios |
| `onboarding-offboarding` (ONB) | Una propuesta de baja ofrece iniciar una salida; «Retirar el equipo de Intune» sigue siendo una tarea manual (RN-ONB-015) | Onboarding | Opcional: una tarea de plantilla sugerida |
| `cmdb-ligera` (CMD) | La ficha del EC de tipo Activo puede mostrar el bloque «Intune» leído de MSF; no se copia ni se materializa | CMDB y MSF | Pedido a CMD: mostrar el bloque como lectura |
| `integraciones-api` (INT) | Sin exposición por API ni webhooks (RN-MSF-063); el ingreso con Microsoft (INT-3) es independiente (RN-MSF-062) | INT | Informativo |
| `notificaciones` | Motor, tabla de avisos, reglas por fecha, catálogo de eventos | Notificaciones | Reglas y eventos de la sección 8 |
| `reportes-tableros` (REP) | Indicadores «no cumplen», «sin enrolar», «sin comunicación reciente» como filtros reutilizables | MSF | RF-MSF-042 |
| `portal-autoservicio` (POR) | No aplica en esta versión | n/a | Idea posterior: «Mis equipos» |
| `mesa-de-ayuda` (AYU) | No aplica: ningún caso se crea solo por incumplimiento | n/a | Idea posterior |
| `proveedores-contratos`, `presupuesto-costos`, `garantias-mantenimiento` | No aplica: este módulo no maneja dinero | n/a | Ninguno |

### 9.2 Qué cambia en el núcleo (lista; este documento no edita el núcleo)

1. **Tabla de fases (D-056) y sección 27 del documento funcional:** fila «Microsoft Entra ID e Intune» (Fase 3, ola G; MSF-1 paso G-2 y MSF-2 paso G-3, D-081). Registro del prefijo `MSF` y de `PAN-MSF` en la sección 26.2 (y en `docs/trazabilidad.md`, que regenera QA). No hay prefijo de documento nuevo. *Hecho en el documento funcional.*
2. **Categoría (RF-CAT-007, RF-CAT-027):** campo booleano «se gestiona en MDM» (RF-CAT-030), solo para naturaleza equipo físico, heredado por las subcategorías, apagado por defecto, editado con PS-34 y auditado. Preparación aprobada (D-081.4b) en la Etapa 2. *Hecho en el documento funcional.*
3. **Registro de permisos:** filas PS-241 a PS-246 (sección 3 de este módulo), ya agregadas al registro (sección 12B) con la sección 14 del registro y D-084. Sensible: PS-242. *Hecho.*
4. **Anonimización de Personas (RF-AUD-015, RN-PRS-018):** un gancho **síncrono** para que cada módulo limpie sus datos al anonimizar (el registro de módulo de D-038.6 gana «limpieza al anonimizar»; RF-DAT-018). Preparación aprobada (D-081.4c) en la Etapa 2. *Hecho en el documento funcional.*
5. **Tabla 18.1 de datos personales:** agregar las filas de la sección 6 de este módulo.
6. **Aviso de privacidad (RF-DAT-014):** mencionar los datos que llegan del directorio y de Intune de la empresa, para qué, quién los ve y por cuánto tiempo **[LEGAL: L-MSF-01]**.
7. **Gestión de secretos (RS-46, D-048.4):** incluir las credenciales de Microsoft entre los secretos con llave derivada por empresa; **RS-51 (solo huella)** declara la excepción (la credencial debe poder presentarse). **RS-52** (servicios externos con datos de la empresa) cubre la conexión de salida solo a direcciones fijas, cifrada y sin redirecciones, y la comprobación de permisos de solo lectura en cada lectura.
8. **Restauración de respaldo (RS-49, D-052.4):** las conexiones con Microsoft quedan Pausadas hasta reemplazar la credencial (RN-MSF-064).
9. **Cuadro único de topes (RS-45):** una fila para «Sincronizar ahora» por empresa.
10. **Recepción (RF-OC-040):** una línea en el resumen previo cuando haya categorías marcadas.
11. **Ficha y lista del activo (Etapa 4):** espacio para el bloque «Intune», la marca calculada y su filtro, sin cambiar los 5 estados (RF-INV-009).
12. **Asistente de cese (PAN-PRS-04):** espacio para una línea informativa de módulos activos.
13. **Catálogo de eventos (Notificaciones e Integraciones):** los nueve eventos `microsoft.*` y el evento síncrono de anonimización.
14. **Módulos activables (RF-EMP-005):** MSF se agrega a la lista de módulos que cada empresa enciende en Configuración; «Primeros pasos» gana la tarea opcional «Conectar Microsoft».
15. **Lista corta de tablas globales (D-039.5):** la tabla de directorios conectados.
16. **Paquete legal (sección 25):** L-MSF-01 a L-MSF-06. **Escalado al CEO (sección 25):** **D9** (licencias de Microsoft de cada empresa y costos de Graph; S-MSF-04 y S-MSF-06), **I-06** (acciones remotas: no se construyen; S-MSF-03) y los códigos legales L-MSF (S-MSF-05 y S-MSF-07), según D-084.3. *Hecho en el documento funcional.*

### 9.3 Qué cambia en otros módulos (pedidos, sin editarlos)

- `personas-ubicaciones.md`: gancho de limpieza al anonimizar; indicador «cuenta vinculada»; línea informativa en el asistente de cese.
- `cmdb-ligera.md`: mostrar el bloque «Intune» de un EC Activo como lectura.
- `onboarding-offboarding.md`: opcional, tarea sugerida «Verificar el equipo en Intune».
- `licencias-software.md`: nota en SUP-LIC-04 sobre la posible lectura futura del «en uso» desde Entra.
- `integraciones-api.md`: nota de que los datos de MSF no están en la API (RN-MSF-063).
- `notificaciones.md`: reglas y eventos de la sección 8.
- `reportes-tableros.md`: los tres indicadores de RF-MSF-042.

---

## 10. Criterios de aceptación

Cada criterio cita lo que cubre y la etapa en que se ejecuta. Las pruebas usan el simulador de Microsoft (RNF-MSF-006), el rol de la aplicación y dos empresas.

- **CA-MSF-01 Conectar y confirmar el directorio.** *Cubre RF-MSF-001, RN-MSF-004, 005, 006.* Dado un Administrador con `microsoft.conectar` y reautenticación reciente, cuando completa el asistente y el administrador de Microsoft de su empresa concede los permisos de lectura, entonces ve el nombre del directorio (por ejemplo `miempresa.onmicrosoft.com`), lo confirma y la conexión queda Conectada con la vista previa programada; si el directorio ya está conectado a otra empresa, entonces responde «No se puede conectar este directorio» sin decir a cuál; sin reautenticación reciente o segunda verificación se pide de nuevo y no se guarda nada; el Administrador de plataforma no puede conectar por la empresa. *Se ejecuta en: Fase 3 (MSF-1).*
- **CA-MSF-02 Solo lectura, comprobada en cada lectura, y conexión por partes.** *Cubre RF-MSF-001, 003, RN-MSF-007, 065, RNF-MSF-009.* Dado un consentimiento que, además de leer, incluye un permiso para modificar o ejecutar operaciones sobre equipos o cuentas, cuando la plataforma prueba la conexión, entonces queda «Pendiente de consentimiento» con «Quite los permisos de más y vuelva a probar» y no se usa para leer; con solo lectura queda Conectada; **y dado una conexión ya Conectada a la que Microsoft le agrega después un permiso de escritura, cuando corre la siguiente lectura (programada o manual), entonces la comprobación de permisos la detecta, la conexión pasa a «Pendiente de consentimiento», esa lectura no se hace, los titulares de `microsoft.conectar` reciben el aviso y la plataforma no usa nunca el permiso de más aunque exista; al quitarlo y probar de nuevo vuelve a Conectada**; si la empresa conecta solo usuarios, no se pide ni se usa ningún permiso de Intune. *Fase 3 (MSF-1).*
- **CA-MSF-03 La credencial es un secreto.** *Cubre RF-MSF-002, RN-MSF-002, 003, RNF-MSF-004.* Dado un ciclo completo (conectar, reemplazar, desconectar) con credenciales de prueba propias, cuando una búsqueda automática recorre base, auditoría, registros técnicos, errores, exportaciones y respaldos de prueba, entonces no encuentra ninguna credencial en claro; la pantalla nunca la vuelve a mostrar; y la credencial de la empresa A no permite leer el directorio de la empresa B. *Fase 3 (MSF-1).*
- **CA-MSF-04 Estado, vencimiento y pérdida de acceso.** *Cubre RF-MSF-004, RN-MSF-056, RNF-MSF-009.* Dado una credencial que vence el 20/11/2026, cuando faltan 30 días, 7 días y el mismo día, entonces los titulares de `microsoft.conectar` reciben el aviso; y dado un consentimiento retirado en Microsoft, cuando corre la siguiente lectura, entonces la conexión pasa a «Con problema», el mensaje es del catálogo (no el error crudo), los datos ya leídos siguen visibles con «dato desactualizado desde…» y se avisa. *Fase 3 (MSF-1).*
- **CA-MSF-05 Reemplazar la credencial.** *Cubre RF-MSF-005.* Dado una conexión Conectada, cuando el Administrador entrega una credencial nueva, entonces se prueba primero: si funciona, la anterior se descarta y no se pierde ningún dato; si no funciona, se conserva la anterior y se explica la razón. *Fase 3 (MSF-1).*
- **CA-MSF-06 Pausar y reanudar.** *Cubre RF-MSF-006.* Dado una conexión Conectada, cuando se pausa con motivo, entonces no se hace ninguna lectura y los datos siguen visibles con la fecha de su última lectura; al reanudar, se hace una lectura completa antes de marcar nada como desaparecido. *Fase 3 (MSF-1).*
- **CA-MSF-07 Desconectar.** *Cubre RF-MSF-007, RN-MSF-013, 060.* Dado una conexión con 1.000 cuentas y 300 equipos leídos, cuando el Administrador desconecta con motivo, entonces la credencial se elimina en el acto, las Personas y los activos siguen existiendo, los vínculos y el historial de cumplimiento quedan marcados «desconectado», se purgan las lecturas de equipos sin activo y los nombres de usuario no vinculados, y reconectar abre un asistente nuevo. *Fase 3 (MSF-1).*
- **CA-MSF-08 Sincronizar ahora y límites de Microsoft.** *Cubre RF-MSF-008, RN-MSF-051.* Dado el tope de lecturas manuales de la empresa, cuando se pide una más allá del tope, entonces responde «No se puede por una regla» con la espera; y dado que Microsoft pide esperar, cuando ocurre durante una lectura, entonces la plataforma espera ese tiempo sin reintentar en bucle, la lectura queda «Completada con avisos» o continúa después, y las conexiones de otras empresas no se frenan. *Fase 3 (MSF-1).*
- **CA-MSF-09 Historial de lecturas y procesos con dos empresas.** *Cubre RF-MSF-009, RN-MSF-050, RNF-MSF-003, 005.* Dado dos empresas (una suspendida) y una caída de dos días, cuando se retoman los procesos, entonces no hay duplicados, se recuperan los días en orden, cada propuesta y cada aviso quedan en su empresa, la suspendida se salta, una caída a mitad de lectura se retoma sin repetir propuestas, y el historial muestra fecha, tipo, resultado y cifras sin datos personales. *Fase 3 (MSF-1).*
- **CA-MSF-10 Vista previa y filtros.** *Cubre RF-MSF-010, 011.* Dado un directorio con 1.200 cuentas (900 miembros habilitados, 100 invitados, 200 deshabilitadas incluidos buzones compartidos), cuando se hace la primera lectura con los filtros por defecto, entonces se muestran las cifras (leídas, que cumplen el filtro, que ya coinciden con una Persona, altas posibles, sin datos suficientes) y no se crea ninguna Persona; una cuenta excluida con motivo no vuelve a proponerse. *Fase 3 (MSF-1).*
- **CA-MSF-11 Coincidencia y vínculo.** *Cubre RF-MSF-012, RN-MSF-014, 015, 016.* Dado la Persona `PRS-0042` Activa con correo `ana.ruiz@miempresa.com` y una cuenta con ese correo, cuando se lee, entonces se vincula por el identificador inmutable y no se propone alta; si Ana cambia su correo en Microsoft, el vínculo sigue y se propone un cambio de correo; si dos Personas coinciden, o la única coincidente está Cesada, entonces va «para revisión» y no se vincula nada; una Persona con dos cuentas vincula una sola. *Fase 3 (MSF-1).*
- **CA-MSF-12 Propuestas de alta y cambio.** *Cubre RF-MSF-013, RN-MSF-017, 018, 023, 025.* Dado una cuenta de miembro sin Persona, con nombre y correo, cuando termina la lectura, entonces aparece una propuesta de alta de tipo Empleado sin crear la Persona ni ningún Usuario; una cuenta sin correo ni código no genera propuesta y se cuenta «sin datos suficientes»; un nombre de 130 caracteres es error de esa fila; una propuesta pendiente vence a los 30 días y se regenera si persiste; una descartada no se repite hasta que el valor cambie; un dato editado a mano se propone como cambio, no se pisa. *Fase 3 (MSF-1).*
- **CA-MSF-13 Revisar y aplicar con permisos de Personas.** *Cubre RF-MSF-014, RN-MSF-019, 020.* Dado un Técnico con `microsoft.revisar_personas`, `personas.crear_editar` y `datos_personales.ver`, cuando aplica una propuesta de alta, entonces se crea la Persona con su referencia `PRS-NNNN` por el mismo servicio que el alta manual, la auditoría guarda el identificador y los nombres de los campos sin valores y la propuesta queda Aplicada; Jefatura TI (sin `personas.crear_editar`) ve la propuesta pero «Aplicar» sale desactivado con la razón, también al llamar directo al servidor; un usuario sin `datos_personales.ver` ve la propuesta sin nombres ni correos. *Fase 3 (MSF-1).*
- **CA-MSF-14 Aplicar en bloque (excepción a D-050).** *Cubre RF-MSF-015, RN-MSF-026.* Dado 300 propuestas de alta de las que 5 son inválidas, cuando el Administrador intenta aplicar en bloque, entonces **primero ve la vista previa obligatoria** (sin ella no se aplica nada) y la pantalla dice que no es «todo o nada»; al confirmar se aplican 295, las 5 se listan con su motivo, queda un lote con una sola entrada de auditoría, y el lote se puede anular mientras ninguna de esas Personas tenga un movimiento posterior; un lote por encima de los límites de tamaño de D-050 se rechaza. *Fase 3 (MSF-1).*
- **CA-MSF-15 Una baja en Microsoft no es un cese.** *Cubre RF-MSF-016, RN-MSF-012, 021.* Dado la cuenta de Ana deshabilitada en Microsoft, cuando se lee, entonces aparece «posible cese de `PRS-0042`»; la Persona sigue Activa con sus equipos asignados; al pulsar «Aplicar» se abre el asistente de cese con sus pendientes y sin bloqueo; Jefatura TI sin `usuarios.suspender` no puede cesar a quien tiene membresía (regla de Personas); en ningún caso se crea, cambia ni suspende un Usuario de la plataforma desde Microsoft. *Fase 3 (MSF-1).*
- **CA-MSF-16 Áreas desconocidas.** *Cubre RF-MSF-017, RN-MSF-024.* Dado cuentas con el departamento «Logística Norte» que no existe como área, cuando se generan propuestas, entonces el área queda vacía y «Logística Norte» se lista como valor por aprobar; solo quien tiene `estructura.gestionar` puede crearla o mapearla a una existente. *Fase 3 (MSF-1).*
- **CA-MSF-17 Desvincular una cuenta.** *Cubre RF-MSF-018.* Dado `PRS-0042` vinculada, cuando quien tiene `microsoft.revisar_personas` la desvincula con motivo, entonces el vínculo termina, la Persona y sus equipos no cambian y la lectura no la vuelve a vincular a esa cuenta. *Fase 3 (MSF-1).*
- **CA-MSF-18 Anonimización.** *Cubre RF-MSF-019, RN-MSF-022, 059.* Dado `PRS-0042` cesada y anonimizada por un pedido de derechos, cuando una búsqueda de un nombre y un correo «canario» recorre tablas, propuestas, lecturas, exportaciones y avisos, entonces no encuentra nada; el vínculo y las copias del nombre de usuario se borraron en la misma operación; y al leer el directorio de nuevo no se propone un alta para esa cuenta (huella de exclusión, pendiente de la opinión legal). *Fase 3 (MSF-1).*
- **CA-MSF-19 Marca de categoría y «Pendiente de enrolar».** *Cubre RF-MSF-020, 021, RN-MSF-027, 028, 029.* Dado la categoría Laptop (equipo físico) y 40 activos sin vínculo, cuando el Administrador (con `categorias.gestionar`) activa «se gestiona en MDM», entonces ve «40 activos quedarán pendientes de enrolar», lo confirma, y los 40 muestran la marca calculada sin cambiar su estado ni escribir movimientos; una categoría de naturaleza «licencia» no ofrece la marca; un activo De baja o Extraviado o robado no la muestra; la marca no bloquea entregar, recibir ni cesar. *Fase 3 (MSF-2).*
- **CA-MSF-20 De la orden de compra a Intune, de punta a punta.** *Cubre RF-MSF-022, 025, 032.* Dado la OC-000042 aprobada con 10 laptops por serie, cuando Almacén confirma la recepción, entonces el resumen previo dice «10 activos quedarán pendientes de enrolar en Intune» y se crean 10 activos `ACTV-` con la marca; si Intune ya tenía 3 de esas series, se vinculan en el acto con la última lectura; los otros 7 se vinculan en la lectura siguiente a su enrolamiento y la marca desaparece; si uno ya fue entregado hace más días que el umbral y sigue sin enrolar, aparece en la conciliación como «entregado sin enrolar». *Fase 3 (MSF-2).*
- **CA-MSF-21 Solo equipos corporativos y datos mínimos.** *Cubre RF-MSF-023, RN-MSF-008, 009, 010.* Dado Intune con 500 equipos corporativos y 80 personales, cuando se lee, entonces los 80 se descartan sin guardarse y solo se muestra «80 equipos personales omitidos»; excepto uno cuya serie coincide con el activo `LAP-0042`, del que se guarda solo el hallazgo «datos de identificación distintos: propiedad», **sin usuario principal ni nombre del equipo**; ninguna tabla contiene ubicación, aplicaciones, número de teléfono ni claves de recuperación aunque Microsoft las entregue; no existe un campo para escribir direcciones de conexión. *Fase 3 (MSF-2).*
- **CA-MSF-22 Vínculo automático por serie o IMEI.** *Cubre RF-MSF-024, RN-MSF-030, 031, 032, 033, 036.* Dado un activo con serie `5CG1234ABC` y un equipo de Intune con `5cg1234abc ` (minúsculas y un espacio), cuando se concilia, entonces se vinculan solos (misma normalización de RF-INV-002); un celular sin coincidencia de serie se vincula por su IMEI `356938035643809`; una serie genérica de la lista de no válidos no se usa; una serie que coincide con dos activos de distinto SKU queda «coincidencia dudosa» y no se vincula; un equipo vinculado con un activo de categoría no marcada sugiere marcar la categoría. *Fase 3 (MSF-2).*
- **CA-MSF-23 Coincidencia dudosa y desvinculación.** *Cubre RF-MSF-029, RN-MSF-033, 034, 035.* Dado una coincidencia dudosa, cuando quien tiene `microsoft.conciliar` elige el activo correcto, entonces queda vinculado; cuando desvincula un par con motivo, la lectura no lo vuelve a vincular; y tras borrar y reenrolar un equipo en Intune (identificador nuevo, misma serie) el vínculo se conserva. *Fase 3 (MSF-2).*
- **CA-MSF-24 Bloque «Intune» y datos personales.** *Cubre RF-MSF-026, RN-MSF-037, 038, 039, 040, 054, RNF-MSF-007.* Dado un activo vinculado, cuando un usuario con `activos.ver`, `microsoft.ver` y `datos_personales.ver` abre la ficha, entonces ve el cumplimiento (con texto), la última comunicación, la versión del sistema, el cifrado (Sí, No o Sin dato), la propiedad, la fecha de enrolamiento, el usuario principal y «dato al 29/10/2026 08:00»; sin `datos_personales.ver` el usuario principal, el IMEI y el nombre del equipo aparecen como `PRS-0042` o enmascarados; Almacén (sin `microsoft.ver`) no ve el bloque; el estado se entiende sin color, a 360 px y con teclado. *Fase 3 (MSF-2).*
- **CA-MSF-25 Historial de cumplimiento.** *Cubre RF-MSF-027.* Dado un equipo que pasa de Cumple a No cumple y luego a Cumple, cuando se abre su historial, entonces ve dos cambios con fecha y sin datos personales; una lectura sin cambios no escribe filas. *Fase 3 (MSF-2).*
- **CA-MSF-26 Lista, filtros y exportación.** *Cubre RF-MSF-028, RN-MSF-053, 054.* Dado una lista de 5.000 equipos, cuando se filtra por «No cumple» y «sin comunicación reciente» y se exporta, entonces la exportación pasa por la puerta única (`datos.exportar`, motivo, hoja «Aviso»), omite usuario principal, IMEI y nombre del equipo si falta `datos_personales.ver` y deja una entrada con la cantidad; sin `datos.exportar` el botón se ve desactivado con la razón. *Fase 3 (MSF-2).*
- **CA-MSF-27 Panel de conciliación calculado.** *Cubre RF-MSF-030, 032, RN-MSF-042, 043.* Dado un día con 12 equipos en Intune sin inventario, 6 entregados sin enrolar y 3 diferencias de asignado a, cuando se abre el panel, entonces muestra esas cifras con prioridad y fecha de corte; al corregir una causa, el hallazgo se resuelve solo en la lectura siguiente; si la última lectura no terminó completa, ningún equipo pasa a «ya no aparece en Intune». *Fase 3 (MSF-2).*
- **CA-MSF-28 En Intune y no en el inventario.** *Cubre RF-MSF-031, 036, RN-MSF-011, 048, 049.* Dado un equipo corporativo de Intune con serie `ABC123` sin activo, cuando el Técnico (con `activos.ingreso_manual`) elige «Registrar en el inventario», entonces se abre el ingreso manual con serie, fabricante y modelo precargados, el motivo «Encontrado en Intune» y el SKU por elegir (no se crea solo); al guardar, el equipo se vincula y el hallazgo se resuelve; «Ignorar con motivo» exige el motivo, deja quién y cuándo y se puede reabrir; sin `activos.ingreso_manual` la acción sale desactivada con la razón; nada del activo cambia por lo que diga Intune. *Fase 3 (MSF-2).*
- **CA-MSF-29 Diferencia de asignado a.** *Cubre RF-MSF-033, RN-MSF-046, 047.* Dado una laptop asignada a `PRS-0042` y un usuario principal vinculado a `PRS-0077`, cuando se lee, entonces hay un hallazgo con ambas referencias y su botón lleva al asistente de Entregas (traspaso con acta); ninguna asignación cambia sola; un equipo sin usuario principal asignado a un Custodio no genera hallazgo. *Fase 3 (MSF-2).*
- **CA-MSF-30 Extraviado que se comunica y baja que sigue.** *Cubre RF-MSF-034, RN-MSF-044, 045.* Dado el activo `ACTV-000123` Extraviado o robado cuyo equipo informa comunicación el 28/10/2026, cuando se lee, entonces hay un hallazgo de prioridad Alta, un aviso inmediato a Jefatura TI y administradores con el código `ACTV` (sin serie, IMEI ni nombres), y el estado del activo no cambia; un activo De baja que sigue en Intune genera «retirar de Intune». *Fase 3 (MSF-2).*
- **CA-MSF-31 Duplicados en Intune.** *Cubre RF-MSF-035, RN-MSF-032.* Dado dos registros de Intune con la misma serie y comunicación del 20/10/2026 y del 28/10/2026, cuando se concilia, entonces el vigente es el del 28/10 y el otro se marca «registro duplicado en Intune» (prioridad baja) sin afectar el vínculo. *Fase 3 (MSF-2).*
- **CA-MSF-32 Línea informativa en el cese.** *Cubre RF-MSF-037.* Dado `PRS-0042` con 2 equipos de Intune donde es usuario principal, cuando Jefatura TI abre el asistente de cese, entonces ve «2 equipos en Intune la tienen como usuario principal» y el cese no se bloquea. *Fase 3 (MSF-2).*
- **CA-MSF-33 Sin acciones remotas.** *Cubre RF-MSF-038, RN-MSF-061.* Dado una conexión Conectada, cuando se revisan los permisos solicitados a Microsoft y las pantallas, entonces no hay ningún permiso de escritura ni botón para bloquear, borrar, retirar, restablecer o cambiar cuentas; una llamada directa al servidor pidiendo esas acciones responde «No se puede por una regla». *Fase 3 (MSF-1).*
- **CA-MSF-34 Avisos con contenido mínimo.** *Cubre RF-MSF-039, RN-MSF-055.* Dado 12 equipos en Intune sin inventario, cuando sale el resumen semanal, entonces dice «Hay 12 equipos en Intune que no están en el inventario» sin series, IMEI ni nombres; ningún empleado recibe un aviso de incumplimiento; dos corridas el mismo día no duplican el aviso. *Fase 3 (MSF-1).*
- **CA-MSF-35 Dato con fecha y lectura fallida.** *Cubre RF-MSF-040, RN-MSF-041, 042.* Dado una lectura fallida porque Microsoft no responde, cuando se abre la ficha de un equipo, entonces muestra «dato desactualizado desde 27/10/2026 08:00», no cambia ningún estado derivado y ningún equipo pasa a «ya no aparece». *Fase 3 (MSF-1).*
- **CA-MSF-36 Suspensión, módulo apagado y restauración.** *Cubre RF-MSF-041, RN-MSF-058, 064.* Dado la empresa A suspendida, cuando corren las lecturas, entonces se salta A y se leen las demás; con el módulo apagado en B, las pantallas y la API responden «No encontrado» y no se borra nada; tras restaurar un respaldo antiguo, las conexiones quedan Pausadas y exigen reemplazar la credencial, y las anonimizaciones se reaplican antes de abrir el sistema. *Fase 3 (MSF-1).*
- **CA-MSF-37 Aislamiento entre empresas.** *Cubre RN-MSF-001, 002, RNF-MSF-005, 010.* Dado las empresas A y B, cuando un usuario de B pide por identificador interno una conexión, propuesta, lectura de equipo, vínculo o hallazgo de A, o intenta vincular un activo de B con un equipo de Intune de A (escritura con referencia cruzada), entonces recibe «No encontrado», no se escribe nada y el rol de la aplicación no ve filas de A aunque la consulta omita el filtro; al cambiar de empresa activa no se arrastra ningún dato. *Fase 3 (MSF-1).*
- **CA-MSF-38 Permiso denegado.** *Cubre la sección 3.* Dado Jefatura TI sin `microsoft.conectar`, un Técnico sin `microsoft.configurar`, un usuario Solo lectura sin `microsoft.conciliar` y Almacén sin `microsoft.ver`, cuando cada uno intenta su acción por pantalla o llamando directo al servidor, entonces recibe «No tiene permiso», no cambia nada y el intento queda en el registro de seguridad. *Fase 3 (MSF-1).*
- **CA-MSF-39 Auditoría sin valores personales.** *Cubre RN-MSF-052, 053, RNF-MSF-008.* Dado un ciclo (conectar, aplicar un cambio de nombre, vincular un equipo, ignorar un hallazgo con motivo, exportar), cuando se consulta la auditoría, entonces se ve quién, cuándo, el identificador de la Persona o del activo y «nombre cambió» sin valores; el motivo de ignorar sí se ve (D-077); cada lectura es una sola entrada con cifras; una consulta con 150 nombres de Personas deja «150 personas» sin nombres; lo automático tiene autor «sistema». *Fase 3 (MSF-1).*
- **CA-MSF-40 Texto libre.** *Cubre RN-MSF-057.* Dado un motivo de descarte con un bloque de clave privada, cuando se intenta guardar, entonces se rechaza con un mensaje que no repite el texto. *Fase 3 (MSF-1).*
- **CA-MSF-41 Independencia y sin API.** *Cubre RN-MSF-062, 063.* Dado una empresa con Microsoft conectado que no activó el ingreso con Microsoft (PS-137), cuando una persona intenta entrar a la plataforma con su cuenta de Microsoft, entonces no entra por esta conexión; y una clave de API de la empresa que pide datos de este módulo recibe «No encontrado». *Fase 3 (MSF-1).*
- **CA-MSF-42 Rendimiento y segundo plano.** *Cubre RNF-MSF-001, 002.* Dado el volumen de RNF-010, cuando corre la prueba de carga nocturna con el simulador, entonces la primera página de la lista de equipos y del panel responde en 2 segundos o menos (percentil 95), la lectura corre en segundo plano con avance y el resto de la plataforma responde igual. *Fase 3 (MSF-2).*
- **CA-MSF-43 Indicadores para reportes.** *Cubre RF-MSF-042.* Dado el módulo activo, cuando `reportes-tableros` pide los indicadores, entonces los recibe como filtros reutilizables que respetan el permiso del usuario y no traen datos personales sin `datos_personales.ver`. *Fase 3 (MSF-2, junto con REP).*
- **CA-MSF-44 Sin datos reales en las pruebas.** *Cubre RNF-MSF-006.* Dado el repositorio y el entorno de pruebas, cuando la prueba global busca, entonces no hay credenciales, identificadores de directorio ni nombres reales de Microsoft, y todas las pruebas del módulo corren contra el simulador con datos inventados. *Fase 3 (MSF-1).*

---

## 11. Casos límite

1. **Directorio ya conectado a otra empresa:** rechazo genérico, sin decir a cuál (RN-MSF-005).
2. **Dos empresas del grupo comparten un mismo directorio de Microsoft:** solo una lo conecta y la otra espera (D-085.1, RN-MSF-005); dividir un directorio por grupos sería un módulo aparte.
3. **El administrador de Microsoft retira el consentimiento o la credencial vence:** la conexión pasa a «Con problema»; los datos quedan visibles como desactualizados; nada se borra.
4. **Microsoft no responde o limita las llamadas:** la lectura falla o se espera; ningún equipo ni cuenta se marca «ya no aparece» (RN-MSF-042).
5. **Serie genérica o repetida en Intune** (equipos virtuales, placas sin completar): no se usa para vincular (RN-MSF-031).
6. **Misma serie en dos registros de Intune tras un reenrolamiento:** vale el de comunicación más reciente; el otro es «duplicado» (RN-MSF-032).
7. **Misma serie en dos activos de distinto SKU:** coincidencia dudosa; una persona decide.
8. **Celular con dos IMEI:** se compara con cada uno (RN-MSF-030).
9. **IMEI de Intune distinto al del inventario:** hallazgo «datos distintos»; el vínculo no es automático.
10. **Equipo personal (BYOD) de un empleado:** se descarta sin guardarse; si su serie coincide con un activo corporativo, se señala la diferencia de propiedad (RN-MSF-010).
11. **Equipo compartido sin usuario principal** (PDA de almacén, equipo de sala): no es diferencia de «asignado a» si está a cargo de un Custodio (RN-MSF-046).
12. **Usuario principal que es invitado o cuenta de servicio:** «Usuario sin Persona vinculada»; no se propone alta si no cumple el filtro.
13. **El correo de un exempleado se asigna a una persona nueva:** la coincidencia con una Persona Cesada va «para revisión», nunca se vincula sola (RN-MSF-015).
14. **Cuenta deshabilitada por licencia o vacaciones:** solo una propuesta de cese descartable; descartarla se recuerda hasta que el estado cambie.
15. **Cuenta eliminada y recreada en Microsoft** (identificador nuevo): va «para revisión» como posible misma persona; no se duplica la Persona.
16. **Cambio de correo en Entra:** el vínculo sigue por el identificador inmutable; se propone un cambio.
17. **Persona anonimizada que sigue en el directorio:** no se vuelve a proponer su alta (huella de exclusión, pendiente legal).
18. **Cambio de la placa de un equipo, que cambia su serie:** se corrige la serie del activo con RF-INV-007 y motivo; el vínculo se rehace.
19. **Categoría que se desmarca con equipos vinculados:** los vínculos y lecturas se conservan; deja de existir «Pendiente de enrolar».
20. **Activo reingresado (De baja a En stock):** se vuelve a evaluar; el vínculo previo se conserva.
21. **Recepción de 1.000 series:** la marca es calculada; no se escriben 1.000 filas.
22. **Primera lectura de una empresa con miles de cuentas y equipos:** vista previa, lote y una sola entrada de auditoría; no degrada a otras empresas.
23. **Restaurar un respaldo antiguo:** las conexiones quedan Pausadas hasta reemplazar la credencial (RN-MSF-064).
24. **Cambio de zona horaria de la empresa:** «última comunicación» y los umbrales se recalculan al leer (RF-EMP-003).
25. **Una cuenta que no cabe en los límites de largo** (nombre de más de 120 caracteres): error de esa fila, no de toda la lectura.
26. **Empresa sin Intune pero con Entra:** conecta solo usuarios; la parte de equipos no aparece (RN-MSF-065).
27. **Categoría marcada sin ningún equipo en Intune:** todos los activos entregados aparecen «entregados sin enrolar» pasado el umbral; el aviso resume, no repite por activo.

---

## 12. Decisiones propuestas, supuestos y preguntas

### 12.1 Supuestos

| ID | Tipo | Propuesta y motivo |
|---|---|---|
| S-MSF-01 | Confirmado (D-081) | **Fase 3, ola G**, después de la ola F, en el orden ASI-A, MSF-1, MSF-2, ASI-B, ASI-C. MSF-1 necesita las Etapas 1 y 2, secretos, cola y NOT-completo; MSF-2 necesita MSF-1 y las Etapas 4 y 5. MSF-1 solo pasa a después de la ola D por decisión escrita del Gerente de TI al cerrar la Etapa 7; nunca antes. Registrada en la tabla de D-056. |
| S-MSF-02 | Resuelto (decisión del Gerente de TI al aprobar el módulo) | **La primera versión es de solo lectura.** Ninguna acción remota ni escritura en Microsoft. |
| S-MSF-03 | **[ESCALAR AL CEO]** (irreversible; código **I-06**) | **Acciones remotas (bloquear, borrar, retirar):** son **irreversibles** (borrar o retirar un equipo destruye datos) y pueden tener efectos laborales y legales. **No se construyen.** Si el CEO las pide, se proponen aparte con: doble control (una persona propone y otra ejecuta), permiso sensible distinto por acción, reautenticación reciente y segunda verificación, motivo obligatorio, solo sobre equipos corporativos ya vinculados con confirmación de la serie, una vista previa del equipo afectado, y sin casilla de excepción. «Borrar» y «retirar» requieren decisión escrita del CEO y opinión legal. Mientras tanto la persona de TI actúa directamente en Intune. |
| S-MSF-04 | **[ESCALAR AL CEO]** (dinero; código **D9**) | **Licencias de Microsoft que cada empresa ya debe tener.** Intune es un servicio con licencia que la empresa contrata con Microsoft (suelta o dentro de un paquete); la plataforma no compra, revende ni administra esas licencias, y no se cotiza. Leer cuentas de Entra normalmente no exige una licencia adicional de pago, y las funciones avanzadas de Entra no se usan **[a verificar contra la documentación vigente de Microsoft]**. Sin Intune licenciado, solo funciona la parte de usuarios. Qué licencias tiene cada empresa se averigua con cada empresa al activar el módulo, no con el CEO (D-085.6). |
| S-MSF-05 | **[ESCALAR AL CEO]** (legal y seguridad) | **Permisos de Microsoft Graph.** Cada empresa debe autorizar a la plataforma a leer su directorio y su Intune; solo la puede dar un administrador de Microsoft de esa empresa. Ejemplos de permisos de **lectura** (a verificar, el Arquitecto fija la lista exacta en su ADR): lectura de usuarios del directorio, lectura de dispositivos administrados de Intune, lectura de la organización (nombre del directorio) y, opcional, lectura de grupos. Ejemplos de permisos que **nunca** se piden: los de operaciones privilegiadas sobre dispositivos (borrar, retirar, bloquear) y cualquier escritura. Si la plataforma usa una aplicación propia para todas las empresas, Microsoft puede exigir una verificación del editor **[a verificar]**. Las condiciones de uso de Microsoft y el contrato entre el CEO y cada empresa deben cubrir esta lectura (L-MSF-06). |
| S-MSF-06 | **[ESCALAR AL CEO]** (dinero; código **D9**) | **Límites de uso y costo de Microsoft Graph.** Microsoft limita cuántas llamadas se pueden hacer y puede cambiar esos límites; **no se prometen cifras**. No se espera un cargo por llamada para las lecturas que usa este módulo **[a verificar]**; si Microsoft cambiara las condiciones o cobrara por alguna lectura, se consulta al CEO antes de seguir. El diseño obedece las esperas que pide Microsoft (RN-MSF-051). |
| S-MSF-07 | **[ESCALAR AL CEO]** (legal) | **Datos personales que vienen de Microsoft.** Ver L-MSF-01 a L-MSF-06. Mientras legal no responda: solo equipos corporativos, nada de BYOD, nada de ubicación ni de aplicaciones, sin avisos a empleados, sin purgas automáticas y los plazos de la sección 6 como provisionales. |
| S-MSF-08 | Confirmado (D-085.1) | Un directorio de Microsoft se conecta a una sola empresa; el rechazo no revela a cuál (RN-MSF-005). Si dos empresas del grupo lo comparten, solo una lo conecta y la otra espera. |
| S-MSF-09 | Confirmado (D-085.2) | Solo equipos de propiedad corporativa; los personales (BYOD) se descartan y solo se guarda su conteo, salvo coincidencia de serie, donde se guarda solo el hallazgo «propiedad distinta» sin usuario principal ni nombre del equipo (RN-MSF-010). |
| S-MSF-10 | [SUPUESTO] | Filtros por defecto de cuentas: solo miembros habilitados; los invitados no se leen salvo que el Administrador lo decida. |
| S-MSF-11 | [SUPUESTO] | Se vincula sola únicamente la coincidencia única con una Persona Activa o con un único activo; todo lo demás va a revisión. |
| S-MSF-12 | Confirmado como excepción a D-050 (D-085.3) | Aplicar propuestas en bloque no es «todo o nada» (RN-MSF-026), con vista previa obligatoria, rechazadas listadas con su motivo, un lote con una sola entrada de auditoría, anulable (D-072), mismos límites de tamaño de D-050 y la pantalla lo dice. Mismo criterio de D-053 DS-08. |
| S-MSF-13 | [SUPUESTO] | Las propuestas pendientes vencen a los 30 días y se regeneran. |
| S-MSF-14 | [SUPUESTO] | MDM = solo Intune (P-MSF-02). |
| S-MSF-15 | [SUPUESTO] | Solo la nube pública de Microsoft; las nubes soberanas o gubernamentales quedan fuera. |
| S-MSF-16 | [SUPUESTO] | «Última conexión» del pedido = última comunicación con Intune, no el último uso del equipo. |
| S-MSF-17 | [SUPUESTO] | Quedan fuera de esta versión: dispositivos de Entra que no están en Intune, registro previo de equipos (Autopilot), políticas de cumplimiento, grupos como fuente de datos (salvo el filtro opcional). |
| S-MSF-18 | [SUPUESTO] | Los datos de este módulo no salen por la API pública ni por webhooks; si se abren, solo lectura, con `datos_personales.ver` en la clave para usuario principal e IMEI (como RN-INT-008). |
| S-MSF-19 | [SUPUESTO] | Avisos de credencial a los 30 y 7 días y el mismo día; resumen semanal para «no cumple»; aviso inmediato solo para extraviado o robado que se comunica. |
| S-MSF-20 | [SUPUESTO] | **Mecanismo de la credencial** (una aplicación registrada por cada empresa en su Microsoft, o una aplicación multiempresa de la plataforma con consentimiento por empresa): lo propone el Arquitecto. Funcionalmente la credencial es **por empresa**. Si el Arquitecto elige una aplicación multiempresa, su secreto es de plataforma y es un punto único que Seguridad debe revisar. |
| S-MSF-21 | [SUPUESTO] | La marca «se gestiona en MDM» es opt-in por categoría y apagada por defecto. «Entregado sin enrolar» cuenta solo activos Asignados; incluir En stock es una opción de la empresa. |
| S-MSF-22 | [SUPUESTO] | Lista de series genéricas no válidas mantenida por la plataforma (RN-MSF-031). |
| S-MSF-23 | [SUPUESTO] | El asistente de conexión abandonado vence a los 7 días. |

### 12.2 Preguntas y respuestas (D-085.6)

Los demás [SUPUESTO] (S-MSF-10, S-MSF-11 y S-MSF-13 a S-MSF-23) siguen **propuestos** hasta las revisiones de Seguridad, Cumplimiento y QA (D-085.5). De las cuatro preguntas, tres ya tienen respuesta y **solo P-MSF-02 sigue con el CEO**, porque depende de su cliente real (hoja del CEO, sección D).

| ID | Pregunta | Respuesta | Estado |
|---|---|---|---|
| P-MSF-01 | ¿Qué empresas del grupo usan hoy Entra ID e Intune y alguna comparte un mismo directorio de Microsoft con otra empresa de la plataforma? | **Cada empresa con su propio directorio**, como en RN-MSF-005. Si dos comparten uno, solo una lo conecta y la otra espera; dividirlo por grupos sería un módulo aparte. Qué licencias tiene cada empresa se averigua con cada una al activar el módulo (D9) | **Respondida (D-085.1, D-085.6)** |
| P-MSF-02 | ¿Algún tipo de equipo (Mac, iPhone, PDA) lo administra otro sistema distinto de Intune? Opciones: (a) todo en Intune; (b) alguno en otro sistema (ese tipo queda fuera y se evalúa un módulo aparte) | Depende del cliente real. **Recomendación: (a) todo en Intune.** Si el CEO no responde, se asume (a) (S-MSF-14) | **Abierta, con el CEO** |
| P-MSF-03 | ¿Qué categorías deben marcarse «se gestiona en MDM»? | Se sugieren **laptop, celular, tableta y PDA**; cada empresa decide las suyas con PS-34 y la marca **nunca se pone sola** | **Respondida (D-085.6)** |
| P-MSF-04 | ¿Quién es el administrador de Microsoft de cada empresa y puede dar el consentimiento? | **No es una pregunta para el CEO:** se pide a cada empresa al activar el módulo (RN-MSF-006) y no antes. Hasta entonces la conexión no se prueba con una empresa real | **Respondida (D-085.6)** |

### 12.3 Preguntas legales nuevas (para el paquete del abogado, L-01 a L-16)

| ID | Pregunta | Se relaciona con |
|---|---|---|
| L-MSF-01 | Base legal y aviso: traer a la plataforma los datos del directorio corporativo y de los equipos de los empleados, y qué debe decir el aviso de privacidad. | L-01, L-03 |
| L-MSF-02 | Alojar esos datos en el servidor de la plataforma, posiblemente en otro país, y el papel de Microsoft como proveedor. | L-07, L-08 |
| L-MSF-03 | Plazos de conservación de las lecturas, propuestas y vínculos (sección 6). | L-04 |
| L-MSF-04 | Conservar una huella irreversible del identificador de la cuenta para no volver a importar a quien ejerció su derecho de eliminación. | L-06 |
| L-MSF-05 | Seguimiento de equipos con usuario principal (cumplimiento, última comunicación) y sus efectos laborales o de vigilancia. | L-10, L-11 |
| L-MSF-06 | Condiciones de uso de Microsoft Graph e Intune y contrato entre el CEO y cada empresa para esta lectura. | L-08 |

---

## 13. Fuera de alcance

- **Acciones remotas** sobre equipos: bloquear, borrar, retirar, restablecer, reiniciar, forzar sincronización, asignar políticas, aplicaciones o perfiles (S-MSF-03).
- **Cualquier escritura en Microsoft:** crear, editar o deshabilitar cuentas, grupos o licencias; sincronizar de la plataforma hacia Entra.
- **Crear Usuarios de la plataforma, vincular membresías o dar roles desde Entra** (D-001). El ingreso con Microsoft es INT-3.
- **Otros sistemas de administración de dispositivos** (Jamf, Workspace ONE, SOTI, Google) y **nubes soberanas** de Microsoft.
- **Equipos personales de empleados (BYOD).**
- **Datos que nunca se traen:** ubicación, aplicaciones instaladas, contenido, número de teléfono, claves de recuperación del cifrado, registros de inicio de sesión, fotos.
- **Dispositivos de Entra que no están en Intune, registro previo de equipos (Autopilot), grupos como fuente, políticas de cumplimiento** y su configuración.
- **Medir el uso de licencias de Microsoft 365** desde Entra (conexión natural con LIC, SUP-LIC-04): posterior.
- **Avisos o recordatorios a los empleados** por incumplimiento; pantalla «Mis equipos» del portal.
- **Casos de mesa de ayuda creados solos** por un equipo que no cumple.
- **Exposición por API pública o webhooks** (S-MSF-18).
- **Costos de las licencias de Microsoft** (los registra LIC o PRE si la empresa lo desea).
- **Automatizar la aplicación de propuestas** sin revisión humana.

---

## 14. Historial de cambios

| Cambio | Decisión o hallazgo que lo motiva |
|---|---|
| **v0.1:** primera versión del módulo, propuesta a partir del pedido del CEO y la aprobación del Gerente de TI | Pedido del CEO (conectar Entra ID e Intune), aprobación del Gerente de TI |
| Nunca se crean Usuarios desde Entra; no se vincula membresía en automático; coincidencia por identificador inmutable | D-001, D-054.5, RN-PRS-017 |
| Solo lectura; acciones remotas fuera y marcadas [ESCALAR AL CEO] | Decisión del Gerente de TI, regla de escalado a la Jefatura |
| Credencial por empresa como secreto, con llave derivada por empresa, reautenticación reciente y segunda verificación | D-048.1, D-048.2, D-048.4, RS-46 |
| PS-242 como único permiso nuevo sensible; propuestas PS-241 a PS-246 | D-036, D-068, registro de permisos sección 14 |
| **v0.2 (29/10/2026).** Los seis permisos se renumeran (los números anteriores pasaron al Asistente de IA) a PS-241 a PS-246 con los nombres de D-084 (`microsoft.ver`, `microsoft.conectar`, `microsoft.configurar`, `microsoft.sincronizar_ahora`, `microsoft.revisar_personas`, `microsoft.conciliar`) y quedan en el registro (sección 12B) | D-084 |
| Ola G: MSF-1 es el paso G-2 y MSF-2 el G-3, entre ASI-A y ASI-B; sin adelantos; datos reales solo con L-MSF-01 a L-MSF-06; las preparaciones (b) y (c) quedan aprobadas | D-081 |
| S-MSF-08, S-MSF-09, S-MSF-12 y RN-MSF-007 pasan a Confirmado, con sus condiciones en RN-MSF-005, 007, 010 y 026, CA-MSF-02, 14 y 21; la revisión de permisos de escritura se hace en **cada lectura**; respuestas a P-MSF-01, 03 y 04 (sección 12.2); códigos D9 e I-06 | D-085 |
| Auditoría con el identificador y los campos que cambiaron, sin valores; el motivo sí por valor | D-030, D-077 |
| IMEI, usuario principal y nombre del equipo como datos personales; consultas de 100 o más nombres auditadas | D-030.6, D-071.4, L-09 |
| «Pendiente de enrolar» como marca calculada, no como estado | RF-INV-009, D-062.2 |
| Cese que no se bloquea; la baja en Microsoft solo propone | D-034, D-061.7 |
| Avisos con el código `ACTV` y sin datos personales | D-061.4, D-079 |
| Procesos con idempotencia, recuperación, «hoy» por empresa y pruebas con dos empresas | D-038.4, D-039.6, D-063.6 |
| Sin casillas del interruptor único: el módulo no mueve dinero | D-043, D-066 |
| Filas para la tabla 18.1 y preguntas legales nuevas | D-061.3, D-075 R-09 |
| Fase 3, ola G propuesta | D-056 |
