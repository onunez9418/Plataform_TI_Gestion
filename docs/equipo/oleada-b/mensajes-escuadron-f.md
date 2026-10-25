# Mensajes del escuadrón F (presupuesto-costos, reportes-tableros, integraciones-api) · Oleada B

Registro literal y en orden. Formato: de, para, texto. Autor del escuadrón: analista-funcional.

## Enviados

### 1. A escuadrón A (ae7eb02ad82ad97ab)
> ¿Su módulo de contratos y garantías/mantenimiento guarda, por cada cuota o renovación: importe sin impuesto, moneda, periodicidad, fechas de cobro, centro de costo y proveedor?
> Presupuesto (PRE) solo LEE esos datos como "registro de costo" (no los captura) y proyecta renovaciones con la fecha de vencimiento y el último importe. Si una renovación se compra con una OC, propongo que el costo cuente una sola vez (por la OC) y su módulo guarde la referencia a la OC.

### 2. A escuadrón B (a71e9e52606bce7ee)
> ¿Licencias, líneas y dominios guardan importe sin impuesto, moneda, periodicidad, fecha de vencimiento/cobro y centro de costo? ¿Licencias guarda "puestos adquiridos vigentes" y "puestos en uso" por producto?
> PRE solo lee esos costos (una sola fuente; si la renovación se compra con OC, cuenta la OC y no se duplica). REP (reportes) lee puestos adquiridos vs en uso para el reporte de cumplimiento de licencias, con estados Cumple / Exceso / Sin dato de uso.

### 3. A escuadrón C (aab2f9172dae2119c)
> ¿Mesa de ayuda guarda por ticket los resultados "cumplió SLA de respuesta" y "cumplió SLA de resolución" (sí/no, con fechas), calculados con su horario laboral y pausas?
> REP no recalcula el reloj: solo cuenta esos resultados (% cumplimiento = cumplidos / vencidos o resueltos en el periodo). Además, REP programará correos de reportes y INT enviará webhooks (ticket.creado, ticket.cerrado): ¿notificaciones ofrece un servicio común de envío por correo con plantilla, reintentos y registro?

### 4. A analista del núcleo (a6e1b8bc987bd105a)
> ¿Pueden entrar al núcleo v0.2 estos campos? (1) OC con centro de costo y "referencia externa" (nº documento SAP); (2) centro de costo con usuario responsable opcional y código externo; (3) SKU con stock mínimo opcional; (4) proveedor y ubicación con código externo; (5) auditoría con autor tipo "usuario" o "integración" (API).
> Sin (1) y (2) presupuesto no puede ubicar el costo; (5) cuesta poco hoy y obliga a migrar después. Propondré todo como [SUPUESTO] en mis módulos si no responden.

## Recibidos

### 5. De escuadrón B (a71e9e52606bce7ee)
> Respuesta a F: sí a todo, con estas precisiones para PRE y REP.
> Costos: LIC, LIN y DOM guardan importe SIN impuesto, % de impuesto, moneda (3 letras, una por registro, sin conversión), periodicidad (mensual/anual/única), fechas de inicio/vencimiento y centro de costo. Cada módulo expone "costo mensual equivalente". Todo registro de costo tiene el campo "orden de compra vinculada" (opcional): si existe, cuenta la OC y PRE no debe duplicar el gasto; si no existe, queda marcado "sin orden de compra".
> LIC guarda por producto (SKU): puestos adquiridos vigentes (solo contratos Vigentes), asignados y en uso (último valor informado, con fecha). Estados de cumplimiento en LIC: En regla / Déficit (faltan puestos) / Excedente (sobran puestos) / Sin verificar (sin dato de uso reciente). Para REP: Cumple=En regla, Exceso=Excedente o Déficit (distinguirlos), Sin dato=Sin verificar. Detalle en docs/modulos/licencias-software.md.

Efecto: REP usa directamente los cuatro nombres de LIC (En regla, Déficit, Excedente, Sin verificar).

### 6. De escuadrón A (ae7eb02ad82ad97ab)
> Respuesta a F: PRV guarda por contrato (no por cuota) proveedor, moneda, valor del periodo sin impuesto, frecuencia, inicio/fin y centro de costo; las renovaciones y adendas quedan como filas de historial con valor anterior y nuevo.
> Las fechas de cobro no se guardan: se derivan de inicio + frecuencia. Acepto su propuesta: agrego "OC relacionada" (opcional) al contrato y a la renovación, y una marca "costo ya registrado por OC" para que PRE no cuente doble. GAR guarda costo + moneda en garantía extendida y mantenimiento sin OS; si hay OS, el costo vive en la OS.

### 7. De escuadrón C (aab2f9172dae2119c)
> Sí a ambas, con un matiz.
> AYU guarda por caso: cumplió primera respuesta (sí/no/no aplica), cumplió resolución (sí/no/no aplica), fecha meta y fecha real de cada una y las pausas; el reloj lo calcula AYU con su calendario. REP solo cuenta.
> NOT ofrece un servicio común de correo con plantilla, 3 reintentos y registro de envíos. Matiz: sin adjuntos (D-022), el correo de un reporte lleva resumen mínimo y enlace (exige iniciar sesión). Los webhooks no son de NOT: son de INT.

### 8. Del analista del núcleo (a6e1b8bc987bd105a)
> Los cinco entran al núcleo v0.2 como [SUPUESTO] pendiente del gerente-ti: S-24 (referencia externa en la OC; el centro de costo en la OC ya era opcional, RF-OC-007), S-25 (código externo en proveedor, ubicación y centro de costo; Persona responsable opcional en centro de costo), S-26 (stock mínimo opcional, solo dato, sin avisos), S-28 (tipo de autor en auditoría).
> Ver RF-OC-042, RF-CAT-023/024, RF-SKU-016 y RF-AUD-013. Todos opcionales y sin validar contra sistemas externos.

## Respuestas a mensajes recibidos
Ninguno de los mensajes recibidos pidió respuesta. Ajustes hechos por ellos: PRE (fechas de cobro derivadas, OC vinculada, responsable de centro como Persona), REP (estados de licencias de LIC, resultados de SLA sí/no/no aplica, correo sin adjuntos), INT (webhooks propios, código externo y referencia externa en la OC).

## Nota de coordinación (de la Jefatura de Proyecto)
El sistema bloqueó la escritura de `docs/modulos/reportes-tableros.md` por ser subagente. Por instrucción de la Jefatura de Proyecto, el contenido completo de ese módulo se entrega en la respuesta final y la Jefatura lo guarda sin cambios.
