import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import {
    __resetRuntimeStateInternal,
    initialRuntimeState,
} from '@/runtime/state/runtimeState.internal.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { resolveToken } from '@/runtime/tokens/resolveToken.js';
import { projectActiveTokens } from '@/runtime/tokens/projectActiveTokens.js';

function resetStores() {
    __resetRuntimeStateInternal();
    useRuntimeStore.setState({
        document: null,
        viewNodes: {},
        viewRootIds: [],
        tokens: projectActiveTokens(null),
        workspace: null,
        viewSceneGraph: null,
        scene: null,
        selection: { ids: [], primary: null, count: 0 },
        clipboard: { count: 0, hasData: false },
        grouping: { count: 0 },
        selectionBounds: { bounds: null, center: null },
        transformAnchors: { pivot: null, resizeAnchors: null, rotateAnchor: null },
        guides: [],
        frameTime: 0,
        evaluatedScene: null,
        shotId: null,
        shotTimeMs: null,
        evalStatus: 'NO_SHOT',
        events: [],
        cursorIndex: -1,
    });
    useAnimatedRuntimeStore.setState({ previewNodes: {}, cameraTransform: null }, false);
}

function createSystemWorkspaceDef() {
    return {
        id: 'system',
        tools: ['select'],
        policy: {
            mutation: 'open',
            capabilities: ['token:author', 'theme:author', 'token:version'],
            denies: [],
        },
        events: {
            allowedEventTypes: [
                EventTypes.TOKEN_CREATE,
                EventTypes.TOKEN_SET,
                EventTypes.TOKEN_DELETE,
                EventTypes.TOKEN_ALIAS_SET,
                EventTypes.THEME_CREATE,
                EventTypes.THEME_SWITCH,
                EventTypes.TOKEN_VERSION_TAG,
                EventTypes.TOKEN_VERSION_FORK,
                EventTypes.TOKEN_VERSION_MERGE,
                EventTypes.TOKEN_VERSION_ROLLBACK,
            ],
            enabledTriggerTypes: [],
        },
    };
}

async function createSystemDispatcher() {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });
    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: createSystemWorkspaceDef(),
        },
    });
    return dispatcher;
}

async function replayEventStream(events) {
    resetStores();
    const dispatcher = await createSystemDispatcher();

    for (const event of events) {
        await dispatcher.dispatch(event);
    }

    return {
        state: dispatcher.getState(),
        projection: structuredClone(useRuntimeStore.getState().tokens),
    };
}

test.beforeEach(resetStores);

test('token create, set, and delete persist through the dispatcher', async () => {
    const dispatcher = await createSystemDispatcher();

    await dispatcher.dispatch({
        type: EventTypes.TOKEN_CREATE,
        payload: {
            tokenPath: 'color.brand',
            value: '#ff0000',
            scope: 'global',
        },
    });

    let next = dispatcher.getState();
    assert.equal(next?.document?.tokens?.color?.brand, '#ff0000');
    assert.equal(useRuntimeStore.getState().tokens.color.brand, '#ff0000');

    await dispatcher.dispatch({
        type: EventTypes.TOKEN_SET,
        payload: {
            tokenPath: 'color.brand',
            value: '#00ff00',
            scope: 'global',
        },
    });

    next = dispatcher.getState();
    assert.equal(next?.document?.tokens?.color?.brand, '#00ff00');
    assert.equal(useRuntimeStore.getState().tokens.color.brand, '#00ff00');

    await dispatcher.dispatch({
        type: EventTypes.TOKEN_DELETE,
        payload: {
            tokenPath: 'color.brand',
            scope: 'global',
        },
    });

    next = dispatcher.getState();
    assert.equal(next?.document?.tokens?.color?.brand, undefined);
    assert.equal(useRuntimeStore.getState().tokens.color.brand, undefined);
});

test('token alias resolution remains deterministic through the dispatcher path', async () => {
    const dispatcher = await createSystemDispatcher();

    await dispatcher.dispatch({
        type: EventTypes.TOKEN_ALIAS_SET,
        payload: {
            tokenPath: 'color.accent',
            targetPath: 'color.primary',
            scope: 'global',
        },
    });

    const projectedTokens = useRuntimeStore.getState().tokens;
    assert.equal(projectedTokens.color.accent, projectedTokens.color.primary);
    assert.equal(resolveToken('token.color.accent', projectedTokens), projectedTokens.color.primary);
});

test('theme switch mutates canonical active theme only and projects active tokens', async () => {
    const dispatcher = await createSystemDispatcher();

    await dispatcher.dispatch({
        type: EventTypes.THEME_CREATE,
        payload: {
            theme: {
                id: 'dark',
                label: 'Dark',
                tokens: {
                    color: {
                        primary: '#111111',
                    },
                },
            },
        },
    });

    const beforeSwitchTokens = structuredClone(dispatcher.getState()?.document?.tokens ?? {});

    await dispatcher.dispatch({
        type: EventTypes.THEME_SWITCH,
        payload: {
            themeId: 'dark',
        },
    });

    const next = dispatcher.getState();
    assert.equal(next?.document?.themes?.activeThemeId, 'dark');
    assert.deepEqual(next?.document?.tokens ?? {}, beforeSwitchTokens);
    assert.equal(useRuntimeStore.getState().tokens.color.primary, '#111111');
});

