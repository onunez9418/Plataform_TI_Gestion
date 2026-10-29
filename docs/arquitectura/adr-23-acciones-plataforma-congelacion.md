# ADR-23 · Acciones de plataforma con segunda persona dentro de la base, y congelación por incidente

**Estado:** Propuesto (nuevo, 2026-10-29) · **Decide:** Gerente de TI (firma Seguridad; revisa Cumplimiento) · **Base:** D-048.5, D-065 S-34, D-073, D-080(b), RF-PLA-001 a 013, RF-DAT-017, `procedimiento-incidente-datos.md` v0.3 (secciones 3, 4, 6, Anexo A y C.5.2); H-SEG-33, 34, 38, 62; D04-3, D12-2

## Contexto
Las acciones de plataforma (PS-01 a PS-06) y la pausa de lo irreversible durante un incidente tenían tres huecos que atravesaban ADR-03, 04, 11 y 12: (1) el control de dos personas del rescate y del acceso de emergencia estaba descrito para la pantalla, no para la base; (2) la lista de funciones no cubría lo que el procedimiento de incidentes pide (revocar sesiones de una persona, una empresa o todas; suspender claves de API; aprobar purgas); (3) D-080(b) confirmó la **congelación** de la anonimización y de la purga, pero ningún ADR la implementaba. Como el mecanismo es común y no cabe en un solo ADR existente, vive aquí.

## Opciones
1. **Control dual en la pantalla y en el servicio.** Descartada: un servicio comprometido o una persona con SQL se lo salta; Seguridad pidió que viva dentro de la función (H-SEG-38).
2. **Dos roles de base, uno por persona.** Descartada: cuentas de base por persona, sin hecho que lo justifique y con credenciales por humano.
3. **Funciones DEFINER que reciben la credencial de la sesión de plataforma, comprueban dentro de la base a las dos personas y escriben el registro, más una tabla de estado.** Elegida.

## Decisión

### Regla común de toda función de plataforma
1. Recibe la **huella de la sesión de plataforma** (ADR-08), nunca un identificador de persona. Deduce la persona de `sesion` + `administrador_plataforma`.
2. Exige `sesion.tipo = 'plataforma'`, vigente, y `verificada_en` de los últimos 10 minutos con `verificada_con = 'llave'` (llave física, ADR-08). El mismo rechazo vale para `soporte_usar`.
3. Comprueba **dentro de la base** lo que su acción exige (dos personas, contacto confirmado, espera, veto, un uso por semana).
4. Escribe en `registro_plataforma` (solo agregar) **en la misma transacción**, y encola dentro de ella los correos que correspondan (ADR-02, criterio de encolar y revertir juntos).
5. Todo rechazo escribe un evento de seguridad.
6. La consola nunca recibe la llave maestra (ADR-01): las funciones no necesitan cifrar nada. Cuando una acción debe entregar un valor de entrada por correo (invitación al primer administrador, acceso de emergencia), la función solo crea la fila en estado `por_emitir`; **el valor nace en el trabajador al enviar** (ADR-08, H-SEG-46).

### Tablas
- `registro_plataforma(id, persona_plataforma_id, accion, empresa_id nullable, detalle, creado_en)`: `INSERT` y `SELECT`; disparador contra UPDATE, DELETE y TRUNCATE; sin escritura directa de ningún rol.
- `accion_plataforma(id, tipo, empresa_id, solicitada_por, solicitada_en, estado, aprobada_por, aprobada_en, contacto_confirmado_en, espera_hasta, vetada_por_membresia_id, vetada_en, ejecutada_en, vence_en)`. `tipo` ∈ `rescate`, `acceso_emergencia`, `purga`, `congelacion`, `levantar_congelacion`. `CHECK (aprobada_por IS NULL OR aprobada_por <> solicitada_por)`. Los estados avanzan con actualización condicional (patrón 2 de ADR-15) dentro de las funciones.
- `purga_acta` (existente): `INSERT` y `SELECT`, mismo disparador; los aprobadores se registran **por la función** `purga_acta_aprobar`, que identifica a la persona desde su sesión; dos filas de aprobador distintas para una misma acta.
- `congelacion_incidente(id, alcance, empresa_id nullable, persona_id nullable, motivo, declarada_por, confirmada_por, desde, hasta nullable)`: `alcance` ∈ `plataforma`, `empresa`, `persona`; `CHECK` coherente con las columnas. Vigente = `desde <= ahora AND hasta IS NULL`.

