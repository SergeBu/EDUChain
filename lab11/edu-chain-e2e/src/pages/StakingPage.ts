import { Locator, Page } from '@playwright/test';

export class StakingPage {
  readonly page: Page;
  readonly amountInput: Locator;
  readonly stakeButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.amountInput = page.locator('#amount-input');
    this.stakeButton = page.locator('#stake-button');
    this.successMessage = page.locator('.staking-success');
  }

  async stakeTokens(amount: number) {
    await this.amountInput.fill(amount.toString());
    await this.stakeButton.click();
  }
}