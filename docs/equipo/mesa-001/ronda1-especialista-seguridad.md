# Mesa de revisión #001 · Ronda 1 · Especialista en Seguridad

Destino previsto: `docs/equipo/mesa-001/ronda1-especialista-seguridad.md`
(No se pudo escribir allí porque la sesión estaba en modo plan. Copiar tal cual al aprobar.)

Documento revisado: `docs/documento-funcional.md` v0.1 y `docs/equipo/riesgos.md`.
Todavía no hay código; mi revisión es sobre lo que el documento promete, no sobre implementación.

---

## 1. Qué está bien

- Multiempresa desde el inicio y con la frase clara "cada empresa solo ve sus datos" (secc. 4 y glosario). Es la base correcta.
- Permisos por rol, configurables por empresa (secc. 5), y la auditoría como parte del alcance de la v1 (secc. 2, punto 8, y secc. 11), no como algo para "después".
- Las importaciones ya figuran como riesgo (riesgos.md, #4), con validación fila por fila.
- El riesgo de fuga entre empresas ya está registrado como crítico (riesgos.md, #2), con la idea de poner reglas en la base de datos y no solo en el código. Estoy de acuerdo.
- Los códigos de SKU y las series se piden únicos dentro de la empresa (secc. 7). Esto evita que un código de una empresa choque con el de otra.

## 2. Qué me preocupa

Marco cada punto como HECHO (se puede comprobar leyendo el documento) u OPINIÓN (mi juicio profesional).

**2.1 "Cualquier persona puede entrar con su correo" (secc. 4 y secc. 2, punto 1)**
- HECHO: el documento no dice cómo se comprueba que el correo es de quien lo escribe. Tampoco dice cómo nace una empresa nueva.
- HECHO: la secc. 4 dice "el primer usuario de una empresa es su administrador". Si cualquiera puede registrarse y crear una empresa, quien llegue primero a una empresa existente podría quedarse como administrador. No dice qué evita eso.
- OPINIÓN, riesgo alto: sin verificación del correo, alguien puede registrarse con el correo de otra persona (por ejemplo `gerente@empresa.com`) y quedar "dentro" antes que ella. Con correos personales o de Gmail, además, no hay forma de saber de qué empresa es quien llega.
- OPINIÓN: "acceso con cualquier tipo de correo" puede querer decir dos cosas distintas. (a) Que el CEO acepta correos Gmail/Outlook para los usuarios que él invita. (b) Que cualquiera del mundo puede crear una cuenta sola. Creo que el CEO quiere (a). El texto actual permite leer (b), y (b) es mucho más peligroso.

**2.2 Cómo se une alguien a una empresa**
- HECHO: el documento menciona invitar por correo, pero no dice que la invitación venza, que se use una sola vez, ni quién puede invitar.
- OPINIÓN: si la invitación no vence y se puede reutilizar, un enlace reenviado o filtrado equivale a una llave maestra de la empresa.
- OPINIÓN: no debe existir "buscar una empresa y pedir unirme" ni autounión por dominio del correo (por ejemplo, "todo el que tenga @empresa.com entra"). Es cómodo, pero abre la puerta si el dominio se verifica mal.

**2.3 Una persona en varias empresas (secc. 4)**
- HECHO: se permite elegir con qué empresa trabajar. El documento no dice qué pasa con la sesión al cambiar de empresa.
- OPINIÓN: es el punto donde más fácil se mezclan datos. Hay que decidir que la empresa activa la fija el servidor en cada petición y se comprueba que la persona sigue siendo miembro. No debe depender de algo que la pantalla pueda cambiar.
- OPINIÓN: las listas de personas (por ejemplo, el desplegable para asignar un activo a un usuario) nunca deben mostrar usuarios de otras empresas. Una misma persona puede tener nombre, rol y estado distintos en cada empresa.
- OPINIÓN: la cuenta (correo, contraseña) es de la persona. Los datos de la persona dentro de una empresa (rol, cargo, área) son de esa empresa. Si se mezclan, una empresa podría ver en qué otras empresas trabaja alguien. Eso es dato personal y no debe pasar.

**2.4 Quién administra la plataforma en sí**
- HECHO: el documento solo habla del "Administrador" de cada empresa (secc. 5). No existe nadie que gestione la plataforma completa: crear o suspender empresas, recuperar una empresa que perdió a su único administrador, atender un incidente.
- OPINIÓN: alguien tendrá que hacerlo. Si no se define, se resolverá de forma improvisada, por ejemplo entrando directo a la base de datos. Eso es lo más peligroso, porque no deja rastro y se salta todas las reglas.
- OPINIÓN: el administrador de plataforma NO debe poder ver el contenido de los datos de las empresas (activos, compras) por defecto. Si necesita entrar para dar soporte, que sea con permiso temporal de la empresa y con rastro.

**2.5 Roles por defecto (secc. 5)**
- HECHO: la tabla es un resumen. No dice qué es "Todo" para el Administrador ni qué incluye "Ver todo" para Jefatura TI.
- OPINIÓN: "ver todo" puede incluir datos personales de los usuarios, precios de compra y la auditoría. Conviene separarlos.
- HECHO: el administrador puede "modificar los existentes", incluido su propio rol.
- OPINIÓN: sin protección, un administrador puede quitarse a sí mismo todos los permisos y dejar la empresa sin nadie que la gestione. O un usuario con permiso de "editar roles" puede darse a sí mismo el rol de Administrador (escalada de permisos).
- OPINIÓN: quien aprueba una orden de compra no debería poder aprobar la que él mismo creó (separación de funciones). Esto lo debe confirmar el auditor de cumplimiento, pero lo dejo anotado desde seguridad.

**2.6 Recuperación de acceso**
- HECHO: el documento no dice nada sobre olvido de contraseña, cambio de correo, pérdida del único administrador ni cierre de sesión.
- OPINIÓN: la recuperación suele ser el punto más débil de un login. Si es fácil, cualquiera la usa para entrar. Si es imposible, la empresa se queda bloqueada.
- OPINIÓN: dar de baja a un usuario debe cerrar todas sus sesiones de inmediato. Hoy el documento no lo menciona.

**2.7 Importaciones (riesgos.md #4; secc. 9 "pegando una lista"; Excel de inventario)**
- HECHO: el documento no habla de archivos subidos, aunque el riesgo #4 y el pendiente #7 asumen una carga masiva desde Excel.
- OPINIÓN: un archivo Excel/CSV es entrada no confiable. Riesgos concretos:
  - Archivos enormes que dejan la plataforma lenta para todos (abuso de recursos).
  - Archivos con fórmulas maliciosas (celdas que empiezan con `=`, `+`, `-`, `@`) que se ejecutan cuando alguien exporta y abre el resultado en Excel ("inyección de fórmulas").
  - Archivos .xlsx falsos o comprimidos para ocupar memoria.
  - Un usuario con permiso de importar que cargue miles de registros basura, o que sobrescriba datos existentes sin darse cuenta.
  - Datos de una empresa mezclados en el archivo de otra (por ejemplo, un archivo con una columna "empresa").
- OPINIÓN: la importación no debe ser un permiso que venga activado para cualquier rol.

**2.8 Auditoría (secc. 11)**
- HECHO: dice que se guarda quién hizo qué y que "solo los roles con permiso" la consultan. No dice que sea inalterable.
- OPINIÓN: si un administrador puede borrar o editar la auditoría, no sirve como evidencia. Tampoco dice qué acciones de seguridad quedan registradas (inicios de sesión fallidos, cambios de rol, invitaciones, exportaciones).
- OPINIÓN: la auditoría no debe guardar contraseñas, enlaces de acceso ni datos personales de más.

**2.9 Datos personales y registros**
- HECHO: el documento guarda nombres y correos de usuarios, y "responsable" de cada activo (secc. 8). Nada dice cuánto tiempo se conservan ni qué pasa si alguien pide que lo borren.
- OPINIÓN: esto es principalmente del auditor de cumplimiento. Desde seguridad solo pido que los datos personales no aparezcan en mensajes de error ni en registros técnicos.

**2.10 Eliminación de datos ("eliminó", secc. 11; "dar de baja", secc. 5)**
- OPINIÓN: no queda claro si "eliminar" borra de verdad o marca como inactivo. Para activos y compras, borrar de verdad destruye el rastro. Recomiendo que nada con historial se borre; se da de baja o se anula.

## 3. Qué cambiaría (requisitos de seguridad para entrar al documento funcional)

Los numero RS-xx para poder citarlos. Propongo que entren como una sección nueva "Seguridad" en el documento funcional, escrita en lenguaje simple.

**Acceso y empresas**
- RS-01. No existe registro abierto. Una persona entra únicamente de dos formas: (a) por invitación de un administrador de empresa, o (b) porque la plataforma (administrador de plataforma) creó su empresa y la invitó como primer administrador.
- RS-02. Todo correo se verifica antes del primer uso: se envía un enlace al correo y la cuenta solo queda activa al abrirlo.
- RS-03. Las invitaciones vencen (propongo 7 días), sirven una sola vez y están ligadas al correo al que se enviaron. El administrador puede cancelarlas. Quien invita no puede asignar un rol con más permisos que el suyo.
- RS-04. Está prohibido unirse a una empresa por dominio de correo, por búsqueda o por código público.
- RS-05. Los correos se tratan sin distinguir mayúsculas y se normalizan, para que `Ana@x.com` y `ana@x.com` no sean dos personas.

**Varias empresas**
- RS-06. Una persona tiene una sola cuenta y una membresía por empresa, cada una con su rol, su estado (activa o suspendida) y sus datos dentro de esa empresa.
- RS-07. La empresa con la que se trabaja se decide y se comprueba en el servidor en cada acción. Si la persona deja de ser miembro, pierde el acceso al instante, incluso con la sesión abierta.
- RS-08. Una empresa nunca puede ver a qué otras empresas pertenece una persona.
- RS-09. Cambiar de empresa se registra y no arrastra pantallas ni datos en pantalla de la empresa anterior.

**Aislamiento**
- RS-10. Todo dato tiene empresa. La base de datos debe impedir leer o escribir datos de otra empresa aunque el código se equivoque (esto se comprueba con pruebas específicas en cada etapa; hay una prueba obligatoria por cada tabla nueva).
- RS-11. Las referencias entre datos (por ejemplo, un SKU y su categoría, una OC y su proveedor) deben pertenecer a la misma empresa. No se puede crear una orden con un proveedor de otra empresa aunque se conozca su identificador.
- RS-12. Los archivos subidos (adjuntos, importaciones) se guardan separados por empresa y solo se entregan después de comprobar que el usuario tiene acceso.
- RS-13. Los identificadores que se ven en la dirección web no deben ser consecutivos ni adivinables.

**Roles y permisos**
- RS-14. Todo permiso se comprueba en el servidor. Que la pantalla oculte un botón es comodidad, no seguridad.
- RS-15. Cada empresa siempre debe tener al menos un Administrador activo. El sistema impide quitar, suspender o bajar de rol al último.
- RS-16. Nadie puede otorgarse permisos a sí mismo ni dar a otro más permisos de los que él mismo tiene.
- RS-17. Los roles iniciales vienen con la lista exacta de permisos escrita en el documento (una tabla módulo por acción). Permisos sensibles separados: ver precios, ver auditoría, ver datos personales, importar, exportar, administrar roles.
- RS-18. Separación de funciones en compras: quien crea una orden no la aprueba. (A confirmar con auditor de cumplimiento y con el CEO.)

**Administración de la plataforma**
- RS-19. Existe un rol "Administrador de plataforma", fuera de cualquier empresa. Puede crear, suspender y reactivar empresas, y rescatar una empresa sin administrador. No ve los datos del negocio (activos, compras).
- RS-20. Si soporte necesita ver datos de una empresa, requiere autorización explícita de esa empresa, con vencimiento corto, y todo queda en la auditoría.
- RS-21. Las cuentas de Administrador de plataforma son muy pocas (una o dos), con segunda verificación obligatoria. Nadie entra directo a la base de datos en producción para tareas rutinarias.

**Autenticación y recuperación**
- RS-22. Las contraseñas se guardan con un método seguro de un solo sentido y se exige una longitud mínima razonable. No se pide mezclar símbolos de forma absurda; se prefiere longitud.
- RS-23. Protección contra intentos repetidos: tras varios fallos seguidos, la cuenta o la dirección espera un tiempo creciente. El mensaje de error nunca dice si el correo existe o no.
- RS-24. Recuperar contraseña: enlace por correo, válido unos minutos (propongo 30), de un solo uso. Al cambiar la contraseña se cierran todas las demás sesiones y se avisa por correo.
- RS-25. Las sesiones vencen por inactividad y por tiempo total. Hay botón de cerrar sesión y de "cerrar en todos los dispositivos".
- RS-26. Si se da de baja a un usuario o se suspende su membresía, sus sesiones en esa empresa terminan de inmediato.
- RS-27. Segunda verificación (código del celular): obligatoria para Administradores de empresa y de plataforma; opcional para el resto. (Ver pregunta 4.1.)
- RS-28. Recuperar al único administrador de una empresa solo lo hace el Administrador de plataforma, tras verificar la identidad por otro medio. Queda en la auditoría.

**Importaciones**
- RS-29. Importar es un permiso aparte, desactivado por defecto en todos los roles menos Administrador.
- RS-30. Solo se aceptan los tipos de archivo esperados (.xlsx y .csv), con tamaño máximo y número máximo de filas definidos en el documento. Se valida el contenido real, no solo la extensión.
- RS-31. La importación siempre pasa por una vista previa con errores marcados antes de confirmar. Nada se guarda hasta que el usuario confirma. Una importación se puede deshacer o al menos queda marcada como un lote para localizarla.
- RS-32. Las celdas que empiecen con `=`, `+`, `-` o `@` se tratan como texto al importar y al exportar.
- RS-33. El archivo importado no puede traer la empresa de destino; la empresa siempre sale de la sesión.
- RS-34. Límite de importaciones simultáneas y por día por empresa, para evitar abuso.
- RS-35. El archivo original se borra al terminar (o a los pocos días); lo que queda es el resultado y el reporte de errores.

**Auditoría**
- RS-36. La auditoría solo se puede agregar, nunca editar ni borrar desde la aplicación. Ni siquiera el Administrador de empresa.
- RS-37. Se registran, como mínimo: inicios de sesión (correctos y fallidos), cambios de contraseña, invitaciones, altas, bajas y cambios de rol y permisos, aprobaciones, importaciones, exportaciones, cambios de empresa activa, y accesos del administrador de plataforma.
- RS-38. La auditoría no guarda contraseñas, enlaces ni datos personales innecesarios.
- RS-39. Los registros no se borran: se dan de baja, se anulan o se archivan. Lo que tenga historial no se elimina de verdad.

**Datos y operación**
- RS-40. Secretos y claves nunca en el repositorio; cada entorno tiene los suyos. Los datos reales de clientes no se usan en desarrollo ni en pruebas.
- RS-41. Los errores que ve el usuario no revelan detalles internos ni datos personales.
- RS-42. Todo texto que escribe un usuario se trata como texto, nunca como código, para evitar scripts maliciosos en pantalla.
- RS-43. Se revisan las dependencias con vulnerabilidades conocidas antes de cada liberación.
- RS-44. Respaldos cifrados, con prueba periódica de restauración, y restauración que no mezcle datos de empresas. (Lo ejecuta DevOps; yo lo reviso.)

## 4. Preguntas para el CEO

Cerradas, con mi recomendación.

**4.1 ¿Quién puede crear una empresa nueva en la plataforma?**
- A) Solo el equipo de TI de la plataforma, a pedido (cada empresa nueva la crea alguien de confianza y envía la invitación al primer administrador).
- B) Cualquiera que se registre solo, sin aprobación.
- C) Cualquiera puede registrarse, pero una persona de la plataforma debe aprobarla antes de usarla.
- Recomiendo A para la v1. Es lo más seguro y, como son pocas empresas, no cuesta trabajo. B lo dejaría para una versión futura, si algún día se vende al público.

