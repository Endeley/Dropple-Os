import { test, expect } from '@playwright/test';

test('graphic empty world projects communication-first guidance before any expression exists', async ({ page }) => {
  const response = await page.goto('/workspace/graphic', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'graphic route should respond successfully').toBeTruthy();
  await expect(page.getByTestId('graphic-empty-world')).toBeVisible();
  await expect(page.getByTestId('graphic-empty-world-title')).toContainText('Create visual communication');
  await expect(page.locator('body')).toContainText('Start from what you want to communicate, not from tools.');
  await expect(page.getByTestId('graphic-empty-world-card-poster')).toBeVisible();
  await expect(page.getByTestId('graphic-empty-world-card-socialGraphic')).toBeVisible();
  await expect(page.getByTestId('graphic-empty-world-card-brandBoard')).toBeVisible();
  await expect(page.getByTestId('graphic-empty-world-card-logoSheet')).toBeVisible();
  await expect(page.getByTestId('graphic-empty-world-card-flyer')).toBeVisible();
  await expect(page.getByTestId('graphic-empty-world-card-presentationCover')).toBeVisible();
  await expect(page.getByTestId('graphic-empty-world-guidance')).toContainText(
    'Choose a communication direction first.'
  );
});

test('graphic empty world starter selection transitions into composition-first confirmation', async ({ page }) => {
  const response = await page.goto('/workspace/graphic', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'graphic route should respond successfully').toBeTruthy();
  await page.getByTestId('graphic-empty-world-card-poster').click();

  const confirmation = page.getByTestId('graphic-empty-world-confirmation');
  await expect(confirmation).toBeVisible();
  await expect(confirmation).toContainText('Begin a Poster Composition.');
  await expect(confirmation).toContainText('before any artboard or object appears');
  await expect(page.getByTestId('graphic-empty-world-begin-composition')).toBeVisible();
});

test('graphic empty world begin composition resolves into a composition projection before any expression artifacts exist', async ({ page }) => {
  const response = await page.goto('/workspace/graphic', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'graphic route should respond successfully').toBeTruthy();
  await page.getByTestId('graphic-empty-world-card-socialGraphic').click();
  await page.getByTestId('graphic-empty-world-begin-composition').click();

  const composition = page.getByTestId('graphic-composition-projection');
  await expect(composition).toBeVisible();
  await expect(page.getByTestId('graphic-composition-title')).toContainText('Social Graphic Composition');
  await expect(page.getByTestId('graphic-composition-ownership')).toContainText('before any Artboard or object appears');
  await expect(page.getByTestId('graphic-composition-guidance')).toContainText(
    'This Composition exists before any Artboard.'
  );
  await expect(page.locator('[data-node-id]:visible')).toHaveCount(0);
});

test('graphic first expression creates an artboard only after the composition needs visible existence', async ({ page }) => {
  const response = await page.goto('/workspace/graphic', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'graphic route should respond successfully').toBeTruthy();
  await page.getByTestId('graphic-empty-world-card-poster').click();
  await page.getByTestId('graphic-empty-world-begin-composition').click();

  await expect(page.getByTestId('graphic-composition-guidance')).toContainText(
    'This Composition exists before any Artboard.'
  );

  await page.getByTestId('graphic-composition-begin-expression').click();

  const firstExpression = page.getByTestId('graphic-first-expression');
  await expect(firstExpression).toBeVisible();
  await expect(page.getByTestId('graphic-first-expression-title')).toContainText(
    'Your Composition now has somewhere to exist.'
  );
  await expect(page.getByTestId('graphic-first-expression-meaning')).toContainText(
    'needs visible existence'
  );
  await expect(page.getByTestId('graphic-first-expression-owner')).toContainText(
    'Composition remains the owner'
  );
  await expect(page.locator('[data-node-id]:visible')).toHaveCount(1);
  await expect(page.locator('body')).toContainText('Selection');
  await expect(page.locator('body')).toContainText('Poster Artboard');
});

