# Módulo: Integraciones y API (INT)

**Versión:** 0.3 (aplicación de D-065 a D-076, escuadrón F) · **Fecha:** 25/10/2026 · **Autor:** analista-funcional
**Base:** `CLAUDE.md`, `docs/equipo/decisiones.md` (D-001 a D-064), `docs/equipo/plan-correcciones.md`, `docs/registro-permisos.md`, documento funcional v0.2.
**Estado:** propuesta. **[SUPUESTO]** = lo confirma el Gerente de TI. **[ESCALAR AL CEO]** = dinero, legal o irreversible.
**Leyenda de "Cuándo":** la columna usa las tres palabras del núcleo (`v1, Etapa N`, `Fase 2`, `Fase 3`). Todo INT es **Fase 3, ola F**; entre paréntesis va la parte: **(INT-1)**, **(INT-2)**, **(INT-3)**. INT-2 necesita las Etapas 5 y 6; INT-1 solo el núcleo.

---

## 1. Propósito, alcance y fase

**Propósito.** Que otros sistemas de la empresa (recursos humanos, SAP, herramientas propias) lean y escriban datos de forma controlada, y que los usuarios puedan entrar con Microsoft o Google.

**Entra**
1. API pública con claves por empresa, alcances por módulo, límites, versionado, registro de uso y auditoría.
2. Webhooks (avisos automáticos a una dirección de la empresa).
3. Intercambio con SAP S/4HANA por archivos y por la API: lectura de maestros y exportación de órdenes de compra.
4. Seguridad de las claves y de los secretos.
5. Ingreso con Microsoft o Google como método adicional (INT-3).

**No entra:** conector directo a SAP, conexión que la plataforma abra hacia SAP, aplicación móvil, tienda de aplicaciones (sección 13).

**Fase (D-056).** **INT-1** (claves y API de lectura): Fase 3, ola F. **INT-2** (escritura, webhooks, SAP): Fase 3, después de las Etapas 5 y 6. **INT-3** (ingreso con Microsoft o Google): Fase 3, al final. Nada se construye antes de aprobar la Etapa 7, salvo decisión del Gerente de TI.
**Preparaciones del núcleo en la v1:** tipo de autor de la auditoría con tres valores (usuario, integración, sistema; Etapa 1); código externo en proveedor, ubicación y centro de costo (Etapa 2); referencia externa y número de versión en la OC (Etapa 5). La migración del código externo a equivalencias llega con INT-2 (D-040.4).

---

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **API** | Forma en que otro programa pide o entrega datos sin usar las pantallas. Usa los mismos servicios, validadores y permisos que las pantallas (D-036.6). |
| **Integración** | Conexión autorizada de un sistema externo, con nombre, permisos, claves y estado. |
| **Clave de API** | Texto secreto de una integración, visible completo una sola vez. Tiene un **identificador público propio** para reconocerla sin mostrarla. |
| **Alcance de una clave** | Subconjunto de los permisos del registro (por ejemplo `activos.ver`), siempre con alcance "todo". No existe un vocabulario aparte. |
| **Lectura masiva** | Más de 5.000 filas por día por clave; se audita como exportación. |
| **Webhook** | Aviso automático que la plataforma envía a una dirección web cuando ocurre un evento. |
| **Evento** | Hecho con nombre `<módulo>.<entidad>_<hecho>` del catálogo único que acuerdan Notificaciones e Integraciones. |
| **Firma** | Marca que permite al receptor comprobar que el aviso viene de la plataforma. |
| **Idempotencia** | Repetir el mismo pedido de escritura no lo duplica. |
| **Equivalencia externa** | Une un dato de la plataforma con su código en SAP. |
| **Lote de exportación SAP** (`LSAP-`) | Conjunto de líneas de OC exportadas juntas. |
| **Reautenticación reciente** | Enlace nuevo o segundo factor de los últimos 10 minutos (D-048.2). |

---

## 3. Roles y permisos

Solo nombres y PS-nn de `docs/registro-permisos.md`. Los alcances de una clave son un **subconjunto** del registro. Valores por rol según el registro.

| Acción | Permiso (PS) | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver integraciones y su estado | `integraciones.ver` (PS-132) | Sí | No | No | No | No | No |
| Crear, editar, rotar y revocar integraciones y claves; fijar alcances | `integraciones.administrar` (PS-133; sensible, reautenticación reciente) | Sí | No | No | No | No | No |
| Dar a una clave permisos de lectura masiva (`activos.ver`, etc.) | PS-133 y tener `datos.exportar` (PS-20) | Sí | No | No | No | No | No |
| Dar a una clave `datos_personales.ver` o `precios.ver` | PS-133 y tener ese mismo permiso (PS-22, PS-23) | Sí | No | No | No | No | No |
| Ver uso y registros de las claves | `integraciones.ver_uso` (PS-134) | Sí | No | No | No | No | No |
| Administrar webhooks | `integraciones.administrar_webhooks` (PS-135; sensible, reautenticación reciente y auditoría de cada uso, D-068) | Sí | No | No | No | No | No |
| Generar el lote de exportación SAP | `integraciones.sap_exportar` (PS-220) y `datos.exportar` (PS-20) | Sí | No | No | No | No | No |
| Cargar maestros SAP | `datos.importar` (PS-21) y `proveedores.crear_editar` (PS-37) | Sí | No | No | No | No | No |
| Mantener equivalencias con SAP | `integraciones.sap_equivalencias` (PS-136; sensible) | Sí | No | No | No | No | No |
| Elegir métodos de ingreso de la empresa | `integraciones.configurar_metodos_ingreso` (PS-137; reautenticación reciente) | Sí | No | No | No | No | No |
| Suspender las integraciones de toda una empresa | Administrador de plataforma (`plataforma.empresas_gestionar`, PS-01); no ve datos del negocio | n/a | n/a | n/a | n/a | n/a | n/a |

Notas
- **Empleado (portal): no aplica.**
- Una clave **nunca** tiene más permisos que su creador (equivale a D-004.6) y se revisa cuando el creador cambia de rol.
- Lo que una clave nunca puede hacer lo fija la **lista única** de la sección 12C de `docs/registro-permisos.md` (regla RN-025 del documento funcional). Este módulo no la repite: la cita. Esas acciones son siempre de una persona.
- Los errores de la API usan los tres mensajes del catálogo: "No encontrado", "No tiene permiso" y "No se puede por una regla" (D-053).

---

## 4. Requisitos

