import { test, expect } from '@playwright/test';

test('Login with EDU wallet', async ({ page }) => {
  // Увеличиваем общий таймаут теста
  test.setTimeout(15000);

  await page.goto('http://localhost:3000/');
  
  // Проверяем, что страница загрузилась
  await expect(page.locator('body')).toBeVisible();
  
  // Заполняем поле ввода
  await page.fill('#wallet-address', '0x123...abc');
  
  // Кликаем кнопку подключения
  await page.click('#connect-button');
  
  // Проверяем результат
  await expect(page.locator('.wallet-connected')).toBeVisible({
    timeout: 5000
  });
});