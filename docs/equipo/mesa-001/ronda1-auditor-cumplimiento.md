# Mesa de revisión #001 · Ronda 1 · Auditor de Cumplimiento y Privacidad

Destino previsto: `/home/user/Plataform_TI_Gestion/docs/equipo/mesa-001/ronda1-auditor-cumplimiento.md`
(No se pudo escribir ahí porque la sesión estaba en modo plan. Este texto es el contenido a copiar.)

Documento revisado: `docs/documento-funcional.md` v0.1 y `docs/equipo/riesgos.md`.
Nota de método: HECHO = se puede comprobar leyendo el documento. OPINIÓN = mi criterio profesional. LEGAL = punto a confirmar con asesoría legal; no es opinión legal.

## 1. Qué está bien

- La separación entre empresas está dicha desde el principio (secciones 3 y 4) y está en el registro de riesgos (#2).
- Existe una sección de auditoría (sección 11) y el historial de movimientos de activos (sección 8). Hay intención de trazabilidad.
- La aprobación de compras es configurable (sección 9) y existe el rol Solicitante separado del que aprueba (sección 5).
- La recepción de mercadería es un paso aparte de la compra (sección 9), lo cual ayuda a separar funciones.
- Los pendientes están marcados y no inventados (sección 12).

## 2. Qué me preocupa

### 2.1 Datos personales sin inventario ni finalidad (secciones 4, 5, 8, 10)
- HECHO: se guardan correos de cualquier tipo (sección 4), a quién está asignado cada activo (sección 8), quién solicita y quién ejecuta órdenes (sección 10), y el historial de todo eso. El documento no dice para qué se usa cada dato, quién lo ve ni cuánto tiempo se conserva.
- HECHO: se acepta correo personal (Gmail, etc.). Eso significa guardar datos personales de gente que quizá no es empleada.
- HECHO: campos como IMEI y número de línea del celular (sección 6) pueden identificar a una persona cuando el celular está asignado a ella.
- OPINIÓN: sin finalidad y retención definidas, la plataforma nace con una deuda de privacidad difícil de corregir después.

### 2.2 Qué pasa cuando alguien se va de la empresa (secciones 4, 8)
- HECHO: el documento no dice qué ocurre con un usuario dado de baja que tiene activos asignados, órdenes abiertas o aprobaciones pendientes.
- HECHO: tampoco dice si se puede "borrar" un usuario. Si se borrara, el historial quedaría roto (activo asignado a nadie). Si nunca se borra, se conservan datos personales para siempre.
- OPINIÓN: hay que separar "desactivar acceso" (inmediato) de "anonimizar datos personales" (según plazo), y no permitir desactivar a alguien con activos asignados sin resolverlos.

### 2.3 Auditoría débil (sección 11)
- HECHO: la sección dice "quién creó, modificó, aprobó o eliminó cada registro importante". No cubre: cambios de roles y permisos, invitaciones, inicios de sesión y fallos de acceso, cambios de configuración de aprobaciones o montos, consultas de la propia auditoría, exportaciones, ni cambios de estado de activos.
- HECHO: no dice que se guarde el valor anterior y el nuevo, ni que el registro sea inalterable. "Eliminó" sugiere que hay borrado de registros; no se define si es borrado real.
- HECHO: "registro importante" no está definido.
- HECHO: el rol Jefatura TI "ve auditoría", pero el Administrador tiene "todo" (sección 5), lo que incluiría poder alterarla si el diseño no lo impide.
- OPINIÓN: en un sistema multiempresa, el administrador de una empresa no debería poder editar ni borrar su propia auditoría, ni siquiera por configuración.

### 2.4 Separación de funciones en compras (secciones 5, 9)
- HECHO: el documento no prohíbe que quien crea una OC la apruebe. El rol Administrador tiene "todo" y Jefatura TI "aprueba órdenes"; nada impide que un mismo usuario con ambos permisos solicite y apruebe.
- HECHO: el rol Almacén "recibe mercadería, registra series, mueve stock" y la recepción crea activos automáticamente. No se dice que quien recibe no pueda aprobar ni haber creado la orden.
- HECHO: no se define qué pasa si cambia la orden después de aprobada (precio, cantidad, proveedor): ¿vuelve a aprobación?
- HECHO: el proveedor es un catálogo que edita el administrador (sección 6). Quien crea o cambia proveedores, quien pide y quien aprueba podrían ser la misma persona.
- OPINIÓN: es el riesgo de fraude más claro del documento. La regla debe ser técnica (el sistema la impide), no solo un procedimiento.

### 2.5 Permisos y mínimo privilegio (sección 5)
- HECHO: el Administrador tiene "todo" y el primer usuario de cada empresa lo es automáticamente (sección 4). Esto no distingue entre administrar usuarios y operar compras.
- HECHO: el rol Técnico "gestiona inventario y órdenes de servicio" sin límite; podría dar de baja activos sin segunda persona.
- HECHO: "Solo lectura" ve todo, incluidos datos personales de asignaciones y precios de compra. No dice qué datos quedan ocultos.
- HECHO: el administrador puede crear roles propios; no se dice si hay límites (por ejemplo, un rol que se otorgue a sí mismo permisos).
- OPINIÓN: debe haber al menos una regla de que nadie se auto-asigna permisos ni se auto-aprueba.

### 2.6 Invitaciones y cuentas (sección 4)
- HECHO: "cualquier persona puede entrar con su correo" y el admin invita por correo. No se dice quién verifica que el correo es de quien dice, cuánto dura la invitación, ni qué pasa si el correo se reasigna a otra persona.
- OPINIÓN: sin verificación del correo y vencimiento de invitaciones, una invitación enviada a un correo equivocado da acceso a datos de la empresa.
- HECHO: una persona en varias empresas implica que su perfil (nombre, correo) es compartido entre empresas. Eso cruza el principio de "cada empresa ve solo lo suyo" para los datos personales del propio usuario.

### 2.7 Consentimiento y aviso (documento completo)
- HECHO: el documento no menciona aviso de privacidad, términos de uso, ni qué se informa a quien recibe un activo asignado.
- LEGAL: ver sección 6 más abajo.

### 2.8 Constancia de entrega y devolución (sección 8)
- HECHO: se habla de "constancia" pero no se define qué contiene (¿firma, aceptación en pantalla, documento imprimible?) ni cuánto tiempo se guarda.
- OPINIÓN: sin aceptación del receptor, un conflicto por un equipo perdido se vuelve la palabra de uno contra otro.

### 2.9 Operación y documentación (documento completo)
- HECHO: el documento no habla de respaldos, restauración, plan de reversa de despliegues, manual de usuario ni manual del administrador.
- HECHO: el registro de riesgos no incluye ningún riesgo de privacidad, de auditoría ni de separación de funciones. Los riesgos 1 a 5 son técnicos o de negocio.
- OPINIÓN: se pide a un CEO que confíe sus datos y los de varias empresas; la capacidad de recuperarse de un error es parte del contrato.

### 2.10 Datos reales en pruebas (riesgo #4, pendiente #7)
- HECHO: el pendiente #7 pide "el Excel de inventario actual" y documentos reales. Ese Excel casi seguro tiene nombres de empleados.
- HECHO: la regla 4 de CLAUDE.md prohíbe datos reales de clientes en el repositorio.
- OPINIÓN: hay que decidir antes dónde viven esos archivos y quién los ve (o anonimizarlos antes de compartirlos con el equipo).

## 3. Qué cambiaría (requisitos concretos para el documento funcional)

R1. Nueva sección "Datos personales". Tabla con: dato, finalidad, quién lo ve, plazo de conservación. Mínimo: nombre, correo, rol, activos asignados, historial de asignaciones, IMEI/línea cuando esté asignado, registro de accesos. Regla: no guardar documento de identidad, dirección ni teléfono personal en la v1 salvo decisión expresa del CEO.

R2. Ciclo de vida del usuario. Estados: Invitado, Activo, Suspendido, Dado de baja. Reglas:
- No se borra a un usuario; se desactiva y se anonimiza después del plazo definido.
- No se puede dar de baja a un usuario con activos asignados sin reasignarlos o registrar su devolución. El sistema avisa y bloquea.
- Las órdenes abiertas del usuario se reasignan o cancelan con motivo.
- La anonimización conserva el historial pero reemplaza nombre y correo por una referencia (ejemplo "Usuario dado de baja 0042"); el historial de activos sigue siendo útil.
- Cada baja y cada anonimización deja registro de auditoría.

R3. Auditoría (reescribir sección 11). Debe cubrir como mínimo:
- Creación, cambio (con valor anterior y nuevo), aprobación, rechazo, anulación, baja y asignación de: usuarios, roles, permisos, catálogos, SKUs, activos, OC, recepciones, OS, configuración de aprobaciones y montos.
- Inicios de sesión exitosos y fallidos, invitaciones enviadas y aceptadas, cambios de empresa activa.
- Exportaciones o descargas masivas.
- Cada entrada: quién, cuándo, qué empresa, qué cambió, desde dónde (IP o equipo si es posible), y motivo cuando aplique.
- Inalterable: la aplicación no ofrece editar ni borrar entradas, ni siquiera al Administrador. Solo se agregan.
- Consulta restringida por rol; la consulta de auditoría también queda registrada.
- Plazo de conservación definido (propuesta: 5 años, a confirmar con legal y con el CEO).
- "Eliminar" en el documento se entiende como "dar de baja o anular", nunca borrado real de registros con historia.

R4. Separación de funciones obligatoria (el sistema la impide):
- Quien crea o edita una OC no puede aprobarla.
- Quien aprueba no puede recibir esa misma OC.
- Quien recibe no puede haberla creado ni aprobado.
- Excepción solo por decisión explícita del CEO, configurable por empresa, y cada uso de la excepción queda en auditoría con un aviso visible.
- Cambio de precio, cantidad o proveedor en una OC aprobada la devuelve a "Pendiente de aprobación".
- Crear/modificar proveedores es un permiso distinto de crear OC.
- Nadie aprueba su propia solicitud.
- Dar de baja un activo de valor por encima de un monto definido requiere segunda persona (monto por definir).

R5. Permisos mínimos.
- Separar "Administrador de la empresa" (usuarios, roles, configuración) de los permisos operativos (comprar, aprobar, recibir). El Administrador por defecto no recibe aprobar ni recibir; puede asignárselos, pero queda auditado.
- Un usuario no puede cambiar sus propios permisos ni crear un rol con más permisos de los que él mismo tiene.
- Todo rol nuevo parte sin permisos (nada abierto por defecto).
- Siempre debe existir al menos un administrador activo por empresa; el sistema impide quitar al último.
- Solo lectura no ve precios ni datos personales de asignación salvo que el administrador lo active.
- Los roles iniciales se revisan contra esta regla en la Etapa 0 (lo haré yo con una matriz rol x permiso).

R6. Invitaciones y cuentas.
- El correo se verifica antes de dar acceso.
- Las invitaciones vencen (propuesta: 7 días) y se pueden revocar.
- Un administrador de una empresa solo ve de un usuario lo necesario para esa empresa (nombre, correo, rol en esa empresa), no a qué otras empresas pertenece.
- Al salir de una empresa, el usuario pierde acceso a esa empresa pero conserva su cuenta en las demás.

R7. Constancia de entrega y devolución. Definir contenido mínimo: activo, serie, persona, fecha, estado en que se entrega, quién entrega, aceptación del receptor (en pantalla o documento firmado adjunto). Se conserva mientras exista el activo más el plazo de retención.

R8. Aviso de privacidad y términos. Pantalla de aceptación en el primer ingreso (versión y fecha de aceptación quedan registradas). Texto lo redacta o revisa legal. Aviso al empleado que recibe un activo de qué datos se guardan sobre él (a confirmar cómo se comunica, por la empresa o por la plataforma).

R9. Derechos de las personas. Procedimiento para atender solicitudes de acceso, corrección y eliminación de datos personales: quién las recibe, en cuánto tiempo, qué se entrega. Debe ser posible exportar los datos de una persona y anonimizarla sin romper el historial.

R10. Operación (sección nueva "Continuidad y documentación"):
- Respaldo automático diario, con restauración probada al menos una vez antes de cada etapa que pase a uso real.
- Cada despliegue tiene plan de reversa escrito.
- Los respaldos tienen el mismo plazo de retención y las mismas protecciones que los datos; una anonimización debe aplicarse también cuando se restaura un respaldo antiguo (procedimiento a definir).
- Manual del usuario y manual del administrador al cierre de cada etapa; manual de operación (respaldo/restauración) antes de producción.

R11. Datos de prueba. Ningún dato personal real en repositorio ni en el entorno de pruebas. El Excel actual se anonimiza (nombres reemplazados) antes de compartirlo con el equipo, o se trabaja en un lugar controlado que defina DevOps/Seguridad.

R12. Registro de riesgos: agregar tres riesgos (privacidad sin definir finalidad/retención; fraude por falta de separación de funciones; pérdida o alteración de la auditoría). Los registraría el Gerente de TI.

R13. Etapa 1 debe incluir, además de login, el ciclo de vida del usuario (R2), la auditoría inalterable (R3) y la matriz de roles (R5). Si la auditoría llega tarde, todo lo hecho antes queda sin rastro.

## 4. Preguntas para el CEO (cerradas)

P1. Cuando alguien deja la empresa y tenía activos asignados, ¿qué debe pasar?
- A) El sistema no deja desactivarlo hasta que devuelva o se reasignen los activos (recomendado).
- B) Se desactiva igual y los activos quedan "sin responsable" con una alerta.
- C) Otra regla.
Recomiendo A.

