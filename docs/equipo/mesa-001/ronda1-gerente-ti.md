# Mesa de revisión #001 · Ronda 1 · Intervención del Gerente de TI

BORRADOR LISTO PARA COPIAR a `docs/equipo/mesa-001/ronda1-gerente-ti.md`.
No pude escribirlo en esa ruta porque la sesión está en modo plan (solo permite editar este archivo).
No envié mensajes directos (también bloqueado por el modo plan).

---

# Mesa #001 · Ronda 1 · Gerente de TI

## Apertura de la mesa

Buenas. Esta mesa revisa el documento funcional v0.1, que es el contrato con el CEO. Quiero que salgamos de aquí con un documento v0.2 que el CEO pueda aprobar sin tener que adivinar nada. Espero de cada uno críticas concretas desde su especialidad, con alternativa propuesta, y que separen lo que es un hecho (está o no está en el documento) de lo que es opinión. Criterio de éxito: (1) cada sección se entiende sin saber de tecnología, (2) lo que falta queda como pregunta cerrada para el CEO, no como suposición, (3) sabemos qué entra y qué no entra en cada etapa, y (4) en dos rondas máximo hay decisión escrita.

## 1. Qué está bien

- El documento es corto, claro y en lenguaje simple. El glosario (SKU, serie, activo, control por serie/cantidad) evita confusiones desde el día uno.
- Deja explícito qué NO incluye la versión 1 (sección 2). Eso protege el alcance.
- Lo desconocido está marcado como [PENDIENTE] y listado en la sección 12 con responsable. Nadie inventó reglas de negocio.
- La idea de resolver las licencias con el modo de control (sección 7) en vez de crear un tipo especial es simple y elegante.
- La recepción que crea los activos (sección 9) deja la trazabilidad completa: compra, recepción, activo.

## 2. Qué me preocupa

**2.1 Alcance de la versión 1. OPINIÓN.** Son 8 módulos, y varios son "configurables" (roles, catálogos nuevos, campos personalizados, aprobación por monto/tipo, multiempresa con usuario en varias empresas). Cada "configurable" cuesta mucho más que la versión fija. Creo que es realizable, pero solo si recortamos la configurabilidad al mínimo útil en la primera entrega. Mi miedo es llegar a la Etapa 5 con mucha flexibilidad construida y sin una compra real que funcione.

