# Hoja para el CEO

**Fecha:** 2026-10-29 (suma su decisión de no ofrecer nada hasta el 100 %, la hoja de ruta, sus dos módulos nuevos, el chat con Claude y el servicio extra del panel de administración) · **De:** Gerente de TI, por medio de la Jefatura de Proyecto
El equipo decidió lo técnico y lo de producto. A usted solo le llegan cuatro cosas: dinero, temas legales, decisiones que no se pueden deshacer y datos que solo usted tiene. **Sus dos módulos nuevos** (asistente de IA, cuya primera entrega es ahora el **chat de mesa de ayuda con Claude** para armar buenos tickets, y la conexión con Microsoft Entra ID e Intune) quedan para después de la versión 1, en una ola nueva (G); nada de lo de abajo sobre ellos hay que resolverlo hoy. Podrá ver el chat en el prototipo, con datos inventados.

## Su decisión: no se ofrece nada hasta el 100 % (D-117)
Usted decidió: **«aún no vamos a ofrecer nada hasta tener todo al 100 %»**. Queda así. **Ningún cliente ve ni usa nada** (ni el prototipo) hasta que usted apruebe el hito «100 %». Los servicios gratuitos (Neon, Render, Resend, GitHub) se usan **solo dentro del equipo y por usted**, con datos inventados, para las pruebas y las demos de cada etapa. La **empresa de demostración** (7 días, 5 usuarios, solo por invitación, con datos de ejemplo, apagados el chat, importar y exportar) **se diseña y se construye como parte del 100 %**, pero no se entrega antes.
**Lo que le pedimos que apruebe:** nuestra definición de «100 %» (en una frase: **todo construido, probado y revisado por los cuatro revisores, con documentación y plan para deshacer, y listo para datos reales con el abogado y los contratos en regla; y usted lo firma**). Detalle en `docs/equipo/hoja-de-ruta.md` (secciones 2 y 8) y D-117.6. **Una pregunta de dinero:** ¿entran en el 100 % las instalaciones en la base o los servidores de un cliente (y SQL Server)? **Recomendamos que no**: cuestan una etapa grande más un gasto continuo y la API de lectura ya cubre «mis datos en mi SQL Server».
**Lo que dejó de ser urgente y pasa a «antes de ofrecer» (no se pierde):** dominio para correos a clientes; acuerdo de prueba y plazo de guarda con el abogado; crédito del chat con Claude para clientes (recomendamos no comprarlo); dónde viven las demos de clientes. **Sigue siendo de ahora:** el correo de la empresa con suplente, los tres documentos reales y aprobar el arranque de bajo costo. El **dominio** solo se adelanta si lo exige la prueba de correo de la puerta (condición 6); si ya tiene uno, es un subdominio sin costo.
**Para llegar al 100 % le conviene empezar pronto lo que no depende de nosotros:** el **abogado** (sus respuestas son lo que más tarda), dos administradores y dos custodios de llaves, y las licencias de Microsoft. Lista completa en la sección 8 de `hoja-de-ruta.md`. **Honestidad:** hoy no hay código y no damos fechas hasta medir la Etapa 1. Borrar una demo vencida es irreversible y lo hace una persona a mano hasta que el abogado confirme plazos.

## A. Dinero que debe aprobar
- **Servicio de envío de correos.** La gente entra con un enlace al correo; sin este servicio nadie entra. Gasto mensual bajo. **Aprobar.**
- **Servidores, base de datos y copias.** Al principio, planes gratuitos o muy baratos (solo datos inventados). Antes de datos reales, planes de pago con copias. **Aprobar el arranque ya; el plan de uso real cuando se acerque, con precios comprobados.**
  - **Nuevo (2026-10-29): un servicio más para el panel de quienes administran la plataforma.** Lo ponemos aparte, con su propia dirección, para que un fallo en la parte que usan las empresas no alcance sus accesos de administración. **Puede sumar un gasto mensual pequeño**; no damos cifra hasta comprobar precios. Lo recomendamos igual por seguridad. No es una pregunta aparte: va incluido en la aprobación de los servidores. Los archivos que exportan las empresas se guardan unas horas dentro de la misma base de datos, así que **no suman gasto** (los archivos adjuntos siguen para el cierre de la Etapa 4).