P2. Quien pide una compra, ¿puede aprobarla?
- A) Nunca (recomendado).
- B) Solo si es el CEO o el máximo cargo de la empresa.
- C) Depende de cada empresa.
Recomiendo A, con B como excepción configurable y auditada.

P3. Quien recibe la mercadería, ¿puede ser quien aprobó la compra?
- A) Nunca (recomendado).
- B) Sí, en empresas pequeñas donde hay pocas personas.
Recomiendo A, con la excepción B solo por decisión suya y por empresa.

P4. ¿Por cuánto tiempo conservar el historial de auditoría?
- A) 2 años.
- B) 5 años (recomendado, a confirmar con legal).
- C) 10 años.
- D) Sin límite.

P5. ¿Por cuánto tiempo conservar los datos personales de un usuario dado de baja antes de anonimizarlos?
- A) 1 año.
- B) 2 años (recomendado).
- C) Anonimizar apenas se da de baja.
Recomiendo B, a validar con legal.

P6. ¿Se permiten correos personales (Gmail, etc.) para trabajadores de la empresa?
- A) Sí, sin restricción (como dice hoy el documento).
- B) Sí, pero cada empresa decide si permite solo ciertos dominios (recomendado).
- C) Solo correos corporativos.
Recomiendo B.

P7. ¿Quién debe poder ver el historial de auditoría de una empresa?
- A) Solo Jefatura TI y Administrador (recomendado).
- B) Cualquier rol con permiso que el administrador asigne.
Recomiendo A como punto de partida.

