import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { __resetRuntimeStateInternal } from '@/runtime/state/runtimeState.internal.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { getWorkspaceContractDefinition } from '@/ui/bridges/workspaceActivationFacade.js';

function resetStores() {
    __resetRuntimeStateInternal();
    useRuntimeStore.setState({
        viewNodes: {},
        viewRootIds: [],
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

function createWorkspaceDef({
    id = 'graphic',
    tools = ['select'],
    allowedEventTypes = [],
    capabilities = [],
} = {}) {
    return {
        id,
        tools,
        policy: {
            mutation: 'open',
            capabilities,
            denies: [],
        },
        events: {
            allowedEventTypes,
            enabledTriggerTypes: [],
        },
    };
}

test.beforeEach(resetStores);

test('workspace activation seeds runtime workspace truth and visible tools', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: createWorkspaceDef({
                tools: ['select', 'shape'],
                allowedEventTypes: [EventTypes.SELECTION_SET],
                capabilities: ['select:basic'],
            }),
        },
    });

    const next = dispatcher.getState();
    const projection = useRuntimeStore.getState();

    assert.equal(next?.workspace?.id, 'graphic');
    assert.equal(next?.workspace?.allowedEventTypes?.has(EventTypes.SELECTION_SET), true);
    assert.equal(projection.tools.visibleTools.includes('select'), true);
});

test('dispatcher blocks events excluded by workspace allowedEventTypes', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: createWorkspaceDef({
                allowedEventTypes: [EventTypes.SELECTION_SET],
                capabilities: ['select:basic', 'node:create'],
            }),
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.NODE_CREATE,
        payload: {
            node: {
                id: 'blocked-node',
                type: 'frame',
                props: {
                    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                },
            },
        },
    });

    assert.equal(next?.nodes?.['blocked-node'], undefined);
    assert.deepEqual(next?.rootIds ?? [], []);
});

test('dispatcher blocks events that fail workspace capability policy', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: createWorkspaceDef({
                allowedEventTypes: [EventTypes.NODE_CREATE],
                capabilities: ['select:basic'],
            }),
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.NODE_CREATE,
        payload: {
            node: {
                id: 'policy-blocked-node',
                type: 'frame',
                props: {
                    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                },
            },
        },
    });

    assert.equal(next?.nodes?.['policy-blocked-node'], undefined);
    assert.deepEqual(next?.rootIds ?? [], []);
});

test('workspace activation is exempt from the current workspace allowlist', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: createWorkspaceDef({
                id: 'graphic',
                allowedEventTypes: [EventTypes.SELECTION_SET],
                capabilities: ['select:basic'],
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: createWorkspaceDef({
                id: 'review',
                tools: ['select'],
                allowedEventTypes: [EventTypes.SELECTION_SET],
                capabilities: ['select:basic'],
            }),
        },
    });

    const next = dispatcher.getState();
    assert.equal(next?.workspace?.id, 'review');
});

test('runtime-local tool selection is exempt from workspace authoring allowlists', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: createWorkspaceDef({
                allowedEventTypes: [EventTypes.NODE_CREATE],
                capabilities: ['node:create'],
                tools: ['select', 'frame'],
            }),
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TOOL_SET_ACTIVE,
        payload: {
            tool: 'frame',
        },
    });

    assert.equal(next?.tools?.activeTool, 'frame');
});

test('runtime-local tool selection accepts canonical toolId payloads from the UI intent bridge', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: createWorkspaceDef({
                allowedEventTypes: [EventTypes.NODE_CREATE],
                capabilities: ['node:create'],
                tools: ['select', 'frame'],
            }),
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TOOL_SET_ACTIVE,
        payload: {
            toolId: 'frame',
        },
    });

    assert.equal(next?.tools?.activeTool, 'frame');
});

test('canonical design activation inherits node authoring events from its default mode policy', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceContractDefinition('design'),
        },
    });

    const activated = dispatcher.getState();

    assert.equal(
        activated?.workspace?.allowedEventTypes?.has(EventTypes.NODE_CREATE),
        true,
    );

    const next = await dispatcher.dispatch({
        type: EventTypes.NODE_CREATE,
        payload: {
            node: {
                id: 'design-node',
                type: 'frame',
                layout: { x: 10, y: 20, width: 100, height: 80 },
                props: {},
                style: {},
                children: [],
            },
        },
    });

    assert.equal(
        next?.document?.sceneGraph?.nodes?.['design-node']?.id,
        'design-node',
    );
});

