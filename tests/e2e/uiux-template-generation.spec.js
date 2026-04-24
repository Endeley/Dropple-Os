import { test, expect } from '@playwright/test';
import { buildRuntimeSnapshotFromCertifiedTemplate } from '../../domain/templates/installCertifiedTemplate.js';

async function gotoWorkspace(page, path = '/workspace/new') {
    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.locator('[data-tool-id="select"]').first()).toBeVisible();
    await expect(page.getByTestId('canvas-host')).toBeVisible();
}

async function dragOnCanvas(page, from, to) {
    const canvas = page.getByTestId('canvas-host');
    const box = await canvas.boundingBox();

    if (!box) {
        throw new Error('Canvas host did not render');
    }

    await page.mouse.move(box.x + from.x, box.y + from.y);
    await page.mouse.down();
    await page.mouse.move(box.x + to.x, box.y + to.y, { steps: 8 });
    await page.mouse.up();
}

async function createFrame(page, from, to) {
    await page.locator('[data-tool-id="frame"]').click();
    await dragOnCanvas(page, from, to);
}

test('uiux authoring roundtrip publishes from the toolbar flow and installs into a fresh workspace', async ({ page, request }) => {
    const templateName = `Phase 2 Roundtrip ${Date.now()}`;

    await gotoWorkspace(page, '/workspace/new');

    await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });

    await expect(page.locator('[data-node-id]')).toHaveCount(1);

    await page.getByRole('button', { name: 'Publish' }).click();

    await expect(page.locator('body')).toContainText('Create Template');

    await page.getByPlaceholder('Untitled Template').fill(templateName);

    await page.getByPlaceholder('What does this template preserve?').fill('Phase 2 authoring roundtrip');

    const publishResponsePromise = page.waitForResponse((response) => response.url().includes('/api/templates/publish') && response.request().method() === 'POST');

    await page.getByRole('button', { name: 'Publish Template' }).click();

    const publishResponse = await publishResponsePromise;

    expect(publishResponse.ok(), 'publish API should respond successfully').toBeTruthy();

    const publishPayload = await publishResponse.json();

    expect(publishPayload?.result?.seed?.id).toBeTruthy();

    const publishedMode = publishPayload?.result?.seed?.mode ?? 'uiux';

    await expect(page.locator('body')).not.toContainText('Create Template');

    const registryResponse = await request.get(`/api/templates/certified?mode=${publishedMode}`);

    expect(registryResponse.ok(), `registry API should load ${publishedMode} templates`).toBeTruthy();

    const registryPayload = await registryResponse.json();

    const template = (registryPayload?.templates ?? []).find((entry) => entry?.metadata?.name === templateName);

    expect(template, 'published template should be visible in the certified registry').toBeTruthy();

    const snapshot = buildRuntimeSnapshotFromCertifiedTemplate(template);

    const snapshotPayload = {
        document: snapshot.document,
        timeline: snapshot.timeline,
        events: [],
        cursorIndex: -1,
    };

    await gotoWorkspace(page, '/workspace/new');

    // Correct invariant: fresh workspace is empty before hydration.
    await expect(page.locator('[data-node-id]')).toHaveCount(0);

    await page.evaluate((nextSnapshot) => {
        globalThis.__droppleDispatcher?.hydrateRuntimeState?.(nextSnapshot, { animate: false });
    }, snapshotPayload);

    await expect(page.locator('[data-node-id]')).toHaveCount(1);
});
