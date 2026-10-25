# Módulo: Gestión de cambios (`gestion-cambios`, sigla CAM)

**Versión:** 0.1 (borrador del analista funcional, Oleada B, escuadrón E)
**Se apoya en:** `docs/equipo/decisiones.md` (D-001 a D-029), `docs/documento-funcional.md` v0.1 y la propuesta de separación de funciones `docs/equipo/mesa-001/propuesta-r4-cumplimiento.md`.
**Marcas:** [SUPUESTO] = decisión propuesta por el analista, a confirmar por el Gerente de TI. [ESCALAR AL CEO] = solo dinero, tema legal o algo irreversible.

---

## 1. Propósito, alcance y fase

**Propósito.** Que ningún cambio en la tecnología de la empresa (actualizar un servidor, cambiar el router, migrar el correo) se haga "porque sí". Cada cambio tiene quién lo pide, qué riesgo tiene, quién lo autoriza, cuándo se hace, cómo se vuelve atrás si sale mal y qué se aprendió. Es una versión ligera: tres tipos de cambio, un solo nivel de aprobación y pocos campos.

**Ejemplo.** Marta (Técnico) pide cambiar el router principal de la oficina el sábado a las 22:00. Indica que afecta al servicio "Wi-Fi oficinas". El sistema calcula riesgo Medio (la CMDB dice que 35 laptops dependen de ese Wi-Fi). Carlos (Jefatura TI) lo aprueba, Marta lo ejecuta, anota que salió bien y lo cierra.

**Entra en este módulo**
1. Solicitud de cambio con tres tipos: **Estándar**, **Normal** y **Urgente**.
2. Evaluación de impacto y probabilidad de falla, con riesgo calculado y sugerencia desde la CMDB.
3. Aprobación según tipo y riesgo, con separación de funciones (quien pide no aprueba).
4. Plantillas de cambio estándar pre-aprobadas.
5. Calendario con ventanas de mantenimiento permitidas y periodos de congelamiento.
6. Plan de implementación, plan de reversa y criterio de éxito obligatorios.
7. Estados, resultado, cierre y revisión posterior.
8. Vínculo con elementos de configuración (activos, servicios, dominios) de la CMDB, con incidentes y con problemas.

**No entra:** comités de cambios con reuniones y votos, aprobación en varios niveles (D-023), costos del cambio, ejecución automática de scripts, notificación a usuarios finales por canales externos. Ver sección 13.

**Fase.** [SUPUESTO] Posterior a la Etapa 4, después de `cmdb-ligera` y antes de `gestion-problemas` (los problemas se resuelven con cambios).

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Cambio** | Modificación planificada de algo de TI que podría afectar a las personas o a un servicio. Número `CAM-0001`, correlativo por empresa (D-007). |
| **Cambio estándar** | Cambio repetitivo y de riesgo bajo que ya fue aprobado una vez como plantilla. Ej.: instalar el parche mensual de Windows, reemplazar la laptop de un empleado. |
| **Cambio normal** | Cambio que no es estándar ni urgente y necesita aprobación antes de ejecutarse. Ej.: cambiar el router principal. |
| **Cambio urgente** | Cambio que no puede esperar al ciclo normal porque un servicio está caído o hay una falla de seguridad grave. Ej.: instalar el parche de una vulnerabilidad que ya se explota. |
| **Plantilla estándar** | Receta aprobada para un cambio estándar: pasos, reversa, criterio de éxito y elementos típicos. |
| **Impacto** | Cuánta gente o cuánto servicio se afecta si el cambio sale mal: Bajo (una persona o un equipo), Medio (un área o un servicio secundario), Alto (toda la empresa o un servicio crítico). |
| **Probabilidad de falla** | Qué tan probable es que algo salga mal: Baja, Media o Alta. |
| **Riesgo** | Resultado de cruzar impacto y probabilidad: Bajo, Medio o Alto (tabla en RN-CAM-006). |
| **Plan de reversa** | Pasos para dejar todo como estaba si el cambio falla. |
| **Ventana de mantenimiento** | Franja de tiempo en que la empresa acepta hacer cambios. Ej.: sábados de 22:00 a 02:00. |
| **Congelamiento** | Fechas en que no se hacen cambios. Ej.: cierre contable, del 28 al 31. |
| **Elemento afectado** | Elemento de configuración (EC) de la CMDB que el cambio toca. |
| **Revisión posterior** | Revisión corta tras ejecutar: ¿se logró?, ¿qué falló?, ¿qué se aprende? |
| **Resultado** | Cómo terminó la ejecución: Exitoso, Exitoso con observaciones, Revertido o Fallido. |
| **Solicitante / Aprobador / Responsable de implementación** | Usuario que pide / Usuario que autoriza / Usuario que ejecuta. "Solicitante" aquí es quien pide el cambio, no el rol "Solicitante" del núcleo. |

