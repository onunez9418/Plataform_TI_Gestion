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
2. Abra el archivo descargado (`Docker Desktop Installer.exe`) y acepte todo lo que pregunte. Si pregunta por **WSL 2**, déjelo marcado.
3. Al terminar, si le pide **reiniciar la computadora**, reiníciela.
4. Si le pide crear una cuenta o iniciar sesión, puede elegir **«Skip»** (omitir). No la necesita.

## Paso 2. Abrir Docker Desktop y esperar
1. Abra **Docker Desktop** desde el menú Inicio.
2. Espere hasta que, abajo a la izquierda, diga **«Engine running»** (o «Docker Desktop is running») en verde. Puede tardar 1 o 2 minutos.
3. **Déjelo abierto** mientras prueba la plataforma.

*Si Docker le dice que falta activar la «virtualización» o «WSL 2», vea «Problema 1» más abajo.*

## Paso 3. Descargar la plataforma
1. Abra el enlace del repositorio que le envió la Jefatura de Proyecto. (Si la Jefatura le envió directamente un archivo ZIP, salte al punto 3.)
2. Pulse el botón verde **«Code»** y luego **«Download ZIP»**. Asegúrese de estar en la versión (rama) que la Jefatura le indicó.
3. Cuando termine, busque el archivo ZIP en «Descargas», haga clic derecho y elija **«Extraer todo…»** y luego **«Extraer»**. (No lo abra "dentro" del ZIP: tiene que extraerlo.)
4. Se creará una carpeta. Entre en ella: debe ver, entre otros, los archivos `iniciar.bat` y `detener.bat`.

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
2. En Alfa, cree un rol llamado «Solo lectura», invite a un usuario con ese rol y entre con él: no podrá crear nada.
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

---

## Si algo falla (tres problemas típicos)

**Problema 1. Docker no abre o dice que falta «virtualización» / «WSL 2».**
Su computadora necesita tener activada una función llamada *virtualización*. En muchos equipos ya viene activa. Si Docker se lo pide: (a) reinicie la computadora y vuelva a abrir Docker Desktop; (b) si sigue igual, escriba «activar características de Windows» en el menú Inicio y marque **«Plataforma de máquina virtual»** y **«Subsistema de Windows para Linux»**, acepte y reinicie; (c) si todavía no funciona, puede que haya que activarla en la configuración de arranque del equipo (BIOS): **no la toque solo, avise a la Jefatura de Proyecto**.

**Problema 2. La ventana dice que la plataforma «no respondió a tiempo» o que el puerto 3000 está ocupado.**
Otro programa puede estar usando el mismo espacio. Cierre programas que haya abierto para desarrollo, espere un minuto y vuelva a hacer doble clic en `iniciar.bat`. Si sigue, haga una **foto o captura de la ventana** y envíela.

**Problema 3. Se queda mucho tiempo descargando o dice que no pudo descargar.**
Revise que tenga internet y que Docker Desktop siga abierto; vuelva a hacer doble clic en `iniciar.bat` (retoma desde donde quedó). La primera vez puede tardar bastante si el internet es lento.

**Cómo avisarnos:** envíe a la **Jefatura de Proyecto** una **captura de pantalla de la ventana negra** y diga en qué paso estaba. No hace falta que entienda lo que dice: nosotros sí.

**Plan B:** si a la hora de la prueba no logra encenderla, la Jefatura de Proyecto le mostrará la plataforma compartiendo su pantalla (será en nuestro equipo, no en el suyo; se lo avisaremos).
