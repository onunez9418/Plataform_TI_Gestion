# ADR-21 · Integración con Microsoft Graph (Entra ID e Intune): credenciales por empresa, consentimiento, límites de uso y sincronización por la cola

**Estado:** Propuesto (nuevo, 2026-10-29) · contrastado con `docs/modulos/microsoft-entra-intune.md` v0.1 (29/10/2026) · **Decide:** Gerente de TI (revisan Seguridad y Cumplimiento) · **Base:** D-001, D-030, D-038, D-039, D-048.4, D-054, D-059, D-077, D-080; ADR-02, 03, 04, 07, 09, 11, 12, 14, 16, 19, 20; RN-MSF-001 a 065, S-MSF-05, 06, 15, 18, 20, L-MSF-01 a 06

## Contexto
El CEO pidió que cada empresa pueda conectar su directorio de cuentas (Microsoft Entra ID) y su administración de equipos (Microsoft Intune) para mantener al día las Personas y conciliar el inventario con lo que Intune ve. El módulo define **solo lectura** (RN-MSF-007, RF-MSF-038), una conexión **por empresa**, propuestas que una persona revisa y nunca usuarios creados desde Entra (D-001). Este ADR fija cómo se construye por dentro: qué credencial se usa y dónde vive, cómo se comprueba el consentimiento, cómo se limita el uso y cómo corre la lectura sobre la cola. La pregunta S-MSF-20 del módulo (aplicación propia de cada empresa o una aplicación multiempresa de la plataforma) la contesta este ADR.

## Opciones
**Para la credencial (S-MSF-20):**
1. **Una aplicación multiempresa de la plataforma**, con un secreto de plataforma y un consentimiento por empresa. Descartada. Con un solo secreto, quien lo robe lee **todas** las empresas conectadas a la vez: es un punto único que rompe el aislamiento por empresa que sostiene el resto de la arquitectura; retirar ese secreto desconecta a todas; y es probable que Microsoft exija una verificación del editor de la aplicación (S-MSF-05, a verificar), con trámite y plazos fuera de nuestro control.
2. **Una aplicación registrada por cada empresa en su propio Microsoft**, con su propio identificador de directorio, de aplicación y secreto, que la empresa entrega a la plataforma. **Elegida.** Es literalmente "credencial por empresa" (RN-MSF-002): el daño de una filtración se limita a una empresa, la propia empresa ve y puede revocar en su Microsoft la aplicación y sus permisos, no hay secreto de plataforma que cuidar y no hace falta verificación de editor. Costo: el administrador de Microsoft de la empresa hace más pasos al conectar (el asistente le da un texto con los pasos, RN-MSF-006).

**Para saber qué cambió:**
1. **Notificaciones de cambio de Microsoft** (Microsoft avisa a una dirección nuestra). Descartada para la v1: exige una dirección pública que reciba llamadas de Microsoft, validarlas y renovar suscripciones: más superficie de ataque y piezas que cuidar, y el módulo se conforma con datos de hace horas ("dato al…", RN-MSF-041).
2. **Lectura programada** (el trabajador pregunta cada cierto tiempo). **Elegida.**

## Decisión