test('direct uiux activation inherits node authoring events and creation tools from its base workspace policy', () => {
    const contract = getWorkspaceContractDefinition('uiux');

    assert.equal(contract?.id, 'design');
    assert.equal(contract?.ui?.tools?.includes('frame'), true);
    assert.equal(
        contract?.events?.allowedEventTypes?.includes(EventTypes.NODE_CREATE),
        true,
    );
    assert.equal(
        contract?.policy?.capabilities?.includes('node:create'),
        true,
    );
});

test('runtime-local drag session events update interaction state without entering persisted history', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    const started = await dispatcher.dispatch({
        type: EventTypes.DRAG_START,
        payload: {
            type: 'pending-select',
            pointer: { x: 12, y: 24 },
            meta: { hitNodeId: 'node-1' },
        },
    });

    assert.equal(started?.interaction?.drag?.active, true);
    assert.equal(started?.interaction?.drag?.type, 'pending-select');
    assert.deepEqual(started?.interaction?.drag?.startPointer, { x: 12, y: 24 });
    assert.deepEqual(useRuntimeStore.getState().events, []);

    const updated = await dispatcher.dispatch({
        type: EventTypes.DRAG_UPDATE,
        payload: {
            pointer: { x: 20, y: 36 },
        },
    });

    assert.deepEqual(updated?.interaction?.drag?.currentPointer, { x: 20, y: 36 });

    const ended = await dispatcher.dispatch({
        type: EventTypes.DRAG_END,
    });

    assert.equal(ended?.interaction?.drag?.active, false);
    assert.deepEqual(useRuntimeStore.getState().events, []);
});

test('dispatcher applies canonical timeline track creation through reducer-owned timeline truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'track_1',
            type: 'standard',
        },
    });

    const tracks = next?.timeline?.timelines?.default?.tracks ?? [];
    assert.equal(tracks.length, 1);
    assert.equal(tracks[0]?.id, 'track_1');
    assert.equal(tracks[0]?.type, 'standard');
    assert.equal(tracks[0]?.order, 0);
});

test('animation workspace activation allows canonical timeline track creation', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceContractDefinition('animation'),
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'anim-track-1',
            type: 'standard',
        },
    });

    const tracks = next?.timeline?.timelines?.default?.tracks ?? [];
    assert.equal(tracks.some((track) => track.id === 'anim-track-1'), true);
});

test('dispatcher applies canonical timeline track deletion through reducer-owned timeline truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'track_1',
            type: 'standard',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_DELETE,
        payload: {
            id: 'track_1',
        },
    });

    const tracks = next?.timeline?.timelines?.default?.tracks ?? [];
    assert.equal(tracks.some((track) => track.id === 'track_1'), false);
});

test('animation workspace activation allows canonical timeline track deletion', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceContractDefinition('animation'),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'anim-track-2',
            type: 'standard',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_DELETE,
        payload: {
            id: 'anim-track-2',
        },
    });

    const tracks = next?.timeline?.timelines?.default?.tracks ?? [];
    assert.equal(tracks.some((track) => track.id === 'anim-track-2'), false);
});

test('dispatcher applies canonical timeline track reorder through reducer-owned timeline truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'track_1',
            type: 'standard',
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'track_2',
            type: 'standard',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_REORDER,
        payload: {
            id: 'track_2',
            toIndex: 0,
        },
    });

    const tracks = next?.timeline?.timelines?.default?.tracks ?? [];
    assert.equal(tracks[0]?.id, 'track_2');
    assert.equal(tracks[1]?.id, 'track_1');
    assert.equal(tracks[0]?.order, 0);
    assert.equal(tracks[1]?.order, 1);
});

test('animation workspace activation allows canonical timeline track reorder', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceContractDefinition('animation'),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'anim-track-3',
            type: 'standard',
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'anim-track-4',
            type: 'standard',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_REORDER,
        payload: {
            id: 'anim-track-4',
            toIndex: 0,
        },
    });

    const tracks = next?.timeline?.timelines?.default?.tracks ?? [];
    assert.equal(tracks[0]?.id, 'anim-track-4');
});

