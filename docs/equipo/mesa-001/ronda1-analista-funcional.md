# Plan: Presentación del Analista Funcional, Mesa de Revisión #001, Ronda 1

Destino al ejecutar: `/home/user/Plataform_TI_Gestion/docs/equipo/mesa-001/ronda1-analista-funcional.md`
Estado: NO escrito todavía (modo plan activo). Al salir del modo plan, copiar el contenido de abajo tal cual.
Hecho verificado: al leer `docs/equipo/` solo existen `mesa-de-trabajo.md` y `riesgos.md`; aún no hay críticas de los compañeros.

## Pasos pendientes de ejecución
1. Crear `docs/equipo/mesa-001/ronda1-analista-funcional.md` con el contenido de abajo.
2. Con Glob/Read, revisar `docs/equipo/mesa-001/ronda1-*.md` que hayan aparecido.
3. Si hay críticas contradictorias o que dependen de mis preguntas, enviar máximo 3 SendMessage (1 a 3 líneas, pregunta en la primera) y registrarlos literalmente en "Mensajes directos".
4. No tocar `docs/documento-funcional.md` hasta la Ronda 2.

---

## Contenido del archivo (borrador)

# Mesa #001 · Ronda 1 · Presentación del Analista de Negocio

**Propuesta presentada:** `docs/documento-funcional.md` v0.1
**Participantes que critican:** gerente-ti (preside), arquitecto-software, disenador-ux, ingeniero-datos, qa-tester, especialista-seguridad, auditor-codigo, auditor-cumplimiento

## 1. Qué problema resuelve y qué decidió el CEO

El área de TI no tiene un solo lugar donde saber qué equipos tiene, dónde están, quién los usa, qué se compró, qué se aprobó y qué servicios se les hicieron. Hoy eso vive en Excel y correos. El documento propone una plataforma web para controlar activos (laptops, celulares, periféricos, licencias), las compras alrededor de ellos y los servicios, con rastro de quién hizo qué.

Decisiones ya tomadas por el CEO (están en `CLAUDE.md`, no las reabro):
- Multiempresa desde el inicio: cada empresa ve solo sus datos.
- Roles y permisos configurables por empresa.
- Catálogos configurables y campos personalizados por categoría (texto, número, fecha, lista, sí/no).
- Maestro de artículos por SKU, con código automático por categoría y posibilidad de sobrescribirlo.
- Un SKU se controla por serie o por cantidad; un SKU con serie puede tener muchas series.
- Órdenes de compra con aprobación configurable; la recepción crea los activos.

## 2. Autocrítica: dónde mi documento es débil

1. **Estados del activo** (sección 8): escribí cuatro estados de memoria. Faltan "Perdido/Robado", "En tránsito" y "Retirado para reciclaje". No dije qué transiciones son válidas (por ejemplo, un activo De baja no vuelve a Asignado).
2. **Sin historias de usuario ni criterios "Dado... cuando... entonces..."**. QA no puede probar nada todavía con lo que escribí. Es mi mayor deuda.
3. **Reglas de negocio mezcladas con prosa.** Debo pasar a una regla por línea con identificador (RN-xxx) para poder trazarlas a pruebas.
4. **Aprobación de OC**: dije "configurable" pero no definí qué se configura (umbral de monto, aprobador por rol, uno o varios niveles, si el creador puede aprobar su propia orden). Esto toca separación de funciones.
5. **Moneda e impuestos** en la OC: no los mencioné. Tampoco si hay presupuesto o centro de costo obligatorio.
6. **Recepción**: no cubrí series duplicadas, recepción de más o de menos unidades de lo pedido, devoluciones al proveedor, ni cómo se corrige una recepción mal hecha.
7. **Artículos por cantidad**: no definí stock mínimo, stock negativo (¿permitido?), ni ajustes de inventario por conteo físico.
8. **Asignación**: dije "usuario o ubicación", pero no si el "usuario" es un usuario de la plataforma o un empleado que no entra al sistema. Es crítico: la mayoría de quienes reciben una laptop no son usuarios de la plataforma.
9. **Datos personales**: asignar activos a personas, IMEI y número de línea son datos personales. No escribí retención ni quién puede verlos.
10. **Auditoría** (sección 11): "algo importante" es ambiguo. Falta decir qué se registra exactamente, por cuánto tiempo y que nadie puede borrarlo ni editarlo.
11. **Acceso con "cualquier correo"**: no definí cómo se verifica que el correo es de la persona, ni qué pasa si una persona sale de la empresa (baja de usuario vs. conservar su historial).
12. **Orden de servicio**: casi todo está pendiente. No dije si una OS puede generar costo ni si se vincula a una OC (servicio externo con proveedor).
13. **Cambios del SKU**: no dije qué pasa si se cambia el modo de control (serie/cantidad) de un SKU que ya tiene stock, o si se renombra una categoría con campos personalizados ya usados. Propongo prohibir cambiar el modo de control cuando hay existencias.
14. **Sin requisitos no funcionales** (volumen, rendimiento, disponibilidad, idioma, zona horaria). Dependen de la pregunta 4 del CEO.
15. **Importación inicial desde Excel** no figura en el alcance, aunque sin ella la plataforma arranca vacía.
16. **Glosario incompleto**: faltan Ubicación, Responsable, Baja, Traslado, Garantía, Centro de costo.

