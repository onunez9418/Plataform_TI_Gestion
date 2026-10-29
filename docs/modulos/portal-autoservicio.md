# Módulo: Portal de autoservicio (POR)

**Versión:** 0.4 (aplicación de D-065 a D-076; Oleada D, Escuadrón D; D-082 y D-083 para el Asistente de IA)
**Sigla de requisitos:** POR
**Fuente de verdad:** `docs/documento-funcional.md` y `docs/equipo/decisiones.md`. Aplican D-001 y D-002 (acceso por invitación), D-036 y D-037 (permisos y plantilla "Empleado (portal)"), D-039.8 (aislamiento entre Personas), D-053 (Pedir ayuda, tono), D-054 (topes), D-058 (supuestos), D-061.2 (derechos), D-063.5.
**Marcas:** **[SUPUESTO]** = propuesta mía que confirma el Gerente de TI. **[ESCALAR AL CEO]** = solo dinero, tema legal o algo irreversible. "Cuándo": `Fase 3, ola D` (D-056.3).

---

## 1. Propósito, alcance y fase

**Propósito.** Que un empleado vea por sí mismo qué equipos, líneas y licencias tiene a su nombre y pueda pedir ayuda a TI sin llamar ni escribir correos: reportar un problema o un extravío, solicitar un equipo, pedir una devolución y consultar sus datos. En todo el módulo se trata al empleado de "usted".

**Cuándo.** **Fase 3, ola D** (después de la mesa de ayuda; D-056). **En la v1 no hay portal**: las columnas "Empleado (portal)" del registro de permisos son informativas (D-037 fila 11). Depende de AYU, ENT y Personas. La aceptación en pantalla ("confirmar recepción") es de esta fase y queda fuera de la v1 (D-023.2).

**Entra:** invitación de Personas al portal y vínculo Persona-membresía (y, solo si la empresa lo habilita, el acceso al Asistente de IA, D-083); **Mi espacio** (equipos, líneas, licencias, actas, casos, pendientes); el botón **"Pedir ayuda"** que abre el catálogo de la mesa de ayuda; "Mis datos y derechos"; confirmar recepción; reglas de lo que la Persona ve y nunca ve.
**No entra:** ver sección 13. El portal **no tiene casos propios**: los casos y su flujo viven en AYU; el portal es la puerta y la vista de lo propio.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Portal** | Parte de la misma plataforma que ve cada empleado, limitada a lo que le pertenece (S-POR-02). |
| **Alcance "propio"** | Regla del servidor: cada consulta se limita a la Persona vinculada a la membresía que entró (D-036.4). |
| **Empleado (portal)** | Séptima plantilla de rol, de **lista cerrada** (ver sección 3). |
| **Vínculo** | Unión 1 a 1 entre una Persona y una membresía de la misma empresa (PRS). Nace al aceptar la invitación. |
| **Caso** | Solicitud o problema registrado en la mesa de ayuda (AYU). |
| **Servicio semilla** | Tipo de caso que la plataforma trae y la empresa solo puede desactivar: Reportar problema, Reportar extravío, Solicitar equipo, Pedir mis datos personales. |
| **Acuse de recepción** | Confirmación en pantalla de que la Persona recibió un equipo. Informativa, no es firma. |
| **Mi espacio** | Página con pestañas (equipos, líneas, licencias, actas, casos, pendientes), principal del portal (DS-07). |
| **Pedir ayuda** | Botón único que abre el catálogo de casos (DS-01); sigue siendo el único camino para crear un caso. El «Asistente de IA» (módulo `asistente-ia`) es **otro control**, con otro nombre e icono, abajo a la derecha (D-082). |

## 3. Roles y permisos

Solo nombres del registro `docs/registro-permisos.md`. Todo se comprueba en el servidor. Como en la v1 no hay portal, la columna "Empleado (portal)" es informativa hasta la Fase 3.

| Acción | PS | Permiso | Empleado (portal) | Otros roles |
|---|---|---|---|---|
| Entrar al portal (con Persona vinculada) | PS-204 | `portal.acceder` | Propio | No: usan la plataforma completa |
| Ver mis equipos, líneas, licencias, actas y casos (nunca el nombre del jefe) | PS-205 | `portal.ver_propio` | Propio | No |
| Solicitar equipo o servicio (crea un caso) | PS-206 | `portal.solicitar` | Propio | No |
| Pedir mis datos (entrada en el registro de derechos) | PS-207 | `portal.pedir_datos` | Propio | No |
| Confirmar recepción (Fase 3) | PS-208 | `portal.confirmar_recepcion` | Propio | No |
| Invitar Personas al portal | PS-209 | `portal.invitar` | No | Administrador |
| Configurar el portal | PS-210 | `portal.configurar` | No | Administrador |

