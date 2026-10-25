# Plan de pruebas

**Autor:** QA (qa-tester) · **Fecha:** 2026-10-25 · **Versión:** 1.0 (borrador para la condición 12 de D-064)
**Se apoya en:** `docs/documento-funcional.md` v0.3, `docs/registro-permisos.md`, `docs/equipo/decisiones.md` (D-035 a D-064), `docs/calidad/criterios-por-etapa.md` y `docs/trazabilidad.md`.
**Estado:** no hay código todavía. Nada de lo que dice este plan está ejecutado. Cada resultado esperado sale de un documento; si el documento cambia, se cambia el plan.

---

## 1. Reglas del plan

1. **Se prueba contra PostgreSQL real**, con las mismas reglas por fila y los mismos roles que producción. Una prueba de aislamiento o de concurrencia contra una base simulada no demuestra nada.
2. **Las pruebas de aislamiento corren con `app_empresa`** (no dueño de las tablas, sin BYPASSRLS, sin superusuario), y una prueba verifica que ese rol es así.
3. **Por identificador interno.** Una prueba que pide algo de otra empresa usa el identificador interno, no un número visible que también exista en la empresa propia.
4. **Todo permiso se prueba por petición directa al servidor**, no solo por la pantalla.
5. **Todo proceso automático se prueba con dos empresas** y con un reloj que la prueba fija.
6. **Nada de datos reales** (D-028). Todo ficticio, con dominio `.test`.
7. **Un defecto sin pasos para reproducirlo no es un reporte.** Formato en la sección 8.
8. **No se da por aprobado lo que no se ejecutó.** Si una prueba no se pudo correr, el informe lo dice.

Convención: **B** = bloqueante (si falla, la etapa no se aprueba), **S** = seguimiento (se reporta, no frena). Los criterios de aceptación (CA) citados están en la sección 22 del documento funcional y, para los módulos, en cada archivo de `docs/modulos/`; su etapa y su tipo, en `criterios-por-etapa.md`.

---

## 2. Pruebas transversales

Se escriben una vez y corren siempre.

| Prueba | Qué hace | Dónde corre |
|---|---|---|
| **Matriz de permisos** | Lee `registro-permisos.md` y lanza una petición directa por celda: 482 celdas en la v1 (68 filas por 7 plantillas más 6 de plataforma). Verifica sensibles (segunda verificación), alcance "propio" con y sin Persona vinculada, módulos apagados ("no encontrado") y que el código no use un permiso fuera del registro | Cada cambio |
| **Roles de base de datos** | `app_empresa` no es dueño ni BYPASSRLS ni superusuario; `app_plataforma` solo ve tablas globales; `mantenimiento` solo archiva por partición; `lector_auditoria` solo lee; nadie edita ni borra la auditoría | Cada cambio |
| **Aislamiento por módulo y por tabla** | Dos empresas con los mismos códigos, series, correos e identificaciones fiscales; un usuario de A pide listado, búsqueda, identificador interno y número visible de B; una consulta sin filtro devuelve vacío; escribir una referencia a B falla | Cada cambio |
| **Patrones de concurrencia (T-11)** | Una prueba por patrón: (1) índice único parcial "una vigente" (asignación, puesto); (2) actualización condicional con estado esperado (aprobar, recibir); (3) capacidad con CHECK (stock, puestos); (4) clave de idempotencia (confirmar, doble clic); (5) columna de versión (edición simultánea, CA-051). Con 20 conexiones simultáneas, y con 50 en la nocturna | Cada cambio (20); nocturna (50) |
| **Procesos con dos empresas** | Con reloj fijado, el proceso corre dos veces; cada aviso y cada registro de corrida queda en su empresa; un día perdido se recupera en orden; una empresa suspendida se salta | Cada cambio |
| **Cola y trabajador** | Trabajo idempotente; reintento; dos trabajadores con `SKIP LOCKED` no repiten; reiniciar el trabajador a mitad no duplica ni pierde; el trabajo corre con la empresa fijada | Cada cambio |
| **Nombre canario** | Registrar una Persona "canario" y buscarla en base, exportaciones, correos capturados y registros técnicos (CA-073) | Cada cambio |
| **Interruptor único (8 casillas)** | Para cada casilla (compras, recepción, presupuestos, contratos, licencias, mesa de ayuda, cambios, problemas) y su acto: apagada rechaza; activa acepta con aviso y auditoría; vencida (reloj +90 días) rechaza; con dos o más administradores exige confirmación de un segundo; el Administrador de plataforma no la activa; la autoentrega se rechaza aunque estén las 8 activas | Etapa 5 en adelante |
| **Texto malicioso** | Texto con HTML, `file://`, fórmulas y bloques de clave privada en cada campo de texto, PDF y exportación | Nocturna |
| **Accesibilidad automática** | Contraste AA, uso solo por teclado, 360 px sin desplazamiento horizontal, objetivos de 44 px | Nocturna; revisión manual en Etapa 7 |

---

## 3. Plan por etapa

