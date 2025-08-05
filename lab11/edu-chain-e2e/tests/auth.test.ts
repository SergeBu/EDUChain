import { test, expect } from '@playwright/test';
import { WalletPage } from '../src/pages/WalletPage';

test('Login with EDU wallet', async ({ page }) => {
  const walletPage = new WalletPage(page);
  
  await page.goto('/');
  await walletPage.connectWallet('0x123...abc');
  
  // Проверяем наличие статуса подключения
  await expect(walletPage.connectionStatus).toHaveText('Connected!');
});