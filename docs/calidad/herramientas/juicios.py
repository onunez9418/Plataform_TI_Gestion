"""Juicios de QA que salen de LEER el texto de requisito y criterio (no los puede deducir un script).
Se revisan cada vez que cambia el documento funcional. Fecha de la lectura: 2026-10-29, commit 0e6239e
(lectura anterior: 2026-10-26, commit b8e01d3). Cada texto está escrito para quien lo lee sin haber visto el código."""

# ---------------------------------------------------------------------------
# 1. Requisitos cuyo criterio citado existe pero no los prueba de verdad (lectura al 2026-10-29).
# id -> (criterio citado, qué falta probar, cuándo debe estar cerrado según D-076, responsable de redactar)
# Salieron de la lista desde el 2026-10-26 porque el Analista redactó su criterio: RF-EMP-004 (CA-071 con datos),
# RF-PLA-013 (CA-015g/h/i), RF-OC-026 (CA-097, CA-098), RF-INV-033 (CA-101), RF-INV-005 (CA-038c), RF-IMP-008/009/010
# (CA-038c, CA-038d), RF-IMP-015 (CA-099), RF-IMP-016 (CA-100), RF-IMP-017 (CA-105), RF-OC-049 (CA-103),
# RF-OC-051 (CA-104a/b), RF-PRV-003 (CA-PRV-04a/c), RF-GAR-003 (CA-GAR-04c/d) y RF-GAR-006 (CA-GAR-04e).
# ---------------------------------------------------------------------------
NO_PRUEBA = {
    'RF-OC-048': ('CA-055, CA-102', 'CA-102 prueba el aviso «posible compra fraccionada» con datos (3.000,00 y 2.500,00 con el mismo proveedor, 20 días, límite 5.000,00). Falta el informe mensual «sin respaldo de compra»: no tiene criterio porque el requisito sigue en P-018 (qué registros entran y dónde lo ve quien aprueba). Además CA-102 no fija los bordes: suma igual al límite y compra exactamente a los 30 días. QA supone «solo avisa si la suma supera el límite» (como CA-055) y 30 días corridos con el día 30 incluido; el Analista debe confirmarlo.', 'Antes de la Etapa 5 (P-018)', 'Analista; responde P-018 el Gerente de TI'),
    'RF-ENT-002': ('CA-ENT-01', 'CA-ENT-01 no prueba el borrador automático (salir y volver sin perder lo capturado; no reserva equipos; el borrador sin efecto se puede borrar). «Sin hacer» del Analista al 2026-10-29.', 'Antes de la Etapa 4 (D-076.3)', 'Analista (escuadrón D); QA propone texto'),
    'RF-ENT-016': ('CA-ENT-01', 'CA-ENT-01 no prueba renovar un préstamo (nueva fecha con motivo y auditoría). «Sin hacer» del Analista al 2026-10-29.', 'Antes de la Etapa 4', 'Analista (escuadrón D); QA propone texto'),
    'RF-OC-028': ('CA-024', 'Es de la Etapa 7 (decisión P-009 del Gerente de TI) y su único criterio corre en la Etapa 4. En la v1 solo vale «la baja con motivo y la auditoría la cubren», que sí prueba CA-024; la decisión de la Etapa 7 no tiene criterio. «Sin hacer» del Analista al 2026-10-29.', 'Antes de la Etapa 7 (P-009)', 'Analista; QA propone un criterio documental'),
}

# Observaciones menores sobre requisitos que SÍ están cubiertos (no cambian el estado, se muestran en la columna Observación).
OBS_MENOR = {
    'RF-IMP-010': 'CA-038c prueba fechas y series dañadas; ningún criterio prueba que la plantilla trae las columnas costo, moneda, fecha de compra, fin de garantía directo o meses, y centro de costo. QA lo cubre con una prueba de la plantilla; pedir al Analista una línea en CA-038a.',
    'RF-IMP-009': 'Los textos de estado que usa el Excel real se definen con P-007: hasta entonces CA-038d prueba con `EN STOCK`, ` en reparación ` y `Chatarra` supuestos.',
    'RF-OC-049': 'CA-103 prueba el borrador sin cambios posteriores. El caso con cambios (¿7 días desde la creación o desde el último cambio?) espera a P-019.',
    'RF-IMP-017': 'CA-105 es una verificación documental y no se puede ejecutar hasta que el Cliente (CEO) entregue los documentos reales (P-002).',
    'RF-DAT-017': 'CA-095f y CA-095g dependen de P-017: sin el permiso nuevo en el registro y sin saber si levantar exige una segunda persona de plataforma, solo se pueden probar los rechazos. La parte de rutinas de otros módulos (CA-095j) está en Fase 2 aunque la v1 ya tiene varias rutinas de purga (ver ambiguos).',
    'RF-PLA-013': 'CA-015g y CA-015i corren en la Etapa 1; CA-015h (sin secretos ni derechos) solo puede correr en la Etapa 2. La Etapa 1 se cierra sin esa mitad y debe quedar anotado.',
    'RF-AUD-016': 'CA-095h prueba el archivado de la auditoría vencida con una empresa congelada. La purga de los eventos de seguridad a los 12 meses (tabla 18.1, mismo proceso de mantenimiento) no tiene criterio.',
}

