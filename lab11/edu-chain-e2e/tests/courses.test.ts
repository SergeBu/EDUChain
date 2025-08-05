import { test, expect } from '@playwright/test';
import { CoursesPage } from '../src/pages/CoursesPage';

test('Buy course with EDU', async ({ page }) => {
  const coursesPage = new CoursesPage(page);
  await page.goto('courses');
  await coursesPage.buyCourse();
  await expect(coursesPage.confirmationMessage).toBeVisible();
});