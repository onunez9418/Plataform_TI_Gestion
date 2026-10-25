# Módulo: Gestión de cambios (`gestion-cambios`, sigla CAM)

**Versión:** 0.3 (aplica D-065 a D-076; sobre la v0.2 de la revisión cruzada; escuadrón E)
**Cuándo se construye:** Fase 3, ola E, después de `cmdb-ligera` y antes de `gestion-problemas`. No entra a la v1 (D-056).
**Se apoya en:** `docs/equipo/decisiones.md` (D-001 a D-064), `docs/equipo/plan-correcciones.md` y el núcleo `docs/documento-funcional.md`.
**Marcas:** [SUPUESTO] = decisión propuesta por el analista; el resultado de cada uno está en la sección 12. [ESCALAR AL CEO] = solo dinero, tema legal o algo irreversible.

---

## 1. Propósito, alcance y fase

**Propósito.** Que ningún cambio en la tecnología de la empresa (actualizar un servidor, cambiar el router, migrar el correo) se haga "porque sí". Cada cambio tiene quién lo pide, qué riesgo tiene, quién lo autoriza, cuándo se hace, cómo se vuelve atrás si sale mal y qué se aprendió. Versión ligera: tres tipos, un solo nivel de aprobación y pocos campos.

**Ejemplo.** Marta (Técnico) pide cambiar el router principal el sábado a las 22:00 e indica que afecta al servicio "Wi-Fi oficinas". El sistema calcula riesgo Medio (la CMDB dice que 35 laptops dependen de ese Wi-Fi). Carlos (Jefatura TI) lo aprueba, Marta lo ejecuta, anota que salió bien y lo cierra.

**Entra en este módulo**
1. Solicitud de cambio de tres tipos: **Estándar**, **Normal** y **Urgente**.
2. Evaluación de impacto y probabilidad de falla, con riesgo calculado y sugerencia desde la CMDB.
3. Aprobación según tipo y riesgo, con la regla única de segunda persona (RN-017 del núcleo).
4. Plantillas de cambio estándar aprobadas de antemano.
5. Calendario con ventanas de mantenimiento y periodos de congelamiento.
6. Plan de implementación, plan de reversa y criterio de éxito obligatorios.
7. Estados, resultado, cierre y revisión posterior.
8. Vínculo con elementos de la CMDB, con casos (incidentes) de la mesa de ayuda y con problemas.

**No entra:** comités con reuniones y votos, aprobación en varios niveles (D-023), costos del cambio, ejecución automática de pasos. Ver sección 13.

**Cuándo.** Fase 3, ola E. Necesita `cmdb-ligera`; los vínculos con la mesa de ayuda y con problemas se activan cuando esos módulos existan.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Cambio** | Modificación planificada de algo de TI que podría afectar a las personas o a un servicio. Número `CAM-000001`, por empresa (D-007, D-049). |
| **Pedido por** | Usuario que pide el cambio (D-049.6). "Solicitante" queda solo como nombre de rol del núcleo. |
| **Cambio estándar** | Repetitivo y de riesgo bajo; ya aprobado una vez como plantilla. Ej.: parche mensual de Windows, reemplazo de la laptop de un empleado. |
| **Cambio normal** | Ni estándar ni urgente; se aprueba antes de ejecutarse. Ej.: cambiar el router principal. |
| **Cambio urgente** | No puede esperar: un servicio está caído o hay una falla de seguridad grave. Ej.: parche de una vulnerabilidad que ya se explota. |
| **Plantilla estándar** | Receta aprobada: pasos, reversa, criterio de éxito. Estados: Borrador, Vigente, Suspendida, Desactivada. |
| **Impacto / Probabilidad / Riesgo** | Impacto: Bajo (una persona o equipo), Medio (un área o servicio secundario), Alto (toda la empresa o servicio crítico). Probabilidad de falla: Baja, Media, Alta. Riesgo: Bajo, Medio o Alto (tabla en RN-CAM-006). |
| **Plan de reversa** | Pasos para dejar todo como estaba si falla. |
| **Ventana de mantenimiento** | Franja en que la empresa acepta cambios. Ej.: sábados de 22:00 a 02:00. |
| **Congelamiento** | Fechas sin cambios. Ej.: cierre contable, del 28 al 31. |
| **Revisión posterior** | Cuatro preguntas tras ejecutar: ¿se logró?, ¿qué salió bien?, ¿qué mal?, ¿qué se hará distinto? |
| **Resultado** | Exitoso, Exitoso con observaciones, Revertido o Fallido. |
| **Creador o editor** | Quien creó el cambio o editó su contenido (fecha, planes, tipo, riesgo, elementos) desde la última aprobación. Definición única (D-043.1). |

## 3. Roles y permisos

Nombres y valores según `docs/registro-permisos.md` (D-036); este módulo no cambia celdas del núcleo (D-037). Alcance "todo" salvo nota; "propio" = cambios que la persona pidió. **Empleado (portal): no aplica.**

