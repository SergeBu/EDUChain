import { test, expect } from '@playwright/test'; // Добавьте эту строку

test('Stake 100 EDU tokens', async ({ page }) => {
  await page.goto('http://localhost:3000/staking');
  await page.fill('#amount-input', '100');
  await page.click('#stake-button');
  await expect(page.locator('.staking-success')).toBeVisible();
});