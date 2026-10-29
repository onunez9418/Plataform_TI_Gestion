# Hoja para el CEO

**Fecha:** 2026-10-29 · **De:** Gerente de TI, por medio de la Jefatura de Proyecto
Solo le llegan cuatro cosas: dinero, temas legales, decisiones que no se pueden deshacer y datos que solo usted tiene. Lo demás lo decide el equipo.

## Sus dos decisiones de hoy
1. **«Saltemos lo del abogado y terminemos la plataforma» (D-118).** Hecho: el abogado y las preguntas legales **no se gestionan ahora** y el equipo **construye hasta completar la plataforma**. Lo que debe saber: el abogado no frena la construcción, pero **sin él no se pueden cargar datos reales, ofrecer a clientes, ni encender** el texto libre del asistente, el borrado o anonimización de personas y el envío de datos reales a proveedores externos. Todo eso queda **apagado y probado apagado**. Por eso habrá dos hitos que usted firma: **«Plataforma completa»** (con datos de ejemplo) y **«Lista para datos reales»** (con abogado y contratos, cuando usted decida).
2. **Probar una versión local hoy (D-119).** Una versión chica pero real, con datos inventados de dos empresas, en su computadora Windows con Docker Desktop: doble clic en `iniciar.bat`, abrir `http://localhost:3000`. Tendrá una guía paso a paso (`LEEME-PROBAR.md`). **No es para datos reales ni para clientes.** Sigue vigente que nadie de fuera ve nada hasta el hito final (D-117).

**Una frase para confirmar (riesgo):** programamos sin sus documentos reales y sin la prueba de pantallas con 5 personas; si más tarde no coinciden con lo que usted usa, se rehace parte del trabajo. Su pedido de probar hoy lo da por aceptado: avísenos si no.
**Una pregunta de dinero:** ¿entran en el «100 %» las instalaciones en la base o los servidores de un cliente (y SQL Server)? **Recomendamos que no**: cuestan una etapa grande más gasto continuo, y la API de lectura ya cubre «mis datos en mi SQL Server».

## Lo que necesitamos de usted ahora
- **Hoy:** que su Windows permita instalar y abrir Docker Desktop (si pide activar la «virtualización», le decimos cómo) y probar la versión local a las 20:00 (Lima).
- **Cuando pueda (no frena programar, sí cerrar la Etapa 0):** una **orden de compra**, una **orden de servicio** y el **Excel de inventario** reales con los nombres de personas reemplazados; **país** de cada empresa, si los precios incluyen impuestos y una cifra aproximada de equipos, usuarios y órdenes por mes.
- **Solo cuando salgamos de su computadora hacia la nube:** el correo de la empresa (con suplente) para abrir cuentas, aprobar el arranque de bajo costo y el servicio de correo (traeremos precios con fecha y enlace), y un dominio o subdominio.

## A. Dinero que deberá aprobar (más adelante)
- **Correo, servidores, base de datos y copias:** al principio planes gratuitos o muy baratos con datos inventados; antes de datos reales, planes de pago con copias. Posible servicio extra para el panel de quienes administran la plataforma (gasto pequeño, sin cifra hasta comprobar precios). **Las cifras de 50 a 150 dólares al mes no están verificadas.**
- **Pequeños gastos de seguridad:** copia en otro proveedor, vigilancia de errores, gestor de claves y llaves físicas.
- **Asistente de IA (Claude) y licencias de Microsoft:** después de la versión 1. El asistente cobra por uso: le pediremos un tope mensual y aprobar el contrato; no prometemos gasto acotado hasta verificarlo en la cuenta del proveedor.

## B. Lo legal: diferido por su decisión, no se pierde
Hay **25 preguntas** para un abogado (16 del núcleo, 3 del asistente y 6 de Microsoft); **ocho** son necesarias antes de cargar datos reales: la ley aplicable y el registro ante la autoridad, el aviso de privacidad, los plazos de conservación, datos de varias empresas en un servidor o en otro país, los contratos con proveedores, los documentos de compra y el aviso de una fuga. Quedan para **«antes de datos reales»** y **«antes de ofrecer»**. Si el abogado pidiera cambios más tarde, puede haber retrabajo (riesgo #72); por eso los plazos se construyen configurables y lo que depende de la ley, apagado. Le recordaremos el tema al cerrar la Etapa 4 (un aviso, no una pregunta).

## C. Lo irreversible (queda apagado o en su mano)
- **Anonimizar o borrar datos de personas**, borrar la auditoría y las copias antiguas: apagado hasta que el abogado confirme los plazos.
- **Pasar a datos reales:** lo decide usted tras la demo final, con copia probada, contratos firmados, preguntas legales contestadas y procedimiento por si hubiera una fuga.
- **Enviar datos a un proveedor de IA** (no se pueden retirar): el asistente nace apagado, sin guardar conversaciones.
- **Acciones remotas sobre equipos** (bloquear, borrar): no se construyen.

## D. Lo que solo usted puede entregar o decidir
Los documentos reales y cifras de arriba; **dos personas** para administrar la plataforma y **dos custodios de las llaves** antes de datos reales; por empresa, **un representante** a quien avisar si falla el correo; antes de la ola de Microsoft, qué licencias tiene cada empresa; antes de la integración con sistemas externos, si usa SAP; y **aprobar la definición del «100 %»** (en `hoja-de-ruta.md`).

## E. Lo que NO tiene que decidir
Cómo se entra (invitación y enlace), quién hace qué (cada empresa ve solo lo suyo; nadie aprueba lo que él preparó), el orden de construcción, y todo el diseño técnico y de pantallas. Sigue aprobando la demo al final de cada etapa.
