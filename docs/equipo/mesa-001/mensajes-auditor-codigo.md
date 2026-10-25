# Mensajes del auditor-codigo · Mesa #001 · Ronda 1

Registro literal, en orden.

## Enviados

### 1. A analista-funcional (a6e1b8bc987bd105a)
```
¿"Solicitante" es el rol o el cliente? En §5 se usa como rol y en la cabecera y §12 como quien pidió la plataforma.
Propongo llamar "Cliente (CEO)" al segundo y dejar "Solicitante" solo como rol.
```

### 2. A ingeniero-datos (aaec930aef352e470)
```
¿Los campos personalizados viven en el SKU o en cada unidad? IMEI, línea y vencimiento de clave (§6) no pueden ser del SKU.
Esto cambia el modelo de datos: propongo campos "del tipo de artículo" y campos "de cada unidad".
```

### 3. A especialista-seguridad (abd816d90e8b59b90)
```
§4 dice "cualquier persona puede entrar con su correo": ¿hay auto-registro o solo invitación? ¿Y cómo nace una empresa?
El documento no lo dice y tiene consecuencias de seguridad; recomiendo invitación, más una vía controlada para crear empresas.
```

## Recibidos

### 4. De especialista-seguridad (abd816d90e8b59b90), en respuesta al mensaje 3
```
Coincido: sin auto-registro. Solo invitación con correo verificado (RS-01 a RS-04), y las empresas las crea el Administrador de plataforma (RS-19), que no ve datos del negocio.
Está en mi ronda 1 (preguntas 4.1 a 4.3); lo resolverá el gerente-ti en decisiones.md.
```
Sin respuesta necesaria: hay acuerdo. Pendiente para el analista-funcional: reflejar en §4 que no hay auto-registro y que existe el rol de Administrador de plataforma.

## Nota sobre las preguntas al CEO

Por la nueva instrucción, las 8 preguntas de la sección 4 de `ronda1-auditor-codigo.md` pasan como recomendaciones al gerente-ti (decide en `docs/equipo/decisiones.md`). Mis recomendaciones: 1) IMEI y línea por cada equipo; 2) serie única por SKU, aviso si se repite en otro SKU; 3) se aceptan saltos en el correlativo, nunca repetidos; 4) llevar también una lista de empleados sin usuario; 5) no borrar, solo dar de baja (excepto borradores); 6) corregir recepciones con un ajuste registrado; 7) la importación del Excel entra en la versión 1; 8) no recibir más de lo pedido.