## 3. Roles y permisos

Alcance por defecto "todo"; "propio" = cambios que la persona solicitó o debe implementar. Permisos sensibles separados (D-004).

| Acción | Permiso | Admin. | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver cambios completos | `cambios.ver` | Todo | Todo | Todo | No | No | Todo |
| Ver calendario (resumen: número, título, fecha, estado, si afecta servicio) | `cambios.ver_calendario` | Sí | Sí | Sí | Sí | Sí | Sí |
| Solicitar cambio normal o urgente | `cambios.solicitar` | Sí | Sí | Sí | No | No | No |
| Solicitar cambio estándar desde plantilla | `cambios.solicitar_estandar` | Sí | Sí | Sí | No | No | No |
| Editar un cambio (en Borrador o Rechazado) | `cambios.editar` | Propio | Propio | Propio | No | No | No |
| Aprobar o rechazar cambio normal de riesgo Bajo o Medio, y plantillas | `cambios.aprobar` | Sí | Sí | No | No | No | No |
| Aprobar o rechazar cambio de riesgo Alto o urgente | `cambios.aprobar_alto` | Sí | Sí | No | No | No | No |
| Iniciar y registrar resultado de la implementación | `cambios.implementar` | Sí | No | Propio | No | No | No |
| Cerrar con revisión posterior | `cambios.cerrar` | Sí | Sí | No | No | No | No |
| Cancelar un cambio | `cambios.cancelar` | Todo | Todo | Propio | No | No | No |
| Crear y editar plantillas estándar | `cambios.gestionar_plantillas` | Sí | Sí | Sí | No | No | No |
| Gestionar ventanas y congelamientos | `cambios.gestionar_ventanas` | Sí | Sí | No | No | No | No |
| Configurar el módulo (excepción de separación, plazos) | `cambios.configurar` | Sí | No | No | No | No | No |
| Exportar a Excel | `cambios.exportar` | Sí | No | No | No | No | No |

Notas: (1) Todo permiso se comprueba en el servidor. (2) Aprobar, solicitar e implementar son permisos distintos; las reglas de separación (RN-CAM-001 a 004) valen aunque el rol los tenga todos, incluido el Administrador. (3) Todo rol nuevo parte sin permisos (D-004). (4) Un aprobador que no ve algún elemento afectado por falta de `cmdb.ver` no puede aprobar [SUPUESTO]: se le pide ese permiso.

## 4. Requisitos

### 4.1 Funcionales

