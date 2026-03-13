import { test, expect } from '@playwright/test'

test.describe('Admin - Autenticação', () => {
  test('exibe formulário de login em /admin/login', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.getByRole('heading', { name: /portal turatti/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /acessar/i })).toBeVisible()
  })

  test('exibe erro ao tentar login com credenciais inválidas', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel(/e-?mail/i).fill('invalido@test.com')
    await page.getByLabel(/senha/i).fill('senhaerrada')
    await page.getByRole('button', { name: /acessar/i }).click()

    // Aguarda toast/mensagem de erro
    await expect(page.locator('[data-sonner-toast], [role="alert"], .toast')).toBeVisible({ timeout: 5000 })
    // Permanece na página de login
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('redireciona /login para /admin/login', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})
