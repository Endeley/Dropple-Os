import { test, expect } from '@playwright/test';
import { expectSingleVisibleCanvasHost } from './helpers/canvasHost.js';

const ROUTES = [
  {
    path: '/',
    expected: 'Recent Projects',
  },
  {
    path: '/marketplace',
    expected: 'Blueprints',
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
    path: '/workspace/overview',
    expected: 'Project Space',
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

test('home route exposes project-first entry sections', async ({ page }) => {
  const response = await page.goto('/', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'home route should respond successfully').toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Start from Intent' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recent Projects' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Continue Working' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recommended Blueprints' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Marketplace' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Project Space' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Browse Marketplace' })).toBeVisible();
});

test('home route reads recent projects and continue route from persisted local state', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'dropple.documents',
      JSON.stringify([
        { id: 'doc-recent-2', name: 'Older Project', updatedAt: 10 },
        { id: 'doc-recent-1', name: 'Newest Project', updatedAt: 20 },
      ]),
    );
    window.localStorage.setItem('dropple.activeDocument', 'doc-recent-1');
  });

  const response = await page.goto('/', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'home route should respond successfully').toBeTruthy();
  await expect(page.getByRole('link', { name: 'Newest Project' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Older Project' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Project Space' })).toHaveAttribute(
    'href',
    '/workspace/new?doc=doc-recent-1',
  );
});

test('home route resolves intent into a certified blueprint recommendation', async ({ page }) => {
  const response = await page.goto('/', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'home route should respond successfully').toBeTruthy();
  await page.getByLabel('Describe what you want to build').fill('Build a trucking company');
  await expect(page.getByRole('link', { name: 'Start with Logistics Blueprint' })).toHaveAttribute(
    'href',
    '/workspace/create?blueprint=bp.logistics.v1&bootstrap=1',
  );
});

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

