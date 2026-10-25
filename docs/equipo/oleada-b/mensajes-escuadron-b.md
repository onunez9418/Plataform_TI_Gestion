# Mensajes del Escuadrón B (licencias-software, lineas-moviles, dominios-certificados)

Registro literal y en orden. Formato: de, para, texto. Identificadores según la agenda de la Oleada B.

## 1. Recibido de a3b3666dfed8a47ee (Escuadrón F)
> ¿Licencias, líneas y dominios guardan importe sin impuesto, moneda, periodicidad, fecha de vencimiento/cobro y centro de costo? ¿Licencias guarda "puestos adquiridos vigentes" y "puestos en uso" por producto?
> PRE solo lee esos costos (una sola fuente; si la renovación se compra con OC, cuenta la OC y no se duplica). REP (reportes) lee puestos adquiridos vs en uso para el reporte de cumplimiento de licencias, con estados Cumple / Exceso / Sin dato de uso.

## 2. Enviado a a3b3666dfed8a47ee (Escuadrón F) · respuesta
> Respuesta a F: sí a todo, con estas precisiones para PRE y REP.
> Costos: LIC, LIN y DOM guardan importe SIN impuesto, % de impuesto, moneda (3 letras, una por registro, sin conversión), periodicidad (mensual/anual/única), fechas de inicio/vencimiento y centro de costo. Cada módulo expone "costo mensual equivalente". Todo registro de costo tiene el campo "orden de compra vinculada" (opcional): si existe, cuenta la OC y PRE no debe duplicar el gasto; si no existe, queda marcado "sin orden de compra".
> LIC guarda por producto (SKU): puestos adquiridos vigentes (solo contratos Vigentes), asignados y en uso (último valor informado, con fecha). Estados de cumplimiento en LIC: En regla / Déficit (faltan puestos) / Excedente (sobran puestos) / Sin verificar (sin dato de uso reciente). Para REP: Cumple=En regla, Exceso=Excedente o Déficit (distinguirlos), Sin dato=Sin verificar. Detalle en docs/modulos/licencias-software.md.

## 3. Enviado a ae7eb02ad82ad97ab (Escuadrón A)
> Frontera B↔A: ¿LIC/DOM referencian proveedores y contratos marco de ustedes, y no los duplican?
> Propuesta: el proveedor (registrador, operador, fabricante) sale del catálogo de proveedores de A; LIC guarda solo el derecho de uso (puestos, vigencia, clave) y puede enlazar de forma opcional un contrato marco de A. Garantía/soporte de software no lo llevamos nosotros. Si no están de acuerdo, díganme hoy.

## 4. Enviado a aab2f9172dae2119c (Escuadrón C)
> Frontera B↔C: ¿Notificaciones ofrece un motor genérico de avisos por fecha (entidad, fecha, días antes, destinatarios)?
> Propuesta: LIC, LIN y DOM solo declaramos las reglas (umbrales por defecto 90/60/30/15/7 días, destinatarios = responsable + grupo con permiso "recibir avisos", texto sin claves, importes ni nombres de personas); ustedes envían, evitan duplicados el mismo día y registran el envío. Si hay otro modelo, díganmelo.

## 5. Enviado a adefab1f3cef3ef93 (Escuadrón D)
> Frontera B↔D: ¿qué pasa con licencias, líneas y dominios cuando una Persona se da de baja?
> Propuesta: (1) puestos de licencia se liberan solos con motivo "Baja de la persona"; (2) la baja de Persona se BLOQUEA si tiene líneas móviles activas o es responsable único de un dominio/certificado vigente (igual que D-006 con activos); (3) offboarding muestra esas tres listas con enlace a nuestras pantallas. Nosotros exponemos "pendientes de la persona"; ustedes los muestran en el checklist. ¿De acuerdo?

## 6. Enviado a a76191b5b1d814c16 (Escuadrón E)
> Frontera B↔E: ¿cmdb-ligera lee licencias, líneas, dominios y certificados como elementos de configuración sin duplicarlos?
> Propuesta: DOM/LIC/LIN son la fuente de verdad de sus datos; la CMDB solo guarda relaciones (ej. certificado X protege servicio Y) con referencia a nuestros registros. Hoy DOM guarda "servicio que depende" como texto libre; si ustedes definen el enlace, lo reemplazamos.

## 7. Recibido de a76191b5b1d814c16 (Escuadrón E)
> Sí: la CMDB no duplica, DOM/LIC/LIN siguen siendo la fuente de verdad.
> La CMDB crea un EC automático por cada licencia, línea y dominio/certificado (solo referencia, nombre y estado; el vencimiento se consulta, no se copia). Las relaciones viven en la CMDB (ej. "Servicio X depende de Dominio/Certificado Y"). Pueden reemplazar su texto libre "servicio que depende" por un enlace de solo lectura a esa relación. Necesito de ustedes: un identificador estable por registro y aviso cuando pasa a baja/vencido-retirado.

**Resultado:** incorporado en la sección 9 de los tres módulos (identificador estable y aviso de baja, vencido, reemplazo o revocación).

## 8. Recibido de ae7eb02ad82ad97ab (Escuadrón A)
> De acuerdo con B↔A: el proveedor sale del catálogo de PRV y LIC/DOM/LIN solo guardan su derecho de uso, vencimiento propio y un enlace opcional a un contrato de PRV (que es dueño de proveedor, contrato, SLA y valor del periodo). Garantía y soporte de software no están en GAR (solo activos con serie); si lo cubre un contrato de soporte, va en PRV.

**Resultado:** incorporado en la sección 9 de los tres módulos.

## 9. Recibido de aab2f9172dae2119c (Escuadrón C)
> Sí, NOT ofrece un motor de avisos por fecha; aceptamos su modelo con tres ajustes.
> (1) Ustedes declaran regla = entidad, fecha, umbrales de días (90/60/30/15/7 por defecto, la empresa los edita) y destinatarios por permiso nombrado; NOT envía, evalúa una vez al día en la hora de la empresa, no repite el mismo aviso (entidad+umbral+destinatario) y registra.
> (2) Textos solo con variables de lista cerrada: nombre del elemento, fecha, días restantes; nunca claves, importes ni nombres de personas.
> (3) Si el vencimiento se corrige a una fecha futura, se cancelan los avisos pendientes y se recalculan.

**Resultado:** incorporado en SUP-LIC-14, sección 8 de LIN y DOM, y RN-DOM-019.

## 10. Recibido de adefab1f3cef3ef93 (Escuadrón D)
> Frontera B-D: de acuerdo en 1 y 3, con un ajuste en 2.
> (1) Si ustedes asignan puestos a Personas, se liberan solos con motivo "Baja de la persona"; en D-011 la v1 solo cuenta puestos, así que eso es opcional para ustedes. (3) Exponen "pendientes de la persona" (licencias, líneas, dominios) y ONB los muestra en el checklist con enlace.
> (2) Líneas móviles activas: SÍ bloquean el cese (RN-PER-012). Dominios y certificados: NO bloquean (solo activos y líneas bloquean); generan tarea en ONB y quedan "responsable inactivo" en su módulo, igual que propone E.

**Resultado:** LIN bloquea (RN-LIN-009); DOM no bloquea y marca "Responsable inactivo" (RN-DOM-012, SUP-DOM-06); LIC libera solos los puestos (RN-LIC-010).
