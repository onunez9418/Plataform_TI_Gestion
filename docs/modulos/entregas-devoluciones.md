# Módulo: Entregas y devoluciones de activos (ENT)

**Versión:** 0.4 (aplicación de D-065 a D-076; Oleada D, Escuadrón D; más D-113.1 sobre renovar préstamos)
**Sigla de requisitos:** ENT
**Fuente de verdad:** `docs/documento-funcional.md` y `docs/equipo/decisiones.md`. Aplican D-006 (Persona), D-012 (estados y constancia), D-033 y D-051 (nombre en el acta), D-034 (cese), D-037 (permisos), D-043 (autoentrega), D-060 (estado y asignación), D-061.4 (correos), D-063.1 (PDF).
**Marcas:** **[SUPUESTO]** = propuesta mía que confirma el Gerente de TI. **[ESCALAR AL CEO]** = solo dinero, tema legal o algo irreversible. "Cuándo": `v1, Etapa N`, `Fase 2` o `Fase 3` (D-056).

---

## 1. Propósito, alcance y fase

**Propósito.** Dejar constancia ordenada de cada vez que un equipo sale de TI hacia una Persona y cada vez que vuelve: en qué condición, con qué accesorios, quién entregó y quién recibió. Responde en segundos a "¿quién tiene esta laptop?" y "¿qué equipos ha tenido Ana?".

**El módulo se parte en dos (D-056.4):**
- **ENT-A, `v1, Etapa 4`:** asistente "Entregar" (también para devolver y traspasar), acta imprimible en PDF, devolución, traspaso, extravío y robo (con el diálogo único "Cambiar estado"), historiales.
- **ENT-B, `Fase 2`** (con NOT-completo): marca de conformidad, bandeja de actas sin firma y de préstamos, y avisos. **Después:** aceptación en pantalla y adjunto del acta firmada (D-022, D-023.2), ver 4.4.

**Entra (ENT-A):** acta de entrega y de devolución con condición y accesorios; préstamo (entrega con fecha de devolución prevista, D-012.2); traspaso entre Personas; extravío y robo; historial por Persona y por activo; devolución de quien ya cesó.
**Entra (ENT-B):** conformidad en papel, actas sin firma, avisos de préstamo y de acta pendiente.
**No entra:** ver sección 13.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Acta** | Registro en el sistema y PDF imprimible que prueba una entrega o una devolución. Numeración `ACT-E-000001` (entrega) y `ACT-D-000001` (devolución); el prefijo `ACT` es reservado (D-049). |
| **Entrega** | Un activo pasa de TI a una Persona; queda "Asignado" con una asignación abierta (RF-INV-024). |
| **Devolución** | El activo vuelve de la Persona a TI y la asignación se cierra. |
| **Traspaso** | Un equipo pasa de una Persona a otra en un solo acto (única forma de Asignado a Asignado, D-060.4). |
| **Préstamo** | Entrega con fecha de devolución prevista. No es un estado (D-012.2). |
| **Pendiente de devolución** | Marca calculada de un equipo cuya Persona cesó (D-034): sigue Asignado. No es pérdida. |
| **Condición** | Estado físico al entregar o devolver: Nuevo, Bueno, Con detalles, Dañado. |
| **Accesorio** | Lo que acompaña al equipo: artículo por cantidad del inventario (mouse) o texto libre (cargador original). |
| **Conformidad** | Constancia de que la Persona recibió el equipo. En la v1, el papel firmado que archiva la empresa. |
| **Asignación** | Fila de historial de un activo con una Persona: desde, hasta, resultado (D-012.7). |
| **Excepción declarada** | La copia del nombre y área en el acta, con `retener_hasta` (D-051). |

## 3. Roles y permisos

Solo nombres del registro `docs/registro-permisos.md`. * = sensible. Todo se comprueba en el servidor.

| Acción | PS | Permiso | Cuándo | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura | Empleado (portal) |
|---|---|---|---|---|---|---|---|---|---|---|
| Ver actas e historiales | PS-54 | `entregas.ver` | v1, E4 | Todo | Todo | Todo | No | No | Todo | No (ve lo propio por el portal) |
| Entregar (asistente único) | PS-55 | `entregas.crear` | v1, E4 | Sí | No | Sí | **No** | No | No | No |
| Registrar devolución | PS-56 | `entregas.devolver` | v1, E4 | Sí | No | Sí | **No** | No | No | No |
| Traspasar entre Personas | PS-57 | `entregas.traspasar` | v1, E4 | Sí | No | Sí | No | No | No | No |
| Anular un acta por error | PS-58 | `entregas.anular` | v1, E4 | Sí | No | No | No | No | No | No |
| Imprimir o reimprimir acta | PS-59 | `entregas.imprimir_acta` | v1, E4 | Sí | Sí | Sí | No | No | Sí (PDF sin nombre ni área) | - |
| Marcar conformidad | PS-60 | `entregas.marcar_conformidad` | Fase 2 | Sí | No | Sí | No | No | No | No |
| Extravío o robo (diálogo "Cambiar estado") | PS-46 | `activos.registrar_extravio` | v1, E4 | Sí | Sí | Sí | No | No | No | No |
| Reingreso de un equipo hallado | PS-48 | `activos.reingreso`* | v1, E4 | Sí | Sí | No | No | No | No | No |
| Enviar a reparación sin devolver | PS-45 | `activos.cambiar_estado` | v1, E4 | Sí | No | Sí | No | No | No | No |
| Baja como destino de devolución | PS-47 | `activos.dar_baja` | v1, E4 | Sí | No | Sí | No | No | No | No |
| Alta rápida de Persona al entregar | PS-25 | `personas.crear_editar` | v1, E2 | Sí | No | Sí | No | No | No | No |
| Ver nombre de la Persona | PS-22 | `datos_personales.ver`* | v1, E2 | Sí | Sí | Sí | No | No | No | No |
| Exportar actas (puerta única) | PS-20 | `datos.exportar`* | v1, E2 | Sí | No | No | No | No | No | No |