P8. ¿El empleado debe aceptar en pantalla la entrega de un equipo?
- A) Sí, con un enlace o clave que recibe por correo.
- B) No, basta que el técnico lo registre y firme un papel que se sube (recomendado para empezar).
- C) Ambas opciones.
Recomiendo B para la v1 y evaluar A después.

P9. El Excel con el inventario actual, ¿puede traer nombres de personas?
- A) Sí; lo compartimos tal cual con acceso restringido.
- B) Lo entrega con los nombres reemplazados (recomendado).
Recomiendo B.

## 5. Puntos a confirmar con asesoría legal (no es opinión legal)

Verificar con abogado o responsable de datos de cada país donde operen las empresas:
L1. Si les aplica la normativa de protección de datos del país (en Perú, la Ley de Protección de Datos Personales y su reglamento; en otros países, la que corresponda) y si la empresa es titular del banco de datos y la plataforma un encargado/proveedor.
L2. Si hay que registrar o declarar el banco de datos de usuarios y empleados ante la autoridad del país.
L3. Si el aviso de privacidad y el consentimiento deben recogerse en la plataforma o los recoge cada empresa; texto exacto.
L4. Plazos mínimos y máximos de conservación para auditoría, historial de activos y constancias de entrega; si hay obligaciones contables o tributarias sobre órdenes de compra.
L5. Si la información de varias empresas guardada en un mismo servidor o en un servidor en otro país implica transferencia internacional de datos, y qué requisitos hay.
L6. Si las empresas del grupo son entidades legales distintas y qué pasa cuando una persona está en dos de ellas (¿cada empresa es responsable de su parte del perfil?).
L7. Si registrar IP y accesos de empleados requiere aviso específico.
L8. Si descontar o exigir pago al empleado por un equipo perdido (si el CEO lo quisiera) puede apoyarse en la constancia de la plataforma. Ámbito laboral, no lo trato yo.
L9. Procedimiento y plazos para atender solicitudes de acceso, corrección y eliminación de datos.
L10. Qué hacer con los respaldos cuando se pide eliminar a una persona.
L11. Si un IMEI o número de línea asociado a una persona se considera dato personal en el país.
L12. Contrato con los proveedores técnicos (alojamiento, correo de invitaciones) y qué cláusulas de datos requiere.