| ID | Requisito |
|---|---|
| RF-CAM-001 | Una persona con permiso crea una solicitud de cambio con: título, motivo, tipo, elementos afectados, impacto, probabilidad, fecha y hora de inicio y fin planificadas, plan de implementación, plan de reversa, criterio de éxito y responsable de implementación. |
| RF-CAM-002 | El sistema calcula el riesgo a partir de impacto y probabilidad y lo muestra con texto (no solo color). |
| RF-CAM-003 | El sistema sugiere el impacto usando la CMDB: toma la criticidad más alta entre los elementos afectados directos e indirectos y el número de personas alcanzadas. |
| RF-CAM-004 | Un cambio estándar se crea eligiendo una plantilla vigente; hereda plan, reversa y criterio de éxito, que no se pueden modificar en el cambio. |
| RF-CAM-005 | Una plantilla estándar la crea un usuario con permiso y la aprueba otro usuario con `cambios.aprobar`; solo plantillas Vigentes se pueden usar. |
| RF-CAM-006 | El aprobador ve, en una sola pantalla: el cambio, el riesgo, los elementos afectados con su impacto, los cambios que chocan en el calendario y los incidentes vinculados. |
| RF-CAM-007 | El aprobador aprueba o rechaza; el rechazo exige motivo. Se guarda quién, cuándo, el riesgo y el comentario. |
| RF-CAM-008 | Un cambio rechazado puede corregirse y volver a pedirse aprobación; cada rechazo queda en el historial. |
| RF-CAM-009 | El calendario muestra por mes, semana y día los cambios Aprobados y En implementación, las ventanas permitidas y los congelamientos. |
| RF-CAM-010 | El sistema avisa de conflictos: dos cambios programados que se solapan y comparten un elemento afectado. |
| RF-CAM-011 | El sistema impide programar un cambio normal o estándar dentro de un congelamiento, y avisa si queda fuera de toda ventana permitida (cuando la empresa tiene ventanas). |
| RF-CAM-012 | El responsable de implementación inicia el cambio y luego registra resultado, hora real de inicio y fin, y notas. |
| RF-CAM-013 | Si el resultado es Revertido o Fallido, el cambio exige notas de qué pasó y de cómo quedó el servicio. |
| RF-CAM-014 | La revisión posterior tiene cuatro preguntas: ¿se logró el objetivo?, ¿qué salió bien?, ¿qué salió mal?, ¿qué se hará distinto? Es obligatoria para cambios urgentes, de riesgo Alto, y con resultado Revertido o Fallido. |
| RF-CAM-015 | Un cambio se vincula con incidentes (como origen o como causado por el cambio) y con problemas. |
| RF-CAM-016 | La ficha de un elemento de la CMDB lista los cambios que lo afectaron. |
| RF-CAM-017 | Comentarios en cada cambio, que solo se agregan, no se editan. |
| RF-CAM-018 | Listas con buscador, filtros (tipo, estado, riesgo, solicitante, fecha, elemento) y exportación (D-021). |
| RF-CAM-019 | Pantalla "Por aprobar" con los cambios pendientes que la persona puede aprobar, ordenados por fecha de inicio. |
| RF-CAM-020 | Cambios vencidos (Aprobados cuya fecha de fin ya pasó sin iniciarse) se marcan "Vencido". |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-CAM-001 | Quien solicitó o editó por última vez el contenido de un cambio no puede aprobarlo ni rechazarlo. Vale para todos los roles, incluido el Administrador (como D-015). |
| RN-CAM-002 | En cambios de riesgo Alto, el aprobador tampoco puede ser el responsable de implementación. [SUPUESTO] |
| RN-CAM-003 | Nadie puede aprobar una plantilla que creó o editó. |
| RN-CAM-004 | **Excepción para empresas con una sola persona de TI.** Desactivada por defecto. Solo el Administrador la activa (`cambios.configurar`). Mientras esté activa, se muestra un aviso visible en cada cambio donde se use y cada uso queda en la auditoría con quién, cuándo y qué cambio. Es independiente de la excepción de compras. [SUPUESTO] |
| RN-CAM-005 | Tipos y aprobación: **Estándar** nace Aprobado desde una plantilla vigente (sin aprobador individual); **Normal** exige un aprobador; **Urgente** exige un aprobador con `cambios.aprobar_alto`. |
| RN-CAM-006 | Riesgo = impacto × probabilidad. Impacto Bajo: Bajo, Bajo, Medio (probabilidad Baja, Media, Alta). Impacto Medio: Bajo, Medio, Alto. Impacto Alto: Medio, Alto, Alto. |
| RN-CAM-007 | Un cambio normal de riesgo Bajo o Medio lo aprueba `cambios.aprobar`. De riesgo Alto, `cambios.aprobar_alto`. Un solo nivel de aprobación (D-023). |
| RN-CAM-008 | El impacto sugerido por la CMDB se puede subir libremente. Bajarlo por debajo de lo sugerido exige un motivo escrito, que el aprobador ve. |
| RN-CAM-009 | Plan de implementación, plan de reversa y criterio de éxito son obligatorios en normal y urgente. En estándar vienen de la plantilla. |
| RN-CAM-010 | Debe haber al menos un elemento afectado. Si el cambio no toca nada registrado, se indica "Otro elemento no registrado" con descripción y el sistema avisa a Jefatura TI en el resumen semanal de calidad. |
| RN-CAM-011 | Editar fecha, planes, tipo, riesgo o elementos afectados de un cambio Aprobado lo devuelve a Pendiente de aprobación y anula la aprobación anterior (análogo a D-013.5). En un cambio estándar solo la fecha y los elementos afectados se pueden modificar sin volver a aprobar, mientras sigan dentro del alcance de la plantilla. |
| RN-CAM-012 | Un cambio no se puede iniciar antes de su inicio planificado ni después de su fin planificado; fuera de ese rango se reprograma. Un cambio urgente aprobado se puede iniciar de inmediato. |
| RN-CAM-013 | Congelamiento: bloquea cambios estándar y normales. Un cambio urgente se permite con aviso "dentro de congelamiento" visible al aprobador. |
| RN-CAM-014 | Si la empresa no tiene ventanas definidas, no hay restricción. Si las tiene y el cambio queda fuera, se avisa y el aprobador decide con motivo registrado. |
| RN-CAM-015 | Cancelar es posible antes de iniciar la implementación, con motivo. Después de iniciada, el cambio termina con resultado Revertido o Fallido, nunca cancelado. |
| RN-CAM-016 | El resultado "Exitoso con observaciones" exige anotar la observación. |
| RN-CAM-017 | La revisión posterior debe completarse en 7 días corridos desde "Implementado" [SUPUESTO]. No bloquea nada; solo genera avisos. |
| RN-CAM-018 | Un cambio estándar con resultado Fallido o Revertido deja su plantilla en estado Suspendida hasta que otro usuario con `cambios.aprobar` la reapruebe. [SUPUESTO] |
| RN-CAM-019 | Un Cerrado o Cancelado no se reabre. Si hace falta repetirlo, se crea uno nuevo con referencia al anterior en las notas. |
| RN-CAM-020 | Un cambio no se borra (D-019). Un borrador que nunca se envió puede borrarse por su creador. |
| RN-CAM-021 | Todo cambio de estado guarda quién, cuándo y motivo (obligatorio en rechazo, cancelación y reversa). |
| RN-CAM-022 | Un elemento Retirado no puede agregarse como afectado a un cambio nuevo. |
| RN-CAM-023 | Las fechas y horas se muestran en la zona horaria de la empresa; se guardan en hora universal (D-021.4). |

