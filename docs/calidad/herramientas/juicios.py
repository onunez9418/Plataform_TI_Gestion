"""Juicios de QA que salen de LEER el texto de requisito y criterio (no los puede deducir un script).
Se revisan cada vez que cambia el documento funcional. Fecha de la lectura: 2026-10-26, commit c6bb296."""

# Requisitos cuyo criterio citado existe pero no los prueba de verdad.
# id -> (criterio citado, qué falta probar, cuándo debe estar cerrado según D-076, responsable de redactar)
NO_PRUEBA = {
    'RF-EMP-004': ('CA-071', 'Prueba que el calendario "lo usan los módulos que lo declaran", pero no da datos: ningún horario, feriado ni plazo con resultado esperado (por ejemplo "caso creado el viernes 17:00 con feriado el lunes vence el martes a tal hora"). En la v1 ningún módulo usa el calendario, así que solo se puede probar su configuración y su consulta.', 'Antes de la Etapa 1 (D-076.1b)', 'Analista; QA propone texto'),
    'RF-PLA-013': ('CA-015b', 'CA-015b prueba que la sesión es de solo lectura, de 24 horas, con banner y auditoría. No prueba lo que pide D-073 y RF-PLA-013: con la autorización vencida, de otra empresa o ya usada por otra persona, la lectura devuelve cero filas y cualquier escritura falla; que no ve columnas secretas ni la cola de derechos de datos; y que el rol de plataforma por sí solo no lee negocio. Es la "lectura de soporte" nueva.', 'Antes de la Etapa 1 (el requisito es de la Etapa 1; no estaba en la lista de D-076.1b)', 'Analista; QA propone texto (CA-015g)'),
    'RF-OC-026': ('CA-014, CA-070', 'CA-070 prueba la violación por la API, el vencimiento a los 90 días, la confirmación del segundo administrador y el resumen mensual. No prueba el mapa acto a casilla de D-066 (qué acto abre cada una de las 8 casillas) ni que activar una casilla exige motivo.', 'Antes de la Etapa 5 (D-076.3)', 'Analista; QA propone tabla acto-casilla'),
    'RF-INV-033': ('CA-024', 'CA-024 prueba estados y motivos; no prueba que cada cambio de estado, incluida la baja, emite un solo evento `inventario.activo_estado_cambiado` con el nuevo estado y la causa.', 'Antes de la Etapa 4', 'Analista'),
    'RF-INV-005': ('CA-038', 'CA-038 solo prueba la serie con notación científica (3,5E+14). Faltan la condición (b) (serie numérica más corta que la mínima de las existentes del SKU, con 10 o más) y la (c) con el campo identificador (la parte de definición la prueba CA-065a, la de unidades CA-065b).', 'Antes de la Etapa 4', 'Analista'),
    'RF-IMP-008': ('CA-038', 'No menciona el stock inicial como movimiento "saldo inicial" por ubicación.', 'Antes de la Etapa 4 (D-076.3)', 'Analista'),
    'RF-IMP-009': ('CA-038', 'No prueba que un texto de estado que no se asocia a los 5 estados es error de fila en la vista previa.', 'Antes de la Etapa 4 (D-076.3)', 'Analista'),
    'RF-IMP-010': ('CA-038', 'No prueba el formato de fecha (dd/mm/aaaa o número de serie de Excel; mes/día es error de fila) ni las otras dos condiciones de serie dañada.', 'Antes de la Etapa 4', 'Analista'),
    'RF-IMP-015': ('CA-039', 'CA-039 prueba 5.000 filas y 10 MB; no prueba el tope de 10 importaciones por día por empresa entre módulos ni el aumento temporal por la plataforma.', 'Antes de la Etapa 4 (D-076.3)', 'Analista'),
    'RF-IMP-016': ('CA-041', 'CA-041 lista la importación entre las acciones auditadas; no prueba que queda una sola entrada de lote más el detalle en su tabla (no 100.000 entradas).', 'Antes de la Etapa 4', 'Analista'),
    'RF-IMP-017': ('CA-038', 'Es una condición de proceso (el Excel real llega con los nombres reemplazados), no un comportamiento del sistema; CA-038 no la prueba. Se verifica con un registro documental, no con una prueba automática.', 'Etapa 0 (verificación documental)', 'Analista; QA verifica el archivo recibido'),
    'RF-OC-048': ('CA-055', 'CA-055 prueba el borde del límite. No prueba el informe mensual "sin respaldo de compra" ni el aviso informativo "posible compra fraccionada" (mismo proveedor, suma sobre el límite en 30 días).', 'Antes de la Etapa 5 (D-076.3)', 'Analista'),
    'RF-OC-049': ('CA-061', 'CA-061 prueba que el borrador no reserva y que otra persona lo retoma. No prueba el vencimiento a los 7 días (a los 7 días sigue vigente; a los 7 días y un segundo ya no).', 'Antes de la Etapa 5 (D-076.3)', 'Analista'),
    'RF-OC-051': ('CA-031', 'CA-031 no menciona el punto de extensión de la pantalla de aprobación (espacio reservado y justificación si un módulo activo la pide). En la v1 sin módulo activo debe verse vacío y no cambiar quién aprueba.', 'Antes de la Etapa 5', 'Analista'),
    'RF-ENT-002': ('CA-ENT-01', 'CA-ENT-01 no prueba el borrador automático (salir y volver sin perder lo capturado; no reserva equipos; el borrador sin efecto se puede borrar).', 'Antes de la Etapa 4 (D-076.3)', 'Analista (escuadrón D)'),
    'RF-ENT-016': ('CA-ENT-01', 'CA-ENT-01 no prueba renovar un préstamo (nueva fecha con motivo y auditoría).', 'Antes de la Etapa 4', 'Analista (escuadrón D)'),
    'RF-PRV-003': ('CA-PRV-04', 'CA-PRV-04 necesita un contrato Vigente (PRV-B, Fase 2). No prueba lo de la Etapa 2: desactivar y reactivar un proveedor con motivo y auditoría.', 'Antes de la Etapa 2', 'Analista (escuadrón A)'),
    'RF-GAR-003': ('CA-GAR-04', 'CA-GAR-04 prueba el estado calculado y la garantía efectiva; no prueba los filtros "vence en los próximos N días" ni "sin garantía vigente".', 'Antes de la Etapa 4', 'Analista (escuadrón A)'),
    'RF-GAR-006': ('CA-GAR-04', 'No prueba corregir fechas con motivo ni que una ampliación es una garantía nueva.', 'Antes de la Etapa 4', 'Analista (escuadrón A)'),
}