Notas:
- Resuelto por D-037 filas 6, 8 y 9: **Almacén no entrega ni devuelve por defecto**; la empresa puede concedérselo y entonces necesita también `datos_personales.ver`. Quien no tiene `datos_personales.ver` ve `PRS-0042` y el PDF omite nombre y área.
- `entregas.imprimir_acta` (PS-59) da "-" a Empleado (portal) y a Solicitante, como el registro. Sus actas propias las ven y reimprimen desde el portal con `portal.ver_propio` (PS-205), no con este permiso.
- La autoentrega no tiene excepción: ninguna casilla del interruptor único de excepciones la cubre (D-043.2).

## 4. Requisitos

Los RN y RNF rigen desde el "Cuándo" del requisito que protegen.

### 4.1 Requisitos funcionales

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-ENT-001 | Asistente único **"Entregar"** (el botón de la ficha del activo lo abre con el equipo cargado; lo reutilizan Garantías y Órdenes de servicio): Persona Activa (con alta rápida de Persona si no existe), uno o más equipos En stock, condición, accesorios, observaciones y tipo (Definitiva o Préstamo). Al confirmar, los equipos pasan a Asignado y se genera el acta. | ENT-A, v1, Etapa 4 | CA-ENT-01, 02, 03 |
| RF-ENT-002 | Borrador automático de la entrega: se puede salir y volver sin perder lo capturado. No reserva equipos. Un borrador sin efecto se puede borrar (D-019). | ENT-A, v1, Etapa 4 | CA-ENT-16 |
| RF-ENT-003 | Acta de entrega en PDF: empresa, número `ACT-E-NNNNNN`, fecha y hora, Persona, quién entrega, equipos (artículo, marca, modelo, serie, condición), accesorios, observaciones, fecha prevista si es préstamo, espacio de firma de ambos y aviso de privacidad de la empresa. | ENT-A, v1, Etapa 4 | CA-ENT-01, 12, 13 |
| RF-ENT-004 | **Devolución** (modo del mismo asistente): la Persona (Activa o Cesada), los equipos que devuelve (todos o algunos), condición, accesorios devueltos o faltantes, si el equipo fue borrado, si se liberó el bloqueo de cuenta, ubicación de retorno y destino. | ENT-A, v1, Etapa 4 | CA-ENT-04, 08 |
| RF-ENT-005 | Acta de devolución en PDF `ACT-D-NNNNNN` con el mismo formato. | ENT-A, v1, Etapa 4 | CA-ENT-12 |
| RF-ENT-006 | **Traspaso** (tercer modo del asistente): equipos de la Persona A a la B en un solo acto atómico, con dos actas enlazadas. | ENT-A, v1, Etapa 4 | CA-ENT-08 |
| RF-ENT-007 | Marcar la conformidad: "Firmada en papel" (fecha, quién recibió el papel, nota de dónde se archiva) o "Firma rechazada por la Persona" (motivo de lista). | ENT-B, Fase 2 | CA-ENT-15 |
| RF-ENT-008 | Reimprimir un acta; la copia lleva la marca "Reimpresión" con fecha y el mismo número. | ENT-A, v1, Etapa 4 | CA-ENT-12 |
| RF-ENT-009 | Anular un acta registrada por error, con motivo, si el equipo no tuvo movimientos posteriores. | ENT-A, v1, Etapa 4 | CA-ENT-11 |
| RF-ENT-010 | Registrar extravío o robo de un equipo asignado con el **diálogo único "Cambiar estado"** (tipo Extravío o Robo, fecha del hecho, circunstancias, número de denuncia). ENT guarda solo la asignación cerrada con ese resultado. Con AYU activo, el reporte es un caso y el cambio de estado se hace al confirmarlo. | ENT-A, v1, Etapa 4 | CA-ENT-10 |
| RF-ENT-011 | **Retirado.** El hallazgo de un equipo extraviado es el reingreso del núcleo (diálogo "Cambiar estado", `activos.reingreso`); después se vuelve a entregar con acta nueva. | (retirado) | CA-ENT-10 |
| RF-ENT-012 | Historial por Persona: pestaña "Entregas y actas" de su ficha, con asignaciones vigentes y cerradas. | ENT-A, v1, Etapa 4 | CA-ENT-01 |
| RF-ENT-013 | Historial por activo: pestaña "Entregas y actas" de su ficha (Persona, desde, hasta, condición al entregar y devolver, resultado). | ENT-A, v1, Etapa 4 | CA-ENT-01 |
| RF-ENT-014 | Lista de actas con buscador y filtros (tipo, Persona, activo, fecha, estado, "préstamo vencido" calculado al leer, "pendiente de devolución") y exportación por la puerta única (D-061.1). | ENT-A, v1, Etapa 4 | CA-ENT-07 |
| RF-ENT-015 | Pestaña "Entregas" dentro de **"Mi trabajo"** del Técnico: actas sin firma, préstamos por vencer y vencidos, equipos pendientes de devolución. | ENT-B, Fase 2 | CA-ENT-15 |
| RF-ENT-016 | Renovar un préstamo: nueva fecha prevista con motivo y auditoría (fecha anterior y nueva); lo hace quien tiene `entregas.crear` (PS-55), avisa a la persona que tiene el equipo y no pasa de entrega + 365 días (RN-ENT-017, S-ENT-12). | ENT-A, v1, Etapa 4 | CA-ENT-17 |
| RF-ENT-017 | Avisos de ENT-B: entrega registrada, acta sin firma, préstamo por vencer y vencido (ver sección 8). | ENT-B, Fase 2 | CA-ENT-15 |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-ENT-001 | Solo una Persona **Activa** puede recibir equipos. Una Persona **Cesada** sí puede **devolver** y ser origen de un traspaso (PRS: el cese no se bloquea). |
| RN-ENT-002 | Solo se entregan activos **En stock**. Asignado a Asignado ocurre únicamente como **traspaso** atómico. Un activo En reparación (con o sin asignación abierta), Extraviado o robado o De baja no se entrega (D-012.3, D-060.4). |
| RN-ENT-003 | Un activo tiene una sola asignación abierta; la base lo impide con un índice único parcial aunque dos técnicos entreguen a la vez (RF-INV-024, D-060.5). |
| RN-ENT-004 | La condición de cada equipo es obligatoria. "Con detalles" y "Dañado" exigen observación. **No se entrega un equipo "Dañado".** |
| RN-ENT-005 | Numeración `ACT-E-` y `ACT-D-`, mínimo 6 dígitos, por empresa y con contador propio (T-11). Un número no se reutiliza; puede haber saltos (D-007). |
| RN-ENT-006 | **Excepción declarada (D-051):** el acta guarda copia de nombre y área en **columnas propias** con `retener_hasta` (cierre de la asignación más 5 años, RN-ENT-021). No se escribe en la auditoría. La anonimización de la Persona no la toca; la función de anonimización la limpia al vencer `retener_hasta` y la reimpresión posterior muestra la referencia. |
| RN-ENT-007 | **La autoentrega está prohibida sin excepción**, también al Administrador: quien registra una entrega, devolución o traspaso no puede ser la Persona vinculada a su membresía. Ninguna casilla del interruptor único la cubre (D-043.2). |
| RN-ENT-008 | La entrega queda registrada y el equipo Asignado al confirmar, haya o no firma. La conformidad es un dato aparte (ENT-B) y no bloquea el uso. |
| RN-ENT-009 | En la v1 la conformidad es el **papel firmado** que archiva la empresa; la plataforma no lo guarda (D-022) y no lo rastrea hasta ENT-B. |
| RN-ENT-010 | ENT-B: un acta sin conformidad a los 7 días (configurable) aparece en "Mi trabajo" y genera aviso. |
| RN-ENT-011 | Devolución: ubicación de retorno obligatoria (se sugiere el almacén de TI). Destinos: En stock, En reparación o De baja (este último con motivo y `activos.dar_baja`). Una devolución con destino En reparación **cierra** la asignación; enviar a reparación **sin devolver** (asignación abierta, S-29) se hace con "Cambiar estado". |
| RN-ENT-012 | Un equipo devuelto "Dañado" solo puede ir a En reparación o De baja. |
| RN-ENT-013 | Solo se devuelven equipos con asignación abierta a esa Persona. |
| RN-ENT-014 | Un accesorio por cantidad genera una salida de stock al entregar y un ingreso al devolver, ligados al acta. Sin stock suficiente, la entrega se rechaza completa (D-010.1). Un accesorio de texto libre no mueve stock. |
| RN-ENT-015 | Un accesorio no devuelto queda "Faltante" en el acta. No genera cobro ni descuento en la plataforma. |
| RN-ENT-016 | Extravío o robo se registra solo por decisión explícita con motivo. **"Pendiente de devolución" no es extravío**: no aparece en reportes de pérdidas ni en la depreciación como tal (D-034.2). El tipo "No devuelto tras el cese" ya no existe. El reporte hecho desde el portal es un caso y no cambia el estado hasta que TI lo confirma. |
| RN-ENT-017 | Un préstamo exige fecha prevista de hoy o futura, máximo 365 días **contados desde la fecha de la entrega** (una renovación no reinicia el conteo; D-113.1). "Vencido" se **calcula al leer** con la zona de la empresa (D-062.2); ningún proceso lo guarda. |
| RN-ENT-018 | El traspaso es atómico: o se registran la devolución y la entrega, o ninguna. La Persona destino debe estar Activa y ser distinta del origen. |
| RN-ENT-019 | Anular un acta solo si el activo no tuvo asignación posterior, reparación, traslado ni baja; "posterior" se mide con la **secuencia creciente** por empresa, no con la hora (D-060.5). Con motivo; genera el movimiento contrario; el acta queda "Anulada". |
| RN-ENT-020 | Confirmar es todo o nada y no se repite con doble clic (misma clave de idempotencia). |
| RN-ENT-021 | Retención (regla provisional D-033 y D-051, S-36 del núcleo): el acta y la copia del nombre se conservan **5 años desde el cierre de la asignación** a la que pertenece el acta (devolución, baja o extravío). Mientras la asignación siga abierta no hay fecha: `retener_hasta` queda vacía y el nombre no se limpia. Al cerrarse, `retener_hasta` = fecha de cierre + 5 años. Provisional hasta legal. |
| RN-ENT-022 | Un acta tiene una sola Persona y activos de una sola empresa. |
| RN-ENT-023 | Todo registro lleva la empresa; un identificador de otra empresa responde "no encontrado" (D-021.5). |
| RN-ENT-024 | Nada con historial se borra: ni actas ni asignaciones. Solo los borradores sin efecto. |
| RN-ENT-025 | El PDF se arma con una librería que **no interpreta HTML ni descarga recursos** y todo texto se escapa (D-063.1). |
| RN-ENT-026 | Sin `datos_personales.ver` el PDF omite nombre y área y muestra `PRS-0042` (D-037 fila 9). |
| RN-ENT-027 | Las circunstancias del extravío son texto libre con el validador común (sin claves ni bloques de clave privada); se ven solo con `datos_personales.ver`, no salen en portal, exportaciones ni reportes, y pueden redactarse por seguridad (D-061.5). |
| RN-ENT-028 | El pie del acta lleva el aviso de privacidad que la empresa entrega (D-061.8). Hasta entonces, un texto provisional marcado "borrador". |
| RN-ENT-029 | El alta rápida de Persona dentro del asistente la hacen solo Técnico y Administrador. Almacén no (DS-10). |

