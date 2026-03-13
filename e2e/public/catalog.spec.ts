import { test, expect } from '@playwright/test'

test.describe('Catálogo de Produtos', () => {
  test('página /produtos carrega sem erros', async ({ page }) => {
    await page.goto('/produtos')
    // Sem erros 500
    await expect(page).not.toHaveURL(/error/)
    await expect(page.locator('body')).not.toContainText('Internal Server Error')
  })

  test('exibe heading na página de produtos', async ({ page }) => {
    await page.goto('/produtos')
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('página /promocoes carrega sem erros', async ({ page }) => {
    await page.goto('/promocoes')
    await expect(page.getByRole('heading', { name: /promoções/i })).toBeVisible()
  })

  test('página /nossas-lojas carrega', async ({ page }) => {
    await page.goto('/nossas-lojas')
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('filtro ?filter=new é aceito na URL', async ({ page }) => {
    await page.goto('/produtos?filter=new')
    await expect(page).toHaveURL(/filter=new/)
    await expect(page.locator('body')).not.toContainText('Internal Server Error')
  })

  test('filtro ?filter=featured é aceito na URL', async ({ page }) => {
    await page.goto('/produtos?filter=featured')
    await expect(page).toHaveURL(/filter=featured/)
    await expect(page.locator('body')).not.toContainText('Internal Server Error')
  })

  test('filtro ?filter=promo é aceito na URL', async ({ page }) => {
    await page.goto('/produtos?filter=promo')
    await expect(page).toHaveURL(/filter=promo/)
    await expect(page.locator('body')).not.toContainText('Internal Server Error')
  })
})

test.describe('Catálogo - Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('página de produtos carrega em mobile', async ({ page }) => {
    await page.goto('/produtos')
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('body')).not.toContainText('Internal Server Error')
  })
})