**4.2 ¿Cómo se identifica a un usuario nuevo?**
- A) Solo por invitación de un administrador, con correo verificado.
- B) También se puede unir cualquiera cuyo correo termine en el dominio de la empresa.
- Recomiendo A. B es práctico pero permite que entre gente no prevista si el dominio se mal configura.

**4.3 ¿Qué pasa si una empresa pierde a su único administrador (se fue, olvidó la clave, cambió de correo)?**
- A) El equipo de la plataforma lo recupera, previa verificación de identidad por otro medio (llamada o documento), y queda registrado.
- B) No hay recuperación; se crea otra empresa.
- Recomiendo A, y que la empresa siempre tenga al menos dos administradores.

**4.4 ¿Se exige segunda verificación (un código en el celular) a los administradores?**
- A) Sí, obligatoria para administradores; opcional para los demás.
- B) Obligatoria para todos.
- C) Opcional para todos.
- Recomiendo A. B puede cansar a los usuarios; C deja a los administradores (las cuentas más valiosas) protegidos solo por contraseña.

**4.5 ¿El Jefatura TI puede ver los precios y la auditoría, o solo el Administrador?**
- A) Jefatura TI ve precios y auditoría.
- B) Solo el Administrador ve auditoría; Jefatura TI ve precios.
- C) Solo el Administrador ve ambos.
- Recomiendo B como punto de partida, y que el Administrador de cada empresa lo ajuste. Es una decisión del negocio; yo solo pido que esté escrita.

