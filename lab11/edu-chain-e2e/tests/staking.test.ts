import { test, expect } from '@playwright/test';
import { StakingPage } from '../src/pages/StakingPage';

test('Stake 100 EDU tokens', async ({ page }) => {
  const stakingPage = new StakingPage(page);
  await page.goto('staking');
  await stakingPage.stakeTokens(100);
  await expect(stakingPage.successMessage).toHaveText('Tokens staked!');
});