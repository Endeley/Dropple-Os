import { test, expect } from '@playwright/test';

async function publishMarketplaceFixture(request, {
  title = `Marketplace Fixture ${Date.now()}`,
  description = 'Certified marketplace fixture',
} = {}) {
  const response = await request.post('/api/templates/publish', {
    data: {
      document: {
        sceneGraph: {
          rootIds: ['root'],
          nodes: {
            root: {
              id: 'root',
              type: 'frame',
              children: ['headline'],
            },
            headline: {
              id: 'headline',
              type: 'text',
              children: [],
            },
          },
        },
        motion: {
          clips: {
            'clip-headline-opacity': {
              id: 'clip-headline-opacity',
              target: 'headline',
              property: 'opacity',
              keyframes: [
                { id: 'kf-0', t: 0, v: 0 },
                { id: 'kf-300', t: 300, v: 1, easing: 'ease-in-out' },
              ],
            },
          },
        },
      },
      metadata: {
        title,
        description,
        author: 'Marketplace QA',
      },
      mode: {
        id: 'uiux',
        workspaceId: 'design',
      },
    },
  });

  expect(response.ok(), 'fixture publish should respond successfully').toBeTruthy();
  const payload = await response.json();
  return payload?.result?.seed ?? null;
}

function attachErrorTracking(page) {
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

  return { errors, consoleErrors };
}

function assertNoFatalErrors({ errors, consoleErrors }, label) {
  expect(errors, `${label} should not trigger pageerror`).toEqual([]);
  expect(
    consoleErrors.filter((message) => !message.includes('Unchecked runtime.lastError')),
    `${label} should not log browser console errors`
  ).toEqual([]);
}

function resolveTemplateLineageIdentity(template) {
  return {
    lineageRootId:
      template?.lineageRootId ??
      template?.certification?.lineageRootId ??
      template?.lineage?.rootId ??
      null,
    versionId:
      template?.versionId ??
      template?.certification?.lineageNodeId ??
      template?.lineage?.nodeId ??
      null,
  };
}

test('marketplace template workflow opens certified template details and enters workspace', async ({ page, request }) => {
  const template = await publishMarketplaceFixture(request, {
    title: `Marketplace Flow ${Date.now()}`,
    description: 'Marketplace-certified template flow',
  });
  const tracked = attachErrorTracking(page);

  const response = await page.goto('/marketplace', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'marketplace route should respond successfully').toBeTruthy();
  await expect(page.locator('body')).toContainText('Templates');
  await expect(page.locator('[data-capability="Reproducible"]').first()).toContainText('Reproducible');
  await page.getByText(template.metadata.name).click();

  await expect(page).toHaveURL(new RegExp(`/marketplace/template/${template.id}$`));
  await expect(page.locator('body')).toContainText(template.metadata.name);
  await expect(page.locator('[data-capability="Reproducible"]').first()).toContainText('Reproducible');
  await expect(page.getByRole('button', { name: 'Use Template' })).toBeEnabled();

  await page.getByRole('button', { name: 'Use Template' }).click();
  await expect(page).toHaveURL(/\/workspace\/new\?/);
  const workspaceUrl = new URL(page.url());
  const lineage = resolveTemplateLineageIdentity(template);
  expect(workspaceUrl.pathname).toBe('/workspace/new');
  expect(workspaceUrl.searchParams.get('lineageRootId')).toBe(lineage.lineageRootId);
  expect(workspaceUrl.searchParams.get('versionId')).toBe(lineage.versionId);
  await expect(page.locator('[data-tool-id="select"]').first()).toBeVisible();
  await expect(page.locator('[data-node-id]')).toHaveCount(2);

  assertNoFatalErrors(tracked, 'marketplace template workflow');
});

test('workspace mode flow can move between graphic and media routes without fatal errors', async ({ page }) => {
  const tracked = attachErrorTracking(page);

  let response = await page.goto('/workspace/graphic', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'graphic workspace should respond successfully').toBeTruthy();
  await expect(page.locator('[data-tool-id="select"]').first()).toBeVisible();

  response = await page.goto('/workspace/media', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'media workspace should respond successfully').toBeTruthy();
  await expect(page.locator('body')).toContainText('Media Workspace');
  await expect(page.locator('body')).not.toContainText('Application error');
  await expect(page.locator('body')).not.toContainText('Module not found');

  assertNoFatalErrors(tracked, 'workspace mode flow');
});

test('mounted graph synthesis appears on graphic, withdraws on automation, and reappears on return', async ({ page }) => {
  const tracked = attachErrorTracking(page);

  let response = await page.goto('/workspace/graphic', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'graphic workspace should respond successfully').toBeTruthy();
  await expect(page.locator('[data-tool-id="move"]').first()).toBeVisible();
  await expect(page.locator('[data-tool-id="frame"]').first()).toBeVisible();

  response = await page.goto('/workspace/automation', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'automation workspace should respond successfully').toBeTruthy();
  await expect(page.locator('body')).toContainText('Automation');
  await expect(page.locator('[data-tool-id="move"]')).toHaveCount(0);
  await expect(page.locator('[data-tool-id="frame"]')).toHaveCount(0);

  response = await page.goto('/workspace/graphic', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'graphic workspace should respond successfully on return').toBeTruthy();
  await expect(page.locator('[data-tool-id="move"]').first()).toBeVisible();
  await expect(page.locator('[data-tool-id="frame"]').first()).toBeVisible();

  assertNoFatalErrors(tracked, 'mounted graph synthesis workspace flow');
});