| Acción | Permiso | PS | Admin. | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|---|
| Ver cambios completos | `cambios.ver` | PS-167 | Todo | Todo | Todo | No | No | Todo |
| Ver el calendario (quien no tiene `cambios.ver` ve "Cambio programado", fecha, estado y si afecta servicio) | `cambios.ver_calendario` | PS-168 | Sí | Sí | Sí | Sí | Sí | Sí |
| Pedir cambio normal o urgente | `cambios.pedir` | PS-169 | Sí | Sí | Sí | No | No | No |
| Pedir cambio estándar desde plantilla | `cambios.pedir_estandar` | PS-170 | Sí | No | Sí | No | No | No |
| Editar (en Borrador o Rechazado) | `cambios.editar` | PS-171 | Todo | Propio | Propio | No | No | No |
| Aprobar o rechazar riesgo Bajo o Medio, y reaprobar plantillas | `cambios.aprobar` | PS-172 | Sí | Sí | No | No | No | No |
| Aprobar o rechazar riesgo Alto y urgentes | `cambios.aprobar_alto` | PS-173 | Sí | Sí | No | No | No | No |
| Iniciar y registrar el resultado | `cambios.implementar` | PS-174 | Sí | No | Sí | No | No | No |
| Cerrar con revisión posterior (no lo cierra quien lo implementó, salvo la casilla «cambios») | `cambios.cerrar` | PS-175 | Sí | Sí | Sí | No | No | No |
| Cancelar | `cambios.cancelar` | PS-176 | Todo | Propio | Propio | No | No | No |
| Crear y editar plantillas | `cambios.gestionar_plantillas` | PS-177 | Sí | No | No | No | No | No |
| Gestionar ventanas y congelamientos | `cambios.gestionar_ventanas` | PS-178 | Sí | No | No | No | No | No |
| Configurar plazos de aviso del módulo | `cambios.configurar` | PS-179 | Sí | No | No | No | No | No |
| Redactar por seguridad un comentario (sensible) | `cambios.redactar` | PS-221 | Sí | No | No | No | No | No |
| Exportar a Excel | `datos.exportar` (sensible) | PS-20 | Sí | No | No | No | No | No |

Notas: (1) Todo se comprueba en el servidor. (2) Pedir, aprobar e implementar son permisos distintos; las reglas de segunda persona valen para todos los roles, incluido el Administrador. (3) Todo rol nuevo parte sin permisos. (4) Quien aprueba debe poder ver los elementos afectados (`cmdb.ver`). (5) `cambios.cerrar` lleva la condición "No": quien implementó no cierra el cambio, salvo la casilla «cambios»; el Gerente de TI debe confirmarlo.

## 4. Requisitos

Columnas: **Cuándo** (Fase 3 = ola E) y **CA** (criterio de la sección 10). Los ID retirados no se reutilizan.

### 4.1 Funcionales

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-CAM-001 | Crear una solicitud de cambio con título, motivo, tipo, elementos afectados, impacto, probabilidad, inicio y fin planificados, plan de implementación, plan de reversa, criterio de éxito y responsable de implementación. | Fase 3 | CA-CAM-01 |
| RF-CAM-002 | Calcular el riesgo desde impacto y probabilidad y mostrarlo con texto, no solo color. | Fase 3 | CA-CAM-01 |
| RF-CAM-003 | Sugerir el impacto con la CMDB: criticidad más alta entre elementos afectados directos e indirectos y número de personas alcanzadas. | Fase 3 | CA-CAM-08 |
| RF-CAM-004 | Crear un cambio estándar eligiendo una plantilla Vigente; hereda plan, reversa y criterio de éxito, que no se modifican. | Fase 3 | CA-CAM-05 |
| RF-CAM-005 | Una plantilla la crea un usuario con permiso y la aprueba otro con `cambios.aprobar`; solo las Vigentes se usan. | Fase 3 | CA-CAM-11 |
| RF-CAM-006 | El aprobador ve en una pantalla: el cambio, el riesgo, los elementos afectados, los choques de calendario y los casos vinculados. | Fase 3 | CA-CAM-01 |
| RF-CAM-007 | Aprobar o rechazar; el rechazo exige motivo. Se guarda quién, cuándo, el riesgo y el comentario. | Fase 3 | CA-CAM-13 |
| RF-CAM-008 | Un cambio Rechazado se corrige y vuelve a pedir aprobación; cada rechazo queda en el historial. | Fase 3 | CA-CAM-13 |
| RF-CAM-009 | Calendario por mes, semana y día con cambios Aprobados y En implementación, ventanas y congelamientos. | Fase 3 | CA-CAM-14 |
| RF-CAM-010 | Avisar de conflictos: dos cambios programados que se solapan y comparten un elemento. | Fase 3 | CA-CAM-14 |
| RF-CAM-011 | Impedir programar un cambio normal o estándar dentro de un congelamiento; avisar si queda fuera de toda ventana (cuando la empresa tiene ventanas). | Fase 3 | CA-CAM-06 |
| RF-CAM-012 | El responsable inicia el cambio y registra resultado, horas reales de inicio y fin, y notas. | Fase 3 | CA-CAM-01, CA-CAM-18 |
| RF-CAM-013 | Con resultado Revertido o Fallido se exigen notas de qué pasó y cómo quedó el servicio. | Fase 3 | CA-CAM-10 |
| RF-CAM-014 | Revisión posterior de cuatro preguntas, obligatoria en urgentes, riesgo Alto y resultado Revertido o Fallido. | Fase 3 | CA-CAM-09 |
| RF-CAM-015 | Vincular el cambio con casos de la mesa de ayuda (origen o causado por el cambio) y con problemas. | Fase 3 | CA-CAM-04 |
| RF-CAM-016 | La ficha de un elemento de la CMDB lista los cambios que lo afectaron. | Fase 3 | CA-CAM-08 |
| RF-CAM-017 | Comentarios que solo se agregan; se pueden redactar por seguridad. | Fase 3 | CA-CAM-19 |
| RF-CAM-018 | Listas con buscador, filtros (tipo, estado, riesgo, quién pide, fecha, elemento) y exportación por la puerta única (D-021, D-061.1). | Fase 3 | CA-CAM-03 |
| RF-CAM-019 | Pantalla "Por aprobar" con lo que la persona puede aprobar, por fecha de inicio. | Fase 3 | CA-CAM-01 |
| RF-CAM-020 | La marca "Vencido" (Aprobado cuyo fin pasó sin iniciarse) se calcula al leer con la fecha y zona de la empresa. | Fase 3 | CA-CAM-15 |

