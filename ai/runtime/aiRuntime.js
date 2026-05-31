import { EventTypes } from '@/core/events/eventTypes.js';
import { generateTemplateArtifact } from '@/ai/generation/generateTemplateArtifact.js';
import { generateVariants } from '@/ai/generation/generateVariants.js';
import { createUuid } from '@/core/utils/createUuid.js';

function assertDispatcher(dispatcher) {
    if (!dispatcher?.dispatch || typeof dispatcher.dispatch !== 'function') {
        throw new Error('AI runtime requires an injected dispatcher');
    }
}

function nextRequestRecord({ id, kind, input, metadata }) {
    return {
        id,
        kind,
        status: 'running',
        input,
        metadata: metadata ? { ...metadata } : {},
        result: null,
        error: null,
        startedAt: Date.now(),
        completedAt: null,
    };
}

export async function generateTemplateFromPrompt(
    userPrompt,
    llm,
    { dispatcher, requestId = createUuid(), options = {}, metadata = {} } = {},
) {
    assertDispatcher(dispatcher);

    await dispatcher.dispatch({
        type: EventTypes.AI_REQUEST_ENQUEUE,
        payload: {
            request: nextRequestRecord({
                id: requestId,
                kind: 'templateArtifact',
                input: { prompt: userPrompt },
                metadata,
            }),
        },
    });

    try {
        const artifact = await generateTemplateArtifact(userPrompt, llm, options);
        await dispatcher.dispatch({
            type: EventTypes.AI_REQUEST_COMPLETE,
            payload: {
                requestId,
                result: artifact,
                completedAt: Date.now(),
            },
        });
        return artifact;
    } catch (error) {
        await dispatcher.dispatch({
            type: EventTypes.AI_REQUEST_FAIL,
            payload: {
                requestId,
                error: error instanceof Error ? error.message : String(error),
                completedAt: Date.now(),
            },
        });
        throw error;
    }
}

export async function generateVariantsFromIntent(
    template,
    variantIntent,
    llm,
    { dispatcher, requestId = createUuid(), options = {}, metadata = {} } = {},
) {
    assertDispatcher(dispatcher);

    await dispatcher.dispatch({
        type: EventTypes.AI_REQUEST_ENQUEUE,
        payload: {
            request: nextRequestRecord({
                id: requestId,
                kind: 'variants',
                input: {
                    templateId: template?.metadata?.id ?? null,
                    variantIntent,
                },
                metadata,
            }),
        },
    });

    try {
        const variants = await generateVariants(template, variantIntent, llm, options);
        await dispatcher.dispatch({
            type: EventTypes.AI_REQUEST_COMPLETE,
            payload: {
                requestId,
                result: variants,
                completedAt: Date.now(),
            },
        });
        return variants;
    } catch (error) {
        await dispatcher.dispatch({
            type: EventTypes.AI_REQUEST_FAIL,
            payload: {
                requestId,
                error: error instanceof Error ? error.message : String(error),
                completedAt: Date.now(),
            },
        });
        throw error;
    }
}
