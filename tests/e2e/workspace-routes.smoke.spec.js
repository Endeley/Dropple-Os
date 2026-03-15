import { test, expect } from '@playwright/test';

const ROUTES = [
  {
    path: '/workspace/graphic',
    expected: 'Undo',
  },
  {
    path: '/workspace/media',
    expected: 'Media Workspace',
  },
  {
    path: '/workspace/animation',
    expected: 'Media Workspace',
  },
  {
    path: '/workspace/video',
    expected: 'Media Workspace',
  },
  {
    path: '/workspace/podcast',
    expected: 'Media Workspace',
  },
];

for (const route of ROUTES) {
  test(`smoke loads ${route.path}`, async ({ page }) => {
    const errors = [];
    const consoleErrors = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    const response = await page.goto(route.path, {
      waitUntil: 'networkidle',
    });

    expect(response?.ok(), `route ${route.path} should respond successfully`).toBeTruthy();
    await expect(page.locator('body')).toContainText(route.expected);
    await expect(page.locator('body')).not.toContainText('Module not found');
    await expect(page.locator('body')).not.toContainText('Application error');
    expect(errors, `route ${route.path} should not trigger pageerror`).toEqual([]);
    expect(
      consoleErrors.filter((message) => !message.includes('Unchecked runtime.lastError')),
      `route ${route.path} should not log browser console errors`
    ).toEqual([]);
  });
}
