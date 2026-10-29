# Piloto gratuito: dónde vive la base de datos y dónde se publica la plataforma

**Versión:** 0.1 (propuesta de la Jefatura de Proyecto, 2026-10-29) · **Pedido del CEO:** «ver dónde estará la base de datos y dónde se publicará la plataforma; como es nuestro primer proyecto, debe ser gratuito, para hacer pruebas con clientes como prototipo».
**Estado:** propuesta. Falta la ratificación del Gerente de TI y el detalle paso a paso de DevOps.
**Cómo leer las cifras:** todas vienen de páginas de terceros encontradas en una búsqueda del 2026-10-29. **Ninguna está verificada en la página oficial** (esta sesión no puede abrir `neon.com`, `supabase.com` ni `render.com`). Los planes gratuitos cambian seguido: antes de crear cuentas, quien las cree confirma cada cifra en la página oficial indicada en la sección 6.

## 1. En pocas palabras (para el CEO)

- **Sí se puede hacer gratis** para probar con clientes, con un límite importante: **solo con datos de ejemplo, nunca con datos reales de sus empresas.** Los servicios gratuitos no ofrecen copias de seguridad de calidad, se duermen cuando nadie los usa y pueden cambiar sus condiciones. Además, todavía no se cumplen las ocho condiciones legales previas a datos reales (hoja del CEO).
- **Recomendación:** base de datos en **Neon** (plan gratuito), aplicación en **Render** (plan gratuito) y correos con **Resend** (plan gratuito). Todo con una sola cuenta de correo de la empresa como dueña.
- **Lo que no es gratis y te tocaría decidir** (poco dinero, pero dinero): un **nombre de dominio propio** (para que los correos de acceso lleguen bien y la dirección se vea profesional) y, si quieres que el chat con Claude funcione en el piloto, **un crédito prepagado pequeño con tope en la cuenta de la API de Anthropic**. Sin eso el piloto funciona igual, con el chat apagado y el formulario normal de «Pedir ayuda».
- **Qué se nota al usarlo:** si nadie entra durante unos minutos, la aplicación «se duerme» y la primera visita tarda cerca de un minuto en despertar. Para una demo se resuelve entrando un par de minutos antes.

## 2. Qué necesita la plataforma (según nuestras decisiones)

La arquitectura (`docs/arquitectura/`, ADR-01 a ADR-24) pide: una aplicación web en Node, una base **PostgreSQL** real (con varios roles de base y seguridad por fila), un proceso que trabaja en segundo plano (cola de trabajos), tareas programadas y envío de correos con enlace de acceso. Todo servicio gratuito elegido debe poder con eso, o necesitamos un «modo piloto» que lo simplifique (sección 5).

## 3. Opciones revisadas

| Pieza | Opción | Lo bueno | Lo malo | Veredicto |
|---|---|---|---|---|
| Base de datos | **Neon** (plan gratuito) | PostgreSQL real; se «duerme» y despierta sola en segundos; 100 proyectos y ramas (útil para entornos de prueba) | Almacenamiento chico (0,5 GB; una fuente dice que subió a 1 GB en septiembre 2026); poca historia de recuperación (6 horas); horas de cálculo limitadas (100 CU-horas) | **Recomendada** |
| Base de datos | Supabase (plan gratuito) | Más herramientas incluidas | **Se pausa tras 1 semana sin uso** (hay que reactivarla a mano: mala idea para demos); solo 2 proyectos | Descartada para el piloto |
| Aplicación | **Render** (servicio web gratuito) | Corre Node completo (sin restricciones raras); sin tarjeta según fuentes de terceros | Se duerme a los 15 min sin tráfico; tarda ~1 min en despertar; horas mensuales limitadas; sin proceso de segundo plano gratuito | **Recomendada** |
| Aplicación | Vercel (plan Hobby) | Muy fácil con Next.js | **Prohíbe uso comercial**: según sus condiciones, probar con clientes de una empresa cuenta como comercial; exige plan de pago | Descartada |
| Aplicación | Cloudflare (Workers) | Plan gratuito generoso; sin dormirse | Obliga a adaptar Next.js y limita lo que el servidor puede hacer; riesgo para nuestro diseño; condiciones comerciales no verificadas | Plan B |
| Todo en un servidor | Oracle Cloud (siempre gratis) | Un servidor real gratis donde cabe todo (base, aplicación y trabajador) | Fuentes contradictorias sobre cuánto regalan hoy (4 o 2 núcleos); **reclama equipos poco usados**; exige tarjeta; hay que administrarlo | Plan C (más trabajo) |
| Correos | **Resend** (plan gratuito) | 3.000 al mes (máx. 100 al día), 1 dominio | Sin dominio propio no se pueden enviar a correos de clientes; 100 al día alcanza para un piloto chico | **Recomendada** |
| Tareas programadas | GitHub Actions (cron) | Gratis en nuestro repositorio | Precisión de minutos, no de segundos | Recomendada |

