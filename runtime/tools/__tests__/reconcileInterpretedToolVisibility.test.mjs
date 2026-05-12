import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileInterpretedToolVisibility } from '@/runtime/tools/reconcileInterpretedToolVisibility.js';
import { handleCapabilityIntent } from '@/runtime/capabilities/toolRegistrationRuntime.js';
import {
    initialToolRuntimeState,
    registerToolSource,
    unregisterToolSource,
    getVisibleTools,
} from '@/runtime/tools/toolRuntime.js';

test('reconcileInterpretedToolVisibility deterministically registers capability- and workspace-allowed tools', () => {
    const plan = reconcileInterpretedToolVisibility({
        source: 'synth.graph',
        capabilitySet: new Set(['node.create', 'content.write']),
        allowedToolIds: ['text', 'shape', 'shape'],
        specs: [
            { id: 'text', label: 'Text', createsNode: true, nodeType: 'text' },
            { id: 'shape', label: 'Shape', createsNode: true, nodeType: 'shape' },
            { id: 'image', label: 'Image', createsNode: true, nodeType: 'image' },
        ],
        currentTools: [],
    });

    assert.deepEqual(plan.nextTools, ['shape', 'text']);
    assert.deepEqual(plan.event, {
        type: 'capability.tools.register.requested',
        payload: {
            source: 'synth.graph',
            tools: ['shape', 'text'],
            descriptors: [
                {
                    id: 'shape',
                    label: 'Shape',
                    group: null,
                    handlerFamily: 'createNode',
                    intentTopics: [],
                    capabilityTags: [],
                    metadata: { createsNode: true },
                    handlerPayload: { nodeType: 'shape' },
                },
                {
                    id: 'text',
                    label: 'Text',
                    group: null,
                    handlerFamily: 'createNode',
                    intentTopics: [],
                    capabilityTags: [],
                    metadata: { createsNode: true },
                    handlerPayload: { nodeType: 'text' },
                },
            ],
            priority: 0,
        },
    });
});

test('reconcileInterpretedToolVisibility unregisters when capability changes remove all visibility', () => {
    const plan = reconcileInterpretedToolVisibility({
        source: 'synth.graph',
        capabilitySet: new Set(['node.select']),
        allowedToolIds: ['shape'],
        specs: [
            { id: 'shape', label: 'Shape', createsNode: true, nodeType: 'shape' },
        ],
        currentTools: ['shape'],
    });

    assert.deepEqual(plan.nextTools, []);
    assert.deepEqual(plan.event, {
        type: 'capability.tools.unregister.requested',
        payload: {
            source: 'synth.graph',
        },
    });
});

test('reconcileInterpretedToolVisibility returns no event when visibility is unchanged', () => {
    const plan = reconcileInterpretedToolVisibility({
        source: 'synth.graph',
        capabilitySet: new Set(['node.create']),
        allowedToolIds: ['shape'],
        specs: [
            { id: 'shape', label: 'Shape', createsNode: true, nodeType: 'shape' },
        ],
        currentTools: ['shape'],
    });

    assert.equal(plan.event, null);
    assert.deepEqual(plan.nextTools, ['shape']);
});

test('reconcileInterpretedToolVisibility preserves source isolation across multiple synthesis providers', () => {
    const dispatcherActions = [];
    const dispatcher = {
        dispatch(action) {
            dispatcherActions.push(action);
        },
    };

    const aPlan = reconcileInterpretedToolVisibility({
        source: 'synth.graph',
        capabilitySet: new Set(['node.create']),
        allowedToolIds: ['shape'],
        specs: [
            { id: 'shape', label: 'Shape', createsNode: true, nodeType: 'shape' },
        ],
        currentTools: ['shape'],
    });
    const bPlan = reconcileInterpretedToolVisibility({
        source: 'synth.viewport',
        capabilitySet: new Set(['viewport.pan']),
        allowedToolIds: ['pan'],
        specs: [
            { id: 'pan', label: 'Pan' },
        ],
        currentTools: [],
    });

    if (aPlan.event) handleCapabilityIntent(aPlan.event, { dispatcher });
    if (bPlan.event) handleCapabilityIntent(bPlan.event, { dispatcher });

    assert.deepEqual(dispatcherActions, [
        {
            type: 'tools/register',
            payload: {
                source: 'synth.viewport',
                tools: ['pan'],
                descriptors: [
                    {
                        id: 'pan',
                        label: 'Pan',
                        group: null,
                        handlerFamily: 'session',
                        intentTopics: [],
                        capabilityTags: [],
                        metadata: { createsNode: false },
                        handlerPayload: { sessionType: 'pan' },
                    },
                ],
                priority: 0,
            },
        },
    ]);
});

