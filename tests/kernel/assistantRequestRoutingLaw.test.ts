import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { replayEvents } from '@/core/persistence/replayEngine.js';
import { requestAssistantAction } from '@/runtime/assistants/requestAssistantAction.js';

async function createAssistantEnabledDispatcher() {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });
    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'ai-build',
                policy: {
                    capabilities: ['ai:generate'],
                },
            },
        },
    });
    return dispatcher;
}

test('assistant request routing dispatches canonical AI request enqueue through dispatcher only', async () => {
    const dispatcher = await createAssistantEnabledDispatcher();
    const beforeDocument = structuredClone(dispatcher.getState().document);

    const result = await requestAssistantAction({
        dispatcher,
        assistantId: 'assistant.build',
        action: 'recommend',
        requestId: 'assistant-request-1',
        input: {
            prompt: 'Recommend workflow architecture for fleet dispatch.',
        },
    });

    const state = dispatcher.getState();
    const request = state?.ai?.requests?.['assistant-request-1'];

    assert.equal(result.requestId, 'assistant-request-1');
    assert.equal(result.eventType, EventTypes.AI_REQUEST_ENQUEUE);
    assert.equal(request?.kind, 'assistant-action');
    assert.equal(request?.metadata?.assistantId, 'assistant.build');
    assert.equal(request?.metadata?.action, 'recommend');
    assert.deepEqual(state.document, beforeDocument);
});

test('assistant request routing is deterministic for equivalent request streams', async () => {
    const left = await createAssistantEnabledDispatcher();
    const right = await createAssistantEnabledDispatcher();

    await requestAssistantAction({
        dispatcher: left,
        assistantId: 'assistant.design',
        action: 'generate',
        requestId: 'assistant-request-det-1',
        input: { prompt: 'Generate 3 branding directions.' },
    });
    await requestAssistantAction({
        dispatcher: right,
        assistantId: 'assistant.design',
        action: 'generate',
        requestId: 'assistant-request-det-1',
        input: { prompt: 'Generate 3 branding directions.' },
    });

    assert.deepEqual(left.getState().ai, right.getState().ai);
    assert.deepEqual(left.getState().document, right.getState().document);
});

test('assistant request routing fails closed for unknown assistants and unsupported actions', async () => {
    const dispatcher = await createAssistantEnabledDispatcher();

    await assert.rejects(
        () =>
            requestAssistantAction({
                dispatcher,
                assistantId: 'assistant.unknown',
                action: 'recommend',
                requestId: 'assistant-request-fail-1',
            }),
        /unknown assistant capability/,
    );

    await assert.rejects(
        () =>
            requestAssistantAction({
                dispatcher,
                assistantId: 'assistant.design',
                action: 'execute-approved-workflow',
                requestId: 'assistant-request-fail-2',
            }),
        /assistant action is not allowed/,
    );
});

test('assistant-assisted workflow replay is equivalent for deterministic enqueue streams', () => {
    const events = [
        {
            id: 'assistant:1',
            type: EventTypes.AI_REQUEST_ENQUEUE,
            payload: {
                request: {
                    id: 'assistant-replay-1',
                    kind: 'assistant-action',
                    status: 'running',
                    input: { prompt: 'Draft brand directions.' },
                    metadata: {
                        assistantId: 'assistant.design',
                        assistantLabel: 'Design Assistant',
                        perspectiveId: 'create',
                        action: 'generate',
                        schemaVersion: 1,
                    },
                    result: null,
                    error: null,
                    startedAt: 1000,
                    completedAt: null,
                },
            },
        },
        {
            id: 'assistant:2',
            type: EventTypes.AI_REQUEST_ENQUEUE,
            payload: {
                request: {
                    id: 'assistant-replay-2',
                    kind: 'assistant-action',
                    status: 'running',
                    input: { prompt: 'Summarize launch checklist.' },
                    metadata: {
                        assistantId: 'assistant.publish',
                        assistantLabel: 'Publishing Assistant',
                        perspectiveId: 'publish',
                        action: 'recommend',
                        schemaVersion: 1,
                    },
                    result: null,
                    error: null,
                    startedAt: 2000,
                    completedAt: null,
                },
            },
        },
    ];

    const first = replayEvents({ events });
    const second = replayEvents({ events });

    assert.deepEqual(first.ai, second.ai);
    assert.deepEqual(first.document, second.document);
});
