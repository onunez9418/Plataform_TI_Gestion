# Mesa de revisión #001 · Ronda 1 · Auditor Técnico (auditor-codigo)

NOTA DE ESTADO: el modo de planificación estaba activo y me impedía escribir en `docs/equipo/mesa-001/`. Este texto está listo para copiarse tal cual a `/home/user/Plataform_TI_Gestion/docs/equipo/mesa-001/ronda1-auditor-codigo.md` en cuanto se autorice la escritura. No envié mensajes directos por la misma razón.

Documento auditado: `docs/documento-funcional.md` v0.1 (leí también `CLAUDE.md`, `docs/equipo/riesgos.md` y `docs/equipo/mesa-de-trabajo.md`). Todavía no hay código, así que audito el documento como la especificación que alguien tendrá que implementar y probar.

---

## 1. Qué está bien

- Está escrito en lenguaje simple y de verdad no habla de tecnología: no encontré ninguna mención de base de datos, framework ni API. Eso se agradece.
- El glosario (§3) existe y cubre lo principal. Muchas definiciones son buenas (SKU, Control por serie / por cantidad, Recepción).
- Las "Decisiones ya tomadas" de `CLAUDE.md` están todas reflejadas, sin contradicción de fondo (detalle en la sección 2.8).
- Marca lo que no sabe con **[PENDIENTE]** y los junta en §12. No inventa.
- Los flujos de OC y OS (§9, §10) están dibujados como estados, lo que facilita convertirlos en pruebas.
- Hay un buen límite del alcance (§2, "No incluye").

## 2. Qué me preocupa

Marco cada punto como HECHO (se comprueba leyendo el documento) u OPINIÓN (juicio mío).

### 2.1 No se puede trazar nada a una prueba todavía
- HECHO: ningún requisito tiene identificador. Hay secciones numeradas (§4, §7...), pero dentro de cada una los requisitos son viñetas en prosa. Nadie puede escribir "la prueba X cubre el requisito Y" sin citar una frase.
- HECHO: ningún requisito tiene criterio de aceptación. "Cada empresa solo ve sus propios datos" (§4) es una frase muy importante y hoy no dice cómo se comprueba.
- HECHO: no hay requisitos de calidad medibles (cuántos usuarios a la vez, cuánto tarda una pantalla, cuánto tiempo se guarda la auditoría, idioma, moneda, zona horaria). El volumen es el pendiente #4 de §12 y lo demás no aparece.
- HECHO: el documento no dice en qué etapa (0 a 7) se entrega cada requisito, así que no se puede comprobar al cerrar una etapa que no quedó nada afuera.

### 2.2 Palabras con más de un sentido (§3, §7, §8, §12)
- **"Solicitante"** (HECHO, y es el más grave de este grupo). En §5 es un rol (el que crea solicitudes de compra o servicio). En la cabecera del documento y en §12 ("Quién responde: Solicitante") es la persona que pidió la plataforma, es decir el CEO. Un mismo término para dos personas distintas. Quien lea §12 pensará que el rol Solicitante responde las dudas.
- **"Activo" vs. "artículo" vs. "unidad"** (HECHO):
  - §3 define Activo como "una unidad física que la empresa posee".
  - §2 punto 5 y §8 hablan de "Inventario de activos: con serie y sin serie" y de "Artículos por cantidad". Pero un conteo de 40 mouses en una bodega no es "una unidad física concreta". Entonces, ¿el stock por cantidad es un activo o no? El documento se contradice.
  - "Artículo" no está en el glosario. En §7 "Maestro de artículos" son los SKU (el tipo); en §8 "Artículos con serie" son las unidades. Mismo término, dos niveles.
  - "Unidad" aparece en §3 (unidad física) y en §7 (unidad de medida: pieza, caja, licencia). Son cosas distintas.
  - Las licencias (§1 las lista como activos tecnológicos; §7 dice que la clave es una serie) no son "unidad física". Otra incoherencia con la definición de Activo.
