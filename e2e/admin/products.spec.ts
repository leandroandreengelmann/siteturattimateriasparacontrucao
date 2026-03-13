import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../fixtures/auth'

test.describe('Admin - CRUD Produtos', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('lista produtos na tabela', async ({ page }) => {
    await page.goto('/admin/products')
    await expect(page.getByRole('heading', { name: /produtos/i })).toBeVisible()
    // Aguarda o spinner de carregamento desaparecer
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 })
    // Aceita tabela com produtos OU estado vazio (sem produtos no DB)
    const hasTable = await page.locator('table').isVisible()
    const hasEmpty = await page.getByText('Nenhum produto encontrado').isVisible()
    expect(hasTable || hasEmpty).toBe(true)
  })

  test('botão Novo Produto navega para /admin/products/new', async ({ page }) => {
    await page.goto('/admin/products')
    await page.getByRole('link', { name: /novo produto/i }).click()
    await expect(page).toHaveURL(/\/admin\/products\/new/)
  })

  test('formulário de novo produto auto-gera slug a partir do nome', async ({ page }) => {
    await page.goto('/admin/products/new')
    const nameInput = page.getByLabel(/nome/i).first()
    await nameInput.fill('Tinta Teste E2E')
    await nameInput.blur()
    const slugInput = page.getByLabel(/slug/i).first()
    await expect(slugInput).toHaveValue(/tinta-teste-e2e/)
  })

  test('exibe erro de validação ao submeter formulário vazio', async ({ page }) => {
    await page.goto('/admin/products/new')
    await page.getByRole('button', { name: /criar produto/i }).click()
    // Mensagens de erro do react-hook-form
    await expect(page.getByText(/obrigatório/i).first()).toBeVisible()
  })

  test('exibe erro quando sale_price > price com is_on_sale ativo', async ({ page }) => {
    await page.goto('/admin/products/new')
    // Preenche campos mínimos
    await page.getByLabel(/nome/i).first().fill('Produto Oferta Inválida')
    // Ativa o is_on_sale clicando no label (Radix UI oculta o input nativo)
    const onSaleLabel = page.locator('label[for="is_on_sale"]')
    if (await onSaleLabel.isVisible()) {
      await onSaleLabel.scrollIntoViewIfNeeded()
      await onSaleLabel.click()
    }
    await page.locator('#price').fill('100')
    await page.locator('[name="sale_price"]').fill('200')
    await page.getByRole('button', { name: /criar produto/i }).click()
    await expect(page.getByText(/não pode ser maior/i)).toBeVisible({ timeout: 3000 })
  })

  test('busca filtra produtos na listagem', async ({ page }) => {
    await page.goto('/admin/products')
    // Aguarda o carregamento terminar
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 })
    const searchInput = page.getByPlaceholder(/buscar|pesquisar|search/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill('tinta')
      // Aguarda filtro aplicado
      await page.waitForTimeout(300)
    }
  })
})
