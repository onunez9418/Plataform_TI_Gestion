# Procedimiento ante una fuga de datos o un acceso indebido

**Versión:** 0.1 (borrador) · **Fecha:** 2026-10-25
**Redacta:** Especialista en Seguridad · **Co-redacta:** Auditor de Cumplimiento (secciones 6, 7 y anexo C: pendientes de su revisión) · **Aprueba:** Gerente de TI
**Base:** D-059 (roles, gravedad y plazos), D-048 (llaves y control dual de la plataforma), D-052 (restauración y copia externa de la auditoría), D-054 (eventos de seguridad), D-032 (respaldos), `docs/operaciones/plan-entornos-y-costos.md` sección 8.2 (lo que prepara DevOps).
**Estado:** borrador. **No se puede cargar ningún dato real de una empresa hasta que este procedimiento esté aprobado, ensayado una vez y validado por un abogado en lo legal** (D-064 condición 13; Etapa 7).

> **Para el CEO, en una frase:** si alguna vez los datos de una empresa llegan a alguien que no debía verlos, o alguien entra donde no debía, este documento dice quién decide, qué se hace en la primera hora, cuándo se le avisa a usted, a quién más hay que avisar y cómo se aprende para que no se repita. Lo legal (qué ley, a quién y en cuánto tiempo hay que avisar) **lo tiene que confirmar un abogado**; está marcado así en el texto.

---

## 1. Qué es un incidente y cómo se clasifica

**Incidente de datos:** cualquier hecho en el que datos de una empresa (activos, compras, personas, correos), claves o secretos pudieron ser vistos, copiados, cambiados o borrados por quien no tenía permiso, o en el que el control del sistema se pudo perder.

Ejemplos: una empresa ve datos de otra; una cuenta de administrador se usa por otra persona; una llave o una clave de API aparece en un lugar público; un respaldo o una exportación llega a quien no debía; el registro de auditoría muestra una alteración; el proveedor de alojamiento o de correo avisa de una brecha.

| Gravedad | Cuándo | Qué se espera |
|---|---|---|
| **G1** | Acceso o fuga **confirmada** de datos de una o más empresas, de claves o de secretos | Contener en 1 hora; avisar al CEO en 24 horas; todo el procedimiento |
| **G2** | **Sospecha seria**, alerta de integridad de la auditoría, o una cuenta de plataforma o de administrador sospechosa | Contener lo que se pueda de inmediato; confirmar o descartar en 24 horas; si se confirma, pasa a G1 |
| **G3** | Hecho menor **sin datos expuestos** (un intento rechazado que funcionó como debía, un escaneo, un error sin datos) | Se anota, se corrige y se revisa en la reunión de seguridad |

**Regla de oro:** ante la duda, se declara como G2 y se baja después. Declarar de más no cuesta nada; declarar tarde puede costar mucho.

## 2. Quién hace qué

| Papel | Quién | Qué decide o hace |
|---|---|---|
| **Líder del incidente** | Especialista en Seguridad (si no está, DevOps) | Dirige, clasifica la gravedad, lleva el registro y decide el orden de las acciones |
| **Decide la contención y los accesos** | Gerente de TI | Autoriza suspender una empresa, una integración o una cuenta, y rotar claves |
| **Ejecuta la contención técnica** | DevOps (con el Arquitecto para lo que son funciones de la plataforma) | Revoca sesiones, rota claves, suspende, preserva evidencia |
| **Evalúa si hay obligación de avisar** | Auditor de Cumplimiento, con el abogado | Qué se debe avisar, a quién y en cuánto tiempo |
| **Habla con el CEO y con las empresas afectadas** | Jefatura de Proyecto | Comunica en lenguaje claro, con el texto preparado por Cumplimiento |
| **Responsable de guardia** | **Una persona real con nombre y su suplente**, nombradas por escrito antes de producción (D-059.1, D-064 condición 9) | Recibe las alertas fuera del horario de la sesión de trabajo |