# ---------------------------------------------------------------------------
# 2. Citas mal apuntadas o incompletas (el criterio existe, pero no es el que prueba el requisito).
# Resueltas desde la lectura anterior: RF-USR-006, RF-PER-010, RF-ACC-021, RF-UX-008 y RF-OC-041.
# ---------------------------------------------------------------------------
CITA_MAL = {
    'RF-CAT-008': ('CA-017', 'CA-017 prueba que un prefijo reservado como `OC` se rechaza, pero no nombra `ACTV` (D-079). El caso `ACTV` solo lo prueba CA-094a, que corre en la Etapa 4, aunque RF-CAT-008 es de la Etapa 2 y se puede probar entera cuando existen las categorías. QA ejecuta el caso `ACTV` en la Etapa 2; falta que CA-017 nombre `ACTV` y que RF-CAT-008 cite CA-094a.'),
    'RF-GAR-006': ('CA-GAR-04e', 'CA-GAR-04e prueba corregir con motivo. La segunda mitad («una ampliación es una garantía nueva») la prueba CA-GAR-04f, en Fase 2, porque necesita varias garantías por activo (RF-GAR-004). La fila debe citar CA-GAR-04f o decir que esa mitad es de Fase 2.'),
    'RF-OC-027': ('CA-011a', 'Lo cubre la matriz de permisos de CA-011a (fila de proveedores, PS-37). Aceptable; no hace falta criterio propio.'),
}
ACEPTABLES = {'RF-OC-027'}   # cita mal apuntada que QA da por buena

# ---------------------------------------------------------------------------
# 3. Reglas RN con criterio citado en su columna que no las prueba del todo (lectura al 2026-10-29).
# Salieron: RN-009 (CA-096 prueba lista, bandeja y exportación sin total entre monedas) y RN-018 (CA-GAR-04a prueba
# «Vencida» al leer, sin proceso diario). Entra RN-024 (congelación).
# ---------------------------------------------------------------------------
RN_PARCIAL = {
    'RN-023': 'CA-094a y CA-094b prueban el código y su contador; el acta lleva código y serie (CA-046). La cláusula «el correo de un aviso de garantía trae el código y no la serie» (CA-094c) necesita los avisos de garantía (Fase 2). En la v1 los correos (invitación, acceso, aprobación) no llevan activo: la regla se prueba por completo al activar GAR-B.',
    'RN-021': 'CA-063 y CA-072 prueban el costo del activo en la v1 (el de la recepción). El libro único y `fuente_costo` son de Fase 3 (CA-PRE-14).',
    'RN-024': 'En la v1 se prueban la anonimización manual (CA-095a a 095g) y el archivado de la auditoría (CA-095h, CA-095i). «Toda rutina de anonimización o de purga consulta la congelación» (CA-095j) está en Fase 2, pero la v1 ya tiene rutinas: anonimización de contactos de proveedor (CA-092, Etapa 2), anonimización automática de Personas con la bandera de pruebas (Etapa 2), filas de importación en preparación a los 7 días (RF-DAT-004, Etapa 4) y purga de eventos de seguridad a los 12 meses (Etapa 7). Ninguna se prueba con congelación hasta Fase 2.',
}

# ---------------------------------------------------------------------------
# 4. Criterios que QA lee como ambiguos o por corregir. (id, etapa, problema y propuesta de QA)
# Cerrados desde la lectura del 2026-10-26: CA-006 (200 intentos, p95 < 100 ms), CA-077 (fechas y tres empresas),
# CA-038 (partido en a-d), CA-082 (cabecera corregida), CA-094 (partido en a-c), CA-PRS-14 (manual y automático separados).
# Los «Sin hacer» (CA-024, CA-053, CA-ENT-08, CA-ENT-10) los detecta huecos.py y se agregan a esta tabla al generar.
# ---------------------------------------------------------------------------
AMBIGUOS = [
    ('CA-PRS-16', 'Etapa 2', 'Cita RN-PRS-004 (referencia correlativa) cuando prueba el alcance «propio» sin Persona vinculada (regla del registro de permisos). Cambiar la cita.'),
    ('CA-095f', 'Etapa 2', 'Dice «el permiso lo fija el registro de permisos, P-017», pero ese permiso no existe todavía. Se puede probar que un Administrador de empresa no declara ni levanta (rechazo); no se puede probar el caso positivo de la plataforma hasta que P-017 lo cree. Mientras tanto QA lo ejecuta solo por la mitad del rechazo y lo declara parcial.'),
    ('CA-095g', 'Etapa 2', 'Igual que CA-095f: el acto de declarar y de levantar necesita el permiso de P-017. Además P-017 pregunta si levantar exige una segunda persona de plataforma; el criterio no lo dice.'),
    ('CA-095j', 'Fase 2', 'Está en Fase 2 «al activar cada módulo», pero la v1 ya tiene rutinas de purga o anonimización: contactos de proveedor (Etapa 2), anonimización automática de Personas con la bandera de pruebas (Etapa 2), filas de importación en preparación a los 7 días (Etapa 4) y eventos de seguridad a los 12 meses (Etapa 7). Propuesta de QA: partir en 095j1 (Etapa 2: contactos de proveedor y Personas), 095j2 (Etapa 4: filas de importación), 095j3 (Etapa 7: eventos de seguridad) y dejar 095j para los módulos de Fase 2 (registro de envíos, IP del acuse).'),
    ('CA-102', 'Etapa 5', 'No dice qué pasa cuando la suma es exactamente el límite (5.000,00) ni cuando la compra anterior es de hace exactamente 30 días. Propuesta de QA: avisa solo si la suma supera el límite y cuenta 30 días corridos con el día 30 incluido; agregar los casos 5.000,00 (sin aviso) y día 30 (con aviso) y día 31 (sin aviso).'),
    ('CA-103', 'Etapa 5', 'Prueba el borrador sin cambios. El caso con cambios espera a P-019 (¿7 días desde que se creó o desde el último cambio?). No se puede probar más hasta que el Gerente de TI responda.'),
    ('CA-094a', 'Etapa 4', 'Incluye «crear una categoría con el prefijo `ACTV` se rechaza», que se puede probar desde la Etapa 2 (RF-CAT-008). Propuesta: que CA-017 nombre `ACTV`; CA-094a lo repite.'),
    ('CA-GAR-04a', 'Etapa 4', 'Dice «el 15/03/2027 a las 23:59 todavía» sin decir en qué zona horaria. Propuesta de QA: la de la empresa, como CA-046 y CA-082b; agregar una empresa de otra zona para el mismo instante.'),
    ('CA-038d', 'Etapa 4', 'Usa los textos `EN STOCK`, ` en reparación ` y `Chatarra`; el Excel real puede traer otros (P-007). La prueba usa esos tres hasta que llegue el Excel.'),
    ('CA-105', 'Etapa 0', 'Es una verificación de documentos que depende de que el Cliente (CEO) entregue el Excel, la orden de compra y la orden de servicio reales (P-002). Mientras no lleguen, no se puede ejecutar y la Etapa 0 no cierra en ese punto.'),
]