### Rescate (PS-02, RF-PLA-003 y 012)
`rescate_solicitar` (persona A) → `rescate_aprobar` (persona B distinta de A, **o** el contacto autorizado ya confirmado por el primer administrador, RF-PLA-011, mediante un valor de un solo uso que nace en el trabajador) → espera de 24 horas en `espera_hasta` (salvo emergencia declarada por **ambas** personas) → correo a todos los usuarios activos y administradores → `rescate_ejecutar`, que vuelve a comprobar que pasó la espera, que no hay veto y que sigue sin administrador. **Veto:** cualquier administrador activo de la empresa lo ejecuta con `rescate_vetar` (la ejecuta `app_empresa` con la credencial de su sesión; la función deduce la membresía y comprueba que es administrador activo); el rescate pasa a `vetado` y queda en el registro de plataforma.

### Acceso de emergencia (PS-05, RF-PLA-009)
`acceso_emergencia_solicitar` → `acceso_emergencia_aprobar` (segunda persona de plataforma **o** contacto autorizado confirmado) → `acceso_emergencia_emitir`: crea la fila `por_emitir`, avisa a **todos** los administradores y respeta **un uso por empresa y por semana** (la función bloquea la fila de la empresa y cuenta las emisiones de los últimos 7 días). El trabajador crea el valor, lo manda al administrador y fija su huella; vale una vez, 15 minutos, y la segunda verificación se sigue exigiendo.

### Resto de PS-01 a PS-06
- PS-01 `empresa_crear/suspender/reactivar`: una persona con llave física y verificación reciente; registro obligatorio; crear exige contacto autorizado.
- PS-04 `limite_plataforma_ajustar`: una persona; el aumento lleva `vence_en` y vuelve solo (CA-084); registro.
- PS-240 `asistente_interruptor_cambiar` y `asistente_texto_libre_levantar` (ADR-22, D-086.4): una persona con llave física y verificación reciente. La primera escribe el interruptor general y el tope global en `limite_plataforma`; la segunda escribe la casilla de esa empresa fijando su contexto dentro de la función; las dos dejan registro.
- PS-06 `correo_global_cambiar` (estado global del correo y del proveedor de envío): una persona; registro.
- Incidente (procedimiento, Anexo A): `sesiones_revocar_alcance(alcance)` — una persona, una empresa o todas — y los enlaces vivos; `clave_api_suspender`; `suspension_reaplicar` (reaplica suspensiones tras una restauración). Cada una exige las condiciones de la regla común y deja registro.

### Purga con constancia fuera de la base (D04-3)
La purga la ejecuta una tarea programada con el rol `mantenimiento` (ADR-01), no la aplicación. Orden: (1) dos aprobaciones en `purga_acta`; (2) la tarea escribe la **intención** en el almacén externo de solo agregar (el mismo de ADR-12) y llama `purga_acta_marcar_intencion`; (3) `purgar_particion_auditoria` (ADR-11) **rechaza si falta la marca**, si la verificación de la copia externa de ese mes no está «completa», si hay congelación vigente o si el interruptor legal está apagado; (4) la tarea escribe la **confirmación** externa. Al restaurar un respaldo, el procedimiento reaplica las purgas con constancia, porque las particiones purgadas reaparecen con el respaldo y su constancia en la base retrocedió.

