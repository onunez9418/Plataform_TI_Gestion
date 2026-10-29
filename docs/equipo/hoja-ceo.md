# Hoja para el CEO

**Fecha:** 2026-10-29 (suma sus dos módulos nuevos, el chat de mesa de ayuda con Claude, el servicio extra del panel de administración, el piloto gratuito y las demos para clientes) · **De:** Gerente de TI, por medio de la Jefatura de Proyecto
El equipo decidió lo técnico y lo de producto. A usted solo le llegan cuatro cosas: dinero, temas legales, decisiones que no se pueden deshacer y datos que solo usted tiene. **Sus dos módulos nuevos** (asistente de IA, cuya primera entrega es ahora el **chat de mesa de ayuda con Claude** para armar buenos tickets, y la conexión con Microsoft Entra ID e Intune) quedan para después de la versión 1, en una ola nueva (G); nada de lo de abajo sobre ellos hay que resolverlo hoy. Podrá ver el chat en el prototipo, con datos inventados.

## Novedad: demo para clientes y piloto gratuito (D-115, D-116)
Usted aclaró que quiere **dar a clientes prospecto una versión de demostración con un usuario para que la usen de verdad**, por ejemplo **7 días**. Queda decidido así: cada cliente recibe una **empresa de demostración** aparte (nadie más la ve), con datos de ejemplo, **7 días y 5 usuarios** como valores de ejemplo que se pueden cambiar por cliente, entra solo por invitación al correo, con una franja «versión de demostración» a la vista. Apagados: el chat con Claude, importar y exportar archivos y las conexiones con SAP o Microsoft. Al vencer, el acceso se **bloquea** y los datos se borran. Si el cliente compra, se crea una empresa nueva y real; nada de la demo pasa a ella. Todo sin costo: base de datos en **Neon**, aplicación en **Render**, correos con **Resend**, tareas con **GitHub Actions** (precios de terceros **aún sin verificar**; la aplicación tarda cerca de un minuto en despertar).
**Honestidad sobre los plazos: hoy no hay código.** Al cliente solo se le puede mostrar el prototipo de pantallas. El acceso real llega tras las **Etapas 1 a 4** (acceso, catálogos, SKU, inventario), cerrada la puerta de la Etapa 0 y listo el paquete de demostración: **cuatro etapas más un paquete menor que una etapa**, sin fechas hasta medir la Etapa 1. De esto solo le toca a usted:
1. **Correo de la empresa** dueño de todas las cuentas, con **una segunda persona de suplente** (nada de cuentas personales). Es lo primero.
2. **Dominio (dinero, pequeño y anual):** sin él, los correos de acceso no llegan a gente de fuera y los clientes **no pueden entrar**. Si ya tiene uno, usamos un subdominio sin costo.
3. **Consulta con un abogado (legal, un gasto pequeño):** (a) el **acuerdo de prueba** que firma cada cliente (prototipo, datos de ejemplo, sin garantía, uso del nombre y correo de quien prueba) y el aviso para esas personas; (b) **cuánto tiempo guardar** lo de quien probó tras vencer (proponemos 30 días bloqueado y luego borrar) y qué constancia guardar. Sin esto no hay demostración con externos.
4. **Borrar la demo vencida es irreversible:** hasta que el abogado confirme, lo hace una persona a mano y deja registro; no corre solo.
5. **Dinero eventual:** si el plan gratuito no alcanza para el panel de administración aparte o para varias demos a la vez, se lo diremos antes de gastar. **Si algún servicio pide tarjeta**, nos detenemos. El **chat con Claude** queda apagado para clientes; recomendamos no comprarlo por ahora.
**Lo que no cambia:** nada de datos reales de empresas hasta tener las ocho preguntas legales resueltas y su aprobación. Los valores de ejemplo (7 días, 5 usuarios) son de producto y no necesitan su respuesta.