- **"Solicitud"** (HECHO). §5 dice que el Solicitante "crea solicitudes de compra o servicio". No existe "solicitud" en el glosario ni en los flujos de §9 y §10. ¿Es una OC en Borrador? ¿Es un documento aparte con su propio flujo? Hoy es un requisito sin objeto al que apuntar.
- **"Usuario"** (HECHO). En §5 y §4 usuario es quien entra a la plataforma. En §8 "un activo se puede asignar a un usuario": ¿y el empleado que recibe un celular pero nunca entrará al sistema? No se dice. OPINIÓN: es lo más probable en una empresa real, así que falta el concepto de "persona/empleado" o es una decisión explícita de que solo los usuarios reciben equipos.
- **"Responsable" / "Asignado" / "Ubicación"** (HECHO). §8 pide para cada serie "estado, ubicación, responsable", y además un estado "Asignado" y una "Asignación a usuario o ubicación". Son tres formas de decir casi lo mismo. Sin una regla, el sistema podrá mostrar "Estado: En stock" con "Responsable: Juan". (OPINIÓN: conviene que responsable y asignación sean un solo dato.)
- **"Existe una sola vez"** (HECHO). §3 dice que un SKU "existe una sola vez"; §7 dice que no se repiten códigos "dentro de la empresa". Son dos reglas distintas (global vs. por empresa). Con multiempresa es la segunda; el glosario debe decirlo igual.

### 2.3 Contradicciones y huecos internos
- HECHO, importante: **campos personalizados en el nivel equivocado.** §6 da como ejemplo "Celular → IMEI, número de línea" y "Licencia → fecha de vencimiento". §7 dice que los campos personalizados son del SKU. Pero el IMEI es distinto en cada celular, y la fecha de vencimiento puede ser distinta en cada clave de licencia. Si el campo vive en el SKU, hay un solo IMEI para todos los celulares de ese modelo, lo cual es absurdo. RAM o procesador sí son del tipo de artículo. Falta decir qué campos se llenan una vez por SKU y cuáles una vez por unidad. Es un defecto de la especificación que, si no se aclara, obligará a reconstruir el inventario después.
- HECHO: **unicidad de series no está escrita.** §3 solo dice "un SKU puede tener muchas series". La regla de negocio crítica del equipo ("las series no se repiten dentro de un mismo SKU") no aparece en el documento funcional. Tampoco dice qué pasa si la serie ya existe en otro SKU de la misma empresa. Si no está en el documento, no hay requisito que probar.
- HECHO: **correlativo del SKU.** §7 dice que se genera "prefijo + correlativo", pero no dice si se acepta que queden saltos (por ejemplo, LAP-0004 se descarta y nunca se usa), ni qué pasa con el correlativo cuando alguien escribe un código propio con el mismo formato (por ejemplo, escribe LAP-0050 a mano). No dice qué ocurre al cambiar el prefijo de una categoría con SKUs ya creados.
- HECHO: **subcategorías** (§6). Se menciona "Periféricos > Mouse" pero no dice si el prefijo y los campos se heredan de la categoría padre o se definen en cada hija. Y §3 define Categoría como "agrupación de SKUs", sin mencionar el árbol.
- HECHO: **modo de control** (§7). No dice si se puede cambiar de "por cantidad" a "por serie" una vez que el SKU tiene stock. OPINIÓN: debería ser inmutable apenas exista movimiento; si no, se corrompe el inventario.
- HECHO: **OC** (§9).
  - "Anulada en cualquier punto antes de recibir": ¿y después de una recepción parcial se puede anular lo que falta? ¿Cómo se cierra una OC con faltante que nunca llegará?
  - La aprobación es configurable: si una empresa no la exige, ¿el estado "Pendiente de aprobación" desaparece? Los estados dependen de la configuración y eso no está escrito.
  - Falta: ¿se puede recibir más de lo pedido?, ¿moneda e impuestos?, ¿qué pasa si se confirmó una recepción con una serie mal digitada? (corrección o reversión).
