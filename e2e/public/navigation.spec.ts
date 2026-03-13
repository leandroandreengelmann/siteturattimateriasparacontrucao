import { test, expect } from '@playwright/test'

test.describe('Navegação Pública', () => {
  test('home page carrega com header e footer', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/.+/)
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('logo navega para home', async ({ page }) => {
    await page.goto('/sobre-nos')
    await page.locator('header a[href="/"]').first().click()
    await expect(page).toHaveURL('/')
  })

  test('link Promoções navega para /promocoes', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /promoções/i }).first().click()
    await expect(page).toHaveURL(/\/promocoes/)
    await expect(page.getByRole('heading', { name: /promoções/i })).toBeVisible()
  })

  test('link Nossas Lojas navega para /nossas-lojas', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /lojas/i }).first().click()
    await expect(page).toHaveURL(/\/nossas-lojas/)
  })

  test('link Sobre Nós navega para /sobre-nos', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /sobre/i }).first().click()
    await expect(page).toHaveURL(/\/sobre-nos/)
  })

  test('página /produtos carrega catálogo', async ({ page }) => {
    await page.goto('/produtos')
    await expect(page.getByRole('heading', { name: 'Nossos produtos' })).toBeVisible()
  })
})

test.describe('Navegação Pública - Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('exibe navegação mobile na home', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header')).toBeVisible()
  })

  test('home carrega corretamente em mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })
})
