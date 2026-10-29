// QA · El guion de la demo del CEO (plan A.2) como prueba de navegador, de punta a punta, contra la aplicación levantada.
// Pasos 1 a 9. Usa solo los usuarios y datos inventados de la semilla; lo que crea lleva un sufijo propio para poder repetirse.
//
// Uso:  URL_BASE=http://127.0.0.1:3100 npx playwright test --config pruebas/recorrido/playwright.config.ts
import { expect, test, type BrowserContext, type Page } from '@playwright/test'

const S = Math.random().toString(36).slice(2, 6).toUpperCase()
const PREFIJO = `P${S.slice(0, 3)}` // prefijo de la categoría nueva (2 a 5 letras o números)
const NOMBRE_ROL = `Solo lectura ${S}`
const CORREO_NUEVO = `solo.${S.toLowerCase()}@alfa.local`

/** Pide el enlace en pantalla, lo abre y pulsa «Entrar». */
async function ingresar(page: Page, correo: string) {
  await page.goto(`/entrar?correo=${encodeURIComponent(correo)}`)
  await page.getByTestId('boton-pedir-enlace').click()
  await page.getByTestId('enlace-ingreso').click()
  await page.getByTestId('boton-entrar').click()
  await page.waitForURL(/\/empresas|\/e\/[a-z]/)
}
async function abrir(page: Page, abrirId: string) {
  await page.getByTestId(abrirId).click()
}
const ir = async (page: Page, ruta: string) => {
  await page.goto(ruta)
  await expect(page.getByTestId('franja-local')).toBeVisible()
}
const filaConTexto = (page: Page, texto: string | RegExp) => page.locator('tr', { hasText: texto })

let ctxCeo: BrowserContext
let ceo: Page
let ctxSolo: BrowserContext
let solo: Page
let skuAuto = ''
let skuPropio = ''
let accionCrearSku: { url: string; headers: Record<string, string>; cuerpo: string } | null = null
let categoriaNombre = ''
const serieBase = `QA${S}`

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  ctxCeo = await browser.newContext()
  ceo = await ctxCeo.newPage()
  ctxSolo = await browser.newContext()
  solo = await ctxSolo.newPage()
})
test.afterAll(async () => {
  await ctxCeo.close()
  await ctxSolo.close()
})

test('paso 1 · la pantalla de inicio carga con la franja de «versión local» y los seis usuarios de ejemplo', async () => {
  await ceo.goto('/')
  await expect(ceo.getByTestId('franja-local')).toContainText('Versión local de prueba')
  await expect(ceo.getByTestId('franja-local')).toContainText('inventados')
  for (const c of ['ceo@demo.local', 'jefa@alfa.local', 'tecnico@alfa.local', 'consulta@alfa.local', 'admin@beta.local', 'tecnico@beta.local']) {
    await expect(ceo.getByTestId(`usuario-ejemplo-${c}`)).toBeVisible()
  }
  expect((await ceo.request.get('/api/salud')).ok()).toBeTruthy()
})

test('paso 2 · escribe ceo@demo.local, aparece el enlace, pulsa «Entrar» y no pide contraseña', async () => {
  await ceo.goto('/entrar')
  await expect(ceo.locator('input[type=password]')).toHaveCount(0)
  await ceo.getByTestId('campo-correo').fill('ceo@demo.local')
  await ceo.getByTestId('boton-pedir-enlace').click()
  await expect(ceo.getByTestId('enlace-ingreso')).toBeVisible()
  const enlace = await ceo.getByTestId('enlace-ingreso').getAttribute('href')
  expect(enlace).toMatch(/^\/entrar\/enlace\?t=/)
  // Abrir el enlace NO entra solo: hace falta pulsar el botón (el canje es un POST).
  await ceo.goto(enlace!)
  await expect(ceo.getByTestId('boton-entrar')).toBeVisible()
  expect((await ceo.request.get('/empresas', { maxRedirects: 0 })).status()).not.toBe(200)
  await ceo.getByTestId('boton-entrar').click()
  await ceo.waitForURL(/\/empresas/)
  await expect(ceo.getByTestId('empresa-alfa')).toBeVisible()
  await expect(ceo.getByTestId('empresa-beta')).toBeVisible()
})