# ---------------------------------------------------------------------------
# 5. Criterios de módulos que, leídos, no corren en la etapa que sale de sus requisitos (se aplican antes de contar).
# id -> dict(etapa=..., completa=..., nota=...)
# Los criterios CA-PRS-01, 03, 08, 12, 14 y CA-PRV-04 que figuraban aquí ya están partidos por el escuadrón.
# ---------------------------------------------------------------------------
OVERRIDES_MODULOS = {
    'CA-PRS-01d': dict(etapa=2, nota='La tabla del criterio dice Etapa 2 y la prueba es el alta manual con homónimo; el requisito RF-PER-010 dice «importación en Etapa 4», que prueba CA-PRS-11.'),
}

# Etapa de requisito leída por QA cuando el requisito cita criterios de dos etapas distintas (id de criterio -> (mínima, máxima, motivo)).
# Sin esto el script marcaría como «corre antes de lo que necesita» a criterios que solo prueban la parte temprana de un requisito en dos etapas.
REQ_ETAPA = {
    'CA-016a': (2, 2, 'RF-PER-010 es de Etapa 2 con importación en Etapa 4; CA-016a prueba el alta manual (Etapa 2).'),
    'CA-065a': (2, 2, 'RF-INV-005 es de Etapa 4, pero CA-065a prueba solo la definición del campo identificador (Etapa 2); las unidades las prueba CA-065b.'),
    'CA-095a': (2, 2, 'RF-DAT-017 es de Etapas 2 y 7; esta parte es la anonimización manual (Etapa 2).'),
    'CA-095b': (2, 2, 'RF-DAT-017 es de Etapas 2 y 7; esta parte es la anonimización manual (Etapa 2).'),
    'CA-095c': (2, 2, 'RF-DAT-017 es de Etapas 2 y 7; esta parte es la anonimización manual y el registro de pedidos (Etapa 2).'),
    'CA-095d': (2, 2, 'RF-DAT-017 es de Etapas 2 y 7; esta parte es retomar lo propuesto (Etapa 2).'),
    'CA-095e': (2, 2, 'RF-DAT-017 es de Etapas 2 y 7; esta parte es el levantamiento parcial (Etapa 2).'),
    'CA-095f': (2, 2, 'RF-DAT-017 es de Etapas 2 y 7; esta parte es quién declara y levanta (Etapa 2).'),
    'CA-095g': (2, 2, 'RF-DAT-017 es de Etapas 2 y 7; esta parte es el rastro de declarar y levantar (Etapa 2).'),
    'CA-095h': (7, 7, 'Prueba la parte de la auditoría vencida de RF-DAT-017, que es del proceso de mantenimiento (Etapa 7).'),
    'CA-095i': (7, 7, 'Prueba la parte de la restauración de RF-DAT-017 (RS-49), que es de la Etapa 7.'),
    'CA-PRS-01d': (2, 2, 'Prueba el alta manual con homónimo; la importación la prueba CA-PRS-11.'),
}