### 4.2 Reglas de negocio

| ID | Regla | Cuándo | CA |
|---|---|---|---|
| RN-CAM-001 | No aprueba ni rechaza un cambio quien lo creó o editó desde la última aprobación (definición única, D-043.1). Vale para todos los roles. | Fase 3 | CA-CAM-02 |
| RN-CAM-002 | En riesgo Alto, el aprobador tampoco es el responsable de implementación. | Fase 3 | CA-CAM-03 |
| RN-CAM-003 | Nadie reaprueba una plantilla que creó o editó (acto "Reaprobar plantilla estándar", RN-017 del núcleo). | Fase 3 | CA-CAM-11 |
| RN-CAM-004 | **Retirada** (excepción propia de cambios). Se usa la casilla «cambios» del interruptor único (RN-CAM-024). | n/a | n/a |
| RN-CAM-005 | Estándar nace Aprobado desde una plantilla Vigente; Normal exige un aprobador; Urgente exige un aprobador con `cambios.aprobar_alto`. Aprobar un cambio exige siempre a otra persona (tabla de actos, RN-017 del núcleo). | Fase 3 | CA-CAM-05 |
| RN-CAM-006 | Riesgo = impacto por probabilidad. Impacto Bajo: Bajo, Bajo, Medio (probabilidad Baja, Media, Alta). Impacto Medio: Bajo, Medio, Alto. Impacto Alto: Medio, Alto, Alto. | Fase 3 | CA-CAM-01 |
| RN-CAM-007 | Normal de riesgo Bajo o Medio: `cambios.aprobar`. Riesgo Alto: `cambios.aprobar_alto`. Un solo nivel (D-023). | Fase 3 | CA-CAM-03 |
| RN-CAM-008 | El impacto sugerido se puede subir. Bajarlo exige un motivo que el aprobador ve. | Fase 3 | CA-CAM-08 |
| RN-CAM-009 | Plan de implementación, de reversa y criterio de éxito son obligatorios en normal y urgente; en estándar vienen de la plantilla. | Fase 3 | CA-CAM-05 |
| RN-CAM-010 | Debe haber al menos un elemento afectado; si el cambio toca algo no registrado se indica "Otro elemento" con descripción y se avisa a Jefatura TI. | Fase 3 | CA-CAM-01 |
| RN-CAM-011 | Editar fecha, planes, tipo, riesgo o elementos de un cambio Aprobado lo devuelve a Pendiente y anula la aprobación (D-013.5, D-043.1). En estándar solo la fecha y los elementos dentro del alcance de la plantilla no obligan a reaprobar. | Fase 3 | CA-CAM-07 |
| RN-CAM-012 | Se inicia solo entre el inicio y el fin planificados (hora de la empresa); fuera de ese rango se reprograma. Un urgente aprobado se puede iniciar de inmediato. | Fase 3 | CA-CAM-18 |
| RN-CAM-013 | El congelamiento bloquea estándar y normal. Un urgente se permite con aviso visible al aprobador. | Fase 3 | CA-CAM-06 |
| RN-CAM-014 | Sin ventanas definidas no hay restricción; con ventanas y fuera de ellas se avisa y el aprobador decide con motivo. Una ventana puede excluir los feriados del calendario de empresa (D-062.4). | Fase 3 | CA-CAM-06 |
| RN-CAM-015 | Se cancela antes de iniciar, con motivo. Iniciado, termina con resultado Revertido o Fallido, nunca cancelado. | Fase 3 | CA-CAM-10 |
| RN-CAM-016 | "Exitoso con observaciones" exige anotar la observación. | Fase 3 | CA-CAM-09 |
| RN-CAM-017 | La revisión posterior se completa en 7 días corridos desde "Implementado"; solo genera avisos. | Fase 3 | CA-CAM-09 |
| RN-CAM-018 | Un estándar con resultado Fallido o Revertido deja su plantilla Suspendida, en la misma operación, hasta que otra persona con `cambios.aprobar` la reapruebe. | Fase 3 | CA-CAM-11 |
| RN-CAM-019 | Cerrado o Cancelado no se reabre; se crea uno nuevo y se anota el anterior. | Fase 3 | CA-CAM-13 |
| RN-CAM-020 | Un cambio no se borra (D-019); un borrador nunca enviado lo puede borrar quien lo creó. | Fase 3 | CA-CAM-13 |
| RN-CAM-021 | Todo cambio de estado guarda quién, cuándo y motivo (obligatorio en rechazo, cancelación y reversa). | Fase 3 | CA-CAM-01, CA-CAM-13 |
| RN-CAM-022 | Un elemento De baja no se agrega a un cambio nuevo. | Fase 3 | CA-CAM-04 |
| RN-CAM-023 | Fechas en la zona de la empresa; se guardan en hora universal (D-021.4). | Fase 3 | CA-CAM-15 |
| RN-CAM-024 | La casilla «cambios» del interruptor único (D-043.2) está apagada por defecto, vence a los 90 días y la activa un Administrador con reautenticación (y la confirma otro si hay dos). Encendida permite que quien creó o editó apruebe (RN-CAM-001, RN-CAM-002, RN-CAM-003); nunca exime del permiso. Cada uso muestra un aviso en el cambio y queda en la auditoría. | Fase 3 | CA-CAM-12, CA-CAM-17 |
| RN-CAM-025 | Un cambio solo se vincula con elementos, casos, problemas y proveedores de su empresa; la base lo impone con clave compuesta (D-039). | Fase 3 | CA-CAM-04 |
| RN-CAM-026 | En el calendario, el título se muestra solo a quien puede ver el cambio; los demás ven "Cambio programado" (D-063.5). | Fase 3 | CA-CAM-14 |
| RN-CAM-027 | La auditoría guarda "el campo X cambió" para motivos, planes, comentarios y notas (texto libre); las Personas solo por `PRS-NNNN`. El texto vive en el historial del módulo (D-030). | Fase 3 | CA-CAM-19 |
| RN-CAM-028 | Todo texto pasa por el validador común (rechaza claves privadas y patrones de claves) y advierte no escribir datos personales ni claves (D-063.2). | Fase 3 | CA-CAM-19 |
| RN-CAM-029 | Redactar por seguridad reemplaza el texto por `[REDACTADO]` y registra quién, cuándo y por qué, sin el texto (D-061.5). | Fase 3 | CA-CAM-19 |

