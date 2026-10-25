# Módulo: Portal de autoservicio (POR)

**Versión:** 0.1 (borrador del Analista de Negocio, Oleada B, Escuadrón D)
**Sigla de requisitos:** POR
**Fuente de verdad:** `docs/documento-funcional.md` y `docs/equipo/decisiones.md`. Aplican D-001 y D-002 (acceso solo por invitación), D-004 (alcance "propio"), D-006 (Persona distinta de Usuario), D-021.5 (otra empresa = "no encontrado"), D-024 (datos personales).
**Marcas:** **[SUPUESTO]** = propuesta mía que confirma el Gerente de TI. **[ESCALAR AL CEO]** = solo dinero, tema legal o algo irreversible.

---

## 1. Propósito, alcance y fase

**Propósito.** Que un empleado vea por sí mismo qué equipos, líneas y licencias tiene a su nombre y pueda pedir ayuda a TI sin llamar ni escribir correos: reportar un problema, avisar de un extravío, solicitar un equipo, pedir una devolución y consultar sus propios datos. Reduce las consultas "¿qué laptop tengo?" y mejora la información que TI recibe.

**Fase.** **Después de la versión 1.** Depende de Personas y vínculo con Usuarios (Etapa 2), de actas (Etapa 4) y de la mesa de ayuda (módulo AYU). "Confirmar recepción" es una aceptación en pantalla y D-023.2 la deja fuera de la versión 1; se especifica aquí para la fase posterior del portal.

**Entra**
1. Invitación de Personas al portal y vínculo Persona-Usuario al aceptar.
2. Inicio con resumen: mis equipos, líneas, licencias, casos y pendientes.
3. Detalle de mis equipos y mis actas (con PDF reimprimible).
4. Puerta hacia la mesa de ayuda: reportar problema, reportar extravío o robo, solicitar equipo, pedir devolución, pedir mis datos personales.
5. Confirmar recepción de un equipo (fase posterior).
6. Reglas de lo que la Persona ve y de lo que nunca ve.

**No entra:** ver sección 13. El portal **no tiene casos propios**: los casos y su flujo viven en AYU; el portal solo es la puerta y la vista de lo propio (acordado con el Escuadrón C).

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Portal** | Parte de la plataforma que ve cada empleado, limitada a lo que le pertenece. |
| **Alcance "propio"** | Regla del servidor: cada consulta se limita a la Persona vinculada al Usuario que entró (D-004.3). |
| **Empleado (portal)** | Plantilla de rol con solo permisos propios (propuesta S-PER-01). |
| **Vínculo** | Unión entre una Persona y un Usuario (módulo PER). En el portal nace al aceptar la invitación. |
| **Caso** | Solicitud o problema registrado en la mesa de ayuda (módulo AYU). |
| **Servicio semilla** | Tipo de caso que la plataforma trae de fábrica y la empresa solo puede desactivar, no borrar. |
| **Acuse de recepción** | Confirmación en pantalla de que la Persona recibió un equipo (fase posterior). No es firma. |
| **Equipo solicitable** | Categoría de artículo que la empresa permite pedir desde el portal (por ejemplo, Mouse, Teclado, Laptop). |

## 3. Roles y permisos

| Acción | Permiso | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura | Empleado (portal) |
|---|---|---|---|---|---|---|---|---|
| Entrar al portal (si hay Persona vinculada) | `portal.acceder` | Propio | Propio | Propio | Propio | Propio | Propio | Propio |
| Ver mis equipos, líneas, licencias y actas | `portal.ver_propio` | Propio | Propio | Propio | Propio | Propio | Propio | Propio |
| Abrir casos (problema, extravío, solicitar equipo, devolución) | `portal.solicitar` | Propio | Propio | Propio | Propio | Propio | No | Propio |
| Pedir mis datos personales | `portal.pedir_datos` | Propio | Propio | Propio | Propio | Propio | Propio | Propio |
| Confirmar recepción (fase posterior) | `portal.confirmar_recepcion` | Propio | Propio | Propio | Propio | Propio | No | Propio |
| Invitar Personas al portal | `portal.invitar`* | Sí | No | No | No | No | No | No |
| Configurar el portal (secciones, equipos solicitables, texto) | `portal.configurar` | Sí | No | No | No | No | No | No |