> **Pendiente real:** hoy el equipo de TI de esta plataforma trabaja en sesiones; no hay nadie de guardia. Sin una persona de guardia nombrada no se puede cumplir la hora de contención. Es condición para producción. **[ESCALAR AL CEO]** nombrar a la persona y su suplente (es una decisión suya, no del equipo).

Reglas del equipo de respuesta:
- Quien tiene un conflicto (por ejemplo, el incidente nació de su propio cambio) lo declara y no decide sobre ese punto.
- Nadie borra nada para "limpiar". Se preserva primero.
- Las comunicaciones del incidente van por el canal que el Gerente de TI fije, nunca por el mismo sistema que pudo comprometerse.

## 3. Detectar y declarar

**Cómo se entera el equipo:**
- Alertas del monitoreo (plan de DevOps, sección 8.1): accesos fallidos en cantidad, una exportación inusual (más de 5 por hora por usuario), un cambio en el monto límite, una sesión de soporte fuera de lo autorizado, la verificación semanal de la copia de auditoría que no coincide, un respaldo que no llegó.
- Un usuario o un administrador que ve algo raro (datos que no son de su empresa, un correo de acceso que no pidió).
- El proveedor de alojamiento, de correo o de base de datos.
- Un tercero que avisa (un investigador de seguridad, un cliente).

**Cualquier persona puede declarar un incidente.** Se hace diciéndolo a la Jefatura de Proyecto o al Líder del incidente. No se pide permiso ni se espera a estar seguro.

**Al declarar, se abre un registro** en `docs/operaciones/incidentes/` (ver sección 8) con: hora exacta, quién lo vio, qué se vio y gravedad provisional. **Ese registro no lleva datos personales ni secretos**: se escribe "un usuario de la empresa B vio una lista de la empresa A", no los nombres ni los valores.

## 4. Contener (la primera hora)

Objetivo: **detener el daño en 1 hora desde la confirmación (o desde la sospecha seria en G2)**, sin destruir evidencia.

El Líder del incidente elige, con el Gerente de TI, entre estas acciones (Anexo A tiene el detalle operativo). Se aplican las mínimas necesarias, de la menos a la más drástica:

1. **Revocar sesiones y enlaces:** de una persona, de una empresa o de todas.
2. **Suspender** una integración (clave de API) o un webhook.
3. **Suspender una membresía** o una cuenta de plataforma sospechosa.
4. **Rotar claves:** de API, del correo, de la base, y, si hay sospecha sobre ellas, las llaves de cifrado (esto es lo más costoso; ver el Anexo A y la aprobación de la estrategia de llaves).
5. **Suspender una empresa** (RF-ACC-022): nadie entra; los datos se conservan.
6. **Aislar la causa:** retirar una versión recién publicada (plan de vuelta atrás), cerrar una ruta, apagar una función.
7. **Cerrar el sistema** como último recurso (aviso de mantenimiento, RNF-012).

Reglas:
- **No se borra nada.** No se limpian registros, no se reinicia el servidor sin copiar antes los registros técnicos, no se borran cuentas.
- **Preservar evidencia antes de cambiar:** la auditoría y su copia externa (RF-AUD-018), el registro de eventos de seguridad, los registros técnicos (propuesta: 90 días, sin datos personales ni secretos), el reporte de errores, y una copia de la configuración. Si se sospecha de la cuenta de plataforma, también el registro de plataforma.
- **No se avisa al sospechoso** antes de contener.
- Cada acción queda en el registro del incidente con hora y quién la hizo.

## 5. Evaluar el alcance (primeras 24 horas)

El Líder del incidente, con DevOps y el Arquitecto, responde por escrito:

1. **¿Qué pasó y desde cuándo?** (primera hora estimada del hecho)
2. **¿Qué empresas?** Una, varias o todas. La separación por empresa y los registros por empresa permiten saberlo; si no se puede saber, se asume el peor caso hasta probar lo contrario.
3. **¿Qué datos?** Tipos (activos, compras y precios, personas, correos, claves de licencia, secretos del sistema) y **cuántas personas** hay entre ellos.
4. **¿Quién pudo verlos?** Una persona de otra empresa, un atacante externo, un empleado, un proveedor.
5. **¿Siguen expuestos?** ¿La contención funcionó? ¿Hay otras puertas abiertas?
6. **¿Los datos se podrían usar para dañar?** (claves de licencia, enlaces de acceso, semillas de la segunda verificación: si se tocaron las llaves de cifrado, se asume que todo lo cifrado quedó expuesto).
7. **¿Qué sabemos y qué no sabemos todavía?** Se escribe tal cual.