### 4.3 De calidad medible

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RNF-CAM-001 | La lista carga en 2 s o menos con 10.000 cambios por empresa. | Fase 3 | CA-CAM-03 |
| RNF-CAM-002 | El calendario mensual carga en 3 s o menos con 500 cambios en el mes. | Fase 3 | CA-CAM-14 |
| RNF-CAM-003 | El impacto sugerido tarda 3 s o menos con hasta 20 elementos afectados. | Fase 3 | CA-CAM-08 |
| RNF-CAM-004 | Las reglas de segunda persona se comprueban en el servidor; una prueba intenta cada violación por la API, con la casilla apagada y vencida (D-043.6). | Fase 3 | CA-CAM-02, CA-CAM-17 |
| RNF-CAM-005 | Ninguna consulta ni escritura cruza empresas; pruebas por identificador interno y con dos empresas (D-039, D-063.6). | Fase 3 | CA-CAM-04 |
| RNF-CAM-006 | El aviso al aprobador sale en 1 minuto o menos desde que el cambio pasa a Pendiente. | Fase 3 | CA-CAM-01 |
| RNF-CAM-007 | El 100 % de transiciones, aprobaciones, usos de la casilla y exportaciones queda en la auditoría. | Fase 3 | CA-CAM-12 |
| RNF-CAM-008 | Aprobación y calendario sirven en celular, a 360 px y con teclado (D-021.1). | Fase 3 | CA-CAM-01 |
| RNF-CAM-009 | Los vencimientos, avisos y la marca "Vencido" se prueban con el reloj fijable de la plataforma (D-038.8). | Fase 3 | CA-CAM-15 |
| RNF-CAM-010 | Los procesos automáticos corren por empresa, son idempotentes y recuperables; se prueban con dos empresas (D-038.4, D-039.6). | Fase 3 | CA-CAM-16 |

## 5. Estados y transiciones

**Estados del cambio:** Borrador, Pendiente de aprobación, Rechazado, Aprobado, En implementación, Implementado, Cerrado, Cancelado. "Vencido" es una marca calculada, no un estado.

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Borrador | `cambios.pedir` | Título y tipo |
| (nuevo, estándar) | Aprobado | Sistema, al crear con `cambios.pedir_estandar` | Plantilla Vigente; fuera de congelamiento; RN-CAM-005 |
| Borrador | Pendiente de aprobación | Quien lo creó | Obligatorios completos (RN-CAM-009, RN-CAM-010); RF-CAM-011 |
| Borrador | Cancelado | Quien lo creó o `cambios.cancelar` | Motivo |
| Pendiente de aprobación | Aprobado | Aprobador (RN-CAM-007) | RN-CAM-001, RN-CAM-002, RN-CAM-013, RN-CAM-014 |
| Pendiente de aprobación | Rechazado | Aprobador (RN-CAM-007) | Motivo; RN-CAM-001 |
| Pendiente de aprobación | Borrador | Quien lo creó | Retira la solicitud; queda en auditoría |
| Rechazado | Pendiente de aprobación | Quien lo creó | Con comentario de respuesta; se conserva el historial |
| Rechazado | Cancelado | Quien lo creó o `cambios.cancelar` | Motivo |
| Aprobado | Pendiente de aprobación | Sistema | RN-CAM-011 |
| Aprobado | En implementación | Responsable (`cambios.implementar`) | RN-CAM-012 |
| Aprobado | Cancelado | `cambios.cancelar` | Motivo; RN-CAM-015 |
| En implementación | Implementado | Responsable (`cambios.implementar`) | Resultado, horas reales y notas |
| Implementado | Cerrado | `cambios.cerrar`, persona distinta de quien implementó | Revisión posterior si es obligatoria; si no, un comentario |