### 4.3 Requisitos de calidad

| ID | Requisito medible |
|---|---|
| RNF-ENT-001 | Entregar un equipo toma 5 pasos o menos desde la ficha del activo y menos de 1 minuto con los datos a mano. |
| RNF-ENT-002 | El PDF se genera en menos de 5 segundos (p95) y cabe en una hoja A4 con hasta 10 equipos. |
| RNF-ENT-003 | Con 20 intentos simultáneos de entregar el mismo equipo, exactamente uno tiene éxito (prueba contra PostgreSQL real). |
| RNF-ENT-004 | El historial de una Persona con 200 asignaciones carga en menos de 2 segundos (p95); el volumen de referencia es el de RNF-010 del núcleo. |
| RNF-ENT-005 | El 100 % de entregas, devoluciones, anulaciones y cambios de estado queda en la auditoría en la misma operación, sin nombre ni correo (D-030). |
| RNF-ENT-006 | El asistente se usa completo a 360 px, con teclado y con lector de código de barras como teclado (D-021, DS-11). |
| RNF-ENT-007 | Cada tabla del módulo tiene prueba de aislamiento con `app_empresa` y por identificador interno (D-039, D-063.6). |
| RNF-ENT-008 | Una prueba pone texto malicioso (`<img src="http://...">`, `file://`, fórmulas) en cada campo del acta y comprueba que el PDF no hace pedidos ni lee archivos. |
| RNF-ENT-009 | El PDF contiene únicamente los datos de la sección 6; un PDF para un rol sin `datos_personales.ver` no contiene nombre ni área en ninguna parte. |

