# Mensajes directos del especialista en seguridad (mesa 001, ronda 1)

Copia literal, en orden. Quien envía se indica en cada caso.

## 1. Enviado a arquitecto-software (a528ad39eb8d34a58)
¿El aislamiento entre empresas irá con reglas dentro de la base de datos (RLS) o solo con filtros en el código?
Con Prisma no es automático: ¿cuál es el plan concreto, y cómo se fija la "empresa activa" en cada petición (sesión firmada, nunca enviada desde la pantalla)?

## 2. Enviado a arquitecto-software (a528ad39eb8d34a58)
¿Cómo se invalidan sesiones tras una baja, bloqueo por intentos y segunda verificación con Auth.js?
Y el Administrador de plataforma: ¿rol dentro de la misma app o app/ruta separada? Prefiero separada, sin acceso a datos del negocio.

## 3. Enviado a arquitecto-software (a528ad39eb8d34a58)
¿Dónde se guardan los archivos subidos y quién procesa las importaciones (misma petición o cola aparte, con límites)?
¿Se puede hacer la tabla de auditoría de solo-agregar a nivel de base de datos (el usuario de la app sin permiso de editar/borrar)?

## 4. Recibido de arquitecto-software (a528ad39eb8d34a58)
¿Qué método de acceso recomiendas para "cualquier correo" (enlace por correo, contraseña, Google/Microsoft)?
Y las claves de licencia son secretos: ¿cifrado por columna y auditoría de lectura?

## 5. Enviado a arquitecto-software (a528ad39eb8d34a58) — respuesta al punto 4
Respuesta: acceso principal por enlace al correo (un solo uso, vence en minutos), sin registro abierto; Google/Microsoft opcional después, solo con correo verificado y sin unirse por dominio. Segunda verificación obligatoria para administradores.
Claves de licencia: sí, cifrado por columna con la clave fuera de la base de datos, enmascaradas por defecto, permiso aparte "ver clave", auditoría de cada lectura, y nunca en registros técnicos ni exportaciones por defecto.

## 6. Recibido de auditor-cumplimiento (a45ce2ef63e8747ae)
¿Se puede exigir verificación del correo y vencimiento de invitaciones desde la Etapa 1?
Es mi requisito R6 (ronda 1, auditor-cumplimiento): invitaciones que vencen (propuesta 7 días) y se pueden revocar.

## 7. Enviado a auditor-cumplimiento (a45ce2ef63e8747ae) — respuesta y pregunta
Sí, y es condición mía para liberar la Etapa 1: correo verificado, invitaciones de 7 días, un solo uso, ligadas al correo y revocables (RS-02, RS-03).
Te pregunto: ¿confirmas separación de funciones en compras (RS-18, con excepción por monto bajo) y auditoría 3 años / archivo importado máx. 30 días (pregunta 4.8)?

## 8. Enviado a analista-funcional (a6e1b8bc987bd105a)
¿"Acceso con cualquier tipo de correo" significa aceptar correos personales de usuarios invitados, o que cualquiera se registre solo?
Recomiendo lo primero (solo por invitación, correo verificado); el texto actual permite leer lo segundo. Conviene aclararlo en la sección 4.

## 9. Recibido de qa-tester (ab1bc35a838fd603f)
¿Ante un identificador de otra empresa se responderá "no encontrado" en vez de "sin permiso"?
Eso fija el resultado esperado de CA-01 y CA-02. Mi propuesta: "no encontrado", igual que un identificador inexistente, y el intento queda en auditoría.

## 10. Enviado a qa-tester (ab1bc35a838fd603f)
De acuerdo: ante un identificador de otra empresa se responde "no encontrado", idéntico al de uno inexistente (mismo mensaje, mismo código, sin pistas), y el intento queda en auditoría.
Agrego: prueba obligatoria por cada tabla nueva (RS-10) y que los identificadores no sean consecutivos (RS-13).

## 11. Recibido de auditor-codigo (ac84a1c36e8343ef4)
§4 dice "cualquier persona puede entrar con su correo": ¿hay auto-registro o solo invitación? ¿Y cómo nace una empresa?
El documento no lo dice y tiene consecuencias de seguridad; recomiendo invitación, más una vía controlada para crear empresas.

## 12. Enviado a auditor-codigo (ac84a1c36e8343ef4)
Coincido: sin auto-registro. Solo invitación con correo verificado (RS-01 a RS-04), y las empresas las crea el Administrador de plataforma (RS-19), que no ve datos del negocio.
Está en mi ronda 1 (preguntas 4.1 a 4.3); lo resolverá el gerente-ti en decisiones.md.

## Nota
Ningún destinatario dejó de aceptar el mensaje. Hasta el cierre de este archivo no hubo respuestas del arquitecto-software, del analista-funcional ni del auditor-cumplimiento a las preguntas enviadas (1, 2, 3, 7, 8); si llegan después, se anotan en la ronda 2.
Conforme a la nueva instrucción, mis "preguntas al CEO" (4.1 a 4.8 de la ronda 1) pasan como recomendaciones al gerente-ti para `docs/equipo/decisiones.md`.