# Tipo de prueba corregido por QA donde la clasificación por palabras se equivoca (id -> (tipo, motivo)).
TIPOS = {
    'CA-105': ('manual (verificación documental)', 'El propio criterio dice que es una verificación de documentos y no una prueba automática.'),
    'CA-101': ('integración + navegador', 'Cuenta eventos emitidos por el servidor (integración) y un doble clic en la asignación (navegador).'),
    'CA-102': ('integración + navegador', 'Reloj y suma por proveedor en el servidor; el aviso se ve en la pantalla de la orden.'),
    'CA-104a': ('integración + navegador', 'Comprueba qué muestra la pantalla de aprobación y que aprobar no cambia.'),
    'CA-104b': ('integración + navegador', 'Necesita un módulo de prueba que declare información y justificación; se ve en la pantalla.'),
    'CA-038d': ('integración + navegador', 'Vista previa por fila en pantalla y movimientos «saldo inicial» en la base.'),
    'CA-095d': ('integración', 'Retomar una propuesta guardada en la base; no es un cálculo.'),
    'CA-GAR-01b': ('navegador', 'Se prueba que la pantalla de recepción pide la garantía una sola vez para el lote.'),
    'CA-PRS-03c': ('integración', 'Consulta de pérdidas contra la base.'),
    'CA-PRS-08a': ('integración', 'El ciclo en el árbol de ubicaciones se detecta con la consulta recursiva de PostgreSQL.'),
    'CA-PRS-12a': ('integración', 'La asignación rechazada pasa por la base y la regla de estado de la Persona.'),
    'CA-PRS-12b': ('integración', 'Reactivar conserva la referencia y el historial en la base.'),
    'CA-PRS-12d': ('integración', 'Rechazo guardado y verificado en la base.'),
    'CA-PRS-14d': ('integración', 'Historial de asignaciones tras anonimizar, contra la base.'),
    'CA-PRS-14e': ('integración + navegador', 'Se imprime el acta (PDF) con el reloj en `retener_hasta`.'),
    'CA-PRV-04b': ('integración', 'Necesita un contrato Vigente en la base (Fase 2).'),
}