### 4.3 De calidad medible

| ID | Requisito |
|---|---|
| RNF-CAM-001 | La lista de cambios carga en 2 segundos o menos con 10.000 cambios por empresa. |
| RNF-CAM-002 | El calendario mensual carga en 3 segundos o menos con 500 cambios en el mes. |
| RNF-CAM-003 | El cálculo de impacto sugerido al guardar tarda 3 segundos o menos con hasta 20 elementos afectados. |
| RNF-CAM-004 | Las reglas de separación de funciones se comprueban en el servidor; una prueba automática intenta cada violación por la API y todas se rechazan. |
| RNF-CAM-005 | Ninguna consulta devuelve cambios de otra empresa; prueba de aislamiento por tabla (D-025). |
| RNF-CAM-006 | El aviso al aprobador sale en 1 minuto o menos desde que el cambio pasa a Pendiente. |
| RNF-CAM-007 | El 100 % de transiciones, aprobaciones, usos de excepción y exportaciones queda en la auditoría (D-018). |
| RNF-CAM-008 | La pantalla de aprobación y el calendario son utilizables en celular, porque el aprobador urgente suele estar fuera de la oficina (D-021.1). |

## 5. Estados y transiciones

**Estados del cambio:** Borrador, Pendiente de aprobación, Rechazado, Aprobado, En implementación, Implementado, Cerrado, Cancelado. "Vencido" es una marca, no un estado.

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Borrador | `cambios.solicitar` | Datos mínimos: título, tipo |
| (nuevo, estándar) | Aprobado | Sistema, al crear con `cambios.solicitar_estandar` | Plantilla Vigente; fuera de congelamiento; RN-CAM-005 |
| Borrador | Pendiente de aprobación | Quien lo creó | Campos obligatorios completos (RN-CAM-009, 010); RF-CAM-011 |
| Borrador | Cancelado | Quien lo creó o `cambios.cancelar` | Motivo |
| Pendiente de aprobación | Aprobado | Aprobador según RN-CAM-007 | RN-CAM-001, 002, 013, 014 |
| Pendiente de aprobación | Rechazado | Aprobador según RN-CAM-007 | Motivo obligatorio; RN-CAM-001 |
| Pendiente de aprobación | Borrador | Quien lo creó | Retira la solicitud; queda en auditoría |
| Rechazado | Pendiente de aprobación | Quien lo creó | Con comentario de respuesta; conserva historial del rechazo |
| Rechazado | Cancelado | Quien lo creó o `cambios.cancelar` | Motivo |
| Aprobado | Pendiente de aprobación | Sistema | RN-CAM-011 |
| Aprobado | En implementación | Responsable (`cambios.implementar`) | RN-CAM-012 |
| Aprobado | Cancelado | `cambios.cancelar` | Motivo; RN-CAM-015 |
| En implementación | Implementado | Responsable (`cambios.implementar`) | Resultado, horas reales y notas (RF-CAM-012, 013) |
| Implementado | Cerrado | `cambios.cerrar` | Revisión posterior si es obligatoria (RF-CAM-014); si no, comentario de cierre |

