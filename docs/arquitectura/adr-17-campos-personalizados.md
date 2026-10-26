# ADR-17 · Marco único de campos personalizados (T-13)

**Estado:** Propuesto · **Decide:** Gerente de TI (con Ingeniero de Datos) · **Base:** D-005, D-035, D-072.2, H-ARQ-06, H-ARQ-18

## Contexto
Los campos personalizados los usarán SKU, unidades, el formulario de cada servicio de la mesa de ayuda, las importaciones, las exportaciones y la API. "Pendiente de completar" debe ser una cifra de tableros sobre 100.000 activos sin recorrer JSON en cada consulta. La clave de una licencia es un campo **secreto**, nunca la serie.

## Opciones
1. Una tabla de valores por campo (entidad-atributo-valor). Descartada: consultas lentas y complejas.
2. Columnas dinámicas por empresa. Descartada: exige DDL en tiempo de ejecución.
3. **JSON validado + definiciones + tablas auxiliares puntuales.** Elegida.

## Decisión
- **Definiciones:** tabla `campo_definicion(empresa_id, ambito, categoria_id, clave, nombre, tipo, obligatorio, filtrable, identificador, largo_exacto, dato_personal, opciones, orden)`. `ambito` ∈ `sku | unidad | servicio_ayuda`. **Seis tipos:** texto, número, fecha, lista, sí/no y **secreto**. Límites de D-072.1 (nombre de campo 60, texto 255, 100 opciones, 40 campos por categoría, secreto 512).
- **Un validador de servidor** `validarCampos(definiciones, valores)` genera el esquema de validación (Zod) desde las definiciones; lo usan pantallas, importación, API y mesa de ayuda. Nadie valida por su cuenta.
- **Valores** en `valores jsonb` de la entidad. Solo los campos marcados **filtrables** se copian además a `valores_filtrables jsonb`, con **un** índice GIN. Se descarta un índice por campo: exigiría DDL en tiempo de ejecución con un rol que no es dueño; si una consulta de rango sobre un campo numérico o de fecha resulta lenta al medirla, se agrega una columna generada por una migración (nunca en ejecución).
- **Secreto:** nunca en el JSON. Tabla `valor_secreto(empresa_id, entidad_tipo, entidad_id, definicion_id, cifrado, mascara, version_llave)` con `sin_soporte` (ADR-03). Cifrado según ADR-07. No se busca, no aparece en historial (dice "clave cambiada"), auditoría, exportaciones, importaciones, reportes, API, avisos ni correos (D-035.2). La `mascara` se calcula al escribir: últimos 4 caracteres solo si la clave tiene 16 o más.
- **Identificador** (IMEI, número de línea): tabla `identificador_unico(empresa_id, definicion_id, valor_norm, entidad_id)` con índice único parcial que excluye lo anulado, escrita en la misma transacción que el valor. Normalizado; `largo_exacto` opcional; rechazo de series dañadas por Excel (D-072.2).
- **Completo/incompleto:** `completo boolean` guardado al escribir; un trabajo lo recalcula por lotes y por empresa cuando cambian las definiciones (ADR-02).
- **Dato personal:** la marca `dato_personal` alimenta la lista cerrada de campos que la auditoría no guarda por valor (ADR-11). Un campo nuevo con dato personal no pasa a desarrollo sin declararse.
- **Naturaleza de la categoría** (D-045: equipo físico, licencia, servicio) es fija y heredada; el motor la usa para decidir qué reglas aplican.

## Consecuencias
- Dos copias de los filtrables (en `valores` y `valores_filtrables`) se escriben siempre juntas por la misma función.
- Un cambio de tipo de campo con valores existentes se rechaza (migración de datos explícita).
- La serie de una licencia es un código interno visible; la clave vive en otra tabla.

## Qué prueba lo valida
- Prueba por tipo: valor inválido rechazado igual desde pantalla, importación y API.
- Prueba del campo secreto: no aparece en volcado de la base ni de la exportación (ADR-09/19); revelar exige permiso, reautenticación y deja auditoría sin el valor.
- Unicidad del identificador con dos empresas con el mismo IMEI (permitido) y dentro de una (rechazado); anulado libera el valor.
- 100.000 unidades: consulta con filtro por campo filtrable usa el GIN (plan de ejecución) y cumple RNF-011.
