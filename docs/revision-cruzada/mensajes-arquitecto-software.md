# Mensajes del arquitecto de software · Revisión cruzada (ronda 2)

Fecha: 2026-10-25. Registro literal y en orden. Remitente y destinatario entre paréntesis.

## 1. Enviados al empezar la revisión (4 mensajes)

**1. De arquitecto-software a ingeniero-datos**

> ¿Te sirve separar los datos personales en una tabla aparte (persona_pii) para anonimizar sin tocar la auditoría?
> La auditoría guardaría ids y "campo X cambió", y el borrado a los 5 años sería por partición mensual con un rol de mantenimiento. ¿Ves problema con Prisma o con RLS?

**2. De arquitecto-software a especialista-seguridad**

> ¿Aceptas una clave maestra fuera de la base con cifrado por empresa (TOTP de 2FA, claves de licencia, secreto de webhooks)?
> Dos cosas más: integraciones-api guarda "huella del secreto" del webhook, pero para firmar hace falta el secreto cifrado (un hash no sirve). Y los filtros de correo pueden gastar el enlace de ingreso de un solo uso; propongo que el enlace abra una página con botón "Entrar".

**3. De arquitecto-software a auditor-cumplimiento**

> ¿Prefieres que la anonimización no toque la auditoría (datos personales en tabla aparte o cifrados por persona) en vez de la excepción S-PER-07 que edita la auditoría?
> Esa excepción choca con "solo se agrega" (D-018). Y el borrado a los 5 años: ¿aceptas que sea por partición, hecho por un rol de mantenimiento y no por la aplicación?

**4. De arquitecto-software a analista-funcional**

> ¿Puedes alinear el núcleo con los módulos en 4 puntos? (1) clave de licencia: serie (D-011) frente a campo secreto (SUP-LIC-03); (2) "número de línea" como campo del celular frente a la entidad Línea; (3) ubicación plana (S-06) frente a Sede>Piso>Sala (PER); (4) los IDs RF-PER-001 a 010 están repetidos entre el documento y el módulo.
> Además, las fases de la sección 27 no coinciden con las de DOM, PER, REP, PRE e INT en sus módulos.

## 2. Recibidos y respuestas (en el orden en que llegaron)

**5. De especialista-seguridad a arquitecto-software**

> ¿Los procesos nocturnos de 10 módulos (avisos, renovaciones, fotos mensuales) recorrerán empresa por empresa con SET LOCAL, o usarán un rol que salta RLS? Pido lo primero; el rol de la app no debe ser dueño ni tener BYPASSRLS.
> Y para webhooks (INT): el secreto debe guardarse cifrado (no "huella", porque hay que firmar con él); ¿la salida va por un proceso aislado que resuelva DNS y bloquee 169.254.x.x, red privada y redirecciones?

**6. De especialista-seguridad a arquitecto-software** (responde al mensaje 2)

> Sí a la clave maestra fuera de la base (gestor de secretos, nunca en el repositorio ni en el respaldo de la base), con claves derivadas por empresa para claves de licencia y secreto de webhooks. El TOTP es de la cuenta y no de una empresa: clave propia por usuario.
> Sí a la página con botón "Entrar"; además atar el enlace al navegador que lo pidió y exigir envío por POST.

**7. De analista-funcional a arquitecto-software** (responde al mensaje 4)

> Fases ya alineadas en la sección 27 (DOM, PRE, REP, INT a 2; PER es Etapa 2 de la v1). El resto lo consolido en la v0.3 cuando la Jefatura me reactive con las revisiones cruzadas completas; propongo como [SUPUESTO] para el gerente-ti:
> (1) la clave de licencia es un campo "secreto" de la unidad y la serie es el código interno de la licencia (toca D-011, decide él). (2) "Número de línea" queda como campo de la unidad en la v1; con el módulo lineas-moviles pasa a la entidad Línea con migración. (3) Ubicación con "ubicación superior" opcional desde la v1 (hasta Sede>Piso>Sala) para no migrar; cambia S-06. (4) Los módulos usan su propio prefijo de ID (RF-PEU para personas-ubicaciones); el núcleo conserva RF-PER.

**8. De ingeniero-datos a arquitecto-software**

> ¿Cómo entran a la base los procesos que no conocen la empresa (login por correo, claves de API, invitaciones, tareas nocturnas)?
> Propongo funciones puntuales de acceso (SECURITY DEFINER) en vez de una conexión sin restricción, y tareas nocturnas que recorran empresa por empresa. ¿Te parece, y las incluyes en el prototipo de aislamiento?

**9. De auditor-codigo a arquitecto-software**

> ¿Puedes fijar ya el esquema único de identificadores de permiso? Hoy "ver datos personales" se escribe de 5 formas en los módulos (datos_personales.ver, datos-personales.ver, personas.ver_datos, ayuda.caso.ver_datos_solicitante, "datos personales.ver") y "exportar" tiene 15 variantes por módulo, contra D-004.4 (un solo permiso sensible).
> Además LIC (SUP-LIC-03) necesita un tipo de campo "secreto" que no está entre los 5 tipos de D-005: ¿lo aceptas para la Etapa 2?

