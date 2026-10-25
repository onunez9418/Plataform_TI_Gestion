# Módulo: Integraciones y API (INT)

**Versión:** 0.1 (borrador del escuadrón F, Oleada B) · **Fecha:** 2026-10-25 · **Autor:** analista-funcional
**Base:** `CLAUDE.md`, `docs/equipo/decisiones.md` (D-001 a D-029), documento funcional v0.1.
**Estado:** propuesta. Lo no decidido está marcado **[SUPUESTO]** o **[ESCALAR AL CEO]**.

---

## 1. Propósito, alcance y fase

**Propósito.** Permitir que otros sistemas de la empresa (recursos humanos, SAP, herramientas propias) lean y escriban datos de la plataforma de forma controlada, y que los usuarios puedan entrar con su cuenta de Microsoft o Google cuando esa opción exista.

**Entra**
1. Inicio de sesión con cuenta Microsoft o Google, como método adicional.
2. API pública con claves por empresa, con alcances de solo lectura o escritura por módulo.
3. Límites de uso, versionado, registro de uso y auditoría.
4. Webhooks: avisos automáticos a una dirección de la empresa cuando ocurre un evento.
5. Intercambio con SAP S/4HANA por archivos y por la API: lectura de maestros (proveedores, centros de costo, materiales, centros y almacenes, unidades, indicadores de impuesto) y exportación de órdenes de compra, con un contrato de datos en lenguaje simple.
6. Seguridad de las claves.

**No entra:** conector directo a SAP, conexión que la plataforma abra hacia SAP por su cuenta, aplicación móvil, mercado de aplicaciones (ver sección 13).

**Fase.** El documento funcional v0.1 y D-023 dejan la integración con SAP y el ingreso con Google/Microsoft fuera de la v1. **[SUPUESTO]** Se entrega por partes:
- **INT-1** (después de la Etapa 4): claves, API de solo lectura (activos, SKU, ubicaciones, catálogos), límites, registro de uso, auditoría.
- **INT-2** (después de las Etapas 5 y 6): API de escritura, webhooks, exportación de OC y carga de maestros para SAP.
- **INT-3** (posterior a la v1): ingreso con Microsoft y Google.
- **Obligación desde la Etapa 1:** la auditoría debe distinguir si el autor de una acción es un **usuario** o una **integración** (S-INT-02).

---

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **API** | Forma en que otro programa le pide o entrega datos a la plataforma sin usar las pantallas. |
| **Integración** | Conexión autorizada de un sistema externo. Tiene nombre, alcances, claves y estado. |
| **Clave de API** | Texto secreto que identifica a una integración. Se ve completa una sola vez, al crearla. |
| **Alcance** | Permiso de una clave: por módulo, "lectura" o "lectura y escritura". Ej.: `activos:lectura`. |
| **Límite de uso** | Máximo de pedidos permitidos por minuto y por día. |
| **Webhook** | Aviso automático que la plataforma envía a una dirección web de la empresa cuando ocurre algo (por ejemplo "se aprobó una OC"). |
| **Evento** | Hecho que dispara un webhook. |
| **Firma** | Marca matemática que permite al receptor comprobar que el aviso viene de la plataforma. |
| **Versión de la API** | Número (v1, v2) que fija el formato; dentro de una versión no se rompen formatos. |
| **Idempotencia** | Enviar dos veces el mismo pedido de escritura no lo duplica. |
| **SAP S/4HANA** | Sistema de gestión empresarial de SAP que la empresa puede usar para compras y finanzas. |
| **Equivalencia externa** | Tabla que une un dato de la plataforma con su código en SAP (por ejemplo el proveedor con su código de acreedor). |
| **Lote de exportación SAP** | Conjunto de líneas de OC exportadas juntas, con número, fecha y autor. |
| **Registro de uso** | Constancia de quién usó qué clave y cuántas veces; no guarda el contenido. |

---

## 3. Roles y permisos