### 4.1 Funcionales

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-INT-001 | Crear una integración con nombre, descripción, permisos, vencimiento y direcciones de red permitidas opcionales. | Fase 3 (INT-1) | CA-INT-01 |
| RF-INT-002 | Mostrar la clave completa una sola vez; después, su identificador público y las últimas 4 letras. | Fase 3 (INT-1) | CA-INT-01 |
| RF-INT-003 | Rotar una clave: la nueva y la anterior conviven hasta 7 días (o menos si se elige). | Fase 3 (INT-1) | CA-INT-07 |
| RF-INT-004 | Revocar una clave con efecto inmediato y motivo. | Fase 3 (INT-1) | CA-INT-07 |
| RF-INT-005 | Mostrar por clave: último uso, direcciones, pedidos del día y errores. | Fase 3 (INT-1) | CA-INT-06 |
| RF-INT-006 | API de lectura de activos, SKU, ubicaciones, catálogos, categorías y campos personalizados, con filtros y páginas. | Fase 3 (INT-1) | CA-INT-02, CA-INT-03 |
| RF-INT-007 | API de lectura de Personas, OC, recepciones, OS, proveedores y centros de costo. | Fase 3 (INT-2) | CA-INT-02 |
| RF-INT-008 | API de escritura limitada a: Personas (crear y editar), SKU, valores de catálogo, OC en Borrador, OS y solicitudes de mesa de ayuda. Todo lo demás es de la lista única de la sección 12C de `docs/registro-permisos.md` (RN-025). | Fase 3 (INT-2) | CA-INT-09, CA-INT-17 |
| RF-INT-009 | Escrituras con clave de idempotencia; repetirlas devuelve el resultado original. | Fase 3 (INT-2) | CA-INT-08 |
| RF-INT-010 | Escritura por lote (hasta 100 elementos), todo o nada. | Fase 3 (INT-2) | CA-INT-08 |
| RF-INT-011 | Límites de uso, con respuesta que indica la espera. | Fase 3 (INT-1) | CA-INT-06 |
| RF-INT-012 | Publicar la documentación de la API y el registro de cambios por versión. | Fase 3 (INT-1) | CA-INT-18 |
| RF-INT-013 | Registrar webhooks con dirección segura, eventos y secreto de firma. | Fase 3 (INT-2) | CA-INT-11, CA-INT-12 |
| RF-INT-014 | Enviar eventos firmados, con reintentos, desde un componente aislado; pausar el webhook que falla de forma sostenida. | Fase 3 (INT-2) | CA-INT-11 |
| RF-INT-015 | Mostrar las entregas (estado, código de respuesta y duración, nunca el cuerpo de la respuesta) y reenviar una. | Fase 3 (INT-2) | CA-INT-11 |
| RF-INT-016 | Mantener equivalencias externas con SAP: proveedor, centro de costo, material (SKU), centro y almacén (ubicación), unidad e indicador de impuesto. | Fase 3 (INT-2) | CA-INT-14 |
| RF-INT-017 | Cargar maestros de SAP con el asistente único "Importar datos" (tipo "maestros de SAP"). | Fase 3 (INT-2) | CA-INT-19 |
| RF-INT-018 | Generar el archivo de OC para SAP de las órdenes pendientes, con vista previa de las que no se pueden exportar y por qué. | Fase 3 (INT-2) | CA-INT-13, CA-INT-14 |
| RF-INT-019 | Registrar cada lote y permitir volver a descargarlo idéntico mientras se conserve su copia. | Fase 3 (INT-2) | CA-INT-13 |
| RF-INT-020 | Registrar el número de documento SAP en la OC (referencia externa), a mano o por la API. | Fase 3 (INT-2) | CA-INT-15 |
| RF-INT-021 | Mostrar el estado de exportación de cada OC: No exportada, Exportada, Exportada con cambios pendientes, Confirmada por SAP. | Fase 3 (INT-2) | CA-INT-15 |
| RF-INT-022 | Elegir los métodos de ingreso de la empresa sin quitar nunca el enlace por correo a los administradores. | Fase 3 (INT-3) | CA-INT-16 |
| RF-INT-023 | Iniciar sesión con Microsoft o Google solo si la cuenta externa fue vinculada antes a un usuario existente. | Fase 3 (INT-3) | CA-INT-16 |
| RF-INT-024 | Avisar a los administradores de vencimientos de claves, webhooks pausados, uso anormal y claves en revisión. | Fase 3 (INT-1) | CA-INT-20 |
| RF-INT-025 | Suspender claves y webhooks cuando la empresa se suspende. | Fase 3 (INT-1) | CA-INT-07 |
| RF-INT-026 | Revisar el alcance de las claves de un usuario cuando cambia su rol. | Fase 3 (INT-1) | CA-INT-05 |

### 4.2 Reglas de negocio