- HECHO: **relación OS-inventario.** §8 tiene el estado "En reparación" y §10 tiene órdenes de servicio ligadas a un activo, pero no dice si abrir una OS cambia el estado del activo, ni si cerrar la OS lo devuelve.
- HECHO: **acciones de permiso** (§5). Se lista el conjunto "ver, crear, editar, aprobar, dar de baja", pero la tabla de roles menciona "recibir mercadería", "mover stock", "ver auditoría" y "configuración de la empresa", que no están en ese conjunto. Además "Técnico" (gestiona inventario) y "Almacén" (mueve stock) se pisan. No hay una matriz módulo × acción, así que "toda acción comprueba permisos" no tiene contra qué compararse.
- HECHO: **"eliminó"** (§11) vs. solo "dar de baja" (§5, §8). Ningún otro lugar dice que se puedan eliminar registros. Hay que decidir y escribirlo.
- HECHO: **importación inicial** del inventario. El riesgo #4 de `riesgos.md` asume una importación desde Excel con validación fila por fila, y el pendiente #7 de §12 pide el Excel actual. Pero ni §2 (Incluye) ni "No incluye" mencionan la importación. Alcance contradictorio.
- HECHO: **acceso y alta de empresas** (§2 punto 1 y §4). "Cualquier persona puede entrar con su correo" y "el primer usuario de una empresa es su administrador" no dicen cómo nace una empresa (¿alguien se registra y la crea?, ¿la crea un administrador de la plataforma?). Tampoco dice si "entrar con cualquier correo" significa que cualquiera puede registrarse. OPINIÓN: probablemente se quiere decir "cualquier tipo de correo, pero solo con invitación o creando una empresa nueva"; hay que escribirlo así porque tiene consecuencias de seguridad.
- HECHO: **SAP.** §2 lo deja fuera y §12 #5 pregunta si se integrará. No es contradicción grave, pero §7 ya supone que existe un SAP ("el que usa SAP"). Conviene decidir si el pendiente #5 sigue abierto o es información, no pregunta.

### 2.4 Requisitos mezclados con decisiones técnicas
- HECHO: casi no hay, y es un mérito. El único caso límite es la frase "(ej. el que usa SAP)" y la palabra "correlativo", que es lenguaje de negocio aceptable.
- OPINIÓN, al revés: hay reglas de negocio que el documento deja implícitas y que luego alguien resolverá "como técnico" sin que el CEO lo sepa: que una recepción sea todo-o-nada (si falla la captura de la 7ª serie no deben quedar 6 activos creados), que el correlativo y las series nunca se dupliquen aunque dos personas trabajen a la vez, que la auditoría no se pueda editar. Son reglas de negocio y deben quedar escritas como tales.

### 2.5 Pendientes (§12)
- HECHO: los pendientes no están ligados al requisito que bloquean. Ejemplo: el #2 (estados del activo) bloquea todo §8, pero §8 solo dice "[PENDIENTE]" en una línea.
- OPINIÓN: el #1 y el #6 (quién aprueba, roles finales) deberían responderse antes de la Etapa 1, no al final de la 0, porque definen la matriz de permisos.

### 2.6 Comprobación contra "Decisiones ya tomadas" de CLAUDE.md
| Decisión | ¿Reflejada? | Observación |
|---|---|---|
| Multiempresa desde el inicio | Sí (§3, §4) | Falta el criterio de aceptación (ver 3.1). |
| RBAC configurable por empresa | Sí (§5) | Falta la matriz módulo × acción. No dice si los 6 roles iniciales se copian a cada empresa. |
| Catálogos y campos personalizados (texto, número, fecha, lista, sí/no) | Sí (§6) | Los 5 tipos coinciden. Queda el problema SKU vs. unidad (2.3). |
| Maestro por SKU, código automático por categoría, sobrescribible | Sí (§7) | Faltan reglas de correlativo (2.3). |
| Control por serie o cantidad; SKU con serie tiene muchas series | Sí (§3, §7) | Falta unicidad de series y mutabilidad del modo. |
| OC con aprobación configurable; recepción que crea los activos | Sí (§9) | Coherente. El documento añade que por cantidad "se suma al stock", lo cual no contradice. |
| Etapas 0 a 7 | No aparecen | Ver 2.1: sin trazabilidad a etapas. |
| Stack | No aparece (correcto) | El documento funcional no debe mencionarlo. |