Cada etapa incluye además: aislamiento de cada tabla y módulo nuevo, permiso denegado por petición directa de cada acción nueva, regresión de las etapas anteriores y, si el módulo tiene proceso diario, correrlo con dos empresas.

| Etapa | Qué se prueba | Con qué datos (sección 6) | Bloqueante (B) / seguimiento (S) |
|---|---|---|---|
| **0 · Validación** | **Prototipo técnico de 3 a 4 días (D-055)**, que QA mide con estos criterios de éxito: (1) los 7 de aislamiento (consulta sin filtro = 0 filas ajenas; insertar con empresa ajena falla; clave foránea cruzada falla; UPDATE y DELETE ajenos afectan 0; 50 peticiones intercaladas sobre un grupo compartido sin que la empresa quede pegada; conexión limpia tras un error; el rol de la aplicación no puede modificar la auditoría); (2) tabla particionada, índice parcial, consulta recursiva, actualización condicional, SECURITY DEFINER y los 5 roles; (3) sesiones en base, enlace con botón atado al navegador, segunda verificación y espera 1, 2, 5 y 15 minutos; (4) cola y trabajador (reintento, `SKIP LOCKED`, idempotencia, reinicio); (5) 20 y 50 conexiones simultáneas sobre contadores. Todo sobre el proveedor candidato y su agrupador de conexiones, con `app_empresa`. Además: prueba de tareas de las 26 pantallas A con 5 personas no técnicas (recepción de 38 series, buscar un equipo, entregar, aprobar); este plan y la trazabilidad en su lugar | Dos empresas mínimas; una tabla de ejemplo; generador de datos | **B:** los 5 grupos del prototipo con el rol sin privilegios (D-064 condición 4); plan y entorno (condición 12). **S:** tiempos de las tareas |
| **1 · Cimientos** | Invitación: segundo uso, a los 8 días, desde otro correo, mayúsculas; el texto no revela si el correo tenía cuenta (CA-005). Sin registro abierto ni filtración; 5 intentos y esperas de 1, 2, 5 y 15 minutos; tiempos de respuesta iguales (CA-006). Segunda verificación por permiso, no por nombre de rol, con un rol "Contador" (CA-007, 081). Códigos de recuperación (CA-082). Enlace atado al navegador, 15 minutos, un solo uso (CA-068). Sesiones: 30 minutos, 12 horas, aviso a los 25 (CA-008, 069). Último administrador y sin autoescalada (CA-009, 010). Matriz de 482 celdas (CA-011a, b). Doble control del Administrador (CA-012). Administrador de plataforma: no ve negocio por el rol de base, soporte de solo lectura 24 horas, rescate con control dual y veto, contacto autorizado, acceso de emergencia (CA-015a a d). Roles plantilla (CA-047). Aviso de privacidad (CA-049). Cambio de empresa por dirección y dos pestañas (CA-004, 079). Auditoría solo-agregar, qué se audita, eventos de seguridad aparte (CA-040 parte a, 041, 066, 002). Moneda, zona y calendario (CA-071). Módulos activables (CA-075). Procesos y reloj (CA-077 parte infraestructura). NOT-base: invitación, enlace y aviso a quien aprueba (CA-NOT-01, 12, 13, 14, 18) con los topes del cuadro RS-45 | Empresas A, B y C; 7 plantillas por empresa; usuario en A y B; administrador con y sin 2F; correos con mayúsculas y etiqueta `+`; rol "Contador"; relojes R2, R3 | **B:** CA-001 a 011b, 015a a d, 040 (parte a), 041, 042, 047, 049, 066, 068, 069, 071, 075, 077, 079, 081, 082; matriz sin celdas sin probar; reloj y disparador operativos. **S:** CA-050a/b a lo ya construido |
| **2 · Catálogos y Personas** | Catálogos por empresa; desactivar y no borrar (CA-045). Prefijo de 2 a 5 caracteres, único, sin los reservados (`OC`, `OS`, `ACT`…) (CA-017). Ubicaciones en árbol de 3 niveles, ciclos, mover sin escribir movimientos por activo (CA-PRS-08). Campos de 6 tipos: obligatorio vacío, texto en número, opción inexistente (CA-020); no borrar ni cambiar el tipo con datos (CA-021); campo secreto e identificador (parte de definición de CA-065 y CA-042). Personas: alta, homónimo con aviso, correo único Unicode (CA-016 parte de definición, CA-PRS-01, 02); `datos_personales.ver` y referencia `PRS-0042` (CA-011b, CA-PRS-07); vínculo 1 a 1 (CA-PRS-10). Cese **que se acepta siempre** y, si hay cuenta vinculada, exige además `usuarios.suspender` (si no, se rechaza y nada cambia; RF-PER-005, CA-052a, CA-PRS-05). Anonimizar a dos personas (CA-PRS-06, 14 parte de Etapa 2). Solicitudes de derechos invisibles por todas las vías (CA-076, CA-PRS-15). Proveedor: identificación fiscal normalizada (CA-PRV-01), contactos, exportación sin contactos (CA-PRV-15), anonimizar un contacto (CA-PRV-16). Puerta única de exportación: motivo, 10 por hora, 50.001 filas, hoja "Aviso", columnas omitidas, fórmulas como texto (CA-043, 067). Registro de anonimizaciones fuera de la base (RF-DAT-016) | 4 categorías (LAP, CEL, PER, LIC); 8 campos de los 6 tipos; 30 Personas con 2 homónimos y 1 canario; catálogos de 200 valores; ubicaciones de 3 niveles con 40 hijos | **B:** CA-017, 020, 021, 043, 045, 067, 076; CA-PRS-01 a 10, 15; aislamiento de catálogos y Personas; validación en el servidor. **S:** rendimiento de listas |
| **3 · SKU** | Correlativo con 20 y con 50 usuarios simultáneos (CA-018). Código propio y salto del contador (CA-019); sin el permiso `skus.codigo_propio` no se escribe ni por petición directa. No se reutiliza un código aunque se desactive el SKU. `lap-0001` igual a `LAP-0001 `. Mismo código en A y B (CA-017). Modo de control y categoría inmutables con existencias (CA-022). SKU por serie sin serie (inicio de CA-023). Decimales según la unidad de medida. Más de 9.999 códigos. Stock mínimo opcional | Contador de `LAP` en `LAP-0010`; 50 conexiones; SKU por serie y por cantidad | **B:** CA-017, 018 (1.000 corridas sin repetidos, PostgreSQL real), 019, 022 |
| **4 · Inventario e importación** | Serie duplicada y normalización (CA-023). **Las 25 combinaciones de estado** más devolver estando En reparación (CA-058). Responsable por estado forzado desde la base. Asignación única con 2 y con 20 técnicos (CA-025, CA-ENT-03). Stock nunca negativo (CA-026). Traslado (CA-027). Reingreso del mismo registro (CA-028). Ingreso manual (CA-059). Cambio de ubicación (CA-060). Corregir costo (CA-063). **Acta**: PDF; sin `datos_personales.ver` omite nombre y área; la copia del nombre dura hasta `retener_hasta`; texto malicioso (CA-046, CA-ENT-12, 13, 14, CA-078). Autoentrega sin excepción (CA-079b, CA-ENT-09). Pendiente de devolución (CA-081b). **Garantía: fin = (inicio menos 1 día) más los meses, ajustado al último día del mes** (CA-082b: 15/01/2026 + 24 meses = 14/01/2028; CA-GAR-01: 15/03/2024 + 36 = 14/03/2027; CA-GAR-15: 28/02 y 28/02/2029). Clave de licencia: cifrada, enmascarada (16 o más caracteres), revelación con reautenticación, 20 por hora, 30 segundos (CA-042). **Importación todo o nada con huella**: 100 filas con 3 inválidas; el mismo archivo ya confirmado se rechaza con fecha y lote; el corregido carga; una fila que ya existe es error de fila; deshacer = anular y solo sin movimientos posteriores (secuencia, no hora); `3,5E+14`; fórmulas; columna de empresa; 5.001 filas; 10 MB; UTF-8 con tildes; encabezados cambiados; una importación a la vez; SKU y marcas desconocidos listados para aprobar (CA-038, 039, 056, CA-PRS-11). Edición simultánea (CA-051). **Carga nocturna con 100.000 activos desde esta etapa** (RNF-011). Ficha del activo y búsqueda a 360 px | Archivo válido de 5.000 filas; 17 archivos sucios (sección 6.6); 100.000 activos y 500.000 movimientos; Personas anonimizadas para actas | **B:** CA-023 a 028, 038, 039, 042, 046, 056, 058, 059, 060, 063, 079b, 081b, 082b; CA-ENT-01 a 14; ninguna clave en claro en base, auditoría, registros o exportaciones; dos asignaciones simultáneas = una; importación todo o nada con la huella. **S:** rendimiento con 100.000 |
| **5 · Compras y recepción** | Las 18 transiciones válidas de la OC y todas las demás rechazadas (CA-029). Edición de una aprobada: vuelve a Pendiente, sube la versión, el editor no reaprueba (CA-030). Aprobación por monto: 3.000, 8.000, otra moneda, aprobación apagada (CA-031). **Borde exacto 5.000,00 / 5.001 / límite 0 y orden sin precios** (CA-055, 032). Redondeo con 4 ejemplos (CA-072; el cuarto: 1 × 10,0050 con 50 %). Doble control: quien crea o edita no aprueba, quien aprueba no recibe, también el Administrador (CA-012, 013). Ocho casillas (sección 2). Recepción parcial y total con series (CA-033). Recepción inválida: 7 de 6, 3 series de 4, una serie repetida; nada a medias (CA-034). Doble clic y dos personas a la vez (CA-035). Borrador de 7 días, tope de 1.000 series, recibir con SKU o proveedor desactivado (CA-061). Reversión por cantidad con saldo negativo y de una orden cerrada (CA-062, 036). Anulación y cierre manual (CA-037). PDF de la orden con texto malicioso (CA-078). **Avisos por correo a quien aprueba y a quien creó** (CA-NOT-01 y CA-NOT-20). Órdenes de usuarios dados de baja (CA-052d). Cambio de moneda base con órdenes abiertas (CA-071) | OC de 10 con 4 recibidas; límite 5.000; 2 monedas; Solicitante sin precios; Almacén; 8 casillas; relojes R5 | **B:** CA-011a, 012 a 014, 029 a 037, 055, 061, 062, 070, 072, 078, CA-NOT-01 y 20; ninguna recepción deja activos a medias en 200 corridas con corte de conexión inyectado. **S:** textos de error comprensibles con 5 personas |
| **6 · Órdenes de servicio** | Flujo Creada, Asignada, En ejecución, Cerrada, Cancelada (CA-044). Una cerrada no se reabre. Abrir o cerrar no cambia el estado del activo. "Pedir ayuda" crea una OS en Creada (CA-080). Costo real, moneda, centro de costo y "cubierta por garantía". Aprobación solo si supera el límite (CA-055). Activo dado de baja con OS abierta (aviso). Correlativo con 20 a la vez | OS reales anonimizadas (P-002); activos de las Etapas 4 y 5 | **B:** CA-044 (sin su parte de Fase 2), 055 (OS), 080, tras P-006 |
| **7 · Pulido** | **Rendimiento** (RNF-011) con 100.000 activos y 500.000 movimientos en máquina comparable a producción. **Respaldo y restauración con cronómetro**: aislamiento sobre la base restaurada, reaplicar anonimizaciones desde el registro externo, revocar sesiones y enlaces, rotar claves de API, reaplicar suspensiones, bajas y cambios de rol posteriores (RS-49; CA-053, CA-054 parte c). **Copia externa de la auditoría**: alterar una entrada y verificar que se detecta (CA-040 parte b). Vuelta atrás ensayada. Accesibilidad completa AA (CA-050a). Carga de 50 usuarios en recepción. Revisión de dependencias (RS-43). Procedimiento de incidente (RF-DAT-015). Regresión completa | Copia sintética de 100.000 activos; respaldo con Personas anonimizadas después de la copia | **B:** CA-053 completo; 0 hallazgos Críticos o Altos abiertos; restauración probada. **S:** cifras reales de P-003 |