| ID | Regla | Cuándo | CA |
|---|---|---|---|
| RN-INT-001 | Cada clave pertenece a una sola empresa y todo pedido filtra por ella. Un identificador de otra empresa responde "No encontrado". | Fase 3 (INT-1) | CA-INT-03 |
| RN-INT-002 | La clave se guarda como **huella de alta entropía** (al menos 128 bits), nunca en claro; si se pierde, se rota. Cada clave tiene un identificador público propio. Viaja solo en una cabecera, nunca en la dirección. | Fase 3 (INT-1) | CA-INT-01 |
| RN-INT-003 | La clave lleva un prefijo común reconocible para detectores de secretos; el bloqueo y el registro usan el identificador público, no el prefijo. | Fase 3 (INT-1) | CA-INT-10 |
| RN-INT-004 | Vencimiento obligatorio: máximo 365 días, por defecto 180. **[SUPUESTO]** | Fase 3 (INT-1) | CA-INT-07 |
| RN-INT-005 | Solo conexión cifrada; un pedido sin cifrar se rechaza. | Fase 3 (INT-1) | CA-INT-18 |
| RN-INT-006 | Con direcciones de red permitidas, un pedido desde otra dirección se rechaza y cuenta como fallo. | Fase 3 (INT-1) | CA-INT-10 |
| RN-INT-007 | Los permisos de una clave son un subconjunto del registro, con alcance "todo". La escritura no incluye la lectura; se da aparte. | Fase 3 (INT-1) | CA-INT-02 |
| RN-INT-008 | Precios y datos de Personas solo salen con `precios.ver` y `datos_personales.ver` en la clave. **IMEI y número de línea** (datos personales) solo con `datos_personales.ver`. Sin ellos esos campos no se envían. | Fase 3 (INT-1) | CA-INT-02 |
| RN-INT-009 | Ninguna clave da acceso a lo que la lista única de la sección 12C de `docs/registro-permisos.md` (RN-025) reserva a las personas, ni a la configuración de seguridad de la empresa. | Fase 3 (INT-1) | CA-INT-02 |
| RN-INT-010 | Ninguna clave hace las acciones de la lista única de la sección 12C de `docs/registro-permisos.md` (RN-025). La OC creada por API queda en Borrador. | Fase 3 (INT-2) | CA-INT-09 |
| RN-INT-011 | Quien creó, rotó, **asumió o revocó** una clave no puede aprobar una OC creada por esa integración (D-015, D-043). | Fase 3 (INT-2) | CA-INT-09 |
| RN-INT-012 | Las acciones por API se auditan con autor "integración <nombre>" (tipo de autor propio) y, en escrituras, antes y después sin valores de campos personales (D-030, D-041.4). | Fase 3 (INT-1) | CA-INT-21 |
| RN-INT-013 | Las lecturas no se auditan una a una: se guarda el registro de uso (clave, día, módulo, pedidos, errores). La lectura de Personas se registra por pedido (clave, filas y **solo el nombre de los campos filtrados, nunca el texto buscado ni valores personales**, D-030). Una **lectura masiva** (más de 5.000 filas por día por clave) se audita como exportación. | Fase 3 (INT-1) | CA-INT-22 |
| RN-INT-014 | El registro de uso se conserva 90 días y el de entregas de webhooks 30. **[SUPUESTO]** | Fase 3 (INT-1) | CA-INT-11 |
| RN-INT-015 | Límites (cuadro único de D-054): 60 pedidos por minuto y 10.000 por día por clave; 300 por minuto por empresa. El limitador vive en tablas de PostgreSQL. **[SUPUESTO]** los valores. | Fase 3 (INT-1) | CA-INT-06 |
| RN-INT-016 | Máximo 100 elementos por respuesta y 1 MB por pedido. **[SUPUESTO]** | Fase 3 (INT-1) | CA-INT-06 |
| RN-INT-017 | Tras 20 autenticaciones fallidas en 10 minutos con un mismo identificador público, esa clave se bloquea 15 minutos y se avisa a los administradores. | Fase 3 (INT-1) | CA-INT-10 |
| RN-INT-018 | Los errores no revelan si una clave existe, ni detalles internos, ni datos de otras empresas. | Fase 3 (INT-1) | CA-INT-10 |
| RN-INT-019 | Dentro de una versión de la API solo se agregan campos o funciones; nunca se quitan ni cambia su significado. | Fase 3 (INT-1) | CA-INT-18 |
| RN-INT-020 | Una versión se anuncia como retirada con 12 meses de aviso; conviven como máximo 2. **[SUPUESTO]** | Fase 3 (INT-1) | CA-INT-18 |
| RN-INT-021 | Crear, rotar o revocar claves exige reautenticación reciente (10 minutos) y segunda verificación (PS-133 es sensible). | Fase 3 (INT-1) | CA-INT-04 |
| RN-INT-022 | Si el creador de una clave deja de ser usuario activo, la integración pasa a **"en revisión"** y se avisa a los administradores; si nadie la asume en **7 días**, se suspende. Cuando el creador cambia de rol, se revisa el alcance de sus claves. | Fase 3 (INT-1) | CA-INT-20 |
| RN-INT-023 | **Anti-SSRF (D-047.2):** la dirección de un webhook se valida al registrarla **y en cada envío**; se resuelve el nombre en el envío y se fija la dirección obtenida; se bloquean loopback, redes privadas, 169.254.x.x y sus equivalentes IPv6; solo puerto 443 con conexión cifrada; **no se siguen redirecciones**; hay tope de tiempo (10 s) y de tamaño; no se muestra el cuerpo de la respuesta. | Fase 3 (INT-2) | CA-INT-12 |
| RN-INT-024 | El aviso lleva solo: evento, número de evento, fecha, empresa, tipo e identificador del elemento. Nunca precios, datos personales ni claves. Un caso restringido de derechos de datos nunca emite eventos. | Fase 3 (INT-2) | CA-INT-11 |
| RN-INT-025 | **El secreto del webhook se guarda cifrado** (llave derivada por empresa, D-048.4), se muestra una sola vez y se rota con traslape. Cada aviso va firmado con él más la fecha; el receptor rechaza avisos de más de 5 minutos. | Fase 3 (INT-2) | CA-INT-11 |
| RN-INT-026 | Entrega "al menos una vez": puede haber repetidos; el receptor usa el número de evento. No se garantiza el orden. | Fase 3 (INT-2) | CA-INT-11 |
| RN-INT-027 | Reintentos tras fallo: 1 minuto, 5 minutos, 30 minutos, 2 horas y 12 horas; agotados, el aviso queda Descartado y puede reenviarse a mano. | Fase 3 (INT-2) | CA-INT-11 |
| RN-INT-028 | Si todos los avisos de un webhook fallan durante 24 horas seguidas, pasa a Pausado automático y se avisa a los administradores. | Fase 3 (INT-2) | CA-INT-11 |
| RN-INT-029 | Solo se envían eventos de módulos para los que la integración dueña tiene permiso de lectura y que estén activos en la empresa. | Fase 3 (INT-2) | CA-INT-23 |
| RN-INT-030 | Máximo 10 webhooks por empresa y 64 KB por aviso. **[SUPUESTO]** | Fase 3 (INT-2) | CA-INT-11 |
| RN-INT-031 | El ingreso con Microsoft o Google nunca crea usuarios ni empresas (D-001). Una cuenta sin vincular recibe el mismo mensaje genérico de cualquier acceso fallido. | Fase 3 (INT-3) | CA-INT-16 |
| RN-INT-032 | La cuenta externa se vincula **una sola vez por el identificador inmutable del proveedor**, no por el correo, desde una sesión ya iniciada o una invitación (D-054.5). | Fase 3 (INT-3) | CA-INT-16 |
| RN-INT-033 | La segunda verificación de quien tiene permisos sensibles sigue exigiéndose con Microsoft o Google, y los administradores conservan el enlace por correo. | Fase 3 (INT-3) | CA-INT-16 |
| RN-INT-034 | La plataforma no abre conexión hacia SAP; la frontera son archivos y la API. | Fase 3 (INT-2) | CA-INT-13 |
| RN-INT-035 | Una OC solo se exporta desde Aprobada en adelante; nunca en Borrador, Pendiente o Rechazada. | Fase 3 (INT-2) | CA-INT-13 |
| RN-INT-036 | La OC solo se exporta si todos sus datos tienen equivalencia; si falta una queda "pendiente de equivalencia" y se lista. | Fase 3 (INT-2) | CA-INT-14 |
| RN-INT-037 | Cada línea lleva tipo de registro ALTA, CAMBIO (nueva versión tras reaprobación) o ANULACION, y el **número de versión de la OC**. SAP puede ignorar repetidos por orden + versión. | Fase 3 (INT-2) | CA-INT-15 |
| RN-INT-038 | Exportar a SAP no cambia el estado de la OC en la plataforma, solo su estado de exportación. | Fase 3 (INT-2) | CA-INT-13 |
| RN-INT-039 | La carga de maestros sigue el marco D-050: **solo crea**, rechaza el mismo archivo por su huella, trata una fila existente como error de esa fila y no guarda el archivo. Cambiar o bloquear un maestro ya cargado se hace en la pantalla de equivalencias o por la API (permiso PS-136). Nunca borra datos. | Fase 3 (INT-2) | CA-INT-19 |
| RN-INT-040 | La carga no crea proveedores ni SKU sola: los valores nuevos se listan para que los apruebe quien tenga `proveedores.crear_editar` (D-063.6, D-050.1). | Fase 3 (INT-2) | CA-INT-19 |
| RN-INT-041 | Generar un lote SAP o una lectura masiva por API pasa por la **puerta única de exportación** (motivo, topes de D-054, hoja "Aviso") y queda en la auditoría. | Fase 3 (INT-2) | CA-INT-13, CA-INT-22 |
| RN-INT-042 | Importes con decimales exactos, una moneda por OC, sin conversión (D-014). El impuesto de cada línea y el total siguen el redondeo de D-044.7. | Fase 3 (INT-2) | CA-INT-13 |
| RN-INT-043 | Los archivos de SAP identifican a quien creó y aprobó con un **código interno de usuario**, no con nombre ni correo (D-058). | Fase 3 (INT-2) | CA-INT-13 |
| RN-INT-044 | El lote guarda una copia de las líneas exportadas; es dato guardado y se conserva el plazo de la auditoría (D-050.6). | Fase 3 (INT-2) | CA-INT-13 |
| RN-INT-045 | Si el módulo de una API está apagado en la empresa, la API responde "No encontrado" (D-037 fila 12). | Fase 3 (INT-1) | CA-INT-23 |
| RN-INT-046 | Textos libres recibidos por API pasan por el validador común de claves y patrones peligrosos (D-063.2). | Fase 3 (INT-2) | CA-INT-17 |
| RN-INT-047 | Las claves de idempotencia valen 24 horas en una tabla con vencimiento. **[SUPUESTO]** | Fase 3 (INT-2) | CA-INT-08 |
| RN-INT-048 | Todo proceso de INT (vencimiento de claves, pausas, limpieza, reintentos) es idempotente y recuperable, corre empresa por empresa con "hoy" de cada una, salta empresas suspendidas y deja registro de corrida; escribe con autor "sistema" (D-038.4). | Fase 3 (INT-1) | CA-INT-24 |
| RN-INT-049 | Prefijo `LSAP-` (mínimo 6 dígitos, correlativo por empresa) para lotes. **[SUPUESTO]** | Fase 3 (INT-2) | CA-INT-13 |

