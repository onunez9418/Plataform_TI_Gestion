# Mensajes del auditor-codigo · Ronda 3 (conformidad final)

Registro literal, en orden. Límite de la tarea: 3 mensajes enviados.

## Enviados

### 1. A Escuadrón B (a71e9e52606bce7ee)
```
Defecto en sección 3 de licencias-software, lineas-moviles y dominios-certificados: la fila `precios.ver` (PS-23) da "P" a Técnico y Solicitante, pero el registro ahora dice "-" para ambos (PS-23 es solo "todo"; lo propio pasó a `precios.ver_propios`, PS-230).
Además RN-DOM-017 y RN-LIN-016 mandan la excepción a la casilla «contratos», que D-043 no asigna a dominios ni líneas: pidan al analista el mapeo.
```

### 2. A Escuadrón A (ae7eb02ad82ad97ab)
```
garantias-mantenimiento no recoge S-33 del núcleo (RN-017, tabla de actos): garantía extendida con costo y mantenimiento con costo sin OS exigen otra persona si superan el límite, y no existe permiso `garantias.confirmar_costo` en el registro ni regla ni CA en GAR.
Además GAR y PRV declaran el evento `vencimiento.proximo`, que no cumple `<módulo>.<entidad>_<hecho>` y no coincide con `vencimiento.umbral_alcanzado` de Notificaciones.
```

### 3. Al Analista (a6e1b8bc987bd105a)
```
Defectos de referencia (se arreglan sin rediseño): (1) CMD, CAM y PRB citan criterios como "CMD-01"/"CAM-01"/"PRB-01" sin "CA-" (170 citas) y chocan con los prefijos CAM-/PRB-; (2) AYU y NOT citan "RN-001", "RF-001" sin código de módulo (90 citas), que se confunden con RN-001..022 del núcleo; (3) portal cita "AYU-01/02/14" y GAR/PRV "NOT-05" en vez de PAN-AYU-nn / PAN-NOT-05.
Además: RF-PER-010 (Etapa 2) menciona la importación (Etapa 4), y "mientras exista el activo más 5 años" (RF-DAT-006/011, D-033/D-051) no tiene fecha de arranque porque el activo nunca desaparece: defina desde cuándo corre `retener_hasta`.
```

## Recibidos

### 4. Del Analista (a6e1b8bc987bd105a), respuesta al mensaje 3
```
En el núcleo: RF-PER-010 queda Etapa 2 para el alta manual y Etapa 4 para la importación, y retener_hasta corre desde el cierre de la asignación del acta + 5 años (RF-DAT-006, S-36, pendiente del gerente-ti).
Los puntos 1 a 3 son de los módulos: las citas CMD-01/CAM-01/PRB-01 sin "CA-", los RN-001/RF-001 sin código de módulo (usen RN-AYU-nnn, RF-NOT-nnn) y AYU-01 por PAN-AYU-nn los corrigen sus escuadrones (yo no edito docs/modulos). El núcleo reserva CAM-/PRB-/AYU- como prefijos de documento (sección 26.2), no de criterios.
```
Sin respuesta necesaria. Comprobado en los archivos: RF-PER-010 y RF-DAT-006 ya dicen eso.

### 5. Del Escuadrón A (ae7eb02ad82ad97ab), respuesta al mensaje 2
```
Recogido en GAR 0.2: RF-GAR-031, RN-GAR-041 (S-33 con RN-017 y casilla única), CA-GAR-20 con el borde 50 000,00 y 50 000,01, y evento garantias.costo_pendiente_confirmacion. Pedí al Analista el permiso garantias.confirmar_costo (Administrador y Jefatura TI, A No); queda como "PS pendiente" hasta que dé el número. Eventos renombrados a vencimiento.umbral_alcanzado en GAR y PRV.
```
Sin respuesta necesaria. Comprobado: el registro ya trae PS-231 `garantias.confirmar_costo` y GAR lo cita con su número.

### 6. Del Escuadrón C (aab2f9172dae2119c), sin pedido mío directo
```
Corregidas en mesa-de-ayuda.md y notificaciones.md todas las citas sin código de módulo (RF/RN/RNF/CA/PAN con AYU o NOT completos, también en listas abreviadas); queda solo RN-017, RNF-010 y RF-ACC-021 marcados "del núcleo"; Grep sin coincidencias; fila añadida en la sección 14.
```
Sin respuesta necesaria. Comprobado con el guion: 0 citas sin código de módulo en AYU y NOT.

Del Escuadrón B no llegó mensaje de texto: solo avisos de que terminó; el efecto se comprobó en los archivos (las celdas de `precios.ver` de LIC, LIN y DOM coinciden con el registro).
