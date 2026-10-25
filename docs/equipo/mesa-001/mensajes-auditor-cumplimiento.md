# Mensajes directos del Auditor de Cumplimiento: Mesa #001, Ronda 1

Registro literal, en orden. Las direcciones son las de la agenda del equipo.

## Enviados (los 3 iniciales)

### 1. A ingeniero-datos (aaec930aef352e470)

> ¿La auditoría puede vivir en una tabla que la aplicación solo pueda agregar (sin editar ni borrar)?
> Es mi requisito R3 (ronda 1, auditor-cumplimiento). Incluye que ni el Administrador pueda alterarla.

### 2. A especialista-seguridad (abd816d90e8b59b90)

> ¿Se puede exigir verificación del correo y vencimiento de invitaciones desde la Etapa 1?
> Es mi requisito R6 (ronda 1, auditor-cumplimiento): invitaciones que vencen (propuesta 7 días) y se pueden revocar.

### 3. A analista-funcional (a6e1b8bc987bd105a)

> Mi R4 (separación de funciones en compras) cambia las secciones 5 y 9. ¿Quieres que yo redacte el texto propuesto?
> Si prefieres redactarlo tú, el contenido está en mi ronda 1 (R4).

## Recibidos y respondidos

### 4. Recibido de disenador-ux (a3478b32a1d10dd5e)

> ¿Podemos guardar una lista de "personas receptoras" que no son usuarios?
> Propongo registrar nombre, área y correo de quien recibe un equipo, sin darle acceso. ¿Qué datos mínimos y qué plazo de conservación exigirías?

### 5. Enviado a disenador-ux (a3478b32a1d10dd5e), respuesta

> Sí se puede, con mínimo necesario: nombre, área y correo corporativo (correo opcional; el personal solo si la empresa lo decide). Sin documento de identidad, teléfono ni dirección.
> Conservación (propuesta, a decidir por gerente-ti y confirmar con legal): mientras tenga activos asignados, más 2 años; luego anonimizar conservando el historial. Debe tener estado activo/dado de baja, no se borra, y cada alta o cambio queda en auditoría.

### 6. Recibido de especialista-seguridad (abd816d90e8b59b90), respuesta al mensaje 2

> Sí, y es condición mía para liberar la Etapa 1: correo verificado, invitaciones de 7 días, un solo uso, ligadas al correo y revocables (RS-02, RS-03).
> Te pregunto: ¿confirmas separación de funciones en compras (RS-18, con excepción por monto bajo) y auditoría 3 años / archivo importado máx. 30 días (pregunta 4.8)?

### 7. Enviado a especialista-seguridad (abd816d90e8b59b90), respuesta

> Gracias por RS-02/03; conforme con mi R6.
> RS-18: confirmo con condiciones: la excepción por monto bajo solo para aprobar (quien pide no aprueba su propia OC por encima del monto), nunca para unir aprobar y recibir; el monto lo fija la empresa, y cada uso queda en auditoría.
> Auditoría 3 años: acepto como mínimo inicial (yo proponía 5); el plazo final depende de legal (L4). Archivo importado 30 días: conforme si borra el archivo, y la auditoría conserva quién, cuándo, cuántas filas y huella del archivo.

### 8. Recibido de ingeniero-datos (aaec930aef352e470), respuesta al mensaje 1

> Sí, la auditoría puede ser una tabla donde la aplicación solo agrega.
> El rol de base de datos de la aplicación recibe solo INSERT y SELECT sobre esa tabla (se le quitan UPDATE, DELETE y TRUNCATE) y un disparador rechaza cualquier edición o borrado como segunda barrera. "Administrador" es un rol de la aplicación, no de la base, así que no tiene ningún camino para alterarla.
> Límite honesto: quien administre el servidor de base de datos (superusuario) sí podría. Mitigación propuesta: cuenta de superusuario separada y registrada, y copia externa de la auditoría (a coordinar con devops).

### 9. Enviado a ingeniero-datos (aaec930aef352e470), respuesta

> Conforme con INSERT/SELECT únicamente más disparador: cubre mi R3 frente al Administrador de la app.
> El límite del superusuario lo registro como riesgo residual; pido cuenta separada y registrada, copia externa de la auditoría (con devops) y que la auditoría registre también los cambios de permisos sobre esa tabla.

Sin respuesta al momento de cerrar este registro: analista-funcional (mensaje 3).

## Nota sobre las preguntas al CEO

Por la nueva instrucción del CEO, mis preguntas P1 a P9 de la ronda 1 pasan a ser recomendaciones para el gerente-ti, que las decide en `docs/equipo/decisiones.md`. Mis puntos L1 a L12 siguen siendo de asesoría legal y se escalan al CEO. No envié un mensaje aparte al gerente-ti porque el límite de la mesa es de 3 mensajes iniciales.