### 4.3 Calidad medible

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RNF-INT-001 | Con el volumen de referencia de RNF-010, una lectura simple responde en 500 ms o menos (percentil 95); se mide en la prueba de carga nocturna. | Fase 3 (INT-1) | CA-INT-25 |
| RNF-INT-002 | Revocar una clave surte efecto en 10 segundos o menos. | Fase 3 (INT-1) | CA-INT-07 |
| RNF-INT-003 | Un aviso de webhook sale en 30 segundos o menos desde el evento, si el receptor responde. | Fase 3 (INT-2) | CA-INT-11 |
| RNF-INT-004 | Un lote de 5.000 líneas se genera en 60 segundos o menos, en segundo plano con avance. | Fase 3 (INT-2) | CA-INT-13 |
| RNF-INT-005 | Ninguna clave ni secreto aparece en registros, auditoría, errores, exportaciones ni respaldos en claro (prueba automática de búsqueda). | Fase 3 (INT-1) | CA-INT-26 |
| RNF-INT-006 | Pruebas de aislamiento por módulo con identificador interno, también para escritura por lote, y con los procesos de INT ejecutados con dos empresas (D-039.6). | Fase 3 (INT-1) | CA-INT-03, CA-INT-24 |
| RNF-INT-007 | La documentación coincide con las rutas publicadas (prueba automática). | Fase 3 (INT-1) | CA-INT-18 |
| RNF-INT-008 | Las pruebas de contrato de v1 fallan si se quita o cambia un campo publicado. | Fase 3 (INT-1) | CA-INT-18 |

---

## 5. Estados y transiciones

**Integración y clave**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) | Activa | `integraciones.administrar` | Reautenticación reciente |
| Activa | En revisión | Sistema | Creador inactivo (RN-INT-022) |
| En revisión | Activa | `integraciones.administrar` (otra persona la asume) | Dentro de 7 días |
| En revisión | Suspendida | Sistema | Pasaron 7 días |
| Activa | Suspendida | `integraciones.administrar` o sistema (bloqueo, empresa suspendida) | Motivo; se reactiva a mano |
| Suspendida | Activa | `integraciones.administrar` | Con la empresa reactivada si esa fue la causa |
| Activa | Vencida | Sistema | Pasó el vencimiento |
| Vencida | Activa | `integraciones.administrar` | Solo rotando la clave |
| Cualquiera | Revocada | `integraciones.administrar` | Motivo; final; no se borra |

**Webhook:** Activo ↔ Pausado (`integraciones.administrar_webhooks`); Activo → Pausado automático (sistema, RN-INT-028) → Activo (con aviso de prueba); Activo/Pausado → Desactivado (final).
**Entrega de aviso:** Pendiente → Entregada | Reintentando → Entregada | Descartada.
**Exportación SAP de una OC:** No exportada → Exportada (al generar lote) → Exportada con cambios pendientes (se reaprobó o anuló) → Exportada (nuevo lote) → Confirmada por SAP (al registrar el número SAP). Una OC Anulada ya exportada queda "con cambios pendientes" hasta exportar su ANULACION.
**Lote SAP:** Generado → Descargado → Confirmado (opcional). No se borra.

---

## 6. Datos

| Entidad | Campos principales | Clave y unicidad | Se audita |
|---|---|---|---|
| Integración | empresa, nombre, descripción, estado, permisos, vencimiento, direcciones permitidas, creada por | Nombre único por empresa | Altas, cambios de permisos con antes/después, suspensión, revocación |
| Clave de API | integración, identificador público, últimas 4 letras, huella, vencimiento, estado, último uso | Identificador público único y global; huella única | Creación, rotación, revocación (nunca el valor) |
| Registro de uso | clave, día, módulo, pedidos, errores | Único por clave + día + módulo | No (técnico, 90 días; particionable) |
| Acceso a Personas por API | clave, momento, filas, nombres de los campos filtrados (sin valores) | Una por pedido | Sí, resumido, sin valores personales |
| Idempotencia | clave de idempotencia, resultado, vencimiento | Única por integración + clave | No |
| Límite de uso | clave, ventana, contador | Por clave + ventana | No |
| Webhook | empresa, integración, dirección, eventos, estado, **secreto cifrado** | Único por empresa + dirección + integración | Altas, cambios, pausas |
| Entrega de aviso | webhook, evento, número de evento, estado, intentos, código y duración de respuesta | Único por webhook + número de evento | No (técnico, 30 días) |
| Método de ingreso | empresa, métodos permitidos | Uno por empresa | Cambios con antes/después |
| Cuenta externa vinculada | usuario, proveedor, **identificador inmutable del proveedor** | Único por proveedor + identificador | Vinculación y desvinculación |
| Equivalencia externa | empresa, sistema, tipo, código externo, descripción, elemento interno, estado | Única por empresa + sistema + tipo + código externo | Altas y cambios |
| Lote de importación de maestros | marco D-050 (lote, filas validadas, huella; el archivo no se guarda) | Correlativo por empresa | Una entrada de lote |
| Lote de exportación SAP (`LSAP-`) | empresa, número, generado por, fecha, filtros, órdenes y líneas, **copia de las líneas**, estado | Correlativo por empresa | Una entrada de lote; copia con plazo de la auditoría |
| Valores fijos de exportación | sociedad, organización de compras, grupo de compras, clase de documento | Uno por empresa | Cambios con antes/después |
| Referencia externa en la OC | número SAP, estado de exportación, versión exportada | Una por OC | Cambios |