### 4.4 Alternativa a la firma adjunta y qué cambia si se habilita (D-022)

**Versión 1.** 1) Se confirma la entrega y se imprime el acta. 2) La Persona firma en papel. 3) La empresa archiva el papel. El sistema prueba **que la entrega se registró y quién la registró**; no guarda la firma. **ENT-B (Fase 2)** agrega la marca "Firmada en papel" con fecha y la bandeja de actas sin firma.

**Si se habilita el adjunto (decide el Cliente (CEO) por costo de almacenamiento):** "Firmada en papel" pediría la foto o el escaneo (obligatorio u opcional por empresa); se guarda por empresa, con tipos y tamaños limitados, y se entrega solo tras comprobar el acceso; se agrega su plazo de conservación (el del acta) y su borrado al vencer.

**Aceptación en pantalla (Fase 3, con el portal):** la Persona acepta en el portal (acuse informativo, POR). Convive con el papel. Un enlace por correo para Personas sin cuenta requiere la revisión de Seguridad.

## 5. Estados y transiciones

**Acta**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) | Borrador | `entregas.crear` o `entregas.devolver` | Persona elegida |
| Borrador | Registrada | Quien lo creó | RN-ENT-001 a 004; todo o nada |
| Borrador | (borrado) | Quien lo creó | Nunca tuvo efecto (D-019) |
| Registrada | Anulada | `entregas.anular` | Motivo; RN-ENT-019 |

**Conformidad** (ENT-B, Fase 2): Pendiente de firma a Firmada en papel o Firma rechazada (con `entregas.marcar_conformidad`); Firma rechazada a Firmada en papel si luego firma.

**Asignación (fila de historial)**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) Abierta | Cerrada: Devuelto | Devolución registrada | Destino elegido |
| Abierta | Cerrada: Traspasado | Traspaso | RN-ENT-018 |
| Abierta | Cerrada: Extraviado o robado | `activos.registrar_extravio` | Motivo (RN-ENT-016) |
| Abierta | Cerrada: De baja | `activos.dar_baja` | Motivo (RF-INV-024 e) |
| Abierta | Anulada | `entregas.anular` | RN-ENT-019 |

**Préstamo:** Vigente, Por vencer (3 días antes) y Vencido: etiquetas **calculadas al leer**, sin acción del usuario.

## 6. Datos

**Acta.** Empresa; identificador interno; número `ACT-E-` o `ACT-D-`; tipo; estado (Borrador, Registrada, Anulada); Persona; **copia de nombre y área con `retener_hasta`** (excepción D-051); quién entrega o recibe (membresía); fecha y hora (hora universal, mostrada en la zona de la empresa); tipo de entrega (Definitiva, Préstamo); fecha prevista; observaciones; acta de origen (traspaso, anulación); motivo de anulación; veces impresa; secuencia por empresa. ENT-B suma: conformidad (Pendiente, Firmada en papel, Firma rechazada), fecha, quién la marcó, nota de archivo.

**Línea de acta.** Acta; activo; copia de artículo, marca, modelo y serie; condición; observación; en devolución: destino, ubicación de retorno, "equipo borrado" y "bloqueo de cuenta liberado" (Sí, No, No aplica).

**Accesorio de acta.** Acta; tipo (Del inventario o Texto libre); artículo y cantidad, o texto; en devolución: Devuelto, Faltante o Dañado; movimiento de stock ligado.

**Asignación.** Empresa; activo; Persona; acta de entrega; acta de devolución; desde; hasta; resultado (Devuelto, Traspasado, Extraviado o robado, De baja, Anulada); condición al entregar y al devolver. Restricción: una sola abierta por activo. El extravío, su fecha, circunstancias y denuncia viven en el evento "Cambiar estado" del núcleo.

**Datos personales declarados por este módulo (D-061.3)**

| Dato | Finalidad | Quién lo ve | Plazo y rutina |
|---|---|---|---|
| Copia de nombre y área en el acta | Prueba de lo firmado | `datos_personales.ver`; la Persona | Hasta `retener_hasta` (cierre de la asignación + 5 años, provisional; vacía mientras la asignación esté abierta); la función de anonimización la limpia |
| Asignaciones (Persona, equipos, fechas) | Saber quién tiene qué | `datos_personales.ver` | Referencia a la Persona; conserva el historial tras anonimizar |
| Circunstancias y denuncia de un extravío | Constancia | `datos_personales.ver` | Plazo del acta; texto libre no anonimizable de forma garantizada (se declara) |
| Observaciones y "firma rechazada" | Constancia | `datos_personales.ver` | Plazo del acta |