## A. Dinero que debe aprobar
- **Servicio de envío de correos.** La gente entra con un enlace al correo; sin este servicio nadie entra. Gasto mensual bajo. **Aprobar.**
- **Servidores, base de datos y copias.** Al principio, planes gratuitos o muy baratos (solo datos inventados). Antes de datos reales, planes de pago con copias. **Aprobar el arranque ya; el plan de uso real cuando se acerque, con precios comprobados.**
  - **Nuevo (2026-10-29): un servicio más para el panel de quienes administran la plataforma.** Lo ponemos aparte, con su propia dirección, para que un fallo en la parte que usan las empresas no alcance sus accesos de administración. **Puede sumar un gasto mensual pequeño**; no damos cifra hasta comprobar precios. Lo recomendamos igual por seguridad. No es una pregunta aparte: va incluido en la aprobación de los servidores. Los archivos que exportan las empresas se guardan unas horas dentro de la misma base de datos, así que **no suman gasto** (los archivos adjuntos siguen para el cierre de la Etapa 4).
- **Pequeños gastos de seguridad:** copia en otro proveedor, vigilancia de errores, gestor de claves y llaves físicas para dos o tres administradores. **Aprobar.**
- **Dominio:** usar un subdominio de uno que ya tenga; comprar otro solo si no existe. **Ahora lo necesita el piloto con clientes** (ver «Novedad»).
- **Abogado de protección de datos** (sección B). **Contratar** antes de datos reales; debe poder atender una consulta urgente el mismo día.
- **Asistente de IA y chat de mesa de ayuda (más adelante).** Usted eligió **Claude (Anthropic)**; cobra según cuánto texto se procesa, no una tarifa fija, así que no hay cifra todavía. Antes de usarlo con empleados reales le pediremos: un **tope mensual** para toda la plataforma y otro por empresa, si el costo lo asume usted o se traslada a las empresas, y **aprobar el contrato con el proveedor**. Para las pruebas con datos inventados hará falta una **cuenta con tope bajo** (se la pediremos al empezar esa etapa). **Recomendamos** tope general y uno igual por empresa, aviso al 80 % y pausa al 100 %. **No le prometemos todavía que el gasto quede acotado:** lo prometeremos cuando verifiquemos que el proveedor corta el gasto por su cuenta en el tope que usted fije (para eso la cuenta debe quedar a su nombre).
- **Licencias de Microsoft (más adelante).** Cada empresa debe **tener ya** su Intune; nosotros no lo compramos ni cotizamos. No esperamos cobro de Microsoft por leer los datos; si cambiara, le consultamos.
- **Más adelante** también: archivos adjuntos (incluida la captura de pantalla en el chat), conexión directa con SAP y criterios contables.

**Ojo:** las cifras de DevOps (**50 a 150 dólares al mes** con uso real) **no están verificadas**. Sirven para el orden de magnitud, no para decidir; antes de pedir un sí traeremos precios con fecha y enlace.

## B. Lo legal
Hay **25 preguntas** que el equipo no puede contestar: 16 del núcleo, 3 del asistente de IA y chat (ampliadas) y 6 de Microsoft. **Ocho** deben estar resueltas **antes de cargar datos reales**: la ley aplicable, el registro ante la autoridad, el aviso de privacidad, los plazos de conservación, el servidor compartido u otro país, los contratos con proveedores, los documentos de compra y el aviso de una fuga. Las de los dos módulos nuevos solo se necesitan **antes de activarlos con datos reales**; no frenan la versión 1. Las más importantes:
1. Qué ley de datos personales aplica en el país de cada empresa y si hay que registrar algo ante la autoridad.
2. Si nuestros plazos son correctos: auditoría 5 años, datos de quien se fue 2 años, copias 30 días y 12 meses.
3. Qué avisar, a quién y en cuánto tiempo si hubiera una fuga de datos.
4. Si guardar datos de varias empresas en un mismo servidor, o en otro país, exige algo especial, y qué contratos firmar con los proveedores.
5. Si el nombre de quien firmó un acta puede conservarse hasta el fin de su plazo, y qué valor tiene un acta en papel.
6. **Nuevas:** si es legal enviar a un proveedor externo de IA (quizá en otro país) **lo que los empleados escriben en el chat** y el texto de los casos, cómo avisarles que hablan con una IA, y si convendría guardar las conversaciones completas (nosotros recomendamos que no); y si traer a la plataforma las cuentas y equipos de los empleados desde Microsoft necesita un aviso o contrato especial.