- **Datos personales declarados:** el correo y el identificador de la cuenta externa (ingreso con Microsoft o Google, INT-3); IMEI y número de línea al leerlos por API (solo con `datos_personales.ver`). Los archivos de SAP no llevan nombres. El registro de uso no guarda datos personales.
- Textos libres: las descripciones y los comentarios no se guardan por valor en la auditoría (solo "el campo cambió", D-030.6). Los **motivos** (por ejemplo el de revocación de una clave) **sí se guardan por valor** en la auditoría; son texto libre no anonimizable de forma garantizada y su copia vence con el plazo de la auditoría (D-077, RF-AUD-003).
- Todo lleva empresa; las tablas globales (clave de API, cuenta externa) se consultan solo por funciones puntuales auditadas (D-039.5).

---

## 7. Pantallas necesarias

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-INT-01 | Integraciones | Lista, estado, vencimiento, último uso | Administrador |
| PAN-INT-02 | Nueva integración / editar | Permisos en una tabla módulo × lectura/escritura, vencimiento, direcciones | Administrador |
| PAN-INT-03 | Mostrar clave | Muestra la clave una vez con "guárdela ahora" | Administrador |
| PAN-INT-04 | Actividad de una clave | Pedidos por día, errores, bloqueos | Administrador |
| PAN-INT-05 | Webhooks | Lista, eventos, estado, aviso de prueba | Administrador |
| PAN-INT-06 | Entregas de un webhook | Intentos, código y duración, reenvío | Administrador |
| PAN-INT-07 | Métodos de ingreso | Enlace por correo, Microsoft, Google | Administrador |
| PAN-INT-08 | SAP: equivalencias | Tablas y filtro "sin vincular" | Administrador |
| PAN-INT-09 | SAP: exportar órdenes | Pendientes, no exportables y su razón, generar lote | Administrador |
| PAN-INT-10 | SAP: lotes | Historial y descarga | Administrador |
| PAN-INT-11 | Documentación de la API | Referencia con ejemplos | Desarrollador de la empresa |

La carga de maestros usa el asistente único "Importar datos". Reglas: tres mensajes del catálogo; botones sin permiso visibles y desactivados con la razón; uso a 360 px.

---

## 8. Notificaciones y automatismos

Los avisos salen por el motor único de Notificaciones; contenido mínimo (D-061.4).

| Cuándo | A quién | Qué dice |
|---|---|---|
| Clave por vencer (30 y 7 días) | Administradores | "Una clave de la integración 'RRHH' vence el 20/11/2026. Rótela a tiempo." |
| Clave creada, rotada o revocada | Administradores | "Se revocó una clave de 'RRHH'." |
| Clave bloqueada por fallos | Administradores | "Una clave de 'RRHH' fue bloqueada 15 minutos por intentos fallidos." |
| Más de 100 respuestas de límite en una hora | Administradores | "La integración 'ERP' superó su límite." |
| Webhook pausado automático | Administradores | "Se pausó un webhook de 'ERP' tras 24 horas de fallas." |
| Integración en revisión | Administradores | "La integración 'RRHH' está en revisión: su creador ya no está activo. Se suspenderá el 02/11/2026." |
| Lote SAP generado | Quien lo generó | "Lote LSAP-000007: 12 órdenes, 3 pendientes de equivalencia." |
| OC con cambios tras exportar | Con `integraciones.sap_exportar` | "OC-000042 cambió después de exportarse." |
| Versión de la API por retirar | Administradores | Aviso a 12, 6 y 1 mes |

**Trabajos** (programador único, D-038): vencimiento de claves, paso a "en revisión" y suspensión, pausa de webhooks, reintentos, limpieza (90 y 30 días) y recordatorio mensual de claves sin uso en 90 días. Todos con RN-INT-048.
**Catálogo único de eventos** `<módulo>.<entidad>_<hecho>` (Notificaciones es dueña; confirmado): `compras.orden_aprobada`, `compras.orden_anulada`, `compras.recepcion_confirmada`, `inventario.activo_creado`, `inventario.activo_estado_cambiado`, `inventario.activo_asignado`, `inventario.activo_devuelto`, `catalogo.sku_creado`, `personas.persona_creada`, `personas.persona_cesada`, `servicio.os_creada`, `servicio.os_cerrada`, `ayuda.caso_creado`, `ayuda.caso_cerrado`, `ayuda.caso_resuelto`. Los casos restringidos nunca se suscriben.

---

## 9. Integración con el núcleo y con otros módulos

- **Núcleo:** empresa, membresías y Personas, roles y registro de permisos, auditoría con tres tipos de autor, sesiones, segunda verificación y reautenticación, marco de importación (D-050), puerta de exportación, cola y bus de eventos, gestión de secretos y llaves derivadas por empresa (D-048.4), interruptor de módulos, administrador de plataforma.
- **Pedidos al núcleo (aceptados):** referencia externa y número de versión de la OC (sube con cada reaprobación); código externo en proveedor, ubicación y centro de costo; tipo de autor "integración".
- **Registro de módulo (D-038.6):** permisos `integraciones.*`; emite eventos del catálogo; escucha los eventos del catálogo para webhooks; pendiente de la persona "integraciones que creó" (informativo).
- **proveedores-contratos (A):** lectura de proveedores y contratos; código SAP como equivalencia; la API nunca crea ni cambia proveedores.
- **presupuesto-costos (PRE):** código externo del centro de costo; presupuestos solo con `precios.ver` en la clave.
- **reportes-tableros (REP):** una lectura masiva se trata como exportación; los reportes no se obtienen por API, solo los datos base.
- **mesa-de-ayuda (C):** escritura de solicitudes; eventos `ayuda.caso_*`; los casos restringidos no emiten eventos.
- **notificaciones (C):** dueña del catálogo de eventos y de los correos.
- **personas-ubicaciones (D), cmdb-ligera (E):** lectura; Personas exige `datos_personales.ver` en la clave.

### Contrato de datos con SAP (en lenguaje simple)

