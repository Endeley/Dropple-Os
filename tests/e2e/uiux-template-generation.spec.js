import { test, expect } from '@playwright/test';
import { expectSingleVisibleCanvasHost, visibleCanvasHost } from './helpers/canvasHost.js';

async function gotoWorkspace(page, path = '/workspace/new') {
    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.locator('[data-tool-id="select"]').first()).toBeVisible();
    await expectSingleVisibleCanvasHost(page);
}

async function assertReceivesPointerEvents(locator) {
    await locator.click({ trial: true });
}

function visibleNodes(page) {
    return page.locator('[data-node-id]:visible');
}

async function beginBlankPageProject(page) {
    await page.getByTestId('uiux-empty-world-card-blankPage').click();
    await expect(page.getByTestId('uiux-intent-confirmation')).toBeVisible();
    await page.getByTestId('uiux-intent-continue').click();
    await expect(page.getByTestId('uiux-first-expression')).toBeVisible();
    await page.getByTestId('uiux-first-expression-continue').click();
    await expect(page.getByTestId('uiux-first-expression')).toHaveCount(0);
    await expect(visibleNodes(page)).toHaveCount(1);
}

async function publishMotionTemplate(request, {
    title = `Motion Template ${Date.now()}`,
    description = 'Motion-preserving certified template fixture',
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
                        'clip-headline-translateY': {
                            id: 'clip-headline-translateY',
                            target: 'headline',
                            property: 'translateY',
                            keyframes: [
                                { id: 'kf-y-0', t: 0, v: 18 },
                                { id: 'kf-y-300', t: 300, v: 0, easing: 'ease-in-out' },
                            ],
                        },
                    },
                },
            },
            metadata: {
                title,
                description,
                author: 'UIUX Motion QA',
            },
            mode: {
                id: 'uiux',
                workspaceId: 'design',
            },
        },
    });

    expect(response.ok(), 'motion template publish should respond successfully').toBeTruthy();
    const payload = await response.json();
    return payload?.result?.seed ?? null;
}

function buildEnvironmentWorkspacePath(template) {
    const lineageRootId =
        template?.lineageRootId ??
        template?.certification?.lineageRootId ??
        template?.lineage?.rootId ??
        null;
    const versionId =
        template?.versionId ??
        template?.certification?.lineageNodeId ??
        template?.lineage?.nodeId ??
        null;
    const modeId = template?.mode ?? template?.modeId ?? 'uiux';
    const params = new URLSearchParams({
        lineageRootId,
        versionId,
        workspaceId: 'design',
        modeId,
    });

    return `/workspace/new?${params.toString()}`;
}