**Lista cerrada de la plantilla "Empleado (portal)"** (todo lo demás denegado, D-037 fila 11): PS-204 a PS-208; `personas.ver` PS-24 (propio); `ayuda.caso_crear` PS-138, `ayuda.caso_ver` PS-139, `ayuda.caso_comentar_publico` PS-141, `ayuda.caso_cancelar` PS-149, `ayuda.caso_reabrir` PS-150 y `ayuda.encuesta_responder` PS-155 (todos propio); `ayuda.catalogo_ver` PS-158 y `ayuda.conocimiento_ver` PS-162; `notificaciones.bandeja_usar` PS-211 y `notificaciones.preferencias_propias` PS-212 (propio); y, **desde la Fase 3, ola G (D-083, completa D-037 fila 11)**, `asistente.usar` PS-235 y `asistente.preparar_borradores` PS-236 (alcance «todo»: son compuertas que no dan datos), **apagados por defecto**: el Administrador debe incluir al rol Empleado en «roles que lo usan» (PS-238) o el asistente no aparece en el portal. Nunca PS-237 ni PS-238 a PS-240.

Notas:
- El resto de los roles (Técnico, Jefatura, etc.) ven sus propios equipos como cualquier Persona vinculada con "Mi espacio" desde el menú de usuario (DS-07); no usan los permisos `portal.*`.
- Tiene "ver lo propio" sin `datos_personales.ver`: ve sus datos porque son los suyos; nunca los de otra Persona.
- Quien invita no puede dar un rol con más permisos que el suyo (D-002.3). `portal.invitar` lleva control de tope por hora.
- Un Usuario con alcance "propio" y **sin Persona vinculada** ve una lista vacía, nunca un error (D-036.4).

## 4. Requisitos

Los RN y RNF rigen desde el "Cuándo" del requisito que protegen (`Fase 3`).