Ninguna otra transición. Cerrado y Cancelado son finales. Un resultado mal registrado lo corrige `cambios.cerrar` en Implementado, con motivo y valor anterior en el historial.

**Plantilla:** Borrador a Vigente (otra persona con `cambios.aprobar`); Vigente a Suspendida (sistema por RN-CAM-018, o `cambios.aprobar`); Suspendida a Vigente (otra persona con `cambios.aprobar`); Vigente o Suspendida a Desactivada (`cambios.gestionar_plantillas`, motivo; no afecta cambios ya creados). Editar una Vigente la devuelve a Borrador.

## 6. Datos

**Cambio:** empresa; número `CAM-000001` (único por empresa, no se reutiliza); título; motivo; tipo; plantilla; pedido por (membresía del Usuario); responsable de implementación (Persona con Usuario activo); ejecutor externo opcional (proveedor del catálogo); impacto, impacto sugerido, motivo si se baja, probabilidad, riesgo; ¿afecta el servicio? y minutos estimados; inicio y fin planificados y reales; planes y criterio de éxito; estado; resultado y notas; motivos de rechazo, cancelación o urgencia; revisión posterior; versión.

**Elemento afectado:** empresa, cambio, elemento de la CMDB (por identificador interno) u "otro elemento" con texto. Los indirectos se calculan.
**Aprobación:** empresa, cambio, decisión, quién, cuándo, riesgo, comentario, si usó la casilla. Una fila por decisión; no se edita.
**Plantilla:** empresa, nombre (único por empresa), descripción, plan, reversa, criterio, tipos de elemento, estado, quién la creó y aprobó.
**Ventana:** empresa, nombre, clase (Permitida o Congelamiento), días o fechas, horas en la zona de la empresa, excluir feriados, vigencia, activa. No se borra, se desactiva.
**Comentario:** empresa, cambio, autor, fecha, texto; solo se agrega.
**Vínculos** con casos y problemas: los gestiona este módulo.

Unicidad: (empresa, número); (empresa, nombre de plantilla); no se repite un elemento en un cambio.

**Datos personales:** no se guardan nombres; autores y responsables son identificadores. Los textos libres no deben llevar datos personales (declarado en la tabla del núcleo, D-061.3).

**Qué se audita:** altas y cambios (con antes y después de los campos no textuales), aprobaciones y rechazos, uso de la casilla, estados de plantillas, ventanas, redacciones y exportaciones. Textos libres: solo "el campo X cambió" (D-030).

**Pendientes de la persona (D-038.6):** cambios no cerrados donde es responsable de implementación. El cese no se bloquea; se bloquea anonimizarla mientras queden.

## 7. Pantallas necesarias

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-CAM-01 | Lista de cambios | Buscar, filtrar y exportar. | Técnico |
| PAN-CAM-02 | Nuevo cambio o editar | Formulario por secciones; muestra el impacto sugerido. | Técnico |
| PAN-CAM-03 | Ficha del cambio | Estado, línea de tiempo, comentarios, vínculos, aprobación, resultado, revisión posterior. | Todos |
| PAN-CAM-04 | Por aprobar | Bandeja; inicio de Jefatura (D-021.6). | Jefatura TI |
| PAN-CAM-05 | Decisión de aprobación | Riesgo, elementos, choques; Aprobar y Rechazar con motivo (bloque común de decisión). | Jefatura TI |
| PAN-CAM-06 | Calendario | Mes, semana y día con cambios, ventanas y congelamientos. | Todos |
| PAN-CAM-07 | Mi trabajo de cambios | Lo que debo implementar; aparece en "Mi trabajo" del Técnico (D-053). | Técnico |
| PAN-CAM-08 | Revisión posterior | Cuatro preguntas y cierre. | Jefatura TI |
| PAN-CAM-09 | Plantillas estándar | Crear (Administrador); aprobar y suspender (Jefatura TI). | Administrador |
| PAN-CAM-10 | Ventanas y congelamientos | Alta y desactivación. | Administrador |
| PAN-CAM-11 | Configuración de cambios | Plazos de aviso. La casilla «cambios» está en la pantalla única de excepciones del núcleo. | Administrador |

## 8. Notificaciones y automatismos

Todos los avisos usan el motor y la tabla únicos de Notificaciones (D-062.3). A una Persona sin Usuario solo llegan tipo, código, fecha y empresa (D-061.4); sin nombres de terceros ni títulos.

| Cuándo | A quién | Qué dice |
|---|---|---|
| Pasa a Pendiente | Quienes pueden aprobar según el riesgo, menos quien lo creó o editó | "Hay que aprobar el cambio CAM-000012. Riesgo Medio. Sábado 22:00." |
| Urgente pasa a Pendiente; recordatorio a los 30 minutos | Con `cambios.aprobar_alto` | "URGENTE: CAM-000013 espera su decisión." |
| Normal Pendiente 48 horas sin decisión | Aprobadores | "CAM-000012 espera su decisión desde hace 2 días." |
| Aprobado o Rechazado | Quien pidió y el responsable | "CAM-000012 fue aprobado." o "...fue rechazado; vea el motivo en el sistema." |
| Aprobado vuelve a Pendiente | Quien pidió y el aprobador anterior | "CAM-000012 cambió y necesita nueva aprobación." |
| El día anterior al inicio, a la hora diaria de envío | Responsable, quien pidió y responsables de los elementos | "Mañana, 22:00: cambio CAM-000012." |
| Se inicia un urgente o de riesgo Alto | Jefatura TI | "Se inició CAM-000013." |
| Resultado Revertido o Fallido | Jefatura TI y quien pidió | "CAM-000012 terminó Revertido. Revise el servicio." |
| Marca Vencido | Quien pidió y el responsable | "CAM-000012 no se ejecutó en su fecha." |
| Revisión posterior pendiente, día 3 y día 7 | Con `cambios.cerrar` y quien pidió | "CAM-000012 espera su revisión posterior." |
| Plantilla Suspendida | Con `cambios.aprobar` | "Una plantilla se suspendió porque falló un cambio." |
| Uso de la casilla «cambios» | Administradores | "Se aprobó CAM-000014 con la excepción activa." |

