# Decisiones del Gerente de TI

Registro de decisiones tomadas por el Gerente de TI. Cada una tiene un número fijo (D-001, D-002...) que no se reutiliza ni se renumera. Si una decisión se cambia, se agrega una nueva que dice cuál reemplaza.

**Origen:** Mesa de revisión #001, ronda 1 (borradores en `docs/equipo/mesa-001/ronda1-*.md`). Fecha: 2026-10-25.

**Quién decide.** El CEO delegó en el Gerente de TI las decisiones de producto y de ingeniería, siguiendo la recomendación de cada especialista. Solo se escala al CEO lo que implica dinero (costos de servicios externos), un tema legal o algo irreversible. Ver la sección final "Escalado al CEO".

**Cómo leer cada decisión.** Pregunta, decisión, motivo, quién lo recomendó, y qué cambia en el documento funcional (`docs/documento-funcional.md`) o en el diseño. El analista funcional incorpora los cambios al documento v0.2 en la ronda de mejora. Hasta entonces, lo que dice este archivo manda sobre el documento v0.1 donde haya diferencia.

**Criterio general usado cuando dos roles discrepan:** primero lo que protege el dinero y los datos; después lo más simple de construir y explicar; después la comodidad. Lo que se puede ampliar más adelante sin rehacer, se deja simple hoy. Lo que obligaría a rehacer datos si se decide tarde, se decide hoy.

---

## Acceso, empresas y permisos

### D-001 · Cómo nace una empresa
- **Pregunta:** ¿Cualquiera puede registrarse y crear una empresa, o el alta es controlada?
- **Decisión:** Alta controlada. No hay registro abierto. Una empresa la crea el Administrador de plataforma (D-003) y deja invitado a su primer administrador. Un usuario nuevo solo entra por invitación de un administrador de empresa.
- **Motivo:** El registro abierto permite cuentas falsas, que alguien se adueñe de una empresa y costos de correo no controlados. Con pocas empresas, el alta controlada no cuesta trabajo y se puede abrir después.
- **Recomendó:** Seguridad (RS-01, RS-04), Arquitecto, Gerente de TI. Coincide el Auditor Técnico.
- **Qué cambia:** Documento §4: se reescribe "el primer usuario de una empresa es su administrador" como "el primer administrador lo invita la plataforma". Se agrega que no hay unión por dominio de correo ni por búsqueda. Se agrega el riesgo #8.

### D-002 · Cómo entran los usuarios
- **Pregunta:** ¿Con qué se entra? ("cualquier tipo de correo" no lo dice)
- **Decisión:**
  1. Cualquier correo sirve (personal o corporativo), siempre con invitación.
  2. Se entra con un **enlace que llega al correo** (sin contraseñas). El correo queda verificado al abrirlo. El enlace de acceso dura pocos minutos y sirve una sola vez. No hay contraseñas en la versión 1. El ingreso con cuenta de Google o Microsoft queda para después.
  3. Las invitaciones vencen a los **7 días**, se usan una sola vez, quedan ligadas al correo al que se enviaron y el administrador las puede cancelar. Quien invita no puede dar un rol con más permisos que el suyo.
  4. Si el correo invitado ya tiene cuenta, se suma la empresa a la misma cuenta (no se crea otra). Los correos se guardan sin distinguir mayúsculas.
  5. **Segunda verificación obligatoria para los administradores** (de empresa y de plataforma), con una aplicación autenticadora en el celular (sin SMS, así no tiene costo). Opcional para los demás.
  6. Las sesiones vencen por inactividad y por tiempo total. Hay "cerrar sesión en todos los dispositivos". Dar de baja o suspender a alguien en una empresa corta sus sesiones en esa empresa al instante. Tras varios intentos fallidos, la espera crece. El mensaje de error nunca dice si un correo existe.
  7. Recuperación: como no hay contraseña, se pide un enlace nuevo. Si una empresa pierde a su único administrador, lo recupera el Administrador de plataforma verificando la identidad por otro medio, y queda en la auditoría. Al crear una empresa se recomienda tener al menos dos administradores.
- **Motivo:** Sin contraseñas no hay que guardarlas ni diseñar la recuperación (que suele ser el punto más débil). Funciona con cualquier correo, como pidió el CEO. La segunda verificación protege las cuentas más valiosas sin cansar a los demás.
- **Recomendó:** Gerente de TI (enlace por correo), Seguridad (RS-02, RS-03, RS-23 a RS-28, preguntas 4.2 a 4.4), Arquitecto (id interno distinto del correo, invitación suma empresa), Auditor de Cumplimiento (R6).
- **Descartado:** unión automática por dominio de correo (Seguridad y Cumplimiento: riesgo si el dominio se verifica mal); restricción de dominios por empresa (Cumplimiento P6-B): como todo es por invitación, no hace falta en la v1; contraseñas (Seguridad RS-22: más superficie de ataque y más pantallas).
- **Qué cambia:** Documento §4 y nueva sección "Seguridad" con RS-01 a RS-28 en lenguaje simple. El Arquitecto confirma en el prototipo de la Etapa 1 que la segunda verificación es factible con la herramienta de acceso elegida; si no lo fuera, vuelve a mesa.

### D-003 · Administrador de plataforma
- **Pregunta:** ¿Existe alguien por encima de las empresas?
- **Decisión:** Sí: un rol **Administrador de plataforma**, fuera de cualquier empresa, de 1 a 2 personas del equipo, con segunda verificación obligatoria. Puede crear, suspender y reactivar empresas, y rescatar una empresa sin administrador. **No ve datos del negocio** (activos, compras). Si soporte necesita verlos, la empresa lo autoriza con vencimiento corto y todo queda en auditoría. Vive en una zona separada del sistema (ruta y permisos aparte). Nadie entra directo a la base de datos de producción para tareas rutinarias.
- **Motivo:** Alguien tendrá que hacerlo; si no se define, se resolverá entrando a la base de datos sin dejar rastro, que es lo más peligroso.
- **Recomendó:** Seguridad (RS-19 a RS-21), Arquitecto (ADR-002).
- **Qué cambia:** Documento: nueva sección sobre este rol y su límite. Diseño: consola de plataforma separada, a construir en la Etapa 1.

### D-004 · Roles y permisos

> **Anotación (2026-10-25):** el punto 4 (permisos sensibles) queda **reescrito por D-036 y D-037** (registro único de permisos, un solo `datos.exportar` y un solo `datos.importar`, y quién tiene cada sensible por defecto). Los demás puntos siguen vigentes.

- **Pregunta:** ¿Cuántos roles por persona? ¿Qué reglas protegen los permisos?
- **Decisión:**
  1. **Un solo rol por usuario en cada empresa.** El rol vive en la relación persona-empresa (una persona puede tener roles distintos en empresas distintas).
  2. Los 6 roles iniciales son **plantillas que se copian** al crear la empresa; cada empresa edita su copia sin afectar a las demás.
  3. Cada permiso tiene un **alcance**: "todo" o "solo lo propio" (así entra el Solicitante). No hay restricción por sede en la v1; el diseño queda preparado para agregarla.
  4. Permisos sensibles **separados**: ver precios, ver auditoría, ver datos personales, importar, exportar, administrar roles. Importar y exportar vienen activados solo para el Administrador. "Solo lectura" no ve precios ni datos personales de asignaciones salvo que el administrador lo active. Jefatura TI ve precios y auditoría (como dice el documento v0.1).
  5. Todo rol nuevo parte **sin ningún permiso**.
  6. Nadie puede darse permisos a sí mismo ni crear/asignar un rol con más permisos de los que él tiene. Los cambios en el rol propio los hace otro administrador.
  7. La empresa siempre tiene **al menos un administrador activo**; el sistema impide quitar, suspender o bajar de rol al último.
  8. El rol Administrador de la plantilla incluye todos los permisos (como dice el documento), pero la separación de funciones de compras (D-015) se aplica también a él.
  9. Se entrega una **matriz módulo × acción × rol** escrita en el documento.
- **Motivo:** Un rol por persona es lo más simple de explicar y auditar. La separación de permisos sensibles y las protecciones contra la autoescalada son mínimas y baratas de hacer desde el inicio y carísimas de agregar después.
- **Recomendó:** Arquitecto (ADR-003, preguntas 6 y 7), Seguridad (RS-14 a RS-17), Auditor de Cumplimiento (R5), QA (punto 12 y 13).
- **Discrepancia resuelta:** Cumplimiento proponía que el Administrador no reciba por defecto los permisos de aprobar y recibir compras. Lo descarto: dejaría sin poder operar a una empresa con una sola persona de TI, y el control buscado se logra mejor con la regla de que nadie aprueba lo que creó (D-015).
- **Qué cambia:** Documento §5: matriz de permisos y estas reglas. QA escribe sus pruebas sobre esa matriz.

---

## Artículos, categorías y personas

### D-005 · Campos personalizados: del artículo o de cada unidad
- **Pregunta:** ¿Un campo como RAM o IMEI se llena una vez por tipo de artículo (SKU) o por cada unidad?
- **Decisión:** Cada campo de una categoría declara **a qué se aplica**: "al artículo (SKU)" (RAM, disco, procesador) o "a cada unidad" (IMEI, número de línea, fecha de vencimiento de una clave de licencia). Los valores se validan en el servidor según la definición del campo. Reglas de cambio:
  - Un campo con datos **no se borra, se desactiva**.
  - No se cambia el tipo de un campo que ya tiene datos.
  - Un campo que se vuelve obligatorio **no bloquea lo que ya existe**: esos registros quedan marcados "pendiente de completar".
  - Las opciones de una lista que estén en uso se desactivan, no se borran.
  - Cada campo tiene un identificador interno estable; renombrarlo no rompe los datos.
- **Motivo:** El IMEI en el artículo no tiene sentido: cada celular tiene el suyo. Si no se separa ahora, hay que rehacer las Etapas 2 y 4. Fue señalado por 6 de 8 roles.
- **Recomendó:** Arquitecto (ADR-007), Ingeniero de Datos, Diseñador, Auditor Técnico, Analista (en autocrítica). Para el "pendiente de completar" se adopta la propuesta del Diseñador sobre la del Arquitecto (valor por defecto) porque no obliga a inventar datos.
- **Qué cambia:** Documento §6, §7 y §8: dos tipos de campos. Diseño: pantallas de SKU, recepción y ficha del activo muestran los dos juegos.

### D-006 · Persona que recibe equipos frente a usuario de la plataforma

> **Anotación (2026-10-25):** el bloqueo de baja con activos asignados quedó **reemplazado por D-034 y D-057 (S-03)**: el cese nunca se bloquea; lo que se bloquea es la anonimización.

- **Pregunta:** ¿Quien recibe una laptop debe tener cuenta?
- **Decisión:** No. Se crea el concepto **Persona** (empleado o custodio), distinto del **Usuario** (quien entra al sistema). Los activos se asignan a Personas; una Persona puede o no estar vinculada a un Usuario. Datos mínimos de una Persona: nombre, área y correo (opcional). No se guarda documento de identidad, dirección ni teléfono personal en la v1. Ciclo de vida: no se borra a nadie; se desactiva, y los datos personales se anonimizan pasado el plazo de D-024. **No se puede dar de baja a una Persona con activos asignados** hasta que se reasignen o se registre su devolución; sus órdenes abiertas se reasignan o cancelan con motivo.
- **Motivo:** La mayoría de quienes reciben equipos nunca entrarán a la plataforma. Obligar a invitarlos es absurdo y a la vez la lista de personas es un dato personal que debe tener reglas desde el inicio.
- **Recomendó:** Arquitecto, Diseñador, Ingeniero de Datos, Auditor Técnico (los cuatro); reglas de ciclo de vida: Auditor de Cumplimiento (R2, P1). Cumplimiento revisó los datos mínimos.
- **Qué cambia:** Documento §3 (glosario: Persona), §8 (asignación a Persona o ubicación). Se corrige también "responsable/asignado/ubicación": responsable y asignación son un solo dato. Se construye en la Etapa 2 (directorio de personas) para que la Etapa 4 lo use.

### D-007 · Código del SKU y numeración
- **Pregunta:** Reglas del código automático y del que escribe el usuario.
- **Decisión:**
  1. El código es único **por empresa**, sin distinguir mayúsculas/minúsculas ni espacios.
  2. **No se reutiliza nunca** un código, aunque el SKU se desactive. Pueden quedar **saltos** en la numeración: lo que se garantiza es que nunca se repite.
  3. El código escrito a mano no mueve el contador; el automático salta los que ya existan.
  4. El código **no se edita** una vez que el SKU tiene movimientos o activos.
  5. El ancho del número es un mínimo, no un tope (pasar de 9999 no rompe nada).
  6. Cambiar el prefijo de una categoría no cambia los SKU ya creados.
  7. Las subcategorías usan el prefijo de su categoría principal.
  8. Las órdenes de compra y de servicio usan el mismo mecanismo de contador por empresa.
  9. Escribir un código propio es un permiso aparte.
- **Motivo:** Evitar saltos obliga a bloquear a todos mientras uno crea un artículo y vuelve el sistema lento y frágil. Un código reutilizado confunde reportes y correos antiguos.
- **Recomendó:** Auditor Técnico, Ingeniero de Datos y Arquitecto. **Discrepancia:** QA quería "sin huecos cuando no hay errores". Lo descarto; QA verificará que 20 personas creando a la vez obtienen 20 códigos distintos y todos mayores al último.
- **Qué cambia:** Documento §7. Diseño: un contador por empresa y clave dentro de la misma operación que crea el registro; la base de datos rechaza repetidos.

### D-008 · Categorías, subcategorías y modo de control
- **Pregunta:** ¿Hasta cuántos niveles de subcategorías? ¿Se puede cambiar el modo de control (serie/cantidad) o la categoría de un SKU?
- **Decisión:**
  1. Un solo nivel de subcategoría (Categoría > Subcategoría). La subcategoría hereda los campos de la categoría padre y puede sumar los suyos.
  2. **No se puede cambiar el modo de control ni la categoría** de un SKU que ya tiene activos o stock.
  3. Un SKU inactivo no se puede usar en nuevas órdenes ni recepciones; sigue visible en el historial.
  4. Un SKU con serie siempre es de a 1 unidad.
  5. La unidad de medida es un catálogo por empresa, con una marca "admite decimales" (cables por metro sí; laptops no). Sin conversiones entre unidades en la v1.
  6. Valores de catálogo (marca, proveedor, ubicación) no se borran: se desactivan.
  7. Marca, modelo, proveedor, ubicación y centro de costo son catálogos con tabla propia (tienen datos y relaciones). Los catálogos nuevos que cree el administrador son listas simples que alimentan los campos de tipo lista.
- **Motivo:** Cambiar el modo con stock corrompe el inventario. Los catálogos con relaciones (modelo depende de marca) se pierden si todo es una lista genérica.
- **Recomendó:** Gerente de TI (un nivel), Arquitecto (3.5 a 3.7), Ingeniero de Datos, QA (punto 11), Auditor Técnico.
- **Qué cambia:** Documento §6 y §7. Es una limitación de la v1; ampliar niveles se evalúa si el CEO lo pide.

### D-009 · Unicidad de series y reingreso
- **Pregunta:** ¿Dentro de qué ámbito es única una serie? ¿Qué pasa con un equipo dado de baja que vuelve?
- **Decisión:**
  1. La serie es **única por empresa y SKU**, comparada sin mayúsculas, sin espacios al inicio o final. Repetida en el mismo SKU: se rechaza siempre.
  2. Si la serie existe en **otro SKU** de la misma empresa: se acepta con un **aviso visible** que dice dónde está.
  3. Una unidad física es **un solo registro para siempre**. Si vuelve (regresa de reparación externa, baja por error), se reactiva el mismo registro con un movimiento "reingreso", motivo y un permiso especial. Nunca se crea un segundo registro con la misma serie.
  4. El sistema avisa cuando una serie parece dañada por Excel (notación científica como 3,5E+14, ceros perdidos).
  5. Una serie vacía solo se permite si el SKU lo autoriza.
- **Motivo:** Dos marcas pueden repetir un número; bloquear en toda la empresa impediría registrar un equipo legítimo. Duplicar el registro rompe el historial.
- **Recomendó:** Ingeniero de Datos, QA (pregunta 1), Auditor Técnico (pregunta 2), Arquitecto (3.8). Coinciden los cuatro.
- **Qué cambia:** Documento §8. Diseño: restricción de unicidad en la base de datos, no solo en pantalla.

### D-010 · Stock por cantidad
- **Pregunta:** ¿Puede quedar negativo? ¿Cómo se corrige? ¿Cómo son los traslados?
- **Decisión:**
  1. **El stock no puede quedar negativo**, garantizado por la base de datos (aunque dos personas saquen a la vez).
  2. Todo cambio es un movimiento (ingreso, salida, traslado, ajuste, saldo inicial). Las correcciones son **ajustes con motivo obligatorio**, nunca editar el saldo.
  3. Traslado entre ubicaciones: **inmediato** (sale de origen y entra a destino en el mismo acto). No hay estado "en tránsito" en la v1.
  4. Un traslado a la misma ubicación se rechaza.
  5. Una sola tabla de movimientos para los dos modos de control; para serie, cantidad 1 por unidad.
- **Motivo:** Un saldo negativo oculta pérdidas. "En tránsito" solo hace falta con varias sedes que confirmen recepción; se puede agregar sin rehacer.
- **Recomendó:** Ingeniero de Datos, QA, Arquitecto (ADR-008). El Diseñador planteó la duda del traslado; la resuelve esta decisión.
- **Qué cambia:** Documento §8.

### D-011 · Licencias

> **Anotación (2026-10-25):** el punto 2 y la parte de claves del punto 3 quedaron **reemplazados por D-035** (la clave es un campo secreto, nunca la serie). El resto sigue vigente.

- **Pregunta:** ¿Una licencia de 50 puestos se asigna a 50 personas una por una? ¿Cómo se tratan las claves?
- **Decisión:**
  1. En la v1 **basta el total de puestos**; no se asigna cada puesto a una persona.
  2. Se mantiene lo del documento: no son un tipo especial. Si cada clave se controla por serie, una clave con 50 puestos es **una serie** con un campo de unidad "número de puestos" (y su propia fecha de vencimiento). Si solo importa el total, se controla por cantidad.
  3. Las **claves de licencia son secretos**: se guardan cifradas, se muestran enmascaradas, verlas completas exige un permiso aparte y esa consulta queda en la auditoría. Nunca aparecen en claro en la auditoría ni en los registros técnicos.
- **Motivo:** La asignación por puesto es auditoría de licencias, un producto aparte. Una clave filtrada vale dinero.
- **Recomendó:** Arquitecto (pregunta 8), Ingeniero de Datos (pregunta 6). Lo del cifrado lo fija el Gerente de TI a partir de la nota del Arquitecto (3.10) y de RS-38 de Seguridad; Seguridad define el detalle técnico.
- **Qué cambia:** Documento §7. Queda fuera de la v1: asignación de puestos y avisos de vencimiento.

### D-012 · Estados del activo, asignación y constancia
- **Pregunta:** ¿Cuáles son los estados? ¿Qué es la "constancia de entrega"?
- **Decisión:**
  1. Lista **cerrada y fija** en el sistema: **En stock, Asignado, En reparación, Extraviado o robado, De baja.** No se agregan estados por empresa en la v1.
  2. "Prestado" no es estado: es una asignación con fecha de devolución prevista. "En tránsito" no entra (D-010).
  3. **Transiciones permitidas**, comprobadas en el servidor: En stock ↔ Asignado; En stock/Asignado → En reparación → En stock/Asignado; cualquiera → Extraviado o robado o De baja (motivo obligatorio); De baja o Extraviado → En stock solo como "reingreso", con motivo y permiso especial (D-009). No se asigna un activo De baja, Extraviado o ya asignado a otra persona; la base impide dos asignaciones activas a la vez.
  4. **Motivo obligatorio** en baja, extravío, reingreso, ajuste de stock y corrección de series. Opcional en el resto.
  5. Abrir una orden de servicio **no cambia** el estado del activo automáticamente en la v1 (D-027).
  6. **Constancia de entrega y devolución** = un registro en el sistema (activo, serie, persona, fecha, estado en que se entrega, quién entrega) más un **acta imprimible (PDF)** para firmar en papel. La aceptación en pantalla del receptor y la subida del escaneo quedan para después (D-022).
  7. Cada asignación y devolución es una fila de historial (desde, hasta, estado al devolver).
- **Motivo:** Una lista cerrada permite reglas y reportes confiables; si cada empresa la cambia se rompen. "Extraviado o robado" evita que "De baja" se use para todo y el historial mienta. El acta imprimible cubre lo que el técnico necesita sin costo de almacenamiento.
- **Recomendó:** Analista (propuso Perdido/Robado), Diseñador y Ingeniero de Datos (Extraviado/Robado), Arquitecto (lista fija, ADR-008), Ingeniero de Datos (reingreso), Cumplimiento (constancia) y QA (transiciones). **Discrepancia:** Cumplimiento prefería subir el papel firmado; no entra porque requiere adjuntos (D-022).
- **Qué cambia:** Documento §8: cierra el pendiente #2 de la sección 12. Actualiza los estados y agrega la tabla de transiciones.

---

## Compras y recepción

### D-013 · Flujo de la orden de compra
- **Pregunta:** ¿Qué es una "solicitud"? ¿Qué pasa al rechazar, cerrar, anular o editar?
- **Decisión:**
  1. **No existe un documento de "solicitud" aparte.** La solicitud de compra es una orden en Borrador creada por el Solicitante. Para servicios, es una orden de servicio en estado "Creada".
  2. Estados: Borrador → Pendiente de aprobación → Aprobada → Emitida → **Recibida parcial** → **Recibida total** → Cerrada. Además **Rechazada** y **Anulada**.
  3. **Rechazada:** queda un estado visible con el motivo; al corregirla vuelve a Pendiente de aprobación.
  4. Si la empresa no exige aprobación (por monto), la orden pasa de Borrador a Aprobada y el estado Pendiente no aparece.
  5. **Editar una orden aprobada** (precio, cantidad, proveedor) la devuelve a Pendiente de aprobación.
  6. **Anulada** solo antes de la primera recepción. Con recepción parcial no se anula: se cierra.
  7. **Cerrada:** automática cuando se recibe todo, o manual con **motivo** y permiso si el proveedor ya no enviará lo pendiente.
  8. "Emitida" solo cambia el estado en la v1; el sistema no manda correo al proveedor. Se ofrece una vista imprimible/PDF de la orden para enviarla a mano.
  9. Reglas de datos de la orden: debe tener al menos una línea; cantidad mayor que 0; precio no negativo; no se repite el mismo SKU en dos líneas; no se aceptan SKU o proveedores inactivos. La orden tiene número correlativo por empresa (D-007).
  10. Se avisa por correo al aprobador cuando hay una orden pendiente y al creador cuando se aprueba o rechaza.
- **Motivo:** Una sola forma de hacer cada cosa. Separar parcial de total y agregar Rechazada hace probable el flujo (QA); volver a aprobación evita cambiar el precio después de aprobada.
- **Recomendó:** Arquitecto y Gerente de TI (solicitud = borrador), QA (estados), Diseñador (rechazo con motivo; se concilia con QA como estado visible), Ingeniero de Datos y Cumplimiento (edición vuelve a aprobar), Arquitecto (cierre manual).
- **Qué cambia:** Documento §5 y §9 y glosario. Se dibuja la tabla de transiciones (de qué estado a cuál, quién puede, qué efecto).

### D-014 · Moneda e impuestos
- **Pregunta:** ¿Una o varias monedas? ¿Impuestos?
- **Decisión:**
  1. Cada empresa define una **moneda base**. Cada orden de compra lleva **una moneda** (código de 3 letras) y el importe siempre se guarda junto a su moneda. **Sin conversión automática** en la v1.
  2. Impuesto como **porcentaje por línea**, guardado en la línea al momento de la compra (las tasas cambian). El precio unitario se ingresa **sin impuesto**; el sistema calcula impuesto y total.
  3. El importe es siempre decimal exacto (precio unitario con 4 decimales), nunca número con redondeos de computadora.
  4. El SKU no tiene precio fijo; el precio vive en la línea de la orden.
  5. Al recibir, cada activo guarda su **costo de compra y moneda** (casi imposible reconstruirlo después; sirve para seguros, garantías y depreciación).
  6. El monto que activa la aprobación se compara solo cuando la orden está en la moneda base. **Una orden en otra moneda siempre pasa por aprobación.**
- **Motivo:** Registrar la moneda cuesta una línea hoy y una migración con datos reales mañana. No tener conversión evita depender de un tipo de cambio oficial. Que las otras monedas pasen siempre por aprobación cierra el hueco de comparar montos de monedas distintas.
- **Recomendó:** Ingeniero de Datos (una moneda por orden, impuesto por línea, costo del activo), Arquitecto (decimal exacto), Gerente de TI. **Discrepancia:** el Arquitecto prefería una sola moneda por empresa. Se adopta la del Ingeniero de Datos porque no cuesta más y no obliga a rehacer si una empresa compra en dos monedas.
- **Qué cambia:** Documento §9 y §8 (costo del activo). Conversión de monedas queda fuera de la v1.

### D-015 · Aprobación por monto y separación de funciones
- **Pregunta:** ¿Quién aprueba y con qué montos? ¿Quien crea puede aprobar?
- **Decisión:**
  1. Aprobación de **un solo nivel** en la v1: cada empresa fija un monto límite (en su moneda base) y las órdenes por encima de ese monto necesitan la aprobación de un rol con permiso de aprobar. Sin varios niveles ni reglas por tipo de orden. Si el límite está en cero todas pasan por aprobación; si la empresa desactiva la aprobación, ninguna.
  2. **El valor del monto límite lo configura cada empresa**; no hace falta saberlo para construir. Esto cierra el pendiente #1 de la sección 12 en lo que bloquea.
  3. **El sistema impide**, por defecto: (a) que quien creó o editó una orden la apruebe; (b) que quien recibe la mercadería haya creado o aprobado esa orden; (c) que nadie apruebe su propia solicitud. Aplica a todos los roles, incluido el Administrador.
  4. **Excepción configurable por empresa**, desactivada por defecto: solo un Administrador la puede activar (para empresas con una persona de TI); se muestra un aviso visible en cada orden en que se use y cada uso queda en la auditoría.
  5. Crear o editar proveedores es un permiso distinto del de crear órdenes.
  6. Se guarda quién aprobó y por qué monto.
  7. Segunda persona para dar de baja un activo de valor: **fuera de la v1**; la baja con motivo obligatorio y la auditoría la cubren. Se revisa en la Etapa 7.