test('dispatcher assigns a channel through reducer-owned timeline track truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'track_1',
            type: 'standard',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CHANNEL_ASSIGN,
        payload: {
            trackId: 'track_1',
            channelId: 'opacity',
        },
    });

    const tracks = next?.timeline?.timelines?.default?.tracks ?? [];
    assert.deepEqual(tracks[0]?.channelIds, ['opacity']);
});

test('animation workspace activation allows canonical timeline channel assignment', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceContractDefinition('animation'),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'anim-track-channel-1',
            type: 'standard',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CHANNEL_ASSIGN,
        payload: {
            trackId: 'anim-track-channel-1',
            channelId: 'scale',
        },
    });

    const tracks = next?.timeline?.timelines?.default?.tracks ?? [];
    const targetTrack = tracks.find((track) => track.id === 'anim-track-channel-1');
    assert.deepEqual(targetTrack?.channelIds, ['scale']);
});

test('dispatcher toggles canonical timeline track lock through reducer-owned timeline truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'track-lock-1',
            type: 'standard',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_LOCK_TOGGLE,
        payload: {
            id: 'track-lock-1',
        },
    });

    const tracks = next?.timeline?.timelines?.default?.tracks ?? [];
    assert.equal(tracks[0]?.meta?.locked, true);
});

test('animation workspace activation allows canonical timeline track lock toggle', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceContractDefinition('animation'),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'anim-track-lock-1',
            type: 'standard',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_LOCK_TOGGLE,
        payload: {
            id: 'anim-track-lock-1',
        },
    });

    const tracks = next?.timeline?.timelines?.default?.tracks ?? [];
    const targetTrack = tracks.find((track) => track.id === 'anim-track-lock-1');
    assert.equal(targetTrack?.meta?.locked, true);
});

test('dispatcher sets canonical timeline track blend mode through reducer-owned timeline truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'track-blend-1',
            type: 'standard',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_BLEND_MODE_SET,
        payload: {
            id: 'track-blend-1',
            blendMode: 'replace',
        },
    });

    const tracks = next?.timeline?.timelines?.default?.tracks ?? [];
    assert.equal(tracks[0]?.meta?.blendMode, 'replace');
});

test('animation workspace activation allows canonical timeline track blend mode set', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceContractDefinition('animation'),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'anim-track-blend-1',
            type: 'standard',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_BLEND_MODE_SET,
        payload: {
            id: 'anim-track-blend-1',
            blendMode: 'replace',
        },
    });

    const tracks = next?.timeline?.timelines?.default?.tracks ?? [];
    const targetTrack = tracks.find((track) => track.id === 'anim-track-blend-1');
    assert.equal(targetTrack?.meta?.blendMode, 'replace');
});

test('dispatcher applies canonical timeline group creation through reducer-owned timeline truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_CREATE,
        payload: {
            id: 'group_1',
        },
    });

    const groups = next?.timeline?.timelines?.default?.groups ?? [];
    assert.equal(groups.length, 1);
    assert.equal(groups[0]?.id, 'group_1');
    assert.deepEqual(groups[0]?.trackIds, []);
    assert.equal(groups[0]?.order, 0);
});

test('animation workspace activation allows canonical timeline group creation', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceContractDefinition('animation'),
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_CREATE,
        payload: {
            id: 'anim-group-1',
        },
    });

    const groups = next?.timeline?.timelines?.default?.groups ?? [];
    assert.equal(groups.some((group) => group.id === 'anim-group-1'), true);
});

test('dispatcher applies canonical timeline group deletion through reducer-owned timeline truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_CREATE,
        payload: {
            id: 'group_1',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_DELETE,
        payload: {
            id: 'group_1',
        },
    });

    const groups = next?.timeline?.timelines?.default?.groups ?? [];
    assert.equal(groups.some((group) => group.id === 'group_1'), false);
});

test('animation workspace activation allows canonical timeline group deletion', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceContractDefinition('animation'),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_CREATE,
        payload: {
            id: 'anim-group-2',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_DELETE,
        payload: {
            id: 'anim-group-2',
        },
    });

    const groups = next?.timeline?.timelines?.default?.groups ?? [];
    assert.equal(groups.some((group) => group.id === 'anim-group-2'), false);
});

