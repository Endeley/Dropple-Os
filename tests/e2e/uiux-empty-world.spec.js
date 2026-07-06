import { test, expect } from '@playwright/test';

test('uiux empty world projects application-first guidance before the first page exists', async ({ page }) => {
  const response = await page.goto('/workspace/create', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('uiux-empty-world')).toBeVisible();
  await expect(page.getByTestId('uiux-empty-world-title')).toContainText('Design an Application');
  await expect(page.locator('body')).toContainText('Everything starts with a Page.');
  await expect(page.getByTestId('uiux-empty-world-card-blankPage')).toBeVisible();
  await expect(page.getByTestId('uiux-empty-world-card-landingPage')).toBeVisible();
  await expect(page.getByTestId('uiux-empty-world-card-dashboard')).toBeVisible();
  await expect(page.getByTestId('uiux-empty-world-card-login')).toBeVisible();
  await expect(page.getByTestId('uiux-empty-world-card-settings')).toBeVisible();
  await expect(page.getByTestId('uiux-empty-world-guidance')).toContainText('These are suggestions.');
});

test('uiux empty world disappears after the first page is created through the canonical path', async ({ page }) => {
  const response = await page.goto('/workspace/create', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create route should respond successfully').toBeTruthy();
  const emptyWorld = page.getByTestId('uiux-empty-world');
  await expect(emptyWorld).toBeVisible();

  await page.getByTestId('uiux-empty-world-card-blankPage').click();

  await expect(emptyWorld).toHaveAttribute('data-world-state', 'arriving');
  await expect(page.getByTestId('uiux-creative-arrival')).toContainText('Blank Page');
  await expect(page.getByTestId('uiux-empty-world-guidance')).toContainText('Guidance is yielding to your project.');
  await expect(emptyWorld).toHaveCount(0);
  await expect(page.getByTestId('canvas-host')).toHaveAttribute('data-project-history-state', 'worked');
});

test('uiux empty world keeps world continuity while the chosen direction arrives', async ({ page }) => {
  const response = await page.goto('/workspace/create', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create route should respond successfully').toBeTruthy();
  const emptyWorld = page.getByTestId('uiux-empty-world');
  await expect(emptyWorld).toBeVisible();
  await expect(emptyWorld).toHaveAttribute('data-world-state', 'empty');

  await page.getByTestId('uiux-empty-world-card-landingPage').click();

  await expect(emptyWorld).toHaveAttribute('data-world-state', 'arriving');
  await expect(page.getByTestId('uiux-empty-world-title')).toContainText('Your Landing Page is arriving');
  await expect(page.locator('body')).toContainText('The world is responding to your direction.');
  await expect(page.getByTestId('canvas-host')).toHaveAttribute('data-project-history-state', 'worked');
  await expect(emptyWorld).toHaveCount(0);
});

test('uiux empty world blank page creation selects the page and reveals semantic projection', async ({ page }) => {
  const response = await page.goto('/workspace/create', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'create route should respond successfully').toBeTruthy();
  await page.getByTestId('uiux-empty-world-card-blankPage').click();

  await expect(page.getByTestId('uiux-first-expression')).toBeVisible();
  await expect(page.getByTestId('uiux-first-expression-title')).toContainText('Blank Page');
  await expect(page.getByTestId('uiux-first-expression-meaning')).toContainText('first real presence can exist');
  await expect(page.getByTestId('uiux-first-expression-owner')).toContainText('because your direction crossed into existence');
  await expect(page.getByTestId('uiux-world-editor')).toHaveAttribute('data-first-expression-focus', 'true');
  await expect(page.getByTestId('selection-outline')).toHaveCount(0);
  await expect(page.getByTestId('inspector-shell')).toHaveCount(0);

  await page.getByTestId('uiux-first-expression-continue').click();

  await expect(page.getByTestId('uiux-world-editor')).toHaveAttribute('data-first-expression-focus', 'false');
  await expect(page.getByTestId('inspector-shell')).toBeVisible();
  await expect(page.getByTestId('inspector-context-summary')).toContainText('Context: selection');
  await expect(page.locator('[data-testid="inspector-shell"]')).toContainText('Page');
  await expect(page.locator('[data-testid="inspector-shell"]')).toContainText('It belongs to your Application.');
  await expect(page.locator('[data-testid="inspector-shell"]')).toContainText('Next Meaningful Steps');
});

for (const scenario of [
  {
    cardId: 'landingPage',
    title: 'Landing Page',
    steps: [
      'Create Hero Section',
      'Introduce Brand Identity',
      'Add Primary Call To Action',
      'Create Feature Sections',
    ],
  },
  {
    cardId: 'dashboard',
    title: 'Dashboard',
    steps: [
      'Create Navigation',
      'Add Metrics Overview',
      'Create Data Cards',
      'Organize Information Hierarchy',
    ],
  },
  {
    cardId: 'login',
    title: 'Login Screen',
    steps: [
      'Create Authentication Form',
      'Add Brand Identity',
      'Add Primary Action',
      'Provide Recovery Path',
    ],
  },
  {
    cardId: 'settings',
    title: 'Settings Page',
    steps: [
      'Create Preference Groups',
      'Organize Settings Categories',
      'Surface Account Information',
      'Add Save / Cancel Actions',
    ],
  },
]) {
  test(`uiux empty world ${scenario.cardId} starter reveals scenario-shaped semantic momentum after creation`, async ({ page }) => {
    const response = await page.goto('/workspace/create', {
      waitUntil: 'networkidle',
    });

    expect(response?.ok(), 'create route should respond successfully').toBeTruthy();
    await page.getByTestId(`uiux-empty-world-card-${scenario.cardId}`).click();

    await expect(page.getByTestId('uiux-first-expression')).toBeVisible();
    await expect(page.getByTestId('uiux-first-expression-title')).toContainText(scenario.title);
    await expect(page.getByTestId('uiux-world-editor')).toHaveAttribute('data-first-expression-focus', 'true');
    await expect(page.getByTestId('inspector-shell')).toHaveCount(0);

    await page.getByTestId('uiux-first-expression-continue').click();

    const inspector = page.getByTestId('inspector-shell');
    await expect(inspector).toBeVisible();
    await expect(inspector).toContainText('Page');
    await expect(inspector).toContainText('It belongs to your Application.');
    await expect(inspector).toContainText('Current scenario');
    await expect(inspector).toContainText(scenario.title);
    await expect(inspector).toContainText('Next Meaningful Steps');

    for (const step of scenario.steps) {
      await expect(inspector).toContainText(step);
    }
  });
}