Con esto se confirma la gravedad (un G2 pasa a G1 o se baja a G3) y se pasa a la sección 6.

## 6. Avisar

### 6.1 Al CEO (siempre en G1)

- **Dentro de las 24 horas desde la confirmación** (plazo interno propuesto, D-059.3).
- Lo hace la Jefatura de Proyecto, **en lenguaje claro**: qué pasó, qué empresas, qué datos, qué ya se contuvo, qué falta, qué se necesita de usted. Sin jerga y sin ocultar nada, aunque todavía falten datos ("esto sabemos, esto no sabemos").
- Si es G2, se le avisa cuando se confirme o a más tardar a las 48 horas si sigue sin descartarse.

### 6.2 A la empresa afectada y a las personas afectadas

- **Plazo propuesto: 72 horas desde la confirmación**, salvo que el abogado fije uno menor (D-059.4). **[ESCALAR AL CEO] (legal, L-16):** qué ley aplica según el país de cada empresa, **si hay que avisar a la autoridad de protección de datos**, a quién exactamente (empresa, personas, autoridad), con qué contenido mínimo y en cuánto tiempo. **Lo confirma un abogado; el equipo no da opinión legal.** Es condición para cargar datos reales.
- **A quién avisa el equipo:** a la empresa afectada (a sus administradores y al contacto autorizado, RF-PLA-011). **Quién avisa a las personas** (los empleados cuyos datos se vieron) lo fija el contrato con cada empresa: lo normal es que la empresa, como responsable de sus empleados, lo decida con nuestro apoyo y el texto preparado. **[ESCALAR AL CEO] (legal, L-02):** quién es responsable de qué entre la empresa, la plataforma y el proveedor de alojamiento.
- **Contenido del aviso** (plantilla que prepara Cumplimiento y aprueba el abogado): qué ocurrió, cuándo, qué datos, qué ya se hizo, qué puede hacer la persona para protegerse, a quién contactar. No incluye datos personales de otros ni detalles técnicos que ayuden a repetir el ataque.
- **Si el incidente afecta solo a una empresa**, no se avisa a las demás; **si pudo afectar a varias**, se avisa a cada una solo de lo suyo (RF-ACC-011: una empresa nunca ve a qué otras pertenece alguien, y tampoco se le cuenta qué datos de otra se vieron).

### 6.3 Al proveedor y a otros

- Si la causa está en el proveedor de alojamiento, de base de datos o de correo, se les avisa de inmediato y se les pide su informe. **Los contratos con proveedores técnicos deben obligarlos a avisarnos de un incidente de su lado** (D-059.5, L-08). **[ESCALAR AL CEO] (legal)** revisar esas cláusulas antes de firmar.
- Si hay delito evidente (robo, intrusión), el CEO decide con el abogado si se denuncia. **[ESCALAR AL CEO] (legal)**.

## 7. Resolver, restaurar y cerrar

1. **Eliminar la causa** (corregir el error, cerrar la puerta, retirar al usuario) y **probar** que quedó cerrada, con una prueba automática nueva si es posible.
2. **Si hay que restaurar un respaldo**, se sigue D-052.4 **antes de abrir el sistema**: reaplicar el registro de anonimizaciones, revocar todas las sesiones y enlaces, rotar las claves de API y reaplicar suspensiones, bajas y cambios de rol posteriores al respaldo (se reconstruyen desde la auditoría, que vive aparte). Se prueba el aislamiento sobre la base restaurada.
3. **Rotar lo que estuvo expuesto**, aunque no se pueda probar que se usó.
4. **Volver a abrir** solo con el visto bueno del Gerente de TI y del Líder del incidente.
5. **Informe en 10 días** (sección 9).
6. **Cerrar el incidente** cuando: la causa está corregida y probada, los avisos legales se cumplieron o se descartaron con razón escrita, y el informe está aprobado.