# ---------------------------------------------------------------------------
# 6. Etapa de ejecución de cada criterio NUEVO desde la lectura anterior, según QA, y por qué.
# id -> (etapa 0..7, 8 = Fase 2, 9 = Fase 3, por qué). generar.py compara con la etapa que sale del documento y avisa si difieren.
# ---------------------------------------------------------------------------
ETAPA_NUEVOS = {
    'CA-015g': (1, 'Usa solo lo de la Etapa 1: autorizaciones de soporte (RF-PLA-005), reloj y tres personas de plataforma. Sin campos secretos ni solicitudes de derechos, por eso esa mitad es CA-015h.'),
    'CA-015h': (2, 'Necesita un campo secreto (CA-042, Etapa 2) y la cola de solicitudes de derechos (RF-PER-012, Etapa 2); antes no hay qué proteger. RF-PLA-013 es de Etapa 1: queda anotado como «arranca después».'),
    'CA-015i': (1, 'Lectura válida: solo esa empresa y solo lectura. Usa la autorización de CA-015g y el rol de plataforma de CA-015a.'),
    'CA-038a': (4, 'La importación nace en la Etapa 4 (RF-IMP-001). Pide el trabajador reiniciable (CI-16) y un SKU que exige serie.'),
    'CA-038b': (4, 'Deshacer el lote necesita el lote ya confirmado y una asignación posterior (entregas, Etapa 4).'),
    'CA-038c': (4, 'Necesita un SKU con 10 activos y un campo identificador (CA-065a, Etapa 2; unidades CA-065b, Etapa 4).'),
    'CA-038d': (4, 'El stock inicial por ubicación y los 5 estados del activo existen desde la Etapa 4 (RF-INV-001). Los sinónimos de estado dependen de P-007.'),
    'CA-094a': (4, 'Se prueba con ingreso manual (RF-INV-025) y con importación, ambos de la Etapa 4. La parte del prefijo `ACTV` se podría probar antes (ver ambiguos).'),
    'CA-094b': (5, 'Necesita la recepción de una orden de compra (RF-OC-035), que existe desde la Etapa 5.'),
    'CA-094c': (8, 'Necesita los avisos de garantía por correo (GAR-B con NOT-completo), de Fase 2.'),
    'CA-095a': (2, 'La anonimización manual con dos personas es de la Etapa 2 (RF-PER-013); el registro de anonimizaciones existe desde la Etapa 2 (RF-DAT-016).'),
    'CA-095b': (2, 'Igual que CA-095a: dos Personas cesadas de la Etapa 2; congelación solo sobre una.'),
    'CA-095c': (2, 'El registro de solicitudes de derechos es de la Etapa 2 (RF-PER-012).'),
    'CA-095d': (2, 'Retomar la propuesta rechazada de CA-095a; no necesita nada posterior.'),
    'CA-095e': (2, 'Levantamiento parcial con dos Personas y dos personas para anonimizar; todo de la Etapa 2. Espera a P-017 en lo del permiso.'),
    'CA-095f': (2, 'Quién declara y levanta se decide por el registro de permisos; el rechazo se prueba en la Etapa 2. El caso positivo espera a P-017.'),
    'CA-095g': (2, 'El registro de plataforma y la auditoría de la empresa existen desde la Etapa 1; el rastro se prueba junto con la primera anonimización (Etapa 2).'),
    'CA-095h': (7, 'El proceso de mantenimiento separado de la aplicación, con dos personas, es de la Etapa 7 (RF-AUD-016).'),
    'CA-095i': (7, 'Restaurar un respaldo y reaplicar registros (RS-49) es el ensayo de la Etapa 7 (CI-17); manual con apoyo de integración.'),
    'CA-095j': (8, 'El documento la deja en Fase 2. QA no está de acuerdo en que toda ella lo sea: la v1 ya tiene cuatro rutinas (ver ambiguos).'),
    'CA-096': (5, 'Necesita órdenes de compra en dos monedas, la lista, la bandeja «Por aprobar» y la exportación (RF-OC-005, Etapa 5).'),
    'CA-097': (5, 'El interruptor único con ocho casillas es de la Etapa 5 (RF-OC-026).'),
    'CA-098': (5, 'Activar una casilla pide motivo; la segunda verificación viene de la Etapa 1, la casilla de la Etapa 5.'),
    'CA-099': (4, 'El tope de 10 importaciones por día necesita los tres tipos de importación (activos, Personas y SKU), de la Etapa 4. Subir el tope por la plataforma (RF-PLA-010) ya existe desde la Etapa 1.'),
    'CA-100': (4, 'Una entrada de lote en la auditoría necesita la importación (Etapa 4).'),
    'CA-101': (4, 'Asignar, reparar, dar de baja y reingresar son de la Etapa 4 (RF-INV-018, RF-ENT-001).'),
    'CA-102': (5, 'Necesita órdenes con proveedor, límite de aprobación y reloj; es de la Etapa 5.'),
    'CA-103': (5, 'El borrador de recepción es de la Etapa 5 (RF-OC-049).'),
    'CA-104a': (5, 'La pantalla de aprobación es de la Etapa 5 (RF-OC-051).'),
    'CA-104b': (5, 'Necesita un módulo de prueba que use el espacio de la pantalla de aprobación; no existe un módulo real hasta Fase 3 (PRE).'),
    'CA-105': (0, 'Verificación documental de los archivos reales que entrega el Cliente (CEO); es condición de cierre de la Etapa 0 (D-064 condición 8). No se puede ejecutar hasta que lleguen (P-002).'),
    'CA-GAR-01a': (4, 'Garantía de un activo ingresado a mano (RF-INV-025): ficha y fecha, sin recepción.'),
    'CA-GAR-01b': (5, 'Captura de la garantía en la recepción de un lote (RF-GAR-001).'),
    'CA-GAR-01c': (5, 'Los activos creados por la recepción muestran la garantía.'),
    'CA-GAR-04a': (4, 'Vigente y Vencida al mover el reloj, sin proceso diario (RN-018); necesita una sola garantía por activo.'),
    'CA-GAR-04b': (8, 'La garantía extendida y la efectiva necesitan varias garantías por activo (RF-GAR-004, Fase 2).'),
    'CA-GAR-04c': (4, 'Filtro «vence en los próximos 30 días» (RF-GAR-003).'),
    'CA-GAR-04d': (4, 'Filtro «sin garantía vigente» (RF-GAR-003).'),
    'CA-GAR-04e': (4, 'Corregir fechas con motivo (RF-GAR-006).'),
    'CA-GAR-04f': (8, 'Una ampliación es una garantía nueva: necesita varias garantías por activo (RF-GAR-004).'),
    'CA-PRS-01a': (2, 'Alta de Persona (RF-PRS-001) sin cuenta.'),
    'CA-PRS-01b': (2, 'Persona sin cuenta no aparece en usuarios.'),
    'CA-PRS-01c': (2, 'Centro de costo efectivo (RF-PRS-006).'),
    'CA-PRS-01d': (2, 'Homónimo con aviso en el alta manual. El script lo ponía en Etapa 4 por RF-PER-010; se corrigió.'),
    'CA-PRS-03a': (2, 'Cese de una Persona sin equipos, líneas ni procesos (RF-PRS-004, 011).'),
    'CA-PRS-03b': (4, 'Pide una laptop asignada (RF-INV-029, Etapa 4).'),
    'CA-PRS-03c': (4, 'La marca «Pendiente de devolución» y los reportes de pérdidas son de la Etapa 4.'),
    'CA-PRS-08a': (2, 'Árbol de ubicaciones y ciclos (RF-PRS-007).'),
    'CA-PRS-08b': (2, 'Mover un Piso con sus Salas (RF-PRS-007).'),
    'CA-PRS-08c': (4, 'Mover un Piso con 40 equipos sin movimiento por activo necesita activos (RF-INV-027).'),
    'CA-PRS-08d': (2, 'Marcar un almacén de TI (RF-PRS-008).'),
    'CA-PRS-12a': (4, 'Asignar un equipo a una Persona Cesada necesita activos y asignaciones.'),
    'CA-PRS-12b': (2, 'Reactivar con motivo (RF-PRS-012).'),
    'CA-PRS-12c': (4, 'Asignar un equipo a una Persona reactivada necesita asignaciones.'),
    'CA-PRS-12d': (2, 'Una Persona anonimizada no se reactiva (RF-PRS-012).'),
    'CA-PRS-14a': (2, 'Anonimización manual con dos personas (RF-PRS-015).'),
    'CA-PRS-14b': (2, 'Nombre y correo canarios no aparecen en ninguna parte (RNF-PRS-009).'),
    'CA-PRS-14c': (2, 'La auditoría no se toca.'),
    'CA-PRS-14d': (4, 'Historial de asignaciones necesita asignaciones cerradas (RF-INV-015).'),
    'CA-PRS-14e': (4, 'Copia del nombre en el acta hasta `retener_hasta` necesita actas (RF-DAT-006, 011).'),
    'CA-PRS-14f': (2, 'La anonimización automática está apagada; se prueba con el reloj de pruebas (RN-PRS-019).'),
    'CA-PRV-02a': (2, 'Proveedor de otra empresa por identificador interno (RF-PRV-007).'),
    'CA-PRV-02b': (8, 'Necesita contratos (PRV-B, Fase 2).'),
    'CA-PRV-02c': (8, 'Necesita contratos y vínculos con activos (PRV-B, Fase 2).'),
    'CA-PRV-04a': (2, 'Desactivar un proveedor con motivo (RF-PRV-003).'),
    'CA-PRV-04b': (8, 'Necesita un contrato Vigente (PRV-B, Fase 2).'),
    'CA-PRV-04c': (2, 'Reactivar un proveedor con motivo (RF-PRV-003).'),
}