## 6. Mensajes directos

Ninguno enviado. La sesión estaba en modo plan (solo lectura) y enviar mensajes cambia el estado del equipo, así que no los envié. Lo que habría preguntado, para que la Jefatura los envíe si procede (máximo 3):
1. A ingeniero-datos: "¿La auditoría puede vivir en una tabla que la aplicación solo pueda agregar (sin editar ni borrar)? Es requisito mío R3." 
2. A especialista-seguridad: "¿Se puede exigir verificación del correo y vencimiento de invitaciones desde la Etapa 1? Es requisito R6."
3. A analista-funcional: "Mi R4 (separación de funciones en compras) cambia sección 5 y 9. ¿Quieres que lo redacte yo como texto propuesto?"

## 7. Veredicto provisional

Conforme con observaciones, condicionado a que el documento v0.2 incorpore R1 a R5 antes de empezar la Etapa 1. Sin R3 (auditoría inalterable) y R4 (separación de funciones), mi veredicto sería no conforme.

## 8. Nota para la Jefatura de Proyecto

- Lo que hice: leí el documento funcional v0.1 y el registro de riesgos; preparé mi ronda 1 con 13 requisitos y 9 preguntas para el CEO.
- Archivo: este plan. No se pudo escribir en `docs/equipo/mesa-001/` por modo plan.
- Dudas: ver preguntas P1 a P9 y puntos legales L1 a L12.
- Sigue: copiar a destino, enviar los 3 mensajes si procede, y rehacer la revisión con la v0.2.