**Procesos automáticos (D-038.4).** (1) *Avisos diarios*: a la hora configurada de la empresa (08:00), "hoy" en su zona; registran cada aviso en la tabla única, lo que los hace idempotentes; al reiniciar procesan los días pendientes. (2) *Recordatorio de urgentes*: cada 5 minutos, mismas reglas. (3) *Suspensión de plantilla*: no es un proceso; ocurre en la misma operación que registra el resultado. La marca "Vencido" no la cambia ningún proceso; se calcula al leer.

## 9. Integración con el núcleo y con otros módulos

| Con | Qué se intercambia | Dueño del dato |
|---|---|---|
| Núcleo | Usuarios, roles, permisos, empresa activa, auditoría, contadores, calendario de empresa, interruptor único de excepciones, servicio de doble control. | Núcleo |
| `cmdb-ligera` | Elegir elementos; recibir impacto directo e indirecto, criticidad máxima y número de personas; la ficha del elemento lista cambios. | CMDB (impacto), Cambios (vínculo) |
| `mesa-de-ayuda` | Vínculo caso-cambio (origen o causado por), visible solo lectura en el caso. Un caso puede ofrecer "Crear cambio urgente" con datos precargados. Los casos restringidos de derechos de datos no se vinculan. | Cambios (vínculo), Mesa (caso) |
| `gestion-problemas` | Un problema se resuelve con cambios; un cambio Cerrado y Exitoso permite resolverlo. | Problemas (vínculo) |
| `garantias-mantenimiento` | Un mantenimiento planificado ofrece "Crear cambio estándar" con activo y fecha; consulta las ventanas solo para sugerir fecha. | Garantías, Cambios (ventanas) |
| `proveedores-contratos` | El ejecutor externo es un proveedor del catálogo. | Proveedores |
| `notificaciones` | Entrega de los avisos; eventos `cambios.cambio_aprobado` y similares en el catálogo único. | Notificaciones |
| `reportes-tableros` | Cambios por tipo y resultado, tasa de éxito, urgentes por mes, revisiones vencidas, como filtros reutilizables. | Cambios |
| `presupuesto-costos` | Sin integración (el cambio no lleva costo). | n/a |

## 10. Criterios de aceptación

Cada criterio indica el requisito que cubre.

**CA-CAM-01** (RF-CAM-001, RF-CAM-002, RF-CAM-006, RF-CAM-012, RF-CAM-019, RN-CAM-006, RN-CAM-010, RN-CAM-021, RNF-CAM-006, RNF-CAM-008). Dado un Técnico con `cambios.pedir` y un Jefatura TI con `cambios.aprobar`, cuando el Técnico completa y envía un cambio de riesgo Medio, Jefatura lo aprueba, el Técnico lo inicia en su horario y registra "Exitoso", y otra persona con `cambios.cerrar` lo cierra, entonces recorre Borrador, Pendiente, Aprobado, En implementación, Implementado y Cerrado, cada paso en la línea de tiempo y la auditoría, y el aviso al aprobador sale en menos de 1 minuto.

**CA-CAM-02** (RN-CAM-001, RNF-CAM-004). Dado un Administrador que creó CAM-000020, cuando intenta aprobarlo por pantalla o directo al servidor con la casilla «cambios» apagada, entonces el servidor responde "No puede aprobar un cambio que usted creó o editó" y sigue Pendiente. Igual si otra persona aprobó y luego este lo editó.

**CA-CAM-03** (RN-CAM-002, RN-CAM-007, RF-CAM-018, RNF-CAM-001; permiso denegado). Dado un cambio de riesgo Alto y un usuario con `cambios.aprobar` pero sin `cambios.aprobar_alto`, cuando intenta aprobarlo, entonces el servidor responde "No tiene permiso para aprobar cambios de riesgo Alto" y queda el intento en la auditoría; con el permiso, si es el responsable de implementación, también se rechaza.

**CA-CAM-04** (RF-CAM-015, RN-CAM-022, RN-CAM-025, RNF-CAM-005; aislamiento entre empresas). Dado un Jefatura TI de la Empresa B, cuando abre por identificador interno un cambio de la Empresa A, le agrega un comentario o vincula a su cambio un elemento, caso o proveedor de la Empresa A, entonces recibe "no encontrado" y la base rechaza la escritura aunque se salte la aplicación.

**CA-CAM-05** (RF-CAM-004, RN-CAM-005, RN-CAM-009). Dado una plantilla Vigente "Reemplazo de laptop", cuando un Técnico crea un estándar con ella, entonces nace Aprobado, sin aprobador, con plan y reversa heredados que no puede editar.