### 4.1 Requisitos funcionales

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-POR-001 | **Mi espacio**: resumen y pestañas Equipos, Líneas, Licencias, Actas, Casos y Pendientes (préstamo por vencer, recepción por confirmar). | Fase 3 | CA-POR-01 |
| RF-POR-002 | Equipos: lista y detalle de los activos asignados a la Persona con los datos de la tabla 4.4. | Fase 3 | CA-POR-01, 05 |
| RF-POR-003 | Líneas: líneas móviles a su nombre (número, operador, equipo asociado), sin costos. Con LIN activo vienen de ese módulo; sin LIN, el número es el campo de la unidad del celular (D-042). | Fase 3 | CA-POR-01 |
| RF-POR-004 | Licencias: productos de software asignados a su nombre; nunca claves. Solo si el módulo de licencias asigna puestos a Personas (S-POR-04). | Fase 3 | CA-POR-06 |
| RF-POR-005 | Actas: lista y PDF reimprimible de sus actas de entrega y devolución. | Fase 3 | CA-POR-01 |
| RF-POR-006 | Casos: lista y detalle de sus casos de AYU, solo con comentarios públicos. Abre PAN-AYU-01, PAN-AYU-02 y PAN-AYU-14. | Fase 3 | CA-POR-04 |
| RF-POR-007 | Botón **"Pedir ayuda"**: abre el catálogo de casos de AYU. "Reportar un problema" se prellena con el equipo elegido de su lista. | Fase 3 | CA-POR-04 |
| RF-POR-008 | Reportar extravío o robo de un equipo propio: crea un caso urgente en AYU y avisa a TI; **no cambia el estado del equipo**. | Fase 3 | CA-POR-11 |
| RF-POR-009 | Solicitar un equipo o accesorio: categoría solicitable, motivo, urgencia y fecha deseada. Crea un caso del servicio "Solicitar equipo", **no una orden de compra**. | Fase 3 | CA-POR-10 |
| RF-POR-010 | Pedir devolver o cambiar un equipo propio. Crea un caso. | Fase 3 | CA-POR-10 |
| RF-POR-011 | **Mis datos y derechos**: ver los datos propios (nombre, correo, área, sede; **sin el nombre del jefe**) y pedir copia, corrección o eliminación. El pedido entra al registro de solicitudes de derechos de PRS (PS-29); AYU guarda solo un caso restringido con la referencia. La Persona ve el estado de **su** pedido. | Fase 3 | CA-POR-12 |
| RF-POR-012 | Confirmar recepción de un equipo entregado: "Lo recibí" o "Tengo un reparo" (texto). Registra fecha, hora y membresía. Acuse informativo (ENT-B). | Fase 3 | CA-POR-14 |
| RF-POR-013 | Invitar Personas al portal desde el directorio de Personas, **por persona**: cada resultado se informa y un error no frena al resto. | Fase 3 | CA-POR-07, 16 |
| RF-POR-014 | Al aceptar la invitación, el vínculo Persona-membresía se crea solo y la Persona entra con la plantilla "Empleado (portal)". | Fase 3 | CA-POR-07, 08 |
| RF-POR-015 | Configuración: activar o desactivar secciones (Líneas, Licencias), elegir las categorías solicitables y un texto de bienvenida de hasta 500 caracteres. | Fase 3 | CA-POR-10 |
| RF-POR-016 | Buscador de artículos de ayuda de AYU desde Mi espacio. | Fase 3 | CA-POR-04 |
| RF-POR-017 | Primer ingreso: aceptación del aviso de privacidad de la empresa; se vuelve a pedir cuando cambia la versión, con versión y fecha registradas (D-061.8). | Fase 3 | CA-POR-07 |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-POR-001 | El portal solo muestra datos de la Persona vinculada. Usa **consultas dedicadas que reciben la Persona de la sesión**, no los listados generales (D-039.8). |
| RN-POR-002 | Un identificador de equipo, acta, caso o Persona que no sea del usuario responde "no encontrado", sea de otra empresa **o de otra Persona de la misma empresa**. Nunca "no tiene permiso" (D-053). |
| RN-POR-003 | Un Usuario sin Persona vinculada ve "Su cuenta aún no está vinculada a una Persona. Pida a TI que la vincule." y nada más. |
| RN-POR-004 | Si la Persona cesa, su membresía queda suspendida y el acceso termina al instante (RN-PRS-011). |
| RN-POR-005 | La invitación sigue D-002.3 y D-054.4: texto fijo sin campos libres, vence a los 7 días, un solo uso, ligada al correo, cancelable; **nunca dice si el correo ya tiene cuenta**; la empresa se suma a la cuenta solo cuando la persona abre y acepta, y se le avisa que se le sumó una empresa. |
| RN-POR-006 | Solo se invita a una Persona Activa que tenga correo. Sin correo, primero se edita la Persona. |
| RN-POR-007 | El vínculo exige que el correo verificado de quien acepta sea el de la invitación; nunca se vincula por nombre. |
| RN-POR-008 | Reportar un extravío abre un caso; el estado del activo cambia solo cuando TI lo confirma con "Cambiar estado". ENT no duplica el reporte. |
| RN-POR-009 | "Solicitar equipo" crea un caso. **TI decide** si sale de stock (entrega con ENT) o se compra, y en ese caso crea la orden de compra en Borrador con las reglas de compras. |
| RN-POR-010 | Solo se pueden elegir para reportes y devoluciones equipos asignados a esa Persona. |
| RN-POR-011 | **Nunca** se muestran: precios, costos, proveedor, orden de compra, fecha de compra, claves de licencia (ni enmascaradas), datos de otras Personas (incluido el nombre del jefe, D-063.5), notas y comentarios internos, nombre del técnico que analizó, auditoría, stock, órdenes de compra o servicio, ni campos no incluidos en la tabla 4.4. |
| RN-POR-012 | Un equipo compartido pertenece a un Custodio; solo el Custodio lo ve en su portal. |
| RN-POR-013 | El empleado ve solo comentarios públicos de sus casos. |
| RN-POR-014 | El acuse de recepción es informativo: no reemplaza la firma en papel ni tiene valor legal declarado (E-POR-02). |
| RN-POR-015 | Un acuse no se edita ni se borra; una corrección es un acuse nuevo. |
| RN-POR-016 | Invitaciones: **100 por empresa por día y 20 por administrador por hora** (D-054.2). La plataforma puede subir el tope de una empresa por un periodo corto para la campaña inicial (PS-04). La pantalla dice que el envío es por persona. |
| RN-POR-017 | La empresa activa va en la dirección (D-046). Con dos empresas, el portal muestra solo la Persona de la empresa activa. |
| RN-POR-018 | El portal no modifica datos de equipos, Personas ni estados: toda acción del empleado se convierte en un caso, un pedido de derechos o un acuse. El asistente de IA, si el rol lo tiene habilitado, solo **prepara el caso de ayuda** (entrega ASI-B) y lo envía la persona. |
| RN-POR-019 | Un mensaje de error del portal no contiene datos de otra Persona ni detalles internos (D-021.7). |
| RN-POR-020 | Pedidos de datos personales: quien presenta el pedido no lo atiende; la copia se entrega por descarga única con vencimiento, nunca por correo; el pedido es invisible para listas, búsquedas, reportes, exportaciones, API y avisos de quien no tiene PS-29, salvo la propia Persona que ve su estado (D-061.2). El asistente de IA remite a PAN-POR-02 y **no prepara** ese pedido. |
| RN-POR-021 | Todo texto y botón usa "usted"; el botón único es "Pedir ayuda" (DS-01, DS-09); el asistente de IA es otro control con otro nombre e icono (D-082). |
| RN-POR-022 | La respuesta de cada ruta del portal, **y cada respuesta del asistente de IA a un empleado**, incluye únicamente los campos de la tabla 4.4; una prueba compara los campos devueltos con esa lista. |

