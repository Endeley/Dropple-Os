import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import {
    __resetRuntimeStateInternal,
    initialRuntimeState,
} from '@/runtime/state/runtimeState.internal.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { generateTemplateFromPrompt, generateVariantsFromIntent } from '@/ai/runtime/aiRuntime.js';
import { getAIRequest, getLatestAIRequest } from '@/ai/runtime/aiSelectors.js';

function resetStores() {
    __resetRuntimeStateInternal();
    useRuntimeStore.setState({
        nodes: {},
        rootIds: [],
        workspace: null,
        sceneGraph: null,
        scene: null,
        selection: { ids: [], primary: null, count: 0 },
        clipboard: { count: 0, hasData: false },
        grouping: { count: 0 },
        components: { index: {}, resolvedInstances: {} },
        data: { resolvedBindings: {}, resolvedValues: {} },
        app: { screens: {}, currentScreen: null, resolvedScreen: null, state: {}, flows: {} },
        vectors: {},
        stateMachines: {},
        navigation: {},
        collaboration: { session: null, presence: [], cursors: [] },
        ai: { requests: [], latestRequest: null },
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
    useAnimatedRuntimeStore.setState({ nodes: {}, rootIds: [] }, false);
}

function loadArtifactFixture() {
    const artifactPath = path.resolve(
        process.cwd(),
        'templates',
        'artifacts',
        'realestate.hero.motion.v1.json',
    );
    return JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
}

test.beforeEach(resetStores);

test('ai runtime tracks template generation through dispatcher-owned runtime state', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });
    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'ai',
                policy: {
                    capabilities: ['ai:generate'],
                },
            },
        },
    });

    const artifact = loadArtifactFixture();
    const llm = {
        async generate() {
            return JSON.stringify(artifact);
        },
    };

    const result = await generateTemplateFromPrompt('Generate a hero template.', llm, {
        dispatcher,
        requestId: 'ai-template-1',
        metadata: { source: 'test' },
    });

    assert.equal(result.metadata.id, artifact.metadata.id);

    const state = dispatcher.getState();
    const request = getAIRequest(state, 'ai-template-1');
    assert.equal(request.status, 'completed');
    assert.equal(request.metadata.source, 'test');
    assert.equal(request.result.metadata.id, artifact.metadata.id);

    const projection = useRuntimeStore.getState().ai;
    assert.equal(projection.requests.length, 1);
    assert.equal(projection.latestRequest.id, 'ai-template-1');
    assert.equal(projection.latestRequest.status, 'completed');
});

test('ai runtime records failed generations without mutating canonical document truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });
    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'ai',
                policy: {
                    capabilities: ['ai:generate'],
                },
            },
        },
    });

    const beforeDocument = structuredClone(dispatcher.getState().document);
    const llm = {
        async generate() {
            throw new Error('LLM unavailable');
        },
    };

    await assert.rejects(
        () =>
            generateTemplateFromPrompt('Generate a template.', llm, {
                dispatcher,
                requestId: 'ai-template-2',
            }),
        /LLM unavailable/,
    );

    const state = dispatcher.getState();
    const request = getLatestAIRequest(state);
    assert.equal(request.id, 'ai-template-2');
    assert.equal(request.status, 'failed');
    assert.match(request.error, /LLM unavailable/);
    assert.deepEqual(state.document, beforeDocument);
});

test('ai runtime tracks variant generation as runtime-only request state', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });
    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'ai',
                policy: {
                    capabilities: ['ai:generate'],
                },
            },
        },
    });

    const artifact = loadArtifactFixture();
    const llm = {
        async generate() {
            return JSON.stringify([
                {
                    templateRef: {
                        id: artifact.metadata.id,
                        version: artifact.metadata.version,
                    },
                    params: {
                        'theme.variant': 'dark',
                    },
                },
            ]);
        },
    };

    const variants = await generateVariantsFromIntent(artifact, 'Create a neutral variant.', llm, {
        dispatcher,
        requestId: 'ai-variants-1',
        options: { count: 1 },
    });

    assert.equal(variants.length, 1);
    const request = getAIRequest(dispatcher.getState(), 'ai-variants-1');
    assert.equal(request.kind, 'variants');
    assert.equal(request.status, 'completed');
    assert.equal(Array.isArray(request.result), true);
});
