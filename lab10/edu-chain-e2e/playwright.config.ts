import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
    headless: false, // Для отладки можно отключить headless режим
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  expect: {
    timeout: 10000,
  },
  retries: 1, // Добавляем 1 повторение для неудачных тестов
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
});