Notas:
- Todos los roles ven su portal porque un técnico también es una Persona con laptop. Solo se ve **lo propio**, nunca lo de otros, aunque el rol tenga permisos amplios en el resto de la plataforma.
- `portal.invitar`* es sensible: envía correos y concede acceso. No se puede invitar con un rol que tenga más permisos que el invitador (D-002.3).
- "Solo lectura" ve lo suyo pero no abre casos (es un rol de consulta).
- La plantilla "Empleado (portal)" es propuesta del módulo PER; el núcleo la acepta como [SUPUESTO S-27] pendiente del Gerente de TI.
- Los permisos se comprueban en el servidor. Ocultar un botón no basta (regla 6 de CLAUDE.md).

## 4. Requisitos

### 4.1 Requisitos funcionales

| ID | Requisito | Fase |
|---|---|---|
| RF-POR-001 | Pantalla de inicio con resumen: cantidad de equipos, líneas y licencias; casos abiertos; pendientes (préstamo por vencer, acta sin firma, recepción por confirmar). | Posterior |
| RF-POR-002 | "Mis equipos": lista y detalle de los activos asignados a la Persona con los datos de la tabla 4.4. | Posterior |
| RF-POR-003 | "Mis líneas": líneas móviles a su nombre (número, operador, equipo asociado). Sin costos. | Posterior |
| RF-POR-004 | "Mis licencias": productos de software asignados a su nombre. Nunca claves. Solo si el módulo de licencias asigna puestos a Personas (S-POR-04). | Posterior |
| RF-POR-005 | "Mis actas": lista y PDF reimprimible de sus actas de entrega y devolución. | Posterior |
| RF-POR-006 | "Mis casos": lista y detalle de sus casos de la mesa de ayuda, con solo comentarios públicos. Abre las pantallas AYU-01, AYU-02 y AYU-14. | Posterior |
| RF-POR-007 | Reportar un problema con un equipo propio: elegir el equipo de su lista, describir y enviar. Crea un caso. | Posterior |
| RF-POR-008 | Reportar extravío o robo de un equipo propio. Crea un caso urgente y avisa a TI; no cambia el estado del equipo (RN-POR-008). | Posterior |
| RF-POR-009 | Solicitar un equipo o accesorio: elegir una categoría solicitable, motivo, urgencia y fecha deseada. Crea un caso del servicio "Solicitar equipo". **No crea una orden de compra.** | Posterior |
| RF-POR-010 | Pedir devolver o cambiar un equipo propio ("ya no lo uso", "se me malogró"). Crea un caso. | Posterior |
| RF-POR-011 | "Mis datos": ver los datos propios que guarda la plataforma (nombre, correo, área, sede, jefe directo, equipos) y pedir copia, corrección o eliminación. Crea un caso en una cola restringida al Administrador (D-024.6). | Posterior |
| RF-POR-012 | Confirmar recepción de un equipo recién entregado ("Lo recibí" o "Tengo un reparo", con texto). Registra fecha, hora y Usuario. | Fase posterior del portal |
| RF-POR-013 | Invitar Personas al portal desde la ficha de la Persona o desde una selección en la lista (invitación masiva). La invitación va al correo de la Persona. | Posterior |
| RF-POR-014 | Al aceptar la invitación, el vínculo Persona-Usuario se crea solo y la Persona entra con rol "Empleado (portal)". | Posterior |
| RF-POR-015 | Configuración: activar o desactivar secciones (líneas, licencias), elegir las categorías solicitables y un texto de bienvenida de hasta 500 caracteres. | Posterior |
| RF-POR-016 | Buscador de artículos de ayuda de la mesa de ayuda (base de conocimiento) desde el inicio. | Posterior |
| RF-POR-017 | Primer ingreso: pantalla de aceptación del aviso de privacidad con versión y fecha registradas (D-024.7). | Posterior |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-POR-001 | El portal solo muestra datos de la Persona vinculada al Usuario que entró. El servidor filtra por Persona y por empresa en cada consulta. |
| RN-POR-002 | Un identificador de equipo, acta, caso o Persona que no sea del usuario responde "no encontrado", igual que uno inexistente. Nunca "no tienes permiso", que revelaría que existe. |
| RN-POR-003 | Un Usuario sin Persona vinculada ve una pantalla que dice "Tu cuenta aún no está vinculada a una Persona. Pide a TI que te vincule." y nada más. |
| RN-POR-004 | Si la Persona está Cesada, el acceso al portal se suspende al instante (RN-PER-011). |
| RN-POR-005 | La invitación al portal sigue las reglas de D-002.3: vence a los 7 días, sirve una vez, queda ligada al correo y se puede cancelar. Lleva la Persona elegida. |
| RN-POR-006 | Solo se invita a una Persona Activa que tenga correo. Si no tiene correo, primero se edita la Persona. |
| RN-POR-007 | El vínculo creado por invitación exige que el correo verificado del que acepta sea el de la invitación. No se vincula nunca por coincidencia de nombre. |
| RN-POR-008 | Reportar un extravío desde el portal abre un caso y avisa a TI. El estado del activo cambia solo cuando TI lo confirma en ENT. |
| RN-POR-009 | "Solicitar equipo" crea un caso. Convertirlo en compra, entrega desde stock o rechazo lo decide TI con las reglas de los módulos de compras y entregas. |
| RN-POR-010 | Solo se pueden elegir para reportes y devoluciones equipos que estén asignados a esa Persona. |
| RN-POR-011 | **Nunca** se muestran al empleado: precios y costos de compra, proveedor, orden de compra de origen, claves de licencia (ni enmascaradas), datos de otras Personas, notas internas de técnicos, comentarios internos de casos, auditoría, stock, ni campos que la empresa no marcó como visibles. |
| RN-POR-012 | Un equipo asignado a varias Personas no existe (RN-ENT-003). Un equipo compartido pertenece a un Custodio; solo el Custodio lo ve en su portal. |
| RN-POR-013 | El empleado ve solo los comentarios marcados como públicos en sus casos. |
| RN-POR-014 | Confirmar recepción es un acuse informativo, no reemplaza la firma en papel del acta ni tiene el valor legal de una firma (fase posterior, E-POR-02). |
| RN-POR-015 | Un acuse registrado no se edita ni se borra. Una corrección se hace con un acuse nuevo. |
| RN-POR-016 | Las invitaciones masivas tienen un tope de 200 por día y por empresa (S-POR-06). |
| RN-POR-017 | Todo dato lleva la empresa. Si el Usuario pertenece a dos empresas, el portal muestra solo la empresa activa y su Persona en ella. |
| RN-POR-018 | El portal no permite modificar datos de equipos, Personas ni estados. Toda acción del empleado se convierte en un caso o en un acuse. |
| RN-POR-019 | Un mensaje de error del portal no contiene datos de otra Persona ni detalles internos (D-021.7). |

