# ADR-09 · Huellas de valores de entrada (dos niveles), prueba RS-51 y código corto de ingreso

**Estado:** Propuesto (revisado 2026-10-29 tras Seguridad ronda 5 y Datos) · **Decide:** Gerente de TI (diseña con Seguridad, plan-aplicacion §3) · **Base:** D-065 S-34(e), RS-51, D-073.4, H-SEG-31, CA-068; H-SEG-45, 46, 49; D18-1, D04-5, D15-7

## Contexto
Si alguien lee la base (copia, respaldo, administrador), no debe encontrar un solo valor que sirva para entrar: enlaces, invitaciones, sesiones, códigos de recuperación, claves de API, código corto, acceso de emergencia. Una huella simple (hash) basta para valores de alta entropía, pero **no** para un código corto de 8 caracteres. La primera versión de este ADR usaba una huella con llave derivada de la maestra para **todo**; Seguridad mostró que eso hace depender de la maestra a los códigos de recuperación y a las claves de API, y que entonces perder la maestra deja sin salida a quienes tienen segunda verificación obligatoria (H-SEG-45, alta).

## Opciones
1. SHA-256 simple para todo. Insuficiente para el código corto (40 bits): con la base filtrada se prueba por fuerza bruta fuera de línea.
2. bcrypt o argon2. Descartada: lento por petición y innecesario para valores aleatorios largos.
3. HMAC-SHA-256 con llave derivada de la maestra para todo. Primera versión; descartada por H-SEG-45.
4. **Dos niveles según la entropía y la duración del valor.** Elegida.

## Decisión

### Una sola función, dos niveles
`huella(tipo, valor)` es la **única** función que produce lo que se guarda de un valor de entrada. Una tabla en código, `NIVEL_DE_HUELLA[tipo]`, dice a qué nivel pertenece cada tipo; agregar un tipo exige declarar su nivel y el visto bueno de Seguridad.

| Nivel | Fórmula | Para qué | Depende de la maestra |
|---|---|---|---|
| **A: con llave (HMAC, "pepper")** | `"v<versión>:" + base64url(HMAC-SHA-256(pepper_tipo, valor))`, con `pepper_tipo` derivado de la maestra (ADR-07, propósito `pepper:<tipo>`) | Valores **cortos o de poca entropía**: código corto (40 bits), claves del limitador (correos e IP), `correo_intento` (correo escrito en un ingreso fallido, D04-5), `peticion` (clave de idempotencia, 24 h), `archivo_importacion` (huella del archivo, D18-1). Y valores **de vida corta** cuya pérdida solo obliga a volver a entrar: enlaces de ingreso, invitaciones, sesiones de empresa, acceso de emergencia | **Sí.** Perder la maestra los invalida (aceptable: se vuelve a pedir un enlace) |
| **B: sin llave (SHA-256 con separación por tipo)** | `"v<versión>:" + base64url(SHA-256("plataformati/huella/v1/" + tipo + "\0" + valor))` | Valores **duraderos y de alta entropía**: **claves de API** (al menos 128 bits), **códigos de recuperación** (al menos 100 bits), sesiones de plataforma (256 bits; la consola no tiene la maestra) | **No.** Siguen funcionando si la maestra se pierde o se filtra |

Razón: con al menos 100 a 128 bits aleatorios, un ataque de fuerza bruta contra el SHA-256 de la base es inviable sin necesidad de una llave, y quitar la dependencia de la maestra devuelve validez al ensayo de pérdida (escenario A del plan 6.7: cada persona se reenrola con su código de recuperación). Para los códigos de recuperación se eligió **100 bits y SHA-256** (cuatro grupos de cinco caracteres de un alfabeto de 32 símbolos, p. ej. `K7M2P-9QXWD-4H8TA-NR5VB`; se muestran una sola vez y se guardan o imprimen), y no un derivado lento con sal (`scrypt`), porque este último agrega costo de CPU a un punto de entrada sin autenticar y no aporta seguridad adicional a 100 bits. Se compara siempre en tiempo constante.

### Cómo llega el valor al correo
El valor en claro solo existe en el **correo** o en la **pantalla** de su dueño. Los que van por correo (enlace de ingreso, invitación, acceso de emergencia) **nacen en el trabajador, justo al enviar** (ADR-08, H-SEG-46): ni la petición ni la cola los conocen.

### Código corto para abrir el enlace en otro dispositivo (D-073.4)
1. La persona pide el enlace en el computador (navegador A). La pantalla de espera muestra siempre un **código de 8 caracteres** de un alfabeto de 32 símbolos sin ambiguos (sin 0/O, 1/I/L), 40 bits, con aviso "No comparta este código".
2. Abre el correo en el celular (dispositivo B). El enlace no está atado a B, así que B pide el código; la persona lo escribe y la sesión nace **en B**.
3. Se guarda solo su huella de **nivel A** dentro de `enlace_ingreso`. Mismo vencimiento (15 min) y un solo uso que el enlace. **Máximo 5 intentos** y el enlace queda invalidado; comparación en tiempo constante; tope por IP en el limitador (ADR-16).
4. Si no hay código, la persona pide un enlace nuevo en el mismo dispositivo.