### 4.3 Requisitos de calidad

| ID | Requisito medible |
|---|---|
| RNF-POR-001 | Mi espacio carga en menos de 2 segundos (p95) con 4G y una Persona con 20 equipos. |
| RNF-POR-002 | Todo el portal es utilizable a 360 px, con teclado y lector de pantalla, con contraste AA, objetivos táctiles de 44 px y estado en texto; casos propios, buscar y ver ficha son tareas de celular (DS-11). |
| RNF-POR-003 | Para **cada ruta del portal**, una prueba automática con dos Personas de la misma empresa y con dos empresas: 100 intentos de pedir equipos, actas y casos ajenos dan 100 respuestas "no encontrado" y 0 datos filtrados (D-039.8, H-SEG-09). La prueba incluye las herramientas de lectura del asistente de IA. |
| RNF-POR-004 | Con el tope subido para la campaña, una selección de 200 Personas se procesa en menos de 60 segundos y cada resultado se informa por persona; con los topes por defecto, lo que exceda queda "En espera" y se informa. |
| RNF-POR-005 | El 100 % de invitaciones, vínculos, acuses y cambios de configuración queda en la auditoría en la misma operación (D-018.2). |
| RNF-POR-006 | Un empleado completa "Reportar un problema" en 3 pasos o menos y menos de 90 segundos. |
| RNF-POR-007 | Cada tabla nueva tiene prueba de aislamiento con `app_empresa` y por identificador interno (D-039, D-063.6). |
| RNF-POR-008 | Una prueba compara los campos de cada respuesta del portal con la lista de la tabla 4.4 (RN-POR-022); se extiende a las respuestas del asistente de IA a un empleado (D-083.3). |

### 4.4 Qué ve la Persona y qué nunca

| Dato | La Persona lo ve |
|---|---|
| Artículo, marca, modelo y categoría del equipo | Sí |
| Número de serie; en un celular, IMEI y número de línea (según el módulo activo, RF-POR-003) | Sí (son de su equipo) |
| Fecha de entrega, condición al entregar, accesorios, fecha de devolución prevista | Sí |
| Estado del equipo (Asignado, En reparación) y ubicación (sede, piso, sala) | Sí |
| Fecha de fin de garantía | Sí |
| Sus actas en PDF con su propio nombre | Sí |
| Su nombre, correo, área y sede | Sí |
| El nombre de su jefe directo | **Nunca** (D-063.5) |
| Número y operador de su línea; producto de su licencia | Sí |
| Precio, costo, proveedor, orden de compra, fecha de compra | **Nunca** |
| Clave de licencia (ni enmascarada), contraseñas | **Nunca** |
| Datos de otras Personas: compañeros, subordinados, quién tuvo antes el equipo | **Nunca** |
| Notas y comentarios internos, nombre del técnico que analizó | **Nunca** |
| Auditoría, stock, órdenes de compra y de servicio, reportes, otras empresas | **Nunca** |

## 5. Estados y transiciones

**Acceso de una Persona al portal** (se calcula, no se edita)

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| Sin acceso | Invitada | `portal.invitar` | Persona Activa con correo |
| Invitada | Con acceso | La Persona | Acepta antes de 7 días con el correo verificado |
| Invitada | Sin acceso | Administrador o vencimiento | Cancelada o vencida |
| Con acceso | Suspendida | Sistema | Persona Cesada o membresía suspendida |
| Suspendida | Con acceso | Administrador | Persona reactivada y membresía reactivada a mano |