test('token version tags append lineage through the dispatcher', async () => {
    const dispatcher = await createSystemDispatcher();

    await dispatcher.dispatch({
        type: EventTypes.TOKEN_VERSION_TAG,
        payload: {
            versionId: 'v1',
            label: 'Initial',
            timestamp: 1,
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.TOKEN_VERSION_TAG,
        payload: {
            versionId: 'v2',
            label: 'Dark theme ready',
            parentId: 'v1',
            themeId: 'dark',
            timestamp: 2,
        },
    });

    const tokenVersions = dispatcher.getState()?.document?.tokenVersions;
    assert.deepEqual(tokenVersions?.order, ['v1', 'v2']);
    assert.deepEqual(tokenVersions?.entries?.v2?.parentVersionIds, ['v1']);
    assert.equal(tokenVersions?.entries?.v2?.themeId, 'dark');
    assert.equal(tokenVersions?.entries?.v2?.operation, 'tag');
    assert.equal(tokenVersions?.activeVersionId, 'v2');
});

test('token version fork, merge, and rollback stay lawful through the dispatcher', async () => {
    const dispatcher = await createSystemDispatcher();

    await dispatcher.dispatch({
        type: EventTypes.TOKEN_VERSION_TAG,
        payload: {
            versionId: 'v1',
            label: 'Initial',
            timestamp: 1,
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.TOKEN_VERSION_FORK,
        payload: {
            versionId: 'v2',
            parentVersionId: 'v1',
            label: 'Fork',
            timestamp: 2,
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.TOKEN_VERSION_MERGE,
        payload: {
            versionId: 'v3',
            parentVersionIds: ['v2', 'v1'],
            label: 'Merge',
            timestamp: 3,
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.TOKEN_VERSION_ROLLBACK,
        payload: {
            rollbackTargetId: 'v1',
        },
    });

    const tokenVersions = dispatcher.getState()?.document?.tokenVersions;
    assert.deepEqual(tokenVersions?.entries?.v2?.parentVersionIds, ['v1']);
    assert.deepEqual(tokenVersions?.entries?.v3?.parentVersionIds, ['v1', 'v2']);
    assert.equal(tokenVersions?.entries?.v3?.operation, 'merge');
    assert.equal(tokenVersions?.activeVersionId, 'v1');
});

test('token event replay is deterministic for the same event stream', async () => {
    const events = [
        {
            type: EventTypes.TOKEN_CREATE,
            payload: {
                tokenPath: 'color.brand',
                value: '#ff0000',
                scope: 'global',
            },
        },
        {
            type: EventTypes.TOKEN_SET,
            payload: {
                tokenPath: 'color.brand',
                value: '#00ff00',
                scope: 'global',
            },
        },
        {
            type: EventTypes.TOKEN_ALIAS_SET,
            payload: {
                tokenPath: 'color.accent',
                targetPath: 'color.brand',
                scope: 'global',
            },
        },
        {
            type: EventTypes.THEME_CREATE,
            payload: {
                theme: {
                    id: 'dark',
                    label: 'Dark',
                    tokens: {
                        color: {
                            primary: '#111111',
                        },
                    },
                },
            },
        },
        {
            type: EventTypes.THEME_SWITCH,
            payload: {
                themeId: 'dark',
            },
        },
        {
            type: EventTypes.TOKEN_VERSION_TAG,
            payload: {
                versionId: 'v1',
                label: 'Initial',
                timestamp: 1,
            },
        },
        {
            type: EventTypes.TOKEN_VERSION_FORK,
            payload: {
                versionId: 'v2',
                parentVersionId: 'v1',
                label: 'Fork',
                timestamp: 2,
            },
        },
        {
            type: EventTypes.TOKEN_VERSION_MERGE,
            payload: {
                versionId: 'v3',
                parentVersionIds: ['v2', 'v1'],
                label: 'Merge',
                timestamp: 3,
            },
        },
        {
            type: EventTypes.TOKEN_VERSION_ROLLBACK,
            payload: {
                rollbackTargetId: 'v1',
            },
        },
    ];

    const first = await replayEventStream(events);
    const second = await replayEventStream(events);

    assert.deepEqual(first.state?.document?.tokens, second.state?.document?.tokens);
    assert.deepEqual(first.state?.document?.themes, second.state?.document?.themes);
    assert.deepEqual(first.state?.document?.tokenVersions, second.state?.document?.tokenVersions);
    assert.deepEqual(first.projection, second.projection);
});