**2.2 No hay importación del inventario actual. HECHO.** La sección 2 no menciona importar el Excel, y la sección 12 pide el Excel (#7). Pero el riesgo #4 ya asume una importación. Sin importación, el CEO tendría que teclear cientos de activos a mano para ver valor en la Etapa 4. Esto es adopción, no un detalle.

**2.3 "Acceso con cualquier tipo de correo" (sección 4). HECHO que es ambiguo.** No dice cómo se entra: ¿con contraseña, con un enlace que llega al correo, con Google/Microsoft? Tampoco dice quién puede crear una empresa nueva: "el primer usuario de una empresa es su administrador" sugiere que cualquiera se registra y crea una empresa. Si es abierto, hay riesgo de cuentas falsas y de costos de correo. Y no existe el rol de quien administra la plataforma completa (alta/baja de empresas), distinto del Administrador de cada empresa.

**2.4 La "solicitud" no existe como objeto (secciones 5 y 9). HECHO.** El rol Solicitante "crea solicitudes de compra o servicio", pero el flujo de la sección 9 empieza en una OC "Borrador" y no hay ninguna "solicitud de compra". ¿El solicitante hace un borrador de OC? ¿Es otro documento? Hoy el documento se contradice o está incompleto.

**2.5 Aprobación y separación de funciones (sección 9). OPINIÓN con base en riesgo.** No dice si quien crea una OC puede aprobarla él mismo. Para dinero eso importa. Los auditores lo van a señalar; lo dejo anotado desde ya.

**2.6 Reglas de borde sin definir (secciones 7, 8, 9). HECHO que faltan.**
- ¿Se puede cambiar el modo de control (serie/cantidad) de un SKU que ya tiene stock? Mi opinión: no.
- Recepción: ¿se puede recibir más de lo pedido? ¿mercadería dañada o rechazada? ¿devoluciones al proveedor?
- OC "Anulada" tras una recepción parcial: el texto dice "antes de recibir", ¿qué pasa con lo pendiente?
- "Eliminar" (sección 11) vs "dar de baja" (sección 5): ¿se borra algo alguna vez o todo se desactiva?
- "Registros importantes" (sección 11) no está definido.

**2.7 Cosas que un área de TI esperaría y no están ni como "futuro". HECHO que no aparecen.** Moneda e impuestos en la OC; numeración de las OC; adjuntos (cotización, factura, acta de entrega); avisos por correo (invitaciones y aprobaciones los necesitan sí o sí); exportar a Excel; búsqueda y filtros; garantía vencida o licencia por vencer (el documento captura fechas pero no avisa). No pido meter todo: pido que cada cosa quede en "entra" o "no entra" y que el CEO lo sepa.

**2.8 Datos personales y cumplimiento. OPINIÓN, la dejo a los auditores.** Se guardan correos de personas y se asignan activos a personas (responsable). País, ley aplicable y cuánto tiempo se guardan los datos no están en el documento.

**2.9 No hay criterios de aceptación. HECHO.** El documento dice qué hace, pero no cómo el CEO comprueba que está bien. Cada etapa termina en una demo que él aprueba; necesita una lista corta de "esto debe poder hacer en la demo".

**2.10 Orden de etapas. OPINIÓN.** El orden general es correcto: cimientos, catálogos, SKU, inventario, compras, servicios, pulido. Dos ajustes:
- Auditoría está en la Etapa 1 y debe construirse como mecanismo general desde ahí, para que cada etapa posterior la use sin rehacer nada.
- Las órdenes de servicio (Etapa 6) están bien al final porque son lo más indefinido (tres pendientes), pero dependen de los activos (Etapa 4), no de las compras (Etapa 5). Si el CEO valora más reparar/asignar que comprar, se pueden intercambiar 5 y 6 sin romper nada técnico. Es decisión de él.
- El Excel y los documentos reales (pendiente #7) bloquean la Etapa 0. Si el CEO no los entrega, estamos programando sobre supuestos. Es el punto crítico de todo el calendario.

## 3. Qué cambiaría

1. **Recortar la configurabilidad de la v1** (decisión de alcance, a confirmar con el CEO):
   - Aprobación de OC: un solo nivel, con un monto límite por empresa (apruebo a partir de X). Sin varios niveles ni reglas por tipo de orden. Se amplía en versión 2 si lo pide.
   - Roles: los 6 propuestos, editables (qué permisos tiene cada uno), pero no inventar un sistema de permisos finísimo por campo.
   - Subcategorías: mantenerlas a un solo nivel de profundidad.
2. **Agregar la importación de inventario desde Excel** al alcance, dentro de la Etapa 4, con reporte de errores fila por fila.
3. **Definir el acceso**: cómo se entra, quién crea empresas y el rol del "administrador de la plataforma". Mi recomendación va en las preguntas.
4. **Aclarar la "solicitud"**: o se elimina del rol Solicitante, o se agrega al flujo (recomiendo: el Solicitante crea una OC en borrador; no hay documento aparte).
5. **Agregar al documento una sección "Reglas de negocio"** con las reglas de borde de 2.6, cada una con su respuesta o su pregunta al CEO.
6. **Agregar "Criterios de aceptación por etapa"**: 5-8 frases por etapa, ej. Etapa 1: "Dos empresas distintas no ven nada la una de la otra; un Técnico no puede aprobar una OC; hay un registro de quién hizo qué".
7. **Agregar una sección "Fuera de la v1 / por decidir"** con lo del punto 2.7: cada ítem como entra o no entra.
8. **Sin puerta de salida de la Etapa 0 no se programa**: la Etapa 0 solo se cierra cuando el CEO aprueba el documento v1.0 y entregó al menos una OC real, una OS real y el Excel (aunque sea con datos ficticios o recortados, sin información sensible).
9. **Pendientes con bloqueo explícito**: marcar en la sección 12 qué etapa bloquea cada uno (#2 bloquea Etapa 4; #1 bloquea Etapa 5; #3 bloquea Etapa 6; #4 afecta el dimensionamiento de todo; #5 no bloquea, solo orienta; #6 bloquea Etapa 1 en parte). Así el CEO ve que no todo es urgente.

## 4. Preguntas para el CEO

1. **¿Quién puede crear una empresa nueva en la plataforma?**
   a) Cualquiera que se registre. b) Solo nosotros (el equipo de TI) a pedido tuyo. c) Solo por invitación nuestra.
   Recomendación: b o c para la v1. Evita cuentas falsas y abusos, y es más simple de construir.