### 4.3 Requisitos de calidad

| ID | Requisito medible |
|---|---|
| RNF-POR-001 | La pantalla de inicio carga en menos de 2 segundos (p95) con 4G y una Persona con 20 equipos. |
| RNF-POR-002 | Todo el portal es utilizable en pantalla de 360 px de ancho, con teclado y con lector de pantalla; cumple contraste AA; el estado se indica con texto además del color (D-021.1). |
| RNF-POR-003 | Prueba automática de 100 intentos de pedir equipos, actas y casos de otra Persona por identificador: 100 respuestas "no encontrado" y 0 datos filtrados. |
| RNF-POR-004 | Una invitación masiva de 200 Personas termina en menos de 60 segundos y cada fallo de envío se informa. |
| RNF-POR-005 | El 100 % de invitaciones, vínculos, acuses y cambios de configuración queda en la auditoría en la misma operación (D-018.2). |
| RNF-POR-006 | Un empleado completa "reportar problema" en 3 pasos o menos y menos de 90 segundos. |
| RNF-POR-007 | Cada tabla nueva del módulo tiene prueba de aislamiento entre empresas (D-025). |
| RNF-POR-008 | La respuesta de cada endpoint del portal incluye únicamente los campos de la tabla 4.4; una prueba compara los campos devueltos con esa lista. |

### 4.4 Qué ve la Persona y qué nunca

