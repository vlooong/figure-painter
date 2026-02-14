import { test, expect } from '@playwright/test'

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Figure Painter')
  await page.screenshot({ path: '.sisyphus/evidence/task-1-homepage.png' })
})

test('extract page loads correctly', async ({ page }) => {
  await page.goto('/extract')
  await expect(page.locator('h1')).toContainText('数据提取')
  await page.screenshot({ path: '.sisyphus/evidence/task-1-extract.png' })
})

test('plot page loads correctly', async ({ page }) => {
  await page.goto('/plot')
  await expect(page.locator('h1')).toContainText('科研绘图')
  await page.screenshot({ path: '.sisyphus/evidence/task-1-plot.png' })
})

test('navigation from homepage works', async ({ page }) => {
  await page.goto('/')
  await page.click('a[href="/extract"]')
  await expect(page.locator('h1')).toContainText('数据提取')
  
  await page.goto('/')
  await page.click('a[href="/plot"]')
  await expect(page.locator('h1')).toContainText('科研绘图')
  await page.screenshot({ path: '.sisyphus/evidence/task-1-routes.png' })
})