### 3.1 Después de la v1 (resumen)

| Módulo | Pruebas críticas |
|---|---|
| CMD (delgada) | Un activo recibido no crea fila de CMDB; un Servicio sí; impacto hasta 5 niveles sin ciclos; el elemento relacionado se materializa en la misma transacción |
| LIC y PRV-B | Contrato único `CTR-`; puestos con CHECK y último puesto con 20 intentos; vigencia calculada al leer, con reloj a 23:59 y a 00:00:01 |
| DOM, LIN y GAR-B | Aviso por umbral, una vez por empresa y entidad, con dos empresas y reloj; el cese de la responsable no bloquea y genera pendiente; mantenimiento con costo en la OS o en el mantenimiento, nunca en ambos |
| AYU y ONB | SLA con calendario de empresa, feriados y pausas contra una tabla de casos con resultado conocido; caso restringido invisible por todas las vías (CA-AYU-17); tareas de salida desde pendientes de la persona |
| PRE y REP | Libro único de costos con una sola fuente (`fuente_costo`: orden de compra, luego contrato, luego propio); la cifra del tablero coincide con la lista de su tarjeta; sin total entre monedas |
| INT | Clave visible una sola vez; revocación en 10 segundos; la API no aprueba ni recibe; versión de la orden en la exportación |
| NOT-completo | Un evento dos veces = un aviso; resumen diario; rebotes; tope por empresa con cupo propio |