| Dato | La Persona lo ve |
|---|---|
| Artículo, marca, modelo, categoría del equipo | Sí |
| Número de serie y, si el equipo es celular, IMEI y número de línea | Sí (son de su equipo) |
| Fecha de entrega, condición al entregar, accesorios, fecha de devolución prevista | Sí |
| Estado del equipo (Asignado, En reparación) | Sí |
| Ubicación del equipo (sede, piso, sala) | Sí |
| Fecha de fin de garantía | Sí |
| Sus actas en PDF | Sí |
| Su nombre, correo, área, sede y su propio jefe directo (solo el nombre del jefe) | Sí |
| Número y operador de su línea; producto de su licencia | Sí |
| Precio, costo, proveedor, orden de compra, fecha de compra | **Nunca** |
| Clave de licencia (ni enmascarada), contraseñas | **Nunca** |
| Datos de otras Personas, compañeros, subordinados, quién tuvo antes el equipo | **Nunca** |
| Notas internas, comentarios internos, nombre del técnico que hizo el análisis | **Nunca** |
| Auditoría, stock, órdenes de compra y de servicio, reportes, otras empresas | **Nunca** |

## 5. Estados y transiciones

**Acceso de una Persona al portal** (se calcula, no se edita)

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| Sin acceso | Invitada | `portal.invitar` | Persona Activa con correo |
| Invitada | Con acceso | La Persona | Acepta antes de 7 días; correo verificado |
| Invitada | Sin acceso | Administrador o vencimiento | Invitación cancelada o vencida |
| Con acceso | Suspendida | Sistema | Persona Cesada o membresía suspendida |
| Suspendida | Con acceso | Administrador | Persona reactivada y membresía reactivada a mano |

**Acuse de recepción** (fase posterior)

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| Pendiente | Confirmada | La Persona | Acta de entrega Registrada a su nombre |
| Pendiente | Con reparo | La Persona | Texto del reparo; avisa a TI |
| Con reparo | Confirmada | La Persona | Después de que TI resolvió |

Los **casos** (estados, transiciones y responsables) los define AYU. El portal los muestra tal cual, con textos simples para el empleado.

## 6. Datos

**Configuración del portal.** Empresa; sección Líneas visible (sí/no); sección Licencias visible (sí/no); categorías solicitables (lista de categorías); texto de bienvenida (hasta 500 caracteres); quién y cuándo lo cambió.

**Invitación al portal.** Es la invitación del núcleo (D-002.3) con una referencia a la Persona invitada. Estados: Pendiente, Aceptada, Vencida, Cancelada.

**Acuse de recepción (fase posterior).** Empresa; acta de entrega; Persona; Usuario; resultado (Confirmada, Con reparo); texto del reparo; versión del texto mostrado; fecha y hora; desde dónde (IP, si se puede). Único por acta y resultado; no se edita.

**Qué se audita (D-018.4):** invitaciones (enviadas, aceptadas, canceladas), vínculos creados, cambios de configuración, acuses, pedidos de datos personales (el hecho, no el contenido). No se guardan en la auditoría los textos de los reportes del empleado: viven en el caso de AYU.

## 7. Pantallas necesarias

| Pantalla | Propósito | Rol principal |
|---|---|---|
| Inicio del portal | Resumen y pendientes | Empleado |
| Mis equipos y detalle | Ver lo asignado | Empleado |
| Mis líneas y licencias | Ver lo asignado | Empleado |
| Mis actas | Ver y reimprimir | Empleado |
| Mis casos | Ver y seguir (abre AYU-01, AYU-02, AYU-14) | Empleado |
| Reportar problema o extravío | Formularios cortos prellenados | Empleado |
| Solicitar equipo | Elegir categoría y motivo | Empleado |
| Mis datos | Ver datos propios y pedir copia, corrección o eliminación | Empleado |
| Confirmar recepción | "Lo recibí" o "Tengo un reparo" (fase posterior) | Empleado |
| Invitar al portal | Elegir Personas y enviar | Administrador |
| Configuración del portal | Secciones, equipos solicitables, bienvenida | Administrador |
| Aceptación del aviso de privacidad | Primer ingreso | Empleado |

## 8. Notificaciones y automatismos

| Cuándo | A quién | Qué dice |
|---|---|---|
| Se envía la invitación | Correo de la Persona | "[Empresa] te invita a su portal de TI para que veas tus equipos y pidas ayuda. El enlace vence en 7 días." |
| Falta 2 días para vencer una invitación | Quien invitó | "N invitaciones vencen en 2 días." |
| Se acepta la invitación | Quien invitó | "[P-0042] ya tiene acceso al portal." |
| El empleado envía un caso | El empleado | Confirmación y número del caso (la envía AYU). |
| El empleado reporta un extravío | Técnicos y Jefatura TI | "[P-0042] reportó extravío de [artículo]." (la envía ENT). |
| Pedido de datos personales | Administrador | "Hay un pedido de [copia, corrección o eliminación] de [P-0042]." (la envía AYU). |
| Equipo entregado (fase posterior) | Persona con acceso | "Recibiste [artículo]. Confírmalo en el portal." |
| Reparo en un acuse | Técnico que entregó | "[P-0042] tiene un reparo sobre [artículo]: [texto]." |