No se permite ninguna otra transición. Cerrado y Cancelado son finales. Si se registró mal el resultado, `cambios.cerrar` puede corregirlo mientras el cambio está Implementado, con motivo y con el valor anterior en el historial.

**Plantilla estándar:** Borrador, Vigente, Suspendida, Retirada. Borrador a Vigente: otro usuario con `cambios.aprobar`. Vigente a Suspendida: Sistema (RN-CAM-018) o `cambios.aprobar`. Suspendida a Vigente: otro usuario con `cambios.aprobar`. Vigente o Suspendida a Retirada: `cambios.gestionar_plantillas`, con motivo; los cambios ya creados no se afectan. Editar una plantilla Vigente la devuelve a Borrador.

## 6. Datos

**Cambio:** empresa; número `CAM-0001` (único por empresa, no se reutiliza); título; motivo; tipo; plantilla (si es estándar); solicitante; responsable de implementación (Usuario); ejecutor externo (Proveedor del catálogo, opcional); impacto; impacto sugerido; motivo de impacto reducido; probabilidad; riesgo; ¿afecta el servicio? (sí/no) y minutos estimados de interrupción; inicio y fin planificados; inicio y fin reales; plan de implementación; plan de reversa; criterio de éxito; estado; resultado y notas; motivo de rechazo, de cancelación o de urgencia (obligatorio si es urgente); revisión posterior (cuatro respuestas, quién y cuándo).

**Elemento afectado del cambio:** empresa, cambio, EC (o "otro elemento no registrado" con texto), si el vínculo es directo. Los indirectos se calculan, no se guardan.

**Aprobación:** empresa, cambio, decisión (aprobó, rechazó), quién, cuándo, riesgo en ese momento, comentario, si usó la excepción RN-CAM-004. Una fila por decisión; no se edita.

**Plantilla estándar:** empresa, nombre (único por empresa), descripción, plan, reversa, criterio de éxito, tipos de EC a los que aplica, estado, quién la creó y aprobó, fecha de aprobación.

**Ventana:** empresa, nombre, clase (Permitida o Congelamiento), días de la semana o fechas, hora de inicio y fin (hora de la empresa), vigente desde y hasta, activa (sí/no). No se borra, se desactiva.

**Comentario:** empresa, cambio, autor, fecha, texto. Solo se agrega.

**Vínculos** con incidentes (rol: origen o causado por el cambio) y con problemas; los gestiona este módulo (sección 9).

Claves y unicidad: (empresa, número); (empresa, nombre de plantilla); una decisión por aprobación; un cambio no repite el mismo EC.

**Qué se audita:** todo lo anterior, con antes y después en cambios de campos; aprobaciones y rechazos; uso de la excepción; cambios de estado de plantillas; edición de ventanas; exportaciones; correcciones de resultado.

## 7. Pantallas necesarias

| # | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| 1 | Lista de cambios | Buscar, filtrar y exportar. | Técnico |
| 2 | Nuevo cambio / editar | Formulario por secciones: qué, riesgo, cuándo, planes, elementos afectados. Muestra impacto sugerido. | Técnico |
| 3 | Ficha del cambio | Estado, línea de tiempo, comentarios, vínculos, aprobación, resultado y revisión posterior. | Todos |
| 4 | Por aprobar | Bandeja con filtros por riesgo y fecha. Es la pantalla de inicio de Jefatura (D-021.6). | Jefatura TI |
| 5 | Decisión de aprobación | Resumen de riesgo, elementos afectados, conflictos de calendario; botones Aprobar y Rechazar con motivo. | Jefatura TI |
| 6 | Calendario | Mes, semana y día con cambios, ventanas y congelamientos. | Todos |
| 7 | Mi trabajo de cambios | Cambios que debo implementar, con botón Iniciar y Registrar resultado. | Técnico |
| 8 | Revisión posterior | Cuatro preguntas y cierre. | Jefatura TI |
| 9 | Plantillas estándar | Crear, aprobar, suspender, retirar. | Jefatura TI |
| 10 | Ventanas y congelamientos | Alta y desactivación. | Jefatura TI |
| 11 | Configuración de cambios | Excepción de separación, plazos de aviso, días de revisión. | Administrador |

