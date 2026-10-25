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
- **Motivo:** Separar "quién fue" (identificador, permanente) de "cómo se llama" (dato personal, anonimizable) permite cumplir las dos cosas sin excepciones a la regla de solo agregar.
- **Recomendó:** Auditor de Cumplimiento (H-CUM-01). Decide el Gerente de TI con base en D-018.5 y D-006.
- **Qué cambia:** Diseño de auditoría (Arquitecto, Ingeniero de Datos): nunca guardar valores de campos personales. Se actualiza D-018 y la sección "Datos personales" del documento. QA agrega una prueba: anonimizar y comprobar que la auditoría sigue completa y sin nombres.

### D-031 · Un solo interruptor central para las excepciones de separación de funciones
- **Pregunta:** D-015.4 permite una excepción por empresa. ¿Dónde se activa y quién la controla?
- **Decisión:**
  1. Un **único ajuste por empresa**, en un solo lugar de la configuración, "Excepciones de separación de funciones", con una casilla por cada regla exceptuable de D-015.3 (aprobar lo propio, recibir lo creado o aprobado). Todas **apagadas por defecto**.
  2. En el código existe **una sola función** que responde si una regla está exceptuada; ninguna pantalla ni módulo consulta el ajuste por su cuenta. Así no hay excepciones escondidas.
  3. Solo un Administrador puede cambiarlo y se pide la segunda verificación reciente. Activarlo o apagarlo queda en la auditoría con motivo obligatorio.
  4. Cada vez que se usa la excepción, la orden muestra un aviso visible y se registra un evento en la auditoría.
  5. El Administrador de plataforma no puede activarlo en nombre de una empresa.
- **Motivo:** Una excepción dispersa es un hueco de control; centralizada es auditable y probable.
- **Recomendó:** Auditor de Cumplimiento (H-CUM-02), alineado con D-015.4.
- **Qué cambia:** Documento §5 y §9. QA prueba que, con el ajuste apagado, ninguna ruta permite la excepción, incluso llamando directamente al servidor.

### D-032 · Retención de respaldos (reemplaza D-024.4)
- **Pregunta:** ¿Los respaldos se guardan 5 años como la auditoría?
- **Decisión (propuesta, a confirmar con legal):**
  1. **No.** Guardar respaldos 5 años mantendría datos personales ya anonimizados y costaría mucho. Plan: respaldos diarios durante **30 días** y uno mensual durante **12 meses**.
  2. Como el respaldo más antiguo vive hasta 12 meses, un dato anonimizado puede seguir existiendo en respaldos hasta ese plazo. Se acepta y se declara en el aviso de privacidad.
  3. **Al restaurar** cualquier respaldo, antes de abrir el sistema se **reaplica el registro de anonimizaciones** (una lista aparte que solo guarda el identificador y la fecha, sin datos personales y que se conserva en el sistema vivo). Nadie anonimizado reaparece.
  4. La auditoría de 5 años vive en el sistema, no depende de los respaldos.
  5. Respaldos cifrados y sin mezclar empresas (D-029). Una prueba de restauración incluye la reaplicación de anonimizaciones.
- **Motivo:** El respaldo existe para recuperarse de un error reciente, no para archivo histórico. Menos retención reduce costo y exposición de datos.
- **Recomendó:** Auditor de Cumplimiento (H-CUM-04 pidió definirlo). Plazo: propuesta del Gerente de TI; DevOps estima el costo y legal confirma si 12 meses es aceptable.
- **Qué cambia:** Reemplaza D-024.4 y ajusta D-029. Entra en el escalado como tema legal y de costo.

---

## Escalado al CEO

Todo lo anterior está decidido por el Gerente de TI. Solo esto llega al CEO, y solo porque implica dinero, un tema legal o algo que no se puede deshacer. Se le explica en español claro, sin jerga.

### Dinero (le pedimos que apruebe o rechace)
1. **Servicio de envío de correos** (para invitaciones, enlaces de acceso y avisos de aprobación). Es indispensable porque el acceso es por correo. El costo mensual es bajo, pero es un gasto recurrente que hay que contratar. **Recomendación del Gerente de TI: aprobarlo.** DevOps trae el costo concreto y el proveedor en la Etapa 0.
2. **Alojamiento, respaldos y soporte de la plataforma** (riesgo #14). Hay un costo mensual por servidor, base de datos y copias de seguridad. DevOps presenta el costo estimado en la Etapa 0, antes de programar.
3. **Archivos adjuntos** (D-022): no entra ahora. Si al cierre de la Etapa 4 conviene habilitarlos, implica pagar almacenamiento; se le consultará entonces.

### Legal (le pedimos que consiga una opinión legal; el equipo no la da)
1. **Qué ley de protección de datos aplica** (según el país o países de las empresas) y si hay que registrar el banco de datos de usuarios y empleados ante la autoridad. Por ejemplo, para Perú existe una ley específica; hay que confirmarlo con un abogado.
2. **Confirmar los plazos de D-024 y D-032**: 5 años de auditoría, 2 años antes de anonimizar a una persona dada de baja, 30 días para archivos importados, respaldos diarios de 30 días y mensuales de 12 meses.
3. **Texto del aviso de privacidad y de los términos de uso**, y si la plataforma se considera proveedor de las empresas o titular de los datos.
4. **Si guardar datos de varias empresas en un mismo servidor, o en un servidor en otro país**, exige requisitos especiales.
5. **Contratos con los proveedores** de alojamiento y de correo.
6. **Si el CEO planea usar la plataforma con empresas que no son suyas** (ofrecerla a terceros), esto cambia contratos, soporte y costos. Para la v1 asumimos que solo se usa con las empresas que el CEO designe. No necesitamos una respuesta ahora, solo que nos avise si ese plan existe.

### Irreversible (se le explica antes de ejecutarse)
1. **Anonimizar o borrar datos personales** no se puede deshacer. Por eso los plazos de D-024 son propuesta hasta que legal los confirme; no se activa ninguna anonimización automática antes de esa confirmación.
2. **Pasar a producción con datos reales de una empresa** (Etapa 7): lo aprueba el CEO tras la demo, con el respaldo y la restauración ya probados.

### Insumos que solo el CEO tiene (no son decisiones de producto)
1. Una **orden de compra real**, una **orden de servicio real** y el **Excel de inventario actual**, con los nombres de personas reemplazados (D-028). Sin ellos la Etapa 0 no se cierra y se trabaja con datos de ejemplo declarados como tales.
2. Una **cifra aproximada** de activos, usuarios y órdenes por mes (pendiente #4), para dimensionar.
3. El **país o países** de las empresas y si los precios de sus compras incluyen impuestos (para configurar los impuestos por línea).

### Lo que el CEO sigue haciendo
Aprobar la demo al final de cada etapa antes de empezar la siguiente, tal como dice `CLAUDE.md`.