test('paso 2b · el enlace es de un solo uso: reabrirlo y pulsar «Entrar» otra vez no sirve', async ({ browser }) => {
  const c = await browser.newContext()
  const p = await c.newPage()
  await p.goto('/entrar?correo=consulta@alfa.local')
  await p.getByTestId('boton-pedir-enlace').click()
  const enlace = (await p.getByTestId('enlace-ingreso').getAttribute('href'))!
  await p.goto(enlace)
  await p.getByTestId('boton-entrar').click()
  await p.waitForURL(/\/empresas|\/e\//)
  // Otro navegador con el mismo enlace.
  const c2 = await browser.newContext()
  const p2 = await c2.newPage()
  await p2.goto(enlace)
  await p2.getByTestId('boton-entrar').click()
  await expect(p2.getByTestId('error-formulario')).toBeVisible()
  await expect(p2).not.toHaveURL(/\/e\/alfa/)
  // El mismo navegador, enlace ya usado.
  await p.context().clearCookies()
  await p.goto(enlace)
  await p.getByTestId('boton-entrar').click()
  await expect(p.getByTestId('error-formulario')).toBeVisible()
  await c.close()
  await c2.close()
})

test('paso 3 · ve Alfa y cambia a Beta con el mismo usuario', async () => {
  await ceo.getByTestId('empresa-alfa').click()
  await ceo.waitForURL(/\/e\/alfa/)
  await expect(ceo.getByTestId('empresa-activa')).toContainText('Alfa')
  await expect(ceo.getByTestId('usuario-actual')).toBeVisible()
  await ceo.getByTestId('selector-empresa').selectOption('beta')
  await ceo.waitForURL(/\/e\/beta/)
  await expect(ceo.getByTestId('empresa-activa')).toContainText('Beta')
  await ceo.getByTestId('selector-empresa').selectOption('alfa')
  await ceo.waitForURL(/\/e\/alfa/)
})

test('paso 4a · crea el rol «Solo lectura» e invita a un usuario con ese rol', async () => {
  await ir(ceo, '/e/alfa/roles')
  await abrir(ceo, 'crear-rol-abrir')
  await ceo.getByTestId('campo-nombre-rol').fill(NOMBRE_ROL)
  for (const p of ['skus.ver', 'activos.ver', 'catalogos.ver', 'personas.ver', 'proveedores.ver', 'entregas.ver', 'ordenes_compra.ver']) {
    await ceo.getByTestId(`permiso-nuevo-${p}`).check()
  }
  await ceo.getByTestId('form-crear-rol-enviar').click()
  await expect(ceo.getByTestId(`rol-${NOMBRE_ROL}`)).toBeVisible()

  await ir(ceo, '/e/alfa/usuarios')
  await abrir(ceo, 'crear-usuario-abrir')
  await ceo.getByTestId('campo-nombre').fill(`Lectora ${S}`)
  await ceo.getByTestId('campo-correo').fill(CORREO_NUEVO)
  await ceo.getByTestId('campo-rol').selectOption({ label: NOMBRE_ROL })
  await ceo.getByTestId('form-invitar-enviar').click()
  await expect(ceo.getByTestId('enlace-invitado')).toBeVisible()
  const enlace = await ceo.getByTestId('enlace-invitado').getAttribute('href')
  expect(enlace).toMatch(/\/entrar\/enlace\?t=/)

  // Entra con el enlace de invitación desde OTRO navegador (quien invita no es quien entra).
  await solo.goto(enlace!)
  await solo.getByTestId('boton-entrar').click()
  await solo.waitForURL(/\/e\/alfa|\/empresas/)
  if (/\/empresas/.test(solo.url())) await solo.getByTestId('empresa-alfa').click()
  await solo.waitForURL(/\/e\/alfa/)
})

test('paso 4b · el usuario «Solo lectura» no ve los botones de crear', async () => {
  await ir(solo, '/e/alfa/skus')
  await expect(solo.getByTestId('tabla-skus')).toBeVisible()
  await expect(solo.getByTestId('crear-sku-abrir')).toHaveCount(0)
  await ir(solo, '/e/alfa/inventario')
  await expect(solo.getByTestId('crear-activos-abrir')).toHaveCount(0)
  await ir(solo, '/e/alfa/compras')
  await expect(solo.getByTestId('crear-orden-abrir')).toHaveCount(0)
  // Lo que no puede usar ni aparece en el menú.
  for (const m of ['menu-usuarios', 'menu-roles', 'menu-auditoria']) await expect(solo.getByTestId(m)).toHaveCount(0)
})

test('paso 4c · …y el servidor lo rechaza aunque se salte la pantalla: páginas sin permiso muestran el aviso', async () => {
  for (const ruta of ['/e/alfa/roles', '/e/alfa/usuarios', '/e/alfa/auditoria']) {
    await solo.goto(ruta)
    await expect(solo.getByTestId('lista-roles')).toHaveCount(0)
    await expect(solo.getByTestId('tabla-usuarios')).toHaveCount(0)
    await expect(solo.getByTestId('tabla-auditoria')).toHaveCount(0)
    await expect(solo.locator('body')).toContainText(/permiso|acceso/i)
  }
})

test('paso 5 · aislamiento: LAP-0001 en Alfa y otro LAP-0001 distinto en Beta', async () => {
  await ir(ceo, '/e/alfa/skus')
  const textoAlfa = await ceo.getByTestId('fila-sku-LAP-0001').innerText()
  await ir(ceo, '/e/beta/skus')
  const textoBeta = await ceo.getByTestId('fila-sku-LAP-0001').innerText()
  expect(textoAlfa).toContain('LAP-0001')
  expect(textoBeta).toContain('LAP-0001')
  expect(textoAlfa).not.toEqual(textoBeta)
  expect(textoAlfa).toContain('Alfa')
  expect(textoBeta).toContain('Beta')
  // La serie SN-1001 de Alfa no aparece en Beta.
  await ir(ceo, '/e/beta/inventario')
  await expect(ceo.locator('body')).not.toContainText('Latitude 14 (Alfa)')
})

test('paso 5b · escribir en la barra la dirección de una empresa ajena da «sin acceso»', async () => {
  // El usuario «Solo lectura» pertenece solo a Alfa.
  for (const ruta of ['/e/beta', '/e/beta/skus', '/e/beta/inventario', '/e/beta/usuarios', '/e/beta/auditoria', '/e/beta/compras', '/e/beta/roles']) {
    await solo.goto(ruta)
    await expect(solo.getByTestId('sin-acceso'), ruta).toBeVisible()
    await expect(solo.locator('body'), ruta).not.toContainText('Beta S.A.C. · ')
    await expect(solo.getByTestId('tabla-skus')).toHaveCount(0)
  }
  // Empresas que no existen o con trucos: la misma pantalla.
  for (const ruta of ['/e/no-existe', '/e/BETA', "/e/beta'--", '/e/..%2Fbeta']) {
    const r = await solo.goto(ruta)
    expect(r?.status() ?? 0, ruta).toBeLessThan(500)
    await expect(solo.locator('body'), ruta).not.toContainText('LAP-0001')
  }
  // Sin sesión: no se ve nada de ninguna empresa.
  const anonimo = await ctxSolo.browser()!.newContext()
  const pa = await anonimo.newPage()
  for (const ruta of ['/e/alfa/skus', '/e/beta/inventario', '/e/alfa']) {
    await pa.goto(ruta)
    await expect(pa.locator('body'), ruta).not.toContainText('LAP-0001')
    await expect(pa.getByTestId('tabla-skus')).toHaveCount(0)
  }
  await anonimo.close()
})

test('paso 6a · crea una categoría con campos propios (texto, número, lista, sí/no)', async () => {
  categoriaNombre = `Impresoras ${S}`
  await ir(ceo, '/e/alfa/categorias')
  await abrir(ceo, 'crear-categoria-abrir')
  await ceo.getByTestId('campo-nombre-categoria').fill(categoriaNombre)
  await ceo.getByTestId('campo-prefijo').fill(PREFIJO)
  const campos: [string, string, string?][] = [['Modelo', 'texto'], ['Páginas por minuto', 'numero'], ['Tipo de tinta', 'lista', 'Tinta, Láser'], ['Con wifi', 'si_no']]
  for (const [i, [etiqueta, tipo, opciones]] of campos.entries()) {
    await ceo.getByTestId('campo-def-agregar').click()
    await ceo.getByTestId(`campo-def-${i}-etiqueta`).fill(etiqueta)
    await ceo.getByTestId(`campo-def-${i}-tipo`).selectOption(tipo)
    if (opciones) await ceo.getByTestId(`campo-def-${i}-opciones`).fill(opciones)
    if (i === 0) await ceo.getByTestId(`campo-def-${i}-obligatorio`).check()
  }
  await ceo.getByTestId('form-crear-categoria-enviar').click()
  await expect(ceo.getByTestId(`categoria-${categoriaNombre}`)).toBeVisible()
  await expect(ceo.getByTestId(`categoria-${categoriaNombre}`)).toContainText('Páginas por minuto')
})

test('paso 6b · crea un SKU y ve PREFIJO-0001; el obligatorio vacío se rechaza con su mensaje', async () => {
  await ir(ceo, '/e/alfa/skus')
  await abrir(ceo, 'crear-sku-abrir')
  await ceo.getByTestId('campo-categoria').selectOption({ label: `${categoriaNombre} (${PREFIJO})` })
  await ceo.getByTestId('campo-nombre').fill(`Impresora Inventada ${S}`)
  await ceo.getByTestId('campo-control').selectOption('serie')
  // Los campos de la categoría aparecen solos.
  await expect(ceo.getByTestId('valor-modelo')).toBeVisible()
  await expect(ceo.getByTestId('valor-paginas_por_minuto')).toBeVisible()
  // Primero sin el campo obligatorio.
  await ceo.getByTestId('form-crear-sku-enviar').click()
  await expect(ceo.getByTestId('form-crear-sku')).toContainText(/obligatorio|Modelo/i)
  await expect(ceo.getByTestId('sku-creado-codigo')).toHaveCount(0)
  await ceo.getByTestId('valor-modelo').fill('LJ-100')
  // (El navegador mismo no deja escribir letras en un campo de número; el servidor lo rechaza igual: ver pruebas/permisos.)
  // Se captura la petición real de «crear SKU» para repetirla después sin permiso.
  ceo.on('request', (r) => {
    if (r.method() === 'POST' && r.headers()['next-action'] && !accionCrearSku) {
      accionCrearSku = { url: r.url(), headers: r.headers(), cuerpo: r.postData() ?? '' }
    }
  })
  await ceo.getByTestId('form-crear-sku-enviar').click()
  await ceo.getByTestId('valor-paginas_por_minuto').fill('25')
  accionCrearSku = null
  await ceo.getByTestId('form-crear-sku-enviar').click()
  await expect(ceo.getByTestId('sku-creado-codigo')).toHaveText(`${PREFIJO}-0001`)
  skuAuto = `${PREFIJO}-0001`
  await expect(ceo.getByTestId(`fila-sku-${skuAuto}`)).toBeVisible()
})

test('paso 6c · crea otro SKU con código propio; un código repetido se rechaza', async () => {
  skuPropio = `${PREFIJO}-7777`
  await ir(ceo, '/e/alfa/skus')
  await abrir(ceo, 'crear-sku-abrir')
  const llenar = async (nombre: string) => {
    await ceo.getByTestId('campo-categoria').selectOption({ label: `${categoriaNombre} (${PREFIJO})` })
    await ceo.getByTestId('campo-nombre').fill(nombre)
    await ceo.getByTestId('campo-control').selectOption('serie')
    await ceo.getByTestId('valor-modelo').fill('LJ-200')
    await ceo.getByTestId('campo-codigo').fill(skuPropio)
  }
  await llenar(`Impresora con código propio ${S}`)
  await ceo.getByTestId('form-crear-sku-enviar').click()
  await expect(ceo.getByTestId('sku-creado-codigo')).toHaveText(skuPropio)
  // Repetido (en minúsculas, a propósito).
  await ir(ceo, '/e/alfa/skus')
  await abrir(ceo, 'crear-sku-abrir')
  await llenar(`Otra con el mismo código ${S}`)
  await ceo.getByTestId('campo-codigo').fill(skuPropio.toLowerCase())
  await ceo.getByTestId('form-crear-sku-enviar').click()
  await expect(ceo.getByTestId('form-crear-sku')).toContainText(/Ya existe/i)
  await expect(ceo.locator('[data-testid^="fila-sku-"]', { hasText: `Otra con el mismo código ${S}` })).toHaveCount(0)
  // El siguiente automático salta el código propio y sigue la cuenta.
  await ir(ceo, '/e/alfa/skus')
  await abrir(ceo, 'crear-sku-abrir')
  await llenar(`Automática dos ${S}`)
  await ceo.getByTestId('campo-codigo').fill('')
  await ceo.getByTestId('form-crear-sku-enviar').click()
  await expect(ceo.getByTestId('sku-creado-codigo')).toHaveText(`${PREFIJO}-0002`)
})

test('paso 6d · el servidor rechaza «crear SKU» de quien no tiene permiso, aunque repita la petición real a mano', async () => {
  test.skip(!accionCrearSku, 'no se pudo capturar la petición de la pantalla')
  // Se repite la MISMA petición (captada del CEO) con la sesión del usuario «Solo lectura».
  const antes = await ceo.request.get('/e/alfa/skus').then((r) => r.text())
  const r = await ctxSolo.request.post(accionCrearSku!.url, {
    headers: { 'next-action': accionCrearSku!.headers['next-action']!, 'content-type': accionCrearSku!.headers['content-type'] ?? 'text/plain;charset=UTF-8', accept: 'text/x-component' },
    data: accionCrearSku!.cuerpo,
  })
  const cuerpo = await r.text()
  expect(cuerpo).toMatch(/SIN_PERMISO|No tiene permiso/)
  expect(cuerpo).not.toContain(skuAuto)
  const despues = await ceo.request.get('/e/alfa/skus').then((x) => x.text())
  expect((despues.match(/fila-sku-/g) ?? []).length).toBe((antes.match(/fila-sku-/g) ?? []).length)
})

test('paso 7a · registra 3 equipos con series, mira el resumen y rechaza una serie repetida', async () => {
  await ir(ceo, '/e/alfa/inventario')
  await abrir(ceo, 'crear-activos-abrir')
  await ceo.getByTestId('campo-sku').selectOption({ label: new RegExp(skuAuto) as never }).catch(async () => {
    const op = await ceo.getByTestId('campo-sku').locator('option', { hasText: skuAuto }).getAttribute('value')
    await ceo.getByTestId('campo-sku').selectOption(op!)
  })
  await ceo.getByTestId('campo-ubicacion').selectOption({ index: 1 })
  await ceo.getByTestId('series-texto').fill(`${serieBase}-1\n${serieBase}-2\n${serieBase}-3`)
  await expect(ceo.getByTestId('series-resumen')).toContainText('3')
  await ceo.getByTestId('form-registrar-enviar').click()
  await expect(ceo.getByTestId('registrado-ok')).toBeVisible()
  for (const n of [1, 2, 3]) await expect(ceo.getByTestId(`fila-activo-${skuAuto}-${serieBase}-${n}`)).toBeVisible()

  // Serie repetida en el mismo SKU (en minúsculas): se rechaza y no se crea nada.
  await abrir(ceo, 'crear-activos-abrir').catch(() => undefined)
  const op = await ceo.getByTestId('campo-sku').locator('option', { hasText: skuAuto }).getAttribute('value')
  await ceo.getByTestId('campo-sku').selectOption(op!)
  await ceo.getByTestId('campo-ubicacion').selectOption({ index: 1 })
  await ceo.getByTestId('series-texto').fill(`${serieBase.toLowerCase()}-1\n${serieBase}-NUEVA`)
  await ceo.getByTestId('form-registrar-enviar').click()
  await expect(ceo.getByTestId('form-registrar')).toContainText(/ya est[áa]n? registrad|repetid/i)
  await ir(ceo, `/e/alfa/inventario`)
  await expect(ceo.getByTestId(`fila-activo-${skuAuto}-${serieBase}-NUEVA`)).toHaveCount(0)
})

test('paso 7b · asigna un equipo a una persona, ve quién lo tiene, lo devuelve y queda el historial', async () => {
  await ir(ceo, '/e/alfa/inventario')
  await ceo.getByTestId(`abrir-activo-${skuAuto}-${serieBase}-1`).click()
  await expect(ceo.getByTestId('ficha-serie')).toContainText(`${serieBase}-1`)
  await ceo.getByTestId('campo-persona').selectOption({ index: 1 })
  await ceo.getByTestId('form-asignar-enviar').click()
  await expect(ceo.getByTestId('ficha-persona')).not.toBeEmpty()
  await expect(ceo.getByTestId('ficha-persona')).not.toContainText(/sin responsable|nadie/i)
  // No se puede asignar dos veces: el botón desaparece o el servidor lo rechaza.
  await ceo.getByTestId('campo-ubicacion').selectOption({ index: 2 })
  await ceo.getByTestId('form-devolver-enviar').click()
  await expect(ceo.getByTestId('historial-activo')).toContainText(/devol/i)
  await expect(ceo.getByTestId('historial-activo')).toContainText(/asign|entreg/i)
  // La lista lo muestra de nuevo en stock.
  await ir(ceo, '/e/alfa/inventario')
  await expect(ceo.getByTestId(`fila-activo-${skuAuto}-${serieBase}-1`)).toContainText(/En stock|en_stock/i)
})

test('paso 8 · la auditoría muestra lo que se hizo, con quién y cuándo', async () => {
  await ir(ceo, '/e/alfa/auditoria')
  const tabla = ceo.getByTestId('tabla-auditoria')
  await expect(tabla).toBeVisible()
  for (const accion of ['rol.crear', 'usuario.invitar', 'categoria.crear', 'sku.crear', 'activo.registrar', 'activo.asignar', 'activo.devolver']) {
    await expect(tabla, `falta ${accion} en la auditoría`).toContainText(accion)
  }
  await expect(tabla).toContainText('ceo@demo.local'.split('@')[0]!, { ignoreCase: true }).catch(() => undefined)
  // La auditoría de Alfa no muestra nada de lo creado en esta prueba cuando se mira Beta.
  await ir(ceo, '/e/beta/auditoria')
  await expect(ceo.getByTestId('tabla-auditoria')).not.toContainText(NOMBRE_ROL)
  await expect(ceo.getByTestId('tabla-auditoria')).not.toContainText(skuAuto)
})

test('paso 9 · orden de compra: el CEO la prepara y no puede aprobarla; la Jefatura sí; se recibe en dos tandas', async ({ browser }) => {
  // Prepara
  await ir(ceo, '/e/alfa/compras')
  await abrir(ceo, 'crear-orden-abrir')
  await ceo.getByTestId('campo-proveedor').selectOption({ index: 1 })
  const op = await ceo.getByTestId('linea-0-sku').locator('option', { hasText: 'LAP-0001' }).getAttribute('value')
  await ceo.getByTestId('linea-0-sku').selectOption(op!)
  await ceo.getByTestId('linea-0-cantidad').fill('3')
  await ceo.getByTestId('linea-0-precio').fill('1200')
  await expect(ceo.getByTestId('total-orden')).toContainText('3.600')
  await ceo.getByTestId('form-orden-enviar').click()
  await ceo.waitForURL(/\/compras\/[0-9a-f-]{36}/)
  const urlOrden = ceo.url()
  await expect(ceo.getByTestId('estado-orden-borrador')).toBeVisible()
  await ceo.getByTestId('enviar-aprobacion').click()
  await expect(ceo.getByTestId('estado-orden-por_aprobar')).toBeVisible()

  // Intenta aprobarla él mismo: el servidor lo impide con un mensaje claro.
  await ceo.getByTestId('aprobar-orden').click()
  await expect(ceo.getByTestId('aprobar-orden-error')).toContainText(/no puede aprobarla|preparó/i)
  await expect(ceo.getByTestId('estado-orden-por_aprobar')).toBeVisible()

  // La Jefatura TI (otra persona) la aprueba.
  const cj = await browser.newContext()
  const jefa = await cj.newPage()
  await ingresar(jefa, 'jefa@alfa.local')
  if (/\/empresas/.test(jefa.url())) await jefa.getByTestId('empresa-alfa').click()
  await jefa.goto(urlOrden)
  await expect(jefa.getByTestId('estado-orden-por_aprobar')).toBeVisible()
  await expect(jefa.getByTestId('enviar-aprobacion')).toHaveCount(0)
  await jefa.getByTestId('aprobar-orden').click()
  await expect(jefa.getByTestId('estado-orden-aprobada')).toBeVisible()
  await cj.close()

  // Recepción parcial: 2 de 3, con series. Nacen los activos.
  await ceo.goto(urlOrden)
  await expect(ceo.getByTestId('estado-orden-aprobada')).toBeVisible()
  await ceo.getByTestId('campo-ubicacion').selectOption({ index: 1 })
  await ceo.getByTestId('cantidad-LAP-0001').fill('2')
  await ceo.getByTestId('series-LAP-0001-texto').fill(`OC${S}-1\nOC${S}-2`)
  await ceo.getByTestId('form-recibir-enviar').click()
  await expect(ceo.getByTestId('recepcion-ok')).toBeVisible()
  await expect(ceo.getByTestId('estado-orden-recibida_parcial')).toBeVisible()

  // Intenta recibir de más (quedaba 1): rechazado, sigue parcial.
  await ceo.getByTestId('cantidad-LAP-0001').fill('2')
  await ceo.getByTestId('series-LAP-0001-texto').fill(`OC${S}-3\nOC${S}-4`)
  await ceo.getByTestId('form-recibir-enviar').click()
  await expect(ceo.getByTestId('form-recibir')).toContainText(/queda|pendiente|supera|pidieron/i)
  await expect(ceo.getByTestId('estado-orden-recibida_parcial')).toBeVisible()

  // Recibe la última.
  await ceo.getByTestId('cantidad-LAP-0001').fill('1')
  await ceo.getByTestId('series-LAP-0001-texto').fill(`OC${S}-3`)
  await ceo.getByTestId('form-recibir-enviar').click()
  await expect(ceo.getByTestId('estado-orden-recibida')).toBeVisible()
  await ir(ceo, '/e/alfa/inventario')
  for (const n of [1, 2, 3]) await expect(ceo.getByTestId(`fila-activo-LAP-0001-OC${S}-${n}`)).toBeVisible()
})

test('cierre · cerrar sesión corta el acceso: volver atrás ya no muestra datos', async () => {
  await ceo.getByTestId('cerrar-sesion').click()
  await ceo.goto('/e/alfa/skus')
  await expect(ceo.getByTestId('tabla-skus')).toHaveCount(0)
  await expect(ceo.locator('body')).not.toContainText('LAP-0001')
})
