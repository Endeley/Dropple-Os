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
    path: '/workspace/design',
    expected: 'Create',
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
    expected: 'Create',
  },
  {
    path: '/workspace/animation',
    expected: 'Create',
  },
  {
    path: '/workspace/video',
    expected: 'Create',
  },
  {
    path: '/workspace/podcast',
    expected: 'Create',
  },
  {
    path: '/workspace/audio',
    expected: 'Create',
  },
  {
    path: '/workspace/automation',
    expected: 'Build',
    expectedButton: 'Export',
  },
  {
    path: '/workspace/build',
    expected: 'Build',
  },
  {
    path: '/workspace/conversion',
    expected: 'Build',
    expectedButton: 'Export',
  },
  {
    path: '/workspace/ai',
    expected: 'Build',
  },
  {
    path: '/workspace/systems-engineering',
    expected: 'Operate',
    expectedPanelText: 'Canonical build overlay for architecture graph',
  },
  {
    path: '/workspace/enterprise-operations',
    expected: 'Operate',
    expectedPanelText: 'Canonical build overlay for process modeling',
  },
  {
    path: '/workspace/education',
    expected: 'Collaborate',
  },
  {
    path: '/workspace/collaborate',
    expected: 'Collaborate',
  },
  {
    path: '/workspace/new',
    expectedToolId: 'select',
  },
  {
    path: '/workspace/overview',
    expected: 'Project Hub',
  },
  {
    path: '/workspace/system',
    expected: 'Publish',
  },
  {
    path: '/workspace/versioning',
    expected: 'Publish',
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
  await expect(page.locator('body')).toContainText('Operations');
  await expect(page.getByRole('link', { name: 'Open Project' })).toBeVisible();
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
  await expect(page.getByRole('link', { name: 'Open Project' })).toHaveAttribute(
    'href',
    '/workspace/new?doc=doc-recent-1',
  );
});

test('marketplace route exposes blueprint categories and category filter', async ({ page }) => {
  const response = await page.goto('/marketplace', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'marketplace route should respond successfully').toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Blueprint Categories' })).toBeVisible();
  await expect(page.locator('body')).toContainText('Business');
  await expect(page.locator('body')).toContainText('Creative');
  await expect(page.locator('body')).toContainText('Technology');
  await expect(page.locator('body')).toContainText('Engineering');
  await expect(page.locator('body')).toContainText('Education');
  await expect(page.locator('body')).toContainText('Operations');
  await expect(page.getByRole('combobox').first()).toContainText('All blueprint categories');
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
  await expect(page.getByRole('navigation', { name: 'Project perspectives' })).toContainText('Overview');
  await expect(page.getByRole('navigation', { name: 'Project perspectives' })).toContainText('Create');
  await expect(page.getByRole('navigation', { name: 'Project perspectives' })).toContainText('Build');
  await expect(page.getByRole('navigation', { name: 'Project perspectives' })).toContainText('Operate');
  await expect(page.getByRole('navigation', { name: 'Project perspectives' })).toContainText('Collaborate');
  await expect(page.getByRole('navigation', { name: 'Project perspectives' })).toContainText('Publish');
  await expect(page.getByTestId('project-hub-panel')).toBeVisible();
  await expect(page.locator('body')).toContainText('perspectives: 6');
  await expect(page.locator('body')).toContainText('projectId:');
  await expect(page.locator('body')).toContainText('project name:');
  await expect(page.locator('body')).toContainText('blueprintId:');
  await expect(page.locator('body')).toContainText('owner:');
  await expect(page.locator('body')).toContainText('updatedAt:');
});

test('project perspective links preserve universe continuity state across hops', async ({ page }) => {
  const response = await page.goto('/workspace/create?blueprint=bp.logistics.v1&bootstrap=1&z=0.3&u=group%3Aoperate&uq=operate', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'perspective continuity route should respond successfully').toBeTruthy();
  await page.getByRole('link', { name: 'Build' }).click();

  await expect(page).toHaveURL(/\/workspace\/build\?/);
  await expect(page).toHaveURL(/[\?&]z=0\.300/);
  await expect(page).toHaveURL(/[\?&]u=group%3Aoperate/);
  await expect(page).toHaveURL(/[\?&]uq=operate/);
  await expect(page).toHaveURL(/[\?&]pf=create/);
  await expect(page).toHaveURL(/[\?&]pt=build/);
  await expect(page).toHaveURL(/[\?&]pu=group%3Aoperate/);
  await expect(page.getByTestId('project-shell-transition-context')).toContainText('Create -> Build');
  await expect(page.getByTestId('project-universe-status-summary')).toContainText('artifacts');
});