## 3. Qué espero de cada compañero

- **gerente-ti:** orden de prioridades (qué entra en cada etapa) y decisión sobre qué débiles de arriba bloquean la Etapa 1.
- **arquitecto-software:** señalar qué requisitos son inviables o muy caros, y qué decisiones mías en realidad son técnicas y debo quitar.
- **disenador-ux:** detectar flujos que serían torpes para un usuario no técnico (por ejemplo, captura de 50 series en la recepción) y proponer alternativas.
- **ingeniero-datos:** qué reglas de unicidad (SKU por empresa, serie por SKU o por empresa), qué pasa con importaciones y qué necesita el modelo para aislar por empresa.
- **qa-tester:** qué criterios no son verificables hoy; indicarme el formato que necesita para escribir pruebas.
- **especialista-seguridad:** riesgos del acceso con cualquier correo, invitaciones, usuario en varias empresas y permisos por rol.
- **auditor-codigo:** huecos o contradicciones entre secciones, y requisitos que no se pueden trazar.
- **auditor-cumplimiento:** datos personales, retención, separación de funciones (quien crea la OC no la aprueba ni la recibe), trazabilidad.

## 4. Preguntas abiertas para el CEO (sección 12 del documento)

| # | Pregunta | Mi recomendación |
|---|---|---|
| 1 | ¿Quién aprueba las OC y con qué montos? | Dos niveles: Jefatura TI hasta un monto; sobre ese monto, Gerencia. El creador nunca aprueba la suya. El monto lo fija el CEO. |
| 2 | ¿Cuáles son los estados exactos de un activo? | En stock, Asignado, En reparación, Prestado, Perdido/Robado, De baja. |
| 3 | ¿Qué tipos de servicio existen y cuál es su flujo? | Empezar con Reparación, Instalación y Servicio externo; aprobación solo si tiene costo. |
| 4 | ¿Cuántos activos, usuarios y órdenes por mes? | Pedir cifras aproximadas; con ellas se dimensiona. |
| 5 | ¿Habrá integración con SAP? | Asumir que sí más adelante: dejar el código del SKU editable y fuera de la Versión 1. |
| 6 | ¿Qué permisos tiene cada rol? | Aceptar la tabla de la sección 5 como base y ajustarla en una reunión corta. |
| 7 | ¿Puede compartir una OC real, una OS real y el Excel de inventario actual? | Sí, con datos de ejemplo si hay confidencialidad. Sin ellos el modelo se hace a ciegas. |

Preguntas nuevas que surgieron de mi autocrítica (las entregaré al CEO en la Ronda 2 si se confirman):
- A. ¿Las personas que reciben equipos (empleados) deben poder entrar a la plataforma o solo figurar como nombres?
- B. ¿Se necesita cargar el inventario actual desde Excel al inicio?
- C. ¿Las OC manejan más de una moneda?
- D. ¿Cuánto tiempo se debe conservar el historial de auditoría?

## 5. Mensajes directos

(Vacío. Se registrarán aquí, literalmente, los que envíe o reciba.)