**Acuse de recepción:** Pendiente a Confirmada, o a Con reparo (texto; avisa a TI); Con reparo a Confirmada tras resolverse. Los **casos** (estados, transiciones, plazos) los define AYU; el portal los muestra con textos simples. El **pedido de derechos** tiene los estados del registro de PRS.

## 6. Datos

**Configuración del portal.** Empresa; secciones visibles (Líneas, Licencias); categorías solicitables; texto de bienvenida (500 caracteres); quién y cuándo lo cambió; versión.
**Invitación al portal.** La invitación del núcleo con referencia a la Persona; estados Pendiente, Aceptada, Vencida, Cancelada.
**Acuse de recepción.** Empresa; acta de entrega; Persona; membresía; resultado (Confirmada, Con reparo); texto del reparo; versión del texto mostrado; fecha y hora; no se edita.

**Datos personales declarados por este módulo (D-061.3)**

| Dato | Finalidad | Quién lo ve | Plazo y rutina |
|---|---|---|---|
| Acuse (membresía, fecha y hora, desde dónde) | Constancia informativa | La Persona; `datos_personales.ver` | Plazo del acta; la dirección IP, 12 meses (D-030.7, provisional) |
| Reparo (texto libre) | Avisar a TI | TI | Plazo del acta; texto libre no anonimizable de forma garantizada |
| Pedido de datos | Cumplir derechos | PS-29 y la propia Persona (estado) | Plazo de la auditoría (provisional); vive en el registro de PRS |
| Invitación (correo) | Dar acceso | `portal.invitar` | Se borra al vencer o aceptar |

**Qué se audita (D-018.4):** invitaciones enviadas, aceptadas y canceladas, vínculos, acuses, pedidos de datos (el hecho, no el contenido) y cambios de configuración. No se guardan los textos de reportes: viven en el caso de AYU.

## 7. Pantallas necesarias

Se reutilizan el catálogo y las pantallas de casos de AYU (PAN-AYU-01, PAN-AYU-02, PAN-AYU-14), el directorio de Personas (para invitar), el aviso de privacidad del primer ingreso del núcleo y el diálogo de motivo (D-053).

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-POR-01 | Mi espacio (pestañas) | Ver lo propio y los pendientes; botón "Pedir ayuda" | Empleado |
| PAN-POR-02 | Mis datos y derechos | Ver datos propios y pedir copia, corrección o eliminación | Empleado |
| PAN-POR-03 | Configuración del portal | Secciones, categorías solicitables, bienvenida | Administrador |

La confirmación de recepción es un diálogo de Mi espacio; la invitación es una acción del directorio de Personas.

**Aviso para el Diseñador (D-082):** si el asistente de IA está habilitado para el rol Empleado, Mi espacio gana el botón flotante «Asistente de IA» abajo a la derecha. Debe convivir con «Pedir ayuda» (otro nombre e icono) y quedar **sobre la barra inferior del celular**, sin tapar «Guardar» ni «Confirmar».

## 8. Notificaciones y automatismos

Todo es `Fase 2` o posterior y sale por el motor único de NOT; en la v1 solo hay invitación, acceso y aprobación (D-061.4). La invitación es texto fijo. Contenido mínimo para quien no tiene Usuario.

| Cuándo | A quién | Qué dice |
|---|---|---|
| Se envía la invitación | Correo de la Persona | "[Empresa] le invita a su portal de TI. El enlace vence en 7 días." (texto fijo) |
| Se suma una empresa a una cuenta | El usuario | "Se le sumó la empresa [Empresa]." |
| Faltan 2 días para vencer invitaciones | Quien invitó | "N invitaciones vencen en 2 días." |
| Se acepta la invitación | Quien invitó | "PRS-0042 ya tiene acceso al portal." |
| El empleado envía un caso | El empleado | Confirmación y número del caso (la envía AYU; quien abrió el caso siempre la recibe). |
| Reporte de extravío | Técnicos y Jefatura TI | "PRS-0042 reportó un extravío." (la envía AYU) |
| Pedido de datos | Administradores con PS-29 que no presentaron el pedido | "Hay un pedido de [tipo] de PRS-0042." |
| Reparo en un acuse | Técnico que entregó | "PRS-0042 tiene un reparo sobre el acta ACT-E-000123." |

Los avisos a Personas sin Usuario los define cada módulo; el portal no envía avisos a quien no tiene acceso.

## 9. Integración con el núcleo y con otros módulos

