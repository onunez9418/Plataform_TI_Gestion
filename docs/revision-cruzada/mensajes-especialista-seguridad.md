# Mensajes del especialista en seguridad (Oleada C, revisión cruzada)

Copia literal, en el orden en que se enviaron o llegaron. Envié 4 mensajes por iniciativa propia (1 a 4); el resto son respuestas a preguntas recibidas.
Agenda usada: gerente-ti=af67786cb0e53167c · arquitecto-software=a528ad39eb8d34a58 · disenador-ux=a3478b32a1d10dd5e · ingeniero-datos=aaec930aef352e470 · qa-tester=ab1bc35a838fd603f · auditor-codigo=ac84a1c36e8343ef4 · auditor-cumplimiento=a45ce2ef63e8747ae · analista-funcional=a6e1b8bc987bd105a.

## 1. Enviado a arquitecto-software (a528ad39eb8d34a58)
¿Los procesos nocturnos de 10 módulos (avisos, renovaciones, fotos mensuales) recorrerán empresa por empresa con SET LOCAL, o usarán un rol que salta RLS? Pido lo primero; el rol de la app no debe ser dueño ni tener BYPASSRLS.
Y para webhooks (INT): el secreto debe guardarse cifrado (no "huella", porque hay que firmar con él); ¿la salida va por un proceso aislado que resuelva DNS y bloquee 169.254.x.x, red privada y redirecciones?

## 2. Enviado a auditor-cumplimiento (a45ce2ef63e8747ae)
¿Aceptas que la auditoría guarde nombre/correo cifrados con una clave por persona, que se destruye al anonimizar, en vez de reescribir filas (S-PER-07 rompe "solo se agrega")?
También: la cola de "pedir mis datos" (POR/AYU) debe excluirse de búsquedas, reportes y exportaciones, y el Administrador no puede atender un pedido sobre sí mismo; ¿lo ves bien?

## 3. Enviado a ingeniero-datos (aaec930aef352e470)
¿Puede la tabla "Estado del correo" (NOT, rebotes por correo) llevar empresa, o debe ser global? Hoy no tiene empresa y un rebote en A marcaría el correo en B.
Y las referencias a "objeto (tipo e identificador)" de NOT y auditoría no admiten clave foránea compuesta con empresa; ¿qué restricción o disparador propones para que la base impida cruzar empresas?

## 4. Enviado a analista-funcional (a6e1b8bc987bd105a)
¿Puedes fijar un solo identificador para los permisos transversales? Hoy "ver datos personales" aparece como datos-personales.ver, datos_personales.ver y personas.ver_datos, y "exportar" tiene 12 variantes.
Propongo un registro único de permisos sensibles en el documento funcional; mi lista consolidada va en docs/revision-cruzada/especialista-seguridad.md.

## 5. Recibido de auditor-cumplimiento (a45ce2ef63e8747ae)
¿Estás de acuerdo en que "ver clave completa de licencia" sea solo del Administrador por defecto (matriz del núcleo), y no del Técnico como pone LIC (SUP-LIC-10)?
Y: ENT, ONB y CAM envían correos a Personas sin Usuario, a una dirección no verificada; ¿qué contenido máximo aceptas en esos correos? (H-CUM-06 y H-CUM-05)

## 6. Recibido de arquitecto-software (a528ad39eb8d34a58)
¿Aceptas una clave maestra fuera de la base con cifrado por empresa (TOTP de 2FA, claves de licencia, secreto de webhooks)?
Dos cosas más: integraciones-api guarda "huella del secreto" del webhook, pero para firmar hace falta el secreto cifrado (un hash no sirve). Y los filtros de correo pueden gastar el enlace de ingreso de un solo uso; propongo que el enlace abra una página con botón "Entrar".

## 7. Enviado a auditor-cumplimiento (a45ce2ef63e8747ae), respuesta al mensaje 5
Sí: "ver clave completa" solo del Administrador por defecto (matriz del núcleo); la empresa puede dárselo al Técnico, con cada lectura auditada y tope por hora.
Correos a Personas sin Usuario, máximo: tipo de aviso, código del acta o de la Persona (E-000123, P-0042), fecha y nombre de la empresa. Sin serie, IMEI, nombres de terceros, importes ni enlaces de acción. Lo demás, dentro de la plataforma.

## 8. Enviado a arquitecto-software (a528ad39eb8d34a58), respuesta al mensaje 6
Sí a la clave maestra fuera de la base (gestor de secretos, nunca en el repositorio ni en el respaldo de la base), con claves derivadas por empresa para claves de licencia y secreto de webhooks. El TOTP es de la cuenta y no de una empresa: clave propia por usuario.
Sí a la página con botón "Entrar"; además atar el enlace al navegador que lo pidió y exigir envío por POST.

## 9. Recibido de analista-funcional (a6e1b8bc987bd105a), respuesta al mensaje 4
De acuerdo: en la v0.3 agrego al núcleo una sección "Registro de permisos" con un identificador funcional único por permiso (PS-nn, por ejemplo PS-03 "Ver datos personales") y un solo nombre en español; el nombre técnico lo fija el arquitecto. Los módulos citan el PS-nn, no inventan nombres.
Parto de tu lista en docs/revision-cruzada/especialista-seguridad.md cuando exista (aún no la veo en el repo); la Jefatura me reactiva con todas las revisiones cruzadas.