Los avisos a Personas sin Usuario los define cada módulo (ENT, ONB). El portal no envía avisos a quien no tiene acceso.

## 9. Integración con el núcleo y con otros módulos

- **Núcleo.** Invitaciones y ciclo de vida del Usuario (D-002), roles y alcance "propio" (D-004), auditoría, aviso de privacidad (D-024.7).
- **PER.** Vínculo Persona-Usuario (RN-PER-017) y suspensión al cesar (RN-PER-011).
- **ENT.** Equipos asignados, actas, extravíos y acuse de recepción; el portal solo lee y abre casos.
- **Mesa de ayuda (AYU).** Servicios semilla acordados con el Escuadrón C: "Reportar problema", "Reportar extravío", "Solicitar equipo" y "Pedir mis datos personales". La empresa puede desactivarlos, no borrarlos. El último va a una cola restringida al Administrador.
- **Licencias y líneas móviles.** Aportan las asignaciones a la Persona (si las hay).
- **Notificaciones.** Entrega de todos los avisos.
- **Compras (Etapa 5).** Un caso "Solicitar equipo" puede dar origen a una orden de compra, creada por TI con sus aprobaciones; el portal no compra.
- **ONB.** El portal no muestra procesos de ingreso o salida.

## 10. Criterios de aceptación

- **CA-POR-01.** Dada Ana con 2 equipos asignados y Luis con 1, cuando Ana entra al portal, entonces ve exactamente sus 2 equipos y ninguno de Luis.
- **CA-POR-02 (aislamiento).** Dado un equipo de la empresa A, cuando un empleado de la empresa B pide su detalle por identificador, entonces responde "no encontrado" y no hay diferencia con un identificador inexistente.
- **CA-POR-03 (permiso denegado).** Dado un Usuario con rol "Empleado (portal)", cuando llama directamente al servidor para listar todos los activos, crear una orden de compra o ver la auditoría, entonces se rechaza y no cambia nada.
- **CA-POR-04.** Dado un equipo con precio y proveedor, cuando su Persona abre el detalle, entonces la respuesta no contiene precio, proveedor ni orden de compra (RNF-POR-008).
- **CA-POR-05.** Dado un Usuario con una licencia asignada, cuando abre "Mis licencias", entonces ve el nombre del producto y nunca la clave, ni enmascarada.
- **CA-POR-06.** Dada la Persona Ana con correo `ana@x.com` y Activa, cuando el administrador la invita y ella acepta con ese correo, entonces queda vinculada, con rol Empleado (portal), y la invitación no sirve una segunda vez.
- **CA-POR-07.** Dada una invitación a `ana@x.com` abierta con la cuenta `otra@y.com`, cuando se intenta aceptar, entonces se rechaza y no se crea vínculo.
- **CA-POR-08.** Dada una Persona que se cesa, cuando intenta entrar al portal con una sesión abierta, entonces la sesión termina al instante y no ve nada.
- **CA-POR-09.** Dado un empleado que solicita un "Teclado", cuando envía el formulario, entonces se crea un caso del servicio "Solicitar equipo" y no se crea ninguna orden de compra.
- **CA-POR-10.** Dado un empleado que reporta robo de su celular, cuando envía el reporte, entonces se crea un caso urgente, TI recibe el aviso y el celular sigue "Asignado" hasta que un técnico lo confirme.
- **CA-POR-11.** Dado un empleado con un Usuario sin Persona vinculada, cuando entra al portal, entonces ve el mensaje de cuenta no vinculada y ningún dato.
- **CA-POR-12.** Dado el pedido "Eliminar mis datos" de un empleado, cuando lo envía, entonces el caso solo lo ve el Administrador (y el empleado en "Mis casos") y no lo ven técnicos ni Jefatura TI.
- **CA-POR-13 (fase posterior).** Dada un acta de entrega Registrada, cuando la Persona pulsa "Lo recibí", entonces se guarda fecha, hora y Usuario, el acta sigue pendiente de firma en papel y el acuse no se puede editar.

## 11. Casos límite