Conclusión: no hay discrepancias entre CLAUDE.md y el documento; hay omisiones.

## 3. Qué cambiaría

### 3.1 Esquema de identificadores (propuesta concreta)
- **RF-<MÓDULO>-<NNN>** para requisitos funcionales. Módulos: ACC (acceso y empresas), USR (usuarios), ROL (roles y permisos), CAT (catálogos y categorías), SKU, INV (inventario), OC (compras y recepción), OS (servicio), AUD (auditoría), IMP (importación, si el CEO la aprueba).
  Ejemplos: `RF-ACC-001` "Cada empresa solo ve sus propios datos"; `RF-SKU-003` "El código del SKU no se repite dentro de la empresa"; `RF-INV-007` "No se repite una serie dentro del mismo SKU".
- **RN-<NNN>** para reglas de negocio transversales que atraviesan módulos: `RN-001` datos filtrados por empresa; `RN-002` permisos comprobados en el servidor; `RN-003` operaciones de varias partes son todo-o-nada; `RN-004` correlativo sin duplicados; `RN-005` series únicas por SKU; `RN-006` la auditoría no se edita ni se borra.
- **RNF-<NNN>** para requisitos de calidad medibles (rendimiento, retención de auditoría, idioma, zona horaria, copias de respaldo).
- **CA-<ID requisito>-<n>** para cada criterio de aceptación, en formato "Dado / Cuando / Entonces". Ejemplo: `CA-RF-ACC-001-1`: Dado un usuario de la empresa A, cuando consulta el listado de SKUs, entonces no aparece ningún SKU de la empresa B.
- **P-<NNN>** para pendientes (reemplaza la tabla numerada de §12) con columna "Bloquea a: RF-...".
- Reglas del esquema: el ID nunca se reutiliza ni se renumera; un requisito retirado queda marcado "Retirado" con fecha; cada ID lleva etapa (0 a 7) y prioridad.
- **Matriz de trazabilidad** en `docs/trazabilidad.md` con columnas: ID · Sección · Etapa · Criterio de aceptación · Prueba (ID del caso) · Estado. Yo la reviso al cerrar cada etapa: requisito sin prueba y prueba sin requisito se reportan como hallazgo.

### 3.2 Cambios al texto del documento (los hace el analista, yo solo propongo)
1. Renombrar la persona que pidió la plataforma como **"Cliente (CEO)"** en cabecera y §12; dejar **Solicitante** solo como rol. (Resuelve el término más ambiguo.)
2. Ampliar el glosario con: **Artículo** (alias de SKU, o dejar de usarlo), **Unidad de medida** (distinta de unidad física), **Existencia** o **Stock** (el conteo de un SKU por cantidad), **Solicitud** (qué es y su flujo), **Persona / Responsable** (quién puede recibir un equipo). Redefinir **Activo** como "cada unidad con serie, o cada lote de stock por cantidad", o bien decir que por cantidad no son activos y cambiar §2 punto 5 para que lo diga.
3. En §6 y §7, separar los campos personalizados en dos tipos: **"del tipo de artículo"** (se llena una vez en el SKU: RAM, procesador) y **"de cada unidad"** (se llena en cada serie: IMEI, número de línea, vencimiento de una clave).
4. Agregar a §3 u §8 la regla de series (RN-005) y a §7 las reglas del correlativo: nunca se repite, puede haber saltos (si el CEO acepta), qué pasa con códigos escritos a mano, y que el modo de control no cambia una vez que hay movimientos.
5. En §9: definir qué pasa con el remanente de una recepción parcial (cerrar con faltante o anular), sobre-recepción, corrección de una recepción errónea, y qué estados desaparecen si la empresa no exige aprobación. Dejar explícito que la confirmación de una recepción es todo-o-nada.
6. En §10: definir si abrir/cerrar una OS cambia el estado "En reparación" del activo.
7. En §5: reemplazar la lista de acciones por una **matriz módulo × acción** (incluyendo recibir, mover, asignar, ver auditoría, administrar roles), aunque sea con la propuesta inicial y marcada como pendiente de validar.
8. En §4: escribir cómo nace una empresa y quién puede registrarse.
9. En §2: agregar la importación inicial de Excel a "Incluye" (o a "No incluye" con justificación) para que coincida con `riesgos.md`.
10. En §11: decidir "eliminar" vs. "dar de baja" y listar qué se entiende por "registro importante".
11. Agregar una sección de **Requisitos no funcionales** con valores a definir (aunque algunos queden [PENDIENTE] ligados al pendiente #4).
12. Agregar una columna **Etapa** a cada requisito.

### 3.3 Qué haría yo en el orden
Primero 3.2 puntos 1, 2 y 3 (son los que provocarían retrabajo de datos si se descubren tarde), luego 3.1 (IDs y criterios), luego el resto.

## 4. Preguntas para el CEO (cerradas, con mi recomendación)

1. Un celular tiene su IMEI y su número de línea propios. ¿Confirma que esos datos se anotan **por cada equipo** y no una sola vez por modelo?
   - A) Sí, por cada equipo. B) No, uno por modelo.
   - Recomiendo A. B no sirve para identificar un celular concreto.
