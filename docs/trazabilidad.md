# Trazabilidad: requisito, etapa, criterio de aceptación

**Autor:** QA (qa-tester) · **Fecha:** 2026-10-25 · **Cubre:** el núcleo del documento funcional v0.3 (secciones 5 a 21). Los módulos adicionales llevan su propia matriz en cada archivo de `docs/modulos/`; sus criterios están en `docs/calidad/criterios-por-etapa.md`.

**Cómo se hizo.** Se leyeron las tablas de requisitos (columnas "Cuándo" y "CA") y la sección 22 con scripts de solo lectura. El estado de cada fila es:

- **cubierto:** el criterio citado existe y lista este requisito en su cabecera.
- **no probado de verdad:** el criterio citado existe, pero leído su texto no prueba lo que dice el requisito (lista abajo, con el motivo).
- **verificar:** el criterio citado existe, pero no lista el requisito en su cabecera; hay que leer su texto (puede estar cubierto sin citarse).
- **cita rota:** el criterio citado no existe.

Esta matriz la revisa el Auditor Técnico al cerrar cada etapa (D-026.4): un requisito sin prueba y una prueba sin requisito son hallazgos. Se actualiza cada vez que cambia el documento funcional.

## Resumen de huecos

| Medida | Resultado |
|---|---|
| Filas RF y RNF del núcleo (sin retiradas) | 311 |
| Con un criterio citado que existe | 311 |
| Citas rotas | 0 |
| Cubiertos (el criterio los lista) | 287 |
| No probados de verdad (lista abajo) | 13 del núcleo y 2 de módulos |
| Para verificar leyendo el texto | 11 |
| Reglas RN sin criterio que las cite | 18 de 22 (ver tabla de RN) |

### Requisitos cuyo criterio no los prueba de verdad

En el informe de la ronda 3 conté 14; la lista exacta tiene 15 (13 del núcleo y 2 del módulo de entregas).

| Requisito | Etapa | Criterio citado | Qué falta probar |
|---|---|---|---|
| RF-ACC-006 | E1 | CA-068 | CA-068 prueba el filtro de correo; no prueba que el enlace dura 15 minutos ni que sirve una sola vez. |
| RF-ACC-014 | E1 | CA-069 | CA-069 prueba el aviso a los 25 minutos; no prueba el vencimiento a los 30 minutos de inactividad ni a las 12 horas. |
| RF-ACC-020 | E1 | CA-009 | CA-009 impide quitar al último administrador; no prueba el aviso de tener dos administradores. |
| RF-PLA-009 | E1 | CA-015c | CA-015c prueba el rescate; no prueba el acceso de emergencia (un solo uso, identidad verificada, segunda verificación). |
| RF-PLA-010 | E1 | CA-067 | CA-067 no prueba que la plataforma sube el tope de una empresa por un periodo corto. |
| RF-EMP-004 | E1 | CA-071 | CA-071 prueba moneda y zona horaria; no prueba el calendario de empresa (horario y feriados). |
| RF-IMP-008 | E4 | CA-038 | CA-038 no menciona el stock inicial como movimiento "saldo inicial". |
| RF-IMP-009 | E4 | CA-038 | CA-038 no prueba que un texto de estado que no se asocia a los 5 estados es error de fila. |
| RF-IMP-015 | E4 | CA-039 | CA-039 prueba 5.000 filas y 10 MB; no prueba el tope de 10 importaciones por día entre módulos. |
| RF-CAT-026 | E2 | CA-074 | CA-074 prueba el contenido de los correos; no prueba que el contacto inactivo se anonimiza a los 2 años ni que no sale en exportaciones generales. |
| RF-OC-048 | E5 | CA-055 | CA-055 prueba el borde del límite; no prueba el informe mensual "sin respaldo de compra" ni el aviso de compra fraccionada. |
| RF-ROL-015 | E1 | CA-077 | CA-077 prueba procesos diarios; no prueba la falla por dependencias circulares entre módulos. |
| RF-OC-049 | E5 | CA-061 | CA-061 prueba que el borrador no reserva; no prueba qué ocurre a los 7 días. |
| RF-ENT-002 (entregas-devoluciones) | E4 | CA-ENT-01 | CA-ENT-01 no prueba el borrador automático de la entrega. |
| RF-ENT-016 (entregas-devoluciones) | E4 | CA-ENT-01 | CA-ENT-01 no prueba renovar un préstamo. |

Además, **CA-070** (interruptor único) no prueba la confirmación del segundo administrador, el motivo obligatorio ni el resumen mensual de RF-OC-026; y **RF-OC-044** y **RF-ACC-021** necesitan los criterios CA-NOT-20 (aviso de decisión de la orden) y de versión de la orden, ya agregado el primero.

### Reglas de negocio (RN) y el criterio que las prueba

La tabla de RN del documento no tiene columna CA. "Citado" = algún criterio la nombra. "Propuesto" = es mi lectura de qué criterio ya existente la prueba; el Analista debe agregar la cita.

| RN | Criterio | Estado |
|---|---|---|
| RN-001 | CA-001, CA-002 | citado |
| RN-002 | CA-011a | propuesto |
| RN-003 | CA-034, CA-035, CA-038 | propuesto |
| RN-004 | CA-018 | citado |
| RN-005 | CA-023 | propuesto |
| RN-006 | CA-040 | propuesto |
| RN-007 | CA-045 | citado |
| RN-008 | CA-024 (parcial: baja y extravío) | sin criterio completo: falta uno que recorra las 9 acciones con motivo |
| RN-009 | CA-072 (parcial: decimal exacto) | sin criterio completo: falta "importe siempre con su moneda" y "nunca un total entre monedas" |
| RN-010 | CA-012, CA-013, CA-014 | propuesto |
| RN-011 | CA-001, CA-048 | propuesto |
| RN-012 | CA-005, CA-017, CA-023 | propuesto |
| RN-013 | CA-046, CA-082b | propuesto |
| RN-014 | CA-051 | citado |
| RN-015 | CA-032 (parcial: SKU y proveedor inactivos) | sin criterio completo: falta uno para el resto de registros inactivos |
| RN-016 | CA-001 (parcial) | sin criterio completo: falta uno para catálogos, Personas y usuarios |
| RN-017 | CA-031, CA-055 | propuesto |
| RN-018 | CA-PRV-09, CA-DOM-02 (Fase 2) | propuesto; corre desde Fase 2 |
| RN-019 | CA-042 | propuesto |
| RN-020 | CA-NOT-xx (Fase 2) | propuesto; corre desde Fase 2 |
| RN-021 | CA-PRE-xx (Fase 3) | propuesto; corre desde Fase 3 |
| RN-022 | CA-018 | propuesto |

RN con criterio completo o propuesto: 16. RN que necesitan un criterio nuevo: RN-008, 009, 015 y 016.

## Matriz de requisitos del núcleo

Etapas: E0 a E7 son las de la v1; F2 y F3 son fases posteriores. Una fila con dos etapas (por ejemplo "E1, E5") se entrega por partes.

