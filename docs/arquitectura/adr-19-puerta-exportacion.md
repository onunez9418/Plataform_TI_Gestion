# ADR-19 · Puerta única de exportación

**Estado:** Propuesto (revisado 2026-10-29 tras Seguridad ronda 5) · **Decide:** Gerente de TI (revisan Seguridad y Cumplimiento) · **Base:** D-061.1, D-036.3, D-054.2, D-038.7, D-022, H-CUM-07; H-SEG-37 c, 54, 55, 56, 57, 58

## Contexto
Una vez descargado un archivo, la plataforma ya no lo controla. Hay trece variantes de "exportar" en los módulos. Las exportaciones de hasta 50.000 filas no pueden hacerse dentro de la petición, pero D-022 dice que no hay almacenamiento de archivos. Seguridad **aprobó** guardar el resultado cifrado en la base por 24 horas, con las condiciones que se incorporan abajo (es la opción más segura de las que hay sin almacén de archivos; no es "almacenamiento de archivos" en el sentido de D-022, que habla de facturas y adjuntos subidos por personas). Cumplimiento confirma esa lectura de D-022.

## Decisión
**Un solo servicio** `puertaExportacion(tipo, filtros)` en `nucleo/exportacion`; ningún módulo exporta por su cuenta. Cada módulo aporta un **proveedor de datos** (qué columnas, con su sensibilidad) por el registro de módulo (ADR-14).

### Pasos obligatorios
1. Permiso `datos.exportar` (sensible) y **verificación reciente con el autenticador** (ADR-08); el módulo exporta solo lo que el usuario ya puede ver. **La sesión de soporte no puede exportar** ni hacer lecturas masivas por API: `app_soporte` no ejecuta estas funciones y la puerta rechaza a todo principal de soporte (H-SEG-37 c).
2. **Confirmación con motivo** y **vista de las filas y de las columnas sensibles** que se llevará. Los **filtros y las columnas confirmadas** se guardan en una fila `exportacion_solicitud` (con seguridad por fila y `sin_soporte`); el trabajo de generación lleva **solo su identificador** (ADR-02: la carga útil no admite datos personales, y un filtro puede contener un nombre buscado).
3. **Columnas omitidas** si falta `precios.ver` o `datos_personales.ver`; nunca salen secretos (ADR-17), ni claves, ni textos restringidos; **se excluye siempre** el registro de solicitudes de derechos (RF-PER-012) y los textos redactados.
4. **Neutralización de fórmulas** en celdas de texto que empiecen con `=`, `+`, `-`, `@`, tabulador o retorno.
5. **Topes** (ADR-16): 10 por usuario por hora, 100 por empresa por día, 50.000 filas; **alerta** si un usuario supera 5 por hora; una exportación activa por usuario a la vez.
6. **Auditoría** (ADR-11): quién, cuándo, filtros, cuántas filas y qué columnas sensibles, **sin el contenido**, y además (H-SEG-58): la **huella SHA-256 del archivo generado**, el **número de Personas distintas incluidas** y, como eventos aparte, la **descarga** (quién, cuándo) y el **vencimiento sin descarga**. Con eso se contesta "¿de cuántas personas?" y se puede demostrar si un archivo hallado fuera salió de la plataforma (procedimiento de incidentes, 6.0 y C.3). La lectura masiva por API (más de 5.000 filas por día por clave) se trata como exportación.
7. Hoja **"Aviso"** con quién lo generó, cuándo y que contiene datos personales.
8. **Se genera en el trabajador con escritura en flujo** (barra de avance), y **al generar vuelve a comprobar los permisos con la membresía solicitante** (H-SEG-55): membresía activa, `datos.exportar` vigente, columnas permitidas por `precios.ver` y `datos_personales.ver`. Si algo cambió desde el pedido, la exportación **falla con un motivo**; no entrega una versión recortada sin avisar. Sin archivos temporales en disco con texto claro durante la generación.
9. **Almacenamiento temporal cifrado (H-SEG-56):** el resultado se guarda cifrado con la llave de la empresa (ADR-07, propósito `exportacion`) en `exportacion_resultado` (metadatos: `solicitante_membresia_id`, `estado` ∈ `generando | listo | descargado | vencido | fallado`, `descargado_en`, `vence_en`, tamaño) y `exportacion_bloque` (`resultado_id`, `n`, `cifrado`), con **bloques de 1 MiB**, cada uno con datos asociados `tabla|columna|id|empresa|bloque|último` (ADR-07: así un bloque quitado o reordenado se detecta y nada se envía sin autenticar). Ambas tablas son `sin_soporte`, con seguridad por fila, y `app_plataforma` no tiene permisos sobre ellas. **Falla explícita (no recorte)** si el resultado supera ~10 MB: "reduzca columnas o filtre"; **tope de bytes por empresa a la vez** (propuesta inicial 100 MB; H12 la mide). Vence a las 24 horas; el programador lo purga y hay **alarma si existe un resultado con más de 25 horas** (el programador falló).
10. **Descarga (H-SEG-54, alta):** la ligazón al solicitante es parte del diseño. La descarga es un `POST` desde un botón (no un `GET`, para que un precargador del navegador o un filtro no la gaste) y exige, en el servidor: sesión válida, la empresa de la dirección, `solicitante_membresia_id` **igual** a quien descarga, membresía activa, `datos.exportar` vigente y sesión que no sea de soporte. El identificador del resultado **no es una credencial** (es un UUID v7: único, pero no secreto). "Descarga única" es una actualización atómica (`UPDATE … SET descargado_en = ahora, estado = 'descargado' WHERE id = $1 AND solicitante_membresia_id = $2 AND descargado_en IS NULL AND vence_en > ahora RETURNING …`, con `$2` = la membresía de quien descarga; H-SEG-78 punto 2) **antes** de empezar a enviar. Se descifra **en memoria, bloque por bloque**, y el texto cifrado se **borra de inmediato en un bloque `finally`**, haya terminado la descarga o se haya cortado la conexión; además el programador barre cada hora los resultados en estado `descargado` que aún tengan bloques, de modo que no queden hasta 24 horas. La respuesta lleva `Cache-Control: no-store`, `Content-Disposition: attachment`, `X-Content-Type-Options: nosniff` y un nombre de archivo sin datos personales (`exportacion-<tipo>-<fecha>.xlsx`). Si la conexión se corta a mitad, la descarga ya se consumió y hay que exportar de nuevo (cuenta contra los topes): se acepta a cambio de no abrir una segunda descarga.
11. **Entregas de derechos de datos (D-061.2, H-SEG-57; pregunta abierta, no se construye este paso todavía):** la Persona que pide sus datos puede no tener Usuario, y con la regla del punto 10 descarga quien atiende el pedido. **Propuesta de partida del Arquitecto, a definir con Cumplimiento:** descarga hecha por la persona que atiende, con registro, y entrega presencial o por un medio que la empresa verifique, sin enlace de descarga público y nunca por correo; el procedimiento de incidentes (C.5.4) añade verificar la identidad por otro medio cuando hay un incidente. Mientras no se defina, este paso no se construye.