- **Motivo:** Es el riesgo de fraude más claro del documento; la regla debe ser del sistema, no de un procedimiento. La excepción auditada evita bloquear a una empresa de una sola persona.
- **Recomendó:** Cumplimiento (R4, P2, P3: nunca, con excepción), QA (pregunta 4, opción C: permitirlo si el administrador lo activa), Seguridad (4.7: con límite), Gerente de TI, Arquitecto (3.4). **Discrepancia:** Seguridad proponía permitir autoaprobación bajo un monto límite. Se descarta; el mecanismo de excepción por empresa logra lo mismo con más control. Analista proponía dos niveles de aprobación; se difiere a la versión 2 (D-023).
- **Qué cambia:** Documento §5 y §9. Cierra el pendiente #1 de la sección 12 (queda como configuración).

### D-016 · Recepción: captura de series y sobre-recepción
- **Pregunta:** ¿Qué pasa si llega más de lo pedido, o hay menos series que unidades?
- **Decisión:**
  1. **No se puede recibir más de lo pendiente.** Los sobrantes se manejan fuera de la orden. Mercadería dañada o devuelta al proveedor queda fuera de la v1.
  2. La recepción es un **documento propio** con líneas; una orden puede tener varias. La cantidad recibida de una línea es la suma de las recepciones confirmadas.
  3. En un SKU con serie, **confirmar exige que la cantidad de series capturadas sea igual a la cantidad recibida**. Si faltan, se **guarda como borrador** (se puede salir y volver sin perder lo capturado) o se recibe solo lo que ya tiene series; lo no recibido sigue pendiente en la orden para otra recepción.
  4. **Confirmar es todo o nada** y no se repite con doble clic: si una serie falla, no se crea ningún activo. Dos personas recibiendo la misma orden a la vez no pueden pasarse de lo pendiente.
  5. Pantalla: se pueden pegar listas, teclear o escanear; validación inmediata con texto claro (repetida en la fila X, ya existe y dónde); datos comunes (ubicación, fecha de compra, garantía) una sola vez; resumen antes de confirmar. Los campos de unidad (IMEI, línea) se piden en la misma tabla, pero se pueden completar después según D-005.
  6. Al recibir se indica la ubicación de ingreso.
  7. La orden de compra de origen de un activo es **opcional** (los activos del Excel no la tienen).
- **Motivo:** Concilia la propuesta del Diseñador (borrador y avance parcial) con la de QA (nunca crear a medias). Es la pantalla más pesada del sistema.
- **Recomendó:** QA (CA-07, CA-08), Diseñador (3.3), Arquitecto (3.9), Ingeniero de Datos (2.8). Unanimidad en sobre-recepción: no. **Discrepancia:** el Diseñador proponía crear los activos con las series disponibles y dejar "por registrar" el resto; se descarta porque deja activos sin identificar y complica el conteo. Se resuelve con el borrador y la recepción parcial.
- **Qué cambia:** Documento §9 y §8. Alimenta el prototipo de la pantalla 15.

### D-017 · Corrección de recepciones confirmadas
- **Pregunta:** ¿Cómo se corrige una recepción mal hecha?
- **Decisión:**
  1. **Serie mal escrita:** se corrige en el activo con permiso y **motivo obligatorio**; queda en el historial el valor anterior y el nuevo.
  2. **Recepción completa por error:** se puede **revertir** con un movimiento contrario, con motivo, solo mientras ninguno de sus activos haya sido asignado, movido o puesto en reparación. Pasado eso, se corrige con baja y nueva entrada.
  3. Nunca se borra una recepción ni un activo.
- **Motivo:** Preserva la trazabilidad y permite corregir el error frecuente sin forzar pasos largos.
- **Recomendó:** Arquitecto (reversión), QA (pregunta 8, B con motivo), Diseñador (corrección con motivo), Ingeniero de Datos (anulación, no borrado). **Discrepancia:** Auditor Técnico y QA-A preferían solo ajuste/baja + nueva entrada. Se adopta la reversión limitada porque es el caso más común y se evitan bajas falsas.
- **Qué cambia:** Documento §9.

---

## Auditoría, borrado y datos

### D-018 · Auditoría inalterable
- **Pregunta:** ¿Qué se audita y quién puede tocarla?
- **Decisión:**
  1. La auditoría **solo se agrega**: no se edita ni se borra desde la aplicación, ni siquiera por el Administrador. La base de datos no da al usuario de la aplicación permiso de editar o borrar.
  2. Se escribe **en la misma operación** que el cambio: si el cambio ocurre, la auditoría existe; si falla, no queda un cambio sin rastro.
  3. Cada entrada: quién, cuándo, qué empresa, qué entidad, qué acción, valor anterior y nuevo, motivo cuando aplique, y desde dónde (IP) si se puede.
  4. Se registra como mínimo: altas, cambios (con antes/después), aprobaciones, rechazos, anulaciones, bajas y asignaciones de usuarios, personas, roles y permisos, catálogos, SKU, activos, órdenes, recepciones, configuración de aprobaciones y montos; inicios de sesión correctos y fallidos; invitaciones; cambios de empresa activa; importaciones; exportaciones; accesos del Administrador de plataforma; **y las consultas a la propia auditoría**.
  5. No guarda contraseñas, enlaces de acceso, claves de licencia ni más datos personales de los necesarios.
  6. "Registro importante" de la sección 11 = todo lo del punto 4.
  7. Ven la auditoría el Administrador y Jefatura TI por defecto (permiso separado que el administrador puede asignar a otros roles).
  8. Es distinta del historial de movimientos de §8: este es dato de negocio (qué pasó con el activo); la auditoría es control (quién tocó qué).
  9. Se construye **como mecanismo general en la Etapa 1**, para que todas las etapas siguientes lo usen.
- **Motivo:** Si un administrador puede borrar su auditoría, no sirve como evidencia. Si llega tarde, todo lo hecho antes queda sin rastro.
- **Recomendó:** Cumplimiento (R3, R13), Seguridad (RS-36 a RS-38), Arquitecto (ADR-005), Ingeniero de Datos, QA. **Discrepancia:** Seguridad proponía que solo el Administrador vea la auditoría (4.5-B) y Jefatura solo precios. Se mantiene el documento v0.1 (Jefatura TI ve auditoría) con Cumplimiento (P7-A); cada empresa lo ajusta con el permiso separado.
- **Qué cambia:** Documento §11 se reescribe. Cierra la pregunta de QA (punto 22).

### D-019 · Nada con historial se borra
- **Pregunta:** ¿Se borra algo de verdad ("eliminó", §11)?
- **Decisión:** No. Lo que tiene historia se **desactiva, se anula o se da de baja**, con motivo. Lo único que se borra de verdad son los **borradores que nunca tuvieron efecto**. El documento reemplaza "eliminó" por "anuló o dio de baja". Las claves internas son identificadores no consecutivos ni adivinables; los códigos para personas (SKU, número de orden) son aparte.
- **Motivo:** La trazabilidad es el propósito de la plataforma (§1).
- **Recomendó:** Arquitecto, Ingeniero de Datos, Seguridad (RS-39), Auditor Técnico, Cumplimiento. Unanimidad.
- **Qué cambia:** Documento §5, §8 y §11.

### D-020 · Importación del Excel actual

> **Anotación (2026-10-25):** los puntos 4, 5 y 8 quedan **precisados por D-050** (qué significa "no duplicar", qué significa "deshacer" y que el archivo original ya no se guarda 30 días).

- **Pregunta:** ¿Entra la carga masiva del inventario? ¿Qué pasa con filas con error?
- **Decisión:**
  1. **Entra en la v1, dentro de la Etapa 4.** Sin ella la plataforma arranca vacía.
  2. Pasos: plantilla con columnas fijas → subir → **vista previa (simulacro)** con el error por fila (número de fila, columna y motivo en español claro) → confirmar. No se guarda nada hasta confirmar.
  3. **Todo o nada por lote:** si hay una fila con error, no se carga nada hasta corregir. El usuario descarga el reporte de errores y vuelve a subir.
  4. Volver a subir el mismo archivo no duplica lo ya cargado.
  5. Cada importación se registra como lote (quién, cuándo, archivo, filas) y se puede **deshacer completo** mientras no tenga movimientos posteriores.
  6. Valores desconocidos (marcas, ubicaciones nuevas) **no se crean solos**: se listan para que el administrador los apruebe de una vez.
  7. El stock inicial por cantidad entra como movimiento "saldo inicial" por ubicación.
  8. Seguridad: solo .xlsx y .csv, tamaño y filas máximos definidos, validación del contenido real, celdas que empiezan con `=`, `+`, `-`, `@` se tratan como texto al importar y exportar, la empresa sale de la sesión (no del archivo), límite de importaciones por día. El archivo original se borra a los 30 días como máximo. Importar es un permiso aparte.
- **Motivo:** Una carga parcial es imposible de reconciliar con el Excel de origen; la vista previa evita que "no se pueda cargar nunca". Las medidas de seguridad evitan abuso y fórmulas maliciosas.
- **Recomendó:** Ingeniero de Datos (todo o nada, lote deshacible), Seguridad (RS-29 a RS-35), Gerente de TI, Diseñador (9-A), Auditor Técnico, Arquitecto. **Discrepancia:** QA recomendaba importar las filas buenas y devolver las malas (pregunta 3-B). Se adopta todo o nada porque es lo que hace posible reconciliar; a cambio se exige la vista previa y la no duplicación al re-subir (CA-10 de QA se ajusta).
- **Qué cambia:** Documento §2 (alcance) y nueva sección de importación. Pendiente #7: **necesitamos el Excel real, anonimizado** (D-028).

### D-021 · Uso, dispositivos, código de barras, búsqueda y exportación
- **Pregunta:** ¿Desde qué dispositivos? ¿Código de barras? ¿Búsqueda y exportación?
- **Decisión:**
  1. Funciona en computador y también en **tablet y celular** (la recepción y la búsqueda de activos se diseñan para pantalla pequeña). Modo claro y oscuro, uso por teclado, y estados con texto (no solo color).
  2. **Lector de código de barras:** soportado como entrada. Un lector común escribe como un teclado, así que la captura de series funciona con él (el cursor salta a la siguiente fila). La **impresión de etiquetas o códigos QR** y el escaneo con la cámara del celular quedan **fuera de la v1**.
  3. Toda lista tiene **buscador, filtros (estado, ubicación, categoría) y exportación a Excel**. Hay un buscador global (SKU, serie, activo, orden). La exportación es un permiso aparte y queda en la auditoría.
  4. Idioma: español. Cada empresa tiene su zona horaria; las fechas de garantía y vencimiento son fechas de calendario (sin hora); los momentos exactos se guardan en hora universal.
  5. Para un identificador de otra empresa se responde "no encontrado", igual que para uno que no existe.
  6. Cada rol ve al entrar una pantalla de inicio propia (Almacén: por recibir; Técnico: mi trabajo; Jefatura: por aprobar; Solicitante: mis solicitudes; Administrador: resumen; Solo lectura: buscador).
  7. Los textos de error no muestran detalles internos ni datos personales.
- **Motivo:** Son las tareas más frecuentes y no estaban escritas como requisito, así que nadie las iba a medir. El lector y los dispositivos no cuestan dinero.
- **Recomendó:** Diseñador (3.1, 3.2, preguntas 3 y 4), QA (punto 24 y 27), Seguridad (RS-32, RS-41, RS-42).
- **Qué cambia:** Documento: requisitos generales de uso y exportación. Prototipo de la Etapa 0: el Diseñador hace las pantallas de prioridad A de su lista 3.4.

### D-022 · Archivos adjuntos
- **Pregunta:** ¿Se guardan facturas, guías, fotos, actas firmadas?
- **Decisión:** **No en la v1 inicial.** Se reevalúa al cierre de la Etapa 4 con los documentos reales en la mano. Si se incluye, será como mínimo en órdenes de compra y activos, con tipos y tamaño limitados, separados por empresa y entregados solo tras comprobar el acceso. **Habilitarlo implica almacenamiento con costo mensual, por lo que lo decide el CEO en ese momento** (ver "Escalado").
- **Motivo:** No hay documentos reales todavía para dimensionar; el acta imprimible (D-012) cubre la necesidad inmediata sin almacenamiento.
- **Recomendó:** Arquitecto (pregunta 10-a), Seguridad (RS-12 si llegara a existir), Cumplimiento (el papel firmado subido, para después). **Discrepancia:** Cumplimiento prefería subir el papel firmado desde ya; se difiere por costo y falta de datos.
- **Qué cambia:** Documento §2: se agrega a "No incluye por ahora".

### D-023 · Alcance de la versión 1 y orden de etapas
- **Pregunta:** ¿El alcance es realista? ¿El orden de etapas es correcto?
- **Decisión:**
  1. **Entra a la v1** lo que dice el documento más: importación del Excel (D-020), directorio de personas (D-006), administrador de plataforma (D-003), segunda verificación para administradores (D-002), auditoría inalterable (D-018), búsqueda y exportación (D-021), acta imprimible (D-012), aviso por correo de invitaciones, accesos y aprobaciones (D-013).
  2. **No entra a la v1** (queda anotado para después): aprobación en varios niveles o por tipo de orden; varios roles por persona; restricción por sede; subcategorías de varios niveles; conversión de monedas; asignación de puestos de licencia; adjuntos (D-022); impresión de etiquetas/QR y escaneo con cámara; firma o aceptación en pantalla del receptor; estado "en tránsito"; devolución al proveedor y mercadería dañada; avisos automáticos de vencimiento de garantía o licencia; envío automático de órdenes al proveedor; ingreso con Google/Microsoft; segunda persona para bajas de valor; integración con SAP.
  3. **Orden de etapas:** se mantiene 0 a 7, compras (5) antes que servicios (6). Ajustes: la **Etapa 1 incluye la auditoría general, el ciclo de vida del usuario, la matriz de roles y el administrador de plataforma**; el **directorio de personas va en la Etapa 2**; la **importación va en la Etapa 4**; las **órdenes de servicio dependen del inventario (Etapa 4), no de las compras**, así que cambiar el orden 5 y 6 sería posible si el CEO lo pide, pero queda como está porque las compras están más definidas.
  4. **Puerta de la Etapa 0:** no se programa hasta que el CEO apruebe el documento v1.0 (con la demo del prototipo) y haya entregado una OC real, una OS real y el Excel (anonimizados o con datos de ejemplo, D-028). Mientras no estén, se trabaja con datos ficticios y se declara así.
  5. **Antes de la primera tabla de la Etapa 1:** prototipo de 1 a 2 días del aislamiento por empresa (D-025). Si falla, el Arquitecto vuelve a mesa.
  6. Cada etapa tiene criterios de aceptación en formato Dado/Cuando/Entonces; los 10 de QA son el punto de partida.
- **Motivo:** El alcance es realizable si lo configurable se mantiene mínimo y no se construye flexibilidad que nadie haya pedido. Lo que cambia los datos si se decide tarde sí se decide hoy.
- **Recomendó:** Gerente de TI (alcance y orden), Cumplimiento (R13), QA (criterios), Auditor Técnico (etapa y trazabilidad), Arquitecto (3.12).
- **Qué cambia:** Documento §2, nueva sección "Fuera de la v1" y "Criterios de aceptación por etapa". Riesgo #7.

### D-024 · Retención de datos (PROPUESTA a confirmar con legal)
- **Pregunta:** ¿Cuánto tiempo se guardan los datos?
- **Decisión (propuesta provisoria, no definitiva hasta que legal la confirme):**
  1. **Auditoría:** 5 años.
  2. **Datos personales de una persona o usuario dado de baja:** 2 años; luego se anonimizan (el nombre y el correo se reemplazan por una referencia como "Persona dada de baja 0042"; el historial de activos se conserva).
  3. **Archivos de importación:** máximo 30 días.
  4. **Respaldos:** mismas protecciones que los datos; el plazo NO es igual al de los datos, ver D-032 (reemplaza lo que decía este punto).
  5. **Constancias de entrega y devoluciones:** mientras exista el activo más el plazo de auditoría.
  6. Hay un procedimiento para atender solicitudes de acceso, corrección y eliminación de datos personales; se puede exportar y anonimizar a una persona sin romper el historial.
  7. Aviso de privacidad y términos: pantalla de aceptación en el primer ingreso (versión y fecha quedan registradas). El texto lo redacta o revisa legal.
- **Motivo:** Sin finalidad y plazos, la plataforma nace con una deuda de privacidad difícil de corregir. Se adopta la opción más prudente: 5 años de auditoría (Cumplimiento) por encima de los 3 años que proponía Seguridad.
- **Recomendó:** Auditor de Cumplimiento (R1, R3, R8, R9, R10; P4, P5), Seguridad (4.8). **Discrepancia:** Seguridad propuso 3 años de auditoría; se adopta 5 hasta que legal diga el mínimo o el máximo.
- **Qué cambia:** Documento: sección "Datos personales" (dato, finalidad, quién lo ve, plazo). **Escalado al CEO por ser tema legal.**

### D-025 · Aislamiento entre empresas (decisión técnica)

> **Anotación (2026-10-25):** reemplazada por **D-038** (trabajos en segundo plano: ya no es "sin colas"), **D-039** (nueva redacción del aislamiento, tablas globales y roles de base) y **D-046** (empresa activa en la dirección de la página). Se conserva el texto original como historia.

- **Pregunta:** ¿Cómo se garantiza que una empresa nunca vea datos de otra?
- **Decisión:** Una sola base de datos compartida con la empresa en cada tabla, y **dos capas de defensa**: (1) un único punto de acceso en el servidor que filtra siempre por la empresa de la sesión; (2) reglas dentro de la propia base de datos (seguridad por fila) que devuelven nada si una consulta olvida el filtro. Las referencias entre datos deben pertenecer a la misma empresa (una orden no puede apuntar a un SKU o proveedor de otra). La empresa activa la fija y comprueba el servidor en cada acción, no la pantalla; si la persona deja de ser miembro, pierde el acceso al instante. Cada tabla nueva lleva su prueba de aislamiento. Cambiar de empresa no arrastra datos en pantalla de la anterior y queda en la auditoría. Los catálogos son por empresa, no compartidos. Un prototipo de 1 a 2 días con la herramienta de base de datos elegida valida todo esto antes de escribir la primera tabla. Base única, sin microservicios ni colas: el volumen supuesto no los necesita.
- **Motivo:** Es el riesgo crítico #2: "una consulta que olvide el filtro es un defecto grave".
- **Recomendó:** Arquitecto (ADR-001), Ingeniero de Datos, Seguridad (RS-06 a RS-13), QA (CA-01, CA-02).
- **Qué cambia:** Diseño: documentos de decisión en `docs/arquitectura/`. Riesgo #18.

### D-026 · Términos y trazabilidad del documento
- **Pregunta:** ¿Cómo evitamos palabras con dos sentidos y requisitos imposibles de probar?
- **Decisión:**
  1. En el documento, la persona que pidió la plataforma pasa a llamarse **"Cliente (CEO)"**; "Solicitante" queda solo como rol.
  2. Glosario ampliado: **Artículo = SKU** (se deja de usar la palabra "artículo" para las unidades), **Unidad física/Activo**, **Unidad de medida** (distinta de unidad física), **Stock** (conteo de un SKU por cantidad), **Persona** y **Usuario**, **Solicitud** (= orden en Borrador), Ubicación, Baja, Traslado, Garantía, Centro de costo. El "Activo" incluye cada unidad con serie; el stock por cantidad se llama stock, no activo. "Responsable/asignado/ubicación" se unifica.
  3. Cada requisito lleva identificador: **RF-módulo-NNN** (funcionales), **RN-NNN** (reglas de negocio), **RNF-NNN** (de calidad), **CA-** (criterios de aceptación), **P-NNN** (pendientes, con la etapa que bloquean). Los identificadores no se reutilizan. Cada requisito indica su etapa (0 a 7).
  4. Matriz de trazabilidad en `docs/trazabilidad.md` (requisito, criterio, prueba, estado), que el Auditor Técnico revisa al cerrar cada etapa.
  5. Reglas de negocio implícitas se escriben como tales: recepción todo-o-nada, correlativos y series que no se duplican aunque haya dos personas a la vez, auditoría que no se edita.
  6. Requisitos de calidad (volumen, tiempos, idioma) en una sección propia. El volumen real sigue siendo el pendiente #4: mientras tanto se asume hasta unos cientos de miles de activos por empresa sin infraestructura especial, y se mide cuando haya cifras.
- **Motivo:** Sin identificadores y criterios, QA no puede escribir una prueba que falle con justificación.
- **Recomendó:** Auditor Técnico (3.1, 3.2), QA, Analista (autocrítica).
- **Qué cambia:** Documento completo (v0.2) y `docs/trazabilidad.md`.