**Qué se audita:** altas, registros, anulaciones, reimpresiones, marcas de conformidad, extravíos, renovaciones, exportaciones. Nunca nombre ni correo (D-030.2).

## 7. Pantallas necesarias

Se reutilizan el **asistente "Entregar"** y el **diálogo "Cambiar estado"** (D-053), las pestañas "Entregas y actas" de las fichas del activo y de la Persona, y "Mi trabajo" del Técnico.

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-ENT-01 | Asistente "Entregar / Devolver / Traspasar" | Registrar el acto y generar el acta | Técnico |
| PAN-ENT-02 | Acta (detalle e imprimible) | Ver, imprimir, anular; marcar conformidad (ENT-B) | Técnico |
| PAN-ENT-03 | Lista de actas | Buscar y filtrar | Técnico, Jefatura TI |

## 8. Notificaciones y automatismos

**En la v1 (ENT-A) este módulo no envía correos** (D-061.4: la v1 solo envía invitación, acceso y aprobación). Lo siguiente es ENT-B, `Fase 2`, por el motor único de NOT (una sola tabla de avisos, hora única de envío, por defecto 08:00).

| Cuándo | A quién | Qué dice |
|---|---|---|
| Entrega registrada | Persona (correo, si tiene) | "Se registró una entrega: acta ACT-E-000123 del 15/11/2026. [Empresa]." |
| Acta sin conformidad a los 7 días | Quien entregó y Jefatura TI | "El acta ACT-E-000123 sigue sin firma. Persona: PRS-0042." |
| Préstamo a 3 días de vencer | Persona (correo) y quien entregó | "El préstamo del acta ACT-E-000123 vence el 20/11/2026. [Empresa]." |
| Préstamo vencido | Persona, quien entregó y Jefatura TI | "El préstamo del acta ACT-E-000123 venció el 20/11/2026." Cada 7 días. |
| Extravío o robo registrado | Jefatura TI y Administrador | "Se registró [tipo] de un equipo asignado a PRS-0042." |
| Acta anulada | Jefatura TI | "Se anuló el acta [número]. Motivo: [lista]." |

**Personas sin Usuario** (acordado con Notificaciones): reciben solo entrega registrada, préstamo por vencer y préstamo vencido; el correo lleva únicamente tipo de aviso, código del acta, fecha y nombre de la empresa. Nunca serie, IMEI, nombres de terceros ni enlaces de acción (D-061.4).
**Proceso diario (Fase 2):** recalcula avisos; idempotente, recuperable (procesa los días pendientes), empresa por empresa con "hoy" en su zona, con registro de corrida (D-038.4); no cambia estados de activos. Se prueba con dos empresas (D-039.6).

## 9. Integración con el núcleo y con otros módulos

- **Inventario (Etapa 4).** Regla única RF-INV-024: Asignado exige asignación abierta; la asignación solo termina con devolución, baja o extravío; En reparación puede conservarla. ENT escribe la asignación y llama a la función única de transiciones; los accesorios por cantidad usan los movimientos de stock (D-010).
- **PRS.** Personas y ubicaciones; el cese no bloquea; los equipos de una Persona cesada se ven como "Pendiente de devolución" y se devuelven con este asistente.
- **ONB (Fase 2).** La tarea "Entregar equipo" abre el asistente con la Persona cargada; "Devolver equipos" se marca sola al quedar sin equipos.
- **POR (Fase 3).** El portal lee equipos y actas propias y abre casos; el acuse en pantalla es informativo.
- **Mesa de ayuda (Fase 2).** Un extravío reportado por el portal es un caso (AYU); al confirmarlo, el técnico usa "Cambiar estado". Un equipo devuelto "Dañado" puede originar un caso.
- **Garantías y órdenes de servicio.** Reutilizan el asistente y el diálogo; una devolución a En reparación no crea la orden sola (D-027).
- **Licencias y líneas.** Si se asigna una línea o puesto en el mismo acto, el acta puede listarla como dato informativo; la asignación la gestiona cada módulo.
- **Reportes.** Equipos por Persona y por área, actas pendientes, préstamos vencidos; "Pendiente de devolución" no cuenta como pérdida.

## 10. Criterios de aceptación