**A. Maestros que entran (SAP → plataforma)**, por archivo (.xlsx o .csv) en el asistente "Importar datos" o por la API de escritura con PS-136. Una fila por elemento, encabezados fijos.
- **Proveedores:** código SAP (obligatorio), nombre, identificador fiscal, país, correo de contacto, bloqueado (S/N).
- **Centros de costo:** código SAP, nombre, vigente desde, vigente hasta, bloqueado (S/N), código interno opcional.
- **Materiales:** código de material SAP, descripción, unidad de medida, grupo de materiales, bloqueado (S/N), código de SKU interno opcional.
- **Centros y almacenes:** código, nombre, tipo, código de ubicación interna opcional.
- **Unidades e indicadores de impuesto:** código SAP, descripción, porcentaje (solo impuestos).
- Reglas: la clave es el código SAP; la carga solo crea (RN-INT-039); lo nuevo se lista para aprobar (RN-INT-040).

**B. Órdenes que salen (plataforma → SAP)**, un archivo con una fila por línea de OC (.csv UTF-8 o .xlsx).
- Datos repetidos en cada fila: tipo de registro (ALTA, CAMBIO, ANULACION), número de OC (`OC-000042`), versión, fecha, código SAP del proveedor, moneda, sociedad, organización y grupo de compras (valores fijos de la empresa), centro de costo (código SAP), código interno de quien creó y de quien aprobó.
- Datos de la línea: número de línea, material SAP (o código de SKU), descripción, cantidad, unidad SAP, precio unitario sin impuesto (hasta 4 decimales, punto decimal), indicador de impuesto SAP, centro y almacén de destino.
- Reglas: una moneda por orden; fórmulas neutralizadas solo en celdas de texto; el número de documento SAP vuelve por pantalla o por la API. No se exportan recepciones ni pagos.

---

## 10. Criterios de aceptación

Cada criterio cita el requisito que cubre.
- **CA-INT-01 Clave visible una vez.** *Cubre RF-INT-001, 002, RN-INT-002.* Dado un administrador que crea la integración "RRHH", cuando guarda, entonces ve la clave completa una vez; al recargar solo ve su identificador público y las últimas 4 letras; la base guarda solo la huella.
- **CA-INT-02 Permisos respetados.** *Cubre RF-INT-006, 007, RN-INT-007 a 009.* Dado una clave con `activos.ver` sin `datos_personales.ver`, cuando pide un activo asignado, entonces no recibe nombre de la Persona, ni IMEI ni número de línea; cuando pide Personas recibe "No tiene permiso".
- **CA-INT-03 Aislamiento entre empresas.** *Cubre RN-INT-001, RF-INT-006, RNF-INT-006.* Dado una clave de la empresa A y el identificador interno de un activo de B, cuando lo pide, también por escritura en lote con un elemento de B, entonces recibe "No encontrado" y no se escribe nada.
- **CA-INT-04 Permiso denegado.** *Cubre RN-INT-021, sección 3.* Dado una Jefatura TI sin `integraciones.administrar`, cuando intenta crear una clave por pantalla o por llamada directa, entonces recibe "No tiene permiso" y el intento queda en el registro de seguridad; un Administrador sin reautenticación reciente debe volver a verificarse.
- **CA-INT-05 Nadie da más de lo que tiene.** *Cubre RF-INT-026, sección 3.* Dado un administrador sin `precios.ver`, cuando intenta dar `precios.ver` a una clave, entonces se impide; si a un administrador con una clave de lectura se le quita `datos.exportar`, la clave pasa a revisión.
- **CA-INT-06 Límite de uso.** *Cubre RF-INT-005, 011, RN-INT-015, 016.* Dado un límite de 60 pedidos por minuto, cuando el pedido 61 llega, entonces recibe límite superado con los segundos de espera y los anteriores no se afectan.
- **CA-INT-07 Revocación inmediata.** *Cubre RF-INT-003, 004, 025, RN-INT-004, RNF-INT-002.* Dado una clave activa, cuando se revoca, entonces el siguiente pedido (en 10 segundos o menos) se rechaza, la auditoría guarda quién, cuándo y motivo, y con la empresa suspendida todas sus claves responden suspendidas.
- **CA-INT-08 Escritura sin duplicar.** *Cubre RF-INT-009, 010, RN-INT-047.* Dado un pedido que crea una OC en Borrador con clave de idempotencia X, cuando se repite por un corte, entonces existe una sola OC y la segunda respuesta es la misma; un lote con un elemento inválido no escribe ninguno.
- **CA-INT-09 La API no aprueba.** *Cubre RF-INT-008, RN-INT-010, 011; RN-025.* Dado una clave con escritura de OC, cuando intenta aprobar o recibir, entonces la acción no existe para claves; la OC queda en Borrador; si Pedro creó la clave y la integración creó la OC-000100, Pedro no puede aprobarla.
- **CA-INT-10 Clave desconocida y bloqueos.** *Cubre RN-INT-003, 006, 017, 018.* Dado 20 intentos fallidos con el identificador público de una clave, entonces esa clave se bloquea 15 minutos sin afectar a otras; la respuesta no revela si la clave existe.
- **CA-INT-11 Webhook firmado con reintentos.** *Cubre RF-INT-014, 015, RN-INT-014, 024 a 028, 030, RNF-INT-003.* Dado un webhook para `compras.orden_aprobada`, cuando se aprueba una OC y el receptor falla, entonces se reintenta a 1, 5 y 30 minutos; el aviso lleva firma y fecha, sin importes ni datos personales, y la pantalla muestra código y duración, nunca el cuerpo de la respuesta.
- **CA-INT-12 Anti-SSRF.** *Cubre RF-INT-013, RN-INT-023.* Dado el registro de webhooks a `http://192.168.1.10/hook`, `https://localhost/hook`, `https://169.254.169.254/`, una dirección IPv6 interna, un puerto 8443, un nombre que resuelve a una dirección interna, y una dirección pública que responde con redirección a una interna, entonces cada caso se rechaza al registrar o al enviar, sin seguir la redirección y sin mostrar la respuesta; un nombre que cambia de dirección entre el registro y el envío se vuelve a validar.
- **CA-INT-13 Exportación SAP completa.** *Cubre RF-INT-018, 019, RN-INT-034, 035, 038, 041 a 044, 049, RNF-INT-004.* Dado una OC Aprobada con todas sus equivalencias, cuando el Administrador (con `datos.exportar` y `integraciones.sap_exportar`) genera el lote con su motivo, entonces el archivo tiene una fila por línea con ALTA, versión 1 y precios sin impuesto, con código interno de usuario y sin nombres; la OC pasa a "Exportada", el lote `LSAP-000001` guarda la copia y la auditoría lo registra; sin `datos.exportar` el botón queda desactivado con la razón.
- **CA-INT-14 Equivalencia faltante.** *Cubre RF-INT-016, 018, RN-INT-036.* Dado una OC cuyo proveedor no tiene código SAP, cuando se genera el lote, entonces esa OC se lista como "pendiente de equivalencia: proveedor" y el resto se genera.
- **CA-INT-15 Cambios tras exportar.** *Cubre RF-INT-020, 021, RN-INT-037.* Dado una OC exportada que se edita y reaprueba, cuando se genera el siguiente lote, entonces sale con CAMBIO y versión 2; si se anula, con ANULACION; al registrar el número SAP queda "Confirmada por SAP".
- **CA-INT-16 Ingreso externo (INT-3).** *Cubre RF-INT-022, 023, RN-INT-031 a 033.* Dado un correo sin invitación o una cuenta de Google no vinculada, cuando intenta entrar, entonces recibe el mensaje genérico y no se crea usuario; una cuenta vinculada por su identificador inmutable entra aunque cambie su correo en el proveedor; un administrador sigue necesitando segunda verificación.
- **CA-INT-17 Texto libre y lo prohibido.** *Cubre RF-INT-008, RN-INT-046.* Dado un pedido de escritura con una descripción con bloque de clave privada, entonces se rechaza; un pedido para cesar una Persona o editar un proveedor recibe "No se puede por una regla".
- **CA-INT-18 Versionado.** *Cubre RF-INT-012, RN-INT-005, 019, 020, RNF-INT-007, 008.* Dado la versión v1 publicada, cuando un cambio quita un campo, entonces la prueba de contrato falla; un pedido sin conexión cifrada se rechaza.
- **CA-INT-19 Carga de maestros.** *Cubre RF-INT-017, RN-INT-039, 040.* Dado un archivo de proveedores SAP ya importado, cuando se vuelve a subir, entonces se rechaza entero con la fecha del lote; un archivo corregido con una fila existente marca ese error de fila; un usuario sin `proveedores.crear_editar` no puede aprobar proveedores nuevos.
- **CA-INT-20 Creador inactivo.** *Cubre RF-INT-024, RN-INT-022.* Dado el creador de una clave dado de baja, entonces la integración pasa a "en revisión" con aviso; a los 7 días sin asumirla se suspende; si otra persona la asume antes, sigue Activa.
- **CA-INT-21 Autor integración.** *Cubre RN-INT-012.* Dado una OC creada por API, entonces la auditoría muestra autor "integración" con su nombre y la OC lo indica en "Pedido por".
- **CA-INT-22 Lectura masiva.** *Cubre RN-INT-013, 041.* Dado una clave que lee 6.000 filas de activos en un día, entonces el sistema registra una entrada de lectura masiva en la auditoría como exportación; con IMEI solo si la clave tiene `datos_personales.ver`.
- **CA-INT-23 Módulo apagado.** *Cubre RN-INT-029, 045.* Dado el módulo de licencias apagado, cuando una clave pide licencias, entonces recibe "No encontrado" y no se envían sus eventos.
- **CA-INT-24 Procesos con dos empresas.** *Cubre RN-INT-048, RNF-INT-006.* Dado dos empresas (una suspendida) y una caída de dos días, cuando corren los procesos, entonces no hay duplicados, se recuperan los días en orden, cada aviso queda en su empresa y la suspendida se salta.
- **CA-INT-25 Rendimiento.** *Cubre RNF-INT-001.* Dado el volumen de RNF-010, cuando corre la prueba de carga nocturna, entonces una lectura simple responde en 500 ms o menos (percentil 95).
- **CA-INT-26 Secretos.** *Cubre RNF-INT-005.* Dado un ciclo completo (crear clave, webhook, revocar), entonces una búsqueda automática no encuentra ninguna clave ni secreto en base, auditoría, registros, errores ni exportaciones.

