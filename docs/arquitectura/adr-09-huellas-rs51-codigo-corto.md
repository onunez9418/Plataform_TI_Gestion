# ADR-09 · Huellas de valores de entrada, prueba RS-51 y código corto de ingreso

**Estado:** Propuesto · **Decide:** Gerente de TI (diseña con Seguridad, plan-aplicacion §3) · **Base:** D-065 S-34(e), RS-51, D-073.4, H-SEG-31, CA-068

## Contexto
Si alguien lee la base (copia, respaldo, administrador), no debe encontrar un solo valor que sirva para entrar: enlaces, invitaciones, sesiones, códigos de recuperación, enlaces de descarga, claves de API, código corto, acceso de emergencia. Una huella simple (hash) basta para valores de alta entropía, pero **no** para un código corto de 8 caracteres.

## Opciones
1. SHA-256 simple. Insuficiente para el código corto (40 bits): con la base filtrada se prueba por fuerza bruta fuera de línea.
2. bcrypt o argon2. Descartada: lento por petición y innecesario para valores aleatorios.
3. **HMAC-SHA-256 con una llave ("pepper") derivada de la maestra**, fuera de la base. Elegida: determinista (permite buscar por huella) y no reproducible sin la llave.

## Decisión

### Huella
`huella(tipo, valor) = "v<versión>:" + base64url(HMAC-SHA-256(pepper_tipo, valor))`, con `pepper_tipo` derivado de la llave maestra (ADR-07). Es la **única** función que produce lo que se guarda de un valor de entrada. La versión permite rotar. El valor en claro solo existe en el correo o en la pantalla de su dueño.

### Código corto para abrir el enlace en otro dispositivo (D-073.4)
1. La persona pide el enlace en el computador (navegador A). La pantalla de espera muestra siempre un **código de 8 caracteres** de un alfabeto de 32 símbolos sin ambiguos (sin 0/O, 1/I/L), 40 bits, con aviso "No comparta este código".
2. Abre el correo en el celular (dispositivo B). El enlace no está atado a B, así que B pide el código; la persona lo escribe y la sesión nace **en B**.
3. Se guarda solo su huella dentro de `enlace_ingreso`. Mismo vencimiento (15 min) y un solo uso que el enlace. **Máximo 5 intentos** y el enlace queda invalidado; comparación en tiempo constante; tope por IP en el limitador (ADR-16).
4. Si no hay código, la persona pide un enlace nuevo en el mismo dispositivo.

Seguridad analiza: 5 intentos sobre 2^40 combinaciones, y el atacante además debe tener el enlace; con huella con pepper no hay ataque fuera de línea. El riesgo restante es ingeniería social (que la víctima lea el código a un atacante): se mitiga con el aviso y el correo de "se inició sesión". El Diseñador define la pantalla.

### Prueba RS-51 en integración continua
Objetivo: **la base no contiene ningún valor que sirva directamente para entrar.**
1. Un registro en código, `VALORES_DE_ENTRADA`, lista cada columna que guarda una huella (tabla.columna).
2. La prueba ejecuta los **flujos reales** con el correo de captura: enlace de ingreso, invitación, sesión, códigos de recuperación, clave de API, enlace de descarga, código corto, acceso de emergencia; y conserva los valores en claro que cada flujo produjo (del correo, de la respuesta o de la pantalla).
3. Vuelca **todas** las tablas (cada fila convertida a texto, incluidas auditoría, eventos, `cola.*` y las del soporte) y la salida de los registros técnicos, y exige **cero apariciones** de cada valor en claro.
4. **Control positivo:** antes de dar por buena la búsqueda, planta un valor en una columna de prueba y comprueba que la búsqueda **lo encuentra**. Sin este paso una prueba rota pasaría en verde.
5. Falla si existe una columna cuyo nombre case `token|secret|codigo|clave|enlace` y no esté en `VALORES_DE_ENTRADA` (ni en la lista de excepciones revisada por Seguridad).
6. La semilla TOTP en claro tampoco debe aparecer (se guarda cifrada, ADR-07).

## Consecuencias
- Rotar el pepper invalida los valores vivos de ese tipo (enlaces, sesiones): se hace con la versión en el prefijo y un periodo de convivencia corto.
- Perder la llave maestra obligaría a que todos vuelvan a ingresar (aceptable) y a regenerar las claves de API.
- La prueba RS-51 es lenta; corre en cada cambio sobre una base pequeña inventada.

## Qué prueba lo valida
- La propia prueba RS-51 (con su control positivo), H8 del prototipo.
- Código corto (CA-068): 5 intentos y muere; código de otro enlace no sirve; vencido no sirve; tiempos de respuesta similares con código correcto e incorrecto.
