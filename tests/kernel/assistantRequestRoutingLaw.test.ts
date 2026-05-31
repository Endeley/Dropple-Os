import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { EventTypes } from '@/core/events/eventTypes.js';
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