---

## 11. Casos límite

1. Clave filtrada en un repositorio público: el detector la reconoce por el prefijo; se revoca y se revisa el registro de uso.
2. Rotación con la clave anterior en uso durante 7 días: ambas funcionan; se destaca el uso de la anterior.
3. Reloj desfasado del receptor: rechaza avisos por antigüedad.
4. Receptor que responde pasados 10 segundos: fallo y reintento.
5. Webhook de un módulo cuyo permiso se retira: se pausa y se avisa.
6. Archivo de maestros con códigos SAP repetidos: la vista previa lo rechaza (todo o nada).
7. Material SAP bloqueado vinculado a un SKU activo: aviso; el SKU no se desactiva solo.
8. Equivalencia eliminada tras exportar: la siguiente exportación queda pendiente de equivalencia.
9. OC con más de 999 líneas: el archivo las numera sin límite.
10. Persona anonimizada: la API devuelve "Persona anonimizada 0042".
11. Empresa suspendida: claves y webhooks responden suspendidos.
12. Usuario con Google y enlace por correo: misma cuenta (D-002.4).
13. Cuenta externa cuyo correo cambia: sigue entrando por el identificador inmutable.
14. Lote de maestros deshecho tras vincular equivalencias: avisa los vínculos que quedarán sin código.
15. Un caso restringido: nunca genera evento ni aparece por API.
16. Clave de un creador que cambió de rol y perdió permisos: pasa a revisión y no excede los permisos del creador.

---

## 12. Decisiones propuestas y supuestos

| ID | Tipo | Propuesta y motivo |
|---|---|---|
| S-INT-01 | Resuelto (D-056) | INT-1, INT-2 e INT-3 son Fase 3, ola F. |
| S-INT-02 | Resuelto (D-041.4, D-057 S-28) | Tres tipos de autor de la auditoría: usuario (membresía), integración y sistema, desde la Etapa 1. |
| S-INT-03 | [SUPUESTO] | Las claves son de la empresa, con vencimiento obligatorio y aviso. |
| S-INT-04 | Resuelto (D-058) | Escritura por API limitada a Personas (sin cesar), SKU, catálogos (sin proveedores), OC en Borrador, OS y solicitudes. |
| S-INT-05 | [SUPUESTO] | Los avisos de webhooks llevan solo identificadores. |
| S-INT-06 | [SUPUESTO] | Límites 60/min y 10.000/día por clave y 300/min por empresa; 12 meses de aviso de retiro. |
| S-INT-07 | [SUPUESTO] | SAP solo por archivos y por la API; la plataforma no abre conexión hacia SAP. |
| S-INT-08 | **[ESCALAR AL CEO]** | **Licencias y costos de conectores SAP.** Conectar directo puede requerir licencias de SAP, un consultor y habilitar interfaces. No se cotiza. Se pide confirmar si la empresa tiene SAP S/4HANA, qué módulos de compras usa y quién lo administra. Mientras tanto, el intercambio por archivos y API no tiene costo de licencia propio. |
| S-INT-09 | **[ESCALAR AL CEO]** | **Ingreso con Microsoft o Google:** si el proveedor exigiera verificación formal o pago, se consulta antes. Hoy se asume que nombre y correo verificado no cuestan. También depende de la opinión legal sobre proveedores externos (L-07). |
| S-INT-10 | Resuelto (D-058) | Una lectura masiva por API se trata como exportación; la clave de lectura la crea quien tiene `datos.exportar`. |
| S-INT-11 | [SUPUESTO] | Sociedad, organización y grupo de compras los configura la empresa; la plataforma valida solo el formato. |
| S-INT-12 | Resuelto (D-054.5) | El ingreso externo no sustituye el enlace por correo ni la segunda verificación. |
| S-INT-13 | Resuelto (D-058) | Los archivos de SAP llevan un código interno del usuario, no el nombre. |
| S-INT-14 | [SUPUESTO] | En entornos de prueba, una bandera permite un receptor de captura; nunca en producción (pedido de QA; lo revisa Seguridad). |
| S-INT-15 | [SUPUESTO] | Alta de Personas por API exige código de empleado o correo, como la importación (D-050.4). |
| S-INT-16 | [SUPUESTO] | Prefijo `LSAP-` registrado en la tabla de prefijos reservados. |

