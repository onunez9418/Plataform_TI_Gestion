# Arranque desde cero con Docker real · Versión local 0.1

**Responsable:** DevOps. **Fecha y hora:** viernes 30/10/2026, 22:35 hora de Lima (03:35 UTC del 31/10).
**Commit probado:** `33eaa87` (rama `claude/gifted-pascal-ptgxae`; incluye los límites de enlaces de la versión local, `5a6c185`, y el cambio del healthcheck de la base, `70c4d1b`).
**Resultado: 0 fallas, 14 de 14 casos de aislamiento.**

## Cómo se probó
`sh scripts/probar-arranque-limpio.sh claude/gifted-pascal-ptgxae --sandbox`: clona el commit en una carpeta nueva (sin `node_modules`, sin `.env`), construye la imagen, crea `.env` con contraseñas aleatorias, enciende con Docker Compose y comprueba lo de la tabla. Docker Engine 29.9.2 sobre Linux. El modo `--sandbox` solo cambia **cómo se descarga** (por el proxy del entorno de pruebas); la imagen, el compose y el arranque son los mismos que usa `iniciar.bat`. Al terminar se apagan los contenedores y se borran el volumen y la carpeta temporal (verificado: no queda nada).

## Resultado (todo `[OK]`)
| Comprobación | Resultado |
|---|---|
| Clon limpio, sin `node_modules` ni `.env`; `.env` está en `.gitignore` | OK |
| Imagen construida; `docker compose up` termina bien | OK |
| Salud (`/api/salud`) responde | OK, 14 s después del `up` (la construcción de la imagen fue aparte, ~2 min con la caché de capas base) |
| Migraciones aplicadas con el rol dueño | OK |
| Semilla cargada en base vacía; la página de inicio muestra los usuarios de ejemplo | OK |
| Aplicación publicada solo en `127.0.0.1:3000`; la base NO publicada | OK |
| Aislamiento entre empresas (`prisma/verificar-aislamiento.sql` como `app_empresa`) | OK, **14 casos PASA** |
| Reiniciar la app conserva los datos (no vuelve a sembrar) | OK |
| Guarda de `MODO_LOCAL`: con base externa el contenedor se niega a arrancar | OK |
| La app en marcha no recibe la clave del rol dueño de la base | OK |

Tiempo total de la prueba: 2 min 38 s.

## Lo que ocurrió antes (para que se sepa)
1. **Primer intento (commit `ab212da`) inválido por choque entre dos pruebas.** Otra sesión de DevOps ejecutó la misma prueba a la vez en el mismo Docker. Ambas usaban el mismo nombre de proyecto y el mismo puerto, y una recreó los contenedores de la otra («container name already in use»). No fue un defecto del producto. Corregido en `33eaa87`: la prueba ahora usa un cerrojo (una sola a la vez) y un nombre de proyecto propio, de modo que su limpieza nunca toca contenedores ajenos.
2. **Segundo intento: Docker Hub respondió `429 Too Many Requests`** al consultar la imagen base `node:22-bookworm` (límite de descargas anónimas, agotado por las dos pruebas simultáneas). Era pasajero: `docker pull` funcionó minutos después. En la computadora del CEO esto casi no ocurre (una sola descarga); si ocurriera, `iniciar.bat` dice que no pudo descargar y basta repetirlo.
3. **Tercer intento (`a43a567`)** pasó todas las comprobaciones de la aplicación, pero se descartó porque una tercera corrida ajena tocó los contenedores durante el `up`. La corrida válida es la de `33eaa87`, descrita arriba.

## Lo que esta prueba NO demuestra
- No se probó en **Windows ni con Docker Desktop** (no hay Windows en el entorno del equipo). `iniciar.bat`, `detener.bat` y `reiniciar-datos.bat` se revisaron por lectura; el CEO es quien lo prueba por primera vez en Windows. Plan B en la guía: la Jefatura comparte pantalla.
- Los tiempos de descarga de la primera vez en una conexión doméstica.

## Si entra otra corrección antes de entregar
Repetir el comando de arriba (tarda unos 3 a 10 minutos) y anotar aquí el nuevo hash. No ejecutar dos pruebas a la vez.