# Citas mal apuntadas o incompletas en el núcleo (el criterio existe, pero no es el que prueba el requisito).
CITA_MAL = {
    'RF-USR-006': ('CA-054c', 'Cita la restauración de un respaldo (Etapa 7). Lo que dice el requisito (la baja no borra el historial; anonimizar solo pasado el plazo y con confirmación de legal) lo prueban CA-045 y CA-054a.'),
    'RF-PER-010': ('CA-038', 'Cita la importación todo o nada. La alta manual con homónimos y aviso (Etapa 2) la prueba CA-016a y CA-PRS-01; la importación de Personas, CA-PRS-11.'),
    'RF-ACC-021': ('CA-074', 'Cita solo el contenido mínimo del correo. El aviso a quien aprueba y el aviso a quien creó los prueban CA-NOT-01 y CA-NOT-20, que ya citan este requisito; falta que este lo cite de vuelta.'),
    'RF-UX-008': ('CA-011b', 'CA-011b prueba la referencia y la columna omitida; el secreto enmascarado lo prueba CA-042. Falta citarlo.'),
    'RF-OC-027': ('CA-011a', 'Lo cubre la matriz de permisos de CA-011a (fila de proveedores, PS-37). Aceptable; no hace falta criterio propio.'),
    'RF-OC-041': ('CA-045', 'CA-045 nombra SKU, activo, orden, persona, usuario y valor de catálogo; no nombra la recepción. Basta agregar "recepción" al texto.'),
}

# Reglas RN con criterio citado en su columna que no las prueba del todo.
RN_PARCIAL = {
    'RN-009': 'CA-072 prueba el decimal exacto y CA-031 la orden en otra moneda; nada prueba "nunca hay un total general entre monedas" (por ejemplo un tablero o una lista con totales en USD y PEN).',
    'RN-018': 'CA-077 prueba procesos con dos empresas; no prueba que "Vencido" se calcula al leer (mover el reloj sin correr el proceso). Ese caso está en CA-GAR-04 y en CA-PRV-09 / CA-DOM-02 (Fase 2). Con la partición de CA-GAR-04 en Etapa 4, la v1 lo prueba.',
    'RN-021': 'CA-063 y CA-072 prueban el costo del activo en la v1 (el de la recepción). El libro único y `fuente_costo` son de Fase 3 (CA-PRE).',
    'RN-010': 'CA-012, 013 y 014 lo prueban; falta nombrar CA-079b (autoentrega sin excepción) en la columna.',
}

