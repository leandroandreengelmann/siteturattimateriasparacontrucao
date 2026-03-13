import { Page } from '@playwright/test'

export const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL || 'admin@turatti.com'
export const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD || ''

export async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login')
  await page.getByLabel(/e-?mail/i).fill(ADMIN_EMAIL)
  await page.getByLabel(/senha/i).fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /acessar/i }).click()
  await page.waitForURL('/admin/dashboard')
}