| ID | Requisito (resumido) | Etapa | Criterio de aceptación | Estado | Observación |
|---|---|---|---|---|---|
| RF-ACC-001 | No hay registro abierto: solo entra quien tiene una invitación. | E1 | CA-006 | cubierto |  |
| RF-ACC-002 | Una empresa la crea el Administrador de plataforma (PS-01), que invita al primer administr… | E1 | CA-015d | cubierto |  |
| RF-ACC-003 | Sirve cualquier correo (personal o corporativo), siempre con invitación. | E1 | CA-005 | cubierto |  |
| RF-ACC-004 | No existe la unión por dominio de correo, por búsqueda de empresa ni por código público. | E1 | CA-006 | cubierto |  |
| RF-ACC-005 | Se entra con un enlace que llega al correo. No hay contraseñas en la v1. | E1 | CA-006 | cubierto |  |
| RF-ACC-006 | El enlace de acceso dura 15 minutos y sirve una sola vez. Abre una página con el botón "En… | E1 | CA-068 | no probado de verdad | CA-068 prueba el filtro de correo; no prueba que el enlace dura 15 minutos ni que sirve una sola vez. |
| RF-ACC-007 | Las invitaciones vencen a los 7 días, se usan una sola vez, quedan ligadas al correo al qu… | E1 | CA-005 | cubierto |  |
| RF-ACC-008 | Quien invita no puede dar un rol con más permisos que el suyo. | E1 | CA-010 | cubierto |  |
| RF-ACC-009 | Si el correo invitado ya tiene cuenta, la empresa se suma a la misma cuenta solo cuando la… | E1 | CA-005 | cubierto |  |
| RF-ACC-010 | Los correos se guardan y comparan sin distinguir mayúsculas (comparación Unicode, sin quit… | E1 | CA-005 | cubierto |  |
| RF-ACC-011 | La cuenta es global y mínima. Todo lo que se hace en una empresa queda a nombre de la memb… | E1 | CA-004 | cubierto |  |
| RF-ACC-012 | La empresa activa va en la dirección de la página (/e/{empresa}/...) y en cada acción. El … | E1 | CA-004, CA-079 | cubierto |  |
| RF-ACC-013 | La segunda verificación (aplicación autenticadora, sin SMS) es obligatoria a toda membresí… | E1 | CA-007, CA-081 | cubierto |  |
| RF-ACC-014 | Las sesiones vencen a los 30 minutos sin actividad y a las 12 horas en total. A los 25 min… | E1 | CA-069 | no probado de verdad | CA-069 prueba el aviso a los 25 minutos; no prueba el vencimiento a los 30 minutos de inactividad ni a las 12 horas. |
| RF-ACC-015 | Existe "cerrar sesión en todos los dispositivos". | E1 | CA-008 | cubierto |  |
| RF-ACC-016 | Suspender o dar de baja a alguien en una empresa corta sus sesiones en esa empresa al inst… | E1 | CA-008 | cubierto |  |
| RF-ACC-017 | Tras 5 intentos fallidos la espera crece: 1, 2, 5 y 15 minutos. Los tiempos de respuesta s… | E1 | CA-006 | cubierto |  |
| RF-ACC-018 | Recuperación de acceso: como no hay contraseña, se pide un enlace nuevo. Cada persona con … | E1 | CA-082 | cubierto |  |
| RF-ACC-019 | Si una empresa pierde a su único administrador (o este pierde factor y códigos), lo recupe… | E1 | CA-015c | cubierto |  |
| RF-ACC-020 | Al crear una empresa se recomienda tener al menos dos administradores; el sistema lo avisa… | E1 | CA-009 | no probado de verdad | CA-009 impide quitar al último administrador; no prueba el aviso de tener dos administradores. |
| RF-ACC-021 | Correos de la v1 (NOT-base): invitación, enlace de acceso, aviso a quien aprueba cuando ha… | E1, E5 | CA-074 | cubierto |  |
| RF-ACC-022 | Una empresa suspendida por la plataforma no permite entrar a ninguno de sus usuarios; sus … | E1 | CA-015d | cubierto |  |
| RF-ACC-023 | Al primer ingreso se pide aceptar el aviso de privacidad y los términos; quedan registrada… | E1 | CA-049 | cubierto |  |
| RF-ACC-024 | Las acciones delicadas (ver clave de licencia, exportar, importar, administrar roles y usu… | E1 | CA-007 | cubierto |  |
| RF-ACC-025 | Hay pantallas de "Primeros pasos" (para el administrador de una empresa nueva), "Mi cuenta… | E1 | CA-050b | cubierto |  |
| RF-ACC-026 | Un correo de invitación enviado a un buzón con filtro no se gasta: el enlace de ingreso ex… | E1 | CA-068 | cubierto |  |
| RF-AUD-001 | La auditoría solo se agrega: no se edita ni se borra desde la aplicación, ni siquiera por … | E1 | CA-040 | cubierto |  |
| RF-AUD-002 | Se escribe en la misma operación que el cambio: si el cambio ocurre, la auditoría existe; … | E1 | CA-040 | cubierto |  |
| RF-AUD-003 | Cada entrada guarda: quién (la membresía), cuándo, qué empresa, qué registro, qué acción, … | E1 | CA-041 | cubierto |  |
| RF-AUD-004 | Se registran como mínimo: altas, cambios (con antes y después), aprobaciones, rechazos, an… | E1 | CA-041 | cubierto |  |
| RF-AUD-005 | También se registran: invitaciones, cambios de empresa activa, importaciones, exportacione… | E1 | CA-041 | cubierto |  |
| RF-AUD-006 | No guarda contraseñas, enlaces de acceso, claves de licencia ni más datos personales de lo… | E1 | CA-042 | cubierto |  |
| RF-AUD-007 | Ven la auditoría el Administrador y Jefatura TI por defecto (permiso sensible auditoria.ve… | E1 | CA-011b | cubierto |  |
| RF-AUD-008 | La auditoría es distinta del historial de un activo: el historial dice qué pasó con el act… | E1 | CA-041 | cubierto |  |
| RF-AUD-009 | "Registro importante" significa todo lo listado en RF-AUD-004 y RF-AUD-005. | E1 | CA-041 | cubierto |  |
| RF-AUD-010 | Eventos de seguridad aparte: los intentos rechazados por empresa ajena o por falta de perm… | E1 | CA-066, CA-002 | cubierto |  |
| RF-AUD-011 | Nada con historial se borra. Lo que tiene historia se desactiva, se anula o se da de baja,… | E1 | CA-045 | cubierto |  |
| RF-AUD-012 | Los identificadores internos que se ven en la dirección web no son consecutivos ni adivina… | E1 | CA-001 | cubierto |  |
| RF-AUD-013 | Cada entrada indica el tipo de autor, con tres valores: membresía (usuario), integración (… | E1 | CA-041 | cubierto |  |
| RF-AUD-014 | Campos personales: los datos personales (lista cerrada de la sección 18.2) viven solo en l… | E1 | CA-054 | cubierto |  |
| RF-AUD-015 | Anonimizar = sobrescribir los datos en el registro de Persona o de Usuario con una referen… | E2 | CA-054 | cubierto |  |
| RF-AUD-016 | Lo que en la auditoría pueda ser dato personal indirecto (como la IP) se conserva solo has… | E7 | CA-054 | cubierto |  |
| RF-AUD-017 | Dos registros: el de plataforma y el de empresa. Todo acceso de soporte aparece en la audi… | E1 | CA-015b | cubierto |  |
| RF-AUD-018 | Copia externa de la auditoría: solo de agregar, inmutable y encadenada (cada archivo lleva… | E7 | CA-040 | cubierto |  |
| RF-AUD-019 | La auditoría de un lote de importación es una entrada de lote con el detalle en su propia … | E4 | CA-041 | cubierto |  |
| RF-CAT-001 | Marca, modelo (depende de una marca), proveedor, ubicación, área, tipo de puesto, centro d… | E2 | CA-048 | cubierto |  |
| RF-CAT-002 | El administrador puede crear catálogos nuevos sin ayuda técnica. Son listas simples y alim… | E2 | CA-020 | cubierto |  |
| RF-CAT-003 | Los catálogos son de cada empresa. No se comparten entre empresas. | E2 | CA-001 | cubierto |  |
| RF-CAT-004 | Un valor de catálogo no se borra: se desactiva. Un valor inactivo no se puede elegir en re… | E2 | CA-045 | cubierto |  |
| RF-CAT-005 | La unidad de medida es un catálogo por empresa con la marca "admite decimales". No hay con… | E2 | CA-032 | cubierto |  |
| RF-CAT-006 | Ubicación jerárquica: tiene ubicación superior opcional, máximo 3 niveles (Sede, Piso, Sal… | E2 | CA-060 | cubierto |  |
| RF-CAT-007 | Una categoría tiene nombre, prefijo para los códigos (LAP, CEL, PER, LIC) y naturaleza. | E2 | CA-017 | cubierto |  |
| RF-CAT-008 | El prefijo tiene de 2 a 5 caracteres (letras o números, en mayúsculas), es único dentro de… | E2 | CA-017 | cubierto |  |
| RF-CAT-009 | Hay un solo nivel de subcategoría (Categoría > Subcategoría). La subcategoría usa el prefi… | E2 | CA-017 | cubierto |  |
| RF-CAT-010 | La subcategoría hereda los campos y la naturaleza de la categoría principal y puede sumar … | E2 | CA-020 | cubierto |  |
| RF-CAT-011 | Cambiar el prefijo de una categoría no cambia los códigos de los SKU ya creados. | E2 | CA-019 | cubierto |  |
| RF-CAT-012 | Cada categoría puede definir campos personalizados, que heredan todos sus SKU. Seis tipos:… | E2 | CA-020, CA-065 | cubierto |  |
| RF-CAT-013 | Cada campo es obligatorio u opcional. | E2 | CA-020 | cubierto |  |
| RF-CAT-014 | Cada campo declara a qué se aplica: al artículo (SKU) (RAM, disco, procesador) o a cada un… | E2 | CA-020 | cubierto |  |
| RF-CAT-015 | Los campos "a cada unidad" solo existen para SKU controlados por serie. En un SKU por cant… | E2 | CA-020 | cubierto |  |
| RF-CAT-016 | El servidor valida cada valor según la definición del campo (tipo, obligatorio, opción exi… | E2 | CA-020 | cubierto |  |
| RF-CAT-017 | Un campo que ya tiene datos no se borra: se desactiva. | E2 | CA-021 | cubierto |  |
| RF-CAT-018 | No se cambia el tipo de un campo que ya tiene datos. | E2 | CA-021 | cubierto |  |
| RF-CAT-019 | Un campo que se vuelve obligatorio no bloquea lo que ya existe: esos registros quedan marc… | E2 | CA-021 | cubierto |  |
| RF-CAT-020 | Las opciones de una lista que estén en uso se desactivan, no se borran. | E2 | CA-021 | cubierto |  |
| RF-CAT-021 | Cada campo tiene un identificador interno estable; cambiarle el nombre no rompe los datos. | E2 | CA-021 | cubierto |  |
| RF-CAT-022 | Los campos de tipo número admiten decimales y pueden tener mínimo y máximo; los de fecha s… | E2 | CA-020 | cubierto |  |
| RF-CAT-023 | Proveedor, ubicación y centro de costo pueden tener un código externo opcional (el de SAP,… | E2 | CA-017 | cubierto |  |
| RF-CAT-024 | El centro de costo tiene una Persona responsable opcional y es el único catálogo de centro… | E2 | CA-016 | cubierto |  |
| RF-CAT-025 | Proveedor ampliado (PRV-A): una sola tabla desde la Etapa 2, con identificación fiscal nor… | E2 | CA-017 | cubierto |  |
| RF-CAT-026 | Los contactos de un proveedor son datos personales: tienen ciclo de vida (inactivo; se ano… | E2 | CA-074 | no probado de verdad | CA-074 prueba el contenido de los correos; no prueba que el contacto inactivo se anonimiza a los 2 años ni que no sale en exportaciones generales. |
| RF-CAT-027 | Naturaleza: equipo físico (por defecto: garantía, mantenimiento, depreciación, "activos vi… | E2 | CA-064 | cubierto |  |
| RF-CAT-028 | Campo secreto: se guarda cifrado, aparte; no se busca; no aparece en historial (dice solo … | E2 | CA-042 | cubierto |  |
| RF-CAT-029 | El número de línea, mientras no exista el módulo de Líneas, es un campo opcional de la uni… | E2 | CA-065 | cubierto |  |
| RF-DAT-001 | No se guardan documento de identidad, dirección ni teléfono personal en la v1, salvo decis… | E2 | CA-016 | cubierto |  |
| RF-DAT-002 | Auditoría: 5 años. [ESCALAR AL CEO] confirmar con legal (L-04). | E7 | CA-040 | cubierto |  |
| RF-DAT-003 | Datos personales de una Persona o usuario dado de baja o cesado: 2 años; luego se anonimiz… | E7 | CA-054 | cubierto |  |
| RF-DAT-004 | Archivos de importación: el archivo original no se guarda (RF-IMP-012). Las filas en prepa… | E4 | CA-056 | cubierto |  |
| RF-DAT-005 | Respaldos (D-032, a confirmar con legal): diarios durante 30 días y uno mensual durante 12… | E7 | CA-054 | cubierto |  |
| RF-DAT-006 | Constancias de entrega y devolución: el plazo de 5 años (regla provisional D-033) corre de… | E4 | CA-046 | cubierto |  |
| RF-DAT-007 | Debe poder atenderse una solicitud de acceso, corrección o eliminación de datos personales… | E7 | CA-076 | cubierto |  |
| RF-DAT-008 | Los datos personales no aparecen en mensajes de error ni en registros técnicos. | E1 | CA-073 | cubierto |  |
| RF-DAT-009 | Los datos personales de una empresa nunca se muestran a otra. Un administrador solo ve de … | E1 | CA-004 | cubierto |  |
| RF-DAT-010 | Ningún dato personal real en el repositorio ni en el entorno de pruebas. El Excel, la OC y… | E0 | CA-073 | cubierto |  |
| RF-DAT-011 | Excepción declarada (D-051): la copia del nombre y el área en el acta de entrega vive en c… | E4 | CA-054 | cubierto |  |
| RF-DAT-012 | Correos con contenido mínimo: a una Persona sin Usuario o a una dirección sin verificar so… | E1 | CA-074 | cubierto |  |
| RF-DAT-013 | Redacción por seguridad: operación distinta de "retirar", con permiso propio y motivo obli… | F2 | CA-076 | cubierto |  |
| RF-DAT-014 | Aviso de privacidad configurable: el texto para empleados lo entrega cada empresa; la plat… | E1 | CA-049 | cubierto |  |
| RF-DAT-015 | Procedimiento ante una fuga de datos (D-059): líder del incidente = Especialista en Seguri… | E7 | CA-053 | cubierto |  |
| RF-DAT-016 | Registro de anonimizaciones: una lista aparte que guarda solo el identificador y la fecha … | E2 | CA-054 | verificar | El criterio citado no lista este requisito en su cabecera; leer su texto. |
| RF-EMP-001 | Una empresa tiene país, zona horaria y moneda base desde la Etapa 1. Las monedas salen de … | E1 | CA-071 | cubierto |  |
| RF-EMP-002 | No se puede cambiar la moneda base de una empresa con órdenes abiertas ni con presupuestos… | E5 | CA-071 | cubierto |  |
| RF-EMP-003 | Cambiar la zona horaria recalcula los avisos pendientes. | E1 | CA-071 | cubierto |  |
| RF-EMP-004 | Cada empresa tiene un calendario de empresa compartido por los módulos (zona horaria, hora… | E1 | CA-071 | no probado de verdad | CA-071 prueba moneda y zona horaria; no prueba el calendario de empresa (horario y feriados). |
| RF-EMP-005 | Módulos activables: el Administrador de la empresa activa o desactiva módulos en Configura… | E1 | CA-075 | cubierto |  |
| RF-EXP-001 | Toda exportación pasa por una puerta única del núcleo. Ningún módulo exporta por su cuenta… | E2 | CA-067 | cubierto |  |
| RF-EXP-002 | Antes de exportar: confirmación con motivo, vista de filas y de columnas sensibles. Las co… | E2 | CA-067 | cubierto |  |
| RF-EXP-003 | Límites: 10 exportaciones por usuario por hora, 100 por empresa por día, 50.000 filas; más… | E2 | CA-067 | cubierto |  |
| RF-EXP-004 | El archivo trae una hoja "Aviso" con quién lo generó, cuándo y que contiene datos personal… | E2 | CA-067 | cubierto |  |
| RF-EXP-005 | Las celdas de texto que empiezan con =, +, -, @, tabulador o retorno se exportan como text… | E2 | CA-043 | cubierto |  |
| RF-EXP-006 | "Exportar" se muestra siempre; sin permiso aparece desactivado con la razón escrita. | E2 | CA-043 | cubierto |  |
| RF-EXP-007 | Las exportaciones grandes corren en segundo plano con avance y se entregan por una descarg… | E2 | CA-043 | cubierto |  |
| RF-IMP-001 | La importación entra en la v1 para cargar el inventario actual. Hay un solo marco (plantil… | E4 | CA-038 | cubierto |  |
| RF-IMP-002 | Pasos: plantilla con columnas fijas, subir, vista previa con el error de cada fila (número… | E4 | CA-038 | cubierto |  |
| RF-IMP-003 | Todo o nada por lote: si hay una fila con error, no se carga nada hasta corregir. El usuar… | E4 | CA-038 | cubierto |  |
| RF-IMP-004 | Archivo ya importado: un archivo ya confirmado (huella SHA-256 por empresa, lote confirmad… | E4 | CA-056 | cubierto |  |
| RF-IMP-005 | Claves naturales: activo = SKU + serie normalizada; stock = un solo saldo inicial por SKU … | E4 | CA-056 | cubierto |  |
| RF-IMP-006 | Deshacer = anular, nunca borrar: las filas pasan a un estado final "Anulado por lote deshe… | E4 | CA-038 | cubierto |  |
| RF-IMP-007 | Orden de dependencias: catálogos, Personas, SKU, activos, saldos. SKU y valores desconocid… | E4 | CA-038 | cubierto |  |
| RF-IMP-008 | El stock inicial por cantidad entra como movimiento "saldo inicial" por ubicación. | E4 | CA-038 | no probado de verdad | CA-038 no menciona el stock inicial como movimiento "saldo inicial". |
| RF-IMP-009 | Los textos libres de estado del Excel se asocian a los 5 estados del activo en la vista pr… | E4 | CA-038 | no probado de verdad | CA-038 no prueba que un texto de estado que no se asocia a los 5 estados es error de fila. |
| RF-IMP-010 | Formato: fechas dd/mm/aaaa o número de serie de Excel (otro formato es error de fila). La … | E4 | CA-038 | cubierto |  |
| RF-IMP-011 | Seguridad de la lectura: solo .xlsx y .csv, sin evaluar fórmulas ni entidades externas, co… | E4 | CA-039 | cubierto |  |
| RF-IMP-013 | Importar es el permiso sensible datos.importar, activado solo para el Administrador. | E4 | CA-011b | cubierto |  |
| RF-IMP-014 | La empresa de destino sale de la sesión; si el archivo trae una columna de empresa, se ign… | E4 | CA-039 | cubierto |  |
| RF-IMP-015 | Topes: 5.000 filas y 10 MB por archivo, 10 importaciones por día por empresa en total entr… | E4 | CA-039 | no probado de verdad | CA-039 prueba 5.000 filas y 10 MB; no prueba el tope de 10 importaciones por día entre módulos. |
| RF-IMP-016 | Una importación queda como una entrada de lote en la auditoría más el detalle en su propia… | E4 | CA-041 | verificar | El criterio citado no lista este requisito en su cabecera; leer su texto. |
| RF-IMP-017 | El Excel real se entrega con los nombres de personas reemplazados (P-002). | E0 | CA-038 | verificar | El criterio citado no lista este requisito en su cabecera; leer su texto. |
| RF-IMP-018 | Las invitaciones masivas del portal van por persona, no todo o nada; la pantalla lo dice. | F3 | CA-057 | cubierto |  |
| RF-INV-001 | Cada unidad se registra como un activo con: serie, SKU, estado, ubicación (siempre existe)… | E4 | CA-024 | cubierto |  |
| RF-INV-002 | La serie es única por empresa y SKU, comparada sin distinguir mayúsculas ni espacios al in… | E4 | CA-023 | cubierto |  |
| RF-INV-003 | Si la serie ya existe en otro SKU de la misma empresa, se acepta con un aviso visible que … | E4 | CA-023 | cubierto |  |
| RF-INV-004 | Una unidad física es un solo registro para siempre. Nunca se crea un segundo registro con … | E4 | CA-028 | cubierto |  |
| RF-INV-005 | El sistema avisa cuando una serie parece dañada por Excel (notación científica como 3,5E+1… | E4 | CA-038 | cubierto |  |
| RF-INV-006 | Una serie vacía solo se acepta si el SKU lo autoriza (RF-SKU-009). | E4 | CA-023 | cubierto |  |
| RF-INV-007 | Corregir una serie ya registrada exige permiso y motivo; el historial guarda el valor ante… | E4 | CA-036 | cubierto |  |
| RF-INV-008 | Garantía (GAR-A): se captura la fecha de compra y los meses de garantía, o el fin directo;… | E4 | CA-082b | cubierto |  |
| RF-INV-009 | Los 5 estados son una lista cerrada. "Prestado" no es un estado; "En tránsito" no existe e… | E4 | CA-058 | cubierto |  |
| RF-INV-010 | Las 25 combinaciones de la tabla se comprueban en el servidor, por una sola función, y con… | E4 | CA-058 | cubierto |  |
| RF-INV-011 | El motivo es obligatorio en baja, extravío, reingreso, ajuste de stock, corrección de seri… | E4 | CA-024 | cubierto |  |
| RF-INV-012 | Abrir o cerrar una orden de servicio no cambia el estado del activo; el técnico lo cambia … | E6 | CA-044 | cubierto |  |
| RF-INV-013 | Un activo se asigna a una Persona. No se asigna un activo De baja, Extraviado o ya asignad… | E4 | CA-025 | cubierto |  |
| RF-INV-014 | Un equipo de uso compartido (una sala, un área) se asigna a una Persona custodio. | E4 | CA-025 | cubierto |  |
| RF-INV-015 | Cada asignación y devolución es una fila de historial: desde, hasta, estado en que se devu… | E4 | CA-025 | cubierto |  |
| RF-INV-016 | La constancia es un registro en el sistema (activo, serie, persona, fecha, estado en que s… | E4 | CA-046 | cubierto |  |
| RF-INV-017 | La aceptación en pantalla del receptor y la subida del escaneo del acta quedan fuera de la… | E4 | CA-046 | cubierto |  |
| RF-INV-018 | Cada ingreso, asignación, traslado, reparación, baja, extravío y reingreso queda en el his… | E4 | CA-024 | cubierto |  |
| RF-INV-019 | El stock se lleva por SKU y ubicación. Todo cambio es un movimiento: ingreso, salida, tras… | E4 | CA-026 | cubierto |  |
| RF-INV-020 | El stock no puede quedar negativo, aunque dos personas saquen a la vez. | E4 | CA-026 | cubierto |  |
| RF-INV-021 | Las correcciones son ajustes con motivo obligatorio; nunca se edita el saldo. | E4 | CA-026 | cubierto |  |
| RF-INV-022 | El traslado entre ubicaciones es inmediato: sale de origen y entra a destino en el mismo a… | E4 | CA-027 | cubierto |  |
| RF-INV-023 | Las cantidades son enteras, salvo en las unidades de medida que admiten decimales. | E4 | CA-032 | cubierto |  |
| RF-INV-024 | Una sola regla de estado, asignación y ubicación: (a) la asignación termina únicamente con… | E4 | CA-025, CA-058 | cubierto |  |
| RF-INV-025 | Ingreso manual de un activo (reemplazos por garantía, donaciones, compras sin orden): perm… | E4 | CA-059 | cubierto |  |
| RF-INV-026 | Corregir el costo o la moneda de un activo (activos del Excel) exige activos.corregir_cost… | E4 | CA-063 | cubierto |  |
| RF-INV-027 | Cambio de ubicación de un activo con serie es un movimiento propio ("cambio de ubicación")… | E4 | CA-060 | cubierto |  |
| RF-INV-028 | El estado Asignado exige responsable; En stock, Extraviado y De baja no lo tienen; En repa… | E4 | CA-058 | cubierto |  |
| RF-INV-029 | Un activo con la marca "pendiente de devolución" no cuenta como extraviado ni como robado … | E4 | CA-081b | cubierto |  |
| RF-INV-030 | Autoentrega: nadie puede entregarse un equipo a sí mismo, sin excepción ni siquiera para e… | E4 | CA-079b | cubierto |  |
| RF-INV-031 | Hay un solo asistente "Entregar" y un solo diálogo "Cambiar estado", que reutilizan entreg… | E4 | CA-024 | cubierto |  |
| RF-INV-032 | Almacén no entrega equipos por defecto; la empresa se lo puede conceder y entonces necesit… | E4 | CA-011b | cubierto |  |
| RF-OC-001 | No existe un documento de "solicitud" aparte: la solicitud de compra es una orden en Borra… | E5 | CA-029 | cubierto |  |
| RF-OC-002 | La orden se hace sobre SKU (cantidad y precio por línea), no sobre series. | E5 | CA-032 | cubierto |  |
| RF-OC-003 | La orden tiene número correlativo por empresa (OC-000042, mínimo 6 dígitos), que nunca se … | E5 | CA-018 | cubierto |  |
| RF-OC-004 | Debe tener al menos una línea; cantidad mayor que 0; precio no negativo; el mismo SKU no s… | E5 | CA-032 | cubierto |  |
| RF-OC-005 | Cada empresa define una moneda base. Cada orden lleva una moneda (código de 3 letras) y el… | E5 | CA-031 | cubierto |  |
| RF-OC-006 | El precio unitario se ingresa sin impuesto, con hasta 4 decimales. El impuesto es un porce… | E5 | CA-072 | cubierto |  |
| RF-OC-007 | Cada orden puede indicar un centro de costo (opcional). | E5 | CA-032 | cubierto |  |
| RF-OC-008 | Una orden en Borrador creada por un Solicitante lleva SKU y cantidades; el precio lo compl… | E5 | CA-032 | cubierto |  |
| RF-OC-009 | "Emitida" solo cambia el estado; el sistema no envía correo al proveedor. Se ofrece una vi… | E5 | CA-078 | cubierto |  |
| RF-OC-010 | Una orden con cualquier recepción confirmada no cambia cantidad, precio ni proveedor; solo… | E5 | CA-061 | cubierto |  |
| RF-OC-011 | Las transiciones de la tabla se comprueban en el servidor y no hay otras. | E5 | CA-029 | cubierto |  |
| RF-OC-012 | Toda transición registra quién, cuándo y motivo. El motivo es obligatorio al rechazar, anu… | E5 | CA-037 | cubierto |  |
| RF-OC-013 | Una orden con recepción parcial no se anula: se cierra. | E5 | CA-037 | cubierto |  |
| RF-OC-014 | Cambiar precio, cantidad, proveedor o total de una orden Aprobada o Emitida la devuelve a … | E5 | CA-030 | cubierto |  |
| RF-OC-015 | La aprobación tiene un solo nivel en la v1: cada empresa fija un monto límite en su moneda… | E5 | CA-031, CA-055 | cubierto |  |
| RF-OC-016 | Con límite 0, toda orden con al menos una línea pasa por aprobación. Si la empresa desacti… | E5 | CA-055 | cubierto |  |
| RF-OC-017 | La medida de monto es el total con impuesto, en la moneda base, para todos los actos de di… | E5 | CA-055 | cubierto |  |
| RF-OC-018 | Una orden en una moneda distinta de la base siempre pasa por aprobación. | E5 | CA-031 | cubierto |  |
| RF-OC-019 | El valor del monto límite lo configura cada empresa (P-001). | E5 | CA-031 | cubierto |  |
| RF-OC-020 | Sin varios niveles ni reglas por tipo de orden en la v1. | E5 | CA-031 | cubierto |  |
| RF-OC-021 | Quien crea o edita una orden no puede aprobarla. | E5 | CA-012 | cubierto |  |
| RF-OC-022 | Nadie aprueba ni rechaza su propia solicitud. | E5 | CA-012 | cubierto |  |
| RF-OC-023 | Quien aprueba una orden no puede recibir la mercadería de esa misma orden. | E5 | CA-013 | cubierto |  |
| RF-OC-024 | Quien recibe la mercadería no puede haber creado ni aprobado esa orden. | E5 | CA-013 | cubierto |  |
| RF-OC-025 | Estas cuatro reglas las hace cumplir el servidor y valen para todos los roles, incluido el… | E5 | CA-012 | cubierto |  |
| RF-OC-026 | Interruptor único de excepciones, desactivado por defecto, con ocho casillas (compras, rec… | E5 | CA-014, CA-070 | cubierto |  |
| RF-OC-027 | Crear o modificar proveedores es un permiso distinto del de crear órdenes (solo Administra… | E2 | CA-011a | verificar | El criterio citado no lista este requisito en su cabecera; leer su texto. |
| RF-OC-028 | Dar de baja un activo de valor con una segunda persona queda fuera de la v1; la baja con m… | E7 | CA-024 | cubierto |  |
| RF-OC-029 | La recepción es un documento propio con líneas (RCP-000042). Una orden puede tener varias … | E5 | CA-033 | cubierto |  |
| RF-OC-030 | No se puede recibir más de lo pendiente. Los sobrantes se manejan fuera de la orden. Merca… | E5 | CA-034 | cubierto |  |
| RF-OC-031 | En un SKU con serie, confirmar exige que la cantidad de series capturadas sea igual a la c… | E5 | CA-034 | cubierto |  |
| RF-OC-032 | Una recepción confirmada por error se puede revertir con un movimiento contrario y motivo,… | E5 | CA-062, CA-036 | cubierto |  |
| RF-OC-033 | Confirmar es todo o nada: si una serie falla, no se crea ningún activo. Un doble clic en "… | E5 | CA-034, CA-035 | cubierto |  |
| RF-OC-034 | Dos personas recibiendo la misma orden a la vez no pueden pasarse de lo pendiente. | E5 | CA-035 | cubierto |  |
| RF-OC-035 | Al confirmar, los activos se crean en el inventario con su costo y moneda. En un SKU por c… | E5 | CA-033 | cubierto |  |
| RF-OC-036 | Al recibir se indica la ubicación de ingreso. Ubicación, fecha de compra y garantía se pid… | E5 | CA-033 | cubierto |  |
| RF-OC-037 | Las series se pueden pegar en lista (una por línea, o separadas por coma o espacio), tecle… | E5 | CA-034 | cubierto |  |
| RF-OC-038 | La validación es inmediata y con texto claro: "repetida en la fila 12", "ya existe en el S… | E5 | CA-034 | cubierto |  |
| RF-OC-039 | Los campos "a cada unidad" (IMEI) se piden en la misma tabla, pero se pueden completar des… | E5 | CA-020 | cubierto |  |
| RF-OC-040 | Antes de confirmar hay un resumen ("Se crearán 38 activos de LAP-0001 en Bodega Central. F… | E5 | CA-033 | cubierto |  |
| RF-OC-041 | Nunca se borra una recepción ni un activo. | E5 | CA-045 | verificar | El criterio citado no lista este requisito en su cabecera; leer su texto. |
| RF-OC-042 | Cada orden puede llevar una referencia externa opcional (por ejemplo el número de document… | E5 | CA-032 | cubierto |  |
| RF-OC-043 | Una orden no sale de Borrador si alguna línea no tiene precio. El precio 0 solo se acepta … | E5 | CA-032 | cubierto |  |
| RF-OC-044 | Cada orden lleva un número de versión que parte en 1 y sube con cada reaprobación; las int… | E5 | CA-030 | cubierto |  |
| RF-OC-045 | Redondeo: el subtotal de línea = cantidad × precio unitario, redondeado a los decimales de… | E5 | CA-072 | cubierto |  |
| RF-OC-046 | Los números de documento (OC-, RCP-, OS-) usan el contador por empresa con clave propia, m… | E5 | CA-018 | cubierto |  |
| RF-OC-047 | Una función única requiereSegundaPersona(acto, monto, moneda) decide en todos los módulos;… | E5 | CA-055 | cubierto |  |
| RF-OC-048 | Medidas complementarias: informe mensual "sin respaldo de compra" a quien aprueba; aviso i… | E5 | CA-055 | no probado de verdad | CA-055 prueba el borde del límite; no prueba el informe mensual "sin respaldo de compra" ni el aviso de compra fraccionada. |
| RF-OC-049 | El borrador de recepción no reserva la cantidad, vale 7 días, lo retoma cualquiera con per… | E5 | CA-061 | no probado de verdad | CA-061 prueba que el borrador no reserva; no prueba qué ocurre a los 7 días. |
| RF-OC-050 | Se puede recibir contra una orden ya emitida aunque el SKU o el proveedor se desactive des… | E5 | CA-061 | cubierto |  |
| RF-OS-001 | Una solicitud de trabajo es una orden de servicio en estado Creada. | E6 | CA-044 | cubierto |  |
| RF-OS-002 | Se registra "Pedido por", el tipo de servicio, el activo relacionado (opcional) y a quién … | E6 | CA-044 | cubierto |  |
| RF-OS-003 | Los tipos de servicio son un catálogo configurable. Partida: Reparación, Instalación y Ser… | E6 | CA-044 | cubierto |  |
| RF-OS-004 | Quien ejecuta puede ser una persona de la empresa o un proveedor del catálogo (dos destino… | E6 | CA-044 | cubierto |  |
| RF-OS-005 | La orden tiene número correlativo por empresa (OS-000042) que nunca se repite. | E6 | CA-018 | cubierto |  |
| RF-OS-006 | Una orden puede cancelarse antes de cerrar. Una orden cerrada no se reabre: se crea una nu… | E6 | CA-044 | cubierto |  |
| RF-OS-007 | Abrir o cerrar la orden no cambia el estado del activo. | E6 | CA-044 | cubierto |  |
| RF-OS-008 | La aprobación de una orden con costo sigue la regla única RN-017 (si supera el límite, otr… | E6 | CA-055 | cubierto |  |
| RF-OS-009 | Si el activo relacionado se da de baja, la orden abierta sigue su curso y muestra el aviso… | E6 | CA-044 | cubierto |  |
| RF-OS-010 | Costo: la orden guarda costo real, moneda, proveedor, centro de costo y la marca "cubierta… | E6 | CA-044 | cubierto |  |
| RF-OS-011 | Si el módulo de mantenimiento está activo, una orden de servicio tiene un vínculo 1 a 1 co… | F2 | CA-044 | cubierto |  |
| RF-PER-001 | Existe el directorio de Personas (empleados, externos o custodios), distinto de los usuari… | E2 | CA-016 | cubierto |  |
| RF-PER-002 | Datos mínimos de una Persona: nombre, tipo (Empleado, Externo, Custodio), código de emplea… | E2 | CA-016 | cubierto |  |
| RF-PER-003 | No se guarda documento de identidad, dirección ni teléfono personal en la v1. | E2 | CA-016 | cubierto |  |
| RF-PER-004 | Una Persona se vincula 1 a 1 a una membresía (opcional); los datos personales viven en una… | E2 | CA-054 | cubierto |  |
| RF-PER-005 | Una Persona nunca se borra; se cesa (estado Cesada) y, pasado el plazo y con la confirmaci… | E2 | CA-052a | cubierto |  |
| RF-PER-006 | El cese nunca se bloquea por recursos. Activos, líneas, licencias, dominios y elementos qu… | E2 | CA-052a, CA-052b, CA-081b | cubierto |  |
| RF-PER-007 | Las órdenes abiertas de una Persona cesada se reasignan o se cancelan con motivo. | E5 | CA-052d | cubierto |  |
| RF-PER-008 | Las Personas son de cada empresa. El mismo nombre en dos empresas son dos registros indepe… | E2 | CA-001 | cubierto |  |
| RF-PER-009 | Ver una Persona y sus asignaciones con nombre es el permiso datos_personales.ver; sin él s… | E2 | CA-011b | cubierto |  |
| RF-PER-010 | Las Personas se crean a mano (el alta manual puede crear homónimos, con aviso) desde la Et… | E2 | CA-038 | verificar | El criterio citado no lista este requisito en su cabecera; leer su texto. |
| RF-PER-011 | Motivo de cese: lista corta sin texto libre (salida, fin de contrato, traslado, otro). | E2 | CA-052a | cubierto |  |
| RF-PER-012 | Registro de solicitudes de derechos sobre datos personales (fecha, quién la presenta, tipo… | E2 | CA-076 | cubierto |  |
| RF-PER-013 | Anonimización manual solo para pedidos de derechos documentados, con dos personas (una pro… | E2 | CA-054 | cubierto |  |
| RF-PER-014 | Anonimizar quita correo, código de empleado, puesto y datos de contacto, y reemplaza el no… | E2 | CA-054 | cubierto |  |
| RF-PLA-001 | Existe el rol Administrador de plataforma, fuera de cualquier empresa. Son 1 o 2 personas … | E1 | CA-007 | cubierto |  |
| RF-PLA-002 | Puede crear, suspender y reactivar empresas (PS-01). Al crear una empresa define país, zon… | E1 | CA-015d | cubierto |  |
| RF-PLA-003 | Rescate de una empresa sin administrador (PS-02): lo hacen dos personas de plataforma; si … | E1 | CA-015c | cubierto |  |
| RF-PLA-004 | No ve los datos del negocio de las empresas (activos, compras, personas, precios). Lo impo… | E1 | CA-015a | cubierto |  |
| RF-PLA-005 | Soporte (PS-03): solo lectura, una empresa y un motivo por vez, máximo 24 horas, autorizad… | E1 | CA-015b | cubierto |  |
| RF-PLA-006 | Vive en una zona separada del sistema, con ruta, permisos y color propios. Nadie entra dir… | E1 | CA-015a | cubierto |  |
| RF-PLA-007 | Hay dos registros: el de plataforma (crear, suspender, rescatar, límites) y el de empresa … | E1 | CA-041 | cubierto |  |
| RF-PLA-008 | No puede activar en nombre de una empresa el interruptor único de excepciones. | E5 | CA-070 | cubierto |  |
| RF-PLA-009 | Acceso de emergencia (PS-05): si el correo falla, emite un acceso excepcional de un solo u… | E1 | CA-015c | no probado de verdad | CA-015c prueba el rescate; no prueba el acceso de emergencia (un solo uso, identidad verificada, segunda verificación). |
| RF-PLA-010 | Puede subir por un periodo corto los topes de una empresa (invitaciones, carga inicial) (P… | E1 | CA-067 | no probado de verdad | CA-067 no prueba que la plataforma sube el tope de una empresa por un periodo corto. |
| RF-PLA-011 | Contacto autorizado [SUPUESTO S-34]: lo registra el Administrador de plataforma al crear l… | E1 | CA-015c | verificar | El criterio citado no lista este requisito en su cabecera; leer su texto. |
| RF-PLA-012 | Veto durante el rescate [SUPUESTO S-34]: durante la espera de 24 horas de un rescate, cual… | E1 | CA-015c | verificar | El criterio citado no lista este requisito en su cabecera; leer su texto. |
| RF-PLA-013 | Cómo lee soporte los datos [SUPUESTO S-34]: la sesión de soporte usa una lectura de solo l… | E1 | CA-015b | verificar | El criterio citado no lista este requisito en su cabecera; leer su texto. |
| RF-ROL-001 | Cada usuario tiene un solo rol en cada empresa. El rol vive en la membresía: la misma pers… | E1 | CA-047 | cubierto |  |
| RF-ROL-002 | Hay siete plantillas de rol (Administrador, Jefatura TI, Técnico, Almacén, Solicitante, So… | E1 | CA-047 | cubierto |  |
| RF-ROL-003 | Cada permiso tiene un alcance: "todo" o "propio". Qué es "propio" lo define un resolvedor … | E1 | CA-011b | cubierto |  |
| RF-ROL-004 | Existe un registro único de permisos (docs/registro-permisos.md) con PS-nn, nombre técnico… | E1 | CA-011a | cubierto |  |
| RF-ROL-005 | Los permisos globales sensibles son uno solo de cada uno: ver datos personales (datos_pers… | E1 | CA-011b | cubierto |  |
| RF-ROL-006 | Todo rol nuevo parte sin ningún permiso. | E1 | CA-047 | cubierto |  |
| RF-ROL-007 | Nadie puede darse permisos a sí mismo, ni crear o asignar un rol con más permisos de los q… | E1 | CA-010 | cubierto |  |
| RF-ROL-008 | La empresa siempre tiene al menos un administrador activo (quien tiene administrar roles y… | E1 | CA-009 | cubierto |  |
| RF-ROL-009 | El rol Administrador de la plantilla incluye todos los permisos, pero la separación de fun… | E1 | CA-012 | cubierto |  |
| RF-ROL-010 | Todo permiso se comprueba en el servidor. Ocultar un botón en pantalla es comodidad, no se… | E1 | CA-011a | cubierto |  |
| RF-ROL-011 | Un cambio de rol vale desde la siguiente acción de esa persona, sin esperar a que cierre s… | E1 | CA-008 | cubierto |  |
| RF-ROL-012 | Un rol con usuarios asignados no se puede eliminar; se reasignan primero o se desactiva el… | E1 | CA-047 | cubierto |  |
| RF-ROL-013 | Los cambios en roles y permisos quedan en la auditoría con valor anterior y nuevo. | E1 | CA-041 | cubierto |  |
| RF-ROL-014 | Una prueba automática falla si el código usa un permiso que no está en el registro, y QA g… | E1 | CA-011a | cubierto |  |
| RF-ROL-015 | Un módulo declara en el registro de módulo sus permisos, eventos, pendientes de la persona… | E1 | CA-077 | no probado de verdad | CA-077 prueba procesos diarios; no prueba la falla por dependencias circulares entre módulos. |
| RF-SKU-001 | Cada SKU tiene: código, nombre, categoría (o subcategoría), marca, modelo, unidad de medid… | E3 | CA-017 | cubierto |  |
| RF-SKU-002 | El código es único dentro de la empresa, sin distinguir mayúsculas ni espacios (lap-0001 y… | E3 | CA-017 | cubierto |  |
| RF-SKU-003 | El código automático es el prefijo de la categoría más un correlativo con mínimo de 4 dígi… | E3 | CA-018 | cubierto |  |
| RF-SKU-004 | Un código no se reutiliza nunca, aunque el SKU se desactive. Pueden quedar saltos; lo que … | E3 | CA-018 | cubierto |  |
| RF-SKU-005 | Escribir un código propio (por ejemplo el de SAP) es un permiso aparte. El código escrito … | E3 | CA-019 | cubierto |  |
| RF-SKU-006 | El código no se edita cuando el SKU ya tiene movimientos o activos. | E3 | CA-019 | cubierto |  |
| RF-SKU-007 | No se puede cambiar el modo de control ni la categoría de un SKU que ya tiene activos o st… | E3 | CA-022 | cubierto |  |
| RF-SKU-008 | Un SKU con serie siempre es de a 1 unidad. | E3 | CA-022 | cubierto |  |
| RF-SKU-009 | Un SKU por serie no acepta unidades sin serie, salvo que el SKU lo autorice expresamente. | E3 | CA-023 | cubierto |  |
| RF-SKU-010 | Un SKU inactivo no se puede usar en órdenes nuevas; sigue visible en el historial. Desacti… | E3 | CA-061 | cubierto |  |
| RF-SKU-011 | El SKU no tiene precio fijo: el precio vive en la línea de la orden de compra. | E3 | CA-032 | cubierto |  |
| RF-SKU-012 | Desde un SKU se ven todas sus series, su stock por ubicación, sus órdenes de compra y su h… | E3 | CA-048 | cubierto |  |
| RF-SKU-013 | Licencias: no son un tipo especial. Una unidad de licencia controlada por serie tiene como… | E3 | CA-042, CA-064 | cubierto |  |
| RF-SKU-014 | Ver la clave completa exige licencias.ver_clave (solo Administrador por defecto; la empres… | E4 | CA-042 | cubierto |  |
| RF-SKU-015 | En la v1 no se asigna cada puesto de una licencia a una persona; basta el total de puestos… | E3 | CA-020 | cubierto |  |
| RF-SKU-016 | Un SKU puede tener un stock mínimo opcional. En la v1 es solo un dato: no genera avisos ni… | E3 | CA-020 | cubierto |  |
| RF-USR-001 | Un usuario tiene uno de estos estados en cada empresa: Invitado, Activo, Suspendido, Dado … | E1 | CA-052c | cubierto |  |
| RF-USR-002 | Un usuario nunca se borra; se suspende o se da de baja. | E1 | CA-045 | cubierto |  |
| RF-USR-003 | Suspender corta el acceso al instante y se puede revertir. Dar de baja a un usuario siempr… | E1 | CA-052c | cubierto |  |
| RF-USR-005 | Las órdenes abiertas de un usuario dado de baja se reasignan o se cancelan con motivo. | E5 | CA-052d | cubierto |  |
| RF-USR-006 | Dar de baja no borra el historial. Los datos personales se anonimizan pasado el plazo de l… | E1 | CA-054 | verificar | El criterio citado no lista este requisito en su cabecera; leer su texto. |
| RF-USR-007 | Cada alta, suspensión, baja y cambio de rol queda en la auditoría. | E1 | CA-041 | cubierto |  |
| RF-USR-008 | Un usuario puede estar vinculado a una Persona (1 a 1, opcional). | E2 | CA-052c | cubierto |  |
| RF-UX-001 | Mapa de navegación por perfil: 8 perfiles (Administrador, Jefatura TI, Técnico, Almacén, S… | E1 | CA-050b | cubierto |  |
| RF-UX-002 | Inicio por tarjetas: cada módulo aporta tarjetas; cada rol tiene una principal (Almacén: "… | E1 | CA-050b | cubierto |  |
| RF-UX-003 | Hay una sola bandeja "Mi trabajo" para el Técnico y una sola bandeja "Por aprobar" con pes… | E5 | CA-050b | cubierto |  |
| RF-UX-004 | "Pedir ayuda": un solo botón. En la v1 crea la orden de servicio en estado Creada; en la F… | E6 | CA-080 | cubierto |  |
| RF-UX-005 | Pantallas sin dueño en el diseño: Primeros pasos, Módulos activos, Mi cuenta y seguridad, … | E1 | CA-050b | cubierto |  |
| RF-UX-006 | La ficha del activo tiene cabecera fija y siete pestañas condicionales (los nombres exacto… | E4 | CA-050b | cubierto |  |
| RF-UX-007 | Catálogo de tres mensajes y tres bloqueos: mensajes "No encontrado", "No tiene permiso", "… | E1 | CA-048 | cubierto |  |
| RF-UX-008 | Tres formas de dato oculto: la referencia (PRS-0042), el secreto enmascarado y la columna … | E1 | CA-011b | verificar | El criterio citado no lista este requisito en su cabecera; leer su texto. |
| RF-UX-009 | Un diálogo de motivo único para todas las acciones con motivo obligatorio. | E4 | CA-024 | cubierto |  |
| RF-UX-010 | Siete familias de color, cada una con texto e icono (no solo color), definidas en la guía … | E1 | CA-050a | cubierto |  |
| RF-UX-011 | Una sola pantalla de Vencimientos, una de "Importar datos", un solo "Mi espacio", y la con… | E4 | CA-050b | cubierto |  |
| RF-UX-012 | Una lista "campo / oficina" para celular: buscar, ficha, entregar y devolver, recibir y ca… | E4 | CA-050a | cubierto |  |
| RNF-001 | El idioma de la plataforma es español y el trato es de "usted" en toda pantalla, portal y … | E1 | CA-050b | cubierto |  |
| RNF-002 | Cada empresa tiene su zona horaria. Las fechas de garantía y vencimiento son fechas de cal… | E1 | CA-046 | cubierto |  |
| RNF-003 | Funciona en computador, tablet y celular. La recepción, la búsqueda, la entrega y la aprob… | E4 | CA-050a | cubierto |  |
| RNF-004 | Medible: WCAG nivel AA (contraste), pantalla de 360 px de ancho sin desplazamiento horizon… | E1 | CA-050a | cubierto |  |
| RNF-005 | El lector de código de barras se soporta como entrada (escribe como teclado; el cursor sal… | E5 | CA-034 | cubierto |  |
| RNF-006 | Toda lista tiene buscador, filtros (estado, ubicación, categoría) y exportación a Excel (s… | E2 | CA-043 | cubierto |  |
| RNF-007 | Hay un buscador global agrupado por tipo (SKU, serie, activo, orden). Solo encuentra lo de… | E4 | CA-048 | cubierto |  |
| RNF-008 | El Inicio es una página de tarjetas que cada módulo aporta, con una tarjeta principal por … | E1 | CA-050b | cubierto |  |
| RNF-009 | Los textos de error son claros y no muestran detalles internos ni datos personales. Existe… | E1 | CA-073 | cubierto |  |
| RNF-010 | Volumen de referencia (una sola cifra para todos los módulos): 100.000 activos por empresa… | E7 | CA-053 | cubierto |  |
| RNF-011 | Con el volumen de referencia, el 95 % de las listas y búsquedas responde en menos de 2 seg… | E4 | CA-053 | cubierto |  |
| RNF-012 | Disponibilidad: sin compromiso de funcionar 24 horas en la v1; los mantenimientos se avisa… | E7 | CA-053 | cubierto |  |
| RNF-013 | Toda acción importante muestra una confirmación; donde se pueda, se puede corregir o desha… | E4 | CA-069 | cubierto |  |
| RNF-014 | Respaldo automático diario y cifrado, con restauración probada antes de la Etapa 1, antes … | E7 | CA-053 | cubierto |  |
| RNF-015 | Cada despliegue tiene un plan de vuelta atrás escrito y ensayado con cronómetro. | E7 | CA-053 | cubierto |  |
| RNF-016 | Manual del usuario y del administrador al cierre de cada etapa; manual de operación (respa… | E7 | CA-053 | cubierto |  |
| RNF-017 | El costo de alojamiento, respaldos y soporte se estima en la Etapa 0. [ESCALAR AL CEO] (se… | E0 | CA-053 | cubierto |  |
| RNF-018 | Pasar a producción con datos reales lo aprueba el Cliente (CEO) tras la demo, con respaldo… | E7 | CA-053 | cubierto |  |
| RNF-019 | Trabajos en segundo plano: importación, exportación hasta 50.000 filas y PDF masivo corren… | E1 | CA-077 | cubierto |  |
| RNF-020 | Reloj de la plataforma: las pruebas pueden fijar y adelantar la fecha (solo en entornos de… | E1 | CA-077 | cubierto |  |
| RNF-021 | Un solo programador reparte los trabajos diarios. Los eventos que protegen la integridad (… | E1 | CA-077 | cubierto |  |
| RNF-022 | Una vigencia (contrato, garantía, dominio) se calcula al leer con la fecha y la zona horar… | F2 | CA-077 | cubierto |  |

---

*Fin. Los requisitos retirados (RF-USR-004, RF-IMP-012) no aparecen.*