**10. De ingeniero-datos a arquitecto-software** (responde al mensaje 1)

> Sí me sirve persona_pii, sin problema de Prisma ni de RLS: es un modelo más con empresa_id, la misma política y clave foránea compuesta. Dos cuidados: (1) la auditoría debe seguir guardando "antes y después" de los campos no personales; los personales van cifrados aparte o por referencia, o se pierde RF-AUD-003. (2) Prisma no administra particiones: la tabla particionada se crea con SQL en la migración, la clave primaria debe incluir la fecha de partición, la política de seguridad por fila va en la tabla padre y se revoca el acceso directo a las particiones. El borrado a los 5 años lo hace un rol de mantenimiento distinto del de la aplicación, documentado como única excepción a "solo se agrega".

**11. De arquitecto-software a especialista-seguridad** (responde al mensaje 5)

> Sí a ambas. Procesos nocturnos: recorren empresa por empresa con set_config por transacción; ningún rol con BYPASSRLS ni dueño de tablas; saltan empresas suspendidas.
> Webhooks: secreto cifrado (corrijo la "huella"), salida por un componente aislado que resuelve el DNS, fija la IP, bloquea redes privadas y 169.254.x.x, no sigue redirecciones y limita tamaño y tiempo. Anoto ambas en mi revisión.

**12. De arquitecto-software a ingeniero-datos** (responde al mensaje 8)

> Sí: funciones SECURITY DEFINER puntuales (login por correo, huella de clave de API, invitación por token, lista de empresas para el programador) y tareas nocturnas empresa por empresa con set_config. Entran al prototipo de aislamiento, junto con una tabla particionada, un índice parcial y una consulta recursiva.
> Además propongo roles de base separados: app_empresa, app_plataforma (sin acceso a tablas de negocio), migraciones y mantenimiento.

**13. De arquitecto-software a auditor-codigo** (responde al mensaje 9)

> Propuesta (la decide el gerente-ti): formato <módulo>.<acción> en minúsculas con guion bajo; globales sensibles datos_personales.ver, precios.ver, auditoria.ver; un solo exportar y un solo importar (D-004.4), y cada módulo exporta solo lo que el usuario ya puede ver.
> Tipo de campo "secreto": sí, para la Etapa 2, con valor cifrado en columna aparte, enmascarado y con permiso para ver completo.

**14. De diseñador-ux a arquitecto-software**

> ¿El permiso "ver datos personales" tendrá un solo identificador, y cómo se agrupan unos 275 permisos?
> Los módulos lo escriben de tres formas (datos_personales.ver, datos-personales.ver, personas.ver_datos), y suman unos 230 permisos al núcleo. La pantalla de roles necesita un campo "módulo" y una marca "sensible" en cada uno. Además LIC pide un tipo de campo "Secreto" que no está entre los 5 del núcleo.

**15. De arquitecto-software a disenador-ux** (responde al mensaje 14)

> Un solo identificador: datos_personales.ver (así lo propongo al gerente-ti). Cada permiso del catálogo llevará en el código módulo, acción, marca sensible y alcance, para que la pantalla de roles agrupe por módulo y destaque los sensibles; exportar e importar serán uno solo cada uno.
> Tipo de campo "secreto": propuesto para la Etapa 2, enmascarado por defecto.

**16. De auditor-cumplimiento a arquitecto-software** (responde al mensaje 3)

> Prefiero que la anonimización no toque la auditoría: el gerente-ti ya lo decidió en D-030 (id interno, sin valores de nombre/correo/área). S-PER-07 queda sin efecto.
> La purga a los 5 años por partición y por un rol de mantenimiento: sí, si no es un botón de la aplicación, exige dos personas autorizadas y deja constancia (partición, fecha, quién).

**17. De ingeniero-datos a arquitecto-software** (responde al mensaje 12)

> De acuerdo con los cuatro roles (app_empresa, app_plataforma sin acceso a tablas de negocio, migraciones, mantenimiento). Añado: las tareas nocturnas corren como app_empresa fijando la empresa por transacción (no con otro rol), las funciones SECURITY DEFINER pertenecen a un rol propietario sin login, y las pruebas de aislamiento de QA usan app_empresa con una prueba que verifica que no es dueño ni superusuario.
> Queda anotado como H-DAT-02 en mi revisión cruzada.

## 3. Notas

- Se enviaron 4 mensajes iniciales y 4 respuestas (11, 12, 13 y 15). Todo lo recibido quedó contestado o integrado en `docs/revision-cruzada/arquitecto-software.md`. Los mensajes 7, 16 y 17 no necesitaron respuesta.
- Acuerdos que quedaron en la revisión: roles de base de datos separados (17), funciones SECURITY DEFINER (8, 12), webhook con secreto cifrado y salida aislada (5, 11), clave maestra externa (6), enlace con botón y atado al navegador (6), tabla aparte de datos personales (10), un solo identificador de permiso y un solo exportar e importar (9, 13, 14, 15), tipo de campo "secreto" (9, 13).
- El mensaje 16 y las decisiones D-030, D-031 y D-032 (que llegaron mientras escribía) se resumen en la sección "Actualización" de la revisión.
