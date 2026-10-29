# ADR-14 · Estructura de carpetas, capa de servicios y registro de módulo (T-10)

**Estado:** Propuesto (revisado 2026-10-29 tras Seguridad ronda 5) · **Decide:** Gerente de TI · **Base:** D-038.6, H-ARQ-09, H-ARQ-11, D-062; H-SEG-36, 42, 50

## Contexto
El cese de una Persona (Etapa 2) debe consultar activos, líneas, licencias, casos y tareas de módulos que llegan años después. Si cada módulo importa al otro hay dependencias circulares.

## Decisión

### Carpetas
```
src/
  app/                  rutas de Next.js: e/[empresa]/..., plataforma/ (solo en el despliegue
                        `consola`, ADR-01), api/
  nucleo/               acceso, aislamiento, permisos, auditoria, secretos, cola, eventos,
                        contadores, dinero, calendario, campos, importacion, exportacion,
                        doble-control, limitador, correo, observabilidad
  modulos/<modulo>/     index.ts (interfaz pública), servicios/, repos/, eventos.ts,
                        permisos.ts, registro.ts, pruebas/
  db/                   migraciones/, macros/, funciones-globales/, objetos-solo-sql.md
  trabajador/           arranque del proceso trabajador
```

### Reglas
1. Las rutas y acciones llaman **solo** a servicios definidos con `definirServicio` (ADR-10). Las reglas de negocio viven únicamente ahí.
2. Solo `repos/` toca datos, y siempre dentro de `conEmpresa` (ADR-03). El cliente de Prisma no se importa fuera de `nucleo/aislamiento`.
3. Un módulo importa de otro **solo su `index.ts`**; `nucleo` no importa `modulos`.
4. **Registro de módulo:** al arrancar, cada módulo declara en `registro.ts`: sus permisos, eventos que emite y escucha, **pendientes de la persona**, proveedores de búsqueda global, de vencimientos (calendario y avisos), de fuentes de costo, de indicadores, plantillas de importación y claves de contador, **limpieza al anonimizar** (escucha síncrono, ADR-12) y **herramientas del asistente** con su permiso, parámetros y proyección de campos (ADR-22; `nucleo` no importa módulos y el asistente las obtiene por el registro). Personas consulta `registro.pendientesDe(persona)`, sin importar a los módulos de después. Un módulo ausente simplemente no aporta nada.
5. **Eventos:** lo que protege la integridad corre síncrono en la misma transacción; avisos y espejos, asíncronos por la cola (ADR-02).
6. `modulo_activo(empresa, módulo)` y una sola comprobación en `exigirPermiso`.
7. **Prueba de arquitectura en CI** (`dependency-cruiser`): sin ciclos, sin importaciones profundas, `nucleo` sin dependencias hacia `modulos`, solo `nucleo/aislamiento` importa Prisma, solo `nucleo/cola` importa la librería de cola.
8. Los cuatro módulos que necesitan "preguntarle a todos" (cese, búsqueda, vencimientos, costos) usan el registro, nunca imports.
9. **Reglas de código con prueba en integración continua (H-SEG-36):** ninguna llamada a `$queryRawUnsafe` ni `$executeRawUnsafe`; SQL crudo solo con parámetros; `set_config` y `SET` solo dentro de `nucleo/aislamiento` (y en las funciones de la lista cerrada de ADR-04); prohibidos `SET` de sesión, `pg_advisory_lock` de sesión y tablas temporales (ADR-03).
10. **Un módulo se activa por despliegue:** el código de plataforma (`plataforma/`, funciones de PS-01 a PS-06 y de soporte) solo se carga si `DESPLIEGUE=consola`, y las rutas de la empresa no se cargan en `consola`; la guarda de arranque de ADR-01 lo comprueba.
11. **Las cabeceras de seguridad y los atributos de cookie** (ADR-01 y ADR-08) los aplica un único *middleware*; una prueba recorre rutas tipo.

## Opciones descartadas
- Microservicios: sin hechos que los justifiquen (volumen, equipo pequeño).
- Una carpeta por capa técnica para todo el sistema: mezcla módulos y complica la prueba de dependencias.

## Consecuencias
- Más disciplina al inicio (interfaz pública por módulo); a cambio, 17 módulos no son 17 diseños.
- Un módulo nuevo es una carpeta que cumple el contrato: nombre, permisos, registro.

## Qué prueba lo valida
- La prueba de dependencias en CI (se introduce un ciclo a propósito en la prueba del prototipo y debe fallar).
- Prueba de registro: Personas devuelve los pendientes de un módulo de prueba registrado sin importarlo.
- Prueba de que todo permiso declarado por un módulo existe en el catálogo (ADR-10).

## Qué cambió tras la revisión (2026-10-29)
Seguridad lo aprobó sin hallazgos propios. Se agregaron las reglas 9 a 11 para sostener H-SEG-36 (lint de SQL crudo y de `set_config`), H-SEG-42 (código de plataforma solo en la consola) y H-SEG-50 (un solo punto para cabeceras y cookies). ADR-21 y ADR-22 se registran como módulos con `registro.ts` sin cambiar la estructura; el registro gana dos entradas: **limpieza al anonimizar** (ADR-12, ADR-21) y **herramientas del asistente** con su proyección de campos (ADR-22).