# Criterios del núcleo que QA lee como ambiguos (H-QA-31) y siguen sin datos o sin partir.
AMBIGUOS = [
    ('CA-006', 'Etapa 1', 'Pide "el mismo tiempo de respuesta" sin tolerancia. Propuesta de QA: diferencia menor a 100 ms en el percentil 95 sobre 200 intentos con correo existente y 200 con correo inexistente.'),
    ('CA-077', 'Etapa 1', 'Dice "reloj fijado" sin fechas ni datos. Propuesta de QA: reloj R0 2026-11-02 08:00; empresas A (Lima) y B (Ciudad de México) con un vencimiento a 7 días cada una; correr dos veces el mismo día (un solo aviso por empresa); adelantar 3 días sin correr (la corrida siguiente procesa los 3 días en orden); empresa D suspendida se salta.'),
    ('CA-038', 'Etapa 4', 'Junta ocho aserciones (vista previa, nada se guarda, no confirmar con errores, corregir, deshacer, serie dañada, y las de RF-IMP-008 y 009 que no menciona). D-076.3 pide partirlo. Propuesta de QA: 038a vista previa y todo o nada; 038b deshacer el lote; 038c series dañadas y formatos de fecha; 038d stock inicial y estados.'),
    ('CA-053', 'Etapa 7', 'Junta diez aserciones (respaldo, restauración con cronómetro, plan de vuelta atrás, manuales, rendimiento, procedimiento de incidente). Propuesta de QA: 053a respaldo y restauración; 053b vuelta atrás; 053c rendimiento (RNF-011); 053d manuales y procedimiento de incidente.'),
    ('CA-ENT-08', 'Etapa 4', '"falla la entrega de uno" no dice cómo provocar la falla. Propuesta: el segundo equipo ya está Asignado a otra Persona.'),
    ('CA-ENT-10', 'Etapa 4', '"cuando pasa el tiempo" no dice cuánto ni con qué reloj. Propuesta: reloj +30 días y +365 días desde el cese (reloj R5).'),
    ('CA-PRS-14', 'Etapa 2', 'Dice "cesada hace más de 2 años", pero la anonimización manual por derechos no exige plazo (RN-PRS-020); solo la automática lo exige. Separar el caso manual del automático.'),
    ('CA-PRS-16', 'Etapa 2', 'Cita RN-PRS-004 (referencia correlativa) cuando prueba el alcance "propio" sin Persona vinculada (regla del registro de permisos).'),
    ('CA-082', 'Etapa 1', 'La cabecera dice "(RF-ACC-018, RF-INV-008 en CA-082b)": parece cubrir RF-INV-008 (Etapa 4) en una etapa 1. Dejar solo RF-ACC-018.'),
    ('CA-024', 'Etapa 4', 'Cubre RF-OC-028 (Etapa 7) y corre en Etapa 4: o se saca RF-OC-028 de su cabecera o se parte.'),
]

# Criterios de módulos que, leídos, no corren en la etapa que sale de sus requisitos (se aplican antes de contar).
# id -> dict(etapa=..., completa=..., nota=...)
OVERRIDES_MODULOS = {
    'CA-PRS-01': dict(completa=4, nota='Empieza en Etapa 2; "puede recibir un equipo" necesita activos y se completa en Etapa 4.'),
    'CA-PRS-03': dict(etapa=4, nota='Pide una laptop asignada (Etapa 4); RF-PRS-011 es de Etapa 2. Propuesta al escuadrón D: partir en 03a (cese sin recursos, Etapa 2; lo cubre hoy CA-052a1 del núcleo) y 03b (con laptop, Etapa 4).'),
    'CA-PRS-08': dict(completa=4, nota='El movimiento por activo se prueba con 40 equipos (Etapa 4); el ciclo y la jerarquía, en Etapa 2.'),
    'CA-PRS-12': dict(completa=4, nota='La reactivación corre en Etapa 2; "asignarle un equipo se rechaza" necesita activos (Etapa 4).'),
    'CA-PRS-14': dict(completa=4, nota='La copia del nombre en las actas necesita actas (Etapa 4). Además mezcla anonimización manual y automática (ver ambiguos).'),
    'CA-PRV-04': dict(etapa=8, nota='Necesita un contrato Vigente (PRV-B, Fase 2); RF-PRV-003 es de Etapa 2. Propuesta al escuadrón A: 04a (Etapa 2) desactivar y reactivar un proveedor con motivo y auditoría; 04b (Fase 2) rechazo por contrato Vigente.'),
}

