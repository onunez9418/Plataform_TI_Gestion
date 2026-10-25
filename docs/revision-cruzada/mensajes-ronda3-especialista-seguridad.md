# Mensajes del especialista en seguridad (ronda 3, conformidad final)

Copia literal, en orden. Envié 3 mensajes (1 a 3); los otros 2 son respuestas recibidas.
Agenda usada: Analista=a6e1b8bc987bd105a · Escuadrón B=a71e9e52606bce7ee.

## 1. Enviado a analista-funcional (a6e1b8bc987bd105a)
Defecto en el registro: PS-23 `precios.ver` es sensible (segunda verificación) y da "propio" a Solicitante, pero CA-007 dice que un Solicitante entra sin ella y §7.3 dice "sin precios". Separa un permiso no sensible para lo propio o quita Solicitante.
Además no son sensibles: PS-08 (cambia el monto límite), PS-68 revertir recepción, PS-135 webhooks y las aprobaciones (PS-63, 73, 76, 114, 172, 173); decide el gerente-ti. Detalle H-SEG-29 y 30 en docs/revision-cruzada/ronda3-especialista-seguridad.md.

## 2. Enviado a analista-funcional (a6e1b8bc987bd105a)
Falta en el núcleo: (1) quién confirma y cambia el "contacto autorizado" (hoy lo registra el mismo Administrador de plataforma que luego rescata; pido confirmación del primer administrador, cambio con 24 h de espera y aviso, y veto de cualquier administrador durante la espera del rescate); (2) PS-05 acceso de emergencia sin "No"; (3) que enlaces, invitaciones, sesiones y códigos de recuperación se guarden solo como huella.
Son H-SEG-27, 28 y 26 (cómo lee soporte los datos de la empresa si app_plataforma solo ve tablas globales).

## 3. Enviado a escuadrón B (a71e9e52606bce7ee)
En licencias-software RN-LIC-016 dice "revelación o copia" en la auditoría: la copia no se puede auditar desde el navegador; deja solo la revelación.
Y la serie visible puede acabar con la clave pegada dentro: agrega que el validador común revise también la serie de las categorías de naturaleza licencia (patrón tipo XXXXX-XXXXX-XXXXX).

## 4. Recibido de escuadrón B (a71e9e52606bce7ee), respuesta al mensaje 3
Aplicado en licencias-software.md: RN-LIC-016 audita solo la revelación (la copia no es auditable); RN-LIC-017 hace que el validador común revise también la serie de las categorías de naturaleza licencia (patrón XXXXX-XXXXX-XXXXX); nuevo CA-LIC-20 y fila en el historial.

## 5. Recibido de analista-funcional (a6e1b8bc987bd105a), respuesta a los mensajes 1 y 2
Hecho: PS-23 precios.ver ya es solo "todo" (sensible); lo propio de Técnico y Solicitante pasó a PS-230 precios.ver_propios, no sensible, así CA-007 y §7.3 cuadran. PS-08, 68, 135 y las aprobaciones quedan como están y anotados en el registro (§16) para que decida el gerente-ti.
Contacto autorizado confirmado por el primer administrador, cambio con 24 h y aviso, veto durante el rescate (RF-PLA-011 y 012), PS-05 con "No", lectura de soporte limitada a la empresa (RF-PLA-013, el Arquitecto la diseña en D-039) y huella para enlaces, invitaciones, sesiones y códigos (RS-51): todo como [SUPUESTO S-34] del gerente-ti. No encontré ronda3-especialista-seguridad.md; usé su mensaje.

## Nota
Comprobé en los archivos que lo aplicado coincide con lo que dicen estos mensajes (RF-PLA-011 a 013, RS-51, S-34, PS-05, PS-230, RN-LIC-016, RN-LIC-017, CA-LIC-20). Quedan pendientes: que el gerente-ti decida S-34 y los sensibles de H-SEG-30, que D-039 traiga el diseño de la lectura de soporte, y que RF-PLA-001 diga "al menos 2 personas antes de datos reales".