2. Si ingresan dos equipos con el mismo número de serie en el mismo tipo de artículo, ¿qué debe pasar?
   - A) El sistema lo impide siempre. B) Lo impide en el mismo artículo y solo avisa si aparece repetido en otro artículo distinto de la empresa.
   - Recomiendo B.
3. Los códigos automáticos (`LAP-0001`, `LAP-0002`...) ¿pueden quedar con saltos si alguien cancela una creación (por ejemplo `LAP-0004` nunca se usa)?
   - A) Sí, un salto no importa; lo importante es que nunca se repitan. B) No, no pueden quedar saltos.
   - Recomiendo A. B obliga a bloquear a todos los usuarios mientras uno crea un artículo y hace el sistema más lento y frágil.
4. Cuando se entrega un equipo a alguien, ¿esa persona siempre tiene usuario en la plataforma?
   - A) Sí, solo usuarios. B) No: se llevará también una lista de empleados que reciben equipos sin necesidad de entrar al sistema.
   - Recomiendo B (en una empresa real, no todos los empleados con laptop usarán esta plataforma).
5. ¿Se podrán borrar registros (artículos, equipos, órdenes)?
   - A) Nunca; solo se dan de baja o se desactivan, y se conserva el historial. B) Se pueden borrar si no tienen movimientos.
   - Recomiendo A, con una excepción: borrar borradores que nunca se emitieron.
6. Si al recibir mercadería se cometió un error (por ejemplo una serie mal escrita) y ya se confirmó, ¿cómo se corrige?
   - A) Con un ajuste registrado (queda constancia del error y de la corrección). B) Se permite anular la recepción completa mientras nadie haya usado esos equipos.
   - Recomiendo A.
7. ¿La carga inicial del inventario desde su Excel actual entra en la versión 1?
   - A) Sí, desde la etapa de Inventario. B) No, se carga a mano o se deja para después.
   - Recomiendo A (el equipo ya la considera un riesgo alto: datos sucios).
8. En una OC, ¿se puede recibir más de lo que se pidió?
   - A) No. B) Sí, con aviso.
   - Recomiendo A.

## 5. Mensajes directos

No envié ni recibí mensajes: el modo de planificación no permitía ejecutar acciones. Los tres que habría enviado (por si se autorizan) son:

1. A `analista-funcional`: "¿'Solicitante' es el rol o el cliente? En §5 y §12 se usa para ambos. Propongo 'Cliente (CEO)' para el segundo."
2. A `ingeniero-datos`: "¿Los campos personalizados viven en el SKU o en cada unidad? IMEI/línea (§6) no pueden ser del SKU. Esto cambia el modelo de datos."
3. A `especialista-seguridad`: "§4 dice 'cualquier persona puede entrar con su correo': ¿hay auto-registro o solo invitación? ¿Y cómo nace una empresa?"