---

## 4. Pruebas de integración entre módulos (17)

Cruzan módulos. Salvo CI-13, no dependen de reloj. Entre paréntesis, cuándo se pueden ejecutar de verdad.

**CI-01 · Cambio de empresa sin arrastre (Etapa 1; la campana, Fase 2).** Dado un usuario en las empresas A y B, con una lista de A abierta en una pestaña y otra de B en otra, cuando navega a la dirección de B en la primera, entonces ninguna pantalla, lista, búsqueda ni contador muestra datos de A; guardar en cada pestaña guarda en la empresa de su dirección (CA-079); el cambio queda en la auditoría; y un enlace de correo de una orden de A, abierto sin ser miembro de A, responde "no encontrado".

**CI-02 · Una recepción se propaga (Etapa 5).** Dado una orden Emitida de 10 laptops por serie a 1.200,00 USD sin impuesto con garantía de 36 meses, cuando se confirman 4 series, entonces existen 4 activos con costo, moneda, centro de costo copiado y garantía "hasta" la fecha esperada; la orden queda Recibida parcial con 6 pendientes; el registro de costo y los movimientos se escribieron en la misma transacción (si fallan, la recepción no se confirma); los avisos salen después por la cola; y la auditoría tiene una entrada por cada cambio. Cuando existan CMDB y presupuesto: el activo no crea fila de CMDB y el ejecutado del libro sube 4.800,00.