test('graphic first expression reveals meaning-first vocabulary before implementation primitives', async ({ page }) => {
  const response = await page.goto('/workspace/graphic', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'graphic route should respond successfully').toBeTruthy();
  await page.getByTestId('graphic-empty-world-card-poster').click();
  await page.getByTestId('graphic-empty-world-begin-composition').click();
  await page.getByTestId('graphic-composition-begin-expression').click();
  await page.getByTestId('graphic-first-expression-continue').click();

  const vocabulary = page.getByTestId('graphic-vocabulary-overlay');
  await expect(vocabulary).toBeVisible();
  await expect(page.getByTestId('graphic-vocabulary-title')).toContainText(
    'What should this Composition express next?'
  );
  await expect(page.getByTestId('graphic-vocabulary-meaning-first')).toContainText(
    'implementation primitives'
  );
  await expect(page.getByTestId('graphic-vocabulary-message')).toContainText('Add a message');
  await expect(page.getByTestId('graphic-vocabulary-visualForm')).toContainText('Add a visual form');
  await expect(page.getByTestId('graphic-vocabulary-supportingImage')).toContainText('Add a supporting image');
  await expect(page.getByTestId('graphic-vocabulary-brandElement')).toContainText('Add a brand element');
});

test('graphic meaning-first vocabulary resolves into lawful expressive nodes', async ({ page }) => {
  const response = await page.goto('/workspace/graphic', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'graphic route should respond successfully').toBeTruthy();
  await page.getByTestId('graphic-empty-world-card-poster').click();
  await page.getByTestId('graphic-empty-world-begin-composition').click();
  await page.getByTestId('graphic-composition-begin-expression').click();
  await page.getByTestId('graphic-first-expression-continue').click();
  await page.getByTestId('graphic-vocabulary-message').click();

  await expect(page.getByTestId('graphic-vocabulary-overlay')).toHaveCount(0);
  await expect(page.locator('[data-node-id]:visible')).toHaveCount(2);
  await expect(page.locator('body')).toContainText('Message');
});

test('graphic expressive vocabulary transitions into refinement guidance before control-heavy editing', async ({ page }) => {
  const response = await page.goto('/workspace/graphic', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'graphic route should respond successfully').toBeTruthy();
  await page.getByTestId('graphic-empty-world-card-poster').click();
  await page.getByTestId('graphic-empty-world-begin-composition').click();
  await page.getByTestId('graphic-composition-begin-expression').click();
  await page.getByTestId('graphic-first-expression-continue').click();
  await page.getByTestId('graphic-vocabulary-message').click();

  const refinement = page.getByTestId('graphic-refinement-overlay');
  await expect(refinement).toBeVisible();
  await expect(page.getByTestId('graphic-refinement-title')).toContainText(
    'Make the message communicate more clearly.'
  );
  await expect(page.getByTestId('graphic-refinement-quality-first')).toContainText(
    'Greater control should follow communication need'
  );
  await expect(page.getByTestId('graphic-refinement-owner')).toContainText(
    'Composition remains the owner'
  );
  await expect(page.getByTestId('graphic-refinement-relationships')).toContainText(
    'Make the message the focal point'
  );
});

test('graphic refinement transitions into audience-first delivery before export mechanics', async ({ page }) => {
  const response = await page.goto('/workspace/graphic', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'graphic route should respond successfully').toBeTruthy();
  await page.getByTestId('graphic-empty-world-card-poster').click();
  await page.getByTestId('graphic-empty-world-begin-composition').click();
  await page.getByTestId('graphic-composition-begin-expression').click();
  await page.getByTestId('graphic-first-expression-continue').click();
  await page.getByTestId('graphic-vocabulary-message').click();

  const delivery = page.getByTestId('graphic-delivery-overlay');
  await expect(delivery).toBeVisible();
  await expect(page.getByTestId('graphic-delivery-title')).toContainText(
    'This Composition is ready to reach an audience.'
  );
  await expect(page.getByTestId('graphic-delivery-audience-first')).toContainText(
    'Audience and delivery context come first'
  );
  await expect(page.getByTestId('graphic-delivery-owner')).toContainText(
    'Composition remains the owner'
  );
  await expect(page.getByTestId('graphic-delivery-audiences')).toContainText('Client review');
  await expect(page.getByTestId('graphic-delivery-audiences')).toContainText('Social post');
  await page.getByTestId('graphic-delivery-audience-clientReview').click();
  await expect(page.getByTestId('graphic-delivery-confirmation')).toContainText(
    'Client review is now the delivery context'
  );
});