test('dispatcher toggles canonical timeline group lock through reducer-owned timeline truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_CREATE,
        payload: {
            id: 'group_1',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_LOCK_TOGGLE,
        payload: {
            id: 'group_1',
        },
    });

    const groups = next?.timeline?.timelines?.default?.groups ?? [];
    assert.equal(groups[0]?.meta?.locked, true);
});

test('animation workspace activation allows canonical timeline group lock toggle', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceContractDefinition('animation'),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_CREATE,
        payload: {
            id: 'anim-group-lock-1',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_LOCK_TOGGLE,
        payload: {
            id: 'anim-group-lock-1',
        },
    });

    const groups = next?.timeline?.timelines?.default?.groups ?? [];
    const targetGroup = groups.find((group) => group.id === 'anim-group-lock-1');
    assert.equal(targetGroup?.meta?.locked, true);
});

test('dispatcher toggles canonical timeline group collapse through reducer-owned timeline truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_CREATE,
        payload: {
            id: 'group_1',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_COLLAPSE_TOGGLE,
        payload: {
            id: 'group_1',
        },
    });

    const groups = next?.timeline?.timelines?.default?.groups ?? [];
    assert.equal(groups[0]?.meta?.collapsed, true);
});

test('animation workspace activation allows canonical timeline group collapse toggle', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceContractDefinition('animation'),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_CREATE,
        payload: {
            id: 'anim-group-collapse-1',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_COLLAPSE_TOGGLE,
        payload: {
            id: 'anim-group-collapse-1',
        },
    });

    const groups = next?.timeline?.timelines?.default?.groups ?? [];
    const targetGroup = groups.find((group) => group.id === 'anim-group-collapse-1');
    assert.equal(targetGroup?.meta?.collapsed, true);
});

test('dispatcher assigns a track into a canonical timeline group through reducer-owned timeline truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'track_1',
            type: 'standard',
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_CREATE,
        payload: {
            id: 'group_1',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_TRACK_ASSIGN,
        payload: {
            groupId: 'group_1',
            trackId: 'track_1',
        },
    });

    const groups = next?.timeline?.timelines?.default?.groups ?? [];
    assert.deepEqual(groups[0]?.trackIds, ['track_1']);
});

test('animation workspace activation allows canonical timeline track-group assignment', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceContractDefinition('animation'),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'anim-track-5',
            type: 'standard',
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_CREATE,
        payload: {
            id: 'anim-group-3',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_TRACK_ASSIGN,
        payload: {
            groupId: 'anim-group-3',
            trackId: 'anim-track-5',
        },
    });

    const groups = next?.timeline?.timelines?.default?.groups ?? [];
    const assignedGroup = groups.find((group) => group.id === 'anim-group-3');
    assert.deepEqual(assignedGroup?.trackIds, ['anim-track-5']);
});

test('dispatcher unassigns a track from a canonical timeline group through reducer-owned timeline truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'track_1',
            type: 'standard',
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_CREATE,
        payload: {
            id: 'group_1',
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_TRACK_ASSIGN,
        payload: {
            groupId: 'group_1',
            trackId: 'track_1',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_TRACK_UNASSIGN,
        payload: {
            groupId: 'group_1',
            trackId: 'track_1',
        },
    });

    const groups = next?.timeline?.timelines?.default?.groups ?? [];
    assert.deepEqual(groups[0]?.trackIds, []);
});

test('animation workspace activation allows canonical timeline track-group unassignment', async () => {
    const dispatcher = createEventDispatcher({ headless: true });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: getWorkspaceContractDefinition('animation'),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_TRACK_CREATE,
        payload: {
            id: 'anim-track-6',
            type: 'standard',
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_CREATE,
        payload: {
            id: 'anim-group-4',
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_TRACK_ASSIGN,
        payload: {
            groupId: 'anim-group-4',
            trackId: 'anim-track-6',
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.TIMELINE_GROUP_TRACK_UNASSIGN,
        payload: {
            groupId: 'anim-group-4',
            trackId: 'anim-track-6',
        },
    });

    const groups = next?.timeline?.timelines?.default?.groups ?? [];
    const targetGroup = groups.find((group) => group.id === 'anim-group-4');
    assert.deepEqual(targetGroup?.trackIds, []);
});