# Cuáles de los criterios que cruzan etapas en los módulos de la v1 ya traen una propuesta de partición de QA
PROPUESTA_PARTIR = {
    'CA-GAR-04': 'Partir: 04a (Etapa 4) garantía del fabricante Vigente y Vencida al mover el reloj, sin proceso (prueba también RN-018); 04b (Fase 2) garantía extendida y efectiva.',
    'CA-PRV-02': 'Partir: 02a (Etapa 2) un proveedor de B pedido por identificador interno responde "no encontrado"; 02b (Fase 2) lo mismo con el contrato.',
    'CA-GAR-01': 'Corre en Etapa 5 (recepción). La ficha de garantía de un activo importado (RF-GAR-002, Etapa 4) se prueba con CA-GAR-15 y CA-082b mientras tanto.',
    'CA-PRS-04': 'Corre en Etapa 4; el rechazo de anonimizar con pendientes de la Etapa 2 (sin equipos) lo cubre CA-052b1.',
}

# D-076: lo que se exige antes de cada etapa. (etapa, requisito/regla, criterio, qué dice la lectura de QA hoy, responsable)
D076 = [
    (1, 'RN (22 reglas)', 'Columna CA en la tabla de reglas', 'HECHO. Las 22 reglas citan al menos un criterio que existe. 8 de 22 además aparecen citadas por el propio criterio; las otras 14 solo en la columna (basta: D-076.1a dice "citando").', 'Analista (hecho); Auditor Técnico verifica con su guion'),
    (1, 'RF-ACC-006', 'CA-068', 'HECHO. Prueba los 15 minutos (a los 15:01 se rechaza), el uso único y el código de 8 caracteres en otro dispositivo.', 'Analista (hecho)'),
    (1, 'RF-ACC-014', 'CA-069', 'HECHO. Prueba aviso a los 25, vencimiento a los 30 minutos sin actividad y a las 12 horas.', 'Analista (hecho)'),
    (1, 'RF-ACC-020', 'CA-009', 'HECHO. Prueba el aviso de recomendar al menos dos administradores.', 'Analista (hecho)'),
    (1, 'RF-PLA-009', 'CA-015f', 'HECHO. Segunda persona o contacto confirmado, aviso a todos, un solo uso, 2F, un uso por semana. No prueba "verificar la identidad por otro medio" (es un procedimiento: queda como paso manual de la prueba).', 'Analista (hecho)'),
    (1, 'RF-PLA-010', 'CA-084', 'HECHO. El tope sube por un periodo y vuelve solo; queda en el registro.', 'Analista (hecho)'),
    (1, 'RF-PLA-011 y RF-PLA-012', 'CA-015e', 'HECHO. Confirmación del contacto, espera de 24 horas con aviso, veto durante el rescate.', 'Analista (hecho)'),
    (1, 'RF-EMP-004', 'CA-071', 'PENDIENTE. CA-071 nombra el calendario pero no da datos ni resultado esperado.', 'Analista redacta; QA propone texto'),
    (1, 'RF-ROL-015', 'CA-077', 'HECHO en el texto (prueba de dependencias). CA-077 sigue ambiguo en fechas (ver ambiguos).', 'Analista; QA propone fechas'),
    (1, 'CA-070 (segundo administrador y resumen mensual)', 'CA-070', 'HECHO en el texto. Corre en Etapa 5 según 22.1.', 'Analista (hecho)'),
    (1, 'RN-008', 'CA-085', 'HECHO. Recorre las acciones con motivo, incluye el tope de 500 caracteres.', 'Analista (hecho)'),
    (1, 'RF-PLA-013 (lectura de soporte)', 'ninguno todavía', 'NUEVO HUECO. D-073 y D-039.10 piden una prueba con la autorización vencida o ajena; ningún criterio la contiene. No estaba en la lista de D-076.1b.', 'Analista redacta; QA propone texto CA-015g'),
    (1, 'CA-006 y CA-077', 'CA-006, CA-077', 'AMBIGUOS en Etapa 1. D-076.3 los difiere a las Etapas 4 a 6, pero corren en Etapa 1: hay que cerrarlos antes de la Etapa 1.', 'Analista; QA propone texto'),
    (2, 'RN-015', 'CA-086', 'HECHO (ya redactado).', 'Analista (hecho)'),
    (2, 'RN-016', 'CA-087', 'HECHO (ya redactado).', 'Analista (hecho)'),
    (2, 'RF-CAT-026', 'CA-092', 'HECHO (ya redactado): 2 años, exportación general sin contactos, permiso para verlos.', 'Analista (hecho)'),
    (2, 'RF-PRV-003 y CA-PRV-04', 'CA-PRV-04', 'PENDIENTE. Necesita un contrato Vigente (Fase 2).', 'Analista (escuadrón A)'),
    (4, 'RF-IMP-008, 009 y 015; RF-INV-005; RF-IMP-010 y 016', 'CA-038, CA-039, CA-041', 'PENDIENTE (D-076.3). Sin criterio que los pruebe.', 'Analista; QA propone texto'),
    (4, 'RF-ENT-002 y RF-ENT-016', 'CA-ENT-01', 'PENDIENTE (D-076.3).', 'Analista (escuadrón D)'),
    (4, 'Partir CA-038', 'CA-038', 'PENDIENTE (D-076.3). Propuesta de QA en "ambiguos".', 'Analista'),
    (4, 'RF-INV-033', 'CA-024', 'PENDIENTE. No lo pidió D-076 expresamente; lo agrego por la regla general.', 'Analista'),
    (5, 'RF-OC-048, 049 y 050', 'CA-055, CA-061', 'PENDIENTE (D-076.3). 050 queda probado; 048 y 049 no.', 'Analista'),
    (5, 'RF-OC-026 (mapa acto-casilla), RF-OC-051', 'CA-070, CA-031', 'PENDIENTE. No lo pidió D-076 expresamente.', 'Analista; QA propone tabla'),
    (7, 'Partir CA-053', 'CA-053', 'PENDIENTE (D-076.3 lo agrupa con CA-038 y CA-054).', 'Analista'),
]

