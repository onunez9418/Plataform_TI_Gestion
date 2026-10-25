# Prototipo de la Plataforma de Gestión de Áreas de TI

**Para el Cliente (CEO).** Esto es una maqueta que se abre en el navegador y se puede tocar. Sirve para que usted vea cómo será la plataforma **antes** de programarla y diga si le gusta.

- Todos los datos son **inventados** (personas, equipos, empresas). No hay nada real.
- **No guarda nada.** Si recarga la página, todo vuelve a empezar. Las acciones (aprobar, recibir, entregar) solo se simulan.
- No necesita instalar nada ni conexión a internet.

## Cómo abrirlo

1. Abra la carpeta `docs/prototipo/`.
2. Haga **doble clic en `index.html`**. Se abre en su navegador (Chrome, Edge, Firefox o Safari).
3. Arriba hay una franja amarilla con los controles del prototipo:
   - **Probar como:** elige quién es usted (Administrador, Jefatura TI, Técnico, Almacén, Solicitante, Solo lectura, Empleado del portal o Administrador de plataforma). **Al cambiarlo cambian el menú y lo que se puede hacer**, igual que en la plataforma real.
   - **Empresa:** hay dos empresas de ejemplo. Cada una ve solo sus datos. La empresa en la que trabaja se ve siempre en la barra azul, arriba a la izquierda.
   - **Modo oscuro / Modo claro:** cambia los colores de toda la plataforma.
   - **Lista de pantallas:** todas las pantallas del prototipo, con un enlace a cada una y el rol con el que se ven mejor.
   - **Guía visual:** colores, botones, etiquetas y mensajes, todo en una sola página.

Para verlo como en un celular, achique la ventana del navegador o ábralo desde el celular: se adapta.

## Qué rol probar primero

1. **Jefatura TI:** verá lo que espera su decisión («Por aprobar»). Es la persona que aprueba compras.
2. **Almacén:** verá lo que espera mercadería («Por recibir») y la pantalla más importante: **recibir 40 laptops con sus números de serie**.
3. **Técnico:** entrega equipos a las personas y ve su trabajo del día.
4. **Administrador:** configura usuarios, permisos y mira la auditoría.

## 10 cosas que le pedimos mirar

Para cada una, diga **«sí»**, **«no»** o **«cambiar»** (y qué).

1. **Recibir mercadería con series** (rol Almacén → «Recibir mercadería» en la orden OC-000205).
   Use «Ejemplo con errores»: las series repetidas, las que ya existen y las dañadas por Excel se marcan **con texto en cada fila**. Mientras haya un error, el botón **Confirmar** queda apagado y dice por qué. Es «todo o nada»: no se crea ningún activo a medias. ¿Se entiende? ¿Es cómodo pegar una lista?
2. **Aprobar una compra** (rol Jefatura TI → «Por aprobar» → OC-000212).
   ¿Ve a simple vista el monto, el proveedor y quién la pidió? Después pruebe con el rol Administrador la orden **OC-000218**, que preparó él mismo: el botón «Aprobar» está apagado y **dice por qué** (nadie aprueba lo que preparó).
3. **Los estados con texto y color** (cualquier lista de activos, o la «Guía visual»).
   Cada estado (En stock, Asignado, En reparación, Aprobada…) lleva **una palabra y un icono**, no solo color. ¿Se distinguen bien? ¿Los colores le gustan?
4. **Los tres mensajes** (menú de la «Lista de pantallas» → «Mensajes de error, permiso y bloqueo»).
   «No encontrado», «No tiene permiso» y «No se puede por una regla». ¿Son claros y amables?
5. **Botón «Exportar» apagado con la razón** (rol Jefatura TI → Artículos).
   El botón se ve, pero apagado, y debajo dice qué permiso falta. ¿Prefiere que se vea apagado o que no aparezca?
6. **Ficha de un artículo (SKU) y de un activo** (rol Técnico → Artículos → Celular Samsung; luego un activo).
   Los datos que valen para todo el modelo (RAM) están separados de los datos de **cada unidad** (IMEI, serie). ¿Encuentra rápido lo que busca? ¿Le sirven las pestañas?
7. **Entregar un equipo y el acta** (rol Técnico → «Entregar equipo»).
   Cuatro pasos cortos, y al final un acta para imprimir y firmar. ¿Falta algún dato en el acta?
8. **Importar el Excel actual** (rol Administrador → «Importar datos»).
   La vista previa dice **fila, columna y motivo** de cada error. Con errores no se puede confirmar. ¿Le da confianza?
9. **Permisos de cada rol** (rol Administrador → «Roles y permisos»).
   Una matriz con todos los permisos por rol. Use «Solo permisos sensibles» y elija un rol para ver su resumen. ¿Es entendible para quien administra? ¿Se debe simplificar?
10. **La empresa activa, la segunda verificación y el celular.**
    La empresa siempre se ve arriba. Quien aprueba dinero tiene un aviso de **segunda verificación** (rol Jefatura TI → «Por aprobar»; pruebe «Mi cuenta y seguridad»). En «Lista de pantallas» también están el **ingreso con código corto** (cuando se abre el correo en otro dispositivo) y **«Primeros pasos»** de una empresa nueva (rol Administrador, empresa «Clínica Santa Aurora»). ¿Está bien el nivel de seguridad? ¿Se usa bien en el celular?

## Qué es de la versión 1 y qué es solo una muestra

- **Versión 1 (lo que se construirá primero):** acceso, empresas, usuarios y permisos, personas, catálogos, artículos, inventario, importación del Excel, órdenes de compra y recepción, órdenes de servicio y auditoría.
- **Muestras (marcadas «Fase 2» o «Fase 3» en el menú):** mesa de ayuda, vencimientos, licencias, presupuesto, mapa de servicios, cambios, portal del empleado y avisos. Se incluyen solo para que vea cómo serán; **no** se construyen en la primera versión.

## Lo que este prototipo no hace

- No guarda datos ni envía correos. Los correos, las firmas, los PDF y la segunda verificación se **simulan**.
- Los textos de privacidad y legales son **provisionales**: los redacta o revisa un abogado.
- Los textos de «Pedir ayuda» y algunos mensajes pueden ajustarse tras su opinión.

## Para el equipo técnico

- Todo el estilo (colores de los dos modos, tipografía, espaciado, componentes) está en **`assets/estilos.css`**, listo para reutilizar. Los siete grupos de color de estado y su contraste están en la «Guía visual».
- La matriz de permisos sale del **registro único de permisos** (`assets/permisos.js`, generado). `assets/permisos-ajustes.js` aplica la decisión D-068 (16 permisos más sensibles, PS-232 y PS-233) mientras el registro no se actualice.
- Las capturas de ejemplo están en `capturas/`.
