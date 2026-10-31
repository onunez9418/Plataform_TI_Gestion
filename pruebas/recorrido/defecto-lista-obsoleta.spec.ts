// QA · DEF-FRO-01: tras «Registrar», el aviso dice «Ya aparece en la lista» pero la lista a veces sigue sin el equipo nuevo.
// Describe lo CORRECTO: cada alta debe verse en la lista sin recargar. Mientras el defecto exista, FALLA (se espera).
import { expect, test } from '@playwright/test'

test('DEF-FRO-01 · ocho altas seguidas: el equipo nuevo aparece en la lista cada vez, sin recargar la página', async ({ page }) => {
  await page.goto('/entrar?correo=ceo@demo.local')
  await page.getByTestId('boton-pedir-enlace').click()
  await page.getByTestId('enlace-ingreso').click()
  await page.getByTestId('boton-entrar').click()
  await page.waitForURL(/\/empresas/)
  const obsoletas: string[] = []
  for (let i = 0; i < 8; i++) {
    await page.goto('/e/alfa/inventario')
    const resumen = page.getByTestId('crear-activos-abrir')
    if (!(await resumen.evaluate((e) => Boolean(e.closest('details')?.open)))) await resumen.click()
    await page.getByTestId('campo-sku').selectOption({ index: 1 }) // el primer artículo por serie de la lista (LAP-0001)
    await page.getByTestId('campo-ubicacion').selectOption({ index: 1 })
    const serie = `REF-${Date.now().toString(36)}-${i}`
    await page.getByTestId('series-texto').fill(serie)
    await page.getByTestId('form-registrar-enviar').click()
    await expect(page.getByTestId('registrado-ok')).toBeVisible()
    const fila = page.locator(`[data-testid^="fila-activo-"][data-testid$="-${serie}"]`)
    try {
      await expect(fila).toHaveCount(1, { timeout: 5000 })
    } catch {
      obsoletas.push(serie)
    }
  }
  expect(obsoletas, `la lista no se actualizó tras registrar: ${obsoletas.join(', ')}`).toEqual([])
})