## 8. Notificaciones y automatismos

| Cuándo | A quién | Qué dice |
|---|---|---|
| Cambio pasa a Pendiente de aprobación | Usuarios con el permiso de aprobar que corresponda al riesgo, excepto el solicitante | "Marta Quispe pide aprobar el cambio CAM-0012 'Cambio del router principal'. Riesgo Medio. Sábado 22:00." |
| Cambio urgente pasa a Pendiente | Usuarios con `cambios.aprobar_alto` | "URGENTE: CAM-0013 'Parche de seguridad del servidor de archivos'. Se necesita decisión hoy." Recordatorio a los 30 minutos si sigue pendiente. |
| Cambio normal Pendiente sin decisión por 48 horas | Aprobadores | "El cambio CAM-0012 espera su decisión desde hace 2 días." |
| Aprobado o Rechazado | Solicitante y responsable de implementación | "Su cambio CAM-0012 fue aprobado por Carlos Díaz." o "...fue rechazado. Motivo: no hay plan de reversa claro." |
| Un cambio Aprobado vuelve a Pendiente (RN-CAM-011) | Solicitante y aprobador anterior | "El cambio CAM-0012 cambió de fecha y necesita una nueva aprobación." |
| 24 horas antes del inicio de un cambio Aprobado | Responsable de implementación, solicitante y responsables de los EC afectados (Usuarios o Personas con correo) | "Mañana a las 22:00 se hará el cambio CAM-0012. Se verá afectado: Wi-Fi oficinas, unos 35 equipos." |
| Se inicia un cambio urgente o de riesgo Alto | Jefatura TI | "Se inició CAM-0013." |
| Resultado Revertido o Fallido | Jefatura TI y solicitante | "El cambio CAM-0012 terminó Revertido. Revise el servicio y complete la revisión posterior." |
| Cambio Vencido (RF-CAM-020) | Solicitante y responsable | "El cambio CAM-0012 no se ejecutó en su fecha. Reprográmelo o cancélelo." |
| Revisión posterior pendiente: día 3 y día 7 | Quien tiene `cambios.cerrar` y el solicitante | "El cambio CAM-0012 está esperando su revisión posterior." |
| Plantilla Suspendida | Usuarios con `cambios.aprobar` | "La plantilla 'Parche mensual de Windows' se suspendió porque el último cambio falló." |
| Uso de la excepción RN-CAM-004 | Administradores | "Se aprobó CAM-0014 sin segunda persona (excepción activada)." |

Automatismos: la marca "Vencido"; el paso de Aprobado a Pendiente por edición; la creación directa como Aprobado de los cambios estándar; el cálculo de riesgo e impacto sugerido; la detección de conflictos de calendario; la suspensión de plantillas. Los avisos usan el motor del módulo `notificaciones`.

## 9. Integración con el núcleo y con otros módulos

| Con | Qué se intercambia | Dueño del dato |
|---|---|---|
| Núcleo | Usuarios, roles, permisos, empresa activa, auditoría, contadores por empresa, zona horaria. | Núcleo |
| `cmdb-ligera` | Elegir EC afectados; recibir impacto directo e indirecto, criticidad máxima y número de personas; la ficha del EC lista cambios. | CMDB (impacto), Cambios (vínculo) |
| `mesa-de-ayuda` | Vínculo incidente-cambio (origen o causado por). La ficha del incidente lo muestra en solo lectura. Un incidente puede ofrecer "Crear cambio urgente" con datos precargados. | Cambios (vínculo), Mesa (incidente) |
| `gestion-problemas` | Un problema se resuelve con uno o más cambios; el cambio muestra los problemas que resuelve. Un cambio Cerrado con resultado Exitoso permite resolver el problema. | Problemas (vínculo) |
| `garantias-mantenimiento` | Un mantenimiento planificado puede ofrecer "Crear cambio estándar" con el activo y la fecha precargados. Las ventanas se pueden consultar. | Garantías (mantenimiento), Cambios (ventanas) |
| `proveedores-contratos` | El ejecutor externo se elige del catálogo de proveedores. | Proveedores |
| `notificaciones` | Entrega de los avisos de la sección 8. | Notificaciones |
| `reportes-tableros` | Expone: cambios por tipo y resultado, tasa de éxito, cambios urgentes por mes, revisiones posteriores vencidas. | Cambios |
| `presupuesto-costos` | Sin integración en la v1 (el cambio no lleva costo). | n/a |