- **CA-ENT-01** (RF-ENT-001, 003, 012, 013; RN-ENT-005). Dado un técnico con `entregas.crear`, una Persona Activa y una laptop En stock, cuando confirma la entrega con condición "Nuevo", entonces la laptop queda Asignada, se genera `ACT-E-000001` en PDF y el historial del activo y de la Persona muestra la asignación.
- **CA-ENT-02** (RN-ENT-002, 003). Dada una laptop Asignada a Ana, cuando otro técnico intenta entregarla a Luis (no como traspaso), entonces se rechaza con "este equipo ya está asignado".
- **CA-ENT-03** (RN-ENT-003; RNF-ENT-003). Dados 20 intentos simultáneos de entregar el mismo equipo a Personas distintas, entonces uno queda registrado y el equipo tiene una sola asignación abierta.
- **CA-ENT-04** (RF-ENT-004; RN-ENT-011, 012). Dada una devolución "Dañado", cuando se elige destino En stock, entonces se impide y se ofrece En reparación o De baja.
- **CA-ENT-05** (RN-ENT-014). Dada una entrega con un mouse por cantidad y stock 0, cuando se confirma, entonces se rechaza completa, ningún equipo cambia y el stock no queda negativo.
- **CA-ENT-06 (permiso denegado)** (RF-ENT-001, 009; RN-ENT-007). Dado un usuario Almacén (sin permiso concedido) o "Solo lectura", cuando intenta entregar o anular un acta, por pantalla o llamando al servidor, entonces se rechaza y no cambia nada.
- **CA-ENT-07 (aislamiento)** (RF-ENT-014; RN-ENT-023). Dada un acta de la empresa A, cuando un usuario de B la pide por su **identificador interno** y por su número `ACT-E-000001` (que existe también en B), entonces responde "no encontrado" para el primero y no muestra el de A en el segundo; las listas de B no incluyen nada de A.
- **CA-ENT-08 · Traspaso de todo o nada** (RF-ENT-004, 006; RN-ENT-001, 018, 020). Dados Ana Ruiz (`PRS-0042`), Persona **Cesada**, con una laptop L1 (`ACTV-000042`, serie SN-100) y un celular M1 (`ACTV-000043`, serie SN-200) Asignados, Luis Prado (`PRS-0043`), Persona Activa, y un técnico con `entregas.traspasar` que no es Luis:
  - **Con éxito.** Cuando el técnico traspasa L1 y M1 a Luis, entonces las dos asignaciones de Ana quedan cerradas con resultado «Traspasado», Luis tiene dos asignaciones abiertas y se generan dos actas enlazadas (la devolución de Ana y la entrega a Luis), cada una con la otra como acta de origen.
  - **Falla provocada.** Dada la inyección de fallos del entorno de pruebas (cortar la conexión), cuando se corta la conexión con la base entre la primera y la segunda asignación del traspaso, entonces no queda ninguna devolución ni entrega registrada, L1 y M1 siguen Asignados a Ana con su asignación abierta, no queda ninguna acta Registrada y el técnico ve un aviso de que no se guardó nada; al repetir la confirmación, el traspaso se registra una sola vez.
  - **Destino que deja de ser Activo, sin inyección.** Cuando Luis pasa a Cesada justo antes de que el técnico confirme (el técnico tenía el asistente abierto con Luis cargado), entonces la confirmación se rechaza con «No se puede por una regla», L1 y M1 siguen con Ana y no se registra nada.
  - **Destino igual al origen.** Cuando el técnico intenta traspasar L1 y M1 a Ana, entonces se rechaza y no cambia nada.
- **CA-ENT-09** (RN-ENT-007). Dado un técnico vinculado a la Persona "Luis" y **todas las casillas** de excepciones de la empresa activadas, cuando intenta entregarse una laptop a sí mismo, entonces se rechaza igual.
- **CA-ENT-10 · Pendiente de devolución no es pérdida** (RF-ENT-010, 011, 014; RN-ENT-016; S-ENT-11). Dada Ana Ruiz (`PRS-0042`) cesada el 02/11/2026 con la laptop L1 (`ACTV-000042`) Asignada, y el reloj de pruebas (RNF-020) en esa fecha:
  - **Con el paso del tiempo.** Cuando el reloj se adelanta a +30 días (02/12/2026) y luego a +365 días (02/11/2027) desde el cese, y en cada fecha se dispara a mano cada proceso diario que exista, entonces L1 sigue Asignada con su asignación abierta, se muestra como «Pendiente de devolución» (marca calculada al leer, no un estado), aparece en el filtro «pendiente de devolución» de la lista de actas y no figura entre los equipos Extraviados o robados ni en ningún reporte de pérdidas.
  - **Robo.** Cuando un técnico con `activos.registrar_extravio` marca L1 como «Robo» con motivo, fecha del hecho y número de denuncia, entonces la asignación se cierra con resultado «Extraviado o robado» y recién entonces L1 figura como robo; sin motivo se rechaza.
  - **Hallazgo.** Cuando aparece L1, un técnico (sin `activos.reingreso`) no puede reingresarla y se rechaza; Jefatura TI o el Administrador la reingresa con motivo; si la tiene una Persona, se entrega con acta nueva.
- **CA-ENT-11** (RF-ENT-009; RN-ENT-019). Dada un acta cuyo equipo ya fue reasignado, cuando se intenta anular, entonces se rechaza por movimiento posterior.
- **CA-ENT-12** (RF-ENT-003, 005, 008; RN-ENT-026). Dada un acta, cuando la imprime un usuario "Solo lectura" (sin `datos_personales.ver`), entonces el PDF muestra `PRS-0042` y no contiene nombre ni área; cuando la imprime un Técnico, contiene ambos.
- **CA-ENT-13** (RF-ENT-003; RN-ENT-025; RNF-ENT-008). Dado texto malicioso en observaciones y accesorios, cuando se genera el PDF, entonces el texto sale literal, sin pedidos de red ni lectura de archivos.
- **CA-ENT-14** (RN-ENT-006). Dada una Persona anonimizada con acta aún dentro de `retener_hasta`, cuando se reimprime el acta, entonces conserva el nombre copiado; vencido `retener_hasta`, la función de anonimización lo reemplaza por la referencia, y en ambos casos la auditoría nunca contuvo el nombre.
- **CA-ENT-15** (RF-ENT-007, 015, 017; RN-ENT-010). Dada un acta con 7 días sin conformidad, cuando corre el aviso diario (Fase 2), entonces el técnico y Jefatura TI reciben el aviso, aparece en "Mi trabajo" y, dos corridas el mismo día, no duplican el aviso.
- **CA-ENT-16 · Borrador de la entrega** (RF-ENT-002; RN-ENT-020, 024). Dado un técnico con `entregas.crear` que captura una entrega de dos equipos, una laptop L1 (`ACTV-000042`) y un celular M1 (`ACTV-000043`), ambos En stock, para Ana Ruiz (`PRS-0042`), con condición «Nuevo», y sale del asistente sin confirmar:
  - **Volver.** Cuando vuelve a abrir el asistente, entonces ve el borrador con la Persona, los dos equipos, la condición y los accesorios que había capturado.
  - **No reserva.** Mientras el borrador existe, L1 y M1 siguen En stock, sin asignación ni acta Registrada; otro técnico entrega L1 a Luis Prado (`PRS-0043`) y L1 queda Asignada.
  - **Confirmar un borrador que ya no vale.** Cuando el primer técnico confirma su borrador, entonces se rechaza con «este equipo ya está asignado» por L1, M1 tampoco se entrega (todo o nada) y M1 sigue En stock.
  - **Borrar.** Cuando el primer técnico borra el borrador sin efecto, entonces desaparece de su lista y no queda rastro en la lista de actas ni en el historial de L1, de M1 ni de Ana.
  - **Lo registrado no se borra.** Dada una entrega ya Registrada, cuando alguien intenta borrarla (por pantalla o por petición directa), entonces se rechaza; solo se puede anular con motivo (CA-ENT-11, CA-045).
