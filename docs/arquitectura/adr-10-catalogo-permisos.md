# ADR-10 · El registro de permisos es un catálogo del código (T-7)

**Estado:** Propuesto (revisado 2026-10-29 tras Seguridad ronda 5) · **Decide:** Gerente de TI · **Base:** D-036, D-004 (reescrita), D-048.1, D-068, `docs/registro-permisos.md` v1.1; H-SEG-37 b, 52

## Contexto
Los módulos mencionaban 252 identificadores de permiso con variantes (`datos_personales.ver`, `datos-personales.ver`, `personas.ver_datos`). `docs/registro-permisos.md` define cada permiso (PS-nn, nombre `modulo.accion`, sensible S, alcance todo/propio, controles R/2F/A/T/No, "Cuándo", valor por plantilla de rol). Falta que el **código** lo obedezca y que la comprobación en el servidor sea una sola.

## Opciones
1. Generar el código leyendo el markdown. Descartada: ata el funcionamiento al formato de un documento.
2. Dos fuentes sueltas. Descartada: se desincronizan.
3. **El código es la fuente en ejecución; el markdown es el contrato legible; una prueba exige que coincidan.** Elegida.

## Decisión
- `src/nucleo/permisos/catalogo.ts`: una entrada por permiso con `ps`, `nombre`, `modulo`, `sensible`, `alcance` (`todo | propio`), `controles`, `cuando` y `porPlantilla` (Administrador, Jefatura TI, Técnico, Almacén, Solicitante, Solo lectura, Empleado, Plataforma). El tipo `Permiso` es la unión de los nombres: **usar un permiso inexistente no compila**.
- **Prueba de coincidencia:** CI lee las tablas de `docs/registro-permisos.md` (columnas PS, nombre, S, alcance, controles, cuándo, valores por rol) y falla si difieren del catálogo. Cambiar un permiso exige tocar ambos en el mismo cambio, con visto bueno del Gerente de TI.
- **Una sola comprobación:** `exigirPermiso(principal, permiso, recurso?)`. El principal es una **membresía** o una **integración** (los alcances de una clave de API son un subconjunto del catálogo; sin vocabulario aparte). Orden fijo: (1) módulo activo en la empresa (`modulo_activo`, API responde "no encontrado" si está apagado), (2) membresía activa, (3) el rol tiene el permiso, (4) alcance: si es "propio", el **resolvedor del recurso** (tabla de resolvedores del registro §2; sin Persona vinculada = lista vacía, nunca error), (5) controles: 2F, reautenticación reciente, tope por hora, "No" (lo aplica `dobleControl`, ADR-13).
- **`definirServicio({ permiso } | { sinPermiso: 'razón' }, fn)`** es la única forma de crear un servicio de negocio. Una prueba de arquitectura falla si una ruta, acción o API llama a algo que no sea un servicio así definido. Esa es la comprobación en el servidor que exige la regla 6 de CLAUDE.md; la pantalla solo oculta botones.
- En la base el rol guarda el **nombre** del permiso (texto). Un chequeo de CI y un trabajo al arrancar verifican que todo nombre guardado exista en el catálogo; quitar un permiso del catálogo exige migración que borre sus filas.
- **Globales sensibles únicos:** `datos_personales.ver`, `precios.ver`, `auditoria.ver`, `datos.exportar`, `datos.importar`. Cada módulo exporta o importa solo lo que el usuario ya puede ver (ADR-18, ADR-19).
- **Módulo activado** en una empresa existente: sus permisos se ofrecen al administrador como plantilla sugerida; los roles personalizados no cambian solos (D-036.8). Rol nuevo = sin permisos; nadie se asigna permisos a sí mismo ni a un rol con más de los suyos (RF-ROL-006/007).
- La lista de sensibles alimenta la regla de segunda verificación obligatoria (ADR-08): "Administrador activo" = quien tiene `roles.administrar` y `usuarios.cambiar_rol`; el último no se quita.
- QA genera la matriz con `permisos:matriz` (una petición directa por celda).
- **Permiso que falta (H-SEG-37 b):** el registro tiene PS-03 (`plataforma.soporte_leer`, lado plataforma) pero **ningún permiso para que el administrador de la empresa autorice o revoque el soporte** (ADR-03), y usar un permiso inexistente no compila. Se pide al Analista, vía la Jefatura, el permiso **`empresa.autorizar_soporte`**: sensible, 2F, verificación reciente con autenticador, auditado, para autorizar y revocar; avisa por correo a los administradores al crearse, al usarse por primera vez y al revocarse. Hasta que exista en el registro, la función `autorizacion_soporte_crear` no se puede construir.
- **Regla de coherencia con ADR-08 (H-SEG-52):** todo permiso con control de verificación reciente (`R`) debe ser sensible (por lo tanto su titular tiene segundo factor); una prueba del catálogo lo comprueba, porque la verificación reciente solo la renueva el segundo factor.
- Los módulos de ADR-21 (integración con Microsoft) y ADR-22 (asistente) necesitan permisos nuevos (conectar y desconectar la integración, usar el asistente, activarlo para la empresa); sus nombres los fija el Analista al redactar el módulo.

## Consecuencias
- Agregar un permiso toca tres cosas: catálogo, registro y plantilla de roles; es intencional (D-036.1: los módulos no inventan permisos).
- Un fallo en `definirServicio` es de compilación o de CI, no de producción.
- El Analista mantiene el markdown; este ADR no lo edita.

## Qué prueba lo valida
- Prueba de coincidencia código-markdown; prueba de nombres en base; prueba de arquitectura de servicios.
- Matriz completa por petición directa (QA): cada celda, incluidos los 51 sensibles.
- Casos: rol con "propio" y sin Persona vinculada ve lista vacía; módulo apagado responde "no encontrado"; clave de API con alcance fuera del catálogo no se puede crear.

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| H-SEG-37 b | Incorporado como pedido al Analista: permiso `empresa.autorizar_soporte`. |
| H-SEG-52 | Prueba de coherencia entre permisos sensibles y control `R`. |
| ADR-21 y ADR-22 | Nota de permisos pendientes (a contrastar con los módulos). |
