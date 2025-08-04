import { test, expect } from '@playwright/test'; // Добавьте эту строку

test('Buy course with EDU', async ({ page }) => {
  await page.goto('http://localhost:3000/courses');
  await page.click('button:has-text("Blockchain 101")');
  await page.click('#pay-with-edu');
  await expect(page.locator('.purchase-confirmed')).toBeVisible();
});