| Acción | Permiso (alcance) | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver la lista de integraciones y su estado | `integraciones.ver` | Sí | Sí | No | No | No | No |
| Crear, editar, rotar y revocar integraciones y claves | `integraciones.administrar` (sensible) | Sí | No | No | No | No | No |
| Dar alcances de lectura a una clave | `integraciones.administrar` + tener `exportar` | Sí | No | No | No | No | No |
| Dar el alcance de datos de personas | `integraciones.administrar` + `personas.ver_datos` | Sí | No | No | No | No | No |
| Dar el alcance de precios | `integraciones.administrar` + `precios.ver` | Sí | No | No | No | No | No |
| Ver el registro de uso de las claves | `integraciones.ver_uso` | Sí | Sí | No | No | No | No |
| Administrar webhooks | `integraciones.webhooks` (sensible) | Sí | No | No | No | No | No |
| Ver y reenviar entregas de webhooks | `integraciones.ver_uso` | Sí | Sí | No | No | No | No |
| Exportar OC a SAP (generar lote) | `integraciones.sap_exportar` (sensible) | Sí | No | No | No | No | No |
| Cargar maestros desde SAP | `integraciones.sap_importar` (sensible; además `importar`) | Sí | No | No | No | No | No |
| Mantener equivalencias externas | `integraciones.sap_equivalencias` | Sí | No | No | No | No | No |
| Elegir métodos de ingreso permitidos de la empresa | `integraciones.metodos_ingreso` (sensible) | Sí | No | No | No | No | No |
| Suspender integraciones de toda una empresa | Administrador de plataforma (D-003), sin ver datos del negocio | n/a | n/a | n/a | n/a | n/a | n/a |

Notas
- Una clave **nunca** tiene más permisos que su creador. Quien no ve precios no puede crear una clave que los entregue (equivale a D-004.6).
- Por D-015 y D-004.8, ninguna clave puede **aprobar**, **recibir**, **dar de baja**, **ver claves de licencia**, **ver la auditoría** ni **administrar usuarios o roles**. Esas acciones son siempre de una persona.
- Cada permiso se comprueba en el servidor; la clave y su alcance se comprueban en cada pedido.

---

## 4. Requisitos

### 4.1 Funcionales