### 1. Credenciales y consentimiento
- **Flujo de credenciales de aplicación** (OAuth 2.0 con secreto de cliente, solo permisos de **aplicación**, nunca delegados): la empresa entrega `directorio` (identificador del directorio), `aplicación` (identificador de la aplicación) y `secreto`. **No hay ingreso de personas con Microsoft en esto:** el ingreso con Microsoft (INT-3, ADR-08) es otro consentimiento y otro mecanismo (RN-MSF-062).
- **Dónde vive:** el secreto va en una tabla propia, `integracion_microsoft_credencial(empresa_id, cifrado, version_llave, cambiado_en)`, **cifrado con `cifrar('integracion_graph', empresa, secreto)`** (ADR-07, propósito nuevo), con datos asociados `tabla|columna|id|empresa`, `sin_soporte` (sin permiso para `app_soporte`) y **sin máscara** (no se muestra nada). No puede guardarse como huella porque hay que presentarlo a Microsoft; es la misma excepción que el secreto del webhook (RN-MSF-003). El identificador del directorio y el de la aplicación no son secretos y viven en `integracion_microsoft` (la conexión). La consola de plataforma y el soporte **no pueden** conectar, ver ni usar credenciales (la consola no tiene la maestra, ADR-01).
- **Quién conecta:** PS-236 `microsoft.conectar` (sensible) con segunda verificación y **verificación reciente con el autenticador** (ADR-08); reemplazar la credencial prueba la nueva **antes** de descartar la anterior (RF-MSF-005). Rotación: se avisa a los 30 y 7 días y el mismo día, y al vencer la conexión pasa a "Con problema".
- **Fecha de vencimiento del secreto:** la escribe **quien conecta**, en el asistente (los secretos de aplicación de Microsoft vencen y la fecha se ve en el portal de Microsoft). Leerla desde Microsoft exigiría otro permiso (lectura de aplicaciones) y cada permiso de más es riesgo. **Esto ajusta RF-MSF-004**, que dice "cuando Microsoft la informa": el Analista lo corrige. Una mejora posterior es usar certificados en lugar de secretos.
- **Un directorio, una empresa (RN-MSF-005):** tabla **global** nueva `directorio_microsoft(huella_directorio, empresa_id)` (fila 18 de ADR-04), con huella de **nivel A** (ADR-09, tipo `directorio_microsoft`; el identificador de un directorio puede deducirse del dominio de una empresa, así que se guarda con llave). Solo se toca con `directorio_microsoft_reservar(huella)` y `directorio_microsoft_liberar()` (DEFINER, con la empresa tomada del contexto). El rechazo dice "No se puede conectar este directorio" **sin decir a qué empresa pertenece**.
- **Consentimiento comprobable, no declarado (RN-MSF-007, CA-MSF-02):** al probar la conexión, la plataforma obtiene un token de aplicación y lee, sin verificar su firma (lo entrega Microsoft por una conexión cifrada y solo se usa para informar), la lista de **permisos concedidos** (`roles` del token). Se compara con una **lista permitida en código**. Si falta alguno de los necesarios, queda "Pendiente de consentimiento"; si hay **cualquiera de más**, no se activa y se pide quitarlo. Se rechaza todo permiso de escritura, de operaciones privilegiadas sobre equipos (borrar, retirar, bloquear) o de acceso total al directorio. Lista de partida **(a verificar contra la documentación vigente antes de construir; Seguridad la firma)**: lectura de usuarios, lectura de equipos administrados de Intune (partes por separado, RN-MSF-065), lectura de datos de la organización (nombre del directorio) y, opcional, lectura de miembros de grupos para el filtro. La lista exacta de campos de la sección 6 del módulo se pide con `$select`, y **nunca** se trae lo prohibido por RN-MSF-008.
- **Qué se guarda de los permisos concedidos:** la lista de nombres (no secreta), para mostrarla en la pantalla de conexión.
- **Token de acceso:** vive solo en la memoria del trabajo que lo pidió (tipo `Secreto`), nunca se guarda ni se registra; se pide uno nuevo cuando vence.

### 2. Conexión saliente controlada (RN-MSF-009, SSRF)
- Un único cliente `nucleo/integraciones/microsoft` con `fetch` directo contra **dos direcciones fijas** de la nube pública: la de autenticación de Microsoft y la de Graph, **versión estable** (no beta). **No existe campo alguno donde se escriba una dirección.** Las nubes soberanas quedan fuera (S-MSF-15).
- El identificador del directorio se valida como GUID antes de formar la dirección. Las redirecciones **no se siguen**. El enlace de la página siguiente que devuelve Graph (`@odata.nextLink`) solo se usa si su servidor y su ruta son los esperados; si no, la lectura falla.
- Tiempo máximo por llamada; TLS por defecto; sin librerías de Microsoft de gran tamaño (el cliente son unas cien líneas y evita una cadena de dependencias; Seguridad puede preferir una librería oficial: se decide en la revisión del ADR).
- Los cuerpos de respuesta de Graph (con nombres de personas y de equipos) **no se registran** (ADR-20); de un error se guarda el código y el identificador de petición que Microsoft devuelve, para poder pedir ayuda a Microsoft, no su texto. El envoltorio de errores de ADR-02 se aplica.