## 4. Recomendación

**Piloto = Neon (base) + Render (aplicación web) + Resend (correos) + GitHub Actions (tareas programadas)**, con:
1. **Un solo entorno «piloto»**, separado del futuro entorno de producción, con datos de ejemplo cargados por el generador de datos (dos empresas ficticias).
2. **Cada cliente de prueba entra como una empresa de ejemplo.** No se carga su inventario real, sus nombres de empleados reales ni sus correos reales de empleados salvo los de las personas que prueban (su correo, con su permiso).
3. **Un acuerdo breve de prueba** con cada cliente: es un prototipo, los datos son de ejemplo, no hay garantía de servicio. [ESCALAR AL CEO: confirmar con abogado] el texto.
4. **Cuando algo del plan gratuito cambie o se agote**, el piloto se mueve a producción de pago según el plan de entornos (`plan-entornos-y-costos.md`).

## 5. Qué cambia en la arquitectura para el piloto («modo piloto»)

- **Trabajador en segundo plano:** Render no regala procesos de segundo plano. En el piloto el trabajador corre **dentro de la misma aplicación** y se dispara además con una llamada programada desde GitHub Actions (el disparador manual ya previsto en ADR-02 y `prototipo-tecnico.md`). Es una simplificación de piloto; en producción vuelve a ser un proceso aparte (ADR-01).
- **Roles de base de datos:** hay que comprobar que Neon permite crear los cinco roles y las políticas por fila (debería, es PostgreSQL estándar; es la **primera prueba** del piloto: si falla, se pasa al plan B).
- **Aplicación dormida:** la primera visita tras un descanso tarda; la pantalla debe mostrar «despertando, un minuto» en vez de un error (pedido al Diseñador).
- **Chat con Claude:** apagado por defecto en el piloto (módulo activable por empresa, ya previsto). Se enciende solo si el CEO aprueba un crédito con tope.
- **Copias de seguridad:** el plan gratuito no las garantiza. Como solo hay datos de ejemplo, **la copia es el generador de datos**: el piloto se reconstruye en minutos.
- **Llaves y secretos:** igual que en producción; viven en las variables secretas de Render y de GitHub, **nunca en el repositorio** (regla 4 del equipo).

## 6. Páginas oficiales donde confirmar cada cifra (antes de crear cuentas)

| Dato a confirmar | Página oficial |
|---|---|
| Neon: almacenamiento, horas de cálculo, roles, uso comercial | https://neon.com/pricing y https://neon.com/docs |
| Render: dormirse, horas al mes, límites, uso comercial | https://render.com/docs/free y https://render.com/pricing |
| Resend: límite diario, dominios | https://resend.com/pricing |
| GitHub Actions: minutos gratis en repositorios privados | https://docs.github.com/billing |
| Vercel: por qué se descarta | https://vercel.com/docs/limits/fair-use-guidelines |
| Oracle (plan C): cuánto regalan hoy | https://docs.oracle.com/en-us/iaas/Content/FreeTier/resourceref.htm |
| Cloudflare (plan B): límites y condiciones | https://developers.cloudflare.com/workers/platform/pricing/ |

## 7. Qué decide o aporta el CEO

1. **Aprobar el piloto gratuito con datos de ejemplo** (esta propuesta).
2. **Una cuenta de correo de la empresa** que sea dueña de las cuentas de Neon, Render, Resend y GitHub, con una segunda persona como suplente (no cuentas personales).
3. **[ESCALAR AL CEO, dinero]** nombre de dominio propio (costo anual pequeño; la cifra se verifica con el vendedor elegido antes de comprar).
4. **[ESCALAR AL CEO, dinero]** crédito prepagado con tope para el chat con Claude (opcional para el piloto).
5. **[ESCALAR AL CEO: confirmar con abogado]** el texto del acuerdo de prueba con cada cliente.

## 8. Riesgos del piloto gratuito

| # | Riesgo | Mitigación |
|---|---|---|
| 1 | Un cliente carga datos reales aunque se pidió que no | Aviso visible en el piloto, pantalla de «solo datos de ejemplo» y el acuerdo de prueba |
| 2 | El plan gratuito cambia o se acaba a mitad de una prueba | Piloto reconstruible en minutos; plan B y C documentados |
| 3 | La aplicación dormida da mala primera impresión | Mensaje de «despertando», y entrar antes de cada demo |
| 4 | Neon no soporta algún rol o política del aislamiento por empresa | Es la primera prueba; si falla, pasar al plan C (servidor propio) |
| 5 | El correo de acceso cae en «no deseado» sin dominio propio | Comprar el dominio y configurar SPF, DKIM y DMARC (ya en el plan de DevOps) |

## 9. Historial de cambios

| Fecha | Versión | Cambio | Autor |
|---|---|---|---|
| 2026-10-29 | 0.1 | Primera versión: comparación de opciones gratuitas, recomendación y modo piloto | Jefatura de Proyecto |