test('reconciled visibility plans apply cleanly to source-scoped runtime state across transitions', () => {
    const stateA = registerToolSource(initialToolRuntimeState, {
        source: 'workspace.graph',
        tools: ['select'],
    });
    const stateB = registerToolSource(stateA, {
        source: 'synth.graph',
        tools: ['shape'],
    });

    const plan = reconcileInterpretedToolVisibility({
        source: 'synth.graph',
        capabilitySet: new Set(['node.select']),
        allowedToolIds: ['shape'],
        specs: [
            { id: 'shape', label: 'Shape', createsNode: true, nodeType: 'shape' },
        ],
        currentTools: stateB.registeredTools['synth.graph'],
    });

    const nextState = unregisterToolSource(stateB, { source: plan.source });

    assert.deepEqual(getVisibleTools(nextState), ['select']);
    assert.equal(nextState.activeTool, 'select');
});

test('overlapping synthesized visibility remains deterministic when one provider withdraws', () => {
    const overlappingSpecs = [
        { id: 'move', label: 'Move', sessionType: 'move' },
        { id: 'frame', label: 'Frame', createsNode: true, nodeType: 'frame' },
    ];
    const survivingSpecs = [
        { id: 'move', label: 'Move', sessionType: 'move' },
        { id: 'shape', label: 'Shape', createsNode: true, nodeType: 'shape' },
    ];

    const firstPlan = reconcileInterpretedToolVisibility({
        source: 'capability.alpha',
        capabilitySet: new Set(['layout.write', 'node.create']),
        allowedToolIds: ['move', 'frame'],
        specs: overlappingSpecs,
        currentTools: [],
    });
    const secondPlan = reconcileInterpretedToolVisibility({
        source: 'capability.beta',
        capabilitySet: new Set(['layout.write', 'node.create']),
        allowedToolIds: ['move', 'shape'],
        specs: survivingSpecs,
        currentTools: [],
    });

    let state = registerToolSource(initialToolRuntimeState, firstPlan.event.payload);
    state = registerToolSource(state, secondPlan.event.payload);
    assert.deepEqual(getVisibleTools(state), ['frame', 'move', 'shape']);

    const withdrawFirstPlan = reconcileInterpretedToolVisibility({
        source: 'capability.alpha',
        capabilitySet: new Set(['layout.write', 'node.create']),
        allowedToolIds: [],
        specs: overlappingSpecs,
        currentTools: state.registeredTools['capability.alpha'],
    });
    const nextState = unregisterToolSource(state, { source: withdrawFirstPlan.source });

    assert.deepEqual(getVisibleTools(nextState), ['move', 'shape']);
    assert.equal(nextState.activeTool, 'move');
});

test('reconcileInterpretedToolVisibility carries semantic descriptors and priority for arbitration', () => {
    const plan = reconcileInterpretedToolVisibility({
        source: 'capability.graph',
        priority: 100,
        capabilitySet: new Set(['layout.write']),
        allowedToolIds: ['move'],
        specs: [{ id: 'move', label: 'Graph Move', group: 'edit', sessionType: 'move' }],
        currentTools: [],
    });

    assert.deepEqual(plan.event, {
        type: 'capability.tools.register.requested',
        payload: {
            source: 'capability.graph',
            tools: ['move'],
            descriptors: [
                {
                    id: 'move',
                    label: 'Graph Move',
                    group: 'edit',
                    handlerFamily: 'session',
                    intentTopics: [],
                    capabilityTags: [],
                    metadata: { createsNode: false },
                    handlerPayload: { sessionType: 'move' },
                },
            ],
            priority: 100,
        },
    });
});
