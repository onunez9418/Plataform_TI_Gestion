# ADR-14 · Estructura de carpetas, capa de servicios y registro de módulo (T-10)

**Estado:** Propuesto · **Decide:** Gerente de TI · **Base:** D-038.6, H-ARQ-09, H-ARQ-11, D-062

## Contexto
El cese de una Persona (Etapa 2) debe consultar activos, líneas, licencias, casos y tareas de módulos que llegan años después. Si cada módulo importa al otro hay dependencias circulares.

## Decisión

### Carpetas
```
src/
  app/                  rutas de Next.js: e/[empresa]/..., plataforma/, api/
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
4. **Registro de módulo:** al arrancar, cada módulo declara en `registro.ts`: sus permisos, eventos que emite y escucha, **pendientes de la persona**, proveedores de búsqueda global, de vencimientos (calendario y avisos), de fuentes de costo, de indicadores, plantillas de importación y claves de contador. Personas consulta `registro.pendientesDe(persona)`, sin importar a los módulos de después. Un módulo ausente simplemente no aporta nada.
5. **Eventos:** lo que protege la integridad corre síncrono en la misma transacción; avisos y espejos, asíncronos por la cola (ADR-02).
6. `modulo_activo(empresa, módulo)` y una sola comprobación en `exigirPermiso`.
7. **Prueba de arquitectura en CI** (`dependency-cruiser`): sin ciclos, sin importaciones profundas, `nucleo` sin dependencias hacia `modulos`, solo `nucleo/aislamiento` importa Prisma, solo `nucleo/cola` importa la librería de cola.
8. Los cuatro módulos que necesitan "preguntarle a todos" (cese, búsqueda, vencimientos, costos) usan el registro, nunca imports.

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