- **CA-ENT-17 · Renovar un préstamo** (RF-ENT-016; RN-ENT-017; S-ENT-12). Dado, con el reloj de pruebas el 02/11/2026, un préstamo de la laptop L1 (`ACTV-000042`) a Ana Ruiz (`PRS-0042`) con fecha prevista 30/11/2026:
  - **Renovar.** Cuando el técnico lo renueva al 31/12/2026 con el motivo «Proyecto se extiende», entonces la fecha prevista pasa a 31/12/2026, el historial conserva la fecha anterior (30/11/2026) y la nueva, y la auditoría guarda el motivo, sin nombre ni correo.
  - **Vencido se calcula al leer.** Cuando el reloj pasa al 05/12/2026, entonces el préstamo no figura como «Vencido» (su fecha prevista es 31/12/2026); sin renovar, habría figurado así desde el 01/12/2026.
  - **Rechazos.** Una renovación sin motivo se rechaza; una con fecha anterior a hoy (01/11/2026) se rechaza; la pide un usuario Solo lectura o Almacén, por pantalla o por petición directa, y se rechaza sin cambiar nada.
  - **Tope de 365 días desde la entrega (D-113.1).** Cuando el préstamo se entregó el 02/11/2026 y, ya renovado una vez, el técnico intenta renovar al 03/11/2027 (entrega + 365 días + 1), entonces se rechaza con el mensaje «Pasó el máximo de un año; devuélvalo y regístrelo como asignación, o regístrelo como asignación nueva» y la fecha prevista no cambia; una renovación al 02/11/2027 (entrega + 365 días) sí se acepta: el conteo no se reinicia con cada renovación.
  - **Permiso y aviso (D-113.1).** La renovación la hace quien tiene `entregas.crear` (PS-55), sin permiso nuevo; la auditoría guarda la fecha anterior y la nueva con el motivo, y la persona que tiene el equipo recibe el aviso.
  - **Entrega definitiva.** Una entrega Definitiva no tiene fecha prevista: «Renovar» no se ofrece y, por petición directa, se rechaza.

## 11. Casos límite

1. **Entrega sin firma.** Válida: el equipo queda Asignado; el papel lo archiva la empresa.
2. **La Persona se niega a firmar.** Desde ENT-B: "Firma rechazada" con motivo de lista; el equipo sigue asignado. Las consecuencias laborales son tema legal (E-ENT-01).
3. **Devolución parcial.** Solo vuelve el celular; la laptop sigue asignada.
4. **Devuelve otra persona.** Se registra a nombre de la Persona dueña; la observación puede decirlo.
5. **Persona cesada con equipos.** Queda "Pendiente de devolución"; se devuelven con este asistente o se decide el extravío con motivo.
6. **Equipo extraviado que aparece.** Reingreso con permiso y motivo; si lo tiene la Persona, acta nueva.
7. **Accesorio de inventario no devuelto.** Queda "Faltante"; el stock no sube.
8. **Persona sin correo.** La entrega es válida; no hay aviso por correo.
9. **Equipo fijo de una sala.** Se entrega a un Custodio; la ubicación es la sala (S-ENT-03).
10. **Zona horaria.** La fecha del acta es la de la empresa; la hora exacta se guarda en hora universal.
11. **Serie corregida después** (D-017.1). El acta conserva la serie firmada.
12. **Doble clic en "Confirmar".** Se registra una vez.
13. **Celular con bloqueo de cuenta del fabricante.** La devolución puede registrarse con "bloqueo liberado: No" y queda destacado.
14. **Enviar a reparación sin devolver.** Con "Cambiar estado"; la Persona sigue responsable y el equipo vuelve a Asignado (RF-INV-024 d).

## 12. Decisiones propuestas y supuestos