**CA-CAM-06** (RF-CAM-011, RN-CAM-013, RN-CAM-014). Dado un congelamiento del 28/10 al 31/10, cuando un Técnico envía un normal para el 29/10, entonces se impide con "Esa fecha está en congelamiento"; un urgente se permite y el aprobador ve el aviso.

**CA-CAM-07** (RN-CAM-011). Dado un cambio Aprobado, cuando quien lo pidió cambia la fecha de inicio, entonces vuelve a Pendiente, la aprobación anterior queda anulada pero visible y se avisa al aprobador.

**CA-CAM-08** (RF-CAM-003, RF-CAM-016, RN-CAM-008, RNF-CAM-003). Dado un cambio sobre un servidor del que depende "Correo corporativo" (criticidad Alta), cuando el Técnico guarda, entonces el impacto sugerido es Alto; si lo baja a Medio sin motivo, no se guarda.

**CA-CAM-09** (RF-CAM-014, RN-CAM-016, RN-CAM-017). Dado un urgente en Implementado, cuando quien tiene `cambios.cerrar` intenta cerrarlo sin las cuatro respuestas, entonces se impide; con las cuatro lo cierra. Con la revisión sin completar al día 7 sale el aviso, sin bloquear nada.

**CA-CAM-10** (RF-CAM-013, RN-CAM-015). Dado un cambio En implementación, cuando el Técnico registra "Revertido" sin notas, entonces se le piden; con notas pasa a Implementado y avisa a Jefatura. No hay opción "Cancelar".

**CA-CAM-11** (RF-CAM-005, RN-CAM-003, RN-CAM-018). Dado un estándar con resultado Fallido, cuando se registra, entonces su plantilla pasa a Suspendida en la misma operación y no se ofrece al crear estándares hasta que otra persona con `cambios.aprobar` la reapruebe; quien la creó no puede reaprobarla.

**CA-CAM-12** (RN-CAM-024, RNF-CAM-007). Dado que el Administrador, único con permisos, activó la casilla «cambios», cuando aprueba su propio cambio normal, entonces se permite, el cambio muestra el aviso y la auditoría registra el uso; con la casilla apagada se rechaza.

**CA-CAM-13** (RF-CAM-007, RF-CAM-008, RN-CAM-019, RN-CAM-020, RN-CAM-021). Dado un cambio Pendiente, cuando el aprobador rechaza sin motivo, entonces no se permite; con motivo pasa a Rechazado y quien pidió recibe el aviso; un Cerrado no ofrece "reabrir".

**CA-CAM-14** (RF-CAM-009, RF-CAM-010, RN-CAM-026, RNF-CAM-002). Dado un cambio Aprobado y un usuario Almacén sin `cambios.ver`, cuando abre el calendario, entonces ve "Cambio programado" con fecha y estado, nunca el título; con `cambios.ver` ve el título. Si dos cambios comparten elemento y se solapan, ambos muestran el aviso de choque.

**CA-CAM-15** (RF-CAM-020, RN-CAM-023, RNF-CAM-009). Dado un cambio Aprobado con fin el 10/11 a las 23:00 en la zona de la empresa, cuando el reloj de pruebas se fija a las 23:01 de ese día, entonces aparece "Vencido" sin que corra ningún proceso; con el reloj a las 22:59 no aparece.

**CA-CAM-16** (RNF-CAM-010). Dado dos empresas con cambios que inician mañana, cuando se dispara dos veces el proceso diario de avisos, entonces cada aviso, registro y destinatario queda en su empresa y la segunda corrida no duplica nada.

**CA-CAM-17** (RN-CAM-024, RNF-CAM-004). Dado que la casilla «cambios» venció a los 90 días, cuando alguien intenta aprobar lo propio llamando al servidor, entonces se rechaza como con la casilla apagada.

**CA-CAM-18** (RF-CAM-012, RN-CAM-012). Dado un cambio con inicio planificado a las 22:00, cuando el responsable lo inicia a las 21:59, entonces se rechaza; a las 22:00 se permite; a la hora del fin planificado más un minuto, se rechaza.

**CA-CAM-19** (RF-CAM-017, RN-CAM-027, RN-CAM-028, RN-CAM-029). Dado un comentario con un dato personal, cuando el Administrador lo redacta por seguridad, entonces el texto pasa a `[REDACTADO]`, la auditoría registra quién, cuándo y por qué sin el texto; un plan con un bloque de clave privada se rechaza al guardar.

## 11. Casos límite

1. Dos aprobadores deciden a la vez: el segundo recibe "este cambio ya fue decidido".
2. El responsable de implementación es cesado con un cambio Aprobado: se asigna otro; no cambia la aprobación (RN-CAM-011 no lista al responsable).
3. Una sola persona de TI y un urgente a las 3:00 sin la casilla: no puede aprobarlo; por eso se recomienda tener dos aprobadores o activar la casilla de antemano.
4. Un elemento afectado queda De baja antes de ejecutarse: aviso "elemento de baja" y el responsable decide si cancela.
5. Un caso vinculado a un cambio que luego se cancela: el vínculo se conserva.
6. Plantilla Desactivada con cambios Aprobados pendientes: siguen su curso.
7. Más de 20 elementos afectados: se permite y se avisa si el cálculo tarda.
8. Cambio de zona horaria de la empresa: se recalculan los avisos pendientes (D-060.9).

## 12. Decisiones propuestas y supuestos

