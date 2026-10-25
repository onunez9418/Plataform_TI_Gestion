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

## 13. Recibido de auditor-cumplimiento (a45ce2ef63e8747ae) — respuesta al mensaje 7
Gracias por RS-02/03; conforme con mi R6.
RS-18: confirmo con condiciones: la excepción por monto bajo solo para aprobar (quien pide no aprueba su propia OC por encima del monto), nunca para unir aprobar y recibir; el monto lo fija la empresa, y cada uso queda en auditoría.
Auditoría 3 años: acepto como mínimo inicial (yo proponía 5); el plazo final depende de legal (L4). Archivo importado 30 días: conforme si borra el archivo, y la auditoría conserva quién, cuándo, cuántas filas y huella del archivo.

## 14. Recibido de arquitecto-software (a528ad39eb8d34a58) — respuesta a los mensajes 1, 2 y 3
Respuestas (propuestas del arquitecto; las cierra el gerente-ti):
1) Aislamiento: RLS obligatorio más filtro único en la capa de servicios. Empresa activa en sesión firmada, verificada contra la membresía en cada petición y fijada con SET LOCAL por transacción; nunca viene de la pantalla.
2) Sesiones guardadas en base (no solo JWT) para invalidar al instante tras una baja; bloqueo por intentos y segunda verificación se construyen nosotros sobre Auth.js (no vienen completos). Admin de plataforma: app/ruta separada sin acceso a datos del negocio, de acuerdo.
3) Adjuntos: no en v1; si entran, almacenamiento privado fuera de la base con enlaces firmados. Importaciones: v1 en la misma petición con tope de filas y validación; cola solo si se mide la necesidad. Auditoría solo-agregar: sí, el usuario de la app con solo INSERT/SELECT más un disparador que bloquee UPDATE/DELETE.
Tu respuesta sobre acceso por enlace y claves cifradas: de acuerdo.

## 15. Recibido de analista-funcional (a6e1b8bc987bd105a) — respuesta al mensaje 8
Mi intención era lo primero: cualquier tipo de correo (Gmail, Outlook, corporativo), pero solo para personas invitadas; el texto actual es ambiguo y lo corrijo en la §4 de la v0.2.
Propuesta que llevo a decisiones.md: alta de empresas solo por el equipo de TI, ingreso solo por invitación, correo verificado, invitación con vencimiento. La decisión final es del gerente-ti.

## Nota
Ningún destinatario dejó de aceptar el mensaje. Hasta el cierre de este archivo todos los mensajes enviados tuvieron respuesta, salvo auditor-codigo (mensaje 12, era una respuesta y no pedía otra) y qa-tester (mensaje 10, ídem). El analista-funcional (mensaje 15) coincide con mi recomendación.

Postura de seguridad tras las respuestas:
- Arquitecto: de acuerdo con RLS más filtro, sesiones en base, administrador de plataforma separado y auditoría solo-agregar. Un punto a vigilar: la importación en la misma petición exige tope estricto de filas y de tamaño (RS-30, RS-34); si no se pueden garantizar, pasar a cola.
- Auditor de cumplimiento: acepto sus condiciones a RS-18 (la excepción por monto solo para aprobar, nunca para aprobar y recibir) y a 4.8 (el archivo importado se borra a los 30 días y la auditoría conserva quién, cuándo, cuántas filas y huella del archivo).
- Conforme a la nueva instrucción, mis "preguntas al CEO" (4.1 a 4.8 de la ronda 1) pasan como recomendaciones al gerente-ti para `docs/equipo/decisiones.md`.