| ID | Requisito | Parte |
|---|---|---|
| RF-INT-001 | Crear una integración con nombre, descripción, alcances, fecha de vencimiento y, opcionalmente, direcciones de red permitidas. | INT-1 |
| RF-INT-002 | Mostrar la clave completa una sola vez al crearla; después solo su prefijo y las últimas 4 letras. | INT-1 |
| RF-INT-003 | Rotar una clave: crear una nueva y mantener la anterior válida hasta 7 días (o menos si se elige) para cambiar sin cortar el servicio. | INT-1 |
| RF-INT-004 | Revocar una clave con efecto inmediato y motivo. | INT-1 |
| RF-INT-005 | Mostrar por clave: último uso, direcciones desde las que se usó, pedidos del día y errores. | INT-1 |
| RF-INT-006 | API de lectura de activos, SKU, ubicaciones, catálogos, categorías y campos personalizados, con filtros y paginación. | INT-1 |
| RF-INT-007 | API de lectura de personas (alcance sensible), órdenes de compra, recepciones, órdenes de servicio, proveedores y centros de costo. | INT-2 |
| RF-INT-008 | API de escritura limitada: personas, SKU, valores de catálogo, órdenes de compra **solo en Borrador**, órdenes de servicio y solicitudes de mesa de ayuda. | INT-2 |
| RF-INT-009 | Pedidos de escritura con clave de idempotencia; repetirlos devuelve el resultado original. | INT-2 |
| RF-INT-010 | Escritura por lote (hasta 100 elementos) con regla de todo o nada (como D-020.3). | INT-2 |
| RF-INT-011 | Aplicar límites de uso y responder con el tiempo de espera cuando se superen. | INT-1 |
| RF-INT-012 | Publicar la documentación de la API (qué se puede pedir, ejemplos, errores) y un registro de cambios por versión. | INT-1 |
| RF-INT-013 | Registrar webhooks con dirección segura, eventos elegidos y secreto de firma. | INT-2 |
| RF-INT-014 | Enviar eventos firmados, con reintentos, y pausar el webhook que falla de forma sostenida. | INT-2 |
| RF-INT-015 | Mostrar las entregas de cada webhook (estado, respuesta) y reenviar una manualmente. | INT-2 |
| RF-INT-016 | Mantener equivalencias externas para SAP: proveedor, centro de costo, material (SKU), centro y almacén (ubicación), unidad de medida e indicador de impuesto. | INT-2 |
| RF-INT-017 | Cargar maestros de SAP desde archivo (.xlsx o .csv) con vista previa, todo o nada y lote deshacible, usando el mismo mecanismo de D-020; también por la API de escritura. | INT-2 |
| RF-INT-018 | Generar el archivo de exportación de OC para SAP de las órdenes pendientes de exportar, con vista previa de las que no se pueden exportar y por qué. | INT-2 |
| RF-INT-019 | Registrar cada lote de exportación SAP y permitir volver a descargarlo idéntico durante 30 días. | INT-2 |
| RF-INT-020 | Registrar el número de documento SAP en la OC (referencia externa), a mano o por la API. | INT-2 |
| RF-INT-021 | Indicar en cada OC su estado de exportación: No exportada, Exportada, Exportada con cambios pendientes, Confirmada por SAP. | INT-2 |
| RF-INT-022 | Permitir a cada empresa elegir qué métodos de ingreso acepta (enlace por correo, Microsoft, Google) sin quitar nunca el enlace por correo a los administradores. | INT-3 |
| RF-INT-023 | Iniciar sesión con Microsoft o Google solo si el correo verificado de esa cuenta coincide con un usuario ya invitado. | INT-3 |
| RF-INT-024 | Avisar a los administradores del vencimiento próximo de claves (30 y 7 días), de webhooks pausados y de uso anormal. | INT-1 |
| RF-INT-025 | Suspender todas las claves y webhooks cuando la empresa se suspende (D-003). | INT-1 |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-INT-001 | Cada clave pertenece a una sola empresa. Todo pedido filtra por esa empresa. Un identificador de otra empresa responde "no encontrado". |
| RN-INT-002 | La plataforma guarda solo una huella irreversible de la clave, nunca la clave. Si se pierde, se rota; no se recupera. |
| RN-INT-003 | La clave tiene un prefijo reconocible (ej. `pti_live_`) para que los detectores de secretos la identifiquen si se filtra. |
| RN-INT-004 | Vencimiento obligatorio: máximo 365 días; por defecto 180. **[SUPUESTO]** |
| RN-INT-005 | Las claves solo funcionan por conexión cifrada. Un pedido sin cifrar se rechaza. |
| RN-INT-006 | Si se definieron direcciones de red permitidas, un pedido desde otra dirección se rechaza y se cuenta como fallo. |
| RN-INT-007 | Los alcances son por módulo y por nivel: `modulo:lectura`, `modulo:escritura`. La escritura no incluye la lectura; hay que darla aparte. |
| RN-INT-008 | Los precios y los datos de personas solo salen con los alcances `precios:lectura` y `personas:lectura`. Sin ellos, esos campos no se envían. |
| RN-INT-009 | Ninguna clave da acceso a claves de licencia, auditoría, usuarios, roles, invitaciones, configuración de seguridad ni a otras empresas. |
| RN-INT-010 | Ninguna clave puede aprobar, rechazar, recibir mercadería, dar de baja, anular, reingresar ni cerrar. La OC creada por API queda en Borrador. |
| RN-INT-011 | Quien creó o rotó una clave no puede aprobar una OC creada por esa integración (separación de funciones, D-015). |
| RN-INT-012 | Las acciones por API se auditan con autor "integración <nombre>" y, para escrituras, antes y después (D-018). |
| RN-INT-013 | Las lecturas por API no se auditan una a una; se guarda el registro de uso (clave, día, cantidad de pedidos, errores, módulo). Las lecturas de personas se registran por pedido (clave, cantidad de filas, filtros), sin datos personales. |
| RN-INT-014 | El registro de uso se conserva 90 días; el de entregas de webhooks, 30 días. **[SUPUESTO]** |
| RN-INT-015 | Límites por clave: 60 pedidos por minuto y 10 000 por día; por empresa: 300 por minuto. **[SUPUESTO]** |
| RN-INT-016 | Cada pedido devuelve como máximo 100 elementos; el cuerpo de un pedido no pasa de 1 MB. **[SUPUESTO]** |
| RN-INT-017 | Tras 20 autenticaciones fallidas en 10 minutos con un mismo prefijo, la clave se bloquea 15 minutos y se avisa a los administradores. |
| RN-INT-018 | Los mensajes de error no revelan si una clave existe, ni detalles internos, ni datos de otras empresas. |
| RN-INT-019 | Dentro de una versión de la API solo se agregan campos o funciones; nunca se quitan ni se cambia su significado. |
| RN-INT-020 | Una versión se anuncia como retirada con al menos 12 meses de aviso; conviven como máximo 2 versiones. **[SUPUESTO]** |
| RN-INT-021 | Crear, rotar o revocar claves exige que el administrador haya hecho su segunda verificación en los últimos 10 minutos (D-002.5). |
| RN-INT-022 | La clave de una integración sigue activa si su creador se da de baja, pero la integración queda marcada "creador inactivo: revisar" y los administradores reciben aviso. |
| RN-INT-023 | Dirección de webhook: solo conexión cifrada; no se aceptan direcciones internas ni de red privada (protege la red de la plataforma). |
| RN-INT-024 | El aviso de un webhook lleva solo: evento, número de evento, fecha, empresa, tipo y identificador del elemento. No lleva precios, datos personales ni claves; el receptor consulta la API con su clave. |
| RN-INT-025 | Cada aviso va firmado con el secreto del webhook y la fecha; el receptor debe rechazar avisos con más de 5 minutos de antigüedad. |
| RN-INT-026 | Entrega "al menos una vez": puede haber repetidos; el receptor usa el número de evento para ignorarlos. No se garantiza el orden. |
| RN-INT-027 | Reintentos tras fallo: 1 minuto, 5 minutos, 30 minutos, 2 horas y 12 horas. Agotados, el aviso queda Descartado y puede reenviarse a mano. |
| RN-INT-028 | Si todos los avisos fallan durante 24 horas seguidas, el webhook pasa a Pausado automático y se avisa a los administradores. |
| RN-INT-029 | Solo se envían eventos de módulos para los que la integración dueña del webhook tiene alcance de lectura. |
| RN-INT-030 | Un máximo de 10 webhooks por empresa y 64 KB por aviso. **[SUPUESTO]** |
| RN-INT-031 | El ingreso con Microsoft o Google nunca crea usuarios ni empresas (D-001). Una cuenta sin invitación recibe el mismo mensaje genérico que cualquier acceso fallido. |
| RN-INT-032 | Solo se acepta una cuenta externa cuyo correo esté verificado por el proveedor; coincide por correo con el usuario existente (D-002.4, sin distinguir mayúsculas). |
| RN-INT-033 | La segunda verificación de administradores sigue siendo obligatoria aunque entren con Microsoft o Google. |
| RN-INT-034 | Sin la plataforma de SAP no se asume nada: los archivos y la API son la frontera. La plataforma no abre conexión hacia SAP. |
| RN-INT-035 | Una OC solo se exporta a SAP desde el estado Aprobada en adelante; nunca en Borrador, Pendiente de aprobación o Rechazada. |
| RN-INT-036 | La OC solo se exporta si todos sus datos tienen equivalencia (proveedor, centro de costo, material, centro o almacén, unidad, indicador de impuesto). Si falta una, queda "pendiente de equivalencia" y se lista. |
| RN-INT-037 | Cada línea exportada lleva el tipo de registro ALTA (primera vez), CAMBIO (nueva versión tras reaprobación, D-013.5) o ANULACION, y el número de versión. SAP puede ignorar repetidos por orden + versión. |
| RN-INT-038 | Exportar a SAP no cambia el estado de la OC en la plataforma; solo su estado de exportación. |
| RN-INT-039 | Cargar maestros de SAP nunca borra datos. Lo que no vuelve en una carga se marca "no vino en la última carga". Los campos propios de SAP no se editan a mano. |
| RN-INT-040 | La carga de maestros no crea SKU ni proveedores nuevos sola: los valores nuevos se listan para que el administrador los apruebe (D-020.6). |
| RN-INT-041 | Una exportación a SAP o una lectura masiva por API se trata como exportación sensible y queda en la auditoría. |
| RN-INT-042 | Importes: decimales exactos, una moneda por OC, sin conversión (D-014). |