### D-027 · Órdenes de servicio
- **Pregunta:** ¿Tipos de servicio, aprobación, costo y relación con el inventario?
- **Decisión:** Se diseñan en la Etapa 6, **desacopladas** del inventario hasta entonces. Propuesta de partida: tipos Reparación, Instalación y Servicio externo, como catálogo configurable; el responsable puede ser una persona de la empresa o un proveedor del catálogo (son dos destinos distintos); la aprobación solo si tiene costo. Abrir o cerrar una orden **no cambia** automáticamente el estado del activo en la v1; el técnico cambia el estado a mano. Una OS puede cancelarse antes de cerrar; una OS cerrada no se reabre (se crea una nueva). Esto **no bloquea** las Etapas 1 a 5.
- **Motivo:** Es lo más indefinido del documento (tres pendientes) y no hay datos reales todavía.
- **Recomendó:** Arquitecto (2.14), Analista (pendiente #3), Auditor Técnico, QA (punto 21).
- **Qué cambia:** Documento §10. Pendiente #3 pasa a no bloqueante hasta la Etapa 6; se pide una OS real.

### D-028 · Datos de prueba y documentos del CEO
- **Pregunta:** ¿Dónde viven los documentos reales y qué se hace con los nombres de personas?
- **Decisión:** Ningún dato personal real en el repositorio ni en el entorno de pruebas. El Excel real, la OC y la OS se entregan **con los nombres de personas reemplazados** (o con datos de ejemplo). Si el CEO prefiere entregarlos sin anonimizar, se guardan en un lugar controlado que defina DevOps con Seguridad, fuera del repositorio.
- **Motivo:** El Excel casi seguro trae nombres de empleados y la regla 4 del proyecto lo prohíbe en el repositorio.
- **Recomendó:** Auditor de Cumplimiento (R11, P9-B), Seguridad (RS-40).
- **Qué cambia:** Pide al CEO que entregue los documentos anonimizados (ver "Escalado").

### D-029 · Continuidad y documentación
- **Pregunta:** ¿Respaldos, vuelta atrás y manuales?
- **Decisión:** Respaldo automático diario y cifrado, con restauración probada al menos una vez antes de cada etapa que pase a uso real y sin mezclar datos de empresas. Cada despliegue tiene un plan de vuelta atrás escrito. Manual del usuario y del administrador al cierre de cada etapa, y manual de operación (respaldo y restauración) antes de producción. Lo ejecuta DevOps; Seguridad y Cumplimiento lo revisan. El costo del servicio se estima en la Etapa 0 (ver "Escalado").
- **Motivo:** La capacidad de recuperarse de un error es parte del contrato con el CEO.
- **Recomendó:** Auditor de Cumplimiento (R10), Seguridad (RS-44), Gerente de TI (riesgo #14).
- **Qué cambia:** Documento: sección "Continuidad y documentación".

---

## Ajustes pedidos por el Auditor de Cumplimiento (revisión cruzada, antes de la Etapa 1)

Nota: la solicitud llegó citando H-CUM-01, H-CUM-02 y H-CUM-04 en `docs/revision-cruzada/auditor-cumplimiento.md`, archivo que no existe todavía en el repositorio cuando se decidió. Las decisiones se tomaron con lo descrito en el mensaje; si el detalle del archivo contradice algo, se reabre.

### D-030 · Cómo anonimizar sin tocar la auditoría que solo se agrega
- **Pregunta:** La auditoría no se edita (D-018). ¿Cómo se anonimiza a una persona sin editarla?
- **Decisión:**
  1. Los datos personales (nombre, correo, área) **viven solo en los registros de Persona y de Usuario**. La auditoría y el historial de movimientos guardan únicamente el **identificador interno** de la persona, nunca su nombre ni su correo.
  2. Cuando un cambio toca un dato personal, la auditoría registra **qué campo cambió** pero **no el valor anterior ni el nuevo** de nombre, correo o área.
  3. **Anonimizar = sobrescribir los datos en el registro de Persona/Usuario** con una referencia ("Persona dada de baja 0042"). La auditoría no se toca y sigue siendo legible, porque apunta al identificador, que ahora muestra la referencia.
  4. La anonimización queda como un evento más en la auditoría (quién la ordenó o que fue automática, y cuándo).
  5. Lo que en la auditoría pueda ser dato personal indirecto (por ejemplo la dirección IP) se conserva solo hasta que venza el plazo de la auditoría (D-024.1). Al vencer, un **proceso de mantenimiento separado de la aplicación** (no un botón del administrador) archiva o elimina las entradas vencidas y deja constancia. Es el único borrado permitido sobre la auditoría.
  6. **Ampliación (H-CUM-01): lista cerrada de campos personales que la auditoría nunca guarda por valor.** Son: nombre, correo, área, **código de empleado**, teléfono y correo laborales de **contactos de proveedor**, **titular persona natural** de un dominio o contrato, y cualquier **texto libre** (comentarios, motivos, descripciones) donde una persona pueda escribir datos personales. De estos, la auditoría guarda solo "el campo X cambió". En los motivos, que son texto libre, el sistema avisa al escribir que no se pongan datos personales ni claves. La lista la mantiene el Arquitecto en un solo lugar del código y todos los módulos la usan; un campo nuevo con dato personal no pasa a desarrollo sin declararse en ella. Se revisa al abrir cada etapa. **[Enmendado por D-077 (2026-10-26): los "motivos" salen de la lista de textos que la auditoría nunca guarda por valor.]** Mientras legal no diga lo contrario, IMEI, número de línea asignado y dirección IP se tratan como datos personales.
  7. **Eventos de seguridad aparte.** La IP, los inicios de sesión fallidos y el correo escrito en un intento fallido (que puede ser de un desconocido) van en un **registro de seguridad separado**, con plazo corto de **12 meses** (propuesta, legal lo confirma), no en los 5 años de la auditoría de negocio.
  8. La purga a los 5 años se hace por **partición anual**, por un rol de mantenimiento fuera de la aplicación, con **dos personas autorizadas** y constancia (partición, fecha, quién).
- **Motivo:** Separar "quién fue" (identificador, permanente) de "cómo se llama" (dato personal, anonimizable) permite cumplir las dos cosas sin excepciones a la regla de solo agregar. La lista cerrada evita que cada módulo decida por su cuenta qué es dato personal.
- **Recomendó:** Auditor de Cumplimiento (H-CUM-01). Decide el Gerente de TI con base en D-018.5 y D-006. La ampliación 6 a 8 la pidió el mismo auditor y se acepta completa.
- **Qué cambia:** Diseño de auditoría (Arquitecto, Ingeniero de Datos): nunca guardar valores de campos personales. Se actualiza D-018 y la sección "Datos personales" del documento. QA agrega una prueba: anonimizar y comprobar que la auditoría sigue completa y sin nombres.

### D-031 · Un solo interruptor central para las excepciones de separación de funciones
- **Pregunta:** D-015.4 permite una excepción por empresa. ¿Dónde se activa y quién la controla?
- **Decisión:**
  1. Un **único ajuste por empresa**, en un solo lugar de la configuración, "Excepciones de separación de funciones", con una casilla por cada regla exceptuable de D-015.3 (aprobar lo propio, recibir lo creado o aprobado). Todas **apagadas por defecto**.
  2. En el código existe **una sola función** que responde si una regla está exceptuada; ninguna pantalla ni módulo consulta el ajuste por su cuenta. Así no hay excepciones escondidas.
  3. Solo un Administrador puede cambiarlo y se pide la segunda verificación reciente. Activarlo o apagarlo queda en la auditoría con motivo obligatorio.
  4. Cada vez que se usa la excepción, la orden muestra un aviso visible y se registra un evento en la auditoría.
  5. El Administrador de plataforma no puede activarlo en nombre de una empresa.
  6. **Ampliación (H-CUM-02): vale para todas las áreas con separación de funciones**, no solo compras y recepción: compras, recepción, presupuestos, contratos, licencias, mesa de ayuda y cambios. Una casilla por área, todas consultadas por la misma función. Ningún módulo puede tener una excepción propia (se retira la regla propia de cambios, RN-CAM-004).
  7. **Cada casilla vence a los 90 días** y se renueva solo con motivo. Si la empresa tiene dos o más administradores, uno la activa y **otro la confirma**. Cada mes se envía un **resumen de usos** a los administradores y a Jefatura TI. El aviso visible aparece en cada documento que use la excepción.
  8. QA prueba cada área con la casilla apagada, incluso llamando directo al servidor, y prueba que la casilla vencida deja de funcionar.
- **Motivo:** Una excepción dispersa es un hueco de control; centralizada es auditable y probable. Sin vencimiento, en una empresa de una persona quien la activa es quien se beneficia y se olvida.
- **Recomendó:** Auditor de Cumplimiento (H-CUM-02), alineado con D-015.4.
- **Qué cambia:** Documento §5 y §9. QA prueba que, con el ajuste apagado, ninguna ruta permite la excepción, incluso llamando directamente al servidor.

### D-032 · Retención de respaldos (reemplaza D-024.4)
- **Pregunta:** ¿Los respaldos se guardan 5 años como la auditoría?
- **Decisión (propuesta, a confirmar con legal):**
  1. **No.** Guardar respaldos 5 años mantendría datos personales ya anonimizados y costaría mucho. Plan: respaldos diarios durante **30 días** y uno mensual durante **12 meses**.
  2. Como el respaldo más antiguo vive hasta 12 meses, un dato anonimizado puede seguir existiendo en respaldos hasta ese plazo. Se acepta y se declara en el aviso de privacidad.
  3. **Al restaurar** cualquier respaldo, antes de abrir el sistema se **reaplica el registro de anonimizaciones** (una lista aparte que solo guarda el identificador y la fecha, sin datos personales). Nadie anonimizado reaparece. **Ampliación (H-CUM-04):** ese registro vive en un **almacén propio, fuera de la base de datos que se restaura**, sin rotación, replicado, de modo que sobreviva a la pérdida total del sistema. Se corrigen RF-DAT-005, RNF-014 y D-029 (que decían "mismo plazo que los datos"). La prueba de restauración (CA-053) incluye reaplicar las anonimizaciones y comprobar que nadie anonimizado reaparece. El aviso de privacidad declara los 12 meses de respaldos. DevOps reestima el costo con 30 diarios y 12 mensuales. La copia externa de la auditoría, si existe, sigue el plazo de la auditoría.
  4. La auditoría de 5 años vive en el sistema, no depende de los respaldos.
  5. Respaldos cifrados y sin mezclar empresas (D-029). Una prueba de restauración incluye la reaplicación de anonimizaciones.
- **Motivo:** El respaldo existe para recuperarse de un error reciente, no para archivo histórico. Menos retención reduce costo y exposición de datos.
- **Recomendó:** Auditor de Cumplimiento (H-CUM-04 pidió definirlo). Plazo: propuesta del Gerente de TI; DevOps estima el costo y legal confirma si 12 meses es aceptable.
- **Qué cambia:** Reemplaza D-024.4 y ajusta D-029. Entra en el escalado como tema legal y de costo.

### D-033 · Regla provisional: nombre en las actas y anonimización (H-CUM-08, H-CUM-17)
- **Pregunta:** D-024.2 anonimiza a una Persona a los 2 años del cese, pero las actas de entrega se conservan mientras exista el activo más 5 años. El nombre desaparecería antes de que termine el plazo de la constancia. ¿Qué regla rige mientras legal no responde (L-05)?
- **Decisión (provisional, hasta la respuesta escrita de legal):**
  1. **El nombre en las actas y registros de entrega no se anonimiza** mientras dure el plazo de la constancia (activo más 5 años). Pasado ese plazo, el nombre del acta se reemplaza por la referencia.
  2. Al anonimizar a una Persona se quitan **correo, código de empleado, puesto y demás datos de contacto** del registro de Persona. El nombre en el registro de Persona se reemplaza por la referencia, pero **la copia del nombre dentro de las actas se mantiene** según el punto 1. Es el único lugar donde queda el nombre, y se declara así en la tabla de datos personales y en el aviso de privacidad.
  3. **No se anonimiza a una Persona** que tenga equipos en "Extraviado o robado" o "No devuelto" sin cerrar. El plazo se cuenta desde el cese y no vence antes del cierre de esos casos (rige el mayor de los dos).
  4. **La anonimización automática queda apagada** hasta que legal confirme los plazos por escrito. No se activa nada irreversible sin esa confirmación (ver "Escalado al CEO").
  5. **La anonimización manual** solo se hace para pedidos de derechos documentados en el registro de solicitudes de derechos, con **dos personas** (una propone, otra ejecuta) y con vista previa de lo que se afectará. Quien presenta el pedido no lo atiende. El plazo configurable por empresa solo puede moverse dentro de límites fijados por la plataforma.
  6. Si legal responde que hay que anonimizar también el nombre en las actas, se reaplica sobre lo existente y se actualiza esta decisión.
- **Motivo:** Es una decisión irreversible que podría destruir la prueba de una entrega (la palabra de uno contra otro, como advirtió Cumplimiento). Conservar el nombre en el acta hasta fin de plazo es lo más prudente y se puede endurecer después; lo contrario no se puede deshacer.
- **Recomendó:** Auditor de Cumplimiento (H-CUM-08, H-CUM-17). Decide el Gerente de TI.
- **Qué cambia:** `personas-ubicaciones.md` RN-PER-021 y RN-PER-018 a 020, `entregas-devoluciones.md` RN-ENT-021 y CA-ENT-13; sección "Datos personales" del documento. **No decidido aquí:** el cese con equipos pendientes de devolución (H-CUM-15), que sigue abierto para el Gerente de TI y el Analista.

### D-034 · Cese de una Persona con equipo pendiente de devolución (H-CUM-15)
- **Pregunta:** D-006 impide dar de baja a una Persona con activos asignados. Si alguien se va y no devolvió el equipo, ¿cómo se cierra su situación sin registrar como "Extraviado o robado" algo que quizá no se perdió?
- **Decisión:**
  1. **Se permite el cese** de la Persona aunque tenga equipos sin devolver. Sus equipos pasan a una marca "**Pendiente de devolución**" que no es un estado nuevo del activo: el activo sigue "Asignado" a esa Persona, con fecha del cese y motivo.
  2. "Pendiente de devolución" **no aparece** en los reportes de pérdidas ni en la depreciación como extravío o robo. Para pasar a "Extraviado o robado" hace falta una decisión explícita con motivo, como cualquier otro caso (D-012).
  3. Se mantiene el **bloqueo para anonimizar** (D-033.3): no se anonimiza a una Persona con equipos pendientes hasta cerrarlos (devolución, extravío o baja con motivo).
  4. Al cesar, la cuenta de Usuario vinculada se suspende: eso exige además el permiso de suspender usuarios, no basta el de cesar Personas (H-CUM-05b).
  5. **Motivo de cese:** se quita el texto libre; queda una lista corta sin texto libre (salida, fin de contrato, traslado, otro), o se elimina si el Analista comprueba que TI no lo necesita.
  6. El aviso al exempleado por correo personal sigue apagado hasta la opinión legal (L-11).
- **Motivo:** Obligar a declarar una pérdida o robo falso ensucia reportes y señala a una persona sin prueba. Con la marca, el seguimiento queda visible sin afirmar nada que no se sabe.
- **Recomendó:** Auditor de Cumplimiento (H-CUM-15). Decide el Gerente de TI.
- **Qué cambia:** Reemplaza lo que dice D-006 sobre no poder dar de baja a una Persona con activos, y ajusta `personas-ubicaciones.md` RN-PER-008, RN-PER-011 y `entregas-devoluciones.md` RF-ENT-010. El tipo "No devuelto tras el cese" como motivo de extravío deja de usarse.

---

## Decisiones de la revisión cruzada (Mesa #002, oleada C)

**Origen.** Siete revisiones cruzadas (`docs/revision-cruzada/`: arquitecto-software, ingeniero-datos, especialista-seguridad, qa-tester, auditor-codigo, auditor-cumplimiento, disenador-ux), sus mensajes `mensajes-*.md` y el plan de DevOps (`docs/operaciones/plan-entornos-y-costos.md`). Fecha: 2026-10-25. Decide el Gerente de TI por delegación del CEO; solo se escala lo que es dinero, legal o irreversible (ver "Escalado al CEO", al final).

**Reglas de precedencia que rigen desde hoy**
1. Si dos documentos se contradicen, manda lo decidido en este archivo; después el núcleo (`documento-funcional.md`); un módulo **no cambia** celdas ni reglas del núcleo por su cuenta: propone y aquí se decide.
2. Todo `[SUPUESTO]` de un módulo que toque una decisión D-xxx se eleva aquí como propuesta y **no es vigente** hasta que se decida (H-AUD-06). Los `[SUPUESTO]` que no toquen ninguna D-xxx quedan aceptados como diseño del módulo (ver D-058).
3. Si dos revisores discrepan, decide el Gerente de TI y deja el motivo.

---

### D-035 · La clave de una licencia es un campo secreto de la unidad, nunca la serie
- **Pregunta:** ¿La clave de una licencia es la serie de la unidad (D-011.2) o un dato secreto aparte (SUP-LIC-03)?
- **Decisión:**
  1. La clave **nunca es la serie**. La serie de una unidad de licencia es un identificador visible (por ejemplo `M365-2026-A`). La clave es un campo de la unidad de un tipo nuevo, **"secreto"**: queda **seis tipos de campo** (texto, número, fecha, lista, sí/no y secreto).
  2. Un campo secreto se guarda **cifrado, en una columna aparte** (nunca dentro del JSON de campos), no se busca, y no aparece ni en el historial (dice solo "clave cambiada"), ni en la auditoría, ni en exportaciones (ni siquiera enmascarado), importaciones, reportes, tableros, API, avisos de webhook, correos, portal o registros técnicos. Las claves de licencia **no entran por Excel**; se escriben una a una.
  3. **Máscara:** se muestran los últimos 4 caracteres solo si la clave tiene 16 o más; si es más corta, menos.
  4. **Quién la ve completa:** permiso aparte `licencias.ver_clave`, sensible, **solo Administrador por defecto**; la empresa puede dárselo al Técnico (queda como opción, no como valor por defecto). Cada revelación exige reautenticación reciente (D-048), queda en la auditoría **sin el valor**, tiene tope de 20 por usuario por hora (al superarlo se avisa a los administradores) y se oculta sola a los 30 segundos con aviso previo y posibilidad de extender. Escribir o cambiar una clave es `licencias.editar_clave`, también sensible.
  5. Además, un campo de texto puede marcarse **"identificador"**: único por empresa y normalizado, con restricción en la base (lo usa el IMEI).
  6. El tipo "secreto" y la marca "identificador" entran con el motor de campos en la **Etapa 2**.
- **Motivo:** Si la clave fuera la serie se mostraría en búsquedas y en el historial de correcciones (D-017.1), que no puede contener secretos; además una licencia por serie recibiría garantía, depreciación y un elemento de CMDB de equipo físico, que no le corresponden.
- **Recomendó:** Auditor Técnico (H-AUD-01), Arquitecto (H-ARQ-06), Ingeniero de Datos (H-DAT-05), Seguridad (H-SEG-04), QA (H-QA-11), Diseñador (H-UX-22), módulo de licencias (SUP-LIC-03). **Discrepancia:** el módulo daba la clave también al Técnico por defecto; manda Seguridad y el núcleo (solo Administrador).
- **Qué cambia:** `documento-funcional.md`: RF-SKU-013 y 014, RF-CAT-012 (seis tipos y marca identificador), CA-020 y CA-042, glosario ("Activo"). `licencias-software.md`: SUP-LIC-03 y SUP-LIC-10. Reemplaza D-011.2 y las claves de D-011.3.

### D-036 · Un solo registro de permisos, con formato único
- **Pregunta:** ¿Cómo se evita que 17 módulos escriban el mismo permiso de cinco maneras y que nadie sepa qué está protegido?
- **Decisión:**
  1. Existe **un registro único de permisos** en el núcleo (sección 7), con un identificador funcional **PS-nn** por permiso, su nombre técnico, su nombre en español, el módulo, si es sensible, su alcance, sus controles y su valor por defecto en cada rol. Los módulos **no inventan permisos**: piden que se agregue una fila y el Gerente de TI la aprueba. Fuera del registro no hay permiso.
  2. **Nombre técnico:** `<módulo>.<acción>`, en minúsculas y con guion bajo (por ejemplo `ordenes_compra.aprobar`). Nada de guiones ni de variantes como `datos-personales.ver`. El catálogo vive **en el código** (módulo, acción, marca sensible, alcance, controles) y alimenta la pantalla de roles.
  3. **Permisos globales sensibles, uno solo de cada uno:** `datos_personales.ver`, `precios.ver`, `auditoria.ver`, **`datos.exportar`** y **`datos.importar`**. Cada módulo exporta o importa solo lo que el usuario ya puede ver y las columnas de precios y de datos personales se omiten según sus propios permisos. Se cierra así la contradicción entre D-004.4 y los módulos (más de diez variantes de "exportar").
  4. **Alcance cerrado:** solo "todo" o "propio". Qué significa "propio" lo define un **resolvedor por tipo de recurso** (creador, asignado, responsable, Persona vinculada, miembro de la cola, responsable del centro de costo). Quien tiene alcance "propio" y no tiene Persona vinculada ve una lista vacía, nunca un error.
  5. **Controles** (columna del registro): R reautenticación reciente, 2F segundo factor obligatorio a quien lo tenga, A cada uso en auditoría, T tope por hora, No segunda persona.
  6. La API usa **los mismos permisos y los mismos servicios** que las pantallas (los alcances de una clave son un subconjunto del catálogo).
  7. Una **prueba automática** falla si el código usa un permiso que no está en el registro, y QA genera la matriz de pruebas desde el catálogo (todas las celdas, cada una por petición directa).
  8. Permisos de módulos que llegan después: al activar un módulo en una empresa que ya existe, sus permisos se ofrecen al administrador como plantilla sugerida; los roles personalizados no cambian solos.
- **Motivo:** El Arquitecto contó 252 identificadores de permiso en los módulos, más del doble de lo que el núcleo diseñó. Sin un solo catálogo no se puede probar ni auditar quién puede qué.
- **Recomendó:** Arquitecto (H-ARQ-09), Seguridad (H-SEG-07), QA (H-QA-07), Auditor Técnico (H-AUD-05), Diseñador (H-UX-04), Cumplimiento (H-CUM-05). Unanimidad.
- **Qué cambia:** `documento-funcional.md` §7 (v0.3): registro PS-nn y matriz, RF-ROL-004/005/014. Los 17 módulos reescriben su sección 3 con los nombres y filas del registro. Reescribe D-004.4.

### D-037 · Matriz de permisos: los choques entre núcleo y módulos, resueltos uno por uno
- **Pregunta:** ¿Qué rol puede qué cuando el núcleo y un módulo no coinciden?
- **Decisión:** (la regla general es que los módulos agregan filas, no cambian celdas)

| # | Tema | Decisión | Motivo corto |
|---|---|---|---|
| 1 | Importar y exportar | Solo Administrador por defecto. Jefatura TI y los demás solo si el administrador lo activa en el rol. Se corrigen licencias, líneas y dominios. | D-004.4 pide un permiso sensible; exportar es la forma más fácil de llevarse todos los datos |
| 2 | Ver la clave completa de una licencia | Administrador; el Técnico solo si la empresa se lo da (D-035) | Es un secreto |
| 3 | Crear, editar y desactivar proveedores | Solo Administrador (D-015.5). Ver los contactos: `proveedores.ver_contactos`, por defecto Administrador, Jefatura TI y Técnico | Separación de funciones: quien aprueba compras no crea proveedores |
| 4 | Cesar y reactivar una Persona | Administrador y Jefatura TI. El Técnico crea y edita Personas, pero no las cesa. Si la Persona tiene un Usuario vinculado, además hace falta `usuarios.suspender` (Administrador) | El cese suspende cuentas; es más delicado que editar |
| 5 | Ubicaciones, áreas, centros de costo | Ubicaciones: Administrador y Técnico. Centros de costo, áreas y tipos de puesto: solo Administrador | La estructura de costos es financiera |
| 6 | Entregar, devolver y traspasar equipos | Administrador y Técnico. **Almacén no** por defecto (la empresa puede concedérselo, y entonces necesita `datos_personales.ver`). Registrar extravío: Administrador, Jefatura TI y Técnico. Reingreso: Administrador y Jefatura TI | Quien recibe mercadería no debe entregarla al usuario final sin un segundo control; Cumplimiento y Seguridad piden que Almacén no vea nombres |
| 7 | Ver datos personales | Administrador, Jefatura TI y Técnico. Almacén, Solicitante (salvo lo propio) y Solo lectura ven la referencia (`PRS-0042`), no el nombre | Minimiza exposición |
| 8 | Alta rápida de una Persona al entregar | Técnico y Administrador. Almacén no (DS-10: no) | Coherente con la fila 6 |
| 9 | Actas en PDF | Quien ve el acta la puede reimprimir; sin `datos_personales.ver`, el PDF omite nombre y área y muestra la referencia | El acta lleva nombre |
| 10 | Ver y escribir precios | Ver precios: Administrador y Jefatura TI. Técnico y Solicitante solo en las órdenes que ellos crean o editan (alcance propio). El Solicitante crea con SKU y cantidades; el Técnico o el Administrador completan precios. Almacén y Solo lectura, no | Cierra el flujo de S-15 sin dar precios a todos |
| 11 | Plantilla "Empleado (portal)" | Se aprueba como séptima plantilla, de lista cerrada y alcance "propio". En la v1 no hay portal; las columnas "Empleado (portal)" son informativas. Todo módulo declara la columna o "no aplica" | Cierra S-27 |
| 12 | Activar o desactivar un módulo | Lo hace el Administrador de la empresa en Configuración (`empresa.configurar_modulos`, sensible, auditado). Desactivar oculta pero no borra, y la API responde "no encontrado" | H-QA-17 |
| 13 | Segunda verificación | Se exige por permiso sensible, no por nombre de rol (D-048) | Los roles son editables |

- **Controles por permiso sensible:** la lista consolidada de Seguridad (sección 4 de su revisión) pasa al registro como columna de controles: reautenticación reciente para ver clave, exportar, importar, administrar roles y usuarios, activar excepciones, cambiar titular de dominio y crear claves de API; auditoría de cada uso; tope por hora donde corresponda.
- **Recomendó:** Auditor Técnico (tabla de conflictos), QA (H-QA-08), Seguridad (H-SEG-08), Cumplimiento (H-CUM-05), Diseñador (DS-02, DS-10), Arquitecto (H-ARQ-09). **Discrepancias resueltas:** Almacén entrega (Auditor Técnico y módulo ENT) frente a Almacén no (Cumplimiento, Seguridad): gana "no" por defecto; cese (QA: Jefatura; núcleo: Técnico): gana Jefatura.
- **Qué cambia:** núcleo §7.3 y registro PS-nn; `personas-ubicaciones`, `entregas-devoluciones`, `licencias-software`, `lineas-moviles`, `dominios-certificados`, `proveedores-contratos` reescriben sus tablas.

### D-038 · Trabajos en segundo plano, eventos y ejecución continua (reemplaza el "sin colas" de D-025)
- **Pregunta:** Catorce módulos necesitan avisos diarios, reintentos, renovaciones, importaciones y exportaciones grandes. ¿Cómo se ejecutan?
- **Decisión:**
  1. **Cola de trabajos dentro de PostgreSQL** (tabla de trabajos con reintentos y bloqueo `SKIP LOCKED`, con una librería como pg-boss o graphile-worker; se elige en el prototipo) y **un proceso trabajador** junto a la aplicación web. No se agrega Redis ni otro servicio, ni microservicios.
  2. **Ejecución continua:** la aplicación y el trabajador corren en un servicio de contenedores. Un alojamiento "sin servidor" con límite de pocos segundos no sirve para el trabajador. DevOps compara las opciones con precios verificados **antes del prototipo** (ver D-055 T-1).
  3. **Un programador único** reparte los trabajos diarios; no hay 14 temporizadores sueltos.
  4. **Reglas de todo trabajo:** idempotente (correrlo dos veces no duplica nada), recuperable (al arrancar procesa los días pendientes en orden y no pierde un aviso de vencimiento), se ejecuta empresa por empresa con la empresa fijada dentro de la transacción, salta empresas suspendidas, calcula "hoy" con la zona horaria de la empresa y deja un registro de cada corrida (fecha lógica, resultado, cuántos avisos).
  5. **Eventos:** una sola tabla de eventos (`evento_dominio`, con identificador único) y un solo catálogo de nombres `<módulo>.<entidad>_<hecho>`. Lo que **protege la integridad** (liberar puestos, cancelar mantenimientos, cerrar asignaciones, crear el registro de costo, bloquear la anonimización) corre **síncrono y en la misma transacción**. Lo que es **aviso o espejo** (correo, webhook, elemento de CMDB derivado) corre **asíncrono** por la cola.
  6. **Registro de módulo:** cada módulo declara al arrancar sus permisos, eventos emitidos y escuchados, **pendientes de la persona**, proveedores de búsqueda global, de vencimientos, de fuentes de costo, de indicadores, plantillas de importación y claves de contador. Así la Etapa 2 (Personas) consulta "lo registrado" sin importar los módulos de años después. Una prueba en CI falla si hay dependencias circulares entre módulos o si se importa algo que no sea una interfaz pública.
  7. Las operaciones largas (importación, exportación hasta 50.000 filas, PDF masivo) corren en el trabajador con barra de avance, nunca dentro de la petición.
  8. **Reloj de la plataforma** que las pruebas pueden fijar y adelantar (solo en entornos de prueba) y un disparador manual de los procesos diarios (QA lo necesita para probar vencimientos y SLA).
- **Motivo:** El "sin colas" de D-025 fue razonable con el núcleo; con los 17 módulos ya no se sostiene (autocrítica del Arquitecto). Una cola dentro de la misma base de datos es lo más simple que funciona.
- **Recomendó:** Arquitecto (H-ARQ-01, H-ARQ-11), Ingeniero de Datos (H-DAT-09), Seguridad (H-SEG-02), QA (H-QA-12). Unanimidad.
- **Qué cambia:** Reemplaza el "sin colas" de D-025. `documento-funcional.md`: RNF de operaciones largas y de procesos diarios (nueva regla transversal), RF-AUD-013. Todos los módulos con procesos diarios declaran su regla. **Costo:** el trabajador es una pieza de alojamiento más, incluida en el escalado de dinero (D2).

### D-039 · Aislamiento entre empresas, nueva redacción: tablas globales y roles de base de datos
- **Pregunta:** ¿Cómo se cumple "todo dato tiene empresa" en lo que, por naturaleza, no pertenece a una sola (usuario, enlace de ingreso, clave de API) y en los procesos que corren antes de saber la empresa?
- **Decisión:**
  1. **Base compartida** con la empresa en cada tabla de negocio, **clave foránea compuesta** `(empresa, id)`, **seguridad por fila forzada** y todo índice empezando por la empresa. Una macro de SQL `aplicar_aislamiento(tabla)` crea todo de una vez.
  2. La empresa de cada petición **sale de la dirección de la página** (D-046), se comprueba contra la membresía y se fija en la transacción; el cliente nunca manda una empresa que el servidor acepte sin verificar.
  3. **Cinco roles de base de datos:** `app_empresa` (el de la aplicación: sin ser dueño, sin saltarse las reglas por fila, sin ser superusuario), `app_plataforma` (solo tablas globales: así "el Administrador de plataforma no ve datos del negocio" lo impone la base y no solo una ruta), `migraciones` (dueño de las tablas; solo existe en el paso de publicación), `mantenimiento` (solo archiva o borra por partición) y `lector_auditoria` (solo lectura de la auditoría, para la copia externa). **Todas las pruebas de aislamiento corren con `app_empresa`**, y una prueba verifica que ese rol no es dueño, no tiene BYPASSRLS y no es superusuario.
  4. **Tablas globales: lista cerrada y corta**, mantenida por el Arquitecto y revisada por Seguridad: cuenta de usuario, sesión, enlace de ingreso, invitación por token, clave de API (búsqueda por huella), tipos de evento, estado del correo, monedas, países, administradores de plataforma, límites de plataforma, resumen de no leídas por usuario y eventos de seguridad de ingreso. Una prueba en CI **falla** si aparece una tabla que ni está en la lista global ni tiene las protecciones de empresa.
  5. **Accesos previos a conocer la empresa** (iniciar sesión, validar una clave de API, aceptar una invitación, listar empresas para el programador, contar no leídas de otras empresas, estado del correo): solo mediante **funciones puntuales con SECURITY DEFINER** (lista cerrada, devuelven lo mínimo, auditadas y con prueba). Nunca una conexión sin restricción.
  6. **Procesos automáticos:** empresa por empresa, con `app_empresa` y la empresa fijada dentro de la transacción; cada módulo agrega a su prueba "ejecutar el proceso con dos empresas y comprobar que cada aviso, registro y destinatario queda en la suya".
  7. **Referencias a "objeto (tipo e identificador)"** (auditoría, avisos, CMDB, costos): una columna por tipo con clave foránea compuesta y una restricción de que solo una esté llena; en la auditoría, un disparador que valida la misma empresa más una verificación nocturna de cruces.
  8. Una prueba genérica en CI recorre el catálogo de la base, más un caso de aislamiento **por módulo** (no por tabla). Para el **portal**, que separa Personas dentro de la misma empresa, se agregan consultas dedicadas que reciben la Persona de la sesión y una prueba con dos Personas de la misma empresa (H-SEG-09).
  9. Plan B si Prisma no alcanza: Kysely o SQL puro para esa parte, sin cambiar el resto del stack.
  10. **Lectura de soporte (RF-PLA-013, añadido el 2026-10-25 por D-073).** Una sesión de soporte **no usa `app_plataforma`**. Es una **transacción de solo lectura** (`SET TRANSACTION READ ONLY`) con el contexto de **esa única empresa**, creada con `app_empresa` a partir de una **autorización temporal**: una fila de una tabla global `autorizacion_soporte` (empresa, motivo, persona de plataforma, vence en un máximo de 24 horas) que **crea un administrador de esa empresa**; una función `SECURITY DEFINER` de la lista cerrada la valida y fija el contexto. Prohibidos `BYPASSRLS` y superusuario. La sesión **no ve** columnas secretas ni la cola de derechos de datos, muestra el banner de soporte y cada consulta queda en la auditoría de la propia empresa (RF-PLA-005). **Prueba:** con la autorización vencida, de otra empresa o ya usada por otra persona, la lectura devuelve cero filas y cualquier escritura falla. El Arquitecto lo prueba en el prototipo y Seguridad lo revisa.
- **Motivo:** Es donde un aislamiento perfecto en papel suele romperse (H-ARQ-02, H-DAT-01). Es el riesgo crítico #2.
- **Recomendó:** Arquitecto (H-ARQ-02, 13), Ingeniero de Datos (H-DAT-01), Seguridad (H-SEG-02, 09, 17), QA (criterios del prototipo). Unanimidad.
- **Qué cambia:** Reemplaza D-025. Documento: RS-10 y RN-001 (las tablas globales como excepción listada). Un ADR de aislamiento en `docs/arquitectura/`.

### D-040 · Un dueño por concepto: ubicación, centro de costo, área, proveedor y código externo
- **Pregunta:** El mismo concepto se define dos veces con reglas distintas (ubicación, centro de costo, área, proveedor, código externo). ¿Quién es el dueño?
- **Decisión:**
  1. **Ubicación jerárquica desde la v1 (Etapa 2):** `ubicación superior` opcional, **máximo 3 niveles** (Sede > Piso > Sala), nombre único por superior. Activos y stock pueden estar en **cualquier nivel**. Mover un nodo **no** escribe movimientos por activo; el historial guarda la ruta en texto en el momento del movimiento. Una lista simple es un árbol de un nivel. (Nota: se dice que el árbol "lo pidió el CEO", pero no consta en ningún documento verificable; se adopta porque cambiarlo después obligaría a migrar datos reales.)
  2. **Centro de costo:** un solo catálogo, el del núcleo, con **Persona responsable opcional** y código externo opcional. **Área** (una por Persona, un solo nivel) y **tipo de puesto** son catálogos del núcleo desde la Etapa 2. Personas los referencia; no los redefine.
  3. **Proveedor:** una sola tabla desde la Etapa 2, con los campos de la parte A del módulo (identificación fiscal normalizada y única, país, "vende bienes / presta servicios", contactos). Contratos y SLA llegan después (parte B). El operador de línea, el registrador de dominio, el emisor de certificados y el garante son proveedores de la misma tabla.
  4. **Código externo:** una columna simple y opcional (S-25) en la v1; cuando llegue la integración (INT-2) se migra a la tabla de equivalencias (migración conocida y anotada, no se hace antes).
  5. **Centro de costo del activo:** columna opcional que se copia de la línea de la orden al recibir y se corrige con permiso; la depreciación se reparte por ese centro cuando exista el módulo de presupuesto.
- **Motivo:** Cada concepto con dos dueños es un dato que se desincroniza; y estos cambios son baratos hoy y migraciones con datos reales mañana (criterio de D-023).
- **Recomendó:** Arquitecto (H-ARQ-07), Ingeniero de Datos (H-DAT-16), Auditor Técnico (H-AUD-09), Analista (propuesta aceptada).
- **Qué cambia:** núcleo RF-CAT-001, 006, 023, 024 y S-06 (**rechazado**, ver D-057); `personas-ubicaciones`, `proveedores-contratos`, `integraciones-api`. Reemplaza D-008.7 en lo que dice "ubicaciones".

### D-041 · El autor de todo es la membresía; los datos personales viven en una tabla aparte
- **Pregunta:** "Usuario" aparece como autor, destinatario y responsable sin aclarar si es la cuenta global o la persona dentro de una empresa.
- **Decisión:**
  1. **Cuenta global mínima** (correo normalizado y segunda verificación) y **membresía** `(empresa, usuario, rol, estado, nombre visible en esa empresa)`. **Todas las tablas de negocio apuntan a la membresía**, con clave compuesta, para "creado por", "aprobado por", "responsable" y "destinatario".
  2. La **Persona** se vincula a la membresía (1 a 1, único por empresa). Anonimizar una membresía no toca la cuenta global; la cuenta global solo se anonimiza cuando no le queda ninguna empresa activa.
  3. Los **datos personales** (nombre, correo, código de empleado, y los datos visibles de un usuario en una empresa) viven en una **tabla aparte**. Todo lo demás (activo, acta, caso, línea, auditoría) apunta a la persona por identificador y referencia `PRS-NNNN`. Anonimizar es sobrescribir una fila (D-030).
  4. **Tipo de autor de la auditoría: tres valores** (membresía, integración, **sistema**). El "sistema" lleva el identificador de la regla y de quien la configuró.
  5. Una empresa nunca ve a qué otras empresas pertenece una persona.
- **Motivo:** Si el autor fuera la cuenta global, los registros de una empresa apuntarían a una fila sin empresa, quedarían fuera de las reglas por fila y no se podría anonimizar sin afectar a otras empresas.
- **Recomendó:** Ingeniero de Datos (H-DAT-03), Arquitecto (H-ARQ-03, tabla aparte compatible con D-030), Seguridad (RS-06, RS-08), Auditor Técnico, QA (H-QA-06 sobre autor "sistema").
- **Qué cambia:** núcleo §5, §8, RF-AUD-013 (S-28 **cambiado**, ver D-057), RF-PER; todos los módulos que dicen "Usuario" como responsable (PRV, GAR, ONB) pasan a "Persona con vínculo opcional a membresía".

### D-042 · Número de línea: campo de la unidad hasta que exista el módulo de líneas
- **Pregunta:** El núcleo da "número de línea" como campo del celular; el módulo de líneas dice que la línea es una entidad. ¿Quién manda?
- **Decisión:**
  1. **En la v1** el número de línea es un **campo opcional de la unidad** del Celular (como el IMEI), tratado como dato personal mientras legal no diga lo contrario (D-030.6) y con la marca "identificador".
  2. **Cuando se active el módulo de Líneas** en una empresa, la línea pasa a ser la dueña del número: un **asistente de migración** lee los valores, normaliza (solo dígitos con código de país), crea las líneas ligadas al equipo y a la Persona, reporta duplicados y formatos dudosos, y funciona **todo o nada por lote**, con simulacro previo sobre copia anonimizada, lote deshacible y plan de vuelta atrás (D-029).
  3. Tras migrar, el campo del celular queda **de solo lectura** con la etiqueta "Lo gestiona el módulo Líneas móviles" y se oculta de los formularios; los valores originales se conservan 90 días.
  4. No se guardan PIN ni PUK (SUP-LIN-03 aceptado).
- **Motivo:** Una empresa que necesite el número en la v1 puede capturarlo sin esperar a un módulo de fase posterior; y el módulo no obliga a una migración sorpresa.
- **Recomendó:** Analista y Arquitecto (propuesta), Ingeniero de Datos (H-DAT-05, H-DAT-20: prefería retirar el campo desde el inicio), Auditor Técnico (H-AUD-13). **Discrepancia:** Datos y el Auditor Técnico querían retirar el ejemplo de la v1; se mantiene el campo opcional por utilidad y porque la migración queda definida.
- **Qué cambia:** núcleo RF-CAT-014, §9.3 y §18.1 (el número de línea sigue como ejemplo, marcado "lo gestiona Líneas cuando está activo"); `lineas-moviles` SUP-LIN-02 y RF-LIN-014 (migración).

### D-043 · Un único servicio de doble control y un único interruptor de excepciones para todos los módulos
- **Pregunta:** La separación de funciones está definida nueve veces; la excepción de "una sola persona de TI" tiene versiones propias. ¿Cómo queda?
- **Decisión:** (amplía D-031 y D-015)
  1. **Un solo servicio de doble control** registra los participantes de cada ciclo de un documento (creó, editó, aprobó, recibió, implementó) y aplica las reglas declaradas por tipo de documento. **Definición única:** no aprueba nadie que haya **creado o editado desde la última aprobación**. Si una persona aprobó y alguien edita precio, cantidad o proveedor, vuelve a pendiente; el editor no puede reaprobar.
  2. **Un solo interruptor por empresa** con **ocho casillas** (compras, recepción, presupuestos, contratos, licencias, mesa de ayuda, cambios y problemas), todas **apagadas** por defecto, consultadas por **una sola función**; vencen a los 90 días; se confirman por un segundo administrador cuando hay dos o más; resumen mensual de usos (D-031.6 a 8). **Se retira la excepción propia de cambios (RN-CAM-004)**. La **autoentrega de equipos no tiene excepción**.
  3. **Una sola regla de monto:** el acto exige segunda persona cuando el **importe total comprometido, con impuesto, en la moneda base** supera estrictamente el límite de la empresa (RN-017). Con límite 0, toda orden con al menos una línea pasa por aprobación; una orden en otra moneda siempre pasa. Una función única `requiereSegundaPersona(acto, monto, moneda)`.
  4. **Tabla única de actos** (la escribe el analista en RN-017):

| Acto | Cuándo exige a otra persona |
|---|---|
| Aprobar orden de compra | Supera el límite (o moneda distinta de la base) |
| Activar contrato de proveedor | Supera el límite (valor del periodo contratado) |
| Confirmar contrato de licencia | Supera el límite (reemplaza el "cualquier costo mayor que 0") |
| Alta de dominio, certificado o línea con costo | No hay aprobación; si el costo comprometido supera el límite, otra persona; siempre marca "sin respaldo de compra" |
| Aprobar orden de servicio con costo | Supera el límite |
| Aprobar presupuesto | Siempre |
| Reclasificar costo o registrar gasto manual | Supera el límite; anular un gasto: otra persona |
| Aprobar cambio | Siempre; riesgo Alto: permiso aparte y aprobador distinto del implementador |
| Reaprobar plantilla estándar de cambios | Otra persona |
| Publicar error conocido | Quien no lo redactó |
| Aprobar solicitud de servicio con aprobación | Quien no la pidió |
| Entregar un equipo | La autoentrega está prohibida, sin excepción |

  5. **Medidas complementarias** (H-CUM-03): el "cargo especial" de una línea exige `lineas.administrar_planes`; la renovación automática de contratos es una acción del "sistema" con la regla y la persona que aprobó el contrato; informe mensual "sin respaldo de compra" a quien aprueba; aviso informativo "posible compra fraccionada" (mismo proveedor, suma sobre el límite en 30 días).
  6. Una prueba automática por regla intenta cada violación por la API, con la casilla apagada y con ella vencida.
- **Motivo:** Una excepción dispersa es un hueco de control; centralizada es auditable. Una sola medida de monto evita comparar cosas distintas en cada módulo.
- **Recomendó:** Arquitecto (H-ARQ-10), Cumplimiento (H-CUM-02, H-CUM-03), Seguridad (H-SEG-21), QA (H-QA-09), Auditor Técnico (H-AUD-07), Diseñador (H-UX-06). **Discrepancia:** Cumplimiento proponía medir "sin impuesto, en el periodo contratado"; se mantiene **con impuesto** (S-14) para todos, porque es lo que se paga; el presupuesto sigue midiendo costo sin impuesto, que es otra cosa.
- **Qué cambia:** núcleo RN-017, RF-OC-026, S-14/S-16; `proveedores-contratos`, `licencias-software`, `presupuesto-costos`, `gestion-cambios`, `gestion-problemas`, `mesa-de-ayuda`, `entregas-devoluciones`, `lineas-moviles`, `dominios-certificados`.

### D-044 · Dinero y costos: un libro, una fuente, un redondeo y un solo contrato
- **Pregunta:** El costo vive en siete lugares y cada módulo calcula el "costo mensual equivalente" a su manera. ¿Cómo se evita contar dos veces?
- **Decisión:**
  1. **Tipos compartidos** en el código: `Dinero` (decimal con moneda) y `ObligacionRecurrente` (importe sin impuesto, % de impuesto, moneda, periodicidad, inicio, fin, centro de costo, `fuente_costo`). **Una sola función** de costo mensual equivalente.
  2. **El módulo de presupuesto (PRE) posee el único libro de costos**: un trabajo diario idempotente convierte cada obligación en filas del libro (registro no editable, clave de origen única).
  3. **Regla de fuente única**, con el campo común `fuente_costo` ∈ {propia, orden de compra, contrato}: **orden de compra > contrato de proveedor > registro propio del módulo**. El libro solo toma el costo propio si no hay otra fuente.
  4. **Contrato único:** el contrato de licencia es una **extensión 1 a 1 del contrato de proveedor** (reutiliza fechas, costo, renovación y avisos; agrega tipo y puestos). Desaparece el prefijo `CLI`; todo contrato es `CTR-`.
  5. **Responsable** en todos los módulos: una **Persona** (con vínculo opcional a membresía). Los avisos se resuelven persona, luego membresía, luego correo, y si no hay, al grupo.
  6. **Puestos de licencia:** número **guardado al confirmar el contrato** (no una suma sobre JSON), `puestos_asignados` con `CHECK (<= puestos)` actualizado en la misma transacción bloqueando la fila del contrato, único `(contrato, persona)` abierto, y el campo de unidad "puestos" no se edita mientras el contrato esté vigente. En un SKU por cantidad de la categoría Licencias, **el contrato es la fuente** y el stock no se mueve.
  7. **Redondeo (regla escrita en el documento):** precio unitario con 4 decimales; subtotal de línea = cantidad por precio, redondeado a los decimales de la moneda (mitad hacia arriba); impuesto por línea redondeado igual; total de la orden = suma de las líneas, guardado y no recalculado. El costo del activo guarda el subtotal sin impuesto dividido por la cantidad, con 4 decimales. Tres ejemplos con resultado en el documento sirven de pruebas.
  8. **Monedas** en una tabla global (ISO 4217, con sus decimales); la moneda es clave foránea. `pais`, `zona_horaria` y moneda base son datos de la empresa desde la Etapa 1. **No se puede cambiar la moneda base** de una empresa con órdenes abiertas ni presupuestos aprobados.
  9. **Costo del activo:** se puede corregir (activos del Excel) con `activos.corregir_costo` (sensible, motivo, auditoría); la plantilla de importación incluye costo, moneda, fecha de compra, fin de garantía y centro de costo. La **depreciación se calcula al leer** y se guarda solo al cerrar el mes.
  10. **Orden de servicio:** antes de la Etapa 6 se agregan costo real, moneda, proveedor, centro de costo, "cubierta por garantía" y vínculo 1 a 1 con mantenimiento (D-027).
- **Motivo:** Sin un patrón común el doble conteo se descubrirá con datos reales. Se adopta el orden de precedencia del Ingeniero de Datos (orden de compra, contrato, propio) porque el contrato es el compromiso financiero más amplio.
- **Recomendó:** Arquitecto (H-ARQ-08), Ingeniero de Datos (H-DAT-06, 07, 08, 13, 19), QA (H-QA-16), Auditor Técnico (H-AUD-14, 16). **Discrepancia:** el Arquitecto ponía "registro del módulo" antes que "contrato"; gana Datos.
- **Qué cambia:** núcleo RF-OC-005/006/017, RF-INV-001, D-014; `presupuesto-costos`, `proveedores-contratos`, `licencias-software`, `lineas-moviles`, `dominios-certificados`, `garantias-mantenimiento`.

### D-045 · "Naturaleza" de la categoría: equipo físico, licencia o servicio
- **Pregunta:** Una licencia por serie hereda garantía, mantenimiento, depreciación y un elemento de CMDB de equipo físico. ¿Cómo se evita?
- **Decisión:** Cada categoría tiene un atributo **naturaleza** con tres valores, fijo al crearla y heredado por sus subcategorías, SKU y activos: **equipo físico** (por defecto: garantía, mantenimiento, depreciación, "activos vigentes" y elemento de CMDB "Activo"), **licencia** (la trata el módulo de licencias; no recibe garantía, mantenimiento ni depreciación; su elemento de CMDB es el contrato) y **servicio** (suscripciones o servicios sin unidad física ni puestos; sin garantía ni depreciación). No se cambia con existencias. Entra en la Etapa 2.
- **Motivo:** Cuenta como "activo vigente" lo que no lo es y falsea tableros y costos (H-ARQ-06).
- **Recomendó:** Arquitecto (H-ARQ-06); el valor "servicio" lo suma el Gerente de TI para dominios, hospedajes y suscripciones sin puestos.
- **Qué cambia:** núcleo RF-CAT (nuevo atributo), glosario "Activo"; `garantias-mantenimiento`, `cmdb-ligera`, `presupuesto-costos`, `reportes-tableros` aplican solo a "equipo físico".

### D-046 · La empresa activa va en la dirección de la página
- **Pregunta:** Con dos pestañas en dos empresas, una acción puede guardarse en la empresa equivocada si la empresa solo vive en la sesión.
- **Decisión:** La empresa va **en la dirección** (`/e/{empresa}/...`) y en cada petición de acción o de API. El servidor la compara con la membresía en **cada petición** y fija el contexto de base de datos con ella. La sesión solo recuerda "la última usada". **Cambiar de empresa es navegar a otra dirección**; la pantalla anuncia "Ahora trabaja en: [Empresa]". Los enlaces de los correos llevan la empresa; si la persona no es miembro, responde "no encontrado". El contador de no leídas de otras empresas sale de una tabla resumen por usuario, nunca de recorrer empresas en una consulta.
- **Motivo:** Es el punto del sistema donde el aislamiento se relaja a propósito (riesgo #11).
- **Recomendó:** Arquitecto (H-ARQ-04), Seguridad (RS-07), QA (H-QA-18), Diseñador.
- **Qué cambia:** núcleo RF-ACC-012, CA-004; `notificaciones` RF-NOT-006 y RN-NOT-020.

### D-047 · Webhooks y claves de API
- **Pregunta:** El webhook guarda solo una "huella" de su secreto, pero firmar exige conocerlo; y un webhook puede apuntar a la red interna.
- **Decisión:**
  1. El **secreto del webhook se guarda cifrado** (clave derivada por empresa, D-048), se muestra una sola vez y se puede rotar con traslape. Las **claves de API sí se guardan como huella** (alta entropía, al menos 128 bits) y cada clave tiene un **identificador público propio** (el prefijo común no sirve para bloquear una clave concreta). La clave viaja solo en una cabecera. Revisar el alcance de una clave cuando el creador cambia de rol; clave de un creador inactivo pasa a "en revisión" y se suspende a los 7 días si nadie la asume.
  2. **Anti-SSRF (diseño obligatorio, lo revisa Seguridad antes de INT-2):** validar al registrar **y al enviar**; resolver el DNS en el envío y fijar la dirección; bloquear loopback, redes privadas, 169.254.x.x e IPv6 equivalentes; solo puerto 443; **no seguir redirecciones**; tope de tiempo y de tamaño; no mostrar el cuerpo de la respuesta (solo código y duración); envío desde un **componente aislado** sin acceso a la red interna ni a secretos más que el de firma; pruebas con nombres que resuelven a direcciones internas y con redirecciones.
  3. La API usa los mismos validadores, permisos y servicios que la pantalla; escribe solo lo permitido por S-INT-04 y **nunca** crea o cambia proveedores ni desactiva Personas.
- **Motivo:** Una huella no sirve para firmar (error de diseño); y el servidor no debe poder usarse para leer servicios internos.
- **Recomendó:** Seguridad (H-SEG-03, 05, 25), Arquitecto (H-ARQ-05, 20), Cumplimiento (H-CUM-14).
- **Qué cambia:** `integraciones-api` §6, RN-INT-002/017/022/023, CA-INT-12.

### D-048 · Segunda verificación atada a permisos, llaves de cifrado y control dual de la plataforma
- **Pregunta:** ¿Qué usuarios llevan segunda verificación, cómo se recuperan, dónde viven las llaves y cómo se controla al Administrador de plataforma?
- **Decisión:**
  1. **Segunda verificación (aplicación autenticadora, sin SMS) obligatoria a cualquier membresía que tenga algún permiso sensible** del registro, no según el nombre del rol (los roles son editables). "Administrador activo" = quien tiene administrar roles y usuarios; el último no se puede quitar aunque cambie de rol.
  2. **Reautenticación reciente (10 minutos, enlace nuevo o segundo factor)** para: ver clave de licencia, exportar, importar, administrar roles y usuarios, activar excepciones, cambiar titular de dominio y crear claves de API.
  3. **Recuperación:** 10 códigos de un solo uso, mostrados una vez; la reposición la hace otro administrador; si el único administrador pierde factor y códigos, rescate (punto 6).
  4. **Llaves:** una **llave maestra fuera de la base y de los respaldos** (gestor de secretos); llaves **derivadas por empresa** (claves de licencia, secretos de webhook) y **por usuario** (semilla de la segunda verificación, porque la cuenta es global); cifrado con versiones, rotación anual y ante sospecha, con recifrado por lotes. **Respaldo de las llaves por separado, en dos lugares, con al menos dos custodios**; una restauración de ensayo comprueba que la llave guardada abre la copia. Ningún secreto en el repositorio, en JSON de campos, en registros técnicos, auditoría ni exportaciones; una prueba automática lo busca.
  5. **Control dual del Administrador de plataforma:** (a) **rescate** de una empresa con **dos personas** de plataforma; si solo hay una, confirmación por otro medio con el **contacto autorizado** que la empresa registró al crearse; espera de 24 horas salvo emergencia declarada por ambas; aviso por correo a todos los usuarios activos y administradores; evidencia guardada. (b) **Soporte:** solo lectura, una empresa y un motivo por vez, máximo 24 horas (S-04), autorizado por la empresa, con banner "sesión de soporte" y entradas visibles en la **auditoría de la propia empresa**. (c) Cuentas de plataforma con **llave de seguridad física**, acceso desde red restringida (DevOps) y códigos de recuperación fuera de línea con dos custodios. (d) Dos registros: **de plataforma** (crear, suspender, rescatar) y **de empresa** (todo lo que soporte vio o hizo).
  6. **Acceso de emergencia si el correo falla:** el Administrador de plataforma puede emitir un acceso excepcional de un solo uso a un administrador de empresa, **tras verificar su identidad por otro medio**, con segunda verificación aún exigida y todo auditado (propuesto por DevOps, 6.4; Seguridad aprueba el diseño). No se agregan contraseñas.
- **Motivo:** Sin esto la cuenta de plataforma es el camino más corto a una fuga entre empresas, y el cifrado quedaría junto a los datos que protege.
- **Recomendó:** Seguridad (H-SEG-01, 03, 06), Arquitecto (H-ARQ-05), Cumplimiento (H-CUM-16), DevOps (plan, 5 y 6.4), Ingeniero de Datos (H-DAT-05).
- **Qué cambia:** núcleo RF-ACC-013/019, RF-ROL-002/008, RF-PLA-001 a 005; nueva sección "Gestión de secretos". **Costo menor:** llaves físicas y gestor de secretos (ver D2).

### D-049 · Prefijos de identificadores, vocabulario y estados
- **Pregunta:** Los prefijos chocan (`D-` decisión y devolución; `P-` pendiente, pantalla y Persona; `E-` escalado y acta; `REC-` reclamo y recepción) y "baja", "anular", "cancelar" significan cosas distintas en cada módulo.
- **Decisión:**
  1. **Requisitos:** `RF-<MÓD>-NNN`, un código de módulo propio. El módulo de Personas pasa de `RF-PER` a **`RF-PRS`** (el núcleo conserva `RF-PER-001` a 010). Los módulos usan la etapa o la fase y el criterio que cubre en cada requisito.
  2. **Documentos de negocio** (ancho mínimo 6 dígitos): `OC-`, `OS-`, `RCP-` (recepción), `RCL-` (reclamo de garantía), `MNT-`, `CTR-`, `AYU-`, `CAM-`, `PRB-`, `KB-`, `EC-`, `ACT-E-` y `ACT-D-` (actas de entrega y devolución). SKU: prefijo de categoría con mínimo 4 dígitos (D-007). **Persona: `PRS-` con mínimo 4 dígitos** (la anonimización dice "Persona anonimizada 0042"). Se elimina `CLI-`.
  3. **Prefijos reservados** que una categoría no puede usar: `OC, OS, RCP, RCL, MNT, CTR, AYU, CAM, PRB, KB, EC, ACT, PRS, PAN`.
  4. **Otros:** pantallas `PAN-<MÓD>-nn`; supuestos de cambios y problemas `S-CAM-nn` y `S-PRB-nn`; escalados `E-<MÓD>-nn` (sin choque ahora que las actas cambian); pendientes `P-NNN`; decisiones `D-NNN`. Un **registro de prefijos** va en el documento y en `docs/trazabilidad.md`.
  5. **Vocabulario del ciclo de vida** (el del Diseñador, 4.4, aprobado): Activar/Desactivar (listas), Suspender/Reactivar (accesos y servicios), Dar de baja (activo, línea, dominio, certificado, usuario), **Cesar** (Persona), Anular (documento ya emitido), Cancelar (trabajo en curso), Terminar (contrato), Cerrar (trabajo concluido), Aprobar/Rechazar. **Persona:** Activa, Cesada, Anonimizada. **Usuario:** Invitado, Activo, Suspendido, Dado de baja. Los contratos de proveedor y de licencia usan los mismos estados: Borrador, Programado, Vigente, Vencido, Terminado, Anulado.
  6. **Quien pide:** el campo se llama **"Pedido por"** en orden de compra, orden de servicio, caso y cambio; "Solicitante" queda solo como nombre de rol. La "solicitud de servicio" del núcleo pasa a **"solicitud de trabajo"** (OS en Creada); en la mesa de ayuda el tipo se llama "Pedido de servicio" y su sujeto "Persona atendida".
  7. **Compromiso de servicio del proveedor** reemplaza a "SLA" en proveedores; el SLA queda para los plazos internos de la mesa de ayuda.
  8. **Formato de número:** el formato de cada empresa se toma del país (P-004); mientras no se sepa se usa la configuración regional del navegador. Fecha día/mes/año. Siempre el código de moneda junto al importe y nunca un total general entre monedas.
- **Motivo:** Sin un registro de prefijos y un vocabulario único, la trazabilidad (D-026) y las pruebas no se pueden automatizar.
- **Recomendó:** Auditor Técnico (H-AUD-03, 10, 11, 22), Diseñador (H-UX-07, 16, 24), Ingeniero de Datos (H-DAT-10, 25), QA (H-QA-19, 22).
- **Qué cambia:** núcleo (glosario, §26, §27); renumeración del módulo de Personas; `entregas-devoluciones`, `garantias-mantenimiento`, `licencias-software`, `mesa-de-ayuda`, `gestion-cambios`, `gestion-problemas`, `presupuesto-costos`, `integraciones-api`.

### D-050 · Importación: un solo marco, claves de no duplicación y "deshacer"
- **Pregunta:** ¿Qué significa "no duplicar" al volver a subir, qué es "deshacer" y cómo se concilia con "todo o nada"? Hoy hay ocho importaciones distintas.
- **Decisión:**
  1. **Un solo marco** (plantilla declarativa por entidad, tablas `importacion_lote`, `importacion_fila` y `lote_registro`) y **un solo asistente "Importar datos"** con selector de tipo (SKU, catálogos, Personas, activos, stock, contratos de licencia, líneas, dominios, servicios de CMDB, maestros de SAP). La ejecución corre en el trabajador (D-038) con avance. Los pasos respetan un **orden de dependencias**: catálogos, Personas, SKU, activos, saldos. SKU y valores desconocidos (marcas, ubicaciones) **no se crean solos**: se listan para aprobarlos en bloque.
  2. **Todo o nada por lote** (D-020.3 se mantiene). **La importación solo crea; no actualiza.**
  3. **Qué significa "no duplicar":** un **archivo ya confirmado** (huella SHA-256 por empresa, lote confirmado y no deshecho) se rechaza entero con "este archivo ya se importó el [fecha] en el lote N". Un **archivo corregido** es otro archivo: sus filas se validan contra la base y una fila que ya existe por su clave natural es un **error de esa fila** ("ya existe"); como el lote anterior no cargó nada, las 100 filas corregidas entran.
  4. **Claves naturales:** activo = SKU + serie normalizada; stock = un solo "saldo inicial" por SKU + ubicación; Persona = **código de empleado o correo** normalizado (la importación exige uno de los dos; la alta manual puede crear homónimos con aviso); línea = número; dominio = nombre normalizado; proveedor = identificación fiscal; SKU = código.
  5. **Deshacer = anular, nunca borrar:** las filas pasan a un estado final **"Anulado por lote deshecho"** con motivo, salen de los conteos y de las reglas de unicidad (índice parcial) y conservan su historial. Solo se puede si **ninguna** fila del lote tiene un movimiento posterior (cualquier movimiento, asignación, corrección de costo o referencia desde otro documento; medido con una **secuencia creciente** por empresa, no con la hora). Si hay uno, no se deshace nada.
  6. **El archivo original no se guarda** (reemplaza D-020.8 y RF-IMP-012): se lee, se guardan las **filas ya validadas** en preparación (hasta confirmar o 7 días), la huella y el reporte de errores, y el archivo se descarta al terminar. Así no hay un archivo con datos personales por 30 días ni costo de almacenamiento (D-022). La copia de lotes SAP es dato guardado y sigue el plazo de la auditoría.
  7. **Formato:** fechas `dd/mm/aaaa` o número de serie de Excel (otro formato es error de fila). La plantilla incluye costo, moneda, fecha de compra, fin de garantía directo o meses, y centro de costo. Series dañadas por Excel (`3,5E+14`, ceros perdidos) se rechazan con aviso.
  8. **Seguridad de la lectura:** solo `.xlsx` y `.csv`, sin evaluar fórmulas ni entidades externas, con límite de tamaño descomprimido, de hojas, columnas y largo de celda, rechazo de macros, tiempo máximo y **una importación a la vez por empresa**. Las celdas **de texto** que empiezan con `=`, `+`, `-`, `@`, tabulador o retorno se tratan como texto; las numéricas siguen siendo números (los importes negativos no se rompen). La empresa sale de la sesión, nunca del archivo.
  9. **Topes** (D-054): 5.000 filas y 10 MB por archivo, 10 importaciones por día por empresa en total entre módulos. Para la **carga inicial** (Excel real, P-007) la plataforma puede subir el tope de una empresa por un periodo corto.
  10. **Auditoría del lote:** una entrada de lote más el detalle en su propia tabla (no 100.000 entradas sueltas).
  11. **Invitaciones masivas** del portal: por persona, no todo o nada (DS-08), y la pantalla lo dice.
- **Motivo:** Concilia el pedido de QA (que se pueda cargar un Excel sucio) con el de Datos (que no queden cargas parciales) y elimina la contradicción entre "todo o nada" y "no duplicar".
- **Recomendó:** Ingeniero de Datos (H-DAT-11), QA (H-QA-04), Seguridad (H-SEG-13, 18), Arquitecto (H-ARQ-14), Diseñador (H-UX-10).
- **Qué cambia:** núcleo RF-IMP-001 a 014 y CA-038/039; los siete módulos con importación propia usan el marco.

### D-051 · Excepción declarada: el nombre copiado en el acta de entrega
- **Pregunta:** D-030.1 dice que los datos personales viven solo en Persona y Usuario, pero el acta de entrega guarda una copia de nombre y área. ¿Se acepta?
- **Decisión:** **Sí, como excepción declarada**, porque el acta es la constancia de lo que se firmó y una reimpresión debe mostrarlo. Condiciones: (1) la copia vive en **columnas propias del acta** con una fecha `retener_hasta` (activo más 5 años, D-033); (2) no se escribe en la auditoría; (3) la función de anonimización limpia la copia cuando `retener_hasta` vence, de modo que cualquiera de las dos políticas que decida legal se aplica sin rehacer la tabla; (4) se declara en la tabla de datos personales y en el aviso de privacidad. Se corrigen S-PER-06 y CA-ENT-13, que decían que la anonimización alcanza el acta de inmediato. La alternativa del Auditor Técnico (el acta guarda solo el identificador y el nombre se resuelve al imprimir) se descarta porque destruiría la prueba de lo firmado.
- **[ESCALAR AL CEO]** — **legal e irreversible:** si legal responde que hay que anonimizar también el nombre del acta antes del plazo (L-05, L-12), se aplica sobre lo existente y no se puede deshacer. Mientras no responda, rige la regla provisional de D-033.
- **Recomendó:** Cumplimiento (H-CUM-08), Ingeniero de Datos (H-DAT-02), Auditor Técnico (H-AUD-02, opción descartada), QA (H-QA-05).
- **Qué cambia:** `personas-ubicaciones` S-PER-06, RN-PER-021; `entregas-devoluciones` RN-ENT-006 y CA-ENT-13; núcleo §18.

### D-052 · Restauración, copia externa de la auditoría y registro de anonimizaciones
- **Pregunta:** ¿Qué pasa al restaurar un respaldo y cómo se detecta que alguien con poder total alteró la auditoría?
- **Decisión:** (completa D-029, D-030.5 y D-032.3)
  1. **Respaldo en dos capas:** el del proveedor de la base (recuperación a un punto en el tiempo si el plan lo ofrece) y uno propio, cifrado antes de salir, **diario** y uno extra antes de cada publicación con migración, guardado en **otro proveedor y otra cuenta**. Retención 30 diarios y 12 mensuales (D-032). **Objetivos provisionales:** pérdida máxima aceptable 24 horas (menos si el plan lo permite) y tiempo de recuperación 4 horas en horario laboral.
  2. **Copia externa de la auditoría**, solo de agregar, **inmutable** (de una sola escritura) y **encadenada** (cada archivo lleva la huella del anterior), cada hora, con **verificación semanal** (alerta inmediata si no coincide). El trabajo que copia solo lee la auditoría y solo agrega al almacenamiento externo; quien administra la base no tiene borrado sobre la copia. Reduce, no elimina, el riesgo del superusuario: lo hace **detectable**. El modo de bloqueo (estricto o con borrado bajo orden legal) lo decide Cumplimiento con legal.
  3. **Registro de anonimizaciones** (solo identificador y fecha) en un **almacén propio, fuera de la base que se restaura**, sin rotación y replicado, para que sobreviva a una pérdida total.
  4. **Al restaurar y antes de abrir el sistema:** reaplicar las anonimizaciones; **revocar todas las sesiones y enlaces**, rotar las claves de API y **reaplicar suspensiones, bajas y cambios de rol posteriores** al respaldo (desde la auditoría, que vive aparte). La prueba de restauración (CA-053) incluye todo esto y que la prueba de aislamiento pasa sobre la base restaurada.
  5. **Restaurar una sola empresa:** herramienta de **exportar/importar una empresa** (recorre el catálogo y mueve las filas por empresa), sin la cual una restauración completa borraría el trabajo de las demás. Datos y DevOps la entregan antes de la primera empresa real; hasta entonces, el plan de emergencia es restaurar completo con aprobación del CEO.
  6. Calendario de restauraciones de ensayo: antes de la Etapa 1, antes de cada etapa que pase a uso real, y una vez al mes en producción.
- **Motivo:** Un respaldo que nunca se restauró no es un respaldo; y una restauración puede revivir accesos ya revocados.
- **Recomendó:** DevOps (plan, 4), Arquitecto (H-ARQ-03, 25), Seguridad (H-SEG-22), Cumplimiento (H-CUM-04), Ingeniero de Datos (H-DAT-02).
- **Qué cambia:** núcleo RF-DAT-005, RNF-014, CA-053; D-029. **Costo:** almacenamiento externo con bloqueo (ver D2).

### D-053 · Diseño: un botón "Pedir ayuda" y las 12 decisiones DS-01 a DS-12
- **Pregunta:** El Diseñador pidió confirmar S-31 y 12 decisiones de sistema de diseño (DS-01 a DS-12).
- **Decisión:**

| ID | Decisión | Resultado |
|---|---|---|
| DS-01 | Un solo botón **"Pedir ayuda"** (S-31): en la v1 crea la orden de servicio en estado Creada; en la fase 2 abre el catálogo de casos y el técnico crea la orden desde el caso | **Confirmado** |
| DS-02 | Qué matriz manda cuando núcleo y módulo no coinciden | **Manda el núcleo**; los módulos agregan filas; las diferencias se resuelven en D-037 |
| DS-03 | Vocabulario del ciclo de vida (4.4) | **Aprobado** (D-049) |
| DS-04 | Siete familias de color con texto e icono (4.1), etiqueta calculada con borde y reloj | **Aprobado** |
| DS-05 | Verbo único **"Aprobar"** y una sola bandeja "Por aprobar" con pestañas por tipo | **Aprobado**. "Publicar" queda solo para textos |
| DS-06 | Prototipo en dos niveles: 26 pantallas A y 18 B | **Aprobado**; las fases 2 y 3 se muestran al CEO como muestras |
| DS-07 | Una sola pantalla de Vencimientos, una de Importar datos, un solo "Mi espacio", y la configuración de avisos solo en Notificaciones | **Aprobado** |
| DS-08 | Invitaciones masivas: por persona, no todo o nada | **Por persona** (D-050) |
| DS-09 | Tono "usted" en toda la plataforma, portal y correos | **Aprobado** |
| DS-10 | Almacén puede dar de alta una Persona al entregar | **No** (D-037 fila 8) |
| DS-11 | Lista "campo / oficina" para celular: buscar, ficha, entregar y devolver, recibir y capturar series, aprobar, mantenimiento y casos propios; roles, presupuesto, importación y configuración se ven en celular pero se editan en pantalla grande | **Aprobado**; QA prueba a 360 px |
| DS-12 | Tabla única de prefijos | **Aprobado** (D-049) |

  Se aprueban también: el **mapa de navegación** por perfil (8 grupos de menú, 8 perfiles; un módulo apagado o sin permiso no aparece; el portal con estructura propia; consola de plataforma con otro color); el **Inicio como página de tarjetas** que cada módulo aporta, con una tarjeta principal por rol y un máximo de seis visibles, y una sola bandeja **"Mi trabajo"** para el Técnico; la **ficha del activo con cabecera fija y 7 pestañas** condicionales; el **catálogo de 3 mensajes y 3 bloqueos** ("No encontrado", "No tiene permiso", "No se puede por una regla"; botón ausente, desactivado con la razón escrita o mensaje por dirección directa); **tres formas de dato oculto** (referencia, secreto enmascarado, columna omitida con aviso); el **diálogo de motivo único**; **Exportar visible y desactivado con la razón** si falta el permiso; **un solo asistente "Entregar" y un solo diálogo "Cambiar estado"** que reutilizan entregas, garantías y órdenes de servicio; las **pantallas que nadie había listado** (Primeros pasos, módulos activos, Mi cuenta y seguridad, autorizar soporte, aviso de privacidad y segunda verificación del primer ingreso, consola de plataforma, Mis permisos); **aviso a los 25 minutos** de la sesión y **borradores automáticos** en recepción, orden de compra, entrega e importación; buscador global agrupado por tipo; objetivos táctiles de 44 px y WCAG AA.
- **Motivo:** Las decisiones dejan de ser 17 diseños distintos y el CEO puede aprobar el aspecto una sola vez.
- **Recomendó:** Diseñador (H-UX-01 a 25), con ajustes de Seguridad (mensajes) y de este Gerente (DS-10).
- **Qué cambia:** núcleo (glosario, RNF-004/007/008, nueva sección de pantallas), prototipo de la Etapa 0, y el glosario de mesa de ayuda y portal ("Pedir ayuda").

### D-054 · Eventos de seguridad, topes de abuso y endurecimiento del acceso
- **Pregunta:** Los topes están repartidos y no coinciden; los intentos rechazados no dicen en qué auditoría van; el enlace de ingreso se gasta si un filtro de correo lo abre.
- **Decisión:**
  1. **Eventos de seguridad aparte de la auditoría de negocio:** los intentos rechazados por empresa ajena, los accesos fallidos y los inicios de sesión fallidos van a una **tabla separada**, escrita en una **transacción independiente** (el rechazo no la revierte), con la **empresa del actor** (nunca la del objeto ajeno), sin datos del objeto, con tope de ritmo y agrupación por minuto. Plazo 12 meses (propuesta, D-030.7). Los ve la empresa del actor y la plataforma.
  2. **Cuadro único de topes** (limitador en tablas de PostgreSQL; Redis solo si se mide la necesidad y entonces se escala por costo): enlaces de ingreso 5 por correo por hora, 10 por día, 20 por IP por hora; **5 intentos fallidos y espera de 1, 2, 5 y 15 minutos**; invitaciones 20 por administrador por hora y **100 por empresa por día** (la plataforma lo sube por empresa para una campaña del portal); importaciones 10 por día por empresa en total, 5.000 filas, 10 MB, una a la vez; exportaciones 10 por usuario por hora, 100 por empresa por día, 50.000 filas; lectura masiva por API (más de 5.000 filas por día por clave) tratada y auditada como exportación; revelar clave de licencia 20 por usuario por hora; correos 1.000 por día por empresa con **cupo propio para los obligatorios** y para `compras.orden_por_aprobar`.
  3. **Enlace de ingreso:** abre una página con el botón **"Entrar"** que envía el formulario, y queda **atado al navegador que lo pidió**, para que un filtro de correo no lo gaste. El tope por correo no bloquea al dueño que ya tiene un enlace válido. Tiempos de respuesta iguales exista o no el correo; **no se envía nada a correos sin cuenta ni invitación**.
  4. **Invitaciones:** texto fijo sin campos libres; nunca dicen si el correo ya tiene cuenta; la empresa se suma a la cuenta solo cuando la persona abre y acepta; se avisa al usuario cuando se le suma una empresa. DevOps configura SPF, DKIM y DMARC (DMARC por pasos) en un subdominio de envío.
  5. **Ingreso con Microsoft o Google (INT-3):** se vincula una sola vez por el **identificador inmutable del proveedor**, no por el correo, a partir de una sesión ya iniciada o una invitación; los administradores conservan el enlace de correo y la segunda verificación.
  6. **Correos:** se normalizan con comparación Unicode, sin quitar puntos ni etiquetas `+`.
- **Motivo:** Evita abuso y costos de correo sin dejar topes sueltos que no cuadran entre módulos.
- **Recomendó:** Seguridad (H-SEG-11, 14, 15, 20, 24; tabla de topes de su sección 5), QA (H-QA-06, 14), Arquitecto (H-ARQ-20, 21).
- **Qué cambia:** núcleo RF-ACC-006/017, RF-AUD-005/010, CA-002/006; `notificaciones` RN-NOT-008 a 011; `portal-autoservicio` RN-POR-016, S-POR-06.

### D-055 · Las 14 decisiones técnicas T-1 a T-14 y el prototipo ampliado a 3 o 4 días
- **Pregunta:** El Arquitecto pide aprobar T-1 a T-14 antes de la Etapa 1.
- **Decisión:**

| # | Decisión técnica | Resultado |
|---|---|---|
| T-1 | Servidor de ejecución continua + proceso trabajador + PostgreSQL gestionado con agrupador de conexiones en modo transacción | **Aprobado** (D-038). El alojamiento concreto lo propone DevOps con precios verificados antes del prototipo; no se asume Vercel. Costo dentro de D2 |
| T-2 | Cola de trabajos en PostgreSQL y bus de eventos único | **Aprobado** (D-038); la librería se elige en el prototipo |
| T-3 | Contexto de empresa en la dirección, `set_config` por transacción, lista de tablas globales, roles de base, funciones SECURITY DEFINER | **Aprobado** (D-039, D-046) |
| T-4 | Convenciones del esquema: identificadores UUID v7; empresa, clave compuesta y seguridad por fila con macro; normalización con columnas generadas; dinero decimal(19,4) y porcentajes decimal(7,4); `date` para fechas de calendario y `timestamptz` en hora universal; columna `version` en toda entidad editable; borrado físico solo en borradores sin hijos; estados con CHECK y tabla de transiciones comprobada por una función; relaciones "una abierta a la vez" con `desde`/`hasta` e índice único parcial. Extensiones `citext`, `unaccent`, `pg_trgm`, `btree_gist`, `pgcrypto` si el proveedor las admite (DevOps confirma) | **Aprobado** |
| T-5 | Gestión de secretos y llaves | **Aprobado** (D-048) |
| T-6 | Acceso: Auth.js con **sesiones en base** (revocación inmediata y atadas a empresa y rol vigente), segunda verificación propia, enlace con botón atado al navegador, "verificación reciente". Si Auth.js estorba, se usa solo como capa de proveedores | **Aprobado** (D-048, D-054). Entra en el prototipo |
| T-7 | Catálogo de permisos (formato, sensibles, un `datos.exportar` y un `datos.importar`, alcance con resolvedor, módulos activables) | **Aprobado** (D-036) |
| T-8 | Auditoría: tres tipos de autor, **partición mensual**, rol `mantenimiento` para el archivado a los 5 años (única excepción documentada a "solo se agrega", fuera de la aplicación y con dos personas), índices (empresa, entidad, id, fecha) y (empresa, fecha), las lecturas auditadas pasan por una ruta de escritura aparte, un lote es una entrada con detalle en su tabla, libro de anonimizaciones fuera de la base | **Aprobado** (D-030, D-041, D-052) |
| T-9 | Servicio de doble control y una sola excepción | **Aprobado** (D-043) |
| T-10 | Estructura de carpetas, capa de servicios como único punto de reglas de negocio, registro de módulo y prueba de dependencias | **Aprobado** (D-038) |
| T-11 | Contadores: tabla `contador(empresa, clave, ultimo)` con clave con espacio de nombres (`sku:LAP`, `doc:OC`) y función `siguiente(empresa, clave, n)` que reserva `n` números en una **transacción corta y propia** (un salto es aceptable, D-007); la clave del SKU es el prefijo. **Guía de patrones de concurrencia obligatorios:** índice único parcial para "uno vigente"; actualización condicional con el estado esperado; capacidad con `UPDATE ... WHERE usados < total` y CHECK; clave de idempotencia en toda operación confirmada o recibida por API; columna `version`. QA escribe una prueba de concurrencia por patrón contra PostgreSQL real | **Aprobado** |
| T-12 | Limitador de tasa en base, proveedor de correo con **una sola capa de envío y adaptador intercambiable** (segundo proveedor configurado), volúmenes | **Aprobado** (D-054). Costo del correo ya escalado (D1) |
| T-13 | Un solo marco de campos personalizados (ámbito SKU, unidad o servicio de ayuda; mismas reglas de D-005; valores en JSON validado; resultado "completo/incompleto" guardado al escribir; índices solo en campos "filtrables") y un solo marco de importación | **Aprobado** (D-035, D-050) |
| T-14 | Observabilidad: registros técnicos sin datos personales ni secretos (filtro antes de enviar), alertas a una persona con nombre | **Aprobado** (DevOps, sección 7) |

- **Prototipo técnico previo a la Etapa 1: de 1-2 a 3-4 días**, corrido sobre el **proveedor de base candidato y con su agrupador de conexiones**, con `app_empresa`. Debe probar: (1) los siete criterios de aislamiento de QA (consulta sin filtro = 0 filas ajenas; insertar con empresa ajena falla; clave foránea cruzada falla; UPDATE y DELETE ajenos afectan 0; 50 peticiones intercaladas sobre un grupo compartido sin que la empresa quede pegada; conexión limpia tras error; el rol de la aplicación no puede modificar la auditoría), (2) tabla particionada, índice parcial, consulta recursiva, actualización condicional, funciones SECURITY DEFINER y los cinco roles, (3) sesiones en base, enlace con botón atado al navegador, segunda verificación propia y bloqueo por intentos, (4) la cola y el trabajador, (5) 20 y 50 conexiones simultáneas para contadores. **Si algo falla**, el Arquitecto vuelve a mesa con alternativa.
- **Motivo:** Son las piezas comunes que evitan 17 diseños distintos (veredicto del Arquitecto).
- **Recomendó:** Arquitecto (T-1 a T-14, H-ARQ-13), QA (criterios del prototipo), Ingeniero de Datos (H-DAT-14, 18, 19, 22, 23), DevOps (elección de proveedor antes del prototipo).
- **Qué cambia:** ADR en `docs/arquitectura/` (uno por T); riesgo #18 (3 a 4 días).

### D-056 · Orden de construcción y fase de cada módulo
- **Pregunta:** ¿Cuándo se construye cada módulo y qué se prepara en el núcleo?
- **Decisión:**
  1. **Núcleo (v1), Etapas 0 a 7** como están en D-023, con las precisiones: Etapa 1 recibe además la cola de trabajos y el bus de eventos, NOT-base, la gestión de secretos, los roles de base, la consola de plataforma, contadores genéricos, calendario de empresa, país, zona horaria y moneda base de la empresa, `modulo_activo` y el esqueleto del marco de campos y del de importación; Etapa 2 recibe ubicación con superior, proveedor ampliado (PRV-A), centro de costo con responsable, Personas con datos aparte, categorías con naturaleza y el motor de campos con tipo secreto e identificador; Etapa 3 recibe el stock mínimo opcional; Etapa 4 recibe inventario, actas (ENT-A), importación, cifrado de claves, pendientes de la persona (registro de módulo), costo del activo corregible y la tabla de garantía (GAR-A); Etapa 5, el doble control, aprobaciones, avisos de aprobación, referencia externa y centro de costo en la orden; Etapa 6, órdenes de servicio con costo; Etapa 7, pulido y salida (la prueba de carga corre ya desde la Etapa 4 en integración nocturna).
  2. **Nada fuera de la v1 se construye antes de que el CEO apruebe la Etapa 7**, salvo decisión del Gerente de TI (riesgo #7). El **diseño** de las preparaciones sí se hace desde la Etapa 1.
  3. **Fases y olas después de la Etapa 7** (por dependencias, no por gusto; la tabla maestra de alcance del documento usa la palabra **"Cuándo"** con tres valores: "v1, Etapa N", "Fase 2" o "Fase 3", y los módulos partidos tienen una fila por parte):

| Fase | Ola | Módulos | Depende de |
|---|---|---|---|
| Fase 2 | A | **NOT-completo** (motor de avisos por fecha, bandeja, preferencias) | Cola y bus de la Etapa 1 |
| Fase 2 | B | **DOM** (primero: no depende del inventario), **PRV-B** (contratos y compromiso de servicio), **LIC**, **LIN**, **GAR-B** (PRV-B antes que GAR-B) | NOT-completo, Personas (E2), Inventario (E4) |
| Fase 2 | C | **AYU** (mesa de ayuda), **ONB** (altas y bajas) | OS (E6), Personas, Inventario, ENT, NOT-completo |
| Fase 3 | D | **POR** (portal) | AYU, ENT, Personas |
| Fase 3 | E | **CMD** → **CAM** → **PRB** | Inventario, Personas; CAM necesita CMD; PRB necesita AYU, CMD y CAM |
| Fase 3 | F | **PRE-A**, **REP-A**, **INT-1** (solo piden el núcleo y pueden adelantarse a la ola B si el Gerente de TI lo decide), luego **PRE-B**, **REP-B/C**, **INT-2**, **INT-3** | PRE-B necesita PRV-B, LIC, LIN, DOM, GAR-B; REP-B necesita PRE; INT-2 necesita E5 y E6 |

  4. **ENT** se parte: **ENT-A** (asistente de entrega, acta imprimible, devolución, traspaso, extravío) es de la **v1, Etapa 4**; **ENT-B** (avisos de préstamo y acta sin firma, conformidad) es de la **Fase 2** con NOT-completo. **PRV-A** (proveedor y contactos) es Etapa 2/5; **GAR-A** (dato de garantía) Etapas 4 y 5; **NOT-base** es Etapa 1 y es **la misma fuente que RF-ACC-021**. **PER (Personas)** es Etapa 2.
  5. **Preparaciones del núcleo** (baratas hoy, migración con datos reales mañana): tipo de autor con tres valores; tipo de campo secreto y marca identificador; naturaleza de categoría; ubicación con superior; proveedor ampliado; centro de costo con responsable y código externo; área y tipo de puesto; Persona con datos aparte; costo y moneda del activo corregibles; stock mínimo; garantía como tabla; `modulo_activo`, bus de eventos, cola, contadores y calendario de empresa; marca `fuente_costo` en toda obligación de pago; país, zona horaria y monedas de referencia.
  6. Los módulos de las olas se activan **por empresa**; cada uno cumple el registro de módulo, el doble control único y el marco de costos antes de pasar a uso real.
- **Motivo:** Es el orden por dependencias que propone el Arquitecto; así CMD, CAM y PRB no salen "vacíos" (sin licencias, líneas ni dominios) y la v1 no se retrasa.
- **Recomendó:** Arquitecto (orden de construcción y preparaciones), Auditor Técnico (H-AUD-08), QA (H-QA-10), Diseñador (mapa de navegación). **Discrepancia:** el Diseñador marcaba algunas fases distintas (dominios y reportes en Fase 3); manda la dependencia técnica.
- **Qué cambia:** núcleo §2 y §27 (tabla maestra con "Cuándo"); el campo "Fase" de cada módulo (ver `plan-correcciones.md`).

### D-057 · Los 31 supuestos del núcleo (S-01 a S-31), uno por uno
- **Pregunta:** El Analista pide confirmar, cambiar o rechazar S-01 a S-31.
- **Decisión:**

| ID | Resultado | Precisión o cambio |
|---|---|---|
| S-01 | Confirmado | Enlace de 15 minutos de un solo uso; abre una página con botón "Entrar" y queda atado al navegador (D-054) |
| S-02 | Confirmado | 30 minutos de inactividad o 12 horas; aviso a los 25 minutos y borradores automáticos (D-053) |
| S-03 | **Cambiado** | Suspender es reversible. Dar de baja a un usuario siempre se permite y corta sus sesiones al instante; **se retira el bloqueo** por activos asignados. El bloqueo no es de la baja del usuario: ver D-034 y D-061 (cese de la Persona nunca se bloquea; se bloquea anonimizar) |
| S-04 | Confirmado | Soporte de solo lectura, una empresa y un motivo, máximo 24 horas, con banner y entradas visibles en la auditoría de la empresa (D-048) |
| S-05 | Confirmado | El cambio de rol vale desde la siguiente acción; un rol con usuarios no se elimina |
| S-06 | **Rechazado** | Las ubicaciones son jerárquicas hasta 3 niveles (D-040) |
| S-07 | Confirmado | Más una lista de prefijos reservados (D-049) |
| S-08 | Confirmado | Se amplía con una sección "Límites y formatos" (el Analista propone valores y los fija el Gerente de TI al revisar la v0.3: nombres de Persona, proveedor y ubicación, notas, número de orden, máximos numéricos de cantidad, precio y stock) |
| S-09 | Confirmado | |
| S-10 | Confirmado | El equipo compartido se asigna a una Persona custodio |
| S-11 | Confirmado | Retirar una orden Pendiente la devuelve a Borrador |
| S-12 | Confirmado | "Recibida total" dura un instante y se ve en el historial; QA prueba ambos cambios |
| S-13 | Confirmado | Más: revertir un ingreso por cantidad solo si ningún saldo queda negativo; revertir la recepción de una orden Cerrada a mano la reabre a Recibida parcial y anula el cierre (D-060) |
| S-14 | Confirmado | Total con impuesto, y vale para **todos** los actos de dinero (D-043) |
| S-15 | Confirmado | Con la precisión de D-037 fila 10 sobre quién completa los precios |
| S-16 | Confirmado | OS con costo se aprueba si supera el límite (RN-017) |
| S-17 | Confirmado | Tope **combinado** entre todos los módulos; subida temporal para la carga inicial (D-050, D-054) |
| S-18 | Confirmado | Columna `version` en toda entidad editable |
| S-19 | Confirmado | Prueba de carga en integración nocturna desde la Etapa 4; el volumen de referencia es **una sola cifra en RNF-010** que todos los módulos citan |
| S-20 | Confirmado | |
| S-21 | Confirmado | Fecha día/mes/año; el formato de número lo da el país o, mientras no se sepa (P-004), el navegador (D-049) |
| S-22 | Confirmado | Con las celdas resueltas en D-037 |
| S-23 | Confirmado | |
| S-24 | Confirmado | Columna simple; INT-2 migra a equivalencias |
| S-25 | Confirmado | Idem; responsable del centro de costo es una Persona |
| S-26 | Confirmado | Solo un dato en la v1 |
| S-27 | **Convertido en decisión** | Los módulos agregan filas, no celdas; plantilla "Empleado (portal)" aprobada (D-037 filas 11) |
| S-28 | **Cambiado** | Tres tipos de autor desde la Etapa 1: usuario (membresía), integración y **sistema** (D-041) |
| S-29 | Confirmado | Con **tabla completa de 25 combinaciones** de estado y CHECK en la base (D-060) |
| S-30 | Confirmado | "Supera" es estrictamente mayor; con límite 0, toda orden con al menos una línea; borde exacto con su criterio de aceptación |
| S-31 | Confirmado | Botón "Pedir ayuda" (D-053) |

- **Motivo:** Los supuestos son la manera de no inventar reglas de negocio; aquí pasan a ser decisiones con responsable.
- **Recomendó:** Analista (propuesta), con las recomendaciones de los siete revisores en cada fila.
- **Qué cambia:** núcleo §23: el Analista reemplaza la tabla por los resultados de arriba; S-06, S-03 y S-28 modifican los requisitos que citan.

### D-058 · Los supuestos de los módulos que cambian decisiones ya tomadas
- **Pregunta:** El Auditor Técnico cuenta 8 `[SUPUESTO]` de módulos que modifican decisiones anteriores; hay más menores.
- **Decisión (los 8, uno a uno):**

| # | Supuesto | Resultado |
|---|---|---|
| 1 | SUP-LIC-03: la clave es un campo secreto, no la serie | **Aceptado** (D-035) |
| 2 | S-PER-07: reemplazar valores personales en la auditoría | **Rechazado** (D-030) |
| 3 | NOT-S08: un motor único de avisos por fecha | **Aceptado solo para la Fase 2**, como un único motor y una única tabla de avisos; NOT define los umbrales por defecto y la hora de envío (una, configurable por empresa, por defecto 08:00); cada módulo justifica por escrito si se aparta. Reemplaza la exclusión de avisos automáticos de D-023 solo después de la Etapa 7 |
| 4 | RF-PER-007 / S-PER-09: ubicaciones de tres niveles | **Aceptado** (D-040) |
| 5 | SUP-LIN-02: la línea es entidad y retira el campo del celular | **Aceptado con condiciones** (D-042) |
| 6 | RN-CAM-004: excepción propia de cambios | **Rechazado**; es una casilla del interruptor único (D-043) |
| 7 | PER amplía los datos mínimos de D-006 | **Aceptado con finalidad declarada y límites:** tipo de Persona (Empleado, Externo, Custodio), código de empleado, puesto (tipo), área, ubicación habitual, **jefe directo** (visible solo con `datos_personales.ver`), fechas de ingreso y de cese. **Rechazado:** el motivo de cese como texto libre (queda una lista corta sin texto libre: salida, fin de contrato, traslado, otro) (D-034). Siguen prohibidos documento de identidad, dirección y teléfono personal |
| 8 | RN-ENT-007: prohibir la autoentrega, que alcanza al Administrador | **Aceptado, sin excepción** (D-043) |

- **Otros supuestos que se resuelven en esta decisión:**
  - **Aceptados como diseño del módulo** (no contradicen ninguna D-xxx): el resto de los `[SUPUESTO]` de los 17 módulos, mientras no choquen con D-035 a D-064.
  - **Almacén entrega (S-ENT-02):** no por defecto (D-037). **S-ENT-03** (Asignado siempre tiene Persona) y **S-ENT-04** (traspaso): aceptados. **S-ENT-09**: aceptado sin excepción.
  - **Líneas bloquean el cese (S-PER-05, SUP-LIN-07, S-ONB-08):** **cambiado**; el cese no se bloquea por recursos, se generan pendientes y se bloquea la anonimización (D-061).
  - **S-PER-01** (plantilla Empleado portal): D-037 fila 11. **S-PER-02, 03, 04, 08, 10:** aceptados (el cese suspende al Usuario, con `usuarios.suspender`). **S-PER-06:** D-051.
  - **S-PRV-07** (contactos de proveedor sin `datos_personales.ver`): **aceptado con condiciones:** solo los ven los roles con `proveedores.ver_contactos`, no salen en exportaciones generales y tienen ciclo de vida (inactivos 2 años se anonimizan). **S-PRV-03:** aceptado (D-043).
  - **S-PRE-12:** aceptado como casilla de "presupuestos" (D-043). **S-PRE-02, 03, 04** (impuestos, depreciación, consolidado): quedan **escalados** a contabilidad (ver "Escalado").
  - **S-INT-04:** aceptado excluyendo proveedores y la desactivación de Personas. **S-INT-10:** aceptado. **S-INT-13:** los archivos de SAP llevan un código interno del usuario, no el nombre. **S-INT-08 y S-INT-09:** quedan escalados por costo.
  - **S-POR-02, 03:** aceptados ("solicitar equipo" crea un caso; TI decide si sale de stock o se compra y crea la OC en Borrador). **S-POR-07:** el nombre del jefe directo no se muestra en el portal.
  - **SUP-LIC-10:** Administrador por defecto, Técnico opcional (D-035). **SUP-LIC-08, 09, 12:** aceptados. **SUP-DOM-05:** el titular persona natural es dato personal. **SUP-DOM-06:** no bloquea el cese (acuerdo). **S-ONB-07:** el recordatorio de salida queda **apagado** hasta la opinión legal (E-ONB-01).
  - **CMD supuestos 2 y 5:** aceptados con la CMDB delgada (D-062). **AYU-S01:** Fase 2. **AYU-S07:** 5 años provisional, con el aviso de que el texto libre no se puede anonimizar de forma garantizada.
- **Motivo:** Cierra el vacío que señaló el Auditor Técnico: reglas cambiadas por un supuesto sin pasar por este archivo.
- **Recomendó:** Auditor Técnico (H-AUD-06 y tabla de conflictos), Cumplimiento (sección 5 de su revisión).
- **Qué cambia:** cada módulo afectado (ver `plan-correcciones.md`).

### D-059 · Procedimiento ante una fuga de datos o acceso indebido
- **Pregunta:** Ningún documento define quién decide, a quién se avisa y qué se registra ante una fuga (H-CUM-18).
- **Decisión:** (lo escrito aquí rige; la versión detallada va a `docs/operaciones/procedimiento-incidente-datos.md`, antes de producción)
  1. **Quién:** *Líder del incidente* = Especialista en Seguridad (si no está, DevOps). *Decide la contención y los accesos* = Gerente de TI. *Ejecuta* = DevOps. *Evalúa si hay obligación de avisar* = Auditor de Cumplimiento con el abogado. *Habla con el CEO y con las empresas afectadas* = Jefatura de Proyecto. Antes de producción se nombra por escrito a **una persona real con su suplente** que recibe las alertas (DevOps, 9.3).
  2. **Detectar y declarar:** cualquier rol, el monitoreo o un usuario puede declarar un incidente; se abre un registro en `docs/operaciones/incidentes/` con hora, quién y qué se vio. Gravedad: **G1** acceso o fuga confirmada de datos de una o más empresas, de claves o de secretos; **G2** sospecha seria o alerta de integridad de la auditoría; **G3** menor sin datos.
  3. **Plazos internos (propuestos):** contener en **1 hora** (revocar sesiones y enlaces, rotar claves, suspender la empresa o la integración si hace falta, sin borrar evidencia); **avisar al CEO en 24 horas** desde la confirmación, en lenguaje claro; evaluar alcance (qué empresas, qué datos, cuántas personas) en **24 horas**; preservar evidencia (auditoría y su copia externa, registros técnicos); informe y análisis de causa en **10 días**, sin buscar culpables, con acciones, pruebas nuevas y riesgos actualizados.
  4. **Avisos a empresas y personas afectadas:** propuesta de **72 horas desde la confirmación** salvo que legal fije un plazo menor; el texto lo prepara Cumplimiento con plantilla preaprobada por legal. **[ESCALAR AL CEO]** — **legal (L-16):** la obligación y los plazos reales de avisar a la autoridad y a los afectados dependen del país y los fija un abogado; es una condición para pasar a producción con datos reales.
  5. **Contratos con proveedores técnicos** (L-08): deben exigirles avisar a la plataforma de un incidente en su lado.
  6. **Cierre:** la restauración ante un incidente sigue D-052.4 (revocar antes de reabrir).
- **Motivo:** Es una de las 8 condiciones del Auditor de Cumplimiento y un requisito previo a producción.
- **Recomendó:** Cumplimiento (H-CUM-18, L-16), DevOps (plan, 9.3), Seguridad. Plazos internos: Gerente de TI.
- **Qué cambia:** nuevo documento de operaciones; `docs/equipo/riesgos.md` (#26); puerta de salida (D-064).

### D-060 · Compras, recepción e inventario: los huecos que QA no podía probar
- **Pregunta:** QA reportó reglas sin resultado esperable (H-QA-01 a 03, 15; H-AUD-14 a 16; H-DAT-04).
- **Decisión:**
  1. **Orden completa:** una orden con alguna línea sin precio no sale de Borrador (RF-OC-043); el precio 0 solo con la marca "sin costo". "Supera el límite" es **estrictamente mayor**; el borde exacto tiene su criterio de aceptación.
  2. **Edición tras recepción:** una orden con cualquier recepción confirmada no cambia cantidad, precio ni proveedor; solo se cierra.
  3. **Recepciones:** el borrador **no reserva** la cantidad, vale 7 días, lo retoma cualquiera con permiso de recepción y al confirmar se valida contra lo pendiente de ese momento. Se puede recibir contra una orden ya emitida **aunque el SKU o el proveedor se desactive después**, con aviso. **Tope de 1.000 series por recepción** (y por lista pegada). Revertir un ingreso **por cantidad** solo si ningún saldo queda negativo en cada ubicación; si no, se corrige con ajuste. Revertir la recepción de una orden cerrada a mano la reabre y anula el cierre.
  4. **Estados del activo:** el Analista escribe la **tabla completa de 5 por 5 estados** (Permitida, Prohibida o "solo por reingreso") y QA genera las 25 pruebas. Reglas fijas: Asignado a Asignado solo como **traspaso** atómico; De baja a De baja y De baja a Extraviado, prohibidos; **Extraviado a De baja**, permitido con motivo; De baja o Extraviado a En stock, solo como reingreso (D-009, D-012). El responsable **se conserva durante En reparación** (S-29, S-GAR-05).
  5. **Estado, asignación y ubicación en la base:** columna `responsable_persona_id` en el activo (copia de la asignación abierta) con CHECK por estado; índice único parcial "una asignación abierta por activo"; ubicación obligatoria; todas las transiciones por una sola función; "movimiento posterior" medido con una secuencia creciente por empresa.
  6. **Cambio de ubicación de un activo con serie:** movimiento propio ("cambio de ubicación") con permiso, historial y sin cambiar el estado.
  7. **Ingreso manual de un activo** (reemplazos por garantía, donaciones, compras sin orden): requisito de la Etapa 4 con permiso propio, serie única, motivo obligatorio, costo opcional, historial, auditoría y su criterio de aceptación.
  8. **Corregir el costo de un activo:** D-044.9. **Garantía:** se captura la fecha de compra y los meses (o el fin directo) y el cálculo vive en el núcleo; tabla `garantia` desde la Etapa 4.
  9. **Otros casos límite de QA** quedan como casos de prueba: no se cambia la moneda base con órdenes abiertas; cambiar la zona horaria recalcula los avisos pendientes; archivo con codificación distinta de UTF-8; corte de conexión en medio de una recepción o importación deja todo o nada; dos pestañas en dos empresas (D-046).
  10. **Los criterios de aceptación que cruzan etapas se dividen** (CA-052 en a, b, c y d; CA-011 en dos; CA-015 en cuatro; CA-050 medible: 360 px, teclado completo, contraste AA).
- **Motivo:** Cada regla sin resultado esperado la habría resuelto un desarrollador por su cuenta.
- **Recomendó:** QA (H-QA-01, 02, 03, 15, 21), Auditor Técnico (H-AUD-14, 15, 16), Ingeniero de Datos (H-DAT-04, 23).
- **Qué cambia:** núcleo §11 a §13, RF-INV, RF-OC, CA.

### D-061 · Privacidad y cumplimiento transversal (hallazgos de Cumplimiento adoptados)
- **Pregunta:** ¿Cómo se bajan a todo el conjunto los hallazgos H-CUM-05 a H-CUM-19 que no están ya decididos?
- **Decisión:**
  1. **Puerta única de exportación en el núcleo desde la Etapa 2 (H-CUM-07):** confirmación con motivo, vista de filas y columnas sensibles, neutralización de fórmulas, límites por usuario y por empresa, alerta de uso inusual (más de 5 por hora por usuario), auditoría de filas y columnas sensibles (sin el contenido) y una hoja "Aviso" con quién lo generó, cuándo y que contiene datos personales. Los módulos la usan; ninguno exporta por su cuenta. El módulo de reportes es el modelo.
  2. **Registro de solicitudes de derechos en Personas desde la Etapa 2 (H-CUM-11):** fecha, quién la presenta, tipo, quién la atiende, plazo (lo fija legal), resultado. Permiso propio. Se excluyen de búsquedas, listas, reportes, exportaciones, tableros, avisos y API; **quien presenta el pedido no lo atiende** (lo atiende otro administrador o la plataforma); la copia se entrega por una descarga única con vencimiento y registro, nunca por correo. En la mesa de ayuda solo queda una referencia sin contenido y los casos restringidos son invisibles por **todas** las vías (H-QA-13). La eliminación condicionada a devolver equipos queda como pregunta legal (L-06).
  3. **Tabla única de retención y anonimización (H-CUM-09)** en el documento: dato, módulo, finalidad, quién lo ve, plazo, rutina. **Cada módulo declara sus campos personales o no pasa a desarrollo.** "Archivado" significa fuera de la vista con el mismo plazo, no retención indefinida. Contactos de proveedor inactivos: se anonimizan a los 2 años. Una prueba global de QA busca un nombre "canario" en toda la base, exportaciones y correos.
  4. **Correos (H-CUM-06):** a una Persona sin Usuario o a una dirección sin verificar solo se envían tipo de aviso, código (`ACT-E-000123`, `PRS-0042`), fecha y nombre de la empresa; sin serie, IMEI, nombres de terceros, importes ni enlaces de acción. Entre usuarios, un nombre solo si hace falta para actuar. **Los correos de la v1 son invitación, acceso y aprobación** (D-013.10); los avisos de entregas, altas y bajas **no entran a la v1** (Fase 2 con NOT-completo). La ficha de la Persona muestra "correo no verificado"; cambiar un correo queda auditado.
  5. **Redacción por seguridad (H-CUM-10):** operación distinta de "retirar", con permiso propio y motivo obligatorio, que reemplaza el texto por `[REDACTADO]` y deja en la auditoría quién, cuándo y por qué, sin el texto. Los textos de extravío con posible acusación se ven solo con permiso y no salen en el portal, exportaciones ni reportes. Se declara que los comentarios que mencionan a una Persona no se pueden anonimizar de forma garantizada.
  6. **Auditoría ampliada (H-CUM-13):** tipo de autor "sistema"; se auditan las lecturas masivas (desde 5.000 filas), las consultas al registro de envíos y al de solicitudes de derechos, y todo acceso de soporte; dos registros: de plataforma y de empresa (D-048).
  7. **Cese de una Persona (H-CUM-15 y D-034 ampliada):** **el cese nunca se bloquea por recursos.** Activos, líneas, licencias, dominios y elementos de CMDB generan **pendientes de la persona** visibles en su ficha (cada módulo los declara en el registro de módulo, D-038.6), una tarea de salida y un aviso a Jefatura TI. **Lo que sí se bloquea es la anonimización** mientras haya pendientes sin cerrar (D-033.3). El cese suspende al Usuario vinculado. Se corrige PER (RN-PER-008, 011, 012), el núcleo (RF-PER-006, RF-USR-004), ENT, LIN y ONB.
  8. **Aviso de privacidad (H-CUM-12):** el texto para empleados es configurable por empresa (la empresa lo entrega; la plataforma lo imprime en el acta y lo muestra en el portal); se vuelve a pedir la aceptación cuando cambie la versión, con registro de versión y fecha.
  9. **Operación (H-CUM-18):** activar un módulo es un permiso del Administrador, auditado; apagarlo no borra datos; cada módulo cumple RNF-015, RNF-016 y CA-053 antes de uso real; se crea `docs/trazabilidad.md` y `docs/calidad/`.
  10. **Datos de prueba:** D-028 sigue; ningún dato personal real en repositorio ni pruebas.
- **Motivo:** Son las condiciones 4 a 6 del veredicto de Cumplimiento, que condicionan pasar a conforme.
- **Recomendó:** Auditor de Cumplimiento (H-CUM-05 a 19), Seguridad (H-SEG-10, 16), QA (H-QA-13), Ingeniero de Datos (H-DAT-12, 24).
- **Qué cambia:** núcleo §16, §18, §19, RF-ACC-021, RF-PER; `personas-ubicaciones`, `entregas-devoluciones`, `onboarding-offboarding`, `notificaciones`, `mesa-de-ayuda`, `portal-autoservicio`, `reportes-tableros`.

### D-062 · CMDB delgada, vigencias calculadas y calendario de empresa compartido
- **Pregunta:** La CMDB copia todo el inventario (más de 100.000 filas); los estados "Vencido" los cambia un proceso nocturno; hay tres calendarios y dos tablas de avisos.
- **Decisión:**
  1. **CMDB delgada:** solo los **Servicios** y los elementos que participan en una **relación manual** se guardan como filas; el resto (activos, licencias, líneas, dominios, Personas) se lee de su origen. "Asignado a" **se deriva** de las asignaciones, no se almacena. Cuando un elemento se materializa, se hace con un gancho **síncrono en la misma transacción** del origen y un reconciliador nocturno de seguridad. La **unidad de una licencia no genera elemento de CMDB**; el elemento es el contrato. El stock por cantidad no es elemento. Códigos EC reservados por bloque. Impacto: consulta recursiva de hasta 5 niveles con control de ciclos. Desaparecen el "desfase de sincronización", el requisito de 1 minuto y la carga inicial de 100.000 filas.
  2. **Vigencia calculada al leer** con la fecha y la zona horaria de la empresa (`hoyEnEmpresa()`); **no se guarda** un estado "Vencido" que cambie un proceso. El trabajo diario solo dispara los **efectos** (avisos, renovaciones). Se guardan solo las decisiones (renovado, cancelado, dado de baja).
  3. **Una sola tabla de avisos** (la de Notificaciones: empresa, regla, entidad, umbral y destinatario); desaparecen las tablas "Alerta enviada" de proveedores y garantías.
  4. **Calendario de empresa compartido** (zona horaria, horario de atención, feriados) usado por mesa de ayuda, cambios y altas/bajas. Plazos en días corridos salvo que el módulo use ese calendario.
  5. **Indicadores de reportes:** cada indicador se define **una vez** como un filtro reutilizable que produce la cifra y la lista (así coinciden por construcción); los tableros usan **agregados precalculados** por el trabajador con fecha de corte; reportes llama a los servicios de presupuesto y mesa de ayuda, no a sus tablas.
- **Motivo:** Evita sincronizaciones, estados que mienten por horas y cifras que no coinciden con su lista.
- **Recomendó:** Arquitecto (H-ARQ-12, 16, 19), Ingeniero de Datos (H-DAT-15, 17, 19), QA (H-QA-12, 18).
- **Qué cambia:** `cmdb-ligera`, `licencias-software`, `dominios-certificados`, `proveedores-contratos`, `garantias-mantenimiento`, `notificaciones`, `reportes-tableros`, `mesa-de-ayuda`, `gestion-cambios`, `onboarding-offboarding`.

### D-063 · Seguridad transversal: hallazgos medios y bajos adoptados
- **Pregunta:** ¿Qué se adopta de los hallazgos medios de Seguridad que no están ya cubiertos?
- **Decisión:**
  1. **PDF** de actas y órdenes con una librería que **no interpreta HTML ni descarga recursos** (o un motor aislado sin red ni acceso a archivos); todo texto se escapa; prueba con texto malicioso en cada campo (H-SEG-19).
  2. **Texto libre:** un **validador común** rechaza bloques de clave privada y patrones de claves conocidos en todo campo de texto; los artículos y soluciones aceptan texto simple o un formato limitado con etiquetas permitidas; los enlaces externos solo `https`, con aviso de salida (H-SEG-23).
  3. **Auditoría:** el visor oculta los campos que el lector no puede ver en su origen (precios, datos personales) (H-SEG-11.2).
  4. **Lectura masiva por API:** se define como más de 5.000 filas por día por clave; `IMEI` y número de línea no salen en `activos:lectura` sin el alcance de personas (H-SEG-12).
  5. **Calendario de cambios:** el título se muestra solo a quien puede ver el cambio; los demás ven "Cambio programado" (H-SEG-25d). **Portal:** el nombre del jefe no se muestra.
  6. **Pruebas de aislamiento** de cada módulo por **identificador interno** (no por un "número" que sí puede existir en la otra empresa) (H-SEG-25f). La carga de maestros SAP por archivo exige también `proveedores.crear_editar`.
  7. **Cuentas externas y restauración:** D-054.5 y D-052.4.
- **Motivo:** Cierran los huecos medios de Seguridad sin esperar al módulo.
- **Recomendó:** Seguridad (H-SEG-09 a 25).
- **Qué cambia:** `entregas-devoluciones`, `mesa-de-ayuda`, `gestion-problemas`, `gestion-cambios`, `integraciones-api`, `portal-autoservicio`.

### D-064 · Puerta de salida de la Etapa 0: condiciones para empezar a codificar
- **Pregunta:** ¿Cuándo se puede escribir la primera tabla?
- **Decisión:** No se escribe código de funcionalidades hasta que se cumplan **todas** estas condiciones, cada una con responsable y evidencia verificable:

| # | Condición | Responsable | Evidencia |
|---|---|---|---|
| 1 | **Documento funcional v1.0** (v0.3 revisada) con D-035 a D-064 incorporadas, matriz de permisos y registro PS-nn aprobados por el Gerente de TI (P-005) | Analista; aprueba Gerente de TI | `documento-funcional.md` v1.0 y registro de permisos |
| 2 | **Los 17 módulos corregidos** según `plan-correcciones.md`, sin choques con el núcleo | Escuadrones; verifica Auditor Técnico | Revisión del Auditor Técnico: conforme |
| 3 | Revisión final **sin hallazgos Críticos ni Altos abiertos** del núcleo por QA, Seguridad, Auditor Técnico y Auditor de Cumplimiento | QA, Seguridad, Auditores | Cuatro vistos buenos escritos |
| 4 | **Prototipo técnico de 3 a 4 días** aprobado (D-055) sobre el proveedor candidato con su agrupador de conexiones | Arquitecto, Ingeniero de Datos, DevOps; QA mide | Informe con los criterios y el rol sin privilegios |
| 5 | **Proveedor de base de datos y de alojamiento elegido** con precios verificados y **aprobado por el CEO** (dinero) | DevOps; decide CEO | Ficha de costos con fecha y enlace |
| 6 | **Proveedor de correo elegido** tras la matriz de entrega (20 envíos a cada tipo de buzón, SPF, DKIM y DMARC en "pass") y costo aprobado por el CEO | DevOps; decide CEO | Resultado de la matriz |
| 7 | **Prototipo de las pantallas A** (26) mostrado y **aprobado por el CEO** en demo, con prueba de tareas con 5 personas no técnicas | Diseñador; aprueba CEO | Informe de la prueba y acta de la demo |
| 8 | **Documentos reales recibidos** (P-002): orden de compra, orden de servicio y Excel con nombres reemplazados (o declarados como datos de ejemplo), y el Excel analizado (P-007) | Entrega CEO; analiza Ingeniero de Datos | Archivos fuera del repositorio y nota de análisis |
| 9 | **Cuentas a nombre de la empresa** con al menos dos personas con segunda verificación, y **una persona con suplente** nombrada para recibir alertas | CEO designa; DevOps configura | Lista de accesos |
| 10 | **Estrategia de llaves y secretos** aprobada por Seguridad; `.env.example`; repositorio con ramas protegidas y revisión automática configurada | DevOps, Seguridad | Configuración y revisión |
| 11 | **Ensayo de vuelta atrás y de restauración** en pruebas, con cronómetro | DevOps, Ingeniero de Datos | Registro del ensayo |
| 12 | **Plan de pruebas** por etapa en `docs/calidad/`, juego de datos de dos empresas, reloj fijable y correo de captura | QA, DevOps | Plan y entorno |
| 13 | **Tabla de datos personales y retención** completa en el documento y **procedimiento de incidente** en borrador | Cumplimiento, Seguridad | Sección 18 y borrador del procedimiento |

- **Lo que NO exige la puerta:** la opinión legal. Se puede codificar y probar con datos inventados. La opinión legal (prioridad A: L-01 a L-04, L-07, L-08, L-14, L-16) y la aprobación del CEO son condición para **cargar datos reales** y para pasar a producción (Etapa 7).
- **Motivo:** Es la lista corta y verificable que pidió la Jefatura de Proyecto; sin documentos reales ni prototipo, se programaría sobre supuestos (riesgos #1, #6, #18).
- **Recomendó:** QA (plan por etapa, criterios del prototipo), Cumplimiento (condiciones 1 a 6), DevOps (plan de entornos), Arquitecto (condiciones para la Etapa 1), Gerente de TI.
- **Qué cambia:** `docs/equipo/plan-correcciones.md` (sección de puerta) y el cierre de la Etapa 0.

---

## Decisiones de la ronda 3 (conformidad final de la Mesa #002)

**Origen.** Informes de la ronda 3 de Seguridad, Cumplimiento (con su anexo de verificación final, que manda sobre el informe principal), QA y Auditor Técnico (`docs/revision-cruzada/ronda3-*.md`), más el documento v0.3, `docs/registro-permisos.md`, `docs/calidad/` y `docs/trazabilidad.md`. Fecha: 2026-10-25. Resultado de la ronda: los cuatro revisores dicen "conforme con observaciones", sin hallazgos Críticos ni Altos abiertos del núcleo; de los 17 módulos, 13 conformes y 4 con observaciones (ENT, GAR, DOM, LIN), ninguno no conforme. Estas decisiones cierran lo que cada uno dejó "pendiente del Gerente de TI". Nada de lo que sigue es dinero, legal ni irreversible nuevo (ver el final de esta sección).

### D-065 · Supuestos del núcleo S-32 a S-37
- **Pregunta:** El Analista elevó seis supuestos nuevos; por la regla de precedencia no son vigentes hasta decidirlos.
- **Decisión:**

| ID | Resultado | Precisión o cambio |
|---|---|---|
| S-32 Número de versión de la orden de compra | **Confirmado** | Entero que empieza en 1 y sube con cada reaprobación; no se reutiliza; se ve en la orden y en la auditoría. Sirve a las integraciones para distinguir alta, cambio y anulación (INT-2). Es el requisito RF-OC-044 |
| S-33 Tres actos de dinero nuevos en RN-017 (garantía extendida con costo, mantenimiento con costo sin orden de servicio, corregir el costo de un activo) | **Confirmado con precisiones** | (a) Los dos primeros usan `garantias.confirmar_costo` (PS-231); (b) corregir el costo usa PS-51 `activos.corregir_costo`, sensible: si el nuevo costo, con impuesto y en moneda base, supera el límite, queda "pendiente de confirmación" y lo confirma **otra persona con PS-51** (si la empresa tiene una sola, la casilla "compras" del interruptor único, D-066); (c) **`recepciones.revertir` (PS-68) lleva el control "No"**: no la revierte quien confirmó esa recepción, salvo la casilla "recepción" (R-05); (d) su costo no entra al libro de costos mientras esté pendiente |
| S-34 Endurecimiento de la plataforma | **Confirmado** | (a) El **contacto autorizado** lo registra el Administrador de plataforma al crear la empresa y lo **confirma el primer administrador** al aceptar la invitación; cambiarlo lo hace un administrador de la empresa, con espera de 24 horas y aviso por correo a todos los administradores (RF-PLA-011). (b) **Veto:** durante la espera de 24 horas de un rescate, cualquier administrador activo puede vetarlo; queda en el registro de plataforma (RF-PLA-012). (c) **Acceso de emergencia (PS-05):** exige a una segunda persona de plataforma o al contacto autorizado confirmado, aviso a todos los administradores de la empresa y tope de **un uso por empresa y por semana** (Seguridad lo aceptó con estas condiciones). (d) **Lectura de soporte:** D-039.10. (e) **Enlaces, invitaciones, sesiones, códigos de recuperación y enlaces de descarga se guardan solo como huella** irreversible, con vencimiento y un solo uso donde corresponda; el valor en claro solo existe en el correo o la pantalla de su dueño (RS-51), con una prueba automática en integración continua de que la base no contiene ningún valor que sirva directamente para entrar |
| S-35 Fórmula del fin de garantía | **Confirmado, con la fórmula exacta de QA** | **Fin = (fecha de inicio menos 1 día) más los meses, ajustando al último día del mes.** Ejemplos: 15/01/2026 + 24 meses = 14/01/2028; 15/03/2024 + 36 meses = 14/03/2027; 31/01 + 1 mes = 28/02 (año no bisiesto). Se escribe en RF-INV-008 y RN-GAR-003 y los criterios CA-082b, CA-GAR-01 y CA-GAR-15 ya concuerdan |
| S-36 El plazo de 5 años del nombre en el acta corre desde el cierre de la asignación | **Confirmado** | Cierre = devolución, baja o extravío de esa asignación. `retener_hasta` = fecha de cierre + 5 años (RF-DAT-006). Sigue **provisional hasta la opinión legal** (L-05, L-12; D-033, D-051). Un acta de entrega cuya asignación sigue abierta no vence |
| S-37 Líneas, dominios y certificados usan la casilla "contratos" | **Confirmado** | Ver D-066 (mapa completo de casillas) |

- **Motivo:** Son correcciones que piden los revisores y no cambian dinero, plazos legales ni alcance. S-35 evita dos fechas de garantía distintas en el núcleo y el módulo.
- **Recomendó:** Auditor de Cumplimiento (R-05), Seguridad (H-SEG-26 a 28), QA (H-QA-25), Auditor Técnico (N-AUD-02, 05), Analista.
- **Qué cambia:** núcleo §21 (tabla de actos sin la marca de supuesto), §23 (S-32 a S-37 como "Confirmado"), RF-PLA-001/009/011/012/013, RF-INV-008, RS-51; registro PS-05, PS-51, PS-68, PS-231; `garantias-mantenimiento.md` (RN-GAR-003).

### D-066 · Mapa de casillas del interruptor único de excepciones (completa D-043)
- **Pregunta:** Las ocho casillas de D-043 no nombran dominios, líneas, certificados ni garantías; el escuadrón B propuso «contratos».
- **Decisión:** **Se mantienen ocho casillas** (no se agrega una novena) y se publica el mapa acto → casilla. La casilla «contratos» pasa a llamarse **«contratos y servicios recurrentes»** y cubre contratos de proveedor, líneas, dominios, certificados, garantías extendidas y mantenimientos con costo.

| Casilla | Qué actos exceptúa |
|---|---|
| **compras** | Aprobar una orden de compra; aprobar una orden de servicio con costo; confirmar el costo corregido de un activo (PS-51); que quien creó o editó una orden la apruebe |
| **recepción** | Que quien recibió la mercadería haya creado o aprobado la orden; que quien confirmó una recepción la revierta (PS-68) |
| **presupuestos** | Aprobar un presupuesto o una modificación; reclasificar un costo; registrar o anular un gasto manual |
| **contratos y servicios recurrentes** | Activar un contrato de proveedor; confirmar el costo de una línea, un dominio o un certificado; confirmar el costo de una garantía extendida o de un mantenimiento sin orden de servicio |
| **licencias** | Confirmar un contrato de licencia (PS-76 cuando el contrato es de licencia) |
| **mesa de ayuda** | Aprobar una solicitud de servicio con aprobación (quien no la pidió) |
| **cambios** | Aprobar un cambio y reaprobar una plantilla estándar; **cerrar un cambio quien lo implementó** (D-067) |
| **problemas** | Publicar un error conocido quien lo redactó |

  Sin casilla (**nunca** se exceptúa): la autoentrega de equipos, la anonimización de una Persona (propone uno y ejecuta otro) y el rescate de una empresa.
- **Motivo:** Mantener ocho casillas conserva la simplicidad del panel y cada acto tiene un solo interruptor; la persona que activa una casilla es la misma que se beneficia en cualquiera de los actos de ese grupo, por lo que separar más no aumenta el control.
- **Recomendó:** Escuadrón B (propuesta), Auditor Técnico (N-AUD-03, C1), Cumplimiento (R-14).
- **Qué cambia:** núcleo RF-OC-026 (nombrar el mapa y renombrar «contratos»), RN-017; `dominios-certificados.md` RN-DOM-017, `lineas-moviles.md` RN-LIN-016, `garantias-mantenimiento.md` RN-GAR-041, `proveedores-contratos.md`, `licencias-software.md`, `gestion-cambios.md`, `gestion-problemas.md`, `mesa-de-ayuda.md`; registro de permisos (la columna de casilla).

### D-067 · PS-175 `cambios.cerrar`
- **Pregunta:** ¿Quién cierra un cambio?
- **Decisión:** **Confirmado:** Administrador, Jefatura TI y Técnico (todo), con el control "No": **no lo cierra quien lo implementó**, salvo la casilla «cambios» del interruptor único (D-066). "Quien implementó" es el responsable de implementación registrado en el cambio.
- **Motivo:** El cierre certifica que el cambio se hizo bien; que lo certifique quien lo hizo anula la revisión posterior.
- **Recomendó:** Cumplimiento (sección 4), registro de permisos.
- **Qué cambia:** nada en el registro (PS-175 ya dice esto); `gestion-cambios.md` cita la casilla de D-066.

### D-068 · Qué permisos son sensibles además de los actuales (H-SEG-07, H-SEG-30)
- **Pregunta:** El registro tiene 35 sensibles (con segunda verificación obligatoria). Seguridad pide marcar otros cuya falta de protección permite desactivar el control de dinero o robar la sesión de quien aprueba.
- **Decisión:** **Se marcan como sensibles (2F, y R donde se indica) los siguientes 16 permisos**, con lo que el registro pasa de 35 a **51 sensibles**:

| Grupo | Permisos | Controles |
|---|---|---|
| Aprobaciones de dinero | PS-63 `ordenes_compra.aprobar`, PS-73 `ordenes_servicio.aprobar`, PS-76 `contratos.activar`, PS-114 `presupuesto.aprobar` | 2F, A, No |
| Aprobaciones de cambios | PS-172 `cambios.aprobar`, PS-173 `cambios.aprobar_alto` | 2F, A, No |
| Confirmaciones de costo | PS-224 `lineas.confirmar_costo`, PS-228 `dominios.confirmar_costo`, PS-231 `garantias.confirmar_costo` | 2F, A, No |
| Gastos y costos | PS-116 `presupuesto.gasto_registrar`, PS-117 `presupuesto.gasto_anular`, PS-118 `presupuesto.reclasificar` | 2F, A, No |
| Ajustes de control | PS-68 `recepciones.revertir` | 2F, A, No (D-065) |
| Webhooks | PS-135 `integraciones.administrar_webhooks` | 2F, R, A |
| Encuestas | PS-157 `ayuda.encuesta_ver_detalle` (muestra quién respondió) | 2F, A |
| **Monto límite y moneda base (nuevo permiso)** | **PS-232 `empresa.configurar_aprobacion`**: cambiar el monto límite de aprobación, la moneda base y activar o desactivar la aprobación. Sale de PS-08, que queda como configuración general no sensible | 2F, R, A; **cada cambio avisa por correo a todos los administradores** |

  La segunda verificación llega así a Jefatura TI (hoy ya la tiene si cumple otro sensible) y a los roles personalizados que aprueben dinero; es una aplicación de autenticación sin costo y se justifica porque un robo de sesión de quien aprueba es el camino más corto al fraude. PS-08 `empresa.configurar` y PS-154 `ayuda.solicitud_aprobar` (no mueve dinero) **no** pasan a sensibles.
- **Motivo:** Cambiar el monto límite a un valor enorme apaga el control de dinero; quien aprueba sin segunda verificación es un blanco de robo de sesión.
- **Recomendó:** Seguridad (H-SEG-07 parcial, H-SEG-30), Cumplimiento (R-05). **Discrepancia:** el Analista lo había dejado para decisión porque "pone la segunda verificación a Jefatura TI en casi todo"; se acepta ese costo.
- **Qué cambia:** `registro-permisos.md` (marcar los 16, crear PS-232 y actualizar el pendiente de la sección 16), núcleo RF-ACC-013 y CA-007/CA-011b (la prueba de matriz regenerada), RF-ROL-005; las tablas de módulos citan solo el PS.

### D-069 · El contrato de licencia es el contrato de proveedor (PS-76 y PS-78)
- **Pregunta:** ¿Se unifica del todo el contrato de licencia en el de proveedor?
- **Decisión:** **Confirmado D-044.4.** El contrato de licencia es una **extensión 1 a 1** del contrato `CTR-` (tipo y puestos). **PS-76 `contratos.activar`** sirve para activar un contrato de proveedor y para confirmar uno de licencia (con la casilla «contratos y servicios recurrentes» o «licencias», según su tipo, D-066); **PS-78 `contratos.terminar_anular`** termina o anula uno u otro (terminar uno de licencia libera sus puestos como pendiente). PS-84 y PS-85 quedan retirados. Terminar o anular lo hace una sola persona con motivo (no compromete gasto). Avisos con `contratos.recibir_avisos` (PS-81).
- **Motivo:** Una ficha, una regla de dinero, un solo permiso por acción.
- **Recomendó:** Ingeniero de Datos (H-DAT-08), Cumplimiento (sección 4 de su informe), Auditor Técnico.
- **Qué cambia:** núcleo y registro sin cambios; `licencias-software.md` y `proveedores-contratos.md` ya lo reflejan (verificar que ambos remitan a PS-76 y PS-78).

### D-070 · "Costo comprometido" y claves naturales de importación
- **Pregunta:** SUP-LIN-14 y SUP-DOM-13 definen el "costo comprometido" de líneas y dominios; SUP-LIC-16 y SUP-DOM-14 proponen claves de importación.
- **Decisión:**
  1. **Principio único (completa D-043.3):** el **costo comprometido** es lo que se paga o se compromete a pagar **por el periodo que se confirma**, **con impuesto y en la moneda base**; en otra moneda siempre confirma otra persona.
  2. **Línea (SUP-LIN-14): confirmado.** Cargo mensual vigente con impuesto × meses de permanencia restantes (12 si no hay permanencia), para un alta, un cambio de plan o un cargo especial.
  3. **Dominio y certificado (SUP-DOM-13): confirmado.** Importe total con impuesto de la compra o renovación (el del periodo que se paga de una vez).
  4. **Garantía extendida y mantenimiento sin orden de servicio:** el precio con impuesto.
  5. En los tres casos: el registro **opera mientras tanto** (no se pierde un dominio por esperar), su costo queda "pendiente de confirmación" y **no entra al libro de costos** hasta confirmarse; la casilla de excepción es la de D-066.
  6. **Claves naturales de importación (D-050.4), confirmadas:** contrato de licencia = número de contrato si existe, y si no **proveedor + producto + inicio + fin** (SUP-LIC-16); dominio = nombre normalizado; certificado = emisor + número de serie, o **nombre común + emisor + vencimiento** si no hay serie (SUP-DOM-14); línea = número normalizado. **Toda clave natural debe tener un índice único parcial que excluya lo anulado.** El Ingeniero de Datos revisa los índices al editar su ADR de importación; el cambio de una clave natural exige nueva decisión.
- **Motivo:** Sin una definición RN-017 no es probable para líneas y dominios.
- **Recomendó:** Cumplimiento (R-06), Escuadrón B (propuestas), Auditor Técnico, QA (H-QA-32).
- **Qué cambia:** `lineas-moviles.md` SUP-LIN-14 y `dominios-certificados.md` SUP-DOM-13/14 pasan a "Aceptado (D-070)"; `licencias-software.md` SUP-LIC-16; núcleo RN-017 (principio).

### D-071 · Derechos de datos, errores conocidos y CMDB: S-PRS-14, S-PRB-12, S-CMD-11 y S-CMD-12
- **Pregunta:** Cuatro supuestos de módulos esperan visto bueno.
- **Decisión:**
  1. **S-PRS-14 (R-08): confirmado con una exigencia nueva.** Si quien presenta un pedido de derechos es la única persona con PS-29, **no lo atiende ni ella ni la plataforma**: el pedido queda "En espera de persona designada", el Administrador **designa** a otra membresía de confianza dándole PS-29 (con segunda verificación; es un cambio de rol de otra persona). **Toda empresa debe tener una persona suplente con PS-29**: "Primeros pasos" muestra la tarea "Designar suplente de derechos de datos" y, mientras no exista, el sistema recuerda cada 3 días a los administradores. Si pasan 5 días sin designar, se avisa al **contacto autorizado** y se deja constancia de que el plazo legal corre; la salida es el procedimiento de rescate (D-048.5), que habilita a quien atiende. RN-AYU-027 cita RN-PRS-033.
  2. **S-PRB-12: aceptado con una condición.** Los errores conocidos publicados los ven todos los roles con `problemas.ver_errores_conocidos` (incluye Almacén y Solicitante), pero cada error conocido tiene **dos textos**: un **resumen para usuarios** (visible para todos esos roles; sin datos internos, validado por el validador común y publicado por una segunda persona) y un **detalle técnico** (solo roles con `problemas.ver`).
  3. **S-CMD-11: aceptado** (un elemento de CMDB de origen se materializa al relacionarlo o completarle datos propios; coherente con D-062.1).
  4. **S-CMD-12: aceptado con umbral propio.** Se audita toda consulta de impacto que devuelva **100 o más nombres de Personas**; la lectura masiva general de 5.000 filas (D-061.6) se mantiene. El umbral de 100 es configurable por la plataforma.
- **Motivo:** El plazo legal de un derecho de datos no puede quedar sin responsable; los nombres de Personas valen más que una fila de activo.
- **Recomendó:** Cumplimiento (R-08), Seguridad (H-SEG-32 d), módulos (S-PRS-14, S-PRB-12, S-CMD-11 y 12).
- **Qué cambia:** `personas-ubicaciones.md` RN-PRS-033/S-PRS-14, `mesa-de-ayuda.md` RN-AYU-027, `portal-autoservicio.md` caso 13, `gestion-problemas.md` S-PRB-12, `cmdb-ligera.md` S-CMD-11/12; núcleo "Primeros pasos".

### D-072 · Límites y formatos (P-013), series dañadas, "deshacer" y el cuarto ejemplo de redondeo
- **Pregunta:** El Analista propuso los valores de la sección 19.2 y quedaron P-013 y tres huecos de QA (H-QA-15, H-QA-16).
- **Decisión:**
  1. **Se fijan los valores de 19.2 tal como los propuso el Analista** (SKU 120; Persona 120; proveedor 160; ubicación, área, centro de costo y categoría 80; texto de campo 255; nombre de campo 60; 100 opciones; 40 campos por categoría; serie 64; motivo 500; notas 1.000; correo 254; cantidad por línea hasta 1.000.000; precio hasta 999.999.999,9999; 200 líneas por orden; stock hasta 10.000.000; 1.000 series por recepción; 3 niveles de ubicación; números de documento mínimo 6 dígitos y SKU mínimo 4) y se agregan: **campo secreto hasta 512 caracteres** y **texto del aviso de privacidad hasta 5.000 caracteres**. **P-013 queda cerrado.** Los límites se pueden cambiar con una decisión nueva.
  2. **Serie dañada por Excel** (RF-INV-005, RF-IMP-010): se rechaza con aviso cuando (a) tiene notación científica (`E+` o `e+`); (b) es numérica pura y su longitud es menor que la mínima de las series ya existentes de ese SKU (cuando hay 10 o más); o (c) un campo "identificador" con **largo exacto** configurado (por ejemplo IMEI de 15 dígitos) no lo cumple. El campo "identificador" admite el largo exacto como atributo opcional.
  3. **RNF-013 ("donde se pueda, se puede corregir o deshacer") se reemplaza por una lista cerrada:** son **reversibles** el cambio de estado (por reingreso), la asignación (por devolución o traspaso), la recepción (por reversión), un lote de importación (por anulación), una orden aprobada y editada (vuelve a pendiente) y todo lo que se desactiva (se reactiva). **No son reversibles:** anonimizar, purgar, exportar y una aprobación ya consumida por una recepción. **No hay un botón "Deshacer" genérico.**
  4. **Redondeo (RF-OC-045):** se agrega un cuarto ejemplo y se fija que **el impuesto se calcula sobre el subtotal ya redondeado**: 1 × 10,0050 con impuesto de 50 % da subtotal 10,01; impuesto 5,01 (5,005 redondeado hacia arriba); total 15,02.
- **Motivo:** Cierra lo que QA no podía convertir en prueba y deja un solo orden de cálculo.
- **Recomendó:** QA (H-QA-15, H-QA-16), Analista (propuesta de valores).
- **Qué cambia:** núcleo §19.2 (valores en firme), P-013 cerrado, RNF-013, RF-INV-005, RF-IMP-010, RF-CAT (largo exacto), RF-OC-045 y CA-072.

### D-073 · Plataforma: personas mínimas, acceso de emergencia y lectura de soporte
- **Pregunta:** RF-PLA-001 dice "1 o 2 personas"; faltan el diseño de la lectura de soporte y qué ve la plataforma de los eventos de seguridad.
- **Decisión:**
  1. **RF-PLA-001:** son de **2 a 3 personas** de plataforma y, **antes de cargar datos reales, al menos dos** (con datos inventados puede haber una). RF-PLA-009 (acceso de emergencia) se alinea con PS-05: exige a la segunda persona o al contacto autorizado confirmado (D-065 S-34).
  2. **Lectura de soporte: D-039.10** (diseño técnico de abajo, que el Arquitecto prueba en el prototipo y Seguridad revisa).
  3. **Qué ve plataforma de los eventos de seguridad (D-054.1):** **solo conteos por empresa**, sin correos ni direcciones IP, mediante un permiso nuevo `plataforma.ver_conteos_seguridad` (PS-233, Administrador de plataforma, no sensible).
  4. **Enlace en otro dispositivo (H-SEG-31):** se adopta. Quien pide el enlace en el computador y abre el correo en el celular ve en el navegador de origen un **código corto de 8 caracteres** que escribe en el otro dispositivo; si no, pide un enlace nuevo en el mismo. Se agrega a CA-068; el Diseñador define la pantalla.
- **Motivo:** Con una sola persona el "control dual" depende de un contacto que ella misma registró.
- **Recomendó:** Seguridad (H-SEG-26, 27, 31, 32 c).
- **Qué cambia:** núcleo RF-PLA-001/009/013, CA-068; registro (PS-233); D-039 (punto 10).

### D-074 · Permisos pendientes del registro: PS-106, PS-232, PS-233 y PS-234
- **Pregunta:** ¿Qué permisos faltan o están pendientes en el registro?
- **Decisión:**
  1. **`garantias.recibir_avisos` (PS-106): confirmado y vigente** (hay una referencia vieja `gar.recibir_alertas` ya reemplazada en la bitácora). Valores por defecto: Administrador y Jefatura TI (todo), Técnico (propio: los activos de los que es ejecutor o responsable); los demás, no. `lineas.recibir_avisos` (PS-226), `dominios.recibir_avisos` (PS-229) y `contratos.recibir_avisos` (PS-81) se confirman con el mismo patrón.
  2. **PS-232 `empresa.configurar_aprobacion`:** nuevo, sensible (D-068). **PS-233 `plataforma.ver_conteos_seguridad`:** nuevo (D-073).
  3. **PS-234 `texto.redactar`:** nuevo, sensible (2F, A): redactar por seguridad un texto libre de cualquier registro del núcleo (motivo, nota, observación), con el mismo mecanismo `[REDACTADO]` que PS-153, 221 y 222. Va en la **Etapa 4** (R-09, D-075).
  4. **Quién puede pedir una fila nueva:** se mantiene el mecanismo de la sección 14 del registro; el Gerente de TI aprueba.
- **Motivo:** Cierran los pendientes de la sección 16 del registro.
- **Recomendó:** Seguridad, Cumplimiento (R-09), Analista.
- **Qué cambia:** `registro-permisos.md` (filas PS-232 a PS-234, sección 16 sin pendientes); `garantias-mantenimiento.md` (usa PS-106).

### D-075 · Residuales de Cumplimiento, parciales de otros revisores y decisiones sueltas
- **Pregunta:** Para cada residual o hallazgo parcial: ¿se cierra con una decisión o qué rol edita qué?
- **Decisión:**

| Hallazgo | Resultado | Quién edita qué |
|---|---|---|
| **R-04** (§18.1 incompleta) | Se cierra editando | **Analista:** una fila por dato declarado en los módulos (puestos de licencia ligados a Persona, encuestas con nombre, acuse con IP a 12 meses, textos de extravío, comentarios de cambios y problemas, registro de envíos 12 meses con correo enmascarado a los 90 días) con sus plazos |
| **R-06** (costo comprometido) | **Cerrado por D-070** | Escuadrón B lo marca "Aceptado" |
| **R-09** (texto libre con datos) | **Se cierra con D-074.3** y una declaración | **Analista:** en §18.1 y en el aviso de privacidad, "los motivos y notas son texto libre no anonimizable de forma garantizada"; adelantar la redacción del núcleo (PS-234) a la Etapa 4 (RF-DAT-013). **Seguridad:** el validador común aplica también a la serie de licencias (H-SEG-32 b) |
| **R-10** (documentos operativos) | **Parcial** | `docs/trazabilidad.md` y `docs/calidad/` **ya existen** (QA). Falta `docs/operaciones/procedimiento-incidente-datos.md`: lo redactan **Seguridad y Cumplimiento** sobre la base de D-059 antes de cerrar la Etapa 0 (condición 13) |
| **R-11** (riesgo #10) | **Cerrado** | Corregido en `riesgos.md` (plan: antes de cargar datos reales) |
| **R-14** (casilla «contratos») | **Cerrado por D-066** | **Analista:** RF-OC-026 nombra el mapa |
| R-05, R-08, R-01, R-02, R-03, R-07, R-12, R-13 | Cerrados (D-065, D-071; los demás ya verificados por Cumplimiento) | Ninguno |
| **H-CUM-03, 09, 10, 18, 19** | 03: cierra con D-065/D-066/D-070. 09: cierra con R-04 (Analista). 10: cierra con R-09. 18: cierra con el procedimiento de incidente (R-10). 19: cierra con R-04 | Ver filas anteriores |
| **H-QA-15** | **Cerrado** por D-072 (RNF-013, series dañadas, P-013) | Analista edita |
| **H-QA-21 y H-QA-28** | Se cierran editando | **Analista:** agregar a cada CA la columna "Se ejecuta en: Etapa N" y partir CA-016, CA-052a/b, CA-054 (a Etapa 2, b Etapa 4, c Etapa 7), CA-060, CA-064, CA-065, CA-NOT-05, CA-NOT-07 y CA-PRV-04, usando la partición ya propuesta por QA en `docs/calidad/criterios-por-etapa.md` |
| **H-QA-22** | **Cerrado** (`trazabilidad.md` y `calidad/` existen) | QA mantiene la matriz |
| **H-QA-24** | Abierto, no es del núcleo | **DevOps** reedita el plan a la v0.3 (ver `plan-aplicacion.md`) |
| **H-QA-32** (RN-017) | **Decidido** | La regla dice "un documento **sin costo no pasa por la regla de dinero**" (los actos "siempre" de la tabla son otra regla); una orden con todas las líneas "sin costo" **sí** pasa por aprobación cuando el límite es 0. **Analista** edita RN-017, RF-OC-016 y CA-055 |
| **H-AUD-21, 23, 24** | Se cierran editando | **Analista:** reordenar y fusionar RF-INV-012 con RF-OS-007 (una sola regla), completar §26.1 (CA-041 y CA-050). **QA:** mantener `trazabilidad.md`. **Escuadrones:** unificar "Cuándo" de PRE, REP e INT a las tres palabras (`v1, Etapa N` / `Fase 2` / `Fase 3`) |
| **N-AUD-04** | Se cierra editando | **Escuadrón D:** `entregas.imprimir_acta`, columna Empleado: "-" |
| **N-AUD-06** | **Decidido** | Un solo evento de cambio de estado del activo: **`inventario.activo_estado_cambiado`** (con el nuevo estado y la causa; la baja es un valor, no otro evento); `presupuesto.aprobado` pasa a **`presupuesto.presupuesto_aprobado`**; las citas de tabla se escriben `D-037 fila 11` y `D-058 fila 3`; "En espera del solicitante" pasa a "En espera de la persona atendida". Editan los escuadrones C, E y F |
| **H-SEG-07** | **Cerrado por D-068** | Analista marca los sensibles |
| **H-SEG-32** | (a) y (b) ya aplicados; (c) D-073.3; (d) D-071.1; (e) DevOps: **ramas protegidas y revisión automática** (la higiene `.gitignore` y `.env.example` ya existe); (f) **Ingeniero de Datos:** las filas de importación en preparación van en una tabla con empresa y reglas por fila y se limpian al confirmar o a los 7 días; (g) **Escuadrón A:** en los correos de garantías, el código del activo en lugar de la serie | Roles indicados |
| **Conflicto 28** (gancho de presupuesto en la aprobación de la OC) | **Cerrado** | RF-OC-051 ya lo registra |

- **Motivo:** Cada residual queda con dueño y vía de cierre.
- **Recomendó:** Cumplimiento (anexo de verificación final), QA, Seguridad, Auditor Técnico.
- **Qué cambia:** los documentos de la columna "Quién edita qué"; ver `plan-aplicacion.md`.

### D-076 · Qué criterios se exigen antes de la Etapa 1 y cuáles se difieren
- **Pregunta:** QA marca 18 reglas RN sin criterio que las cite y unos 17 requisitos cuyo criterio no los prueba. ¿Se cierran antes de la Etapa 1 o se difieren?
- **Decisión:** **Regla general:** un requisito necesita un criterio que lo pruebe **antes de que se abra la etapa en la que se programa**, no antes. Se aplica así:
  1. **Antes de cerrar el documento v1.0 (puerta de la Etapa 0):** (a) la tabla de reglas RN lleva una **columna CA** y las 18 reglas sin cita se completan **citando** el criterio que ya las cubre (RN-005 con CA-023, RN-006 con CA-040, RN-010 con CA-012 y 013, RN-012 con CA-017, RN-017 con CA-055, etcétera); (b) **los requisitos de la Etapa 1** cuyo criterio no los prueba se corrigen: RF-ACC-006 (15 minutos y un solo uso), RF-ACC-014 (30 minutos y 12 horas), RF-ACC-020 (aviso de dos administradores), RF-PLA-009, 010, 011 y 012, RF-EMP-004 (calendario), RF-ROL-015 (dependencias circulares) y la parte de CA-070 sobre la confirmación del segundo administrador y el resumen mensual; (c) **RN-008** (motivo en las acciones que lo piden) obtiene un criterio nuevo, porque rige desde la Etapa 1.
  2. **Antes de abrir la Etapa 2:** criterios nuevos para RN-015 (inactivo no se usa en registros nuevos) y RN-016 (catálogos no compartidos) y RF-CAT-026 (contactos: anonimizar y no exportar).
  3. **Antes de abrir cada una de las Etapas 4 a 6:** los de su etapa (RF-IMP-008, 009 y 015; RF-ENT-002; RF-OC-048, 049 y 050; los CA ambiguos H-QA-31 con fechas y números; el partido de CA-038, CA-053 y CA-054).
  4. **Módulos de Fase 2 y 3:** los pendientes se cierran al **activar** cada módulo; no bloquean la v1.
  5. **Responsables:** el **Analista** redacta o cita el criterio; **QA** revisa y propone el texto cuando lo prefiera el Analista (en `docs/calidad/`); el **Auditor Técnico** verifica con su guion que ningún requisito de la etapa que se abre quede sin criterio. El Gerente de TI no abre una etapa con esa verificación pendiente.
- **Motivo:** Exigirlo todo antes de la Etapa 1 retrasaría el arranque sin reducir riesgo; lo que rige en la Etapa 1 sí debe estar probable antes.
- **Recomendó:** QA (H-QA-27, 30, 31), Auditor Técnico (guion), Gerente de TI.
- **Qué cambia:** núcleo §21, §22; `docs/calidad/criterios-por-etapa.md` y `docs/trazabilidad.md` (QA los actualiza); definición de "listo" de cada etapa.

**Escalado al CEO por la ronda 3.** Nada nuevo en dinero, legal o irreversible. Se agrega un **insumo** que solo él tiene: **designar dos personas** del equipo para administrar la plataforma antes de cargar datos reales (D-073.1); esa designación no tiene costo propio salvo las llaves de seguridad físicas ya incluidas en el escalado de dinero.

---

## Decisiones de la ronda 4 (2026-10-26)

**Origen.** Informes de ronda 4 de Cumplimiento y Seguridad, aviso de la Jefatura de Proyecto sobre D-030.6 y las preguntas abiertas de la puerta de la Etapa 0. Nada de lo que sigue es dinero, legal nuevo ni irreversible.

### D-077 · Enmienda a D-030.6: el motivo SÍ se guarda por valor en la auditoría
- **Pregunta:** D-030.6 incluye los "motivos" entre los textos libres que la auditoría nunca guarda por valor; el núcleo (RF-AUD-003) y `garantias-mantenimiento.md` los guardan. ¿Cuál vale?
- **Decisión:**
  1. **Se enmienda D-030.6.** Siguen sin valor en la auditoría (solo "el campo X cambió"): nombre, correo, área, código de empleado, teléfono y correo laborales de contactos, titular persona natural, IMEI y número de línea asignados a una Persona, y los **comentarios y descripciones libres**. **Los motivos salen de esa lista.**
  2. **El motivo se guarda por valor.** Es el "porqué" de aprobar, anular, reabrir, corregir o revertir (RN-008); sin él la auditoría dice qué pasó pero no por qué.
  3. **Es texto libre no anonimizable de forma garantizada.** Así se declara en §18.1 y en el aviso de privacidad (O-3). Su copia en la auditoría vence con el plazo de la auditoría; PS-234 `texto.redactar` redacta el registro, no la copia de la auditoría (RF-AUD-003). Se mantienen el aviso al escribir y el validador común.
  4. El plazo de esa copia queda dentro de la consulta legal L-04 ya pedida; no se agrega nada nuevo para el CEO.
- **Motivo:** Una auditoría sin el porqué pierde su función de control. El riesgo (un dato personal escrito por error en un motivo) está declarado, acotado en el tiempo y en consulta legal.
- **Recomendó:** Cumplimiento (O-2, R-09), Analista (RF-AUD-003), Jefatura de Proyecto (aviso del choque).
- **Qué cambia:** `integraciones-api.md` (línea de textos libres: "descripciones" sin valor, "motivos de revocación" con valor) y `presupuesto-costos.md` (sección de datos personales declarados, que hoy dice "descripciones y motivos sin valor" y contradice su propio RN-PRE-037): **Escuadrón F**. `docs/arquitectura/adr-11-auditoria.md`: el filtro de `registrarAuditoria` excluye "texto libre" salvo el motivo: **Arquitecto**. Nota al pie en D-030.6 (hecha).

### D-078 · Ratificación de S-PRS-14, S-PRB-12, S-CMD-11, S-CMD-12 y PS-175
- **Pregunta:** ¿Siguen vigentes estos cinco puntos que la puerta de la Etapa 0 tenía por abiertos?
- **Decisión:** **Ya estaban decididos; se ratifican sin cambio, con una línea cada uno.** Comprobado con Grep en `docs/modulos/` y en el registro:
  - **S-PRS-14** (único con PS-29 no atiende su propio pedido; suplente obligatorio): D-071.1; `personas-ubicaciones.md` línea 277 ya dice "Aceptado (D-071)".
  - **S-PRB-12** (errores conocidos visibles a más roles, con resumen para usuarios y detalle técnico aparte): D-071.2; `gestion-problemas.md` línea 280 "Aceptado con condición".
  - **S-CMD-11** (un elemento de CMDB de origen se materializa al relacionarlo): D-071.3; `cmdb-ligera.md` línea 288 "Aceptado".
  - **S-CMD-12** (consulta de impacto con 100 o más nombres de Personas se audita): D-071.4; `cmdb-ligera.md` línea 289 "Aceptado con umbral propio".
  - **PS-175 `cambios.cerrar`** (no lo cierra quien lo implementó, salvo la casilla «cambios»): D-067; `registro-permisos.md` línea 288 vigente.
- **Motivo:** No reabrir lo decidido; la puerta solo necesita que conste.
- **Qué cambia:** nada en los archivos.

### D-079 · S-GAR-12: formato del "código del activo"
- **Pregunta:** Los correos de garantías usan el "código del activo" en lugar de la serie (H-SEG-32 g), pero el núcleo no define ese código (solo existen SKU, actas, órdenes y Personas). **Búsqueda con Grep:** `documento-funcional.md` no trae ninguna definición; la propuesta de reserva está en `garantias-mantenimiento.md` línea 316.
- **Decisión:** **Confirmado y definido.** Cada activo recibe al crearse un **código visible** `ACTV-NNNNNN`: correlativo **por empresa**, mínimo 6 dígitos, que no se reutiliza (pueden quedar saltos), con contador propio (ADR-15). No es la serie ni el código del SKU, no es dato personal y se puede buscar. Los correos, las actas y los avisos lo usan en lugar de la serie. Se agrega `ACTV` a los prefijos reservados (junto a `ACT`) para que ninguna categoría lo use.
- **Motivo:** Un código propio evita escribir la serie en correos sin inventar una combinación frágil de SKU más referencia.
- **Qué cambia:** **Analista:** un requisito en RF-INV (código visible del activo), la tabla de prefijos y la lista de reservados (§26.2) y `trazabilidad.md`. **Escuadrón A:** `garantias-mantenimiento.md` S-GAR-12 pasa a "Aceptado (D-079)". **Arquitecto:** una línea en ADR-15 (contador `activo`).

### D-080 · Procedimiento de incidente v0.3: plazo de 48 horas para G2 y congelación en incidente
- **Pregunta:** Cumplimiento propone (procedimiento §6.1) avisar al CEO de un G2 al confirmarse o, a más tardar, a las 48 horas si sigue sin descartarse; y (C.5.2) congelar anonimización y purga durante la preservación de evidencia.
- **Decisión:** (a) **Confirmado el plazo interno de 48 horas para G2.** Es un plazo del equipo, no legal: no sustituye los plazos que fije el abogado (L-16). (b) **Confirmada la congelación de C.5.2**: es solo pausar algo irreversible, no borra nada. (c) **Visto bueno técnico del Gerente de TI al borrador v0.3 como borrador** (lo que pide D-064 condición 13), tras leerlo completo; sigue siendo borrador hasta ensayo y abogado (H-CUM-18). Observación: `docs/operaciones/incidentes/` y su plantilla (sección 10, fila 8) los crea Seguridad antes de producción.
- **Motivo:** Un G2 sin descartar durante dos días ya merece que el CEO lo sepa; congelar lo irreversible mientras se investiga no cuesta nada.
- **Qué cambia:** `procedimiento-incidente-datos.md` 6.1 deja de decir "lo confirma el Gerente de TI" (lo edita Cumplimiento).

---

## Escalado al CEO

Todo lo anterior está decidido por el Gerente de TI. Solo esto llega al CEO, y solo porque implica dinero, un tema legal o algo que no se puede deshacer. La hoja de una página para el CEO está en `docs/equipo/hoja-ceo.md`. **Nota sobre las cifras:** las que da DevOps en `docs/operaciones/plan-entornos-y-costos.md` **no están verificadas** (no pudo consultar precios); sirven para dimensionar, no para decidir.

### Dinero (le pedimos que apruebe o rechace)
1. **Servicio de envío de correos** (invitaciones, enlaces de acceso, avisos de aprobación). Indispensable porque el acceso es por correo. Gasto mensual bajo y recurrente. **Recomendación: aprobar** un plan dimensionado para las Etapas 1 a 5, con tope por empresa y alerta al 80 % (RN-NOT-012); revisarlo al activar el portal y la mesa de ayuda. Más un segundo proveedor configurado de reserva (puede ser gratuito).
2. **Alojamiento, base de datos y respaldos (D2).** Dos fases: **A** (Etapas 0 a 3, datos inventados) con planes gratuitos o los más baratos, sin datos reales; **B** (antes de cualquier uso con datos reales) con base de datos de pago con respaldos, alojamiento de pago y almacenamiento externo con bloqueo. **Cambio por D-038:** el alojamiento debe ser de ejecución continua (un servicio de contenedores) para correr también el proceso de trabajos en segundo plano; DevOps trae la comparación con precios verificados antes del prototipo. Orden de magnitud **sin verificar** para producción: 50 a 150 USD al mes en total para una o pocas empresas.
3. **Copia externa inmutable de la auditoría, respaldos en otro proveedor y vigilancia** (D-052, plan de DevOps): almacenamiento externo de bajo costo y un servicio de vigilancia de errores y disponibilidad (gratuito al principio).
4. **Gestor de secretos y llaves de seguridad físicas** para las pocas cuentas de la plataforma (D-048): costo muy bajo, único o mensual según el gestor elegido.
5. **Dominio:** usar un subdominio de uno que la empresa ya tenga; si no existe, comprar uno (gasto anual).
6. **Honorarios de un abogado de protección de datos** (nuevo): para contestar el paquete de preguntas legales de abajo.
7. **Archivos adjuntos** (D-022): no ahora; se consulta al cierre de la Etapa 4. **SAP:** si la empresa usa SAP y quiere conexión directa, puede requerir licencias o consultor (S-INT-08); no se cotiza. **Impuestos, depreciación y consolidado de monedas** (S-PRE-02 a 04): consulta a contabilidad antes de PRE-B.

### Legal (le pedimos que consiga una opinión legal; el equipo no la da)
Son 16 preguntas consolidadas por el Auditor de Cumplimiento (L-01 a L-16, en `docs/revision-cruzada/auditor-cumplimiento.md`, sección 6). Siete son previas a cargar datos reales (prioridad A). Las cinco más importantes:
1. **L-01 y L-02:** qué ley de protección de datos aplica según el país de cada empresa, quién es responsable de qué (la empresa, la plataforma, el proveedor de alojamiento) y si hay que registrar los bancos de datos ante la autoridad.
2. **L-04:** confirmar los plazos propuestos: auditoría 5 años (D-024), anonimización a los 2 años, archivos de importación sin guardarse (D-050), respaldos 30 días y 12 meses (D-032), eventos de seguridad 12 meses, casos de ayuda 5 años.
3. **L-16:** la obligación y los plazos de avisar una fuga de datos a la autoridad y a los afectados (D-059).
4. **L-07 y L-08:** si tener datos de varias empresas en un mismo servidor, o en otro país, y usar proveedores externos (correo, alojamiento) exige requisitos especiales; y los contratos con esos proveedores y con cada empresa.
5. **L-05 y L-12:** si se puede conservar el nombre en el acta de entrega hasta el fin de su plazo (D-033, D-051) y el valor probatorio de un acta firmada en papel o de una aceptación en pantalla.
Además: **si la plataforma se usará con empresas que no son del CEO** (cambia contratos, soporte y costos; basta con que avise si existe el plan).

### Irreversible (se le explica antes de ejecutarse)
1. **Anonimizar o borrar datos personales** (D-024, D-033, D-051). La automática queda **apagada** hasta la opinión legal; la manual solo para pedidos de derechos documentados y con dos personas.
2. **Purgar la auditoría a los 5 años y rotar respaldos** (D-030.5, D-032): lo purgado no se recupera. No se activa antes de confirmar los plazos.
3. **Pasar a producción con datos reales** (Etapa 7): lo aprueba el CEO tras la demo, con respaldo restaurado y anonimizaciones reaplicadas, aviso de privacidad aceptable, contratos con proveedores firmados, preguntas legales de prioridad A contestadas y procedimiento de incidente escrito.
4. **Datos exportados fuera de la plataforma:** una vez descargado un archivo, la plataforma ya no lo controla; por eso solo el Administrador exporta y con registro (solo informar).

### Insumos que solo el CEO tiene (no son decisiones de producto)
1. Una **orden de compra real**, una **orden de servicio real** y el **Excel de inventario actual**, con los nombres de personas reemplazados (D-028). Sin ellos la Etapa 0 no se cierra y se trabaja con datos de ejemplo declarados.
2. Una **cifra aproximada** de activos, usuarios y órdenes por mes (P-003).
3. El **país o países** de las empresas y si los precios de compra incluyen impuestos (P-004).
4. **A nombre de quién** quedan las cuentas (alojamiento, base de datos, correo, dominio, copias), qué **dominio** de la empresa existe, y **qué persona con suplente** recibe las alertas.
5. **Dos personas del equipo** (no más de tres) para administrar la plataforma antes de cargar datos reales (D-073.1).
6. Si la empresa **usa SAP** (solo antes de INT-2).

### Lo que el CEO sigue haciendo
Aprobar la demo al final de cada etapa antes de empezar la siguiente, tal como dice `CLAUDE.md`.
