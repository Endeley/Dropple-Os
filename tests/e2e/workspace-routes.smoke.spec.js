import { test, expect } from '@playwright/test';
import { expectSingleVisibleCanvasHost } from './helpers/canvasHost.js';

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
    path: '/workspace/systems-engineering',
    expected: 'Systems Engineering',
    expectedPanelText: 'Canonical build overlay for architecture graph',
  },
  {
    path: '/workspace/enterprise-operations',
    expected: 'Enterprise Operations',
    expectedPanelText: 'Canonical build overlay for process modeling',
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
    if (route.expectedPanelText) {
      await expect(page.locator('body')).toContainText(route.expectedPanelText);
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
  await expectSingleVisibleCanvasHost(page);
  await expect(page.locator('body')).not.toContainText('Module not found');
  await expect(page.locator('body')).not.toContainText('Application error');
});

async function createViewerFixture(request, path) {
  const response = await request.post(path);
  expect(response.ok(), `${path} should create a viewer fixture successfully`).toBeTruthy();
  const payload = await response.json();
  expect(payload?.galleryId, `${path} should return a galleryId`).toBeTruthy();
  return payload.galleryId;
}

test('viewer uses environment path for environment-backed artifacts', async ({ page, request }) => {
  const galleryId = await createViewerFixture(
    request,
    '/api/test/create-environment-gallery-item',
  );

  const response = await page.goto(`/viewer/${galleryId}`, {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'environment-backed viewer route should respond successfully').toBeTruthy();
  await expectSingleVisibleCanvasHost(page);
  await expect
    .poll(() => page.evaluate(() => window.__DROPPLE_VIEWER_MODE__ ?? null))
    .toBe('environment');
  await expect
    .poll(() => page.evaluate(() => window.__DROPPLE_VIEWER_ARTIFACT_KIND__ ?? null))
    .toBe('environment');
});

test('viewer falls back to snapshot path for snapshot-backed artifacts', async ({ page, request }) => {
  const galleryId = await createViewerFixture(
    request,
    '/api/test/create-snapshot-gallery-item',
  );

  const response = await page.goto(`/viewer/${galleryId}`, {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'snapshot-backed viewer route should respond successfully').toBeTruthy();
  await expectSingleVisibleCanvasHost(page);
  await expect
    .poll(() => page.evaluate(() => window.__DROPPLE_VIEWER_MODE__ ?? null))
    .toBe('snapshot');
  await expect
    .poll(() => page.evaluate(() => window.__DROPPLE_VIEWER_ARTIFACT_KIND__ ?? null))
    .toBe('snapshot');
});

test('project perspective route bootstrap installs a single blueprint deterministically', async ({ page }) => {
  const response = await page.goto('/workspace/create?blueprint=bp.startup.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'project bootstrap route should respond successfully').toBeTruthy();
  await expect(page.locator('body')).toContainText('Project Bootstrap Provenance');
  await expect(page.locator('body')).toContainText('defaultPerspective: create');
  await expect(page.locator('body')).toContainText('blueprintId: bp.startup.v1');
  await expect(page.locator('body')).toContainText('blueprintVersion: bp.startup.v1');
  await expect(page.locator('body')).toContainText('Installed bp.startup.v1');
});

test('project perspective route bootstrap composes multiple blueprints deterministically', async ({ page }) => {
  const response = await page.goto(
    '/workspace/create?blueprints=bp.startup.v1,bp.logistics.v1&bootstrap=1',
    { waitUntil: 'networkidle' },
  );

  expect(response?.ok(), 'composed bootstrap route should respond successfully').toBeTruthy();
  await expect(page.locator('body')).toContainText('Project Bootstrap Provenance');
  await expect(page.locator('body')).toContainText('defaultPerspective: create');
  await expect(page.locator('body')).toContainText('Installed composed blueprint');
  await expect(page.locator('body')).toContainText(/blueprintId:\s+bp\.compose\./);
  await expect(page.locator('body')).toContainText(/blueprintVersion:\s+bp\.compose\./);
});