### 4.3 Calidad medible

| ID | Requisito |
|---|---|
| RNF-INT-001 | Un pedido de lectura simple responde en 500 ms o menos (percentil 95) con 100 000 activos por empresa. |
| RNF-INT-002 | La comprobación de la clave y del alcance ocurre en cada pedido; revocar una clave surte efecto en 10 segundos o menos. |
| RNF-INT-003 | Un aviso de webhook sale en 30 segundos o menos desde el evento, cuando el receptor está disponible. |
| RNF-INT-004 | Un lote de exportación de 5 000 líneas se genera en 60 segundos o menos. |
| RNF-INT-005 | Ninguna clave aparece en registros técnicos, auditoría, mensajes de error ni copias de seguridad en texto claro (prueba automática de búsqueda). |
| RNF-INT-006 | Cada tabla y cada ruta de la API llevan prueba de aislamiento entre empresas (D-025). |
| RNF-INT-007 | La documentación de la API siempre refleja la versión publicada (prueba que compara la documentación con las rutas). |
| RNF-INT-008 | Las pruebas de contrato de v1 fallan si algún cambio quita o cambia un campo ya publicado. |

---

## 5. Estados y transiciones

**Integración (y su clave)**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) | Activa | `integraciones.administrar` | Verificación reciente (RN-INT-021) |
| Activa | Suspendida | `integraciones.administrar` o el sistema (bloqueo por fallos, empresa suspendida) | Motivo; la reactivación es manual |
| Suspendida | Activa | `integraciones.administrar` | Si la causa fue la empresa, solo con la empresa reactivada |
| Activa | Vencida | Sistema | Pasó la fecha de vencimiento |
| Vencida | Activa | `integraciones.administrar` | Solo rotando la clave |
| Activa / Suspendida / Vencida | Revocada | `integraciones.administrar` | Motivo obligatorio; final. No se borra |