| ID | Tipo | Propuesta | Resultado |
|---|---|---|---|
| S-CAM-01 | [SUPUESTO] | Un nivel de aprobación; riesgo Alto con permiso aparte. | Aceptado (D-058, D-043). |
| S-CAM-02 | [SUPUESTO] | Excepción propia de una persona de TI (antes RN-CAM-004). | **Rechazado**: casilla «cambios» del interruptor único (D-043, D-058). |
| S-CAM-03 | [SUPUESTO] | Los urgentes también se aprueban antes. | Aceptado. |
| S-CAM-04 | [SUPUESTO] | Estándar nace Aprobado; la plantilla se suspende si falla. | Aceptado. |
| S-CAM-05 | [SUPUESTO] | Aprobador de riesgo Alto distinto del implementador. | Aceptado y mantenido (plan CAM 5). |
| S-CAM-06 | [SUPUESTO] | Revisión posterior en 7 días corridos, solo avisos. | Aceptado (D-062.4: días corridos). |
| S-CAM-07 | [SUPUESTO] | Avisos del día anterior y recordatorio de urgentes a los 30 min. | Aceptado; ajustado a la hora diaria única (D-058.3). |
| S-CAM-08 | [SUPUESTO] | Tabla de riesgo de 3 por 3. | Aceptado. |
| S-CAM-09 | [SUPUESTO] | Sin costo del cambio. | Aceptado. |
| S-CAM-10 | [SUPUESTO] | Los vínculos viven en CAM y PRB, no en la mesa. | Aceptado; confirmado por la mesa de ayuda. |
| S-CAM-11 | [SUPUESTO] | Fase posterior a la Etapa 4. | Resuelto: Fase 3, ola E (D-056). |
| S-CAM-12 | [SUPUESTO] | Quien aprueba debe poder ver los elementos (`cmdb.ver`). | Aceptado. |
| S-CAM-13 | [SUPUESTO] | Responsable de implementación = Persona con Usuario activo. | Nuevo; pendiente de visto bueno (D-041, D-044.5). |

**[ESCALAR AL CEO]:** ninguno.

## 13. Fuera de alcance

- Comité de cambios con reuniones o varios niveles de aprobación (D-023).
- Costo o aprobación por monto de un cambio.
- Ejecución automática de pasos; despliegue continuo.
- Aviso a usuarios finales por canales distintos al correo.
- Cambios recurrentes automáticos.
- Reapertura de cambios cerrados; adjuntos (D-022).
- Indicadores avanzados (van a `reportes-tableros`).

## 14. Historial de cambios

| Cambio | Decisión o hallazgo |
|---|---|
| RN-CAM-004 retirada; casilla «cambios» del interruptor único (vence a 90 días, segundo administrador); RN-CAM-024 | D-031.6, D-043.2, D-058 (6), H-AUD-07, H-ARQ-10 |
| Definición única de creador o editor (RN-CAM-001) y tabla de actos de RN-017 del núcleo | D-043.1 y 4 |
| "Solicitante" pasa a "Pedido por" / "quien pide"; permiso `cambios.solicitar` pasa a `cambios.pedir` | D-049.6 |
| Calendario: título solo a quien ve el cambio (RN-CAM-026) | D-063.5, H-SEG-25d |
| Ventanas con el calendario de empresa (feriados) | D-062.4 |
| Permisos con PS-nn (PS-167 a PS-179, PS-221, PS-20); `cambios.exportar` pasa a `datos.exportar`; `cambios.configurar` ya no activa excepciones; `cambios.cerrar` con la condición "No" | D-036, D-037 fila 1, H-SEG, registro de permisos |
| Permiso `cambios.redactar` y RN-CAM-029; validador común de texto | D-061.5, D-063.2 |
| Auditoría sin valores de texto libre ni nombres (RN-CAM-027) | D-030 |
| Prefijo `CAM-` con 6 dígitos; pantallas `PAN-CAM-nn`; supuestos `S-CAM-nn` | D-049.2 y 4, H-AUD-03 |
| Plantilla "Retirada" pasa a "Desactivada"; elemento "De baja" | D-049.5 |
| "Vencido" calculado al leer; proceso diario solo avisa; reloj fijable | D-062.2, D-038.4 y 8 |
| Avisos por la tabla única, hora diaria única, contenido mínimo y sin títulos para Personas sin Usuario | D-062.3, D-058.3, D-061.4 |
| Pendiente de la persona (cese no bloquea; anonimizar sí) | D-061.7, D-038.6 |
| Vínculos con clave compuesta con la empresa (RN-CAM-025) | D-039.1 y 7 |
| Consume la CMDB delgada (impacto vía operación del módulo CMD) | D-062.1 |
| Columna "Empleado (portal)": no aplica; Almacén sin cambios | D-037.11 |
| Columna Cuándo y CA por requisito; criterios citan su requisito; fase Fase 3, ola E, después de CMD | plan sección 0 (2), H-AUD-21, D-056 |
| Pruebas nuevas: dos empresas, escritura cruzada, reloj fijable, borde exacto, casilla vencida (CA-CAM-04, CA-CAM-15 a CA-CAM-18) | D-039.6, D-043.6, D-063.6, QA y Seguridad |
| Todas las citas escritas completas: CA-CAM-nn en la columna CA, y RF-, RN- y RNF-CAM-nnn sin abreviar | Auditor Técnico, ronda 3 |