**CI-03 · Revertir una recepción deshace todo (Etapa 5).** Dado la recepción anterior sin activos asignados, cuando se revierte con motivo, entonces los 4 activos quedan anulados con movimiento contrario, el costo baja con un registro contrario (el original sigue visible), la orden vuelve a Emitida y los pendientes son 10 otra vez; si uno de los 4 ya está asignado, la reversión completa se rechaza y nada cambia; en un SKU por cantidad con salidas posteriores que dejarían saldo negativo, se rechaza y se corrige con ajuste; revertir la recepción de una orden cerrada a mano la reabre a Recibida parcial.

**CI-04 · Asignación única y sus efectos (Etapa 4).** Dado un activo En stock, cuando dos técnicos lo asignan a la vez a Ana y a Luis, entonces solo una asignación queda y el otro recibe el aviso; el acta guarda nombre y área de la ganadora en columnas propias con `retener_hasta`; si el técnico es el usuario vinculado a Ana, se rechaza la autoentrega aunque las 8 casillas estén activas; y "asignado a" se deriva de la asignación abierta.

**CI-05 · Cese de una Persona (Etapas 2 y 4; resto, Fase 2).** Dado una Persona con una laptop asignada y un usuario vinculado con sesión abierta, cuando Jefatura TI (sin `usuarios.suspender`) intenta cesarla, entonces se rechaza y nada cambia; cuando lo hace el Administrador, el cese se acepta, el usuario queda suspendido y su sesión muere en la siguiente acción, la laptop sigue Asignada con la marca "pendiente de devolución" (no es extravío), aparece la lista de pendientes en su ficha y se avisa a Jefatura TI; anonimizarla queda bloqueado mientras haya pendientes; las órdenes abiertas piden reasignarse o cancelarse con motivo. Con los módulos de Fase 2: las líneas, licencias y dominios generan pendientes y los puestos se liberan en la misma transacción.

**CI-06 · Anonimización sin romper nada (Etapas 2, 4 y 7).** Dado una Persona cesada con historial en 3 actas y cambios en la auditoría, cuando dos personas (una propone, otra ejecuta) la anonimizan por un pedido de derechos documentado, entonces su registro dice "Persona anonimizada 0042", se borran correo, código de empleado y puesto, la auditoría no se toca y sigue completa sin nombres, la copia del nombre en las actas dura hasta `retener_hasta`, la anonimización queda como un evento, el nombre canario no aparece en ninguna tabla, registro técnico, exportación ni correo pendiente, y tras restaurar un respaldo anterior nadie anonimizado reaparece.

**CI-07 · Segunda persona en todos los actos de dinero (Etapa 5; resto, Fase 2 y 3).** Dado un Administrador que creó una orden, cuando intenta aprobarla, entonces se rechaza; con la casilla "compras" activa (confirmada por un segundo administrador, con motivo) se acepta con aviso en la orden y entrada en la auditoría (quién, cuándo, monto, orden); con la casilla vencida a los 90 días se rechaza otra vez; lo mismo, acto por acto, con la tabla de RN-017; y el borde: 5.000,00 pasa sin aprobación, 5.000,01 no.

**CI-08 · Los precios no se escapan (Etapa 5 en adelante).** Dado un usuario "Solo lectura" y un Almacén, cuando recorren pantallas, exportaciones, correos, avisos y llamadas del servidor, entonces ningún importe aparece (las columnas se omiten, no se muestran vacías); el Técnico y el Solicitante ven precios solo en las órdenes que crean o editan; el visor de auditoría oculta lo que el lector no ve en su origen; una búsqueda automática de importes de prueba no encuentra ninguno.

**CI-09 · Los datos personales no se escapan (Etapa 2 en adelante).** Dado un usuario sin `datos_personales.ver`, cuando abre listas, fichas, actas, exportaciones, avisos y errores, entonces ve la referencia `PRS-0042` o un conteo, nunca nombre ni correo; el PDF del acta omite nombre y área; los mensajes de error y los registros técnicos tampoco los contienen (nombre canario).

**CI-10 · Exportar es una sola acción vigilada (Etapa 2 en adelante).** Dado un rol sin `datos.exportar`, cuando exporta por botón o por petición directa, entonces se rechaza (el botón se ve desactivado con la razón) y queda en los eventos de seguridad; con permiso, pide motivo, muestra las columnas sensibles, omite precios y datos personales según permisos, escribe `=`, `+`, `-`, `@` como texto, no incluye contactos de proveedor ni claves, trae la hoja "Aviso", respeta 10 por hora y 50.000 filas, y deja la auditoría con filas y columnas sensibles (sin el contenido).

**CI-11 · Un activo que sale de servicio (Etapa 4; resto, Fase 2 y 3).** Dado un activo Asignado, cuando pasa a Extraviado o robado con motivo, entonces la asignación se cierra con esa causa, el responsable queda vacío, la garantía sigue, no se puede vincular a casos nuevos y los mantenimientos pendientes se cancelan en la misma transacción (Fase 2); un reingreso posterior reactiva el mismo registro sin crear otro.