| ID | Estado | Propuesta y resultado |
|---|---|---|
| S-ENT-01 | Aceptado (D-012.6, D-056.4) | Conformidad de la v1 = papel firmado; la marca en el sistema es ENT-B. |
| S-ENT-02 | **Cambiado** (D-037 fila 6) | Almacén no entrega ni devuelve por defecto. |
| S-ENT-03 | Aceptado (D-058, S-10) | "Asignado" siempre tiene una Persona; los equipos fijos van a un Custodio. |
| S-ENT-04 | Aceptado (D-058) | Traspaso como acto único. |
| S-ENT-05 | Aceptado (diseño del módulo) | Préstamo máximo de 365 días; aviso a 3 días y cada 7 tras vencer. |
| S-ENT-06 | Aceptado (diseño) | Aviso de acta sin firma a los 7 días (ENT-B). |
| S-ENT-07 | Aceptado (diseño) | Condiciones: Nuevo, Bueno, Con detalles, Dañado. |
| S-ENT-08 | Aceptado (diseño) | Accesorios: artículo del inventario o texto libre. |
| S-ENT-09 | Aceptado **sin excepción** (D-058 #8, D-043.2) | Autoentrega prohibida a todos. |
| S-ENT-10 | **Cambiado** (D-049.2) | Numeración `ACT-E-` y `ACT-D-` con 6 dígitos. |
| S-ENT-11 | [SUPUESTO] | "Pendiente de devolución" es una marca calculada (asignación abierta de una Persona Cesada), no un estado ni un campo. |
| S-ENT-12 | Aceptado (D-113) | Renovar un préstamo (RF-ENT-016) usa el permiso `entregas.crear` (PS-55): no se crea un permiso nuevo. El tope de 365 días de RN-ENT-017 se cuenta **desde la fecha de la entrega**, no desde la renovación: una renovación que pasaría de entrega + 365 días se rechaza con un mensaje claro («Pasó el máximo de un año; devuélvalo y regístrelo como asignación, o regístrelo como asignación nueva»). Cada renovación queda en la auditoría con la fecha anterior y la nueva, y avisa a la persona que tiene el equipo. Motivo: contar desde la renovación permitiría un préstamo eterno sin acta de asignación; el tope existe para obligar a una decisión. |
| E-ENT-01 | [ESCALAR AL CEO] | **Legal.** Validez del acta firmada en papel archivada por TI sin copia, y de la aceptación en pantalla; si el acta puede usarse para descontar o cobrar un equipo perdido. Hasta la opinión legal el acta dice "constancia de entrega" y no menciona cobros. Si legal exige anonimizar el nombre del acta antes de `retener_hasta` (L-05, L-12), se aplica sobre lo existente y es irreversible. |
| E-ENT-02 | [ESCALAR AL CEO] | **Dinero.** Habilitar el adjunto del acta firmada implica almacenamiento mensual (D-022). Se consulta al cierre de la Etapa 4. |
| E-ENT-03 | [ESCALAR AL CEO] | **Legal.** El texto del aviso de privacidad al pie del acta lo entrega la empresa y lo revisa legal (D-061.8). |

## 13. Fuera de alcance

- Firma manuscrita escaneada o fotografiada (D-022) y firma electrónica.
- Aceptación en pantalla en la v1 (queda para el portal, Fase 3).
- Devolución al proveedor y mercadería dañada de una compra (D-016.1).
- Cobros, descuentos o sanciones al empleado.
- Impresión de etiquetas y códigos QR; escaneo con cámara (D-021.2).
- Estado "En tránsito" (D-010).
- Entregas masivas a muchas Personas en un solo acto.
- Correos de ENT en la v1 (D-061.4).
- Depreciación del equipo entregado.

## 14. Historial de cambios

| Cambio en la v0.2 | Decisión o hallazgo que lo motiva |
|---|---|
| Módulo partido en ENT-A (v1, Etapa 4) y ENT-B (Fase 2); columna "Cuándo" y CA por requisito | D-056.4, H-AUD-08, H-AUD-21, H-QA-10 |
| Numeración `ACT-E-000001` / `ACT-D-000001`; prefijo `ACT` reservado | D-049.2-3, H-AUD-22, H-UX-16 |
| Copia del nombre y área como excepción declarada con `retener_hasta`; corregidos RN-ENT-006 y CA-ENT-14 (antes CA-ENT-13) | D-051, D-033, H-CUM-08, H-DAT-02, H-AUD-02, H-QA-05 |
| Almacén no entrega ni devuelve; extravío: Administrador, Jefatura TI y Técnico; Solo lectura imprime el PDF sin nombre ni área | D-037 filas 6 y 9, H-CUM-05, H-SEG-08, H-AUD-04 |
| Autoentrega prohibida sin excepción (CA con todas las casillas activadas) | D-043.2, D-058 #8, H-AUD-07 |
| Extravío por el diálogo "Cambiar estado"; ENT guarda solo la asignación cerrada; caso en AYU; RF-ENT-011 retirado; sin tipo "No devuelto tras el cese" | H-AUD-19, D-034, H-CUM-15, H-CUM-10 |
| Cese no bloquea: devolución desde Persona cesada, "Pendiente de devolución" no es pérdida | D-034, D-061.7, H-QA-03 |
| Regla única de estado y asignación: Asignado a Asignado solo por traspaso; devolución a reparación cierra la asignación; En reparación sin devolver con "Cambiar estado" | D-060.4-5, S-29, RF-INV-024, H-QA-03, H-DAT-04 |
| Sin correos en la v1; contenido mínimo cuando entren (código de acta, fecha, empresa) | D-061.4, H-CUM-06, H-SEG-16, H-AUD-18 |
| Un solo asistente "Entregar"; pantallas con ID `PAN-ENT`; historiales como pestañas; bandeja dentro de "Mi trabajo" | D-053, H-UX-13, H-UX-14, H-UX-05 |
| Alta rápida de Persona solo Técnico y Administrador | D-037 fila 8, DS-10 |
| PDF seguro y prueba con texto malicioso; PDF por rol | D-063.1, H-SEG-19, H-SEG-08 |
| "Vencido" del préstamo calculado al leer; proceso diario declarado (idempotente, recuperable, por empresa) | D-062.2, D-038.4, H-QA-12 |
| Circunstancias del extravío: validador común, visibles con `datos_personales.ver`, redactables | D-061.5, D-063.2, H-CUM-10 |
| Aislamiento probado por identificador interno y por número de acta repetido en otra empresa | D-063.6, H-SEG-25f |
| Permisos migrados a PS-nn; `datos.exportar` único; cita RN-ENT-016 corregida | D-036, registro de permisos, H-AUD-24 |
| Datos personales del módulo declarados; aviso de privacidad configurable por empresa | D-061.3, D-061.8, H-CUM-09, H-CUM-12 |
| v0.3: `entregas.imprimir_acta` con "-" para Empleado (portal) y Solicitante (sus actas, por PS-205); RN-ENT-021 confirmada con S-36 (cierre de la asignación + 5 años, provisional) | D-065, D-075, plan de aplicación |
| RN-ENT-021 y fila de datos personales: el plazo de 5 años corre desde el cierre de la asignación, no "mientras exista el activo"; `retener_hasta` vacía mientras la asignación está abierta | D-033, D-051, S-36 del núcleo (RF-DAT-006), ronda 3 del Auditor Técnico |
| v0.4 (2026-10-29): S-ENT-12 pasa a Aceptado: renovar usa `entregas.crear`, los 365 días corren desde la fecha de la entrega y no se reinician con cada renovación; mensaje de rechazo, auditoría con fecha anterior y nueva, aviso a quien tiene el equipo; RF-ENT-016, RN-ENT-017 y CA-ENT-17 lo recogen | D-113.1 |