1. **Correo de la invitación llega a otra persona.** La invitación está ligada al correo; para usarla hay que verificar ese correo. El administrador puede cancelarla.
2. **Usuario en dos empresas.** Cambia de empresa activa y ve otra Persona y otros equipos, sin arrastrar datos en pantalla (D-025).
3. **Persona sin correo.** No se puede invitar. TI sigue operando sus entregas.
4. **Persona con 60 equipos (custodio).** La lista pagina y permite buscar.
5. **Equipo en reparación.** Se sigue viendo con ese estado; el empleado puede reportar nuevo problema sobre otro equipo.
6. **El empleado cambia de área.** El portal muestra el área nueva; las actas conservan la copia antigua.
7. **El jefe pide ver los equipos de su gente.** No está en el portal inicial (S-POR-07); lo hace TI.
8. **Un técnico quiere ver el portal de otra Persona "como ella".** No existe suplantación.
9. **Se desactiva "Solicitar equipo".** Desaparece del portal; los casos ya abiertos siguen.
10. **Empleado reporta extravío de un equipo que no tiene.** No puede elegirlo: solo ve los suyos.
11. **La invitación vence sin aceptarse.** Se puede reenviar una nueva; la anterior queda Vencida.
12. **Restaurar un respaldo antiguo.** Las Personas anonimizadas pierden el acceso al portal (el Usuario se desvincula en la anonimización).

## 12. Decisiones propuestas y supuestos

| ID | Tipo | Propuesta y motivo |
|---|---|---|
| S-POR-01 | [SUPUESTO] | El portal va después de la versión 1. Motivo: D-023.1 no lo incluye y depende de la mesa de ayuda. |
| S-POR-02 | [SUPUESTO] | Es la misma plataforma con alcance "propio", no una aplicación aparte. Lo confirma el Arquitecto. |
| S-POR-03 | [SUPUESTO] | "Solicitar equipo" crea un caso de la mesa de ayuda, no una orden de compra. Motivo: el empleado no compra; TI decide si sale de stock o se compra. |
| S-POR-04 | [SUPUESTO] | "Mis licencias" se muestra solo cuando el módulo de licencias asigna puestos a Personas (lo define LIC); si una empresa no los asigna, la sección queda vacía y se puede ocultar. |
| S-POR-05 | [SUPUESTO] | Confirmar recepción es un acuse informativo y convive con el acta en papel. No es firma. |
| S-POR-06 | [SUPUESTO] | Tope de 200 invitaciones por día y por empresa. Motivo: control de costo de correo y abuso. Lo ajusta DevOps. |
| S-POR-07 | [SUPUESTO] | El jefe directo no ve a su equipo en el portal inicial. Motivo: mostraría datos personales de terceros; se evalúa después. |
| S-POR-08 | [SUPUESTO] | La plantilla "Empleado (portal)" (S-27 del núcleo) es el rol por defecto de las invitaciones. |
| S-POR-09 | [SUPUESTO] | El campo "visible para el empleado" por campo personalizado no existe en la versión inicial: el portal muestra solo el conjunto fijo de la tabla 4.4. |
| E-POR-01 | [ESCALAR AL CEO] | **Dinero.** Invitar a cientos de empleados y enviar avisos multiplica el uso del servicio de correo (escalado "Dinero", punto 1 de decisiones.md). DevOps debe dar el costo según el número de empleados antes de activar el portal. |
| E-POR-02 | [ESCALAR AL CEO] | **Legal.** (a) Qué valor tiene el acuse en pantalla; (b) texto del aviso de privacidad para empleados y canal de derechos de acceso, corrección y eliminación (D-024.6); (c) si hay que informar a cada empleado antes de guardar sus datos. Se pide opinión legal; hasta entonces el acuse es solo informativo. |

## 13. Fuera de alcance

- Vista del jefe directo sobre los equipos de su gente.
- Compras, aprobaciones de compra o precios desde el portal.
- Aprobación de solicitudes por el jefe directo (la define AYU si hace falta).
- Aplicación móvil nativa (queda fuera, documento v0.1 §2).
- Inicio de sesión con Google o Microsoft (D-002).
- Autoservicio de licencias (instalar, pedir clave).
- Firma manuscrita o electrónica del acta (ENT, D-022).
- Chat en vivo, encuestas de satisfacción y base de conocimiento propia (viven en AYU).
- Ver o descargar facturas, garantías completas o documentos de compra.