## Opciones descartadas
- Exportar dentro de la petición: la web tendría procesos largos y límites de tiempo.
- Guardar el archivo en un almacén de objetos: depende de D-022 (se consulta al cierre de la Etapa 4).
- Cada módulo con su propio botón: ya genera diez variantes de permiso.
- **Plan B si Cumplimiento rechaza la tabla temporal** (lo propone Seguridad): generar el archivo al momento de la descarga, en flujo, sin guardarlo. ADR-01 usa contenedores de ejecución continua, así que no hay límite de segundos; se pierde la barra de avance y el trabajo en el trabajador.

## Consecuencias
- Si en la Etapa 4 el CEO aprueba un almacén de archivos, el resultado puede moverse allí sin cambiar la interfaz.
- Filas de resultado de hasta ~10 MB repartidas en bloques; el tope de 50.000 filas lo acota. El vaciado deja trabajo de limpieza en la base (H12 lo mide).
- **El "vence a las 24 horas" vale para la base viva.** Las copias de respaldo (30 diarios y 12 mensuales, D-032) conservan ese texto cifrado hasta que venzan, y como no hay destrucción de llave por empresa (ADR-07), la maestra los abre. Es la misma postura que ya tienen todos los datos personales en los respaldos; **se escribe en el aviso de privacidad** (Cumplimiento).
- Quien atiende un derecho de datos descarga por él: el canal con la Persona queda por definir (punto 11).

## Qué prueba lo valida
- Un usuario sin `precios.ver`/`datos_personales.ver`: columnas ausentes, aviso en pantalla.
- Fórmula inyectada (`=HYPERLINK(...)`) llega como texto; importes negativos siguen siendo números.
- Sexta exportación en una hora: alerta; undécima: rechazada; vencimiento a 24 h (reloj fijado); alarma a las 25 h.
- Búsqueda del nombre canario y de un secreto sembrado en la exportación: no aparecen.
- **Descarga (H-SEG-54):** otro usuario de la misma empresa, otra empresa, descarga repetida, descarga tras suspender al solicitante, descarga con sesión de soporte, descarga después de que el solicitante perdió `datos.exportar` o `precios.ver` entre el pedido y la generación (la exportación falla con motivo): todas rechazadas; el texto cifrado ya no existe tras la descarga.
- **H12 (nueva):** resultado de 10 MB: cifrar, guardar, descargar una vez con las comprobaciones de H-SEG-54, borrar, y medir memoria, tiempo, tamaño de la tabla y efecto del vaciado. Fracaso: texto claro en disco, descarga por un usuario distinto, o más de una descarga.
- La auditoría trae la huella del archivo y el número de Personas; hay un evento de descarga y uno de vencimiento sin descarga.
- Prueba de arquitectura: ningún módulo escribe archivos de exportación fuera de `nucleo/exportacion`.

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| H-SEG-54 (alta) | Incorporado: descarga atada al solicitante, `POST`, actualización atómica antes de enviar, borrado inmediato, cabeceras. |
| H-SEG-55 | Incorporado: `exportacion_solicitud` y recomprobación de permisos al generar. |
| H-SEG-56 | Incorporado: tablas `sin_soporte`, datos asociados y **bloques de 1 MiB** (con el hecho de la etiqueta de GCM), sin archivos temporales, topes por usuario y por empresa, falla explícita, alarma a las 25 h, aviso de privacidad, H12. El tope de bytes por empresa (100 MB) es una propuesta inicial que H12 mide. |
| H-SEG-57 | Queda como **pregunta abierta** con propuesta de partida; no se construye el paso hasta que Cumplimiento y Arquitectura lo definan. |
| H-SEG-58 | Incorporado: huella del archivo, Personas distintas, eventos de descarga y vencimiento. |
| H-SEG-37 c | Incorporado: soporte no exporta. |
| D-077 | El motivo de la exportación se guarda por valor en la auditoría (ADR-11). |

## Qué cambió tras la ronda 6 (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| H-SEG-78 (2) | Incorporado: borrado en `finally`, barrido de resultados `descargado` y `solicitante_membresia_id` en el `WHERE` de la actualización atómica. Prueba: cortar la conexión a mitad de una descarga no deja bloques. |
