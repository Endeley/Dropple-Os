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
  await page.getByText(template.metadata.name).click();

  await expect(page).toHaveURL(new RegExp(`/marketplace/template/${template.id}$`));
  await expect(page.locator('body')).toContainText(template.metadata.name);
  await expect(page.getByRole('button', { name: 'Use Template' })).toBeEnabled();

  await page.getByRole('button', { name: 'Use Template' }).click();
  await expect(page).toHaveURL(new RegExp(`/workspace/new\\?fromTemplate=${template.id}$`));
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
