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
  await expect(page.locator('body')).toContainText('Project Hub');
  await expect(page.locator('body')).toContainText('Project At A Glance');
  await expect(page.locator('body')).toContainText('Project Geography');
  await expect(page.locator('body')).toContainText('All Entries');
  await expect(page.locator('body')).toContainText('Project Bootstrap Provenance');
});

test('project perspective links preserve universe continuity state across hops', async ({ page }) => {
  const response = await page.goto('/workspace/create?blueprint=bp.logistics.v1&bootstrap=1&z=0.3&u=group%3Aoperate&uq=operate', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'perspective continuity route should respond successfully').toBeTruthy();
  await expect(page.locator('body')).toContainText('Bp Logistics V1');
  await expect(page.locator('body')).toContainText('Create > UI / UX');

  const buildResponse = await page.goto('/workspace/build?blueprint=bp.logistics.v1&bootstrap=1&entry=application&z=0.3&u=group%3Aoperate&uq=operate', {
    waitUntil: 'networkidle',
  });

  expect(buildResponse?.ok(), 'build continuity route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('project-universe-status-summary')).toContainText('artifacts');
  await expect(page.getByTestId('project-world-anchor-activity')).toContainText('Build / Application');
  await expect(page.getByTestId('project-world-anchor-focus')).toContainText('Operate');
});

test('project world continuity route envelope survives local camera mutations', async ({ page }) => {
  const response = await page.goto('/workspace/build?blueprint=bp.logistics.v1&bootstrap=1&entry=application&z=0.300&u=group%3Aoperate&uq=operate', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'world continuity route should respond successfully').toBeTruthy();
  await expect(page).toHaveURL(/[\?&]entry=application/);
  await expect(page).toHaveURL(/[\?&]u=group%3Aoperate/);

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page).toHaveURL(/[\?&]u=group%3Aoperate/);
  await expect(page.getByTestId('project-universe-status-summary')).toContainText('artifacts');
});

test('project shell exposes motion meaning and reduced-motion fallback contracts', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const response = await page.goto('/workspace/build?blueprint=bp.startup.v1&bootstrap=1&entry=application&z=1.000', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'reduced-motion route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('project-shell-root')).toHaveAttribute('data-motion-mode', 'reduced');
  await expect(page.getByTestId('project-shell-root')).toHaveAttribute('data-motion-meaning', 'world-continuity');
  await expect(page.getByTestId('project-universe-surface')).toHaveAttribute('data-motion-mode', 'reduced');
  await expect(page.getByTestId('project-universe-surface')).toHaveAttribute('data-motion-meaning', 'navigation');
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-motion-mode', 'reduced');
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-motion-meaning', 'context');
});