**CI-12 · "Pedir ayuda", orden de servicio y activo (Etapa 6; el caso, Fase 2).** Dado un usuario en la v1, cuando pulsa "Pedir ayuda", entonces se crea una orden de servicio en Creada (CA-080); cerrar la orden no cambia el estado del activo; el técnico decide el cambio con el diálogo "Cambiar estado". Con la mesa de ayuda: el caso no se resuelve con una orden abierta y el comentario interno nunca llega al solicitante.

**CI-13 · Procesos diarios con reloj fijado (Etapa 1 la infraestructura; módulos, Fase 2).** Dado dos empresas de zonas distintas con vencimientos a 30, 7 y 1 días y "hoy", cuando corre el proceso diario y se repite, entonces cada aviso sale una sola vez al destinatario correcto en su empresa, sin importes ni nombres; al adelantar el reloj 3 días sin haber corrido el proceso, la siguiente corrida procesa los 3 días en orden y no pierde ninguna alerta; "Vencido" se lee correcto con solo mover el reloj (la vigencia se calcula al leer); y corregir una fecha futura cancela y recalcula los avisos pendientes.

**CI-14 · Importar y deshacer (Etapa 4).** Dado el Excel válido de 5.000 filas con activos, stock inicial y Personas, cuando se confirma, entonces existen los activos, el stock como movimiento "saldo inicial" por ubicación y las Personas "por regularizar" donde corresponda; al deshacer el lote sin movimientos posteriores todo queda "anulado por lote deshecho" con historial y los conteos vuelven al valor anterior; subir el mismo archivo se rechaza entero con la fecha del lote; un archivo corregido con una fila ya existente marca esa fila como error.

**CI-15 · Editar una orden aprobada (Etapa 5; exportación a SAP, Fase 3).** Dado una orden Aprobada, cuando alguien cambia el precio, entonces vuelve a Pendiente, el número de versión sube, la aprobación anterior se anula, el editor no puede reaprobarla y quien aprueba recibe el aviso; una orden en otra moneda siempre pasa por aprobación. Con integraciones: el siguiente lote sale como CAMBIO con versión 2.

**CI-16 · Trabajo en segundo plano que se interrumpe (Etapa 4).** Dado una importación de 5.000 filas en curso, cuando el trabajador se reinicia a mitad, entonces no hay filas duplicadas ni perdidas, el lote termina o queda en un estado claro, la barra de avance se retoma y todo corre con la empresa fijada; lo mismo para una exportación de 50.000 filas y un PDF masivo.

**CI-17 · Restauración que no resucita (Etapa 7, con ensayo previo a la Etapa 1).** Dado un respaldo de ayer, un usuario suspendido, una Persona anonimizada y un cambio de rol posteriores a la copia, cuando se restaura, entonces antes de abrir el sistema se reaplican las anonimizaciones, se revocan todas las sesiones y enlaces, se rotan las claves de API y se reaplican la suspensión y el cambio de rol; la prueba de aislamiento pasa sobre la base restaurada.

---

## 5. Dónde corre cada suite

| Suite | Cada cambio (menos de 10 minutos) | Nocturna o base permanente | Antes de una etapa con uso real |
|---|---|---|---|
| Unitarias | Todas | | |
| Migraciones desde cero y sobre datos | Todas | Con volumen | |
| Aislamiento por tabla y módulo; roles de base | Todas | | |
| Matriz de permisos (482 celdas) | Todas | | |
| Auditoría solo-agregar | Todas | | |
| Concurrencia con 20 conexiones (5 patrones) | Todas | | |
| Concurrencia con 50 conexiones | | Todas | |
| Procesos diarios con dos empresas y reloj | Todas | | |
| Cola y trabajador | Todas | | |
| E2E esenciales (enlace de acceso, cambio de empresa, recibir, entregar, aprobar) | 5 recorridos | Todos, en 3 navegadores y a 360 px | |
| Importación (archivo válido y sucios) | El válido y 3 sucios | Todos | |
| PDF y texto malicioso | | Todos | |
| Carga de 100.000 activos y recepción de 100 series | | Todas | Medición final |
| Accesibilidad automática | | Todas | Revisión manual |
| Restauración, vuelta atrás, copia externa alterada | | | Todas, con cronómetro |

---

## 6. Catálogo de datos de ejemplo

Todo lo siguiente lo crea un generador que se ejecuta con un solo comando, produce siempre lo mismo y se reinicia en menos de un minuto por suite. Todo es ficticio; los correos usan el dominio reservado `ejemplo.test`.

### 6.1 Empresas

| | A "Norte" | B "Sur" | C "Vacía" |
|---|---|---|---|
| País (supuesto de prueba hasta P-004) | Perú | México | Perú |
| Zona horaria | Lima (UTC menos 5) | Ciudad de México (UTC menos 6) | Lima |
| Moneda base | USD | PEN | USD |
| Límite de aprobación | 5.000,00 | 90.000,00 | 5.000,00 |
| Interruptor de excepciones | 8 casillas apagadas | 8 casillas apagadas | 8 casillas apagadas |
| Módulos activos | Núcleo de la v1 | Núcleo de la v1 | Núcleo de la v1 |
| Datos | Completos (6.2 a 6.5) | Completos, con los **mismos** códigos, series, correos y proveedores que A | Ninguno (para probar listas vacías y el asistente de primeros pasos) |

