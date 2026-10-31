// QA · Comprobaciones HTTP de la aplicación levantada: Host (DNS rebinding, L02), cabeceras de seguridad (L04),
// cookie de sesión, y que el enlace de ingreso no entra por GET. Solo datos inventados.
import { expect, test } from '@playwright/test'

const puerto = new URL(process.env.URL_BASE ?? 'http://localhost:3000').port

test.describe('Host (MODO_LOCAL)', () => {
  test('un Host que no es localhost o 127.0.0.1 con el puerto de la aplicación recibe 421 en español, sin repetir el valor recibido', async ({ request }) => {
    for (const host of ['evil.com', `evil.com:${puerto}`, `localhost.evil.com:${puerto}`, 'localhost:9999', `192.168.1.5:${puerto}`, `127.0.0.1.nip.io:${puerto}`]) {
      const r = await request.get('/entrar', { headers: { host } })
      expect(r.status(), host).toBe(421)
      const t = await r.text()
      expect(t).toMatch(/localhost|127\.0\.0\.1/)
      expect(t).not.toContain('evil')
    }
  })

  test('X-Forwarded-Host ajeno también se rechaza, y localhost / 127.0.0.1 sí funcionan', async ({ request }) => {
    expect((await request.get('/entrar', { headers: { 'x-forwarded-host': 'evil.com' } })).status()).toBe(421)
    for (const host of [`localhost:${puerto}`, `127.0.0.1:${puerto}`]) expect((await request.get('/entrar', { headers: { host } })).status(), host).toBe(200)
  })

  test('también se rechaza en las rutas de datos y en las acciones, no solo en las páginas', async ({ request }) => {
    for (const ruta of ['/e/alfa/skus', '/empresas', '/']) expect((await request.get(ruta, { headers: { host: 'evil.com' } })).status(), ruta).toBe(421)
    const post = await request.post('/entrar', { headers: { host: 'evil.com', 'next-action': 'x', 'content-type': 'text/plain' }, data: '[]' })
    expect(post.status()).toBe(421)
  })

  test('/api/salud responde para el chequeo de Docker', async ({ request }) => {
    expect((await request.get('/api/salud')).ok()).toBeTruthy()
  })
})

test.describe('cabeceras de seguridad', () => {
  test('las páginas llevan CSP, X-Frame-Options, nosniff y Referrer-Policy; no anuncian el servidor', async ({ request }) => {
    const r = await request.get('/entrar')
    const h = r.headers()
    expect(h['content-security-policy']).toContain("frame-ancestors 'none'")
    expect(h['content-security-policy']).toContain("object-src 'none'")
    expect(h['x-frame-options']).toBe('DENY')
    expect(h['x-content-type-options']).toBe('nosniff')
    expect(h['referrer-policy']).toBeTruthy()
    expect(h['x-powered-by']).toBeUndefined()
  })

  test('las páginas con datos no se guardan en caché del navegador', async ({ request }) => {
    const r = await request.get('/entrar')
    expect(r.headers()['cache-control']).toMatch(/no-store|no-cache|private/)
  })
})

test.describe('sesión', () => {
  test('la cookie de sesión es HttpOnly y SameSite=Lax; abrir el enlace por GET no inicia sesión; el token no está en la página', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/entrar?correo=consulta@alfa.local')
    await page.getByTestId('boton-pedir-enlace').click()
    const enlace = (await page.getByTestId('enlace-ingreso').getAttribute('href'))!
    // Solo abrir el enlace (GET): no hay sesión.
    await page.goto(enlace)
    expect((await ctx.cookies()).find((c) => /sid$/.test(c.name))).toBeUndefined()
    const html = await page.content()
    // Entrar de verdad.
    await page.getByTestId('boton-entrar').click()
    await page.waitForURL(/\/empresas|\/e\//)
    const sid = (await ctx.cookies()).find((c) => /sid$/.test(c.name))
    expect(sid, 'no hay cookie de sesión tras entrar').toBeTruthy()
    expect(sid!.httpOnly).toBe(true)
    expect(sid!.sameSite).toBe('Lax')
    expect(sid!.path).toBe('/')
    // El valor de la cookie nunca se ve en el HTML de las pantallas.
    for (const ruta of ['/e/alfa', '/e/alfa/skus', '/empresas']) {
      await page.goto(ruta)
      expect(await page.content(), ruta).not.toContain(sid!.value)
    }
    expect(html).not.toContain(sid!.value)
    // La cookie de navegador usada para atar el enlace ya no queda tras entrar.
    expect((await ctx.cookies()).find((c) => /nav$/.test(c.name))).toBeUndefined()
    await ctx.close()
  })

  test('una cookie de sesión copiada a otro navegador funciona mientras la sesión viva (límite conocido) y deja de funcionar al cerrar sesión', async ({ browser }) => {
    const a = await browser.newContext()
    const pa = await a.newPage()
    await pa.goto('/entrar?correo=consulta@alfa.local')
    await pa.getByTestId('boton-pedir-enlace').click()
    await pa.getByTestId('enlace-ingreso').click()
    await pa.getByTestId('boton-entrar').click()
    await pa.waitForURL(/\/empresas|\/e\//)
    const copia = await browser.newContext()
    await copia.addCookies(await a.cookies())
    const pc = await copia.newPage()
    await pc.goto('/e/alfa/skus')
    await expect(pc.getByTestId('tabla-skus')).toBeVisible()
    await pa.goto('/e/alfa')
    await pa.getByTestId('cerrar-sesion').click()
    await pc.goto('/e/alfa/skus')
    await expect(pc.getByTestId('tabla-skus')).toHaveCount(0)
    await a.close()
    await copia.close()
  })
})