test('uiux authoring roundtrip publishes from the toolbar flow and installs into a fresh workspace', async ({ page, request }) => {
    const templateName = `Phase 2 Roundtrip ${Date.now()}`;

    await gotoWorkspace(page, '/workspace/new');
    await beginBlankPageProject(page);

    const publishButton = page.getByRole('button', { name: 'Publish' });
    await assertReceivesPointerEvents(publishButton);
    await publishButton.click();

    await expect(page.locator('body')).toContainText('Create Template');

    await page.getByPlaceholder('Untitled Template').fill(templateName);

    await page.getByPlaceholder('What does this template preserve?').fill('Phase 2 authoring roundtrip');

    const publishTemplateButton = page.getByRole('button', { name: 'Publish Template' });
    await expect(publishTemplateButton).toBeEnabled();
    await assertReceivesPointerEvents(publishTemplateButton);

    const publishResponsePromise = page.waitForResponse((response) => response.url().includes('/api/templates/publish') && response.request().method() === 'POST');

    await publishTemplateButton.click();
    await page.waitForFunction(() => {
        const button = Array.from(document.querySelectorAll('button')).find(
            (entry) => entry.textContent?.trim() === 'Publish Template',
        );
        return !button || button.hasAttribute('disabled');
    });

    const publishResponse = await publishResponsePromise;

    expect(publishResponse.ok(), 'publish API should respond successfully').toBeTruthy();

    const publishPayload = await publishResponse.json();

    const publishedTemplateId = publishPayload?.result?.seed?.id ?? null;
    const publishedMode = publishPayload?.result?.seed?.mode ?? 'design';
    const publishTrustStatus = publishPayload?.releaseTrust?.status ?? null;

    expect(publishedTemplateId).toBeTruthy();

    await expect(page.locator('body')).not.toContainText('Create Template');
    const trustSurface = page.getByTestId('template-publish-trust-surface');
    await expect(trustSurface).toBeVisible();
    if (publishTrustStatus) {
        await expect(trustSurface).toContainText(`Release Trust: ${publishTrustStatus}`);
    } else {
        await expect(trustSurface).toContainText('Release Trust:');
    }
    await trustSurface.getByRole('button', { name: 'View Full Trust Summary' }).click();
    const fullTrustSummary = page.getByTestId('template-publish-trust-summary-full');
    await expect(fullTrustSummary).toBeVisible();
    await expect(fullTrustSummary).toContainText('## Release Trust Diff Summary');
    await expect(page.getByTestId('template-publish-trust-history-item')).toHaveCount(1);

    const secondTemplateName = `${templateName} 2`;
    await publishButton.click();
    await expect(page.locator('body')).toContainText('Create Template');
    await page.getByPlaceholder('Untitled Template').fill(secondTemplateName);
    await page.getByPlaceholder('What does this template preserve?').fill('Phase 2 second publish for trust history');
    const secondPublishResponsePromise = page.waitForResponse(
        (response) => response.url().includes('/api/templates/publish') && response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Publish Template' }).click();
    await secondPublishResponsePromise;
    await expect(page.locator('body')).not.toContainText('Create Template');
    await expect(page.getByTestId('template-publish-trust-history-item')).toHaveCount(2);
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByTestId('template-publish-trust-surface')).toBeVisible();
    await expect(page.getByTestId('template-publish-trust-history-item')).toHaveCount(2);

    const registryResponse = await request.get(`/api/templates/certified?mode=${publishedMode}`);

    expect(registryResponse.ok(), `registry API should load ${publishedMode} templates`).toBeTruthy();

    const registryPayload = await registryResponse.json();

    const template = (registryPayload?.templates ?? []).find((entry) => entry?.metadata?.name === templateName);

    expect(template, 'published template should be visible in the certified registry').toBeTruthy();

    await page.evaluate(() => {
        for (const key of Object.keys(window.localStorage)) {
            if (key.startsWith('dropple.')) {
                window.localStorage.removeItem(key);
            }
        }
    });

    await gotoWorkspace(page, buildEnvironmentWorkspacePath(template));
    await expect(visibleNodes(page)).toHaveCount(1);
    await expect(page.locator('body')).not.toContainText('Application error');

    const installedPublishButton = page.getByRole('button', { name: 'Publish' });
    await expect(installedPublishButton).toBeVisible();
    await assertReceivesPointerEvents(installedPublishButton);
});

test('certified uiux template install preserves motion runtime truth', async ({ page, request }) => {
    const publishedTemplate = await publishMotionTemplate(request);

    expect(publishedTemplate?.id).toBeTruthy();

    await gotoWorkspace(page, '/workspace/new');

    await page.evaluate(() => {
        for (const key of Object.keys(window.localStorage)) {
            if (key.startsWith('dropple.')) {
                window.localStorage.removeItem(key);
            }
        }
    });

    await gotoWorkspace(page, buildEnvironmentWorkspacePath(publishedTemplate));
    await expect(visibleNodes(page)).toHaveCount(2);

    const motionSummary = await page.evaluate(() => {
        const runtimeState = globalThis.__droppleDispatcher?.getState?.() ?? null;
        const clips = runtimeState?.document?.motion?.clips ?? {};
        const timelineChannels = runtimeState?.timeline?.timelines?.default?.channels ?? [];

        return {
            clipIds: Object.keys(clips).sort(),
            opacityEasing: clips['clip:headline:opacity']?.keyframes?.[1]?.easing ?? null,
            translateYValue: clips['clip:headline:translateY']?.keyframes?.[0]?.v ?? null,
            timelineChannels: timelineChannels.map((channel) => ({
                id: channel.id,
                property: channel.property,
                target: channel.target,
            })),
        };
    });

    expect(motionSummary).toEqual({
        clipIds: ['clip:headline:opacity', 'clip:headline:translateY'],
        opacityEasing: 'easeInOut',
        translateYValue: 18,
        timelineChannels: [
            { id: 'opacity', property: 'opacity', target: 'headline' },
            { id: 'transform.y', property: 'translateY', target: 'headline' },
        ],
    });

    const headline = page.locator('[data-node-id="headline"]:visible').first();
    await expect(headline).toBeVisible();
});