---

## 13. Fuera de alcance

- Conector directo o permanente hacia SAP; exportación de recepciones, pagos y facturas a SAP.
- Consulta automática de SAP desde la plataforma.
- Usuario y contraseña en la API; solo claves por integración.
- Autorización delegada por usuario (una aplicación que actúa en nombre de una persona).
- Cualquier acción de la lista única de la sección 12C de `docs/registro-permisos.md` (RN-025) por API.
- Webhooks con datos completos; tienda de aplicaciones de terceros.
- Límites distintos por plan comercial o cobro por uso.
- Otros proveedores de identidad e ingreso único corporativo administrado.
- Adjuntos por API (D-022).
- Aplicación móvil propia.

---

## 14. Historial de cambios (v0.1 a v0.2)

| Cambio | Decisión o hallazgo que lo motiva |
|---|---|
| El secreto del webhook se guarda cifrado, visible una vez y rotable (RN-INT-025); se retira la "huella" del secreto | D-047.1, D-048.4; H-SEG-03, H-ARQ-05 |
| Anti-SSRF completo: validar al registrar y al enviar, fijar la dirección, bloquear redes internas, solo 443, sin redirecciones, sin mostrar la respuesta, componente aislado (RN-INT-023, CA-INT-12 con siete casos) | D-047.2; H-SEG-05 |
| Claves con huella de alta entropía e identificador público propio; bloqueo por identificador (RN-INT-002, 003, 017) | D-047.1; H-SEG-25 (a) |
| Revisión del alcance al cambiar el rol del creador; creador inactivo pasa a "en revisión" y se suspende a los 7 días (RN-INT-022, RF-INT-026) | D-047.1; H-SEG-25 (b), H-CUM-14 |
| Los alcances de una clave son un subconjunto del registro de permisos; se retira `activos:lectura`; mismos servicios y validadores que las pantallas | D-036.6, D-047.3; H-ARQ-20 |
| Permisos reemplazados por PS-nn (`sap_importar` y `reportes.exportar` retirados; `datos.exportar`, `datos.importar`, `proveedores.crear_editar`; `integraciones.sap_exportar` PS-220); Jefatura TI sin ver integraciones ni uso; se declara "Empleado (portal): no aplica" | D-036, D-037, D-063.6; `docs/registro-permisos.md` |
| Limitador en tablas de PostgreSQL y tabla de idempotencia con vencimiento (RN-INT-015, 047) | D-054.2; H-ARQ-20 |
| Catálogo único de eventos `<módulo>.<entidad>_<hecho>` acordado con Notificaciones; los casos restringidos no emiten eventos | D-038.5; H-ARQ-01; mensajes con escuadrón C |
| Escritura sin proveedores ni desactivar Personas (RF-INT-008, RN-INT-010); texto libre con validador común | D-047.3, D-058, D-063.2; H-CUM-14 |
| Lectura masiva (más de 5.000 filas por día por clave) auditada como exportación; IMEI y número de línea solo con permiso de datos personales (RN-INT-008, 013, 041) | D-054.2, D-063.4, D-061.6; H-SEG-12 |
| Ingreso con Microsoft o Google vinculado por el identificador inmutable del proveedor (RN-INT-032) | D-054.5; H-SEG-20 |
| SAP: archivos con código interno de usuario; copia del lote como dato guardado con el plazo de la auditoría; la carga de maestros usa el marco D-050 y exige `proveedores.crear_editar`; el archivo no se guarda; "solo crea" reemplaza la actualización por carga | D-058, D-050, D-063.6; H-CUM-14 |
| La generación de lotes SAP pasa por la puerta única de exportación (RN-INT-041) | D-061.1 |
| Número de versión de la OC como pedido aceptado al núcleo (RN-INT-037) | H-QA-22 (5) |
| Tres tipos de autor de auditoría (S-INT-02 resuelto) y autor "sistema" en los procesos | D-041.4, D-057 |
| Procesos con idempotencia, recuperación y "hoy" por empresa; prueba con dos empresas (RN-INT-048, CA-INT-24) | D-038.4, D-039.6; H-ARQ-01, H-SEG-02 |
| Módulo apagado responde "No encontrado" (RN-INT-045) | D-037 fila 12 |
| Reautenticación reciente de 10 minutos para crear claves (RN-INT-021) | D-048.2; H-SEG-06 |
| Volumen citado desde RNF-010; prueba de carga nocturna (RNF-INT-001) | D-057 S-19 |
| Prefijo `LSAP-` y pantallas `PAN-INT-nn`; fechas dd/mm/aaaa; "usted"; "Cliente (CEO)" | D-049, D-053 |
| Columnas "Cuándo" y "CA"; cada CA cita lo que cubre; 26 criterios (nuevos: siete casos SSRF, lote atómico, lectura masiva, creador inactivo, módulo apagado, procesos con dos empresas, rendimiento, búsqueda de secretos) | Plan de correcciones regla 2; H-AUD-21; QA y Seguridad |
| S-INT-08 y S-INT-09 siguen escalados por costo y por tema legal | D-058; Cumplimiento (C4) |
| **v0.3:** PS-135 `integraciones.administrar_webhooks` pasa a sensible con reautenticación reciente; "Cuándo" con las tres palabras (`Fase 3 (INT-1)`, `(INT-2)`, `(INT-3)`); confirmado el evento único `inventario.activo_estado_cambiado` | D-068, D-075 (N-AUD-06); `docs/equipo/plan-aplicacion.md` |
| La auditoría de lecturas de Personas guarda solo los nombres de los campos filtrados; RN-INT-011 incluye a quien asume o revoca la clave | D-030; Auditor de Cumplimiento R-07 y R-12 (ronda 3) |
| Se quita la lista propia de acciones que una clave no puede hacer (nota de la sección 3, RF-INT-008, RN-INT-009, RN-INT-010 y sección 13); el módulo cita la lista única de la sección 12C de `docs/registro-permisos.md` (RN-025) | D-081.4d; `docs/trazabilidad.md` |