- **Pequeños gastos de seguridad:** copia en otro proveedor, vigilancia de errores, gestor de claves y llaves físicas para dos o tres administradores. **Aprobar.**
- **Dominio:** usar un subdominio de uno que ya tenga; comprar otro solo si no existe. **Para clientes pasa a «antes de ofrecer»**; antes solo lo pide la prueba de correo de la puerta (ver «Su decisión»).
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

Si hubiera una fuga, usted decide con el abogado si se avisa a la autoridad; el equipo prepara los textos. Ofrecer demostraciones a empresas que no son suyas ya lo confirmó: el abogado lo cubre con el acuerdo de prueba, que pasa a «antes de ofrecer» (contratos y costos aparte).

## C. Lo irreversible
- **Anonimizar o borrar datos de personas** no se deshace. Queda **apagado** hasta que el abogado confirme los plazos. Igual con **borrar la auditoría y las copias antiguas**.
- **Pasar a datos reales** (Etapa 7): lo autoriza usted tras la demo, con copia probada, contratos firmados, preguntas legales contestadas, aviso de privacidad aceptable y procedimiento por si hubiera una fuga.
- **Enviar datos a un proveedor de IA:** lo que se envía no se puede retirar del sistema del proveedor. Por eso el asistente nace apagado, sin guardar conversaciones (en el ticket queda solo lo que el empleado confirma), con las personas por código y sin leer el texto libre de los casos. No se usa con datos reales hasta contestar las preguntas legales y que usted apruebe contrato y tope.
- **Acciones remotas sobre equipos** (bloquear, borrar, retirar): **no las construimos**. Si algún día las pide, necesitará su decisión escrita y opinión legal. Solo informar.
- **Archivos exportados:** una vez descargados, la plataforma ya no los controla; por eso solo el Administrador exporta.

## D. Lo que solo usted puede entregar
1. Una **orden de compra real**, una **orden de servicio real** y el **Excel de inventario actual**, con los nombres reemplazados. Sin ellos no cerramos la Etapa 0: trabajaríamos con datos inventados y se lo diremos.
2. Una **cifra aproximada** de equipos, usuarios y órdenes por mes, y el **país** de cada empresa (y si los precios incluyen impuestos).
3. **A nombre de quién** quedan las cuentas (servidores, correo, dominio), el dominio que ya tenga, y **una persona con suplente** que reciba las alertas. **Lo necesitamos ya** (cuentas de la puerta de la Etapa 0; ver «Su decisión»).
4. **Dos personas del equipo** que administren la plataforma antes de datos reales, y por cada empresa un **representante de contacto fuera de la plataforma**.
5. **Solo antes de las olas de Fase 3:** si usa **SAP**; qué licencias de Microsoft tiene cada empresa y si algún equipo (Mac, iPhone, PDA) lo administra **otro sistema distinto de Intune**. Recomendamos que todo esté en Intune.

## E. Lo que NO tiene que decidir (ya lo decidió el equipo)
- **Cómo se entra:** por invitación, con enlace al correo, sin contraseñas; quien aprueba dinero o administra lleva segunda verificación.
- **Quién hace qué:** cada empresa ve solo lo suyo; nadie aprueba una compra que él mismo preparó.
- **Los dos módulos nuevos:** el asistente tendrá la misma lista de permisos que quien lo usa y **el ticket solo se crea cuando el empleado revisa el resumen y pulsa «Enviar»**; si el chat falla o llega a su tope, el formulario normal sigue funcionando; «Pedir ayuda» sigue en su lugar y el asistente es un botón aparte abajo a la derecha; Microsoft se conecta **solo para leer**, empresa por empresa, y nada cambia en las cuentas sin que una persona lo revise.
- **El orden:** primero las Etapas 0 a 7; los 17 módulos adicionales después, y la ola G (asistente y Microsoft) al final.
- **Todo el diseño técnico y de pantallas.**

Lo que sí sigue haciendo: aprobar la demo al final de cada etapa.