## 10. Criterios de aceptación

**CA-CAM-01 · Cambio normal de principio a fin.** Dado un Técnico con `cambios.solicitar` y un Jefatura TI con `cambios.aprobar`, cuando el Técnico completa un cambio de riesgo Medio y lo envía, Jefatura lo aprueba, el Técnico lo inicia dentro de su horario, registra "Exitoso" y Jefatura lo cierra, entonces el cambio recorre Borrador, Pendiente, Aprobado, En implementación, Implementado y Cerrado, con cada paso en la línea de tiempo y la auditoría.

**CA-CAM-02 · Quien pide no aprueba.** Dado un usuario Administrador que solicitó el cambio CAM-0020, cuando intenta aprobarlo por pantalla o por el servidor, entonces el servidor lo rechaza con "No puede aprobar un cambio que usted solicitó" y el cambio sigue Pendiente.

**CA-CAM-03 · Permiso denegado por riesgo.** Dado un cambio de riesgo Alto y un usuario con `cambios.aprobar` pero sin `cambios.aprobar_alto`, cuando intenta aprobarlo, entonces el servidor lo rechaza con "No tiene permiso para aprobar cambios de riesgo Alto" y queda registrado el intento.

**CA-CAM-04 · Aislamiento entre empresas.** Dado un Jefatura TI de la Empresa B, cuando abre la dirección del cambio CAM-0001 de la Empresa A o intenta agregarle un comentario, entonces recibe "no encontrado" igual que para un cambio inexistente; y al vincular un EC de otra empresa a su cambio recibe "no encontrado".

**CA-CAM-05 · Estándar desde plantilla.** Dado una plantilla Vigente "Reemplazo de laptop", cuando un Técnico crea un cambio estándar con ella, entonces nace en estado Aprobado sin pedir aprobador, con el plan y la reversa heredados que no puede editar.

**CA-CAM-06 · Congelamiento.** Dado un congelamiento del 28 al 31 de octubre, cuando un Técnico intenta enviar un cambio normal para el 29, entonces el sistema lo impide con "Esa fecha está en congelamiento"; para un cambio urgente lo permite y el aprobador ve el aviso.

**CA-CAM-07 · Editar lo aprobado.** Dado un cambio Aprobado, cuando su solicitante cambia la fecha de inicio, entonces vuelve a Pendiente de aprobación, la aprobación anterior queda anulada pero visible en el historial y se avisa al aprobador.

**CA-CAM-08 · Impacto sugerido.** Dado un cambio que afecta el servidor del que depende el servicio "Correo corporativo" (criticidad Alta), cuando el Técnico guarda, entonces el impacto sugerido es Alto; si lo baja a Medio sin motivo, el sistema no lo deja guardar.

**CA-CAM-09 · Revisión posterior obligatoria.** Dado un cambio urgente en Implementado, cuando Jefatura intenta cerrarlo sin completar las cuatro preguntas, entonces el sistema lo impide; con las cuatro completas lo cierra.

**CA-CAM-10 · Reversa.** Dado un cambio En implementación, cuando el Técnico registra "Revertido" sin notas, entonces el sistema pide explicar qué pasó; con notas pasa a Implementado y avisa a Jefatura.

**CA-CAM-11 · Plantilla suspendida.** Dado un cambio estándar con resultado Fallido, cuando se registra, entonces su plantilla pasa a Suspendida y ya no aparece al crear cambios estándar hasta que otro usuario con `cambios.aprobar` la reapruebe.

**CA-CAM-12 · Excepción de una persona.** Dado que el Administrador activó la excepción y es el único con permisos, cuando aprueba su propio cambio normal, entonces se permite, se muestra el aviso en el cambio y la auditoría registra el uso; con la excepción desactivada se rechaza.