test('uiux transition timeline can author a motion keyframe through lawful intents', async ({ page }) => {
    await gotoWorkspace(page, '/workspace/new');
    await beginBlankPageProject(page);
    const createdNodeId = await visibleNodes(page).first().getAttribute('data-node-id');

    await expect(page.getByTestId('uiux-bottom-dock')).toHaveCount(0);
    await expect(page.getByTestId('uiux-transition-timeline')).toHaveCount(0);

    await page.locator('[data-tool-id="select"]').click();
    await visibleNodes(page).first().click({ force: true });
    await expect(page.getByTestId('inspector-shell')).toBeVisible();

    const attachMotionButton = page.getByTestId('uiux-motion-attach');
    await expect(attachMotionButton).toBeVisible();
    await attachMotionButton.click();

    await expect(page.getByTestId('uiux-transition-timeline')).toBeVisible();
    await expect(page.getByTestId('uiux-transition-clip-count')).toHaveText('1 selected clips');
    const addKeyframeButton = page.getByTestId('uiux-transition-add-keyframe');
    const updateKeyframeButton = page.getByTestId('uiux-transition-update-keyframe');
    const moveKeyframeButton = page.getByTestId('uiux-transition-move-keyframe');
    const deleteKeyframeButton = page.getByTestId('uiux-transition-delete-keyframe');
    await expect(addKeyframeButton).toBeEnabled();
    await expect(updateKeyframeButton).toBeDisabled();
    await expect(moveKeyframeButton).toBeDisabled();
    await expect(deleteKeyframeButton).toBeDisabled();

    await page.getByLabel('Property').selectOption('opacity');
    await page.getByLabel('Value').fill('0.35');
    await page.getByLabel('Easing').selectOption('ease-in-out');
    await assertReceivesPointerEvents(addKeyframeButton);
    await addKeyframeButton.click();

    await expect(page.getByTestId('uiux-transition-clip-count')).toHaveText('1 selected clips');
    await expect(updateKeyframeButton).toBeEnabled();
    await expect(moveKeyframeButton).toBeEnabled();
    await expect(deleteKeyframeButton).toBeEnabled();

    const runtimeMotion = await page.evaluate(() => {
        const runtimeState = globalThis.__droppleDispatcher?.getState?.() ?? null;
        return runtimeState?.document?.motion?.clips ?? {};
    });

    const createdClip = Object.values(runtimeMotion)[0];

    expect(createdClip).toMatchObject({
        target: createdNodeId,
        property: 'opacity',
    });
    expect(createdClip.keyframes).toHaveLength(1);
    expect(createdClip.keyframes[0]).toMatchObject({
        t: 0,
        v: 0.35,
        easing: 'ease-in-out',
    });

    await page.getByLabel('Value').fill('0.8');
    await page.getByLabel('Easing').selectOption('linear');
    await page.getByTestId('uiux-transition-update-keyframe').click();
    await page.waitForFunction(() => {
        const runtimeState = globalThis.__droppleDispatcher?.getState?.() ?? null;
        const clip = Object.values(runtimeState?.document?.motion?.clips ?? {})[0];
        const keyframe = clip?.keyframes?.[0];
        return keyframe?.v === 0.8 && keyframe?.easing === 'linear';
    });

    await page.getByTestId('uiux-transition-time-input').fill('180');
    await page.getByTestId('uiux-transition-move-keyframe').click();
    await page.waitForFunction(() => {
        const runtimeState = globalThis.__droppleDispatcher?.getState?.() ?? null;
        const clip = Object.values(runtimeState?.document?.motion?.clips ?? {})[0];
        const keyframe = clip?.keyframes?.[0];
        return keyframe?.t === 180;
    });

    const updatedMotion = await page.evaluate(() => {
        const runtimeState = globalThis.__droppleDispatcher?.getState?.() ?? null;
        return runtimeState?.document?.motion?.clips ?? {};
    });

    const updatedClip = Object.values(updatedMotion)[0];
    expect(updatedClip.keyframes[0]).toMatchObject({
        t: 180,
        v: 0.8,
        easing: 'linear',
    });

    await deleteKeyframeButton.click();
    await page.waitForFunction(() => {
        const runtimeState = globalThis.__droppleDispatcher?.getState?.() ?? null;
        const clip = Object.values(runtimeState?.document?.motion?.clips ?? {})[0];
        return Array.isArray(clip?.keyframes) && clip.keyframes.length === 0;
    });
    await expect(page.getByTestId('uiux-transition-clip-count')).toHaveText('1 selected clips');
    await expect(updateKeyframeButton).toBeDisabled();
    await expect(moveKeyframeButton).toBeDisabled();
    await expect(deleteKeyframeButton).toBeDisabled();

    const deletedMotion = await page.evaluate(() => {
        const runtimeState = globalThis.__droppleDispatcher?.getState?.() ?? null;
        return runtimeState?.document?.motion?.clips ?? {};
    });

    const deletedClip = Object.values(deletedMotion)[0];
    expect(deletedClip.keyframes).toHaveLength(0);
});