# Razón con que QA explica por qué un criterio del núcleo arranca después de la etapa de su requisito (lectura de QA)
NOTAS_TARDE = {
    'CA-012': 'Necesita órdenes de compra (Etapa 5). Hasta entonces "quien crea no aprueba" solo se prueba por la matriz (CA-011a) y CA-010.',
    'CA-016b': 'Necesita registrar una entrega de equipo (Etapa 4).',
    'CA-038': 'RF-IMP-017 es una condición documental de la Etapa 0; la importación se prueba cuando existe (Etapa 4).',
    'CA-053': 'Existe como plan desde la Etapa 0 y se ejecuta en la Etapa 7. El ensayo de restauración previo a la Etapa 1 (CI-17) cubre una parte.',
    'CA-054c': 'RF-USR-006 está mal citado (ver trazabilidad); la restauración de un respaldo es de la Etapa 7.',
    'CA-057': 'Portal de autoservicio (Fase 3).',
    'CA-073': 'La infraestructura del nombre canario es de la Etapa 0; el criterio corre cuando hay Personas de prueba (Etapa 1).',
    'CA-093': 'La tarea "Designar suplente" aparece en Primeros pasos (Etapa 1), pero depende del registro de derechos de datos (RF-PER-012, Etapa 2).',
    'CA-NOT-01': 'El módulo lo fija en Etapa 5 porque necesita órdenes de compra; el envío base (RF-NOT-013) es de Etapa 1 y se prueba con CA-NOT-12 y CA-NOT-14.',
    'CA-NOT-07a': 'Igual que CA-NOT-01: necesita órdenes de compra.',
    'CA-NOT-20': 'Igual que CA-NOT-01: necesita órdenes de compra.',
}
NOTAS_ANTES = {
    'CA-NOT-10': 'La tabla del módulo lo pone en Etapa 1 pero cubre requisitos de Fase 2 (rebotes y bandeja). El escuadrón C debe decir qué parte corre en Etapa 1.',
    'CA-NOT-13': 'Igual que CA-NOT-10: cubre requisitos de Fase 2 (campana de no leídas).',
}
