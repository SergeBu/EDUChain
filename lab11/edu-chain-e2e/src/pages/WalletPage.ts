import { Locator, Page } from '@playwright/test';

export class WalletPage {
  readonly page: Page;
  readonly connectButton: Locator;
  readonly walletAddressInput: Locator;
  readonly connectionStatus: Locator;  // Изменено с balanceDisplay

  constructor(page: Page) {
    this.page = page;
    this.connectButton = page.locator('#connect-button');
    this.walletAddressInput = page.locator('#wallet-address');
    this.connectionStatus = page.locator('.wallet-connected'); // Новый селектор
  }

  async connectWallet(address: string) {
    await this.walletAddressInput.fill(address);
    await this.connectButton.click();
    await this.page.waitForSelector('.wallet-connected'); // Ждем появления статуса
  }
}