**Webhook**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Activo | `integraciones.webhooks` | Dirección válida (RN-INT-023) y alcance de lectura |
| Activo | Pausado | `integraciones.webhooks` | Manual |
| Activo | Pausado automático | Sistema | RN-INT-028 |
| Pausado / Pausado automático | Activo | `integraciones.webhooks` | Se prueba con un aviso de prueba |
| Activo / Pausado | Desactivado | `integraciones.webhooks` | Final. No se borra |

**Entrega de un aviso:** Pendiente → Entregada | Reintentando → Entregada | Descartada.

**Exportación SAP de una OC:** No exportada → Exportada (al generar lote) → Exportada con cambios pendientes (la OC se reaprobó o anuló) → Exportada (nuevo lote) → Confirmada por SAP (al registrar el número SAP, `integraciones.sap_exportar` o la API). Una OC Anulada ya exportada pasa a "Exportada con cambios pendientes" hasta exportar su ANULACION.

**Lote de exportación SAP:** Generado → Descargado → Confirmado (opcional). No se borra.

---

## 6. Datos

| Entidad | Campos principales | Clave y unicidad | Se audita |
|---|---|---|---|
| Integración | empresa, nombre, descripción, estado, alcances, vencimiento, direcciones permitidas, creada por, límites propios | Nombre único por empresa | Altas, cambios de alcance con antes/después, suspensión, revocación |
| Clave de API | integración, prefijo, últimas 4 letras, huella irreversible, vencimiento, estado, último uso, creada por | Prefijo + huella únicos | Creación, rotación, revocación (nunca el valor) |
| Registro de uso | clave, día, módulo, pedidos, errores, direcciones | Único por clave + día + módulo | No (registro técnico; 90 días) |
| Acceso a personas por API | clave, momento, filas devueltas, filtros | Una por pedido | Sí, resumido |
| Webhook | empresa, integración, dirección, eventos, estado, huella del secreto | Único por empresa + dirección + integración | Altas, cambios, pausas |
| Entrega de aviso | webhook, evento, número de evento, estado, intentos, código de respuesta | Único por webhook + número de evento | No (registro técnico; 30 días) |
| Método de ingreso de la empresa | empresa, métodos permitidos | Uno por empresa | Cambios con antes/después |
| Cuenta externa vinculada | usuario, proveedor (Microsoft o Google), identificador del proveedor | Único por proveedor + identificador | Vinculación y desvinculación |
| Equivalencia externa | empresa, sistema (SAP), tipo, código externo, descripción externa, elemento interno vinculado, estado, vino en última carga | Único por empresa + sistema + tipo + código externo | Altas, vínculos, cambios |
| Lote de importación de maestros | como el lote de D-020 (quién, cuándo, archivo, filas) | Correlativo por empresa | Sí |
| Lote de exportación SAP | empresa, número, generado por, fecha, filtros, cantidad de órdenes y líneas, copia de las líneas exportadas, estado | Correlativo por empresa | Sí; la copia se conserva según plazo de auditoría (D-024) |
| Valores fijos de exportación | empresa, sociedad, organización de compras, grupo de compras, clase de documento | Uno por empresa | Cambios con antes/después |
| Referencia externa en OC | número SAP, estado de exportación, versión exportada | Una por OC | Cambios |

---

## 7. Pantallas necesarias

| Pantalla | Propósito | Rol principal |
|---|---|---|
| Integraciones | Lista, estado, vencimiento, último uso | Administrador |
| Nueva integración / editar | Alcances en una tabla módulo × nivel, vencimiento, direcciones | Administrador |
| Mostrar clave | Muestra la clave una vez con aviso "guárdela ahora" | Administrador |
| Actividad de una clave | Pedidos por día, errores, bloqueos | Administrador, Jefatura TI |
| Webhooks | Lista, eventos, estado, aviso de prueba | Administrador |
| Entregas de un webhook | Intentos, respuestas, reenvío | Administrador |
| Métodos de ingreso | Elegir enlace por correo, Microsoft, Google | Administrador |
| SAP: equivalencias | Tablas de equivalencias con filtro "sin vincular" | Administrador |
| SAP: cargar maestros | Subir archivo, vista previa, confirmar, deshacer | Administrador |
| SAP: exportar órdenes | Órdenes pendientes, las que no se pueden exportar y por qué, generar lote | Administrador |
| SAP: lotes | Historial y descarga de lotes | Administrador |
| Documentación de la API | Referencia pública con ejemplos | Desarrollador de la empresa |

---

## 8. Notificaciones y automatismos

