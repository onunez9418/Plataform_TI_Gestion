# Hoja para el CEO

**Fecha:** 2026-10-29 (suma sus dos módulos nuevos) · **De:** Gerente de TI, por medio de la Jefatura de Proyecto
El equipo decidió lo técnico y lo de producto. A usted solo le llegan cuatro cosas: dinero, temas legales, decisiones que no se pueden deshacer y datos que solo usted tiene. **Sus dos módulos nuevos** (asistente de IA con botón flotante y conexión con Microsoft Entra ID e Intune) quedan para después de la versión 1, en una ola nueva (G); nada de lo de abajo sobre ellos hay que resolverlo hoy.

## A. Dinero que debe aprobar
- **Servicio de envío de correos.** La gente entra con un enlace al correo; sin este servicio nadie entra. Gasto mensual bajo. **Aprobar.**
- **Servidores, base de datos y copias.** Al principio, planes gratuitos o muy baratos (solo datos inventados). Antes de datos reales, planes de pago con copias. **Aprobar el arranque ya; el plan de uso real cuando se acerque, con precios comprobados.**
- **Pequeños gastos de seguridad:** copia en otro proveedor, vigilancia de errores, gestor de claves y llaves físicas para dos o tres administradores. **Aprobar.**
- **Dominio:** usar un subdominio de uno que ya tenga; comprar otro solo si no existe.
- **Abogado de protección de datos** (sección B). **Contratar** antes de datos reales; debe poder atender una consulta urgente el mismo día.
- **Asistente de IA (más adelante).** El proveedor cobra según cuánto texto se procesa, no una tarifa fija; por eso no hay cifra todavía. Antes de activarlo le pediremos: un **tope mensual** para toda la plataforma y otro por empresa, y si el costo lo asume usted o se traslada a las empresas. **Recomendamos** tope general y uno igual por empresa, aviso al 80 % y pausa al 100 %.
- **Licencias de Microsoft (más adelante).** Cada empresa debe **tener ya** su Intune; nosotros no lo compramos ni cotizamos. No esperamos cobro de Microsoft por leer los datos; si cambiara, le consultamos.
- **Más adelante** también: archivos adjuntos, conexión directa con SAP y criterios contables.

**Ojo:** las cifras de DevOps (**50 a 150 dólares al mes** con uso real) **no están verificadas**. Sirven para el orden de magnitud, no para decidir; antes de pedir un sí traeremos precios con fecha y enlace.

## B. Lo legal
Hay **25 preguntas** que el equipo no puede contestar: 16 del núcleo, 3 del asistente de IA y 6 de Microsoft. **Ocho** deben estar resueltas **antes de cargar datos reales**: la ley aplicable, el registro ante la autoridad, el aviso de privacidad, los plazos de conservación, el servidor compartido u otro país, los contratos con proveedores, los documentos de compra y el aviso de una fuga. Las de los dos módulos nuevos solo se necesitan **antes de activarlos con datos reales**; no frenan la versión 1. Las más importantes:
1. Qué ley de datos personales aplica en el país de cada empresa y si hay que registrar algo ante la autoridad.
2. Si nuestros plazos son correctos: auditoría 5 años, datos de quien se fue 2 años, copias 30 días y 12 meses.
3. Qué avisar, a quién y en cuánto tiempo si hubiera una fuga de datos.
4. Si guardar datos de varias empresas en un mismo servidor, o en otro país, exige algo especial, y qué contratos firmar con los proveedores.
5. Si el nombre de quien firmó un acta puede conservarse hasta el fin de su plazo, y qué valor tiene un acta en papel.
6. **Nuevas:** si es legal enviar textos de las empresas a un proveedor externo de IA (quizá en otro país), cómo avisar a los empleados que hablan con una IA, y si el texto libre de los casos de ayuda puede enviarse; y si traer a la plataforma las cuentas y equipos de los empleados desde Microsoft necesita un aviso o contrato especial.

Si hubiera una fuga, usted decide con el abogado si se avisa a la autoridad; el equipo prepara los textos. Avísenos solo si piensa ofrecer la plataforma a empresas que no son suyas: cambiaría contratos y costos.

## C. Lo irreversible
- **Anonimizar o borrar datos de personas** no se deshace. Queda **apagado** hasta que el abogado confirme los plazos. Igual con **borrar la auditoría y las copias antiguas**.
- **Pasar a datos reales** (Etapa 7): lo autoriza usted tras la demo, con copia probada, contratos firmados, preguntas legales contestadas, aviso de privacidad aceptable y procedimiento por si hubiera una fuga.
- **Enviar datos a un proveedor de IA:** lo que se envía no se puede retirar del sistema del proveedor. Por eso el asistente nace apagado, sin guardar conversaciones, con las personas por código y sin el texto libre de los casos. No se usa con datos reales hasta contestar las preguntas legales y que usted apruebe proveedor y contrato.
- **Acciones remotas sobre equipos** (bloquear, borrar, retirar): **no las construimos**. Si algún día las pide, necesitará su decisión escrita y opinión legal. Solo informar.
- **Archivos exportados:** una vez descargados, la plataforma ya no los controla; por eso solo el Administrador exporta.

## D. Lo que solo usted puede entregar
1. Una **orden de compra real**, una **orden de servicio real** y el **Excel de inventario actual**, con los nombres reemplazados. Sin ellos no cerramos la Etapa 0: trabajaríamos con datos inventados y se lo diremos.
2. Una **cifra aproximada** de equipos, usuarios y órdenes por mes, y el **país** de cada empresa (y si los precios incluyen impuestos).
3. **A nombre de quién** quedan las cuentas (servidores, correo, dominio), el dominio que ya tenga, y **una persona con suplente** que reciba las alertas.
4. **Dos personas del equipo** que administren la plataforma antes de datos reales, y por cada empresa un **representante de contacto fuera de la plataforma**.
5. **Solo antes de las olas de Fase 3:** si usa **SAP**; qué licencias de Microsoft tiene cada empresa y si algún equipo (Mac, iPhone, PDA) lo administra **otro sistema distinto de Intune**. Recomendamos que todo esté en Intune.

## E. Lo que NO tiene que decidir (ya lo decidió el equipo)
- **Cómo se entra:** por invitación, con enlace al correo, sin contraseñas; quien aprueba dinero o administra lleva segunda verificación.
- **Quién hace qué:** cada empresa ve solo lo suyo; nadie aprueba una compra que él mismo preparó.
- **Los dos módulos nuevos:** el asistente tendrá la misma lista de permisos que quien lo usa y nada se hace sin que la persona confirme; «Pedir ayuda» sigue en su lugar y el asistente es un botón aparte abajo a la derecha; Microsoft se conecta **solo para leer**, empresa por empresa, y nada cambia en las cuentas sin que una persona lo revise.
- **El orden:** primero las Etapas 0 a 7; los 17 módulos adicionales después, y la ola G (asistente y Microsoft) al final.
- **Todo el diseño técnico y de pantallas.**

Lo que sí sigue haciendo: aprobar la demo al final de cada etapa.