- **Núcleo.** Invitaciones y ciclo de vida (D-002), roles y alcance propio (D-036), empresa en la dirección (D-046), aviso de privacidad (RF-ACC), auditoría.
- **PRS.** Vínculo (RN-PRS-017), suspensión al cesar y registro de solicitudes de derechos (PS-29).
- **ENT.** Equipos y actas propios; el portal lee y abre casos; el acuse se apoya en ENT-B.
- **Mesa de ayuda (AYU).** Servicios semilla acordados con el Escuadrón C: Reportar problema, Reportar extravío, Solicitar equipo, Pedir mis datos personales (esta última, caso restringido sin contenido, sin plazos ni avisos de AYU). La empresa puede desactivarlos, no borrarlos.
- **Licencias y líneas.** Aportan sus asignaciones a la Persona.
- **Compras (Etapa 5).** Un caso "Solicitar equipo" puede dar origen a una OC en Borrador creada por TI; el portal no compra.
- **ONB.** El portal no muestra procesos de ingreso ni salida.
- **Notificaciones.** Entrega de todos los avisos.
- **Asistente de IA (`asistente-ia`, ASI, Fase 3, ola G).** Opcional y apagado por defecto para el Empleado (D-083). El empleado lo usa solo con los campos de la tabla 4.4, sin acciones propias; como borrador solo prepara un caso de ayuda; los pedidos de datos personales los remite a PAN-POR-02. Aviso de transparencia propio para empleados.

## 10. Criterios de aceptación

- **CA-POR-01** (RF-POR-001, 002, 003, 005; RN-POR-001). Dada Ana con 2 equipos y Luis con 1, cuando Ana abre Mi espacio, entonces ve exactamente sus 2 equipos y ninguno de Luis.
- **CA-POR-02 (aislamiento entre empresas)** (RN-POR-002; RNF-POR-007). Dado un equipo de la empresa A, cuando un empleado de B pide su detalle por **identificador interno**, entonces responde "no encontrado", igual que un identificador inexistente.
- **CA-POR-03 (aislamiento entre Personas)** (RN-POR-001, 002; RNF-POR-003). Dadas Ana y Luis de la misma empresa, cuando Ana pide por identificador un equipo, un acta o un caso de Luis, en **cada ruta del portal**, entonces responde "no encontrado" y no revela que existe.
- **CA-POR-04 (permiso denegado)** (RF-POR-006, 007, 016; RN-POR-018). Dado un Usuario "Empleado (portal)", cuando llama directamente al servidor para listar todos los activos, crear una orden de compra, ver la auditoría o los precios, entonces se rechaza y no cambia nada.
- **CA-POR-05** (RF-POR-002; RN-POR-011, 022; RNF-POR-008). Dado un equipo con precio y proveedor, cuando su Persona abre el detalle, entonces la respuesta no contiene precio, proveedor, orden de compra ni fecha de compra, y sus campos coinciden con la tabla 4.4.
- **CA-POR-06** (RF-POR-004; RN-POR-011). Dada una licencia asignada, cuando la Persona abre Licencias, entonces ve el producto y nunca la clave, ni enmascarada.
- **CA-POR-07** (RF-POR-013, 014, 017; RN-POR-005, 007). Dada Ana Activa con correo, cuando el administrador la invita y ella acepta con ese correo, entonces queda vinculada con la plantilla Empleado (portal), la invitación no sirve otra vez, y el texto de la invitación es el fijo.
- **CA-POR-08** (RF-POR-014; RN-POR-007). Dada una invitación a `ana@x.com` abierta con la cuenta `otra@y.com`, cuando se intenta aceptar, entonces se rechaza y no se crea vínculo; y una invitación a un correo que ya tiene cuenta se ve igual que a uno nuevo.
- **CA-POR-09** (RN-POR-004). Dada una Persona que se cesa, cuando intenta usar una sesión abierta, entonces la sesión termina al instante.
- **CA-POR-10** (RF-POR-009, 010, 015; RN-POR-009). Dado un empleado que solicita un teclado, cuando envía el formulario, entonces se crea un caso del servicio "Solicitar equipo" y no se crea ninguna orden de compra; si TI decide comprar, crea la OC en Borrador.
- **CA-POR-11** (RF-POR-008; RN-POR-008). Dado un empleado que reporta el robo de su celular, cuando envía el reporte, entonces se crea un caso urgente, TI recibe el aviso y el celular sigue Asignado hasta que un técnico lo confirme.
- **CA-POR-12** (RF-POR-011; RN-POR-020). Dado el pedido "Eliminar mis datos", cuando se envía, entonces entra al registro de PS-29, el caso de AYU guarda solo la referencia, ningún Técnico, Jefatura TI ni Solo lectura lo encuentra por lista, búsqueda, exportación, reporte, API ni aviso, quien presentó el pedido no puede atenderlo, y la propia Persona ve su estado.
- **CA-POR-13** (RN-POR-003). Dado un Usuario sin Persona vinculada, cuando entra, entonces ve el mensaje de cuenta no vinculada y ningún dato.
- **CA-POR-14 (Fase 3)** (RF-POR-012; RN-POR-014, 015). Dado un acta registrada, cuando la Persona pulsa "Lo recibí", entonces se guarda fecha, hora y membresía, el acta sigue pendiente de firma en papel y el acuse no se puede editar.
- **CA-POR-15** (RF-POR-011; RN-POR-011). Dada una Persona con jefe directo, cuando abre "Mis datos y derechos", entonces no ve el nombre de su jefe.
- **CA-POR-16** (RF-POR-013; RN-POR-016). Dadas 5 invitaciones con 2 correos mal escritos, cuando se envían, entonces 3 salen, 2 se informan con su motivo y ninguna frena a las otras; superado el tope diario, las restantes quedan "En espera".