# Criterios que existían enteros el 2026-10-26 y hoy están partidos por el Analista o por un escuadrón.
PARTIDOS = ['CA-038', 'CA-094', 'CA-GAR-01', 'CA-GAR-04', 'CA-PRS-01', 'CA-PRS-03', 'CA-PRS-08', 'CA-PRS-12', 'CA-PRS-14', 'CA-PRV-02', 'CA-PRV-04']

# Cuáles de los criterios que cruzan etapas en los módulos de la v1 ya traen una propuesta de partición de QA
PROPUESTA_PARTIR = {
    'CA-PRS-04': 'Corre en Etapa 4; el rechazo de anonimizar con pendientes de la Etapa 2 (sin equipos) lo cubre CA-052b1.',
    'CA-PRS-11': 'Importar Personas es de la Etapa 4 (RF-PER-010 con importación). El alta manual con homónimo ya es CA-PRS-01d (Etapa 2).',
}

# ---------------------------------------------------------------------------
# 7. D-076: lo que se exige antes de cada etapa.
# (etapa, requisito/regla, criterio, qué dice la lectura de QA hoy, responsable)
# Estados: HECHO · PARCIAL · PENDIENTE · BLOQUEADO (espera una respuesta o un archivo)
# ---------------------------------------------------------------------------
D076 = [
    (1, 'RN (todas las reglas de la sección 21)', 'Columna CA en la tabla de reglas', 'HECHO. Todas las reglas ({total}) citan al menos un criterio que existe. {vuelta} de {total} además aparecen citadas por el propio criterio; las otras {solo} solo en la columna (basta: D-076.1a dice "citando"). Sugerencia: RN-010 debería nombrar también CA-079b (autoentrega sin excepción).', 'Analista (hecho); Auditor Técnico verifica con su guion'),
    (1, 'RF-ACC-006', 'CA-068', 'HECHO. Prueba los 15 minutos (a los 15:01 se rechaza), el uso único y el código de 8 caracteres en otro dispositivo.', 'Analista (hecho)'),
    (1, 'RF-ACC-014', 'CA-069', 'HECHO. Prueba aviso a los 25, vencimiento a los 30 minutos sin actividad y a las 12 horas.', 'Analista (hecho)'),
    (1, 'RF-ACC-020', 'CA-009', 'HECHO. Prueba el aviso de recomendar al menos dos administradores.', 'Analista (hecho)'),
    (1, 'RF-PLA-009', 'CA-015f', 'HECHO. Segunda persona o contacto confirmado, aviso a todos, un solo uso, 2F, un uso por semana. No prueba "verificar la identidad por otro medio" (es un procedimiento: queda como paso manual de la prueba).', 'Analista (hecho)'),
    (1, 'RF-PLA-010', 'CA-084', 'HECHO. El tope sube por un periodo y vuelve solo; queda en el registro.', 'Analista (hecho)'),
    (1, 'RF-PLA-011 y RF-PLA-012', 'CA-015e', 'HECHO. Confirmación del contacto, espera de 24 horas con aviso, veto durante el rescate.', 'Analista (hecho)'),
    (1, 'RF-EMP-004', 'CA-071', 'HECHO (verificado por QA el 2026-10-29). CA-071 trae ahora horario, feriado y cuatro resultados esperados. QA comprobó las fechas: el 06/11/2026 es viernes y el 09/11/2026 lunes; tres días corridos desde el viernes caen el lunes.', 'Analista (hecho)'),
    (1, 'RF-ROL-015 y CA-077', 'CA-077', 'HECHO (verificado por QA el 2026-10-29). CA-077 trae reloj R0, tres empresas, doble corrida, tres días perdidos y el cambio de día entre Lima y Ciudad de México (06/11 05:30 universal). Incluye la prueba de dependencias.', 'Analista (hecho)'),
    (1, 'CA-006', 'CA-006', 'HECHO. 200 intentos con cuenta y 200 sin cuenta, diferencia menor a 100 ms en el percentil 95, y esperas con reloj (10:00:59 se rechaza, 10:01:00 se acepta).', 'Analista (hecho)'),
    (1, 'CA-070 (segundo administrador y resumen mensual)', 'CA-070', 'HECHO en el texto. Corre en Etapa 5 según 22.1.', 'Analista (hecho)'),
    (1, 'RN-008', 'CA-085', 'HECHO. Recorre las acciones con motivo, incluye el tope de 500 caracteres.', 'Analista (hecho)'),
    (1, 'RF-PLA-013 (lectura de soporte)', 'CA-015g, CA-015h, CA-015i', 'HECHO (2026-10-29). 015g prueba autorización vencida (10:01 contra 10:00), ajena y ya usada, con cero filas y escritura que falla, y el borde de las 09:59, que todavía lee; 015i la válida; 015h (sin secretos ni derechos) corre en Etapa 2.', 'Analista (hecho)'),
    (1, 'RF-IMP-017 y RF-DAT-010', 'CA-105', 'BLOQUEADO (P-002). El texto está (verificación documental); no se puede ejecutar hasta que el Cliente (CEO) entregue el Excel, la orden de compra y la orden de servicio reales con nombres reemplazados.', 'Cliente (CEO) entrega; QA verifica el archivo recibido'),
    (2, 'RN-015', 'CA-086', 'HECHO (ya redactado).', 'Analista (hecho)'),
    (2, 'RN-016', 'CA-087', 'HECHO (ya redactado).', 'Analista (hecho)'),
    (2, 'RF-CAT-026', 'CA-092', 'HECHO (ya redactado): 2 años, exportación general sin contactos, permiso para verlos.', 'Analista (hecho)'),
    (2, 'RF-PRV-003 y CA-PRV-04', 'CA-PRV-04a, CA-PRV-04c', 'HECHO (partido por el escuadrón A). 04b (contrato Vigente) queda en Fase 2.', 'Analista (hecho)'),
    (2, 'CA-PRS-01, 03, 08, 12 y 14; CA-PRV-02', 'CA-PRS-01a a 14f, CA-PRV-02a a 02c', 'HECHO. Los seis criterios están partidos y cada parte tiene etapa. Quedó un error de lectura corregido por QA: CA-PRS-01d corre en Etapa 2.', 'Analista (hecho)'),
    (2, 'RF-DAT-017 y RN-024 (congelación por incidente)', 'CA-095a a CA-095g', 'PARCIAL. Siete criterios con datos. CA-095f y CA-095g no se pueden probar completos hasta que el Gerente de TI responda P-017 (el permiso nuevo del registro y si levantar exige una segunda persona de plataforma).', 'Gerente de TI responde P-017; Analista actualiza el registro de permisos y los dos criterios'),
    (2, 'RN-024 (rutinas que ya existen en la v1)', 'CA-095j', 'PENDIENTE. CA-095j está en Fase 2 y deja sin criterio con congelación a cuatro rutinas de la v1: contactos de proveedor y anonimización automática de Personas (Etapa 2), filas de importación en preparación (Etapa 4) y eventos de seguridad a los 12 meses (Etapa 7).', 'Analista; QA propone la partición (ver ambiguos)'),
    (2, 'RF-CAT-008 (prefijo `ACTV` reservado)', 'CA-017', 'PENDIENTE (menor). CA-017 no nombra `ACTV`.', 'Analista'),
    (4, 'RF-IMP-008, 009, 010, 015 y 016; RF-INV-005', 'CA-038c, CA-038d, CA-099, CA-100', 'HECHO (2026-10-29). Quedan dos observaciones menores: la plantilla de RF-IMP-010 (columnas) no tiene criterio y los textos de estado dependen de P-007.', 'Analista (hecho)'),
    (4, 'RF-INV-033', 'CA-101', 'HECHO (2026-10-29). Seis cambios, un evento cada uno, sin segundo evento en la baja ni evento en el cambio rechazado; doble clic = un evento.', 'Analista (hecho)'),
    (4, 'Partir CA-038 y CA-094', 'CA-038a a 038d, CA-094a a 094c', 'HECHO (2026-10-29).', 'Analista (hecho)'),
    (4, 'RF-GAR-003 y RF-GAR-006', 'CA-GAR-04c, CA-GAR-04d, CA-GAR-04e', 'HECHO. La mitad de RF-GAR-006 «una ampliación es una garantía nueva» queda en CA-GAR-04f (Fase 2).', 'Analista (hecho)'),
    (4, 'RF-ENT-002 y RF-ENT-016', 'CA-ENT-01', 'PENDIENTE. «Sin hacer» del Analista al 2026-10-29: CA-ENT-01 no prueba el borrador ni renovar un préstamo. QA propone el texto (ver «Lo que falta»).', 'Analista (escuadrón D)'),
    (4, 'CA-ENT-08 y CA-ENT-10', 'CA-ENT-08, CA-ENT-10', 'PENDIENTE. «Sin hacer»: «falla la entrega de uno» y «cuando pasa el tiempo» siguen sin datos.', 'Analista (escuadrón D)'),
    (4, 'RF-INV-033 y CA-024 (RF-OC-028 en la cabecera)', 'CA-024', 'PENDIENTE. «Sin hacer»: CA-024 sigue cubriendo RF-OC-028 (Etapa 7) y corre en Etapa 4.', 'Analista'),
    (4, 'CA-NOT-10 y CA-NOT-13', 'CA-NOT-10, CA-NOT-13', 'PENDIENTE. Corren en Etapa 1 y cubren requisitos de Fase 2 (rebotes, bandeja, campana). No es un «Sin hacer» nuevo: es de la lectura anterior.', 'Analista (escuadrón C)'),
    (5, 'RF-OC-048', 'CA-055, CA-102', 'PARCIAL. El aviso «compra fraccionada» tiene criterio (CA-102). El informe mensual espera a P-018 y los bordes de CA-102 no están fijados.', 'Gerente de TI responde P-018; Analista'),
    (5, 'RF-OC-049 y RF-OC-050', 'CA-061, CA-103', 'HECHO. CA-103 prueba el borde de los 7 días (10:00:00 acepta, 10:00:01 rechaza). P-019 (con cambios) sigue abierto.', 'Analista (hecho); Gerente de TI responde P-019'),
    (5, 'RF-OC-026 (mapa acto-casilla), RF-OC-051', 'CA-097, CA-098, CA-104a, CA-104b', 'HECHO (2026-10-29).', 'Analista (hecho)'),
    (5, 'RN-009', 'CA-096', 'HECHO (2026-10-29). Lista, bandeja y exportación sin total entre monedas.', 'Analista (hecho)'),
    (7, 'Partir CA-053', 'CA-053', 'PENDIENTE. «Sin hacer»: CA-053 sigue entero. Su parte de rendimiento (RNF-011) corre en la carga nocturna desde la Etapa 4.', 'Analista'),
    (7, 'RF-DAT-017 (auditoría vencida y restauración)', 'CA-095h, CA-095i', 'HECHO (2026-10-29). Corren en la Etapa 7.', 'Analista (hecho)'),
    (7, 'RF-OC-028', 'CA-024', 'PENDIENTE. La decisión P-009 de la Etapa 7 no tiene criterio propio; hoy solo la baja con motivo (CA-024, Etapa 4).', 'Analista; Gerente de TI responde P-009'),
]