Si hubiera una fuga, usted decide con el abogado si se avisa a la autoridad; el equipo prepara los textos. Ofrecer demostraciones a empresas que no son suyas ya lo confirmó: el abogado lo cubre en la consulta de la «Novedad» (contratos y costos aparte).

## C. Lo irreversible
- **Anonimizar o borrar datos de personas** no se deshace. Queda **apagado** hasta que el abogado confirme los plazos. Igual con **borrar la auditoría y las copias antiguas**.
- **Pasar a datos reales** (Etapa 7): lo autoriza usted tras la demo, con copia probada, contratos firmados, preguntas legales contestadas, aviso de privacidad aceptable y procedimiento por si hubiera una fuga.
- **Enviar datos a un proveedor de IA:** lo que se envía no se puede retirar del sistema del proveedor. Por eso el asistente nace apagado, sin guardar conversaciones (en el ticket queda solo lo que el empleado confirma), con las personas por código y sin leer el texto libre de los casos. No se usa con datos reales hasta contestar las preguntas legales y que usted apruebe contrato y tope.
- **Acciones remotas sobre equipos** (bloquear, borrar, retirar): **no las construimos**. Si algún día las pide, necesitará su decisión escrita y opinión legal. Solo informar.
- **Archivos exportados:** una vez descargados, la plataforma ya no los controla; por eso solo el Administrador exporta.

## D. Lo que solo usted puede entregar
1. Una **orden de compra real**, una **orden de servicio real** y el **Excel de inventario actual**, con los nombres reemplazados. Sin ellos no cerramos la Etapa 0: trabajaríamos con datos inventados y se lo diremos.
2. Una **cifra aproximada** de equipos, usuarios y órdenes por mes, y el **país** de cada empresa (y si los precios incluyen impuestos).
3. **A nombre de quién** quedan las cuentas (servidores, correo, dominio), el dominio que ya tenga, y **una persona con suplente** que reciba las alertas. **Para el piloto lo necesitamos ya** (ver «Novedad»).
4. **Dos personas del equipo** que administren la plataforma antes de datos reales, y por cada empresa un **representante de contacto fuera de la plataforma**.
5. **Solo antes de las olas de Fase 3:** si usa **SAP**; qué licencias de Microsoft tiene cada empresa y si algún equipo (Mac, iPhone, PDA) lo administra **otro sistema distinto de Intune**. Recomendamos que todo esté en Intune.

## E. Lo que NO tiene que decidir (ya lo decidió el equipo)
- **Cómo se entra:** por invitación, con enlace al correo, sin contraseñas; quien aprueba dinero o administra lleva segunda verificación.
- **Quién hace qué:** cada empresa ve solo lo suyo; nadie aprueba una compra que él mismo preparó.
- **Los dos módulos nuevos:** el asistente tendrá la misma lista de permisos que quien lo usa y **el ticket solo se crea cuando el empleado revisa el resumen y pulsa «Enviar»**; si el chat falla o llega a su tope, el formulario normal sigue funcionando; «Pedir ayuda» sigue en su lugar y el asistente es un botón aparte abajo a la derecha; Microsoft se conecta **solo para leer**, empresa por empresa, y nada cambia en las cuentas sin que una persona lo revise.
- **El orden:** primero las Etapas 0 a 7; los 17 módulos adicionales después, y la ola G (asistente y Microsoft) al final.
- **Todo el diseño técnico y de pantallas.**

Lo que sí sigue haciendo: aprobar la demo al final de cada etapa.
