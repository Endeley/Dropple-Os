import { test, expect } from '@playwright/test';

const ROUTES = [
  {
    path: '/',
    expected: 'Dropple OS',
  },
  {
    path: '/marketplace',
    expected: 'Templates',
  },
  {
    path: '/workspace/graphic',
    expectedToolId: 'select',
  },
  {
    path: '/workspace/branding',
    expected: 'Branding',
    expectedButton: 'Export',
  },
  {
    path: '/workspace/icons',
    expectedToolId: 'select',
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
  {
    path: '/workspace/audio',
    expected: 'Media Workspace',
  },
  {
    path: '/workspace/automation',
    expected: 'Automation',
    expectedButton: 'Export',
  },
  {
    path: '/workspace/conversion',
    expected: 'Conversion',
    expectedButton: 'Export',
  },
  {
    path: '/workspace/ai',
    expected: 'AI Build',
  },
  {
    path: '/workspace/education',
    expected: 'Education Mode',
  },
  {
    path: '/workspace/new',
    expectedToolId: 'select',
  },
  {
    path: '/workspace/versioning',
    expected: 'Token Version Graph',
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
    if (route.expectedToolId) {
      await expect(page.locator(`[data-tool-id="${route.expectedToolId}"]`).first()).toBeVisible();
    } else if (route.expected) {
      await expect(page.locator('body')).toContainText(route.expected);
    }
    if (route.expectedButton) {
      await expect(page.getByRole('button', { name: route.expectedButton })).toBeVisible();
    }
    await expect(page.locator('body')).not.toContainText('Module not found');
    await expect(page.locator('body')).not.toContainText('Application error');
    expect(errors, `route ${route.path} should not trigger pageerror`).toEqual([]);
    expect(
      consoleErrors.filter((message) => !message.includes('Unchecked runtime.lastError')),
      `route ${route.path} should not log browser console errors`
    ).toEqual([]);
  });
}

test('viewer smoke mounts canonical canvas without runtime errors', async ({ page }) => {
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

  const response = await page.goto('/viewer?timeline=off&controls=off', {
    waitUntil: 'networkidle',
  });
  const runtimeConsoleErrors = consoleErrors.filter(
    (message) => !message.includes('Unchecked runtime.lastError')
  );
  const bodyText = await page.locator('body').innerText().catch(() => '');

  expect(response?.ok(), 'viewer route should respond successfully').toBeTruthy();
  expect(errors, `viewer pageerror: ${errors.join('\n')}`).toEqual([]);
  expect(
    runtimeConsoleErrors,
    `viewer console errors: ${runtimeConsoleErrors.join('\n')}`
  ).toEqual([]);
  expect(bodyText, `viewer body: ${bodyText}`).not.toContain('Application error');
  await expect(page.getByTestId('canvas-host')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('Module not found');
  await expect(page.locator('body')).not.toContainText('Application error');
});