test('project universe exposes spatial pointer and camera readability contracts', async ({ page }) => {
  const response = await page.goto('/workspace/build?blueprint=bp.logistics.v1&bootstrap=1&entry=application&z=0.300', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'spatial pointer route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('project-universe-surface')).toHaveAttribute('data-pointer-surface', 'camera');
  await expect(page.getByTestId('project-universe-surface')).toHaveAttribute('data-pointer-mode', 'ready');
  await expect(page.getByTestId('project-universe-surface')).toHaveAttribute('data-camera-mode', 'free-pan');
  await expect(page.getByTestId('project-universe-minimap')).toHaveAttribute('data-pointer-role', 'reposition');
  await expect(page.getByTestId('project-universe-group-operate')).toHaveAttribute('data-pointer-role', 'focus-group');

  await page.getByTestId('project-universe-group-operate').click();
  await expect(page).toHaveURL(/[\?&]u=group%3Aoperate/);
  await expect(page.getByTestId('project-universe-surface')).toHaveAttribute('data-pointer-mode', 'focused');
  await expect(page.getByTestId('project-universe-surface')).toHaveAttribute('data-camera-mode', 'focus-anchor');
});

test('project universe node handoff preserves world state while diving into the editor and surfacing back', async ({ page }) => {
  const response = await page.goto('/workspace/build?blueprint=bp.startup.v1&bootstrap=1&entry=application&z=1.000&x=8.37&y=4.20', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'universe handoff route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('project-universe-node-document:primary')).toContainText('Document');
  await page.getByTestId('project-universe-node-document:primary').click();

  await expect(page).toHaveURL(/\/workspace\/create\?/);
  await expect(page).toHaveURL(/[\?&]entry=document/);
  await expect(page).toHaveURL(/[\?&]u=document%3Aprimary/);
  await expect(page.locator('body')).toContainText('Create > Document');
  await expect(page.getByTestId('project-shell-editor-emergence')).toContainText('Opened from Untitled');
  await expect(page.getByTestId('project-shell-editor-emergence')).toContainText('Back to Build / Application');

  await page.getByTestId('project-shell-surface-return').click();
  await expect(page).toHaveURL(/\/workspace\/build\?/);
  await expect(page).toHaveURL(/[\?&]entry=application/);
  await expect(page).toHaveURL(/[\?&]u=document%3Aprimary/);
  await expect(page.locator('body')).toContainText('Build > Application');
  await expect(page.getByTestId('project-universe-node-document:primary')).toHaveAttribute('data-focus-state', 'active');
  await expect(page.getByTestId('project-shell-editor-emergence')).toHaveCount(0);
});

test('project perspective route bootstrap installs a single blueprint deterministically', async ({ page }) => {
  const response = await page.goto('/workspace/build?blueprint=bp.startup.v1&bootstrap=1&entry=application', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'project bootstrap route should respond successfully').toBeTruthy();
  await expect(page.locator('body')).toContainText('Project Bootstrap Provenance');
  await expect(page.locator('body')).toContainText('blueprintId: bp.startup.v1');
  await expect(page.locator('body')).toContainText('blueprintVersion: bp.startup.v1');
  await expect(page.getByTestId('project-universe-status-summary')).toContainText('artifacts');
});

test('project perspective route bootstrap composes multiple blueprints deterministically', async ({ page }) => {
  const response = await page.goto(
    '/workspace/build?entry=application&blueprints=bp.startup.v1,bp.logistics.v1&bootstrap=1',
    { waitUntil: 'networkidle' },
  );

  expect(response?.ok(), 'composed bootstrap route should respond successfully').toBeTruthy();
  await expect(page.locator('body')).toContainText('Project Bootstrap Provenance');
  await expect(page.locator('body')).toContainText(/blueprintId:\s+bp\.compose\./);
  await expect(page.locator('body')).toContainText(/blueprintVersion:\s+bp\.compose\./);
  await expect(page.getByTestId('project-universe-status-summary')).toContainText('artifacts');
});

test('project universe semantic zoom tiers expose deterministic focus and detail levels', async ({ page }) => {
  const farResponse = await page.goto('/workspace/build?blueprint=bp.startup.v1&bootstrap=1&entry=application&z=0.3', {
    waitUntil: 'networkidle',
  });

  expect(farResponse?.ok(), 'far zoom bootstrap route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('project-universe-status-summary')).toContainText('artifacts');
  await page.getByTestId('project-universe-status-details').getByText('View status').click();
  await expect(page.getByTestId('project-universe-status-tier')).toContainText('tier far');
  await expect(page.getByTestId('project-universe-status-details')).toContainText('domains');
  await expect(page.getByTestId('project-universe-status-details')).toContainText('hidden');
  await expect(page.getByTestId('project-universe-group-create')).toContainText('Create');
  await expect(page.getByTestId('project-universe-node-document:primary')).toHaveCount(0);

  const logisticsFarResponse = await page.goto('/workspace/build?blueprint=bp.logistics.v1&bootstrap=1&entry=application&z=0.3', {
    waitUntil: 'networkidle',
  });

  expect(logisticsFarResponse?.ok(), 'far zoom logistics bootstrap route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('project-universe-group-create')).toContainText('Create');
  await expect(page.getByTestId('project-universe-group-operate')).toContainText('Operate');
  await expect(page.getByTestId('project-universe-group-create')).toHaveAttribute(
    'data-relationship-summary',
    /Produces|Publishes|Depends|Operates|Reviews/,
  );
  await expect(page.getByTestId('project-universe-group-operate')).toHaveAttribute(
    'data-relationship-summary',
    /Produces|Publishes|Depends|Operates|Reviews/,
  );

  const normalResponse = await page.goto('/workspace/build?blueprint=bp.startup.v1&bootstrap=1&entry=application&z=1', {
    waitUntil: 'networkidle',
  });

  expect(normalResponse?.ok(), 'normal zoom bootstrap route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('project-universe-status-summary')).toContainText('artifacts');
  await page.getByTestId('project-universe-status-details').getByText('View status').click();
  await expect(page.getByTestId('project-universe-status-tier')).toContainText('tier normal');
  await expect(page.getByTestId('project-universe-status-details')).toContainText('label-kind');
  await expect(page.getByTestId('project-universe-node-document:primary')).toContainText('Document');
  await expect(page.getByTestId('project-universe-group-create')).toHaveCount(0);

  const microResponse = await page.goto('/workspace/build?blueprint=bp.startup.v1&bootstrap=1&entry=application&z=3', {
    waitUntil: 'networkidle',
  });

  expect(microResponse?.ok(), 'micro zoom bootstrap route should respond successfully').toBeTruthy();
  await page.getByTestId('project-universe-status-details').getByText('View status').click();
  await expect(page.getByTestId('project-universe-status-tier')).toContainText('tier micro');
  await expect(page.getByTestId('project-universe-status-details')).toContainText('inspect');
  await expect(page.getByTestId('project-universe-status-details')).toContainText('metadata');
  await expect(page.getByTestId('project-universe-node-document:primary')).toContainText(/[0-9a-f]{8}-/i);
});

test('project universe deepens domain focus and supports return-to-project navigation', async ({ page }) => {
  const response = await page.goto('/workspace/build?blueprint=bp.logistics.v1&bootstrap=1&entry=application&z=0.300', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'project universe depth route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('project-universe-focus-summary')).toContainText('Project Hub');
  await expect(page.getByTestId('project-universe-geography-summary')).toBeVisible();
  await expect(page.getByTestId('project-universe-geography-summary')).toContainText('Project Geography');
  await expect(page.getByTestId('project-universe-geography-summary')).toContainText('North: Create');
  await expect(page.getByTestId('project-universe-geography-summary')).toContainText('South: Operate');
  await expect(page.getByTestId('project-universe-nav-project:hub')).toContainText('project universe anchor');
  await expect(page.getByTestId('project-universe-nav-group:operate')).toContainText('Priority path: Depends on Create');

  await page.getByTestId('project-universe-group-operate').click();
  await expect(page).toHaveURL(/[\?&]u=group%3Aoperate/);
  await expect(page.getByTestId('project-universe-group-operate')).toHaveAttribute('data-focus-state', 'active');
  await expect(page.getByTestId('project-universe-focus-summary')).toContainText('Operate');
  await expect(page.getByTestId('project-universe-focus-summary')).toContainText('artifact');

  await page.getByTestId('project-universe-return-to-hub').click();
  await expect(page).toHaveURL(/[\?&]u=project%3Ahub/);
  await expect(page.getByTestId('project-universe-focus-summary')).toContainText('project universe anchor');
  await expect(page.getByTestId('project-universe-focus-summary')).not.toContainText('Operate');
});

test('project world anchor keeps the universe legible across perspectives and can recenter on the hub', async ({ page }) => {
  const response = await page.goto('/workspace/build?blueprint=bp.logistics.v1&bootstrap=1&u=group%3Aoperate&uq=operate&z=0.300', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'project world anchor route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('project-world-anchor')).toBeVisible();
  await expect(page.getByTestId('project-world-anchor-project')).toContainText('Bp Logistics V1');
  await expect(page.getByTestId('project-world-anchor-activity')).toContainText('Build / Application');
  await expect(page.getByTestId('project-world-anchor-focus')).toContainText('Operate');
  await expect(page.getByTestId('project-world-anchor-subtitle')).toContainText('artifact');

  await page.getByTestId('project-world-anchor-hub').click();
  await expect(page).toHaveURL(/\/workspace\/build\?/);
  await expect(page).toHaveURL(/[\?&]u=project%3Ahub/);
  await expect(page.getByTestId('project-world-anchor-focus')).toContainText('Project Hub');
  await expect(page.getByTestId('project-world-anchor-subtitle')).toContainText('project world');
});

test('project universe navigator search and jump stay route-driven and deterministic', async ({ page }) => {
  const response = await page.goto('/workspace/build?blueprint=bp.logistics.v1&bootstrap=1&entry=application&z=0.3', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'universe navigator route should respond successfully').toBeTruthy();
  await page.getByLabel('Navigator search').fill('operate');
  await expect(page.getByTestId('project-universe-nav-group:operate')).toContainText('Operate');
  await page.getByTestId('project-universe-nav-group:operate').click();

  await expect(page).toHaveURL(/[\?&]u=group%3Aoperate/);
  await expect(page.getByTestId('project-universe-geography-summary')).toContainText('Southeast');
  await expect(page.getByTestId('project-universe-geography-summary')).toContainText('Southeast project region');
  await expect(page.getByTestId('project-universe-orientation-summary')).toBeVisible();
  await expect(page.getByTestId('project-universe-orientation-priority-summary')).toBeVisible();
  await expect(page.getByTestId('project-universe-orientation-priority-summary')).toContainText('Priority path');
  await expect(page.getByTestId('project-universe-orientation-priority-group:create')).toContainText('Priority path: depends on Create');
  await expect(page.getByTestId('project-universe-orientation-summary')).toContainText('Return');
  await expect(page.getByTestId('project-universe-orientation-summary')).toContainText('Upstream');
  await expect(page.getByTestId('project-universe-orientation-summary')).toContainText('Next likely');
  await expect(page.getByTestId('project-universe-focus-relies-on')).toContainText('Relies on');
  await expect(page.getByTestId('project-universe-focus-influences')).toContainText('Influences');
  await expect(page.getByTestId('project-universe-focus-matters-next')).toContainText('Matters next');
  await expect(page.getByTestId('project-universe-at-a-glance')).toBeVisible();
  await expect(page.getByTestId('project-universe-at-a-glance')).toContainText('Project At A Glance');
  await expect(page.getByTestId('project-universe-at-a-glance-exists')).toContainText('Exists:');
  await expect(page.getByTestId('project-universe-at-a-glance-active')).toContainText('Active:');
  await expect(page.getByTestId('project-universe-at-a-glance-next')).toContainText('Next:');
  await expect(page.getByTestId('project-universe-at-a-glance-blocked')).toContainText('Blocked:');
  await expect(page.getByTestId('project-universe-at-a-glance-done')).toContainText('Done:');
  await expect(page.getByTestId('project-universe-workflow-guide')).toBeVisible();
  await expect(page.getByTestId('project-universe-workflow-guide')).toContainText('What to do next');
  await expect(page.getByTestId('project-universe-workflow-guide')).toContainText('Now');
  await expect(page.getByTestId('project-universe-workflow-guide')).toContainText('Do next');
  await expect(page.getByTestId('project-universe-workflow-primary-next')).toContainText('Do next:');
  await expect(page.getByTestId('project-universe-workflow-primary-reason')).toContainText('Why now:');
  await expect(page.getByTestId('project-universe-workflow-causality')).toContainText('Matters next');
  await expect(page.getByTestId('project-universe-workflow-primary-source')).toContainText('From project world');
  await expect(page.getByTestId('project-universe-group-operate')).toHaveAttribute('data-causality-summary', /Matters next/);
  await expect(page.getByTestId('project-universe-orientation-return-project:hub')).toContainText('Bp Logistics V1');
  await page.getByTestId('project-universe-orientation-return-project:hub').click();
  await expect(page).toHaveURL(/[\?&]u=project%3Ahub/);
  await page.getByTestId('project-universe-orientation-next-group:operate').click();
  await expect(page).toHaveURL(/[\?&]u=group%3Aoperate/);
  await page.getByTestId('project-universe-status-details').getByText('View status').click();
  await expect(page.getByTestId('project-universe-status-tier')).toContainText('tier');
});

test('create perspective exposes linked artifact workflow routes', async ({ page }) => {
  const response = await page.goto('/workspace/create?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create workflow route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('create-world-panel')).toContainText('Create Now');
  await expect(page.locator('body')).toContainText('Create > UI / UX');
  await expect(page.getByTestId('create-world-panel')).toContainText('Frame Dispatch');
  await expect(page.getByTestId('create-world-summary')).toContainText('Focus: Untitled');
  await expect(page.getByTestId('create-world-summary')).toContainText('Assistant: Design Assistant');
  await expect(page.getByTestId('create-world-summary')).toContainText('Linked artifacts: 3');
  await expect(page.getByTestId('create-workflow-suggested-next')).toContainText('Continue Creating');
  await expect(page.getByTestId('create-workflow-suggested-next')).toContainText('Untitled');
  await expect(page.getByTestId('create-workflow-suggested-next')).toContainText('Document');
  await expect(page.getByTestId('create-workflow-suggested-next')).toBeHidden();

  const linkedResponse = await page.goto('/workspace/create?blueprint=bp.logistics.v1&bootstrap=1&entry=document&u=document%3Aprimary', {
    waitUntil: 'networkidle',
  });
  expect(linkedResponse?.ok(), 'linked create workflow route should respond successfully').toBeTruthy();
  await expect(page).toHaveURL(/[\?&]entry=document/);
  await expect(page).toHaveURL(/[\?&]u=document%3Aprimary/);
  await expect(page.locator('body')).toContainText('Create > Document');
});

test('world-based shell parity stays explicit across create build operate collaborate and publish', async ({ page }) => {
  const expectations = [
    {
      path: '/workspace/create?blueprint=bp.logistics.v1&bootstrap=1',
      activity: 'Create / UI / UX',
      panel: 'create-world-panel',
      summary: 'create-world-summary',
      label: 'Create Now',
    },
    {
      path: '/workspace/build?blueprint=bp.logistics.v1&bootstrap=1',
      activity: 'Build / Application',
      panel: 'build-world-panel',
      summary: 'build-world-summary',
      label: 'Build World',
    },
    {
      path: '/workspace/operate?entry=systems-engineering&blueprint=bp.logistics.v1&bootstrap=1',
      activity: 'Operate / Systems Engineering',
      panel: 'operate-world-panel',
      summary: 'operate-world-summary',
      label: 'Operate World',
    },
    {
      path: '/workspace/collaborate?blueprint=bp.logistics.v1&bootstrap=1',
      activity: 'Collaborate / Review',
      panel: 'collaborate-world-panel',
      summary: 'collaborate-world-summary',
      label: 'Collaborate World',
    },
    {
      path: '/workspace/publish?entry=governance',
      activity: 'Publish / Governance',
      panel: 'publish-world-panel',
      summary: 'publish-world-summary',
      label: 'Publish World',
    },
  ];

  for (const expectation of expectations) {
    const response = await page.goto(expectation.path, { waitUntil: 'networkidle' });
    expect(response?.ok(), `${expectation.path} should respond successfully`).toBeTruthy();
    await expect(page.getByTestId(expectation.panel)).toContainText(expectation.label);
    if (expectation.panel === 'create-world-panel') {
      await expect(page.getByTestId('uiux-world-editor')).toHaveAttribute('data-editor-unity', 'world-based');
      await expect(page.getByTestId('uiux-left-dock')).toBeVisible();
      await expect(page.getByTestId('uiux-canvas-dock')).toBeVisible();
      await expect(page.getByTestId('uiux-floating-controls')).toBeVisible();
      await expect(page.getByTestId(expectation.panel)).toContainText('Create Now');
      await expect(page.getByTestId(expectation.summary)).toContainText('Assistant: Design Assistant');
      await expect(page.getByTestId('assistant-surface-panel')).toBeHidden();
      await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-choreography-state', 'ready');
    } else {
      await expect(page.getByTestId('assistant-surface-panel')).toBeVisible();
      await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-choreography-state', 'ready');
      await expect(page.getByTestId('project-world-anchor')).toBeVisible();
      await expect(page.getByTestId('project-world-anchor-activity')).toContainText(expectation.activity);
      await expect(page.getByTestId('project-world-anchor-focus')).not.toHaveText('');
      await expect(page.getByTestId('project-world-anchor-hub')).toContainText('Project Hub');
      await expect(page.getByTestId('project-universe-surface')).toHaveAttribute('data-world-role', 'primary');
      await expect(page.getByTestId('project-universe-surface')).toHaveAttribute('data-world-comprehension', 'dominant');
      await expect(page.getByTestId('project-universe-dominance-panel')).toHaveAttribute('data-dominance', 'primary');
      await expect(page.getByTestId('project-universe-dominance-panel')).toHaveAttribute('data-anchor', 'persistent');
      await expect(page.getByTestId('project-universe-dominance-panel')).toHaveAttribute('data-geography', 'mapped');
      await expect(page.getByTestId('project-universe-dominance-panel')).not.toHaveAttribute('data-priority', 'none');
      await expect(page.getByTestId('project-universe-dominance-panel')).not.toHaveAttribute('data-workflow', 'missing');
      await expect(page.getByTestId('project-universe-dominance-summary')).toContainText('project comprehension');
      await expect(page.getByTestId(expectation.summary)).toContainText('Assistant:');
    }
    if (expectation.panel === 'operate-world-panel') {
      await expect(page.getByTestId('operate-room-panel')).toHaveAttribute('data-room-contract', 'operate-world');
      await expect(page.getByTestId('operate-room-panel')).toHaveAttribute('data-room-choreography', 'workflow-leading');
      await expect(page.getByTestId('operate-room-panel')).toHaveAttribute('data-room-workflow', 'leading');
      await expect(page.getByTestId('operate-room-panel')).toHaveAttribute('data-room-guidance', 'ready');
      await expect(page.getByTestId('operate-room-panel')).toHaveAttribute('data-room-anchor', 'anchored');
      await expect(page.getByTestId('operate-room-panel')).toHaveAttribute('data-room-focus', 'systems');
      await expect(page.getByTestId('operate-workflow-panel')).toBeVisible();
      await expect(page.getByTestId('operate-guidance-panel')).toBeVisible();
      await expect(page.getByTestId('operate-universe-anchor-panel')).toBeVisible();
    }
    if (expectation.panel === 'build-world-panel') {
      await expect(page.getByTestId('build-room-panel')).toHaveAttribute('data-room-contract', 'build-world');
      await expect(page.getByTestId('build-room-panel')).toHaveAttribute('data-room-choreography', 'workflow-leading');
      await expect(page.getByTestId('build-room-panel')).toHaveAttribute('data-room-workflow', 'leading');
      await expect(page.getByTestId('build-room-panel')).toHaveAttribute('data-room-handoff', 'ready');
      await expect(page.getByTestId('build-room-panel')).toHaveAttribute('data-room-focus', 'structure');
      await expect(page.getByTestId('build-workflow-panel')).toBeVisible();
    }
    if (expectation.panel === 'collaborate-world-panel') {
      await expect(page.getByTestId('collaborate-room-panel')).toHaveAttribute('data-room-contract', 'collaborate-world');
      await expect(page.getByTestId('collaborate-room-panel')).toHaveAttribute('data-room-choreography', 'review-focused');
      await expect(page.getByTestId('collaborate-room-panel')).toHaveAttribute('data-room-workflow', 'leading');
      await expect(page.getByTestId('collaborate-room-panel')).toHaveAttribute('data-room-handoff', 'ready');
      await expect(page.getByTestId('collaborate-room-panel')).toHaveAttribute('data-room-focus', 'review');
      await expect(page.getByTestId('collaborate-workflow-panel')).toBeVisible();
    }
    if (expectation.panel === 'publish-world-panel') {
      await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-contract', 'publish-world');
      await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-choreography', 'workflow-leading');
      await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-workflow', 'leading');
      await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-guidance', 'ready');
      await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-anchor', 'anchored');
      await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-focus', 'governance');
      await expect(page.getByTestId('publish-workflow-panel')).toBeVisible();
      await expect(page.getByTestId('publish-guidance-panel')).toBeVisible();
      await expect(page.getByTestId('publish-universe-anchor-panel')).toBeVisible();
    }
  }
});

test('shared room choreography stays parity-stable across build operate collaborate and publish', async ({ page }) => {
  const expectations = [
    {
      path: '/workspace/build?blueprint=bp.logistics.v1&bootstrap=1',
      room: 'build-room-panel',
      workflow: 'build-workflow-panel',
      focus: 'structure',
    },
    {
      path: '/workspace/operate?entry=systems-engineering&blueprint=bp.logistics.v1&bootstrap=1',
      room: 'operate-room-panel',
      workflow: 'operate-workflow-panel',
      focus: 'systems',
    },
    {
      path: '/workspace/collaborate?blueprint=bp.logistics.v1&bootstrap=1',
      room: 'collaborate-room-panel',
      workflow: 'collaborate-workflow-panel',
      choreography: 'review-focused',
      focus: 'review',
    },
    {
      path: '/workspace/publish?entry=governance&blueprint=bp.logistics.v1&bootstrap=1',
      room: 'publish-room-panel',
      workflow: 'publish-workflow-panel',
      focus: 'governance',
    },
  ];

  for (const expectation of expectations) {
    const response = await page.goto(expectation.path, { waitUntil: 'networkidle' });

    expect(response?.ok(), `${expectation.path} should respond successfully`).toBeTruthy();
    await expect(page.getByTestId(expectation.room)).toHaveAttribute('data-room-choreography', expectation.choreography ?? 'workflow-leading');
    await expect(page.getByTestId(expectation.room)).toHaveAttribute('data-room-workflow', 'leading');
    await expect(page.getByTestId(expectation.room)).toHaveAttribute('data-room-focus', expectation.focus);
    await expect(page.getByTestId(expectation.workflow)).toHaveAttribute('data-choreography-state', 'leading');
    await expect(page.getByTestId(expectation.workflow)).toHaveAttribute('data-context-visibility', 'expanded');
    await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-state', 'ready');
    await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-choreography-state', 'ready');
    await expect(page.getByTestId('assistant-surface-context')).toContainText('is ready');
  }
});

test('shared naturalness stays legible across create build operate collaborate and publish', async ({ page }) => {
  const expectations = [
    {
      path: '/workspace/create?blueprint=bp.logistics.v1&bootstrap=1',
      roomPanel: 'create-world-panel',
      roomLabel: 'Create Now',
      assistantLabel: 'Design Assistant',
      assistantContext: 'Assistant is ready to help the current Create activity.',
      roomBehavior: null,
    },
    {
      path: '/workspace/build?blueprint=bp.logistics.v1&bootstrap=1',
      roomPanel: 'build-world-panel',
      roomLabel: 'Build World',
      assistantLabel: 'Build Assistant',
      assistantContext: 'Build Assistant is ready',
      roomBehavior: 'workflow-leading',
    },
    {
      path: '/workspace/operate?entry=systems-engineering&blueprint=bp.logistics.v1&bootstrap=1',
      roomPanel: 'operate-world-panel',
      roomLabel: 'Operate World',
      assistantLabel: 'Operations Assistant',
      assistantContext: 'Operations Assistant is ready',
      roomBehavior: 'workflow-leading',
    },
    {
      path: '/workspace/collaborate?blueprint=bp.logistics.v1&bootstrap=1',
      roomPanel: 'collaborate-world-panel',
      roomLabel: 'Collaborate World',
      assistantLabel: 'Collaborate Assistant',
      assistantContext: 'Collaborate Assistant is ready',
      roomBehavior: 'review-focused',
    },
    {
      path: '/workspace/publish?entry=governance&blueprint=bp.logistics.v1&bootstrap=1',
      roomPanel: 'publish-world-panel',
      roomLabel: 'Publish World',
      assistantLabel: 'Publishing Assistant',
      assistantContext: 'Publishing Assistant is ready',
      roomBehavior: 'workflow-leading',
    },
  ];

  for (const expectation of expectations) {
    const response = await page.goto(expectation.path, { waitUntil: 'networkidle' });

    expect(response?.ok(), `${expectation.path} should respond successfully`).toBeTruthy();
    await expect(page.getByTestId(expectation.roomPanel)).toContainText(expectation.roomLabel);
    await expect(page.getByTestId(expectation.roomPanel)).toContainText(expectation.assistantLabel);
    if (expectation.roomBehavior) {
      await expect(page.getByTestId(expectation.roomPanel)).toContainText(`Room behavior: ${expectation.roomBehavior}`);
    }

    if (expectation.path.startsWith('/workspace/create?')) {
      await expect(page.getByTestId('uiux-world-editor')).toBeVisible();
      await expect(page.getByTestId('project-universe-at-a-glance')).toHaveCount(0);
      await expect(page.getByTestId('project-universe-workflow-guide')).toHaveCount(0);
      await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-state', 'ready');
      await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-choreography-state', 'ready');
      await expect(page.getByTestId('assistant-surface-context')).toContainText(expectation.assistantContext);
      continue;
    }

    await expect(page.getByTestId('project-universe-at-a-glance')).toBeVisible();
    await expect(page.getByTestId('project-universe-at-a-glance')).toContainText('Project At A Glance');
    await expect(page.getByTestId('project-universe-at-a-glance')).toContainText('Exists:');
    await expect(page.getByTestId('project-universe-at-a-glance')).toContainText('Active:');
    await expect(page.getByTestId('project-universe-at-a-glance')).toContainText('Next:');
    await expect(page.getByTestId('project-universe-at-a-glance')).toContainText('Blocked:');
    await expect(page.getByTestId('project-universe-at-a-glance')).toContainText('Done:');

    await expect(page.getByTestId('project-universe-workflow-guide')).toBeVisible();
    await expect(page.getByTestId('project-universe-workflow-guide')).toContainText('What to do next');
    await expect(page.getByTestId('project-universe-workflow-guide')).toContainText('Now');
    await expect(page.getByTestId('project-universe-workflow-guide')).toContainText('Do next');
    await expect(page.getByTestId('project-universe-workflow-guide')).toContainText('Why now');
    await expect(page.getByTestId('project-universe-workflow-guide')).not.toContainText('Project Workflow');
    await expect(page.getByTestId('project-universe-workflow-guide')).not.toContainText('Universe-first');
    await expect(page.getByTestId('project-universe-workflow-guide')).not.toContainText('Workflow-guided');

    await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-state', 'ready');
    await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-choreography-state', 'ready');
    await expect(page.getByTestId('assistant-surface-context')).toContainText(expectation.assistantContext);
  }
});

test('create shell consolidates project utilities behind a single tabbed panel', async ({ page }) => {
  const response = await page.goto('/workspace/create?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create cleanup route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('create-shell-utility-panel')).toBeHidden();
  await expect(page.getByTestId('create-shell-utility-panel')).toHaveAttribute('data-state', 'guiding');
  await expect(page.getByTestId('create-shell-utility-context')).toContainText('Project context is leading this Create session.');
  await expect(page.getByLabel('Navigator search')).toHaveCount(0);
  await expect(page.getByLabel('Blueprint chooser')).toHaveCount(0);
});

test('create shell consolidates inspector hierarchy behind focused dock tabs', async ({ page }) => {
  const response = await page.goto('/workspace/create', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create inspector cleanup route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('uiux-right-dock')).toHaveCount(0);
  await expect(page.getByTestId('inspector-tab-inspect')).toHaveCount(0);
  await expect(page.getByTestId('inspector-tab-surface')).toHaveCount(0);
  await expect(page.getByTestId('inspector-tab-library')).toHaveCount(0);
  await expect(page.getByTestId('inspector-empty-state')).toHaveCount(0);
});

test('create shell keeps timeline compact until a motion-capable node is active', async ({ page }) => {
  const response = await page.goto('/workspace/create', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create timeline compact route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('uiux-bottom-dock')).toHaveCount(0);
  await expect(page.getByTestId('uiux-transition-timeline')).toHaveCount(0);
  await expect(page.getByTestId('inspector-shell')).toHaveCount(0);
  await expect(page.getByTestId('inspector-context-summary')).toHaveCount(0);
});

test('create shell keeps the canvas as the dominant layout surface', async ({ page }) => {
  const response = await page.goto('/workspace/create?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create canvas layout route should respond successfully').toBeTruthy();

  const leftDock = await page.getByTestId('uiux-left-dock').boundingBox();
  const canvasDock = await page.getByTestId('uiux-canvas-dock').boundingBox();

  expect(leftDock).toBeTruthy();
  expect(canvasDock).toBeTruthy();

  expect(canvasDock.width).toBeGreaterThan(leftDock.width * 8);
  await expect(page.getByTestId('uiux-right-dock')).toHaveCount(0);
  await expect(page.getByTestId('uiux-bottom-dock')).toHaveCount(0);
});

test('project shell assistant intent enqueues through canonical runtime bridge', async ({ page }) => {
  const response = await page.goto('/workspace/build?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'build bootstrap route should respond successfully').toBeTruthy();
  const assistantPanel = page.getByTestId('assistant-surface-panel');
  await expect(assistantPanel).toHaveAttribute('data-state', 'ready');
  await expect(assistantPanel).toHaveAttribute('data-choreography-state', 'ready');
  await expect(assistantPanel).toHaveAttribute('data-emergence-source', 'assistant');
  await expect(page.getByTestId('assistant-surface-focus')).toContainText('Build Assistant for Application');
  await expect(page.getByTestId('assistant-surface-context')).toContainText('Build Assistant is ready');
  await expect(page.getByTestId('assistant-surface-details')).toContainText('Assistant details');

  await page.getByTestId('assistant-action-recommend').click();
  await expect(assistantPanel).toHaveAttribute('data-state', 'engaged');
  await expect(assistantPanel).toHaveAttribute('data-choreography-state', 'engaged');
  await expect(page.getByTestId('assistant-surface-context')).toContainText('Build Assistant is engaged');
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
      await expect(page.getByTestId('uiux-world-editor')).toHaveAttribute('data-editor-unity', 'world-based');
      await expect(page.getByTestId('uiux-left-dock')).toBeVisible();
      await expect(page.getByTestId('uiux-canvas-dock')).toBeVisible();
      await expect(page.getByTestId('uiux-floating-controls')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();
    } else {
      await expect(page.locator('body')).toContainText('Create');
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
    await expect(page.locator('body')).toContainText(`Create > ${entryId === 'branding' ? 'Branding' : 'Icons'}`);
    await expect(page.locator('body')).toContainText(`Design Assistant for ${entryId === 'branding' ? 'Branding' : 'Icons'}`);
    await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();
  }
});

test('create perspective preserves podcast media overlay compatibility entry', async ({ page }) => {
  const response = await page.goto('/workspace/create?entry=podcast', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create perspective podcast entry should respond successfully').toBeTruthy();
  await expect(page.locator('body')).toContainText('Create');
  await expect(page.locator('body')).toContainText('Create > Podcast');
  await expect(page.locator('body')).toContainText('Media Assistant for Podcast');
  await expect(page.locator('body')).toContainText('Generate Podcast Options');
  await expect(page.locator('body')).toContainText('Improve This Episode');
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
    await expect(page.getByTestId('build-world-panel')).toContainText('Build World');
    await expect(page.getByTestId('build-world-panel')).toContainText(expectedBuildEntries[entryId].specialization);
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
  await expect(page.getByTestId('build-room-panel')).toHaveAttribute('data-room-contract', 'build-world');
  await expect(page.getByTestId('build-room-panel')).toHaveAttribute('data-room-choreography', 'workflow-leading');
  await expect(page.getByTestId('build-room-panel')).toHaveAttribute('data-room-workflow', 'leading');
  await expect(page.getByTestId('build-room-panel')).toHaveAttribute('data-room-handoff', 'ready');
  await expect(page.getByTestId('build-room-panel')).toHaveAttribute('data-room-focus', 'structure');
  await expect(page.getByTestId('build-workflow-panel')).toBeVisible();
  await expect(page.getByTestId('build-workflow-panel')).toHaveAttribute('data-choreography-state', 'leading');
  await expect(page.getByTestId('build-workflow-panel')).toHaveAttribute('data-context-visibility', 'expanded');
  await expect(page.getByTestId('build-world-panel')).toContainText('Build World');
  await expect(page.getByTestId('build-world-panel')).toContainText('Application');
  await expect(page.getByTestId('build-world-summary')).toContainText('Current task: System Model');
  await expect(page.getByTestId('build-world-summary')).toContainText('Assistant: Build Assistant');
  await expect(page.getByTestId('build-world-summary')).toContainText('Linked artifacts: 2 across 2 build clusters');
  await expect(page.getByTestId('build-world-summary')).toContainText('Operate bridge: Systems Engineering');
  await expect(page.getByTestId('build-world-summary')).toContainText('Build focus: structure');
  await expect(page.getByTestId('build-world-summary')).toContainText('Room behavior: workflow-leading');
  await expect(page.getByTestId('project-universe-at-a-glance-active')).toContainText('Active:');
  await expect(page.getByTestId('project-universe-at-a-glance-next')).toContainText('Next:');
  await expect(page.getByTestId('project-universe-at-a-glance-blocked')).toContainText('Blocked:');
  await expect(page.getByTestId('project-universe-at-a-glance-done')).toContainText('Done:');
  await expect(page.getByTestId('project-universe-workflow-guide')).toContainText('What to do next');
  await expect(page.getByTestId('project-universe-workflow-guide')).toContainText('Application');
  await expect(page.getByTestId('project-universe-workflow-primary-next')).toContainText('Do next:');
  await expect(page.getByTestId('project-universe-workflow-guide')).toContainText('Move from build planning into live operating context.');
  await expect(page.getByTestId('project-universe-workflow-primary-source')).toContainText('From ');
  await expect(page.getByTestId('build-workflow-suggested-next')).toContainText('Continue Building');
  await expect(page.getByTestId('build-workflow-operate-handoff')).toHaveAttribute('data-choreography-state', 'ready');
  await expect(page.getByTestId('build-workflow-cluster-application')).toContainText('Application');
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-state', 'ready');
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-choreography-state', 'ready');
  await expect(page.getByTestId('assistant-surface-context')).toContainText('Build Assistant is ready while build workflow leads this room.');
  await page.getByTestId('assistant-action-recommend').click();
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-state', 'engaged');
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-choreography-state', 'engaged');
  await expect(page.getByTestId('assistant-surface-context')).toContainText('Build Assistant is engaged with the active build flow.');
  await expect(page.getByTestId('build-room-panel')).toHaveAttribute('data-room-choreography', 'assistant-engaged');
  await expect(page.getByTestId('build-room-panel')).toHaveAttribute('data-room-workflow', 'yielding');
  await expect(page.getByTestId('build-workflow-panel')).toHaveAttribute('data-choreography-state', 'yielding');
  await expect(page.getByTestId('build-workflow-panel')).toHaveAttribute('data-context-visibility', 'supporting');
  await expect(page.locator('body')).toContainText(/assistant intent:\s+enqueued:/);

  await page.goto('/workspace/build?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });
  const applicationLink = page.getByTestId('build-workflow-cluster-application').getByRole('button').first();
  await expect(applicationLink).toBeVisible();
  await applicationLink.click();
  await expect(page).toHaveURL(/[\?&]entry=application/);
  await expect(page).toHaveURL(/[\?&]u=system%3Amodel/);
  await expect(page.locator('body')).toContainText('Build > Application');

  await page.goto('/workspace/build?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });
  await page.getByTestId('build-workflow-operate-handoff').click();
  await expect(page).toHaveURL(/\/workspace\/operate\?/);
  await expect(page).toHaveURL(/[\?&]entry=systems-engineering/);
  await expect(page).toHaveURL(/[\?&]u=system%3Amodel/);
  await expect(page.locator('body')).toContainText('Operate > Systems Engineering');
  await expect(page.getByTestId('project-shell-transition-context')).toContainText('moving from System Model');
  await expect(page.getByTestId('project-shell-project-intent')).toContainText('Move from build planning into live operating context.');
});

test('operate overlays expose deterministic systems and operations panels', async ({ page }) => {
  let response = await page.goto('/workspace/systems-engineering?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'systems engineering route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('operate-room-panel')).toHaveAttribute('data-room-contract', 'operate-world');
  await expect(page.getByTestId('operate-room-panel')).toHaveAttribute('data-room-choreography', 'workflow-leading');
  await expect(page.getByTestId('operate-room-panel')).toHaveAttribute('data-room-workflow', 'leading');
  await expect(page.getByTestId('operate-room-panel')).toHaveAttribute('data-room-guidance', 'ready');
  await expect(page.getByTestId('operate-room-panel')).toHaveAttribute('data-room-anchor', 'anchored');
  await expect(page.getByTestId('operate-room-panel')).toHaveAttribute('data-room-focus', 'systems');
  await expect(page.getByTestId('operate-world-panel')).toContainText('Operate World');
  await expect(page.getByTestId('operate-world-panel')).toContainText('Systems Engineering');
  await expect(page.getByTestId('operate-world-summary')).toContainText('Current task: System Model');
  await expect(page.getByTestId('operate-world-summary')).toContainText('Assistant: Operations Assistant');
  await expect(page.getByTestId('operate-world-summary')).toContainText('Context: 2 linked operate targets');
  await expect(page.getByTestId('operate-world-summary')).toContainText('Linked artifacts:');
  await expect(page.getByTestId('operate-world-summary')).toContainText('operate clusters');
  await expect(page.getByTestId('operate-world-summary')).toContainText('Signals: 0 graphs · 0 controls · 0 signals');
  await expect(page.getByTestId('operate-world-summary')).toContainText('Next focus:');
  await expect(page.getByTestId('operate-world-summary')).toContainText('Guidance: Operations Assistant is guiding Systems Engineering toward System Model.');
  await expect(page.getByTestId('operate-world-summary')).toContainText('Operate focus: systems');
  await expect(page.getByTestId('operate-world-summary')).toContainText('Room behavior: workflow-leading');
  await expect(page.getByTestId('operate-workflow-panel')).toBeVisible();
  await expect(page.getByTestId('operate-workflow-panel')).toHaveAttribute('data-choreography-state', 'leading');
  await expect(page.getByTestId('operate-workflow-panel')).toHaveAttribute('data-context-visibility', 'expanded');
  await expect(page.getByTestId('operate-workflow-suggested-next')).toContainText('Continue Operating');
  await expect(page.getByTestId('operate-workflow-cluster-systems')).toContainText('Systems');
  await expect(page.getByTestId('operate-guidance-panel')).toBeVisible();
  await expect(page.getByTestId('operate-guidance-panel')).toHaveAttribute('data-choreography-state', 'ready');
  await expect(page.getByTestId('operate-guidance-summary')).toContainText('Current guidance: Operations Assistant is guiding Systems Engineering toward System Model.');
  await expect(page.getByTestId('operate-guidance-summary')).toContainText('Next move: Continue from System Model into Enterprise Operations via System Model.');
  await expect(page.getByTestId('operate-universe-anchor-panel')).toBeVisible();
  await expect(page.getByTestId('operate-universe-anchor-panel')).toHaveAttribute('data-choreography-state', 'anchored');
  await expect(page.getByTestId('operate-universe-anchor-panel')).toContainText('Operate');
  await expect(page.getByTestId('operate-universe-anchor-summary')).toContainText('Return anchor:');
  await expect(page.getByTestId('operate-universe-anchor-summary')).toContainText('linked world targets');
  await expect(page.getByTestId('operate-universe-anchor-summary')).toContainText('upstream');
  await expect(page.getByTestId('operate-universe-anchor-summary')).toContainText('downstream');
  await expect(page.getByTestId('systems-engineering-panel')).toContainText('Systems Engineering');
  await expect(page.getByTestId('systems-engineering-panel')).toContainText('Architecture graphs:');
  await expect(page.getByTestId('systems-engineering-panel')).toContainText('Continue in Systems Engineering');
  await page.getByTestId('systems-engineering-panel').getByRole('link', { name: /Continue in Systems Engineering/i }).click();
  await expect(page).toHaveURL(/\/workspace\/operate\?/);
  await expect(page).toHaveURL(/[\?&]entry=systems-engineering/);
  await expect(page).toHaveURL(/[\?&]u=/);
  await expect(page.getByTestId('project-shell-transition-context')).toContainText('opened from');

  response = await page.goto('/workspace/enterprise-operations?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'enterprise operations route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('operate-world-panel')).toContainText('Enterprise Operations');
  await expect(page.getByTestId('operate-world-summary')).toContainText('Current task: System Model');
  await expect(page.getByTestId('operate-world-summary')).toContainText('Context: 1 linked operate targets');
  await expect(page.getByTestId('operate-world-summary')).toContainText('Linked artifacts:');
  await expect(page.getByTestId('operate-world-summary')).toContainText('operate clusters');
  await expect(page.getByTestId('operate-world-summary')).toContainText('Signals: 0 processes · 0 automation paths · 0 data sources');
  await expect(page.getByTestId('operate-world-summary')).toContainText('Next focus:');
  await expect(page.getByTestId('operate-world-summary')).toContainText('Guidance: Operations Assistant is guiding Enterprise Operations toward System Model.');
  await expect(page.getByTestId('operate-workflow-panel')).toBeVisible();
  await expect(page.getByTestId('operate-workflow-cluster-operations')).toContainText('Operations');
  await expect(page.getByTestId('operate-guidance-panel')).toBeVisible();
  await expect(page.getByTestId('operate-guidance-summary')).toContainText('Current guidance: Operations Assistant is guiding Enterprise Operations toward System Model.');
  await expect(page.getByTestId('operate-guidance-summary')).toContainText('System note: Carry process changes back into system models so enterprise operations stay grounded in project reality.');
  await expect(page.getByTestId('operate-universe-anchor-panel')).toBeVisible();
  await expect(page.getByTestId('operate-universe-anchor-panel')).toContainText('Operate');
  await expect(page.getByTestId('operate-universe-anchor-summary')).toContainText('Next likely world target:');
  await expect(page.getByTestId('enterprise-operations-panel')).toContainText('Enterprise Operations');
  await expect(page.getByTestId('enterprise-operations-panel')).toContainText('Processes:');
  await expect(page.getByTestId('enterprise-operations-panel')).toContainText('Continue in Enterprise Operations');
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-state', 'ready');
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-choreography-state', 'ready');
  await expect(page.getByTestId('assistant-surface-context')).toContainText('Operations Assistant is ready while operating workflow leads this room.');
  await page.getByTestId('assistant-action-recommend').click();
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-state', 'engaged');
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-choreography-state', 'engaged');
  await expect(page.getByTestId('assistant-surface-context')).toContainText('Operations Assistant is engaged with the active operating flow.');
  await expect(page.getByTestId('operate-room-panel')).toHaveAttribute('data-room-choreography', 'guidance-engaged');
  await expect(page.getByTestId('operate-room-panel')).toHaveAttribute('data-room-workflow', 'yielding');
  await expect(page.getByTestId('operate-room-panel')).toHaveAttribute('data-room-anchor', 'supporting');
  await expect(page.getByTestId('operate-workflow-panel')).toHaveAttribute('data-choreography-state', 'yielding');
  await expect(page.getByTestId('operate-workflow-panel')).toHaveAttribute('data-context-visibility', 'supporting');
  await expect(page.getByTestId('operate-guidance-panel')).toHaveAttribute('data-choreography-state', 'engaged');
  await expect(page.getByTestId('operate-universe-anchor-panel')).toHaveAttribute('data-choreography-state', 'supporting');
  await expect(page.locator('body')).toContainText(/assistant intent:\s+enqueued:/);

  await page.goto('/workspace/enterprise-operations?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });
  await page.getByTestId('enterprise-operations-panel').getByRole('link', { name: /Continue in Enterprise Operations/i }).click();
  await expect(page).toHaveURL(/\/workspace\/operate\?/);
  await expect(page).toHaveURL(/[\?&]entry=enterprise-operations/);
  await expect(page).toHaveURL(/[\?&]u=/);
  await expect(page.getByTestId('project-shell-transition-context')).toContainText('opened from');
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
    await expect(page.getByTestId('operate-world-panel')).toContainText('Operate World');
    await expect(page.getByTestId('operate-world-panel')).toContainText(
      expectedOperateEntries[entryId].specialization,
    );
    await page.getByTestId('project-shell-runtime-details').getByText('Shell details').click();
    await expect(page.getByTestId('project-shell-runtime-label')).toContainText(
      `runtime: ${expectedOperateEntries[entryId].runtime}`,
    );
    await expect(page.getByTestId('assistant-surface-focus')).toContainText(
      `Operations Assistant for ${expectedOperateEntries[entryId].specialization}`,
    );
    await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-choreography-state', 'ready');
    await expect(page.getByTestId('assistant-surface-context')).toContainText('Operations Assistant is ready while operating workflow leads this room.');
    await expect(page.getByTestId('assistant-action-recommend')).toContainText(expectedOperateEntries[entryId].recommendLabel);
    await expect(page.getByTestId('assistant-action-generate')).toContainText(expectedOperateEntries[entryId].generateLabel);
    await expect(page.getByTestId('assistant-action-explain')).toContainText(expectedOperateEntries[entryId].explainLabel);
  }
});

test('publish perspective assistant surface stays entry-consistent for governance and system entries', async ({ page }) => {
  const expectedPublishEntries = {
    governance: {
      specialization: 'Governance',
      currentTask: 'Untitled',
      context: '1 linked publish targets',
      signals: '0 export targets · 0 components · 0 themes',
      recommendLabel: 'Ask Publishing Assistant',
      generateLabel: 'Generate Governance Options',
      explainLabel: 'Improve This Policy',
    },
    versioning: {
      specialization: 'Versioning',
      currentTask: 'Untitled',
      context: '1 linked publish targets',
      signals: '0 export targets · 0 components · 0 themes',
      recommendLabel: 'Ask Publishing Assistant',
      generateLabel: 'Generate Release Options',
      explainLabel: 'Improve This Version Plan',
    },
    tokens: {
      specialization: 'Tokens',
      currentTask: 'Awaiting token set',
      context: '0 linked publish targets',
      signals: '0 token groups · 0 themes · 0 variants',
      recommendLabel: 'Ask Publishing Assistant',
      generateLabel: 'Generate Token Options',
      explainLabel: 'Improve This Token Set',
    },
    components: {
      specialization: 'Components',
      currentTask: 'Awaiting component library',
      context: '0 linked publish targets',
      signals: '0 components · 0 themes · 0 variants',
      recommendLabel: 'Ask Publishing Assistant',
      generateLabel: 'Generate Component Options',
      explainLabel: 'Improve This Component Library',
    },
    themes: {
      specialization: 'Themes',
      currentTask: 'Awaiting theme surface',
      context: '0 linked publish targets',
      signals: '0 themes · 0 variants · 0 token groups',
      recommendLabel: 'Ask Publishing Assistant',
      generateLabel: 'Generate Theme Options',
      explainLabel: 'Improve This Theme',
    },
    variants: {
      specialization: 'Variants',
      currentTask: 'Awaiting variant set',
      context: '0 linked publish targets',
      signals: '0 variants · 0 themes · 0 components',
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
    await expect(page.getByTestId('publish-world-panel')).toContainText('Publish World');
    await expect(page.getByTestId('publish-world-panel')).toContainText(expectedPublishEntries[entryId].specialization);
    await expect(page.getByTestId('publish-world-summary')).toContainText(`Current task: ${expectedPublishEntries[entryId].currentTask}`);
    await expect(page.getByTestId('publish-world-summary')).toContainText('Assistant: Publishing Assistant');
    await expect(page.getByTestId('publish-world-summary')).toContainText(`Context: ${expectedPublishEntries[entryId].context}`);
    await expect(page.getByTestId('publish-world-summary')).toContainText('Linked artifacts:');
    await expect(page.getByTestId('publish-world-summary')).toContainText(`Signals: ${expectedPublishEntries[entryId].signals}`);
    await expect(page.getByTestId('publish-world-summary')).toContainText('Next focus:');
    await expect(page.getByTestId('publish-world-summary')).toContainText('Guidance:');
    await expect(page.getByTestId('publish-world-summary')).toContainText('Publish focus:');
    await expect(page.getByTestId('publish-world-summary')).toContainText('Room behavior:');
    await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-contract', 'publish-world');
    await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-choreography', 'workflow-leading');
    await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-workflow', 'leading');
    await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-guidance', 'ready');
    await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-anchor', 'anchored');
    await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-focus', /governance|release|system|delivery/);
    await expect(page.getByTestId('publish-workflow-panel')).toBeVisible();
    await expect(page.getByTestId('publish-workflow-panel')).toHaveAttribute('data-choreography-state', 'leading');
    await expect(page.getByTestId('publish-workflow-panel')).toHaveAttribute('data-context-visibility', 'expanded');
    await expect(page.getByTestId('publish-guidance-panel')).toBeVisible();
    await expect(page.getByTestId('publish-guidance-panel')).toHaveAttribute('data-choreography-state', 'ready');
    await expect(page.getByTestId('publish-universe-anchor-panel')).toBeVisible();
    await expect(page.getByTestId('publish-universe-anchor-panel')).toHaveAttribute('data-choreography-state', 'anchored');
    await expect(page.getByTestId('publish-universe-anchor-panel')).toContainText('Publish');
    await expect(page.getByTestId('publish-universe-anchor-summary')).toContainText('Return anchor:');
    await expect(page.getByTestId('publish-universe-anchor-summary')).toContainText('linked world targets');
    await expect(page.getByTestId('publish-guidance-summary')).toContainText(
      `Current guidance: Publishing Assistant is guiding ${expectedPublishEntries[entryId].specialization} toward ${expectedPublishEntries[entryId].currentTask}.`,
    );
    await expect(page.getByTestId('assistant-surface-focus')).toContainText(
      `Publishing Assistant for ${expectedPublishEntries[entryId].specialization}`,
    );
    await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-choreography-state', 'ready');
    await expect(page.getByTestId('assistant-surface-context')).toContainText('Publishing Assistant is ready');
    await expect(page.getByTestId('assistant-action-recommend')).toContainText(expectedPublishEntries[entryId].recommendLabel);
    await expect(page.getByTestId('assistant-action-generate')).toContainText(expectedPublishEntries[entryId].generateLabel);
    await expect(page.getByTestId('assistant-action-explain')).toContainText(expectedPublishEntries[entryId].explainLabel);
  }
});

test('publish perspective exposes linked workflow depth when bootstrapped into project context', async ({ page }) => {
  const response = await page.goto('/workspace/publish?entry=governance&blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'publish workflow depth route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('publish-world-panel')).toContainText('Publish World');
  await expect(page.getByTestId('publish-world-summary')).toContainText('Linked artifacts:');
  await expect(page.getByTestId('publish-world-summary')).toContainText('publish clusters');
  await expect(page.getByTestId('publish-world-summary')).toContainText('Next focus:');
  await expect(page.getByTestId('publish-world-summary')).toContainText('Guidance: Publishing Assistant is guiding Governance toward Untitled.');
  await expect(page.getByTestId('publish-world-summary')).toContainText('Publish focus: governance');
  await expect(page.getByTestId('publish-world-summary')).toContainText('Room behavior: workflow-leading');
  await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-contract', 'publish-world');
  await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-choreography', 'workflow-leading');
  await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-workflow', 'leading');
  await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-guidance', 'ready');
  await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-anchor', 'anchored');
  await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-focus', 'governance');
  await expect(page.getByTestId('publish-workflow-panel')).toBeVisible();
  await expect(page.getByTestId('publish-workflow-panel')).toHaveAttribute('data-choreography-state', 'leading');
  await expect(page.getByTestId('publish-workflow-panel')).toHaveAttribute('data-context-visibility', 'expanded');
  await expect(page.getByTestId('publish-guidance-panel')).toBeVisible();
  await expect(page.getByTestId('publish-guidance-panel')).toHaveAttribute('data-choreography-state', 'ready');
  await expect(page.getByTestId('publish-universe-anchor-panel')).toBeVisible();
  await expect(page.getByTestId('publish-universe-anchor-panel')).toHaveAttribute('data-choreography-state', 'anchored');
  await expect(page.getByTestId('publish-universe-anchor-panel')).toContainText('Publish');
  await expect(page.getByTestId('publish-universe-anchor-summary')).toContainText('Return anchor:');
  await expect(page.getByTestId('publish-universe-anchor-summary')).toContainText('linked world targets');
  await expect(page.getByTestId('publish-universe-anchor-summary')).toContainText('upstream');
  await expect(page.getByTestId('publish-universe-anchor-summary')).toContainText('downstream');
  await expect(page.getByTestId('publish-universe-anchor-summary')).toContainText('Next likely world target:');
  await expect(page.getByTestId('publish-guidance-summary')).toContainText('Current guidance: Publishing Assistant is guiding Governance toward Untitled.');
  await expect(page.getByTestId('publish-guidance-summary')).toContainText('Next move: Continue from Untitled into Conversion via Untitled.');
  await expect(page.getByTestId('publish-guidance-summary')).toContainText('Release note: Keep release rules, approvals, and artifact evidence aligned before publication.');
  await expect(page.getByTestId('publish-workflow-suggested-next')).toContainText('Continue Publishing');
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-state', 'ready');
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-choreography-state', 'ready');
  await expect(page.getByTestId('assistant-surface-context')).toContainText('Publishing Assistant is ready while publish workflow leads this room.');
  await page.getByTestId('assistant-action-recommend').click();
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-state', 'engaged');
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-choreography-state', 'engaged');
  await expect(page.getByTestId('assistant-surface-context')).toContainText('Publishing Assistant is engaged with the active publish flow.');
  await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-choreography', 'guidance-engaged');
  await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-workflow', 'yielding');
  await expect(page.getByTestId('publish-room-panel')).toHaveAttribute('data-room-anchor', 'supporting');
  await expect(page.getByTestId('publish-workflow-panel')).toHaveAttribute('data-choreography-state', 'yielding');
  await expect(page.getByTestId('publish-workflow-panel')).toHaveAttribute('data-context-visibility', 'supporting');
  await expect(page.getByTestId('publish-guidance-panel')).toHaveAttribute('data-choreography-state', 'engaged');
  await expect(page.getByTestId('publish-universe-anchor-panel')).toHaveAttribute('data-choreography-state', 'supporting');
  await expect(page.locator('body')).toContainText(/assistant intent:\s+enqueued:/);
  await page.goto('/workspace/publish?entry=governance&blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });
  await page.getByTestId('publish-workflow-suggested-next').click();
  await expect(page).toHaveURL(/\/workspace\/publish\?/);
  await expect(page).toHaveURL(/[\?&]entry=conversion/);
  await expect(page).toHaveURL(/[\?&]u=document%3Aprimary/);
  await expect(page.getByTestId('project-shell-transition-context')).toContainText('opened from Untitled');
  await expect(page.getByTestId('project-shell-project-intent')).toContainText('Continue publishing conversion through Untitled.');
});

test('collaborate perspective assistant surface stays entry-consistent across review and knowledge routes', async ({ page }) => {
  const expectations = {
    review: { room: 'review-focused', focus: 'review' },
    production: { room: 'discussion-active', focus: 'alignment' },
    knowledge: { room: 'discussion-active', focus: 'discussion' },
    education: { room: 'education-guiding', focus: 'learning' },
  };

  for (const entryId of ['review', 'production', 'knowledge', 'education']) {
    const response = await page.goto(`/workspace/collaborate?entry=${entryId}`, {
      waitUntil: 'networkidle',
    });

    expect(response?.ok(), `collaborate ${entryId} route should respond successfully`).toBeTruthy();
    await expect(page.locator('body')).toContainText('Collaborate');
    await expect(page.getByTestId('collaborate-world-panel')).toContainText('Collaborate World');
    await expect(page.getByTestId('collaborate-world-panel')).toContainText(
      entryId[0].toUpperCase() + entryId.slice(1),
    );
    await expect(page.getByTestId('assistant-surface-panel')).toBeVisible();
    await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-choreography-state', 'ready');
    await expect(page.getByTestId('assistant-surface-context')).toContainText('Collaborate Assistant is ready');
    await expect(page.getByTestId('collaborate-room-panel')).toHaveAttribute('data-room-choreography', expectations[entryId].room);
    await expect(page.getByTestId('collaborate-room-panel')).toHaveAttribute('data-room-focus', expectations[entryId].focus);
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
  await expect(page.getByTestId('collaborate-room-panel')).toHaveAttribute('data-room-contract', 'collaborate-world');
  await expect(page.getByTestId('collaborate-room-panel')).toHaveAttribute('data-room-choreography', 'review-focused');
  await expect(page.getByTestId('collaborate-room-panel')).toHaveAttribute('data-room-workflow', 'leading');
  await expect(page.getByTestId('collaborate-room-panel')).toHaveAttribute('data-room-handoff', 'ready');
  await expect(page.getByTestId('collaborate-room-panel')).toHaveAttribute('data-room-focus', 'review');
  await expect(page.getByTestId('collaborate-world-panel')).toContainText('Collaborate World');
  await expect(page.getByTestId('collaborate-world-panel')).toContainText('Review');
  await expect(page.getByTestId('collaborate-world-summary')).toContainText('Current task: Untitled');
  await expect(page.getByTestId('collaborate-world-summary')).toContainText('Assistant: Collaborate Assistant');
  await expect(page.getByTestId('collaborate-world-summary')).toContainText('Linked artifacts: 2 across 1 collaborate clusters');
  await expect(page.getByTestId('collaborate-world-summary')).toContainText('Publish bridge: Publish Review');
  await expect(page.getByTestId('collaborate-world-summary')).toContainText('Collaborate focus: review');
  await expect(page.getByTestId('collaborate-world-summary')).toContainText('Room behavior: review-focused');
  await expect(page.getByTestId('collaborate-workflow-panel')).toBeVisible();
  await expect(page.getByTestId('collaborate-workflow-panel')).toHaveAttribute('data-choreography-state', 'leading');
  await expect(page.getByTestId('collaborate-workflow-panel')).toHaveAttribute('data-context-visibility', 'expanded');
  await expect(page.getByTestId('collaborate-workflow-suggested-next')).toContainText('Continue Collaborating');
  await expect(page.getByTestId('collaborate-workflow-publish-handoff')).toHaveAttribute('data-choreography-state', 'ready');
  await expect(page.getByTestId('collaborate-workflow-cluster-knowledge')).toContainText('Knowledge');
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-state', 'ready');
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-choreography-state', 'ready');
  await expect(page.getByTestId('assistant-surface-context')).toContainText('Collaborate Assistant is ready to support review and alignment in this room.');
  await page.getByTestId('assistant-action-recommend').click();
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-state', 'engaged');
  await expect(page.getByTestId('assistant-surface-panel')).toHaveAttribute('data-choreography-state', 'engaged');
  await expect(page.getByTestId('assistant-surface-context')).toContainText('Collaborate Assistant is facilitating the active collaboration flow.');
  await expect(page.getByTestId('collaborate-room-panel')).toHaveAttribute('data-room-choreography', 'assistant-facilitating');
  await expect(page.getByTestId('collaborate-room-panel')).toHaveAttribute('data-room-workflow', 'yielding');
  await expect(page.getByTestId('collaborate-workflow-panel')).toHaveAttribute('data-choreography-state', 'yielding');
  await expect(page.getByTestId('collaborate-workflow-panel')).toHaveAttribute('data-context-visibility', 'supporting');
  await expect(page.locator('body')).toContainText(/assistant intent:\s+enqueued:/);
  await page.goto('/workspace/collaborate?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });
  await page.getByTestId('collaborate-workflow-link-document:primary-knowledge').click();
  await expect(page).toHaveURL(/[\?&]entry=knowledge/);
  await expect(page).toHaveURL(/[\?&]u=document%3Aprimary/);
  await expect(page.getByTestId('collaborate-world-panel')).toContainText('Collaborate World');
  await expect(page.getByTestId('collaborate-world-panel')).toContainText('Knowledge');
  await expect(page.getByTestId('collaborate-room-panel')).toHaveAttribute('data-room-choreography', 'discussion-active');
  await expect(page.getByTestId('collaborate-room-panel')).toHaveAttribute('data-room-focus', 'discussion');
  await page.goto('/workspace/collaborate?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });
  await page.getByTestId('collaborate-workflow-publish-handoff').click();
  await expect(page).toHaveURL(/\/workspace\/publish\?/);
  await expect(page.getByTestId('project-shell-project-intent')).toContainText('Carry collaboration output into publish review.');

  await page.goto('/workspace/collaborate?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });
  await page.getByTestId('collaborate-workflow-publish-handoff').click();
  await expect(page).toHaveURL(/\/workspace\/publish\?/);
  await expect(page).toHaveURL(/[\?&]entry=review/);
  await expect(page).toHaveURL(/[\?&]u=document%3Aprimary/);
  await expect(page.getByTestId('publish-world-panel')).toContainText('Publish World');
  await expect(page.getByTestId('publish-world-panel')).toContainText('Review');
  await expect(page.getByTestId('project-shell-transition-context')).toContainText('moving from Untitled');
});