Una cuarta empresa **D "Suspendida"** (con datos) sirve para probar que nadie entra y que los procesos la saltan.

### 6.2 Usuarios y Personas

| Quién | Dónde | Para qué |
|---|---|---|
| Un usuario de cada una de las **7 plantillas** (Administrador, Jefatura TI, Técnico, Almacén, Solicitante, Solo lectura, Empleado (portal)) | A y B | Matriz de permisos |
| `mario.vega@ejemplo.test`: Administrador en A, Solo lectura en B | A y B | Cambio de empresa, dos pestañas |
| Administrador con segunda verificación y otro sin ella | A | CA-007 |
| Administrador **único** de la empresa C | C | Último administrador, rescate |
| Rol personalizado "Contador" con `datos.exportar` | A | Segunda verificación por permiso (CA-081) |
| Dos administradores y casilla "compras" pendiente de confirmar | A | Interruptor único |
| Administrador de plataforma (dos cuentas) | Plataforma | Rescate con control dual |
| 30 Personas con área y puesto; **2 homónimos** ("Juan Pérez" en áreas distintas); 1 sin correo; 1 cesada con equipo; 1 cesada hace más de 2 años (reloj); **1 canario** ("Zzcanario Qxwv", `canario@ejemplo.test`) | A y B | Directorio, cese, anonimización, nombre canario |
| Una Persona vinculada a una membresía y una sin vincular | A | Alcance "propio" con y sin Persona |

### 6.3 Catálogos, inventario y compras

- **Categorías:** LAP (equipo físico), CEL (equipo físico), PER (equipo físico, por cantidad), LIC (naturaleza licencia). Un prefijo reservado (`OC`) y uno repetido para probar el rechazo.
- **Campos:** RAM y disco (del artículo, número y lista); IMEI (de la unidad, identificador); número de línea (de la unidad); vencimiento (fecha); puestos (número); clave (secreto); un campo obligatorio de tipo número en LAP.
- **SKU:** `LAP-0001` por serie (idéntico en A y B); contador de `LAP` en `LAP-0010`; un SKU por serie con "sin serie" autorizado; un SKU por cantidad (mouse) con unidad que admite decimales (cable por metro); un SKU inactivo.
- **Ubicaciones:** Sede, Piso, Sala (3 niveles) con 40 hijos; una "almacén de TI".
- **Series:** `SN-100` en `LAP-0001` de A y de B; `SN-100` también en otro SKU de A (aviso); `sn-100 ` con espacios y minúsculas.
- **Proveedores:** identificación fiscal `20123456789` en A y en B; un contacto inactivo desde hace más de 2 años (reloj).
- **Activos:** 12 Asignados, 8 En stock, 3 En reparación, 2 De baja, 1 Extraviado, 1 con la marca "pendiente de devolución"; un activo "importado sin costo".
- **Compras:** órdenes en cada uno de los estados; orden de 10 unidades con 4 recibidas; orden de 3.000, de 8.000, de exactamente 5.000,00 y de 5.000,01; orden en otra moneda; orden de un Solicitante sin precios; orden con todas las líneas "sin costo"; borrador de recepción de 7 días.
- **Redondeo:** los 3 ejemplos de RF-OC-045 y un cuarto: 1 × 10,0050 con 50 % (subtotal 10,01; impuesto 5,01 sobre el redondeado, 5,00 si no).
- **Garantía:** compra 15/01/2026 + 24 meses = 14/01/2028; 15/03/2024 + 36 = 14/03/2027; 31/01 + 1 mes = 28/02; 29/02/2028 + 12 = 28/02/2029.

### 6.4 Relojes

El reloj de la plataforma se puede fijar y adelantar solo en los entornos de prueba (RNF-020). La base es R0.

| Reloj | Fecha y hora | Para qué |
|---|---|---|
| R0 | 2026-11-02 08:00 hora de cada empresa | Punto de partida |
| R1 | 2026-11-30 23:59:00 y 2026-12-01 00:00:01 en Lima | Borde de vigencia: sigue Vigente / pasa a Vencido, sin proceso |
| R1b | El mismo instante visto en Ciudad de México (23:00 del 30/11) | Dos zonas: vence primero en Lima |
| R2 | +15 min, +25 min, +30 min, +12 h desde el ingreso | Enlace de acceso, aviso de sesión, inactividad, tope de sesión |
| R3 | +7 días, +8 días desde la invitación | Vencimiento de invitaciones |
| R4 | 2028-02-29; 2029-02-28; 31 de enero + 1 mes | Fin de garantía en bisiestos y meses cortos |
| R5 | +7 días (borrador de recepción), +90 días (casilla de excepciones), +365 días (préstamo), +2 años (anonimización), +5 años (retención) | Plazos |
| R6 | Adelantar 3 días sin ejecutar el proceso diario | Recuperación de días perdidos |
| R7 | Dos corridas el mismo día | Idempotencia de avisos |
| R8 | Último día de mes con programación mensual el día 31 | Mes corto |

### 6.5 Correos de captura