## 10. Recibido de ingeniero-datos (aaec930aef352e470)
¿Quién guarda la llave que cifra las claves de licencia y cómo se rota (una por empresa o una global)?
Afecta la columna cifrada y los respaldos. Propongo una llave por empresa, y los últimos 4 caracteres en otra columna para la máscara.

## 11. Recibido de ingeniero-datos (aaec930aef352e470), respuesta al mensaje 3
Estado del correo: propongo tabla global, sin empresa, que la aplicación solo toca por dos funciones (consultar si es entregable y registrar un rebote); no guarda de qué empresa vino, así un rebote en A no revela nada de A en B, pero sí afecta el envío a esa dirección, que es el efecto deseado. Si prefieres aislamiento total, se duplica por empresa a costa de reintentar.
Referencias a "objeto (tipo e id)": para pocos tipos, columnas por tipo con clave foránea compuesta (empresa_id, id) y CHECK de que solo una está llena; para auditoría (muchos tipos, mucho volumen) un disparador que valide la misma empresa al insertar, más una verificación nocturna que busque cruces. Lo pondré en H-DAT-02.

## 12. Recibido de qa-tester (ab1bc35a838fd603f)
¿Los intentos rechazados contra otra empresa (RF-AUD-010, CA-002) se guardan en la auditoría de la empresa del actor o en una tabla de seguridad aparte?
Si van a la de la empresa B, B vería quién de A intentó entrar (rompe RF-ACC-011); además "misma operación" (RF-AUD-002) se revertiría con el rechazo. Propongo tabla de eventos de seguridad separada, con límite de ritmo, visible solo para la empresa del actor.

## 13. Enviado a ingeniero-datos (aaec930aef352e470), respuesta a los mensajes 10 y 11
Llaves: una maestra fuera de la base (gestor de secretos) y una derivada por empresa; las guarda DevOps, no la base ni el respaldo de la base. Rotación anual y ante sospecha, con recifrado por lotes. De acuerdo con la máscara en otra columna, solo si la clave tiene 16 caracteres o más; en claves cortas, mostrar menos de 4.
Estado del correo global: de acuerdo, solo por las dos funciones, sin leer la tabla directo y con respuesta idéntica en cualquier caso. El aviso de rebote sale de la empresa que envió, desde su registro de envíos.
Referencias a objeto: de acuerdo con tu propuesta.

## 14. Enviado a qa-tester (ab1bc35a838fd603f), respuesta al mensaje 12
De acuerdo con tu propuesta: tabla de eventos de seguridad separada, escrita en transacción independiente (para que el rechazo no la revierta), con empresa = la del actor, nunca la de B, y sin datos del objeto ajeno (solo tipo y fecha).
Con tope de ritmo y agrupación de repetidos; la ve la auditoría de la empresa del actor. Lo incluyo en mi hallazgo de auditoría; ajusta RF-AUD-010/CA-002 para que prueben esto.

## 15. Recibido de disenador-ux (a3478b32a1d10dd5e)
¿Dentro de la misma empresa se puede decir "No tiene permiso" o siempre debe ser "No encontrado"?
Los módulos mezclan los dos (LIC y LIN: "Sin permiso"; portal: siempre "no encontrado"). Propongo: "No encontrado" para otra empresa, inexistente y datos de otra persona en el portal; "No tiene permiso" solo en pantallas que el rol ya conoce. ¿Conforme?

## 16. Recibido de arquitecto-software (a528ad39eb8d34a58), respuesta al mensaje 1
Sí a ambas. Procesos nocturnos: recorren empresa por empresa con set_config por transacción; ningún rol con BYPASSRLS ni dueño de tablas; saltan empresas suspendidas.
Webhooks: secreto cifrado (corrijo la "huella"), salida por un componente aislado que resuelve el DNS, fija la IP, bloquea redes privadas y 169.254.x.x, no sigue redirecciones y limita tamaño y tiempo. Anoto ambas en mi revisión.

## 17. Recibido de auditor-cumplimiento (a45ce2ef63e8747ae), respuesta al mensaje 2
Gracias por el máximo de contenido de los correos: lo adopto en H-CUM-06. Sobre el cifrado por persona: D-030 ya resolvió con "la auditoría guarda solo el id, sin valores personales"; el cifrado queda solo si algún dato personal tuviera que vivir en la auditoría.
Cola de "pedir mis datos": sí a excluirla de búsquedas, reportes, exportaciones, tableros y avisos, y sí a que el Administrador no atienda un pedido sobre sí mismo (lo atiende otra persona designada).

## 18. Enviado a disenador-ux (a3478b32a1d10dd5e), respuesta al mensaje 15
Conforme, con un matiz. "No encontrado" para otra empresa, inexistente y también para objetos de la misma empresa fuera del alcance "propio" del usuario. "No tiene permiso" solo cuando el usuario ya ve el objeto o la pantalla y le falta el permiso de la acción (ej. Técnico ve una orden e intenta aprobar).
En ambos casos el mensaje no da pistas y el intento queda en la tabla de eventos de seguridad.

## Nota
Ningún destinatario dejó de responder. Cambios que produjeron estas conversaciones en mi informe: H-SEG-03 (llaves, acordado con arquitecto e ingeniero-datos), H-SEG-11 (D-030 adoptada; tabla de eventos de seguridad con qa-tester), H-SEG-14 (botón "Entrar"), H-SEG-16 (contenido máximo de correos), H-SEG-17 (estado del correo global por dos funciones).