## 8. Registro del incidente

Cada incidente tiene un archivo `docs/operaciones/incidentes/AAAA-MM-DD-nn.md` creado desde la plantilla del Anexo B.

- **Nunca lleva datos personales reales, claves, valores de secretos ni nombres de personas afectadas.** Usa referencias (`PRS-0042`, "empresa B", "usuario de plataforma 1"). Si hace falta guardar detalle sensible como evidencia, se guarda **fuera del repositorio**, en el lugar controlado que DevOps y Seguridad definan (D-028), y el registro solo dice dónde.
- Contiene: línea de tiempo con horas exactas, decisiones y quién las tomó, acciones de contención, alcance, avisos hechos (a quién, cuándo, con qué texto), causa raíz, acciones correctivas con responsable y fecha, y riesgos actualizados.
- Se conserva **5 años** como la auditoría (propuesta provisoria; **[ESCALAR AL CEO] (legal)** confirmar el plazo, L-04).
- Los incidentes G3 pueden agruparse en una línea de una tabla mensual.

## 9. Lecciones aprendidas y ensayo

**Informe en 10 días** desde el cierre de la contención, **sin buscar culpables**: qué falló en el sistema, en el proceso o en la prueba; qué habría detectado antes; qué cambia. Debe terminar con: acciones con responsable y fecha, pruebas nuevas, y los riesgos de `docs/equipo/riesgos.md` actualizados. El Gerente de TI lo revisa; el CEO recibe un resumen de una página.

**Ensayo:**
- **Antes de cargar datos reales:** un simulacro completo con cronómetro, con datos inventados: se declara un incidente supuesto (por ejemplo, "una clave de API apareció en un repositorio público" y "un administrador de plataforma perdió su llave física"), se contiene en menos de 1 hora, se redacta el aviso al CEO y se comprueba que se puede restaurar sin revivir accesos revocados. Se registra el tiempo de cada paso.
- **Después, una vez al año** y cada vez que cambie algo grande (proveedor, persona de guardia, arquitectura).
- Se revisa el procedimiento tras cada incidente real y tras cada ensayo.

## 10. Lo que debe estar listo antes de producción

| # | Qué | Responsable |
|---|---|---|
| 1 | Persona de guardia con nombre y suplente, con alertas que le llegan | CEO designa; DevOps configura |
| 2 | Acciones de contención probadas (Anexo A, pasos 1 a 6) | DevOps, Arquitecto |
| 3 | Registro de eventos de seguridad, copia externa de la auditoría y su verificación semanal funcionando | Arquitecto, DevOps |
| 4 | Plantilla de aviso preaprobada por el abogado | Cumplimiento, abogado |
| 5 | Respuestas legales L-01, L-02, L-04, L-08, L-16 | CEO y abogado |
| 6 | Contratos con proveedores técnicos con la obligación de avisar | CEO, abogado |
| 7 | Simulacro hecho y su informe | Seguridad, DevOps |
| 8 | Carpeta `docs/operaciones/incidentes/` y plantilla | Seguridad |

---

## Anexo A. Guía operativa de contención (para el equipo técnico)

Cada acción: **qué hace, quién la ejecuta, cómo se comprueba que funcionó**. Los pasos 1 a 6 deben estar probados antes de producción.