**CA-CAM-13 · Rechazo con motivo.** Dado un cambio Pendiente, cuando el aprobador pulsa Rechazar sin motivo, entonces el sistema no lo permite; con motivo el cambio pasa a Rechazado y el solicitante recibe el aviso con el motivo.

## 11. Casos límite

1. Dos aprobadores deciden a la vez sobre el mismo cambio: el segundo recibe "este cambio ya fue decidido" y ve la decisión del primero.
2. El solicitante pierde su rol de aprobador o es dado de baja con un cambio Pendiente: el cambio sigue; si es la única persona que podía aprobar, el aviso va al Administrador.
3. El responsable de implementación es dado de baja con un cambio Aprobado: se debe asignar otro y, por RN-CAM-011, no cambia la aprobación (cambiar de responsable no es un campo de aprobación).
4. Un cambio cruza la medianoche o un cambio de horario por zona horaria: se evalúa con la zona de la empresa.
5. La única persona de TI pide un cambio urgente a las 3:00 sin excepción activada: no puede aprobarlo; debe haber un segundo usuario con `cambios.aprobar_alto` o el Administrador activa la excepción de antemano. Por eso el sistema recomienda al activar la empresa tener dos aprobadores.
6. Cambio que afecta un EC que se retira antes de ejecutarse: el cambio muestra aviso "elemento retirado" y el responsable decide si lo cancela.
7. Un incidente vinculado a un cambio que luego se cancela: el vínculo se conserva.
8. Una ventana definida en dos zonas horarias distintas: cada empresa tiene una sola zona horaria; no aplica.
9. Plantilla retirada con cambios Aprobados pendientes: esos cambios siguen su curso.
10. Más de 20 elementos afectados: se permite, el impacto se calcula igual y se avisa si tarda.

## 12. Decisiones propuestas y supuestos

| # | Tipo | Propuesta | Motivo |
|---|---|---|---|
| 1 | [SUPUESTO] | Un solo nivel de aprobación; el riesgo Alto exige un permiso distinto (`cambios.aprobar_alto`). | Coherente con D-023; más control sin comité. |
| 2 | [SUPUESTO] | La excepción de una persona de TI es propia de cambios, apagada por defecto, como D-015. | Mismo patrón ya decidido; no frena a empresas pequeñas. |
| 3 | [SUPUESTO] | Los urgentes también requieren aprobación previa (rápida). | Un urgente sin aprobación es el camino para saltarse el control. |
| 4 | [SUPUESTO] | Los estándar nacen Aprobados; la plantilla se aprueba una vez y se suspende si falla un cambio. | Ahorra aprobaciones repetitivas sin perder control. |
| 5 | [SUPUESTO] | Quien aprueba un riesgo Alto no es el implementador (RN-CAM-002). | Separación de funciones sin burocracia. |
| 6 | [SUPUESTO] | Revisión posterior en 7 días y solo con avisos. | Evita bloquear la operación. |
| 7 | [SUPUESTO] | Aviso de 24 horas antes y recordatorio a los 30 min en urgentes. | Valores de partida, ajustables en configuración. |
| 8 | [SUPUESTO] | Tabla de riesgo de 3 por 3 (RN-CAM-006). | Lo más simple de explicar. |
| 9 | [SUPUESTO] | Sin costo del cambio. | Evita acoplar con presupuesto sin datos reales. |
| 10 | [SUPUESTO] | Los vínculos con incidentes y problemas viven en este módulo y en `gestion-problemas`, no en la mesa de ayuda. | Cada módulo es dueño de lo que crea; pendiente de confirmar con `mesa-de-ayuda`. |
| 11 | [SUPUESTO] | Fase posterior a la Etapa 4, después de la CMDB. | Necesita el cálculo de impacto. |

**[ESCALAR AL CEO]:** ninguno. No mueve dinero ni crea costos externos; los avisos usan el servicio de correo ya escalado en `decisiones.md`.

## 13. Fuera de alcance

- Comité de cambios con reuniones, votación o varios niveles de aprobación (D-023).
- Costo, presupuesto o aprobación por monto de un cambio.
- Ejecución automática de pasos o scripts; despliegue continuo.
- Aviso a usuarios finales por canales distintos al correo.
- Cambios recurrentes automáticos (programar el mismo cambio cada mes).
- Reapertura de cambios cerrados.
- Archivos adjuntos (D-022).
- Indicadores avanzados (tasa de éxito por equipo, tiempo medio); los básicos van a `reportes-tableros`.
