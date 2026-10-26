# ADR-19 · Puerta única de exportación

**Estado:** Propuesto · **Decide:** Gerente de TI (revisan Seguridad y Cumplimiento) · **Base:** D-061.1, D-036.3, D-054.2, D-038.7, D-022, H-CUM-07

## Contexto
Una vez descargado un archivo, la plataforma ya no lo controla. Hay trece variantes de "exportar" en los módulos. Las exportaciones de hasta 50.000 filas no pueden hacerse dentro de la petición, pero D-022 dice que no hay almacenamiento de archivos.

## Decisión
**Un solo servicio** `puertaExportacion(tipo, filtros)` en `nucleo/exportacion`; ningún módulo exporta por su cuenta. Cada módulo aporta un **proveedor de datos** (qué columnas, con su sensibilidad) por el registro de módulo (ADR-14).

Pasos obligatorios:
1. Permiso `datos.exportar` (sensible) y **reautenticación reciente**; el módulo exporta solo lo que el usuario ya puede ver.
2. **Confirmación con motivo** y **vista de las filas y de las columnas sensibles** que se llevará.
3. **Columnas omitidas** si falta `precios.ver` o `datos_personales.ver`; nunca salen secretos (ADR-17), ni claves, ni textos restringidos.
4. **Neutralización de fórmulas** en celdas de texto que empiecen con `=`, `+`, `-`, `@`, tabulador o retorno.
5. **Topes** (ADR-16): 10 por usuario por hora, 100 por empresa por día, 50.000 filas; **alerta** si un usuario supera 5 por hora.
6. **Auditoría** (ADR-11): quién, cuándo, filtros, cuántas filas y qué columnas sensibles, **sin el contenido**. La lectura masiva por API (más de 5.000 filas por día por clave) se trata como exportación.
7. Hoja **"Aviso"** con quién lo generó, cuándo y que contiene datos personales.
8. **Se genera en el trabajador** con escritura en flujo (barra de avance). El resultado se guarda **cifrado con la llave de la empresa** (ADR-07) en `exportacion_resultado` (descarga única, vence a las 24 horas, purga por el programador). No son "archivos almacenados" en el sentido de D-022: es una fila temporal, cifrada, en la propia base, que en los respaldos aparece como texto cifrado.
9. Las entregas de derechos de datos (D-061.2) usan esta misma pieza con descarga única registrada y nunca por correo.

## Opciones descartadas
- Exportar dentro de la petición: la web tendría procesos largos y límites de tiempo.
- Guardar el archivo en un almacén de objetos: depende de D-022 (se consulta al cierre de la Etapa 4).
- Cada módulo con su propio botón: ya genera diez variantes de permiso.

## Consecuencias
- Si en la Etapa 4 el CEO aprueba un almacén de archivos, el resultado puede moverse allí sin cambiar la interfaz.
- Filas de resultado de hasta ~10 MB cada una; el tope de 50.000 filas lo acota.
- **Punto abierto:** que `exportacion_resultado` cifrada cuente como almacenamiento temporal aceptable: lo confirman Seguridad y Cumplimiento.

## Qué prueba lo valida
- Un usuario sin `precios.ver`/`datos_personales.ver`: columnas ausentes, aviso en pantalla.
- Fórmula inyectada (`=HYPERLINK(...)`) llega como texto; importes negativos siguen siendo números.
- Sexta exportación en una hora: alerta; undécima: rechazada; descarga única y vencimiento a 24 h (reloj fijado).
- Búsqueda del nombre canario y de un secreto sembrado en la exportación: no aparecen.
- Prueba de arquitectura: ningún módulo escribe archivos de exportación fuera de `nucleo/exportacion`.
