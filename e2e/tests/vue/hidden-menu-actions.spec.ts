import { test, expect } from '@playwright/test';

// The Vue demo forwards `?hiddenMenu=<ids>` into the `hiddenMenuActions`
// prop (see examples/vue/src/App.vue). These specs lock in that hidden
// entries (and any menu emptied by hiding) disappear, while the rest of
// the menu bar — including separators around surviving entries — stays
// intact.

const menubar = '.menu-bar';

test.describe('Vue: hiddenMenuActions prop', () => {
  test('hides entries and drops emptied top-level menus', async ({ page }) => {
    await page.goto('http://localhost:5174/?e2e=1&hiddenMenu=open,save,reportIssue');
    await page.locator('.docx-editor-vue').waitFor({ timeout: 15000 });
    await page.locator(menubar).waitFor({ timeout: 15000 });

    const bar = page.locator(menubar);
    // File / Format / Insert survive; Help is emptied -> not rendered.
    await expect(bar.getByRole('button', { name: 'File', exact: true })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Format', exact: true })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Insert', exact: true })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Help', exact: true })).toHaveCount(0);

    // Open the File menu: only "Page setup" remains, with no leading separator.
    await bar.getByRole('button', { name: 'File', exact: true }).click();
    const fileMenu = page.locator('.docx-menu-dropdown__menu');
    await expect(fileMenu).toBeVisible();
    await expect(
      fileMenu.locator('.docx-menu-dropdown__label', { hasText: 'Page setup' })
    ).toBeVisible();
    await expect(fileMenu.locator('.docx-menu-dropdown__label', { hasText: 'Open' })).toHaveCount(
      0
    );
    await expect(fileMenu.locator('.docx-menu-dropdown__label', { hasText: 'Save' })).toHaveCount(
      0
    );
    // Removing Open + Save must not leave the separator that sat above Page setup.
    await expect(fileMenu.locator('.docx-menu-dropdown__separator')).toHaveCount(0);
  });

  test('renders the full menu bar when the prop is unset', async ({ page }) => {
    await page.goto('http://localhost:5174/?e2e=1');
    await page.locator('.docx-editor-vue').waitFor({ timeout: 15000 });
    await page.locator(menubar).waitFor({ timeout: 15000 });

    const bar = page.locator(menubar);
    for (const name of ['File', 'Format', 'Insert', 'Help']) {
      await expect(bar.getByRole('button', { name, exact: true })).toBeVisible();
    }

    // File menu keeps Open, Save, the separator, and Page setup.
    await bar.getByRole('button', { name: 'File', exact: true }).click();
    const fileMenu = page.locator('.docx-menu-dropdown__menu');
    await expect(fileMenu.locator('.docx-menu-dropdown__label', { hasText: 'Open' })).toBeVisible();
    await expect(fileMenu.locator('.docx-menu-dropdown__label', { hasText: 'Save' })).toBeVisible();
    await expect(
      fileMenu.locator('.docx-menu-dropdown__label', { hasText: 'Page setup' })
    ).toBeVisible();
    await expect(fileMenu.locator('.docx-menu-dropdown__separator')).toHaveCount(1);
  });
});
