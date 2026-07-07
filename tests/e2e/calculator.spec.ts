import { expect, test } from '@playwright/test';

test.describe('Satisfactory calculator', () => {
  test('loads the default item calculator and shows computed results', async ({ page }) => {
    await page.goto('/calc/iron-ingot');

    await expect(page.getByTestId('selected-item')).toBeVisible();
    await expect(page.locator('[data-testid="selected-item-class"]')).toHaveCount(0);
    await expect(page.getByTestId('production-pipeline')).toBeVisible();
    await expect(page.getByTestId('raw-resources')).toBeVisible();
    await expect(page.getByTestId('total-power')).toBeVisible();
    await expect(page.getByTestId('buildings-summary')).toContainText('Smelter');
    await expect(page.getByTestId('buildings-summary')).not.toContainText('SmelterMk1');
    await expect(page.locator('body')).not.toContainText('Advertisement');
    await expect(page.locator('body')).not.toContainText('Google AdSense');
  });

  test('searches for another item and navigates to the class-based slug', async ({ page }) => {
    await page.goto('/calc/iron-ingot');

    await page.getByLabel('Search Item').fill('Plate');
    await expect(page.getByTestId('search-result-Desc_IronPlate_C')).toContainText('Iron Plate');
    await expect(page.getByTestId('search-result-Desc_IronPlate_C')).not.toContainText('Desc_IronPlate_C');
    await page.getByTestId('search-result-Desc_IronPlate_C').click();

    await expect(page).toHaveURL(/\/calc\/iron-plate$/);
    await expect(page.locator('[data-testid="selected-item-class"]')).toHaveCount(0);
    await expect(page.getByTestId('selected-item')).toBeVisible();
  });
});