| Cuándo | A quién | Qué dice |
|---|---|---|
| Clave por vencer (30 y 7 días) | Administradores | "La clave 'RRHH' vence el 20 de noviembre. Rótela a tiempo." |
| Clave creada, rotada o revocada | Administradores | "Se revocó la clave 'RRHH'. Motivo: ..." |
| Clave bloqueada por fallos | Administradores | "La clave 'RRHH' fue bloqueada 15 minutos por intentos fallidos." |
| Uso superó el límite repetidas veces (más de 100 respuestas de límite en una hora) | Administradores | "La integración 'ERP' superó su límite." |
| Webhook pausado automático | Administradores | "Se pausó el webhook de 'ERP' tras 24 horas de fallas." |
| Integración con creador inactivo | Administradores | "La integración 'RRHH' fue creada por alguien que ya no está activo." |
| Lote SAP generado | Quien lo generó | "Lote SAP 0007: 12 órdenes, 34 líneas, 3 pendientes de equivalencia." |
| OC con cambios tras exportar | Quienes tengan `integraciones.sap_exportar` | "OC-0042 cambió después de exportarse." |
| Versión de la API por retirar | Administradores | Aviso a 12, 6 y 1 mes del retiro |

Automatismos: vencimiento automático de claves; limpieza de registros técnicos (90 y 30 días); recordatorio mensual de claves sin uso en 90 días. Los correos salen por el servicio de notificaciones.

---

## 9. Integración con el núcleo y con otros módulos

- **Núcleo:** empresa, usuarios y roles (permisos que topan las claves), auditoría con autor "usuario o integración" (**pedido para la Etapa 1**, S-INT-02), sesiones, segunda verificación (D-002.5), importación (D-020), administrador de plataforma (D-003).
- **Pedidos al núcleo:** la OC lleva centro de costo y **referencia externa**; proveedor, ubicación y centro de costo admiten **código externo**.
- **proveedores-contratos (A):** proveedores y contratos disponibles en lectura; código SAP del proveedor como equivalencia.
- **presupuesto-costos (PRE):** el código externo del centro de costo; presupuestos en lectura con `precios:lectura`.
- **reportes-tableros (REP):** una lectura masiva por API se trata como exportación (RN-INT-041); los reportes se obtienen por API solo como datos base, no como documentos.
- **mesa-de-ayuda (C):** escritura de solicitudes por API y eventos `caso.creado` y `caso.cerrado`.
- **notificaciones (C):** correos de avisos; los webhooks son responsabilidad de INT, no de notificaciones.
- **cmdb-ligera (E) y personas-ubicaciones (D):** lectura de elementos y personas; personas exige alcance sensible.
- **Catálogo inicial de eventos (INT-2):** `activo.creado`, `activo.estado_cambiado`, `activo.asignado`, `activo.devuelto`, `sku.creado`, `oc.aprobada`, `oc.anulada`, `recepcion.confirmada`, `persona.creada`, `persona.desactivada`, `os.creada`, `os.cerrada`, `caso.creado`, `caso.cerrado`.

### Contrato de datos con SAP (en lenguaje simple)

**A. Maestros que entran (SAP → plataforma), por archivo o por la API de escritura.** Una fila por elemento; el archivo trae encabezados fijos.
- **Proveedores:** código SAP (obligatorio), nombre, identificador fiscal, país, correo de contacto, bloqueado (S/N).
- **Centros de costo:** código SAP, nombre, vigente desde, vigente hasta, bloqueado (S/N), código interno (opcional, para unirlo directo).
- **Materiales:** código de material SAP, descripción, unidad de medida, grupo de materiales, bloqueado (S/N), código de SKU interno (opcional).
- **Centros y almacenes:** código, nombre, tipo (centro o almacén), código de ubicación interna (opcional).
- **Unidades de medida e indicadores de impuesto:** código SAP, descripción, porcentaje (solo impuestos).
- Reglas: la clave es el código SAP; repetir una carga actualiza, no duplica (RN-INT-039); lo nuevo se lista para aprobar (RN-INT-040).

**B. Órdenes que salen (plataforma → SAP), un archivo con una fila por línea de OC.**
- Cabecera repetida en cada fila: tipo de registro (ALTA, CAMBIO, ANULACION), número de OC, versión, fecha de la orden, código SAP del proveedor, moneda, sociedad, organización de compras y grupo de compras (valores fijos de la empresa), centro de costo (código SAP), referencia de quien creó y quien aprobó (nombre de usuario interno, no correo).
- Línea: número de línea, código de material SAP (o código del SKU), descripción, cantidad, unidad de medida SAP, precio unitario sin impuesto (hasta 4 decimales, punto como separador), indicador de impuesto SAP, centro y almacén de destino (códigos SAP).
- Reglas: una moneda por orden; el archivo es .csv con codificación UTF-8 o .xlsx; celdas protegidas contra fórmulas (D-020.8); el número de documento SAP vuelve a la plataforma por pantalla o por la API.
- No se exportan recepciones ni pagos en esta versión.