| # | Acción | Efecto | Quién | Se comprueba con |
|---|---|---|---|---|
| 1 | Revocar sesiones de una persona / de una empresa / de todas | Cierra todas las sesiones y enlaces vigentes; quien siga necesita un enlace nuevo | Función de la plataforma (Arquitecto); la ejecuta DevOps con aprobación del Gerente de TI | Una acción con una sesión vieja es rechazada |
| 2 | Suspender una clave de API o un webhook | La integración responde "no encontrado" | Administrador de la empresa o plataforma | Pedido con la clave rechazado en menos de 10 segundos (RNF-INT-002) |
| 3 | Suspender una membresía | Corta sus sesiones en esa empresa al instante (RF-ACC-016) | Administrador o plataforma | Intento de acción rechazado |
| 4 | Suspender una cuenta de plataforma | Se retira la llave física y el acceso desde la red restringida | Otra persona de plataforma y DevOps | Intento de entrada rechazado |
| 5 | Rotar claves de API, correo y base | Se acepta la nueva antes de retirar la vieja, sin cortar el servicio (plan de DevOps 6.1) | DevOps | Las claves viejas dejan de funcionar |
| 6 | Suspender una empresa | Nadie entra; datos conservados (RF-ACC-022) | Plataforma, con dos personas si es un rescate inverso | Ninguna membresía entra |
| 7 | Retirar una versión publicada | Plan de vuelta atrás escrito de esa versión | DevOps | Versión anterior activa |
| 8 | Rotar la llave maestra o las derivadas | Recifrado por lotes; solo si hay sospecha de que se vio la llave o la base junto con la llave | DevOps y Seguridad, con aprobación del Gerente de TI | Un campo cifrado abre con la versión nueva |

**Preservación de evidencia, en este orden:** (1) exportar la auditoría y los eventos de seguridad de la ventana del hecho; (2) verificar la copia externa de auditoría; (3) copiar los registros técnicos y el reporte de errores; (4) guardar la configuración y la versión publicada; (5) guardar el respaldo más cercano al hecho, marcado para que la rotación no lo borre.

**Si la causa es la cuenta de plataforma:** además, revisar el registro de plataforma y el registro de empresa de las sesiones de soporte de las últimas semanas; verificar con cada empresa afectada que autorizó cada sesión de soporte; y no emitir accesos de emergencia hasta cerrar el incidente.

**Si el correo falla durante el incidente:** el acceso de emergencia del Administrador de plataforma (PS-05) exige a una segunda persona de plataforma o al contacto autorizado confirmado, y un solo uso por empresa y semana (RF-PLA-009).

## Anexo B. Plantilla del registro del incidente

```
# Incidente AAAA-MM-DD-nn
Gravedad: G1 / G2 / G3 (con fecha de cambio si se reclasificó)
Declarado por: (rol, no nombre) · Hora de detección: · Hora de confirmación:
Líder del incidente: (rol) · Decide: (rol)

## Qué se vio (sin datos personales ni secretos)
## Línea de tiempo (hora · quién [rol] · qué)
## Contención (acciones, hora de cada una, hora en que se detuvo el daño)
## Alcance: empresas · tipos de datos · cuántas personas · quién pudo verlos
## Evidencia guardada y dónde (fuera del repositorio si es sensible)
## Avisos: CEO (hora, quién) · empresas (hora, texto) · personas / autoridad (decisión legal y fecha)
## Causa raíz
## Acciones correctivas (qué · responsable · fecha · prueba nueva)
## Riesgos actualizados (números de riesgos.md)
## Cierre: fecha · quién aprobó · informe a 10 días enlazado
```

## Anexo C. Cumplimiento: puntos para completar (co-redacción)

Pendiente del Auditor de Cumplimiento (se marcan para que los complete o corrija en este mismo archivo):
1. Plantilla de aviso a la empresa y a las personas afectadas, en lenguaje claro, lista para que el abogado la apruebe.
2. Lista de preguntas para el abogado sobre L-01, L-02, L-04, L-08 y L-16, con las opciones.
3. Tabla de qué datos del §18.1 del documento funcional se vieron según el tipo de incidente, para evaluar el alcance rápido.
4. Quién en cada empresa recibe el aviso por defecto (administradores y contacto autorizado) y qué pasa si la empresa no tiene contacto confirmado.
5. Cómo se atienden los pedidos de derechos de datos que lleguen durante un incidente.

## Historial de cambios

| Fecha | Cambio | Quién |
|---|---|---|
| 2026-10-25 | Borrador 0.1 sobre D-059 | Especialista en Seguridad |
