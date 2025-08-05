import { Locator, Page } from '@playwright/test';

export class CoursesPage {
  readonly page: Page;
  readonly courseButton: Locator;
  readonly payButton: Locator;
  readonly confirmationMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.courseButton = page.locator('.course-btn');
    this.payButton = page.locator('#pay-with-edu');
    this.confirmationMessage = page.locator('.purchase-confirmed');
  }

  async buyCourse() {
    await this.courseButton.click();
    await this.payButton.click();
  }
}