### 3. Lectura por la cola (ADR-02)
- **Trabajos:** `microsoft.leer_cuentas` y `microsoft.leer_equipos`, uno por empresa, con clave única `<tipo>:<empresa>:<fecha_lógica>:<n>`; el programador los encola según la periodicidad de la empresa. Carga útil: solo `empresa_id` y el identificador de la corrida. Corren con `ejecutarComoEmpresa`: saltan empresas suspendidas y módulos apagados (RN-MSF-058), usan el "hoy" de la empresa y escriben con autor "sistema" (RN-MSF-050). Con una caída se retoma desde la página guardada, sin duplicar (RNF-MSF-003).
- **Una corrida activa por empresa y tipo:** índice único parcial sobre la tabla de corridas (`WHERE estado IN ('en_cola','en_curso')`). Estados de la corrida: los del módulo (En cola, En curso, Completada, Completada con avisos, Fallida, Cancelada).
- **Nunca una transacción abierta mientras se espera a Microsoft.** Cada página se pide fuera de la base y se guarda en **una transacción corta propia** (`INSERT … ON CONFLICT DO UPDATE` por bloques con `unnest`). El cursor de la corrida (la marca de la página siguiente) se guarda para retomar y se borra al terminar.
- **"Ya no aparece" solo tras una lectura completa y correcta (RN-MSF-042):** cada fila leída recibe el identificador de la corrida; al terminar una corrida **Completada**, una sola sentencia marca las que no la tienen. Una corrida fallida o parcial no marca nada. **Protección adicional (supuesto de este ADR, a contrastar):** si una corrida completa dejaría "desaparecidas" más de la mitad de las filas vigentes (por ejemplo por un filtro o un grupo cambiado, o un permiso que ya no alcanza), termina "Completada con avisos", **no marca nada** y avisa a los titulares de PS-236. Es una barrera barata contra el borrado masivo por error.
- **Periodicidad inicial (propuesta, el módulo la dejó [PENDIENTE]):** equipos cada 6 horas, cuentas cada 24 horas; mínimo configurable por empresa de 1 hora. Se ajustan con la bitácora de límites de las pruebas.
- **Eventos y reacciones:** al crearse un activo (`inventario.activo_creado`) se busca de inmediato en la última lectura (RF-MSF-025) por el bus síncrono de ADR-02; los avisos van por el motor de Notificaciones (ADR-16, `enviarCorreo`). El módulo no envía correos por su cuenta.
- **Gancho de anonimización:** el registro de módulo (ADR-14) incorpora **"limpieza al anonimizar"**: un escucha síncrono que `anonimizar` (ADR-12) invoca dentro de su transacción. El módulo borra el vínculo y las copias del nombre de usuario de esa Persona (RF-MSF-019). La "huella de exclusión" de quien ejerció su derecho de eliminación (RN-MSF-022) es de **nivel B** (SHA-256 sin llave, ADR-09): el identificador de una cuenta de Entra es un GUID aleatorio de 122 bits, no se puede adivinar por fuerza bruta, y así la exclusión **no depende de la maestra** (si dependiera y se perdiera, se podría volver a importar a una persona que pidió su eliminación). Se conserva solo con la opinión legal L-MSF-04.

### 4. Límites de uso
- **Por empresa:** una corrida activa por tipo; "Sincronizar ahora" con tope en el cuadro `TOPES` (ADR-16; propuesta inicial: no antes de 15 minutos de la anterior y como máximo 4 por día por empresa); llamadas diarias a Microsoft por empresa con un tope blando que pasa la corrida a "Completada con avisos" al alcanzarlo.
- **Por plataforma:** como máximo **2 corridas de Microsoft simultáneas** en todo el trabajador (grupo de concurrencia de la cola), para que una empresa grande no deje sin turno a las demás. Un fallo o un exceso de una conexión no afecta a las de otras (RN-MSF-002).
- **Los límites de Microsoft:** cuando Microsoft responde que hay que esperar (HTTP 429 o 503 con la cabecera de espera), el trabajo espera **ese tiempo** y no reintenta en bucle; sin cabecera, esperas crecientes con variación aleatoria; tiempo total máximo de una corrida (propuesta: 30 minutos) y, al agotarse, termina "Completada con avisos" sin marcar desapariciones. No se codifican cifras de Microsoft porque las cambia (S-MSF-06).
- Si `limite_consumir` falla, la lectura **no corre** (falla cerrada, ADR-16); el resto de la plataforma sigue.

### 5. Datos y aislamiento
- Todas las tablas del módulo (cuenta vinculada, propuestas, lecturas de equipo, vínculos, historial de cumplimiento, decisiones, corridas) nacen con `aplicar_aislamiento` (ADR-03) y claves foráneas compuestas; las que guardan datos personales en claro (propuestas pendientes y la lectura de cuentas con nombre y correo, el usuario principal y el nombre de equipo) se declaran **`sin_soporte`** por prudencia (Seguridad lo confirma) y entran al **mapa de anonimización** con su marca `pii:` (ADR-12, D12-1). Se purgan según la sección 6 del módulo, y la limpieza respeta la congelación por incidente (ADR-23).
- Los índices únicos del módulo (una cuenta vinculada por Persona y por identificador, un vínculo vigente por activo y uno por equipo, una corrida activa por tipo) siguen las clases de `indices-claves-naturales.md`.
- **Auditoría (ADR-11):** conexión, configuración, lecturas (una entrada de resumen), propuestas decididas (identificador de la Persona y nombres de campos, sin valores), vínculos, lotes; autor "sistema" para lo automático. Los motivos, por valor (D-077). Las consultas de 100 o más nombres de Personas y las exportaciones dejan su entrada (RN-MSF-053); toda exportación pasa por la puerta única (ADR-19).
- **Restauración de respaldo (RN-MSF-064):** el procedimiento de ADR-12 incorpora el paso "**pausar todas las conexiones de integraciones**": una credencial que se eliminó al desconectar puede reaparecer con el respaldo.
- **Contenido no confiable:** nombres de equipos, nombres para mostrar y departamentos los escribe quien administra Microsoft (o, en el nombre del equipo, el propio empleado); son datos de terceros. El módulo y el asistente (ADR-22) los tratan siempre como datos, nunca como instrucciones, y se muestran escapados.