---

## 10. Criterios de aceptación

**CA-INT-01 Clave visible una sola vez.** Dado un administrador que crea la integración "RRHH", cuando guarda, entonces ve la clave completa una vez; al recargar solo ve el prefijo y las últimas 4 letras; la base de datos no guarda la clave en claro.

**CA-INT-02 Alcance respetado.** Dado una clave con `activos:lectura` y sin `personas:lectura`, cuando pide un activo asignado, entonces la respuesta no incluye datos de la persona; cuando pide `/personas`, entonces recibe acceso denegado.

**CA-INT-03 Aislamiento entre empresas.** Dado una clave de la empresa A y el identificador de un activo de B, cuando lo pide, entonces recibe "no encontrado", igual que un identificador inexistente.

**CA-INT-04 Permiso denegado.** Dado una Jefatura TI sin `integraciones.administrar`, cuando intenta crear una clave por pantalla o por la ruta directa, entonces el servidor la rechaza y queda registrado el intento.

**CA-INT-05 Nadie da más de lo que tiene.** Dado un administrador sin `precios.ver`, cuando intenta dar `precios:lectura` a una clave, entonces el sistema lo impide.

**CA-INT-06 Límite de uso.** Dado un límite de 60 pedidos por minuto, cuando una clave hace el pedido 61 en ese minuto, entonces recibe una respuesta de límite superado con los segundos de espera y los pedidos anteriores no se afectan.

**CA-INT-07 Revocación inmediata.** Dado una clave activa, cuando el administrador la revoca, entonces el siguiente pedido (en 10 segundos o menos) es rechazado y la auditoría guarda quién, cuándo y el motivo.

**CA-INT-08 Escritura sin duplicar.** Dado un pedido que crea una OC en Borrador con clave de idempotencia X, cuando el sistema externo lo repite por un corte de red, entonces existe una sola OC y la segunda respuesta devuelve la misma.

**CA-INT-09 La API no aprueba.** Dado una clave con `ordenes_compra:escritura`, cuando intenta aprobar o recibir una OC, entonces la acción no existe para claves y se rechaza; la OC creada por API queda en Borrador.

**CA-INT-10 Separación de funciones con la clave.** Dado que Pedro creó la clave "ERP" y esa integración creó la OC-0100, cuando Pedro intenta aprobar la OC-0100, entonces el sistema lo impide.

**CA-INT-11 Webhook firmado y con reintentos.** Dado un webhook para `oc.aprobada`, cuando se aprueba una OC y el receptor responde con error, entonces se reintenta a 1, 5 y 30 minutos; el aviso lleva firma y fecha, y no lleva importes ni datos personales.

**CA-INT-12 Dirección interna rechazada.** Dado un administrador que registra el webhook `http://192.168.1.10/hook`, cuando guarda, entonces el sistema lo rechaza por no ser conexión cifrada ni dirección pública.

**CA-INT-13 Exportación a SAP completa.** Dado una OC Aprobada con todas sus equivalencias, cuando el administrador genera el lote, entonces el archivo tiene una fila por línea con tipo ALTA, versión 1 y precios sin impuesto; la OC pasa a "Exportada" y el lote queda auditado.

**CA-INT-14 Equivalencia faltante.** Dado una OC cuyo proveedor no tiene código SAP, cuando se genera el lote, entonces la OC no se incluye, se lista como "pendiente de equivalencia: proveedor" y el resto del lote se genera.

**CA-INT-15 Cambio tras exportar.** Dado una OC exportada que se edita y reaprueba, cuando se genera el siguiente lote, entonces sale con tipo CAMBIO y versión 2; si se anula, sale con ANULACION.

**CA-INT-16 Ingreso externo solo con invitación (INT-3).** Dado un correo sin invitación, cuando intenta entrar con Google, entonces recibe el mensaje genérico de acceso no disponible y no se crea ningún usuario.

---

## 11. Casos límite