test('overview perspective renders project hub panel', async ({ page }) => {
  const response = await page.goto('/workspace/overview', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'overview route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('project-hub-panel')).toBeVisible();
  await expect(page.locator('body')).toContainText('perspectives: 6');
  await expect(page.locator('body')).toContainText('projectId:');
  await expect(page.locator('body')).toContainText('project name:');
  await expect(page.locator('body')).toContainText('blueprintId:');
  await expect(page.locator('body')).toContainText('owner:');
  await expect(page.locator('body')).toContainText('updatedAt:');
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

test('project shell assistant intent enqueues through canonical runtime bridge', async ({ page }) => {
  const response = await page.goto('/workspace/create?blueprint=bp.startup.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create bootstrap route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('assistant-surface-panel')).toBeVisible();
  await expect(page.locator('body')).toContainText('perspective: create');
  await expect(page.locator('body')).toContainText('active: assistant.design');

  await page.getByRole('button', { name: 'Ask Assistant' }).click();
  await expect(page.locator('body')).toContainText(/assistant intent:\s+enqueued:/);
});

test('create perspective assistant surface stays entry-consistent for design and media routes', async ({ page }) => {
  const designResponse = await page.goto('/workspace/create?entry=branding', {
    waitUntil: 'networkidle',
  });
  expect(designResponse?.ok(), 'create branding route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('assistant-surface-panel')).toContainText('perspective: create');
  await expect(page.getByTestId('assistant-surface-panel')).toContainText('active: assistant.design');
  await expect(page.getByTestId('assistant-surface-panel')).toContainText('visible: assistant.design, assistant.media');

  const mediaResponse = await page.goto('/workspace/create?entry=animation', {
    waitUntil: 'networkidle',
  });
  expect(mediaResponse?.ok(), 'create animation route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('assistant-surface-panel')).toContainText('perspective: create');
  await expect(page.getByTestId('assistant-surface-panel')).toContainText('active: assistant.media');
  await expect(page.getByTestId('assistant-surface-panel')).toContainText('visible: assistant.design, assistant.media');

  const podcastResponse = await page.goto('/workspace/create?entry=podcast', {
    waitUntil: 'networkidle',
  });
  expect(podcastResponse?.ok(), 'create podcast route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('assistant-surface-panel')).toContainText('perspective: create');
  await expect(page.getByTestId('assistant-surface-panel')).toContainText('active: assistant.media');
  await expect(page.getByTestId('assistant-surface-panel')).toContainText('visible: assistant.design, assistant.media');
});

test('design modes expose parity-stable shell chrome and strip signals', async ({ page }) => {
  const designModes = [
    { modeId: 'uiux', modeLabel: 'UI / UX', routeMarker: 'Design / UIUX', uiuxShell: true },
    { modeId: 'graphic', modeLabel: 'Graphic', routeMarker: '· Graphic', uiuxShell: false },
    { modeId: 'document', modeLabel: 'Document', routeMarker: '· Document', uiuxShell: false },
  ];

  for (const mode of designModes) {
    const response = await page.goto(`/workspace/${mode.modeId}`, {
      waitUntil: 'networkidle',
    });

    expect(response?.ok(), `${mode.modeId} route should respond successfully`).toBeTruthy();
    if (mode.uiuxShell) {
      await expect(page.locator('.workspace-name')).toContainText('UIUX');
      await expect(page.locator('.uiux-workspace-strip')).toContainText('Design / UIUX');
      await expect(page.locator('.frame-indicator')).toContainText('Draft Surface');
      await expect(page.getByRole('button', { name: 'Templates' })).toBeVisible();
    } else {
      await expect(page.getByRole('button', { name: 'Design' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'UI / UX' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Graphic' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Document' })).toBeVisible();
      await expect(page.getByRole('button', { name: mode.modeLabel })).toBeVisible();
    }
    await expect(page.locator('body')).toContainText(mode.routeMarker);
    await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();
  }
});

test('create perspective preserves branding and icons overlay compatibility entries', async ({ page }) => {
  for (const entryId of ['branding', 'icons']) {
    const response = await page.goto(`/workspace/create?entry=${entryId}`, {
      waitUntil: 'networkidle',
    });

    expect(response?.ok(), `create perspective entry ${entryId} should respond successfully`).toBeTruthy();
    await expect(page.locator('body')).toContainText(`Create · ${entryId}`);
    await expect(page.locator('body')).toContainText(`workspace: design/${entryId}`);
    await expect(page.getByRole('navigation', { name: 'Create entries' })).toContainText('Branding');
    await expect(page.getByRole('navigation', { name: 'Create entries' })).toContainText('Icons');
    await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();
  }
});

test('create perspective preserves podcast media overlay compatibility entry', async ({ page }) => {
  const response = await page.goto('/workspace/create?entry=podcast', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create perspective podcast entry should respond successfully').toBeTruthy();
  await expect(page.locator('body')).toContainText('Create · podcast');
  await expect(page.locator('body')).toContainText('workspace: media/podcast');
  await expect(page.getByRole('navigation', { name: 'Create entries' })).toContainText('Podcast');
});

test('build perspective assistant surface stays entry-consistent for canonical and overlay routes', async ({ page }) => {
  for (const entryId of ['application', 'logic', 'ai', 'conversion']) {
    const response = await page.goto(`/workspace/build?entry=${entryId}`, {
      waitUntil: 'networkidle',
    });

    expect(response?.ok(), `build ${entryId} route should respond successfully`).toBeTruthy();
    await expect(page.locator('body')).toContainText(`Build · ${entryId}`);
    await expect(page.locator('body')).toContainText(`workspace: build/${entryId}`);
    await expect(page.getByTestId('assistant-surface-panel')).toContainText('perspective: build');
    await expect(page.getByTestId('assistant-surface-panel')).toContainText('active: assistant.build');
    await expect(page.getByTestId('assistant-surface-panel')).toContainText('visible: assistant.build');
  }
});

test('publish perspective assistant surface stays entry-consistent for governance and system entries', async ({ page }) => {
  for (const entryId of ['governance', 'versioning', 'tokens', 'components', 'themes', 'variants']) {
    const response = await page.goto(`/workspace/publish?entry=${entryId}`, {
      waitUntil: 'networkidle',
    });

    expect(response?.ok(), `publish ${entryId} route should respond successfully`).toBeTruthy();
    await expect(page.locator('body')).toContainText(`Publish · ${entryId}`);
    await expect(page.getByTestId('assistant-surface-panel')).toContainText('perspective: publish');
    await expect(page.getByTestId('assistant-surface-panel')).toContainText('active: assistant.publish');
    await expect(page.getByTestId('assistant-surface-panel')).toContainText('visible: assistant.publish');
  }
});

test('collaborate perspective assistant surface stays entry-consistent across review and knowledge routes', async ({ page }) => {
  for (const entryId of ['review', 'production', 'knowledge', 'education']) {
    const response = await page.goto(`/workspace/collaborate?entry=${entryId}`, {
      waitUntil: 'networkidle',
    });

    expect(response?.ok(), `collaborate ${entryId} route should respond successfully`).toBeTruthy();
    await expect(page.locator('body')).toContainText(`Collaborate · ${entryId}`);
    await expect(page.getByTestId('assistant-surface-panel')).toContainText('perspective: collaborate');
    await expect(page.getByTestId('assistant-surface-panel')).toContainText('active: assistant.knowledge');
    await expect(page.getByTestId('assistant-surface-panel')).toContainText('visible: assistant.knowledge');
  }
});
