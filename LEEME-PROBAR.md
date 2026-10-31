# Cómo probar la plataforma en su computadora (Versión local 0.1)

**Para quién es esta guía:** para usted, sin conocimientos técnicos. Son 8 pasos y la mayor parte es esperar.

> **Importante, léalo primero**
> - Esta es una **versión de prueba**. Todos los datos que verá (empresas, personas, correos, equipos) son **inventados**.
> - **No escriba datos reales** de su empresa ni de sus clientes. Esta versión no está hecha para guardarlos.
> - Funciona **solo en su computadora**: nadie más puede abrirla desde otra computadora ni desde internet.
> - Es un avance para enseñarle cómo se ve y cómo funciona. La Jefatura de Proyecto le dirá qué partes ya fueron revisadas y cuáles todavía no.

## Lo que necesita
- Una computadora con **Windows 10 u 11**.
- Conexión a internet (solo la primera vez, para descargar).
- Unos **5 GB libres** en el disco y unos **20 a 30 minutos** la primera vez (después, 1 o 2 minutos).

---

## Paso 1. Instalar Docker Desktop (una sola vez)
Docker Desktop es el programa que "enciende" la plataforma dentro de su computadora sin ensuciarla. Es gratuito para uso personal y de prueba.

1. Entre a **https://www.docker.com/products/docker-desktop/** y pulse **«Download for Windows»**.
2. Abra el archivo descargado (`Docker Desktop Installer.exe`) y acepte todo lo que pregunte. Si pregunta por **WSL 2**, déjelo marcado (es una parte de Windows que Docker usa por dentro; no tiene que hacer nada con ella).
3. Al terminar, si le pide **reiniciar la computadora**, reiníciela.
4. Si le pide crear una cuenta o iniciar sesión, puede elegir **«Skip»** (omitir). No la necesita.

## Paso 2. Abrir Docker Desktop y esperar
1. Abra **Docker Desktop** desde el menú Inicio.
2. Espere hasta que, abajo a la izquierda, diga **«Engine running»** (o «Docker Desktop is running») en verde. Puede tardar 1 o 2 minutos.
3. **Déjelo abierto** mientras prueba la plataforma.
4. Docker debe estar en modo **«contenedores de Linux»** (es lo normal). Si `iniciar.bat` le avisa que está en «contenedores de Windows», haga clic derecho en el icono de Docker (la ballena, junto al reloj) y elija **«Switch to Linux containers…»**.

*Si Docker le dice que falta activar la «virtualización» o «WSL 2», vea «Problema 1» más abajo.*

## Paso 3. Recibir la plataforma
1. La Jefatura de Proyecto le entrega directamente un archivo **ZIP** llamado `Plataforma-TI-version-local-0.1.zip` (por correo o por el medio que acordaron). Descárguelo. *(Alternativa, solo si la Jefatura se lo indica: entrar al enlace del repositorio de GitHub, pulsar el botón verde **«Code»** y luego **«Download ZIP»**, asegurándose de estar en la rama que la Jefatura indique.)*
2. Cuando termine, busque el archivo ZIP en «Descargas», haga clic derecho y elija **«Extraer todo…»** y luego **«Extraer»**. (No lo abra "dentro" del ZIP: tiene que extraerlo.)
3. Se creará una carpeta. Entre en ella: debe ver, entre otros, los archivos `iniciar.bat` y `detener.bat`.

## Paso 4. Encender la plataforma
1. Haga **doble clic en `iniciar.bat`**.
2. Si Windows muestra **«Windows protegió su PC»**: pulse **«Más información»** y luego **«Ejecutar de todas formas»**. Es normal con archivos descargados.
3. Se abre una ventana negra con mensajes en español. **No la cierre.** **La primera vez descarga e instala todo y puede tardar varios minutos** (hasta 20 o 30 si su internet es lenta). Es normal que parezca detenida.
4. Al terminar, dice **«La plataforma está lista»** y se abre sola una página en su navegador.

## Paso 5. Abrir la plataforma
Si la página no se abrió sola, abra su navegador y escriba: **http://localhost:3000**

## Paso 6. Entrar (sin contraseña)
No hay contraseñas en esta versión. Escriba uno de los correos de ejemplo, pulse el botón, y aparecerá un **enlace en la misma pantalla** (en la versión real llegará por correo). Pulse **«Entrar»**.

| Correo de ejemplo | Quién es | Empresa(s) |
|---|---|---|
| `ceo@demo.local` | Administrador (ve todo) | Alfa y Beta |
| `jefa@alfa.local` | Jefatura de TI (ve todo y aprueba compras) | Alfa |
| `tecnico@alfa.local` | Técnico (registra y asigna equipos) | Alfa |
| `consulta@alfa.local` | Consulta (solo mira) | Alfa |
| `admin@beta.local` | Administrador de Beta | Beta |
| `tecnico@beta.local` | Técnico de Beta | Beta |