test('mounted interpreted providers coexist in animation and withdraw only the removed source across route transitions', async ({ page }) => {
  const tracked = attachErrorTracking(page);

  let response = await page.goto('/workspace/animation', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'animation workspace should respond successfully').toBeTruthy();
  await expect(page.locator('[data-tool-id="move"]').first()).toBeVisible();
  await expect(page.locator('[data-tool-id="frame"]').first()).toBeVisible();
  await expect(page.locator('[data-tool-id="rig-select"]').first()).toBeVisible();
  await expect(page.locator('[data-tool-id="rig-move"]').first()).toBeVisible();

  response = await page.goto('/workspace/graphic', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'graphic workspace should respond successfully from animation').toBeTruthy();
  await expect(page.locator('[data-tool-id="move"]').first()).toBeVisible();
  await expect(page.locator('[data-tool-id="frame"]').first()).toBeVisible();
  await expect(page.locator('[data-tool-id="rig-select"]')).toHaveCount(0);
  await expect(page.locator('[data-tool-id="rig-move"]')).toHaveCount(0);

  response = await page.goto('/workspace/automation', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'automation workspace should respond successfully after graphic').toBeTruthy();
  await expect(page.locator('[data-tool-id="move"]')).toHaveCount(0);
  await expect(page.locator('[data-tool-id="frame"]')).toHaveCount(0);

  response = await page.goto('/workspace/animation', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'animation workspace should respond successfully on return').toBeTruthy();
  await expect(page.locator('[data-tool-id="move"]').first()).toBeVisible();
  await expect(page.locator('[data-tool-id="rig-select"]').first()).toBeVisible();
  await expect(page.locator('[data-tool-id="rig-move"]').first()).toBeVisible();

  assertNoFatalErrors(tracked, 'mounted interpreted provider coexistence flow');
});

test('mounted semantic winner label for shared synthesized tool stays stable across route transitions', async ({ page }) => {
  const tracked = attachErrorTracking(page);

  let response = await page.goto('/workspace/animation', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'animation workspace should respond successfully').toBeTruthy();
  await expect(page.locator('[data-tool-id="move"]').first()).toHaveAttribute('data-tool-label', 'Move');

  response = await page.goto('/workspace/graphic', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'graphic workspace should respond successfully from animation').toBeTruthy();
  await expect(page.locator('[data-tool-id="move"]').first()).toHaveAttribute('data-tool-label', 'Move');

  response = await page.goto('/workspace/automation', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'automation workspace should respond successfully after graphic').toBeTruthy();
  await expect(page.locator('[data-tool-id="move"]')).toHaveCount(0);

  response = await page.goto('/workspace/animation', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'animation workspace should respond successfully on return').toBeTruthy();
  await expect(page.locator('[data-tool-id="move"]').first()).toHaveAttribute('data-tool-label', 'Move');

  assertNoFatalErrors(tracked, 'mounted semantic winner continuity flow');
});

test('mounted shared synthesized tool projects merged semantic tags deterministically across owner transitions', async ({ page }) => {
  const tracked = attachErrorTracking(page);

  let response = await page.goto('/workspace/animation', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'animation workspace should respond successfully').toBeTruthy();
  await expect(page.locator('[data-tool-id="move"]').first()).toHaveAttribute('data-tool-capability-tags', 'graph.transform,rig.transform');
  await expect(page.locator('[data-tool-id="move"]').first()).toHaveAttribute('data-tool-intent-topics', 'layout/move,rig/move');

  response = await page.goto('/workspace/graphic', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'graphic workspace should respond successfully from animation').toBeTruthy();
  await expect(page.locator('[data-tool-id="move"]').first()).toHaveAttribute('data-tool-capability-tags', 'graph.transform');
  await expect(page.locator('[data-tool-id="move"]').first()).toHaveAttribute('data-tool-intent-topics', 'layout/move');

  response = await page.goto('/workspace/animation', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'animation workspace should respond successfully on return').toBeTruthy();
  await expect(page.locator('[data-tool-id="move"]').first()).toHaveAttribute('data-tool-capability-tags', 'graph.transform,rig.transform');
  await expect(page.locator('[data-tool-id="move"]').first()).toHaveAttribute('data-tool-intent-topics', 'layout/move,rig/move');

  assertNoFatalErrors(tracked, 'mounted shared semantic tag continuity flow');
});

test('mounted shared tool with conflicting execution contracts is rejected from projection', async ({ page }) => {
  const tracked = attachErrorTracking(page);

  const response = await page.goto('/workspace/animation', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'animation workspace should respond successfully').toBeTruthy();
  await expect(page.locator('[data-tool-id="exec-contract-shared"]')).toHaveCount(0);

  assertNoFatalErrors(tracked, 'mounted execution contract conflict rejection flow');
});