## 11. Casos límite

1. **El correo de la invitación llega a otra persona.** La invitación está ligada al correo verificado; el administrador la puede cancelar.
2. **Usuario en dos empresas.** Cambia de empresa en la dirección y ve otra Persona y otros equipos, sin arrastrar datos (D-046).
3. **Persona sin correo.** No se puede invitar; TI sigue operando sus entregas.
4. **Persona con 60 equipos (custodio).** La lista pagina (50 por defecto) y permite buscar.
5. **Equipo en reparación.** Se sigue viendo con ese estado; puede reportar otro equipo.
6. **Cambia de área.** El portal muestra el área nueva; las actas conservan la copia antigua.
7. **El jefe pide ver los equipos de su gente.** No existe en el portal (S-POR-07); lo hace TI.
8. **Suplantación de un técnico "como" la Persona.** No existe.
9. **Se desactiva "Solicitar equipo".** Desaparece del catálogo; los casos abiertos siguen.
10. **Reporta el extravío de un equipo ajeno.** No puede elegirlo: solo ve los suyos.
11. **La invitación vence.** Se envía una nueva; la anterior queda Vencida.
12. **Restaurar un respaldo antiguo.** Se revocan sesiones y enlaces y se reaplican anonimizaciones y suspensiones (D-052.4); las Personas anonimizadas no entran.
13. **Quien pide sus datos es el único con PS-29 (o la empresa no tiene suplente de derechos).** No puede atender su propio pedido ni lo atiende la plataforma (no ve datos del negocio); el pedido queda "En espera de persona designada" hasta que el Administrador designe al suplente con PS-29. Si pasan 5 días sin designar, se avisa al contacto autorizado y se deja constancia de que el plazo legal corre; la salida es el rescate (RN-PRS-033, D-071). La Persona sigue viendo el estado de su pedido.
14. **Línea sin módulo LIN.** Se muestra el número como campo de la unidad del celular, con la etiqueta de qué módulo la gestiona cuando se active.

## 12. Decisiones propuestas y supuestos

| ID | Estado | Propuesta y resultado |
|---|---|---|
| S-POR-01 | **Cambiado** (D-056) | Fase 3, ola D (antes "Posterior"). |
| S-POR-02 | Aceptado (D-058) | Misma plataforma con alcance "propio". |
| S-POR-03 | Aceptado (D-058) | "Solicitar equipo" crea un caso; TI decide si sale de stock o se compra y crea la OC en Borrador. |
| S-POR-04 | Aceptado (diseño) | "Licencias" aparece cuando LIC asigna puestos a Personas. |
| S-POR-05 | Aceptado (diseño) | El acuse es informativo y convive con el papel. |
| S-POR-06 | **Cambiado** (D-054) | Invitaciones: 100 por empresa por día y 20 por administrador por hora; por persona; la plataforma sube el tope para la campaña. |
| S-POR-07 | Aceptado (diseño) | El jefe directo no ve a su equipo en el portal inicial. |
| S-POR-08 | **Decidido** (D-037 fila 11, S-27) | Plantilla "Empleado (portal)" de lista cerrada. |
| S-POR-09 | Aceptado (diseño) | El portal muestra solo el conjunto fijo de la tabla 4.4; también el asistente de IA (D-083.3). |
| S-POR-10 | **Decidido** (D-058, D-063.5) | El nombre del jefe directo no se muestra en el portal. |
| E-POR-01 | [ESCALAR AL CEO] | **Dinero.** Invitar a cientos de empleados y enviar avisos multiplica el uso del servicio de correo (escalado "Dinero", punto 1). DevOps da el costo por número de empleados antes de activar el portal. |
| E-POR-02 | [ESCALAR AL CEO] | **Legal.** (a) El valor del acuse en pantalla; (b) el texto del aviso de privacidad para empleados y el canal de derechos (D-024.6, D-061.8); (c) si hay que informar a cada empleado antes de guardar sus datos. Hasta entonces el acuse es solo informativo. |