**4.6 ¿Quién puede importar y exportar datos masivamente?**
- A) Solo el Administrador, y otros roles si el Administrador se lo da.
- B) También Técnico y Almacén de forma predeterminada.
- Recomiendo A. Las exportaciones masivas son la forma más fácil de llevarse todos los datos de una empresa.

**4.7 ¿La persona que crea una orden de compra puede aprobarla ella misma?**
- A) No, nunca.
- B) Sí, si es la única que existe en la empresa o si el monto es menor a un límite que fije la empresa.
- C) Sí, siempre.
- Recomiendo B con límite bajo, para no bloquear a una empresa pequeña, sin dejar abierta la puerta a que una persona compre y apruebe sin control. Esto se coordina con el auditor de cumplimiento.

**4.8 ¿Cuánto tiempo se guardan los registros de auditoría y los archivos importados?**
- Auditoría: A) 1 año, B) 3 años, C) para siempre.
- Archivo importado: A) se borra al terminar, B) 30 días.
- Recomiendo auditoría 3 años (o lo que pida la ley de cada país, que el auditor de cumplimiento debe confirmar) y archivo importado 30 días como máximo.

## 5. Preguntas que le haría al arquitecto-software

(Las dejo anotadas para la Jefatura; no pude enviar mensajes en esta ronda.)
1. ¿El aislamiento entre empresas se hará con reglas dentro de la base de datos (que funcionen aunque el código falle) o solo con filtros en el código? Con Prisma esto no es automático; ¿cuál es el plan concreto?
2. ¿Cómo se fija la "empresa activa" en cada petición: dentro de la sesión firmada, o se manda desde la pantalla? ¿Y cómo se evita que una sesión vieja siga valiendo tras una baja?
3. Auth.js con enlace por correo y con contraseña: ¿se usarán ambas? ¿Cuál es el plan para segunda verificación, bloqueo por intentos y cierre de sesión en todos los dispositivos?
4. ¿Dónde vive el Administrador de plataforma: en la misma aplicación con un rol especial o en una aplicación aparte? Prefiero aparte, o al menos con una ruta y permisos separados.
5. ¿Cómo y dónde se guardan los archivos subidos y quién procesa las importaciones (en la misma petición o en una cola aparte, con límites)?
6. La tabla de auditoría: ¿se puede hacer de solo-agregar a nivel de base de datos (sin permiso de editar o borrar para el usuario de la aplicación)?

## 6. Mensajes directos

No envié ninguno en esta ronda: la sesión estaba en modo plan, que no permite acciones con efectos fuera de este archivo. Los puntos que habría consultado:
- analista-funcional: ¿"acceso con cualquier correo" significa que el CEO acepta correos personales para usuarios invitados (opción A) o que cualquiera pueda registrarse solo (opción B)?
- auditor-cumplimiento: ¿están de acuerdo con la separación de funciones en compras (RS-18) y con los plazos de conservación de la pregunta 4.8?
- arquitecto-software: las seis preguntas de la sección 5.
Ningún nombre dejó de responder, porque no se envió nada.

---

Veredicto de esta ronda: el documento no se puede liberar tal como está en lo relativo a seguridad, pero no hay nada que no se pueda arreglar con texto. Lo único que bloquea el inicio de la Etapa 1 son las preguntas 4.1, 4.2 y 4.3, porque cambian cómo se construye el login.