2. **¿Cómo prefieres que entren los usuarios?**
   a) Correo y contraseña. b) Un enlace que les llega al correo, sin contraseña. c) Con su cuenta de Google o Microsoft.
   Recomendación: b, más c si es necesario después. Sin contraseñas que olvidar ni guardar. Funciona con cualquier tipo de correo, como pediste.

3. **¿Incluimos en la primera versión la carga masiva de tu Excel actual de inventario?**
   a) Sí, en la Etapa 4. b) No, se teclea a mano. c) Más adelante.
   Recomendación: a. Sin esto la plataforma arranca vacía y nadie la adopta.

4. **¿Cómo quieres la aprobación de órdenes de compra al comienzo?**
   a) Sin aprobación. b) Un aprobador y un monto: sobre ese monto, alguien con rol de Jefatura debe aprobar. c) Varios niveles según el monto.
   Recomendación: b. Cubre el 90% de los casos y se amplía después.

5. **¿La persona que crea una orden de compra puede aprobarla ella misma?**
   a) Sí. b) No, siempre otra persona. c) Sí, pero solo bajo cierto monto.
   Recomendación: b (o c). Es una práctica estándar de control y los auditores van a pedirla.

6. **¿Esta plataforma la usarán solo tus empresas o la ofrecerás a otras empresas externas?**
   a) Solo mis empresas. b) También a clientes externos más adelante.
   Recomendación: no decide ahora, pero necesito saber: si es (b), hay que pensar en costos, soporte y condiciones de uso desde el principio.

7. **¿Prefieres ver compras o servicios primero?** (Etapas 5 y 6)
   a) Compras primero (como está). b) Servicios primero.
   Recomendación: a, porque las compras ya están más definidas.

## 5. Riesgos nuevos que propongo para `docs/equipo/riesgos.md`

| # | Riesgo | Prob. | Impacto | Responsable | Plan |
|---|---|---|---|---|---|
| 6 | El CEO no entrega a tiempo documentos reales (OC, OS, Excel) y avanzamos sobre supuestos | Media | Alto | Jefatura de Proyecto | Fijar fecha límite; Etapa 0 no se cierra sin ellos; si no hay, usar datos ficticios y declararlo |
| 7 | El alcance crece por exceso de configurabilidad (roles, aprobaciones, campos) y la primera demo llega tarde | Alta | Alto | Gerente de TI | Versión fija mínima en v1, ampliar en v2; revisar el alcance al abrir cada etapa |
| 8 | Registro abierto de empresas y usuarios: cuentas falsas, abuso, costos de correo | Media | Medio | Seguridad, Arquitecto | Alta de empresas controlada (por invitación); límites de envío de correos |
| 9 | Servicio de correo (invitaciones, avisos) falla, llega a spam o genera costo no previsto | Media | Medio | DevOps | Elegir proveedor temprano; probar entregabilidad; presupuesto aprobado por el CEO |
| 10 | Datos personales (correos, responsables de activos) sin política de retención ni ley aplicable definida | Media | Alto | Auditor de Cumplimiento | Definir país y ley; política de retención; revisar antes de la Etapa 1 |
| 11 | Un usuario con varias empresas actúa en la empresa equivocada (empresa activa mal elegida) | Media | Alto | Frontend, Backend, QA | Empresa activa siempre visible; el servidor valida la empresa en cada acción; pruebas específicas |
| 12 | Reglas de borde sin definir (cambio de modo de control, recepción de más, anulaciones parciales) generan datos inconsistentes | Media | Alto | Analista, Ingeniero de Datos | Sección "Reglas de negocio" en el documento; restricciones en la base de datos |
| 13 | La plataforma no se adopta porque el Excel actual sigue en paralelo | Media | Alto | Jefatura de Proyecto | Importación en Etapa 4; plan de corte (fecha desde la cual el Excel se deja de usar) |
| 14 | No hay definición de quién opera y paga el servicio (alojamiento, respaldos, soporte) | Media | Medio | DevOps, CEO | Estimar costo mensual en Etapa 0; plan de respaldos antes de la Etapa 7 |

## 6. Mensajes directos

Ninguno enviado (modo plan). Los habría usado para: (1) analista-funcional: confirmar la contradicción sobre "solicitud de compra"; (2) arquitecto-software: costo de "múltiples empresas por usuario" y del rol de administrador de plataforma; (3) auditor-cumplimiento: ley de datos aplicable al país del CEO.