## 13. Fuera de alcance

- Vista del jefe directo sobre los equipos de su gente.
- Compras, aprobaciones de compra o precios desde el portal.
- Aprobación de solicitudes por el jefe (la define AYU).
- Aplicación móvil nativa (documento v0.1, §2).
- Ingreso con Google o Microsoft para empleados (D-002; INT-3).
- Autoservicio de licencias (instalar, pedir clave).
- Firma manuscrita o electrónica del acta (D-022).
- Chat en vivo con personas, encuestas propias y base de conocimiento propia (viven en AYU). El asistente de inteligencia artificial es el módulo `asistente-ia`.
- Facturas, garantías completas o documentos de compra.
- Portal en la v1.

## 14. Historial de cambios

| Cambio en la v0.2 | Decisión o hallazgo que lo motiva |
|---|---|
| Fase 3, ola D; "en la v1 no hay portal"; columna "Cuándo" y CA que cita el requisito | D-056.3, D-037 fila 11, H-AUD-08, H-AUD-21 |
| Plantilla "Empleado (portal)" de lista cerrada con sus PS-nn; permisos migrados al registro | D-037 fila 11, D-036, registro de permisos, H-SEG-08(4), H-AUD-17 |
| Aislamiento entre Personas: consultas dedicadas y prueba por ruta con dos Personas de la misma empresa; CA nuevo | D-039.8, H-SEG-09, N-19 |
| El nombre del jefe no se muestra | D-058, D-063.5, H-SEG-25(e) |
| Invitaciones por persona; tope 100 por día y 20 por hora, la plataforma lo sube; texto fijo, no revela si el correo existe | D-050.11, D-054.2 y 4, DS-08, H-SEG-15, H-QA-14, H-UX-10 |
| "Pedir mis datos": entrada en el registro de PS-29, caso restringido sin contenido, invisible por todas las vías, la Persona ve su estado; otro administrador atiende | D-061.2, H-CUM-11, H-SEG-10, H-QA-13 |
| Extravío = caso de AYU; no cambia el estado del activo; ENT no duplica | H-AUD-19, H-AUD-11 |
| "Solicitar equipo" crea un caso; TI decide y crea la OC en Borrador | D-058, H-AUD-11, H-UX-01 |
| Número de línea según el módulo activo (LIN o campo del celular) | D-042, H-AUD-13 |
| Tono "usted" y botón "Pedir ayuda"; "Mi espacio" con pestañas | D-053 (DS-01, DS-07, DS-09), H-UX-24, H-UX-11 |
| Pantallas con ID `PAN-POR`, reutilizando AYU y el directorio de Personas | D-053, H-UX-12, H-UX-25(f) |
| Datos personales del módulo declarados; aviso de privacidad con reaceptación | D-061.3, D-061.8, H-CUM-09, H-CUM-12 |
| Aislamiento probado por identificador interno | D-063.6, H-SEG-25f |
| Aceptación en pantalla marcada como Fase 3 (acuse informativo) | D-023.2, D-056.4 |
| v0.3: caso límite 13 con el suplente de derechos (recordatorios, aviso a los 5 días, rescate); "el solicitante" sin sentido de rol cambiado a "quien abrió el caso" | D-071, D-075 |
| Las seis citas `AYU-01`, `AYU-02` y `AYU-14` pasan al formato `PAN-AYU-nn` (sin citas cruzadas de otros módulos a pantallas del portal) | N-AUD-01, ronda 3 del Auditor Técnico |
| **v0.4 (29/10/2026).** «Pedir ayuda» sigue siendo el único camino para crear un caso y el Asistente de IA es otro control (glosario, RN-POR-021); la plantilla Empleado suma PS-235 y PS-236, apagados por defecto; la prueba de campos de la tabla 4.4 y el aislamiento por ruta se extienden al asistente (RN-POR-022, RNF-POR-003, RNF-POR-008, S-POR-09); el asistente solo prepara el caso de ayuda y remite los pedidos de datos a PAN-POR-02 (RN-POR-018, RN-POR-020); aviso al Diseñador y fila de integración | D-082, D-083; sección 9.2 de `asistente-ia` |