Para empezar, entre con **`ceo@demo.local`**: podrá cambiar entre las empresas **Alfa** y **Beta**. Fíjese en que cada empresa solo ve **sus** datos, aunque tengan códigos iguales.

## Paso 7. Qué probar (el recorrido sugerido)
1. Entre como `ceo@demo.local` y cambie de Alfa a Beta.
2. En Alfa, cree un rol llamado «Solo lectura», invite a un usuario con ese rol y entre con él: no podrá crear nada. **Al invitar, use siempre un correo inventado que termine en `.local`** (por ejemplo `prueba@alfa.local`). No escriba correos de personas reales: esta versión es solo para datos inventados.
3. Compare el equipo `LAP-0001` de Alfa con el `LAP-0001` de Beta: son distintos.
4. Cree una categoría con campos propios (por ejemplo «Impresoras») y un artículo con código automático; luego cambie el código a mano.
5. Registre equipos con número de serie, asígnelos a una persona y devuélvalos.
6. Mire la pantalla de **Auditoría**: quedó escrito quién hizo cada cosa.
7. Si ya está disponible: cree una orden de compra; verá que **usted mismo no puede aprobarla**, la aprueba otra persona y luego se recibe.

*Puede equivocarse y probar sin miedo: todo se puede borrar y volver a empezar (ver el Paso 8).*

## Paso 8. Apagar o empezar de nuevo
- **Apagar** (guarda lo que hizo): doble clic en **`detener.bat`**. Para volver a encender, de nuevo `iniciar.bat` (esta vez tarda 1 o 2 minutos).
- **Empezar de nuevo** (borra todo lo que usted creó y deja solo los datos de ejemplo): doble clic en **`reiniciar-datos.bat`**. Le pedirá escribir la palabra **BORRAR** para confirmar.
- Cerrar la ventana negra no apaga la plataforma; para apagarla use `detener.bat`.
- **No borre el archivo `.env`** que aparece en la carpeta (se crea solo la primera vez): si lo borra, la plataforma no podrá entrar a sus datos; en ese caso use `reiniciar-datos.bat`.
- Cuando termine de probar y quiera quitar todo de su computadora, avise a la Jefatura de Proyecto y le indicará cómo.

---

## Si algo falla (cuatro problemas típicos)

**Problema 1. Docker no abre o dice que falta «virtualización» / «WSL 2».**
Su computadora necesita tener activada una función llamada *virtualización*. En muchos equipos ya viene activa. Si Docker se lo pide: (a) reinicie la computadora y vuelva a abrir Docker Desktop; (b) si sigue igual, escriba «activar características de Windows» en el menú Inicio y marque **«Plataforma de máquina virtual»** y **«Subsistema de Windows para Linux»**, acepte y reinicie; (c) si todavía no funciona, puede que haya que activarla en la configuración de arranque del equipo (BIOS): **no la toque solo, avise a la Jefatura de Proyecto**.

**Problema 2. La ventana dice «El puerto 3000 ya está en uso por otro programa».**
La plataforma necesita el «puerto» 3000 (una especie de puerta de su computadora) y otro programa ya lo está usando. No es un problema de internet ni de Docker. Qué hacer: (a) cierre los programas que tenga abiertos para desarrollo o servidores locales; (b) si no sabe cuál es, reinicie la computadora y haga doble clic en `iniciar.bat` **antes** de abrir otros programas; (c) si sigue igual, haga una **foto o captura de la ventana** y envíela.

**Problema 3. La ventana dice que la plataforma «no respondió a tiempo».**
Espere un minuto y vuelva a hacer doble clic en `iniciar.bat`; la segunda vez suele tardar mucho menos. Si sigue igual, haga una **foto o captura de la ventana** (incluye los últimos mensajes) y envíela.

**Problema 4. Se queda mucho tiempo descargando o dice que no pudo descargar.**
Revise que tenga internet y que Docker Desktop siga abierto; vuelva a hacer doble clic en `iniciar.bat` (retoma desde donde quedó). La primera vez puede tardar bastante si el internet es lento.

**Cómo avisarnos:** envíe a la **Jefatura de Proyecto** una **captura de pantalla de la ventana negra** y diga en qué paso estaba. No hace falta que entienda lo que dice: nosotros sí.

**Plan B:** si a la hora de la prueba no logra encenderla, la Jefatura de Proyecto le mostrará la plataforma compartiendo su pantalla (será en nuestro equipo, no en el suyo; se lo avisaremos).