Un servidor de correo de pruebas recibe todo lo que la plataforma envía; las pruebas pueden contar, leer asunto y cuerpo, buscar importes, claves, nombres y el canario, y medir el tiempo de entrega. **Ningún correo sale a internet.**

| Buzón | Comportamiento | Prueba |
|---|---|---|
| `Ana.Ruiz@Ejemplo.test` (mayúsculas) y `ana.ruiz+prueba@ejemplo.test` | Normal | Comparación Unicode sin quitar etiquetas `+` (CA-005) |
| `filtro@ejemplo.test` | Simula un filtro de correo que **abre todos los enlaces** antes que el dueño | Enlace atado al navegador (CA-068) |
| `rebota@ejemplo.test` | Rebota siempre | 3 rebotes = "no entregable" (CA-NOT-10) |
| `compartido@ejemplo.test` | Dos usuarios de empresas distintas con el mismo correo | Una sola cuenta, dos membresías |
| `nadie@ejemplo.test` | Sin cuenta ni invitación | No se envía nada, misma respuesta en pantalla (CA-006) |
| Persona sin usuario con correo no verificado | Normal | Contenido mínimo (CA-074) |

### 6.6 Archivos de importación (17 sucios y 1 válido)

Válido: 5.000 filas (activos, stock inicial y Personas). Sucios, uno por caso: (1) 100 filas con 3 inválidas; (2) serie repetida dentro del archivo; (3) campo obligatorio vacío; (4) SKU inexistente; (5) serie `3,5E+14`; (6) serie con ceros a la izquierda perdidos; (7) celda de texto que empieza con `=`; (8) columna de empresa; (9) 5.001 filas; (10) más de 10 MB; (11) UTF-8 con tildes y eñes; (12) encabezados cambiados; (13) archivo vacío; (14) fecha en formato mes/día; (15) texto de estado que no se asocia a los 5 estados; (16) Persona sin código ni correo; (17) el mismo archivo ya confirmado, subido otra vez. Se guardan en el repositorio solo si son sintéticos.

### 6.7 Volumen

100.000 activos, 500.000 movimientos y 20.000 Personas, generados; para la carga nocturna (Etapa 4 en adelante) y la medición final (Etapa 7).

---

## 7. Entorno que este plan necesita

El detalle y el estado frente al plan de operaciones están en `docs/revision-cruzada/ronda3-qa-tester.md`, sección 6. Resumen de lo indispensable:

1. PostgreSQL real, desechable por revisión y permanente separada, con los 5 roles de base y al menos 60 conexiones.
2. Trabajador y cola en PostgreSQL en el entorno de pruebas y en la revisión automática.
3. Reloj fijable y disparador manual de los procesos diarios.
4. Correo de captura legible en el entorno de pruebas.
5. Un entorno efímero por cambio (aplicación, base, trabajador y correo), sin compartir una sola base entre revisiones.
6. Los tres navegadores y la ventana de 360 px.
7. Inyección de fallos (cortar la conexión, matar al trabajador).
8. Restauración de ensayo con RS-49 y copia externa de auditoría alterable para probar la detección.

---

## 8. Defectos

**Formato de reporte** (sin pasos para reproducirlo, no es un reporte): título; pasos para reproducirlo (con empresa, usuario, rol y reloj); resultado esperado (con el CA o el requisito); resultado obtenido; gravedad.

| Gravedad | Significa |
|---|---|
| **Crítico** | Una empresa ve o cambia datos de otra; se pierde o se altera la auditoría; se aprueba o recibe dinero sin la segunda persona; se filtra una clave o un dato personal; se pierden datos |
| **Alto** | Una regla importante da un resultado distinto del documento; una transición prohibida se permite; un duplicado que debía ser imposible |
| **Medio** | Una regla secundaria falla o un mensaje es incomprensible; hay forma de evitarlo |
| **Bajo** | Texto, orden, detalle visual |

**Salida de cada etapa:** 0 hallazgos Críticos o Altos abiertos y todos los criterios bloqueantes de la etapa ejecutados y en verde. Si una prueba no se pudo correr, se dice y la etapa no se da por aprobada en ese punto.

---

## 9. Supuestos y lo que falta

- Los límites y formatos de la sección 19.2 son propuesta hasta que el Gerente de TI los fije (P-013); las pruebas de límites usan esos valores y se ajustan al fijarse.
- La fórmula de garantía (fin = inicio menos 1 día, más los meses) es el supuesto S-35, pendiente del Gerente de TI.
- Los criterios CA-016, 052a/b, 054, 060, 064, 065, CA-NOT-05 y 07 y CA-PRV-04 no corren en la etapa de su requisito (ver `criterios-por-etapa.md`); hasta que el Analista los parta, este plan los ejecuta en la etapa indicada allí.
- El plan de operaciones aún no refleja D-038, D-039 ni D-055; sin eso no puedo garantizar los puntos 2, 3, 4 y 7 de la sección 7.
- Las cifras reales (P-003), el Excel real (P-002, P-007) y la orden de servicio real (P-006) cambiarán los datos de las etapas 4 y 6.