test('project universe node handoff preserves world state while diving into the editor', async ({ page }) => {
  const response = await page.goto('/workspace/create?blueprint=bp.startup.v1&bootstrap=1&z=1.000&x=8.37&y=4.20', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'universe handoff route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('project-universe-node-document:primary')).toContainText('Document');
  await page.getByTestId('project-universe-node-document:primary').click();

  await expect(page).toHaveURL(/\/workspace\/create\?/);
  await expect(page).toHaveURL(/[\?&]entry=document/);
  await expect(page).toHaveURL(/[\?&]u=document%3Aprimary/);
  await expect(page).toHaveURL(/[\?&]pf=create/);
  await expect(page).toHaveURL(/[\?&]pt=create/);
  await expect(page).toHaveURL(/[\?&]pl=Untitled/);
  await expect(page).toHaveURL(/[\?&]pe=document/);
  await expect(page).toHaveURL(/[\?&]x=8\.37/);
  await expect(page).toHaveURL(/[\?&]y=4\.20/);
  await expect(page).toHaveURL(/[\?&]z=1\.000/);
  await expect(page.locator('body')).toContainText('Active context: Create > Document');
  await expect(page.getByTestId('project-shell-transition-context')).toContainText('dive: Untitled');
});

test('project perspective route bootstrap installs a single blueprint deterministically', async ({ page }) => {
  const response = await page.goto('/workspace/create?blueprint=bp.startup.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'project bootstrap route should respond successfully').toBeTruthy();
  await page.getByTestId('create-shell-utility-tab-blueprints').click();
  await expect(page.locator('body')).toContainText('Bootstrap');
  await expect(page.locator('body')).toContainText('Active blueprint: bp.startup.v1');
  await expect(page.locator('body')).toContainText('Version: bp.startup.v1');
  await expect(page.getByTestId('project-universe-status-summary')).toContainText('artifacts');
});

test('project perspective route bootstrap composes multiple blueprints deterministically', async ({ page }) => {
  const response = await page.goto(
    '/workspace/create?blueprints=bp.startup.v1,bp.logistics.v1&bootstrap=1',
    { waitUntil: 'networkidle' },
  );

  expect(response?.ok(), 'composed bootstrap route should respond successfully').toBeTruthy();
  await page.getByTestId('create-shell-utility-tab-blueprints').click();
  await expect(page.locator('body')).toContainText('Bootstrap');
  await expect(page.locator('body')).toContainText(/Active blueprint:\s+bp\.compose\./);
  await expect(page.locator('body')).toContainText(/Version:\s+bp\.compose\./);
  await expect(page.getByTestId('project-universe-status-summary')).toContainText('artifacts');
});

test('project universe semantic zoom tiers expose deterministic focus and detail levels', async ({ page }) => {
  const farResponse = await page.goto('/workspace/create?blueprint=bp.startup.v1&bootstrap=1&z=0.3', {
    waitUntil: 'networkidle',
  });

  expect(farResponse?.ok(), 'far zoom bootstrap route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('project-universe-status-summary')).toContainText('artifacts');
  await page.getByTestId('project-universe-status-details').getByText('View status').click();
  await expect(page.getByTestId('project-universe-status-tier')).toContainText('tier far');
  await expect(page.getByTestId('project-universe-status-details')).toContainText('domains');
  await expect(page.getByTestId('project-universe-status-details')).toContainText('hidden');
  await expect(page.getByTestId('project-universe-group-create')).toContainText('Create');
  await expect(page.getByTestId('project-universe-group-create')).toContainText('3 artifacts');
  await expect(page.getByTestId('project-universe-node-document:primary')).toHaveCount(0);

  const logisticsFarResponse = await page.goto('/workspace/create?blueprint=bp.logistics.v1&bootstrap=1&z=0.3', {
    waitUntil: 'networkidle',
  });

  expect(logisticsFarResponse?.ok(), 'far zoom logistics bootstrap route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('project-universe-group-create')).toContainText('Create');
  await expect(page.getByTestId('project-universe-group-operate')).toContainText('Operate');

  const normalResponse = await page.goto('/workspace/create?blueprint=bp.startup.v1&bootstrap=1&z=1', {
    waitUntil: 'networkidle',
  });

  expect(normalResponse?.ok(), 'normal zoom bootstrap route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('project-universe-status-summary')).toContainText('artifacts');
  await page.getByTestId('project-universe-status-details').getByText('View status').click();
  await expect(page.getByTestId('project-universe-status-tier')).toContainText('tier normal');
  await expect(page.getByTestId('project-universe-status-details')).toContainText('label-kind');
  await expect(page.getByTestId('project-universe-node-document:primary')).toContainText('Document');
  await expect(page.getByTestId('project-universe-group-create')).toHaveCount(0);

  const microResponse = await page.goto('/workspace/create?blueprint=bp.startup.v1&bootstrap=1&z=3', {
    waitUntil: 'networkidle',
  });

  expect(microResponse?.ok(), 'micro zoom bootstrap route should respond successfully').toBeTruthy();
  await page.getByTestId('project-universe-status-details').getByText('View status').click();
  await expect(page.getByTestId('project-universe-status-tier')).toContainText('tier micro');
  await expect(page.getByTestId('project-universe-status-details')).toContainText('inspect');
  await expect(page.getByTestId('project-universe-status-details')).toContainText('metadata');
  await expect(page.getByTestId('project-universe-node-document:primary')).toContainText(/[0-9a-f]{8}-/i);
});

test('project universe navigator search and jump stay route-driven and deterministic', async ({ page }) => {
  const response = await page.goto('/workspace/create?blueprint=bp.logistics.v1&bootstrap=1&z=0.3', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'universe navigator route should respond successfully').toBeTruthy();
  await page.getByTestId('create-shell-utility-tab-navigate').click();
  await page.getByLabel('Navigator search').fill('operate');
  await expect(page.getByTestId('project-universe-nav-group:operate')).toContainText('Operate');
  await page.getByTestId('project-universe-nav-group:operate').click();

  await expect(page).toHaveURL(/[\?&]u=group%3Aoperate/);
  await expect(page).toHaveURL(/[\?&]uq=operate/);
  await page.getByTestId('project-universe-status-details').getByText('View status').click();
  await expect(page.getByTestId('project-universe-status-tier')).toContainText('tier far');
});

test('create perspective exposes linked artifact workflow routes', async ({ page }) => {
  const response = await page.goto('/workspace/create?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create workflow route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('create-workflow-panel')).toBeVisible();
  await expect(page.getByTestId('create-workflow-suggested-next')).toContainText('Continue Creating');
  await expect(page.getByTestId('create-workflow-cluster-interface')).toContainText('Interface');
  await expect(page.getByTestId('create-workflow-cluster-document')).toContainText('Document');
  await expect(page.getByTestId('create-workflow-link-document:primary')).toBeVisible();
  await page.getByTestId('create-workflow-link-document:primary').click();
  await expect(page).toHaveURL(/[\?&]entry=document/);
  await expect(page).toHaveURL(/[\?&]u=document%3Aprimary/);
  await expect(page.locator('body')).toContainText('Active context: Create > Document');
});

test('create shell consolidates project utilities behind a single tabbed panel', async ({ page }) => {
  const response = await page.goto('/workspace/create?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create cleanup route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('create-shell-utility-panel')).toBeVisible();
  await expect(page.getByTestId('create-shell-utility-panel')).toContainText('Create Studio');
  await expect(page.getByTestId('create-shell-utility-panel')).toContainText('Project Context');
  await expect(page.getByTestId('create-shell-utility-panel')).not.toContainText('Recent');
  await expect(page.getByTestId('create-shell-utility-panel')).not.toContainText('Universe');
  await expect(page.getByLabel('Navigator search')).toHaveCount(0);

  await page.getByTestId('create-shell-utility-tab-navigate').click();
  await expect(page.getByLabel('Navigator search')).toBeVisible();
  await expect(page.getByTestId('create-shell-utility-panel')).toContainText('Recent');
  await expect(page.getByTestId('create-shell-utility-panel')).toContainText('Universe');
  await expect(page.getByTestId('create-shell-utility-panel')).toContainText('All Entries');

  await page.getByTestId('create-shell-utility-tab-blueprints').click();
  await expect(page.getByLabel('Blueprint chooser')).toBeVisible();
  await expect(page.getByTestId('create-shell-utility-panel')).toContainText('Upgrade Blueprint');
});

test('create shell consolidates inspector hierarchy behind focused dock tabs', async ({ page }) => {
  const response = await page.goto('/workspace/create', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create inspector cleanup route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('inspector-tab-inspect')).toBeVisible();
  await expect(page.getByTestId('inspector-tab-surface')).toBeVisible();
  await expect(page.getByTestId('inspector-tab-library')).toBeVisible();

  await expect(page.getByTestId('inspector-empty-state')).toContainText('No active selection');
  await expect(page.locator('.panel-content')).not.toContainText('Selection');
  await expect(page.locator('.panel-content')).not.toContainText('Motion & Export');
  await expect(page.locator('.panel-content')).not.toContainText('Certified Templates');

  await page.getByTestId('inspector-tab-surface').click();
  await expect(page.locator('.panel-content')).toContainText('Canvas Surface');
  await expect(page.locator('.panel-content')).toContainText('Signals');

  await page.getByTestId('inspector-tab-library').click();
  await expect(page.locator('.panel-content')).toContainText('Blueprint Library');
  await expect(page.locator('.panel-content')).toContainText('Certified Templates');
});

test('create shell keeps timeline compact until a motion-capable node is active', async ({ page }) => {
  const response = await page.goto('/workspace/create', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create timeline compact route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('uiux-transition-timeline')).toHaveAttribute('data-state', 'inactive');
  await expect(page.getByTestId('uiux-transition-timeline-inactive')).toContainText(
    'Motion tools appear when a motion-capable node is active',
  );
  await expect(page.getByTestId('uiux-transition-timeline')).not.toContainText('Add Keyframe');
});

test('create shell keeps the canvas as the dominant layout surface', async ({ page }) => {
  const response = await page.goto('/workspace/create?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create canvas layout route should respond successfully').toBeTruthy();

  const leftDock = await page.getByTestId('uiux-left-dock').boundingBox();
  const canvasDock = await page.getByTestId('uiux-canvas-dock').boundingBox();
  const rightDock = await page.getByTestId('uiux-right-dock').boundingBox();
  const bottomDock = await page.getByTestId('uiux-bottom-dock').boundingBox();

  expect(leftDock).toBeTruthy();
  expect(canvasDock).toBeTruthy();
  expect(rightDock).toBeTruthy();
  expect(bottomDock).toBeTruthy();

  expect(canvasDock.width).toBeGreaterThan(rightDock.width * 2);
  expect(canvasDock.width).toBeGreaterThan(leftDock.width * 8);
  expect(bottomDock.height).toBeLessThan(canvasDock.height / 3);
});

test('project shell assistant intent enqueues through canonical runtime bridge', async ({ page }) => {
  const response = await page.goto('/workspace/create?blueprint=bp.startup.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create bootstrap route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('assistant-surface-panel')).toBeVisible();
  await expect(page.getByTestId('assistant-surface-focus')).toContainText('Design Assistant for UI / UX');
  await expect(page.getByTestId('assistant-surface-details')).toContainText('Assistant details');

  await page.getByTestId('assistant-action-recommend').click();
  await expect(page.locator('body')).toContainText(/assistant intent:\s+enqueued:/);
});

test('create perspective assistant surface stays entry-consistent for design and media routes', async ({ page }) => {
  const designResponse = await page.goto('/workspace/create?entry=branding', {
    waitUntil: 'networkidle',
  });
  expect(designResponse?.ok(), 'create branding route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('assistant-surface-focus')).toContainText('Design Assistant for Branding');
  await expect(page.getByTestId('assistant-action-recommend')).toContainText('Ask Design Assistant');
  await expect(page.getByTestId('assistant-action-generate')).toContainText('Generate Brand Options');
  await expect(page.getByTestId('assistant-action-explain')).toContainText('Improve This Brand');

  const mediaResponse = await page.goto('/workspace/create?entry=animation', {
    waitUntil: 'networkidle',
  });
  expect(mediaResponse?.ok(), 'create animation route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('assistant-surface-focus')).toContainText('Media Assistant for Animation');
  await expect(page.getByTestId('assistant-action-recommend')).toContainText('Ask Media Assistant');
  await expect(page.getByTestId('assistant-action-generate')).toContainText('Generate Motion Options');
  await expect(page.getByTestId('assistant-action-explain')).toContainText('Improve This Sequence');

  const podcastResponse = await page.goto('/workspace/create?entry=podcast', {
    waitUntil: 'networkidle',
  });
  expect(podcastResponse?.ok(), 'create podcast route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('assistant-surface-focus')).toContainText('Media Assistant for Podcast');
  await expect(page.getByTestId('assistant-action-generate')).toContainText('Generate Podcast Options');
  await expect(page.getByTestId('assistant-action-explain')).toContainText('Improve This Episode');
});

test('design modes expose parity-stable shell chrome and strip signals', async ({ page }) => {
  const designModes = [
    { modeId: 'uiux', modeLabel: 'UI / UX', routeMarker: 'Create > UI / UX', uiuxShell: true },
    { modeId: 'graphic', modeLabel: 'Graphic', routeMarker: 'Create > Graphic', uiuxShell: false },
    { modeId: 'document', modeLabel: 'Document', routeMarker: 'Create > Document', uiuxShell: false },
  ];

  for (const mode of designModes) {
    const response = await page.goto(`/workspace/${mode.modeId}`, {
      waitUntil: 'networkidle',
    });

    expect(response?.ok(), `${mode.modeId} route should respond successfully`).toBeTruthy();
    if (mode.uiuxShell) {
      await expect(page.locator('.workspace-name')).toContainText('Create');
      await expect(page.locator('.workspace-mode')).toContainText('UI / UX');
      await expect(page.locator('.uiux-workspace-strip')).toContainText('Create > UI / UX');
      await expect(page.locator('.frame-indicator')).toContainText('Draft Surface');
      await expect(page.getByTestId('uiux-topbar-editor-group')).toContainText('Editor');
      await expect(page.getByTestId('uiux-topbar-editor-group')).toContainText('File');
      await expect(page.getByTestId('uiux-topbar-editor-group')).toContainText('Prototype');
      await expect(page.getByTestId('uiux-topbar-authoring-group')).toContainText('Authoring');
      await expect(page.getByTestId('uiux-topbar-authoring-group')).toContainText('Frame');
      await expect(page.getByTestId('uiux-topbar-authoring-group')).toContainText('Auto Layout');
      await expect(page.getByTestId('uiux-topbar-project-group')).toContainText('Project');
      await expect(page.getByRole('button', { name: 'Templates' })).toBeVisible();
      await expect(page.getByTestId('uiux-topbar-project-group')).toContainText('Share');
      await expect(page.getByTestId('uiux-topbar-project-group')).toContainText('Publish');
    } else {
      await expect(page.getByRole('navigation', { name: 'Project perspectives' })).toContainText('Create');
      await expect(page.getByRole('navigation', { name: 'Create entries' })).toContainText('UI / UX');
      await expect(page.getByRole('navigation', { name: 'Create entries' })).toContainText('Graphic');
      await expect(page.getByRole('navigation', { name: 'Create entries' })).toContainText('Document');
    }
    await expect(page.locator('body')).toContainText(mode.routeMarker);
    await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();
    await expect(page.getByLabel('Workspace switcher')).toHaveCount(0);
    await expect(page.getByLabel('Mode switcher')).toHaveCount(0);
  }
});

test('project perspective routes hide nested workspace and mode switchers', async ({ page }) => {
  for (const path of ['/workspace/graphic', '/workspace/media', '/workspace/build', '/workspace/collaborate', '/workspace/system', '/workspace/automation']) {
    const response = await page.goto(path, {
      waitUntil: 'networkidle',
    });

    expect(response?.ok(), `${path} should respond successfully`).toBeTruthy();
    await expect(page.getByRole('navigation', { name: 'Project perspectives' })).toBeVisible();
    await expect(page.getByLabel('Workspace switcher')).toHaveCount(0);
    await expect(page.getByLabel('Mode switcher')).toHaveCount(0);
  }
});

test('create perspective preserves branding and icons overlay compatibility entries', async ({ page }) => {
  for (const entryId of ['branding', 'icons']) {
    const response = await page.goto(`/workspace/create?entry=${entryId}`, {
      waitUntil: 'networkidle',
    });

    expect(response?.ok(), `create perspective entry ${entryId} should respond successfully`).toBeTruthy();
    await expect(page.locator('body')).toContainText('Create');
    await expect(page.locator('body')).toContainText(`Active context: Create > ${entryId === 'branding' ? 'Branding' : 'Icons'}`);
    await page.getByTestId('project-shell-runtime-details').getByText('Shell details').click();
    await expect(page.getByTestId('project-shell-runtime-label')).toContainText(`runtime: design/${entryId}`);
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
  await expect(page.locator('body')).toContainText('Create');
  await expect(page.locator('body')).toContainText('Active context: Create > Podcast');
  await page.getByTestId('project-shell-runtime-details').getByText('Shell details').click();
  await expect(page.getByTestId('project-shell-runtime-label')).toContainText('runtime: media/podcast');
  await expect(page.getByRole('navigation', { name: 'Create entries' })).toContainText('Podcast');
});

test('build perspective assistant surface stays entry-consistent for canonical and overlay routes', async ({ page }) => {
  const expectedBuildEntries = {
    application: {
      specialization: 'Application',
      runtimeMode: 'application',
      recommendLabel: 'Ask Build Assistant',
      generateLabel: 'Generate App Options',
      explainLabel: 'Improve This App',
    },
    automation: {
      specialization: 'Automation',
      runtimeMode: 'automation',
      recommendLabel: 'Ask Build Assistant',
      generateLabel: 'Generate Workflow Options',
      explainLabel: 'Improve This Workflow',
    },
    logic: {
      specialization: 'Logic',
      runtimeMode: 'logic',
      recommendLabel: 'Ask Build Assistant',
      generateLabel: 'Generate Logic Options',
      explainLabel: 'Improve This Logic',
    },
    ai: {
      specialization: 'AI',
      runtimeMode: 'ai-build',
      recommendLabel: 'Ask Build Assistant',
      generateLabel: 'Generate AI Options',
      explainLabel: 'Improve This Agent',
    },
    conversion: {
      specialization: 'Conversion',
      runtimeMode: 'conversion',
      recommendLabel: 'Ask Build Assistant',
      generateLabel: 'Generate Conversion Options',
      explainLabel: 'Improve This Pipeline',
    },
  };

  for (const entryId of Object.keys(expectedBuildEntries)) {
    const response = await page.goto(`/workspace/build?entry=${entryId}`, {
      waitUntil: 'networkidle',
    });

    expect(response?.ok(), `build ${entryId} route should respond successfully`).toBeTruthy();
    await expect(page.locator('body')).toContainText('Build');
    await expect(page.locator('body')).toContainText(`Active context: Build > ${expectedBuildEntries[entryId].specialization}`);
    await page.getByTestId('project-shell-runtime-details').getByText('Shell details').click();
    await expect(page.getByTestId('project-shell-runtime-label')).toContainText(
      `runtime: build/${expectedBuildEntries[entryId].runtimeMode}`,
    );
    await expect(page.getByTestId('assistant-surface-focus')).toContainText(
      `Build Assistant for ${expectedBuildEntries[entryId].specialization}`,
    );
    await expect(page.getByTestId('assistant-action-recommend')).toContainText(expectedBuildEntries[entryId].recommendLabel);
    await expect(page.getByTestId('assistant-action-generate')).toContainText(expectedBuildEntries[entryId].generateLabel);
    await expect(page.getByTestId('assistant-action-explain')).toContainText(expectedBuildEntries[entryId].explainLabel);
  }
});

test('build perspective exposes linked workflow guidance and operate handoff routes', async ({ page }) => {
  const response = await page.goto('/workspace/build?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'build workflow route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('build-workflow-panel')).toBeVisible();
  await expect(page.getByTestId('build-workflow-suggested-next')).toContainText('Continue Building');
  await expect(page.getByTestId('build-workflow-cluster-application')).toContainText('Application');
  const applicationLink = page.getByTestId('build-workflow-cluster-application').getByRole('button').first();
  await expect(applicationLink).toBeVisible();
  await applicationLink.click();
  await expect(page).toHaveURL(/[\?&]entry=application/);
  await expect(page).toHaveURL(/[\?&]u=system%3Amodel/);
  await expect(page.locator('body')).toContainText('Active context: Build > Application');

  await page.goto('/workspace/build?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });
  await page.getByTestId('build-workflow-operate-handoff').click();
  await expect(page).toHaveURL(/\/workspace\/operate\?/);
  await expect(page).toHaveURL(/[\?&]entry=systems-engineering/);
  await expect(page.locator('body')).toContainText('Active context: Operate > Systems Engineering');
});

test('operate overlays expose deterministic systems and operations panels', async ({ page }) => {
  let response = await page.goto('/workspace/systems-engineering?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'systems engineering route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('systems-engineering-panel')).toContainText('Systems Engineering');
  await expect(page.getByTestId('systems-engineering-panel')).toContainText('Architecture graphs:');
  await expect(page.getByTestId('systems-engineering-panel')).toContainText('Continue in Systems Engineering');

  response = await page.goto('/workspace/enterprise-operations?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'enterprise operations route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('enterprise-operations-panel')).toContainText('Enterprise Operations');
  await expect(page.getByTestId('enterprise-operations-panel')).toContainText('Processes:');
  await expect(page.getByTestId('enterprise-operations-panel')).toContainText('Continue in Enterprise Operations');
});

test('operate perspective assistant surface stays entry-consistent across workflow and operations routes', async ({ page }) => {
  const expectedOperateEntries = {
    automation: {
      specialization: 'Automation',
      runtime: 'build/automation',
      recommendLabel: 'Ask Operations Assistant',
      generateLabel: 'Generate Workflow Options',
      explainLabel: 'Improve This Workflow',
    },
    'systems-engineering': {
      specialization: 'Systems Engineering',
      runtime: 'build/systems-engineering',
      recommendLabel: 'Ask Operations Assistant',
      generateLabel: 'Generate System Options',
      explainLabel: 'Improve This System Model',
    },
    'enterprise-operations': {
      specialization: 'Enterprise Operations',
      runtime: 'build/enterprise-operations',
      recommendLabel: 'Ask Operations Assistant',
      generateLabel: 'Generate Operations Options',
      explainLabel: 'Improve This Process',
    },
    production: {
      specialization: 'Production',
      runtime: 'collaborate/production',
      recommendLabel: 'Ask Operations Assistant',
      generateLabel: 'Generate Production Options',
      explainLabel: 'Improve This Runbook',
    },
    governance: {
      specialization: 'Governance',
      runtime: 'system/governance',
      recommendLabel: 'Ask Operations Assistant',
      generateLabel: 'Generate Governance Options',
      explainLabel: 'Improve This Policy',
    },
  };

  for (const entryId of Object.keys(expectedOperateEntries)) {
    const response = await page.goto(`/workspace/operate?entry=${entryId}`, {
      waitUntil: 'networkidle',
    });

    expect(response?.ok(), `operate ${entryId} route should respond successfully`).toBeTruthy();
    await expect(page.locator('body')).toContainText('Operate');
    await expect(page.locator('body')).toContainText(
      `Active context: Operate > ${expectedOperateEntries[entryId].specialization}`,
    );
    await page.getByTestId('project-shell-runtime-details').getByText('Shell details').click();
    await expect(page.getByTestId('project-shell-runtime-label')).toContainText(
      `runtime: ${expectedOperateEntries[entryId].runtime}`,
    );
    await expect(page.getByTestId('assistant-surface-focus')).toContainText(
      `Operations Assistant for ${expectedOperateEntries[entryId].specialization}`,
    );
    await expect(page.getByTestId('assistant-action-recommend')).toContainText(expectedOperateEntries[entryId].recommendLabel);
    await expect(page.getByTestId('assistant-action-generate')).toContainText(expectedOperateEntries[entryId].generateLabel);
    await expect(page.getByTestId('assistant-action-explain')).toContainText(expectedOperateEntries[entryId].explainLabel);
  }
});

test('publish perspective assistant surface stays entry-consistent for governance and system entries', async ({ page }) => {
  const expectedPublishEntries = {
    governance: {
      specialization: 'Governance',
      recommendLabel: 'Ask Publishing Assistant',
      generateLabel: 'Generate Governance Options',
      explainLabel: 'Improve This Policy',
    },
    versioning: {
      specialization: 'Versioning',
      recommendLabel: 'Ask Publishing Assistant',
      generateLabel: 'Generate Release Options',
      explainLabel: 'Improve This Version Plan',
    },
    tokens: {
      specialization: 'Tokens',
      recommendLabel: 'Ask Publishing Assistant',
      generateLabel: 'Generate Token Options',
      explainLabel: 'Improve This Token Set',
    },
    components: {
      specialization: 'Components',
      recommendLabel: 'Ask Publishing Assistant',
      generateLabel: 'Generate Component Options',
      explainLabel: 'Improve This Component Library',
    },
    themes: {
      specialization: 'Themes',
      recommendLabel: 'Ask Publishing Assistant',
      generateLabel: 'Generate Theme Options',
      explainLabel: 'Improve This Theme',
    },
    variants: {
      specialization: 'Variants',
      recommendLabel: 'Ask Publishing Assistant',
      generateLabel: 'Generate Variant Options',
      explainLabel: 'Improve This Variant Set',
    },
  };

  for (const entryId of Object.keys(expectedPublishEntries)) {
    const response = await page.goto(`/workspace/publish?entry=${entryId}`, {
      waitUntil: 'networkidle',
    });

    expect(response?.ok(), `publish ${entryId} route should respond successfully`).toBeTruthy();
    await expect(page.locator('body')).toContainText('Publish');
    await expect(page.locator('body')).toContainText(`Active context: Publish > ${expectedPublishEntries[entryId].specialization}`);
    await expect(page.getByTestId('assistant-surface-focus')).toContainText(
      `Publishing Assistant for ${expectedPublishEntries[entryId].specialization}`,
    );
    await expect(page.getByTestId('assistant-action-recommend')).toContainText(expectedPublishEntries[entryId].recommendLabel);
    await expect(page.getByTestId('assistant-action-generate')).toContainText(expectedPublishEntries[entryId].generateLabel);
    await expect(page.getByTestId('assistant-action-explain')).toContainText(expectedPublishEntries[entryId].explainLabel);
  }
});

test('collaborate perspective assistant surface stays entry-consistent across review and knowledge routes', async ({ page }) => {
  for (const entryId of ['review', 'production', 'knowledge', 'education']) {
    const response = await page.goto(`/workspace/collaborate?entry=${entryId}`, {
      waitUntil: 'networkidle',
    });

    expect(response?.ok(), `collaborate ${entryId} route should respond successfully`).toBeTruthy();
    await expect(page.locator('body')).toContainText('Collaborate');
    await expect(page.locator('body')).toContainText(`Active context: Collaborate > ${entryId[0].toUpperCase()}${entryId.slice(1)}`);
    await expect(page.getByTestId('assistant-surface-panel')).toBeVisible();
    await expect(page.getByTestId('assistant-surface-details')).toContainText('Assistant details');
    await expect(page.getByTestId('assistant-action-recommend')).toBeVisible();
    await expect(page.getByTestId('assistant-action-generate')).toBeVisible();
    await expect(page.getByTestId('assistant-action-explain')).toBeVisible();
  }
});

test('collaborate perspective exposes linked workflow guidance and publish handoff routes', async ({ page }) => {
  const response = await page.goto('/workspace/collaborate?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'collaborate workflow route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('collaborate-workflow-panel')).toBeVisible();
  await expect(page.getByTestId('collaborate-workflow-suggested-next')).toContainText('Continue Collaborating');
  await expect(page.getByTestId('collaborate-workflow-cluster-knowledge')).toContainText('Knowledge');
  await page.getByTestId('collaborate-workflow-link-document:primary-knowledge').click();
  await expect(page).toHaveURL(/[\?&]entry=knowledge/);
  await expect(page).toHaveURL(/[\?&]u=document%3Aprimary/);
  await expect(page.locator('body')).toContainText('Active context: Collaborate > Knowledge');

  await page.goto('/workspace/collaborate?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });
  await page.getByTestId('collaborate-workflow-publish-handoff').click();
  await expect(page).toHaveURL(/\/workspace\/publish\?/);
  await expect(page).toHaveURL(/[\?&]entry=review/);
  await expect(page.locator('body')).toContainText('Active context: Publish > Review');
});