1. Clave filtrada en un repositorio público: el detector de secretos la reconoce por el prefijo; se revoca y se revisa el registro de uso.
2. Rotación con la clave anterior aún en uso durante 7 días: ambas funcionan; el uso de la anterior se destaca.
3. Reloj del receptor desfasado: rechaza avisos por antigüedad; la guía indica sincronizar el reloj.
4. Receptor lento que responde pasados 10 segundos: se cuenta como fallo y se reintenta.
5. Webhook para evento de un módulo cuyo alcance se retira después: el webhook se pausa y se avisa.
6. Archivo de maestros con códigos SAP repetidos: la vista previa lo rechaza (todo o nada).
7. Material SAP bloqueado vinculado a un SKU activo: se avisa; el SKU no se desactiva solo.
8. OC exportada en una moneda y proveedor con equivalencia eliminada después: la OC ya exportada no cambia; la siguiente exportación queda pendiente de equivalencia.
9. OC con más de 999 líneas: el archivo las numera sin límite (el ancho es un mínimo, D-007.5).
10. Persona dada de baja y anonimizada: la API la devuelve como "Persona dada de baja 0042" (D-024).
11. Empresa suspendida: sus claves y webhooks responden suspendidos hasta la reactivación.
12. Usuario con cuenta de Google y enlace por correo: ambos llevan a la misma cuenta; no se crea otra (D-002.4).
13. Cuenta externa cuyo correo cambia en el proveedor: no se acepta hasta que coincida con un usuario invitado.
14. Lote de importación de maestros deshecho después de vincular equivalencias: el sistema avisa de los vínculos que quedarán sin código externo antes de confirmar.

---

## 12. Decisiones propuestas y supuestos

| ID | Tipo | Propuesta y motivo |
|---|---|---|
| S-INT-01 | [SUPUESTO] | Entrega por partes INT-1, INT-2 e INT-3 (sección 1). Motivo: cada una depende de módulos distintos. |
| S-INT-02 | [SUPUESTO] | La auditoría de la Etapa 1 distingue autor "usuario" o "integración". Cuesta poco hoy y obliga a migrar con datos reales después. |
| S-INT-03 | [SUPUESTO] | Las claves son de la empresa, no de una persona, con vencimiento obligatorio y aviso. |
| S-INT-04 | [SUPUESTO] | La escritura por API se limita a personas, SKU, catálogos, OC en Borrador, OS y solicitudes. Motivo: nada que mueva dinero, estado de activos o permisos. |
| S-INT-05 | [SUPUESTO] | Los avisos de webhooks llevan solo identificadores (no datos). Motivo: privacidad; el receptor consulta con su clave. |
| S-INT-06 | [SUPUESTO] | Límites 60/min, 10 000/día por clave y 300/min por empresa; 12 meses de aviso de retiro de versión. |
| S-INT-07 | [SUPUESTO] | La integración con SAP en esta versión es por archivos y por la API de la plataforma; nada abre conexión hacia SAP. Motivo: no asumir acceso a SAP ni sus costos. |
| S-INT-08 | [ESCALAR AL CEO] | **Licencias y costos de conectores SAP.** Conectar directo con SAP puede requerir licencias de SAP (por ejemplo, una suite de integración o un servicio de conexión), un consultor SAP y habilitar interfaces en su sistema. No lo cotizamos ni lo asumimos. Se pide al CEO confirmar si la empresa tiene SAP S/4HANA, qué módulos de compras usa y quién lo administra. Mientras tanto se entrega el contrato por archivos y por la API, que no tiene costo de licencia propio. |
| S-INT-09 | [ESCALAR AL CEO] | **Ingreso con Microsoft o Google:** si el proveedor llegara a exigir una verificación formal o un pago para operar con cuentas de cualquier organización, se consulta el costo antes. Hoy se asume que usar solo nombre y correo verificado no cuesta. |
| S-INT-10 | [SUPUESTO] | Una lectura masiva por API se trata como exportación: la clave de lectura solo la crea quien tiene `exportar`. |
| S-INT-11 | [SUPUESTO] | Valores específicos de SAP (sociedad, organización de compras, grupo de compras, clase de documento) los configura la empresa; la plataforma solo valida el formato. |
| S-INT-12 | [SUPUESTO] | El ingreso con Microsoft/Google no sustituye el enlace por correo; los administradores siempre pueden recuperar su acceso (D-002.7). |
| S-INT-13 | [SUPUESTO] | Los archivos y lotes de SAP no incluyen datos personales (se usa el nombre de usuario interno de quien creó y aprobó, no su correo). |

---

## 13. Fuera de alcance

- Conector directo o permanente hacia SAP, y exportación de recepciones, pagos y facturas a SAP.
- Lectura de SAP por consulta automática desde la plataforma.
- Contraseñas de la API de tipo "usuario y contraseña"; solo claves por integración.
- Autorización delegada por usuario (que una aplicación externa actúe en nombre de una persona).
- Aprobar, recibir, dar de baja o ver auditoría por API.
- Webhooks con datos completos; aplicaciones de terceros con catálogo público.
- Límites distintos por plan comercial o cobro por uso.
- Ingreso con otros proveedores de identidad y ingreso único corporativo (SSO) con administración centralizada.
- Adjuntos por API (D-022).
- Aplicación móvil propia.