Seguridad analiza: 5 intentos sobre 2^40 combinaciones, y el atacante además debe tener el enlace; con huella con pepper no hay ataque fuera de línea. El riesgo restante es ingeniería social (que la víctima lea el código a un atacante): se mitiga con el aviso y el correo de "se inició sesión" (ADR-08). El código corto **como tal queda aprobado** por Seguridad. El Diseñador define la pantalla.

### Prueba RS-51 en integración continua
Objetivo: **la base no contiene ningún valor que sirva directamente para entrar.**
1. Un registro en código, `VALORES_DE_ENTRADA`, lista cada columna que guarda una huella (tabla.columna) y su nivel.
2. La prueba ejecuta los **flujos reales** con el correo de captura: enlace de ingreso, invitación, sesión (empresa y plataforma), códigos de recuperación, clave de API, código corto, acceso de emergencia; y conserva los valores en claro que cada flujo produjo (del correo, de la respuesta o de la pantalla).
3. Vuelca **todas** las tablas (cada fila convertida a texto, incluidas auditoría, eventos, `cola.*` **con trabajos fallidos y reintentados**, y las del soporte) y la salida de los registros técnicos, **de los envíos de correo y de los mensajes de error**, y exige **cero apariciones** de cada valor en claro.
4. **Control positivo en varias representaciones (H-SEG-49):** antes de dar por buena la búsqueda, planta un valor en una columna de prueba en texto plano, dentro de una URL y dentro de un JSON, y comprueba que la búsqueda **lo encuentra** en las tres. Sin este paso una prueba rota pasaría en verde.
5. Falla si existe una columna cuyo nombre case `token|secret|codigo|clave|enlace` y no esté en `VALORES_DE_ENTRADA` (ni en la lista de excepciones revisada por Seguridad).
6. La semilla TOTP en claro tampoco debe aparecer (se guarda cifrada, ADR-07).
7. Comprueba que el enlace no sale en los registros de acceso **de la propia aplicación** (la ruta con el valor se redacta, ADR-20) y que la página del botón "Entrar" no carga recursos de terceros. Lo que escriba el alojamiento en sus registros queda como riesgo residual, anotado por DevOps.
8. Nivel B: una prueba comprueba que el generador de claves de API y de códigos de recuperación produce al menos 128 y 100 bits respectivamente, y que no hay llamada a la maestra en su validación.

## Consecuencias
- Rotar el pepper invalida los valores vivos de nivel A (enlaces, sesiones de empresa, invitaciones): se hace con la versión en el prefijo y un periodo de convivencia corto.
- **Perder la llave maestra** obliga a que todos vuelvan a pedir un enlace y a reingresar las claves de licencia, pero **ya no** a regenerar las claves de API ni deja sin salida a nadie con segunda verificación: los códigos de recuperación y las claves de API no dependen de ella. (Corrige la consecuencia anterior y el escenario A del plan 6.7.)
- Un efecto menor: la huella de `archivo_importacion` y la de `peticion` dejan de coincidir si cambia el pepper; solo se pierde la detección de duplicados de lotes anteriores.
- La prueba RS-51 es lenta; corre en cada cambio sobre una base pequeña inventada.

## Qué prueba lo valida
- La propia prueba RS-51 (con su control positivo triple), H8 del prototipo (un H8 mínimo el día 3 y la repetición completa el día 4).
- Código corto (CA-068): 5 intentos y muere; código de otro enlace no sirve; vencido no sirve; tiempos de respuesta similares con código correcto e incorrecto.
- Ensayo de pérdida de la maestra (ADR-07): con claves de API y códigos de recuperación de nivel B, una persona vuelve a enrolar su segunda verificación.

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| H-SEG-45 (alta) | Incorporado: dos niveles. Para los códigos de recuperación elegí 100 bits y SHA-256 (no `scrypt`), con la razón de arriba. Las sesiones de plataforma también son de nivel B porque la consola no recibe la maestra. |
| H-SEG-46 (alta) | Incorporado en ADR-08: el valor nace en el trabajador. |
| H-SEG-49 | Incorporado: control positivo en tres representaciones, salidas de envíos, cola con fallidos y errores, ruta redactada y sin recursos de terceros. |
| D18-1 | Incorporado: tipo `archivo_importacion` de nivel A. |
| D04-5 | Incorporado: tipo `correo_intento` de nivel A. |
| D15-7 | Incorporado: tipo `peticion` de nivel A. |
