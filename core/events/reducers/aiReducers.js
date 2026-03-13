import { EventTypes } from '../eventTypes.js';

function ensureAIState(state) {
    return state?.ai ?? {
        requests: {},
        order: [],
    };
}

export function aiReducers(state, event) {
    const ai = ensureAIState(state);

    switch (event.type) {
        case EventTypes.AI_REQUEST_ENQUEUE: {
            const request = event.payload?.request;
            if (!request?.id) return state;

            return {
                ...state,
                ai: {
                    requests: {
                        ...ai.requests,
                        [request.id]: {
                            ...request,
                        },
                    },
                    order: ai.order.includes(request.id) ? ai.order : [...ai.order, request.id],
                },
            };
        }

        case EventTypes.AI_REQUEST_COMPLETE: {
            const requestId = event.payload?.requestId;
            const existing = ai.requests?.[requestId];
            if (!requestId || !existing) return state;

            return {
                ...state,
                ai: {
                    ...ai,
                    requests: {
                        ...ai.requests,
                        [requestId]: {
                            ...existing,
                            status: 'completed',
                            result: event.payload?.result ?? null,
                            error: null,
                            completedAt: event.payload?.completedAt ?? Date.now(),
                        },
                    },
                },
            };
        }

        case EventTypes.AI_REQUEST_FAIL: {
            const requestId = event.payload?.requestId;
            const existing = ai.requests?.[requestId];
            if (!requestId || !existing) return state;

            return {
                ...state,
                ai: {
                    ...ai,
                    requests: {
                        ...ai.requests,
                        [requestId]: {
                            ...existing,
                            status: 'failed',
                            error: event.payload?.error ?? 'Unknown AI runtime error',
                            completedAt: event.payload?.completedAt ?? Date.now(),
                        },
                    },
                },
            };
        }

        default:
            return state;
    }
}