### Congelación por incidente (D-080(b), RF-DAT-017, H-SEG-62)
- Se **declara** con `congelacion_declarar` (persona A) y se **confirma** con `congelacion_confirmar` (persona B distinta, o el contacto autorizado confirmado cuando solo hay una persona de plataforma). Levantarla exige igualmente dos. Alcance: toda la plataforma, una empresa, o ciertas Personas de una empresa. Todo queda en `registro_plataforma`. Quién ejerce cada papel del procedimiento (Líder del incidente, Gerente de TI) es parte del procedimiento; en la base el requisito es **dos personas de plataforma distintas**. Si esos papeles no son cuentas de plataforma, Seguridad y Cumplimiento lo señalan al revisar el procedimiento.
- Qué hace: `congelacion_activa(empresa_id, persona_id)` es consultada **dentro de la base** por `anonimizar`, por `purgar_particion_auditoria`, por `purgar_particion_evento_seguridad` y por cada trabajo de borrado por plazo de datos de negocio. Una lista cerrada en código (`BORRADO_POR_PLAZO`) enumera esos trabajos y una prueba verifica que cada uno consulta la congelación; quedan fuera, por declaración revisada por Seguridad, los de vida técnica (ventanas del limitador, claves de idempotencia, sesiones vencidas), que no son evidencia.
- La anonimización rechazada queda **pendiente** (la intención ya escrita en el almacén externo no se pierde, ADR-12) y se retoma al levantar la congelación; es idempotente.
- **Las particiones de auditoría mezclan empresas.** Una purga no puede "omitir a una empresa" (como dice RF-AUD-016): con **cualquier** congelación vigente, de cualquier alcance, **se pospone la purga de las particiones** hasta levantarla. Es lo conservador: retirar tarde un mes no daña a nadie; retirarlo durante una investigación destruye evidencia. Requiere que el Analista ajuste la redacción de RF-AUD-016.

## Consecuencias
- Cuatro tablas globales de plataforma (`registro_plataforma`, `purga_acta`, `accion_plataforma`, `congelacion_incidente`) con funciones y disparadores propios: más SQL y más pruebas, a cambio de que el control dual no dependa de la pantalla.
- Con una sola persona de plataforma y datos reales, el rescate, la emergencia y la congelación no pueden completarse sin el contacto autorizado: es el comportamiento deseado (RF-PLA-001 exige dos antes de datos reales).
- Una congelación demasiado amplia retrasa purgas de otras empresas; se acepta y se revisa en el procedimiento.

## Qué prueba lo valida
- Cada función rechaza sin credencial, con una sesión de empresa, con sesión vencida, sin verificación con llave en 10 minutos y con el mismo solicitante y aprobador (CHECK y función).
- Rescate: espera de 24 horas con reloj fijado; veto detiene; emergencia declarada por una sola persona no acorta la espera. Emergencia: segundo uso en la misma semana rechazado; sin segunda persona ni contacto, rechazado.
- `app_plataforma` y los demás roles no pueden escribir directamente en las cuatro tablas (H2/H11); el disparador impide UPDATE/DELETE/TRUNCATE en `registro_plataforma` y `purga_acta`.
- Con la congelación vigente, `anonimizar` y ambas purgas **rechazan**; levantada, se retoman; la prueba `BORRADO_POR_PLAZO` falla si un trabajo no la consulta.
- La purga rechaza sin marca de intención externa y sin dos aprobadores distintos; reaplicar purgas tras restaurar.

## Qué cambió tras la revisión
Este ADR es nuevo y nace de: H-SEG-33 (aprobadores como personas autenticadas, registros solo agregar), H-SEG-34 (credencial, no identificador), H-SEG-38 (funciones que faltaban y control dual dentro de la base), H-SEG-62 y D12-2 (congelación), D04-3 (constancia externa de purgas). Decisión propia del Arquitecto: la congelación pospone **toda** purga de particiones mientras haya una vigente, porque una partición mezcla empresas (hecho de ADR-11); contradice la frase "omite a las empresas con congelación" de RF-AUD-016, que debe ajustar el Analista.