# Prefijos de estado que cuentan como «aún no cerrado» en D076
ABIERTOS = ('PENDIENTE', 'PARCIAL', 'BLOQUEADO', 'NUEVO', 'AMBIGUOS')

# ---------------------------------------------------------------------------
# 8. Razón con que QA explica por qué un criterio del núcleo arranca después de la etapa de su requisito.
# ---------------------------------------------------------------------------
NOTAS_TARDE = {
    'CA-012': 'Necesita órdenes de compra (Etapa 5). Hasta entonces "quien crea no aprueba" solo se prueba por la matriz (CA-011a) y CA-010.',
    'CA-015h': 'RF-PLA-013 es de Etapa 1, pero la mitad «sin secretos ni derechos» necesita campos secretos (Etapa 2) y la cola de derechos (Etapa 2). La Etapa 1 se cierra con CA-015g y CA-015i.',
    'CA-016b': 'Necesita registrar una entrega de equipo (Etapa 4).',
    'CA-038': 'RF-IMP-017 es una condición documental de la Etapa 0 (CA-105); la importación se prueba cuando existe (Etapa 4).',
    'CA-053': 'Existe como plan desde la Etapa 0 y se ejecuta en la Etapa 7. El ensayo de restauración previo a la Etapa 1 (CI-17) cubre una parte.',
    'CA-054c': 'La restauración de un respaldo es de la Etapa 7.',
    'CA-057': 'Portal de autoservicio (Fase 3).',
    'CA-073': 'La infraestructura del nombre canario es de la Etapa 0; el criterio corre cuando hay Personas de prueba (Etapa 1).',
    'CA-093': 'La tarea "Designar suplente" aparece en Primeros pasos (Etapa 1), pero depende del registro de derechos de datos (RF-PER-012, Etapa 2).',
    'CA-094a': 'RF-CAT-008 (prefijo reservado, Etapa 2) se podría probar antes con CA-017; el resto de CA-094a necesita ingreso manual e importación (Etapa 4).',
    'CA-099': 'RF-PLA-010 (subir el tope, Etapa 1) ya lo prueba CA-084 para invitaciones; el tope de importaciones necesita importar (Etapa 4).',
    'CA-NOT-01': 'El módulo lo fija en Etapa 5 porque necesita órdenes de compra; el envío base (RF-NOT-013) es de Etapa 1 y se prueba con CA-NOT-12 y CA-NOT-14.',
    'CA-NOT-07a': 'Igual que CA-NOT-01: necesita órdenes de compra.',
    'CA-NOT-20': 'Igual que CA-NOT-01: necesita órdenes de compra.',
    'CA-PRS-04': 'Necesita un equipo pendiente (Etapa 4); sin equipos lo cubre CA-052b1 en Etapa 2.',
    'CA-PRS-11': 'Importar Personas necesita el asistente de importación (Etapa 4); el alta manual con homónimo es CA-PRS-01d (Etapa 2).',
}
NOTAS_ANTES = {
    'CA-NOT-10': 'La tabla del módulo lo pone en Etapa 1 pero cubre requisitos de Fase 2 (rebotes y bandeja). El escuadrón C debe decir qué parte corre en Etapa 1.',
    'CA-NOT-13': 'Igual que CA-NOT-10: cubre requisitos de Fase 2 (campana de no leídas).',
}
