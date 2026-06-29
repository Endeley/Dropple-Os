import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createWorldNavigationGeographyPolicy,
    hasProjectHistory,
    isCreateUiWorld,
    resolveArtifactFocusViewport,
    resolveCurrentFocus,
    resolveFirstFrameBounds,
    resolveFirstRememberedArtifact,
    resolveProjectHome,
    resolveProjectHomeViewport,
    resolveProjectOrigin,
    shouldInitializeProjectHomeViewport,
} from '@/runtime/workspaces/projectSubstrateNavigation.js';

test('Create World navigation/geography policy preserves the existing substrate behavior surface', () => {
    assert.equal(
        createWorldNavigationGeographyPolicy.isNavigationGeographyContext({
            workspaceId: 'uiux',
        }),
        isCreateUiWorld({ workspaceId: 'uiux' }),
    );

    assert.equal(
        createWorldNavigationGeographyPolicy.hasProjectHistory({
            workspaceId: 'uiux',
            nodeCount: 1,
        }),
        hasProjectHistory({
            workspaceId: 'uiux',
            nodeCount: 1,
        }),
    );

    assert.deepEqual(
        createWorldNavigationGeographyPolicy.resolveHome({
            workspaceId: 'uiux',
        }),
        resolveProjectHome({ workspaceId: 'uiux' }),
    );

    assert.deepEqual(
        createWorldNavigationGeographyPolicy.resolveHomeViewport({
            workspaceId: 'uiux',
            hostRect: { width: 1280, height: 720 },
            scale: 1,
        }),
        resolveProjectHomeViewport({
            workspaceId: 'uiux',
            hostRect: { width: 1280, height: 720 },
            scale: 1,
        }),
    );

    assert.deepEqual(
        createWorldNavigationGeographyPolicy.resolveFirstArtifactBounds({
            workspaceId: 'uiux',
            nodeCount: 0,
        }),
        resolveFirstFrameBounds({
            workspaceId: 'uiux',
            nodeCount: 0,
        }),
    );
});

test('project history begins when Create > UI world contains work', () => {
    assert.equal(
        hasProjectHistory({
            workspaceId: 'uiux',
            nodeCount: 0,
        }),
        false,
    );

    assert.equal(
        hasProjectHistory({
            workspaceId: 'uiux',
            nodeCount: 1,
        }),
        true,
    );

    assert.equal(
        hasProjectHistory({
            workspaceId: 'graphic',
            nodeCount: 5,
        }),
        false,
    );

    assert.equal(
        hasProjectHistory({
            workspaceId: 'uiux',
            nodeCount: 0,
            worldHistory: {
                firstRememberedArtifact: {
                    nodeId: 'frame-1',
                },
            },
        }),
        true,
    );
});

test('first remembered artifact resolves as a stable project history seed', () => {
    assert.deepEqual(
        resolveFirstRememberedArtifact({
            workspaceId: 'uiux',
            worldHistory: {
                firstRememberedArtifact: {
                    nodeId: 'frame-1',
                    nodeType: 'frame',
                    parentId: null,
                    layout: { x: -192, y: -144, width: 1440, height: 1024 },
                },
            },
        }),
        {
            nodeId: 'frame-1',
            nodeType: 'frame',
            parentId: null,
            layout: { x: -192, y: -144, width: 1440, height: 1024 },
        },
    );
});

test('Create > UI origin and home are separate concepts that currently share the same coordinate', () => {
    const origin = resolveProjectOrigin({ workspaceId: 'uiux' });
    const home = resolveProjectHome({ workspaceId: 'uiux' });

    assert.deepEqual(origin, { x: 0, y: 0 });
    assert.deepEqual(home, { x: 0, y: 0 });
    assert.notEqual(origin, home);
});

test('project home viewport centers the home coordinate inside the visible host rect', () => {
    const viewport = resolveProjectHomeViewport({
        workspaceId: 'uiux',
        hostRect: { width: 1440, height: 900 },
        scale: 1,
    });

    assert.deepEqual(viewport, {
        x: -720,
        y: -450,
        scale: 1,
        width: 1440,
        height: 900,
    });
});

test('current focus follows viewport center while project home remains stable', () => {
    const home = resolveProjectHome({ workspaceId: 'uiux' });
    const focus = resolveCurrentFocus({
        workspaceId: 'uiux',
        viewport: { x: 1200, y: 600, scale: 2 },
        hostRect: { width: 800, height: 600 },
    });

    assert.deepEqual(home, { x: 0, y: 0 });
    assert.deepEqual(focus, { x: 1400, y: 750 });
});

test('first frame resolves relative to project home for empty Create > UI worlds', () => {
    const bounds = resolveFirstFrameBounds({
        workspaceId: 'uiux',
        nodeCount: 0,
    });

    assert.deepEqual(bounds, {
        x: -192,
        y: -144,
        width: 1440,
        height: 1024,
    });
});

test('artifact focus viewport centers the working artifact while preserving current scale', () => {
    const viewport = resolveArtifactFocusViewport({
        bounds: {
            x: -192,
            y: -144,
            width: 1440,
            height: 1024,
        },
        hostRect: { width: 1280, height: 800 },
        viewport: { x: -640, y: -400, scale: 1 },
    });

    assert.deepEqual(viewport, {
        x: -112,
        y: -32,
        scale: 1,
        width: 1280,
        height: 800,
    });
});

test('project home viewport initialization only runs for empty Create > UI worlds at default viewport', () => {
    assert.equal(
        shouldInitializeProjectHomeViewport({
            workspaceId: 'uiux',
            nodeCount: 0,
            viewport: { x: 0, y: 0, scale: 1 },
            hostRect: { width: 1280, height: 720 },
        }),
        true,
    );

    assert.equal(
        shouldInitializeProjectHomeViewport({
            workspaceId: 'uiux',
            nodeCount: 1,
            viewport: { x: 0, y: 0, scale: 1 },
            hostRect: { width: 1280, height: 720 },
        }),
        false,
    );

    assert.equal(
        shouldInitializeProjectHomeViewport({
            workspaceId: 'uiux',
            nodeCount: 0,
            viewport: { x: 12, y: 0, scale: 1 },
            hostRect: { width: 1280, height: 720 },
        }),
        false,
    );
});

test('non Create > UI worlds do not opt into Create project home behavior', () => {
    assert.equal(isCreateUiWorld({ workspaceId: 'graphic' }), false);
    assert.equal(
        resolveFirstFrameBounds({
            workspaceId: 'graphic',
            nodeCount: 0,
        }),
        null,
    );
});