### 6. Lo que este ADR no hace
- **Ninguna escritura ni acción remota en Microsoft** (bloquear, borrar, retirar): no hay ruta, permiso ni credencial para ello. Si el CEO las pidiera, serían irreversibles y se proponen aparte con doble control y **[ESCALAR AL CEO]** (S-MSF-03).
- No crea membresías, ni vincula una Persona con una membresía, ni da roles (D-001, RN-MSF-012).
- No se expone por la API pública ni por webhooks (RN-MSF-063).

## Consecuencias
- **Costo:** esta pieza no agrega gasto de alojamiento (usa el trabajador y la cola existentes). Las licencias de Intune/Entra son de cada empresa; se espera que las lecturas no cobren por llamada, **a verificar** contra la documentación vigente de Microsoft (S-MSF-04 y S-MSF-06 ya están marcados **[ESCALAR AL CEO]** en el módulo). Si Microsoft cobrara por alguna lectura, se vuelve al CEO antes de seguir.
- **Legal:** un nuevo flujo de datos personales (directorio y equipos de los empleados) hacia la plataforma. Está en las consultas L-MSF-01 a L-MSF-06 del módulo, que entran al paquete legal ya escalado (S-MSF-07). Hasta la opinión legal: solo equipos corporativos, sin purgas automáticas y plazos provisionales.
- Cada empresa hace más pasos al conectar que con una aplicación única (el asistente los guía); a cambio, el daño de una filtración se limita a una empresa.
- Un secreto vencido deja la conexión en "Con problema" hasta que se reemplace; hay avisos.
- Los permisos PS-235 a PS-240 que propone este módulo **chocan en número** con los PS-235 a PS-240 que propone el módulo del asistente: la Jefatura y el Analista deben asignar números distintos (ver nota final).

## Qué prueba lo valida
- **Simulador de Microsoft** con datos inventados (RNF-MSF-006): sirve la autenticación, usuarios y equipos con paginación, errores, esperas (429 con cabecera), tokens con permisos de más y respuestas hostiles (nombres con instrucciones, enlaces de página siguiente hacia otro servidor, cuerpos enormes).
- Consentimiento: un token con un permiso de escritura deja la conexión en "Pendiente de consentimiento"; sin permiso necesario, también; con solo usuarios no se pide nada de Intune.
- Credencial: ciclo conectar, reemplazar, desconectar con credenciales de prueba propias; búsqueda en base, auditoría, registros, errores, exportaciones y respaldos de prueba: 0 apariciones; la de la empresa A no lee el directorio de B.
- Un directorio ya conectado a otra empresa se rechaza sin decir a cuál; la tabla global solo se toca por sus funciones.
- Dos empresas, una suspendida, caída de dos días y de a mitad de lectura: sin duplicados, cada fila en su empresa; **una transacción nunca queda abierta durante una llamada a Microsoft** (prueba con la base: ninguna transacción de más de unos segundos).
- Una lectura fallida o parcial no marca "ya no aparece"; una corrida que dejaría desaparecida más de la mitad no marca nada.
- `@odata.nextLink` hacia otro servidor: la lectura falla. Nombre de equipo con instrucciones: se trata como dato.
- Anonimizar una Persona borra vínculo y copias; la exclusión no depende de la maestra (con la maestra cambiada sigue vigente).
- Restaurar un respaldo antiguo deja las conexiones Pausadas.

## Qué cambió tras la revisión
Este ADR es nuevo. Lo que decide y lo que corrige del módulo, para que el Analista lo contraste:
| Punto | Decisión |
|---|---|
| S-MSF-20 | Aplicación registrada por cada empresa (no multiempresa), con las razones de arriba. |
| RF-MSF-004 | La fecha de vencimiento del secreto la escribe quien conecta; no se pide a Microsoft. |
| Sección 6, directorio conectado | Tabla global nueva `directorio_microsoft`, con huella de nivel A (fila 18 de la lista de ADR-04). |
| RN-MSF-022 | Huella de exclusión de nivel B (sin llave). |
| RN-MSF-042 | Se agrega la barrera de "más de la mitad desaparecida" (supuesto de este ADR). |
| Sección 8, periodicidad | Valores iniciales propuestos; el módulo los dejaba [PENDIENTE]. |
| Sección 9.2, ítem 4 | "Limpieza al anonimizar" entra al registro de módulo (ADR-14, ADR-12). |
| PS-235 a PS-240 | Número duplicado con el módulo del asistente: pendiente de renumerar. |
