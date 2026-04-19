import { registerTools, unregisterTools } from '@/runtime/actions/toolActions.js';

function safeDispatch(dispatcher, action, type) {
    try {
        const result = dispatcher?.dispatch?.(action);

        if (result && typeof result.catch === 'function') {
            result.catch((error) => {
                console.error(`[toolRegistrationRuntime] ${type} failed`, error);
            });
        }

        return result;
    } catch (error) {
        console.error(`[toolRegistrationRuntime] ${type} failed`, error);
        return null;
    }
}

function handleRegisterRequested(event, dispatcher) {
    const source = event?.payload?.source ?? null;
    const tools = Array.isArray(event?.payload?.tools)
        ? event.payload.tools
        : [];

    if (!source) return null;

    return safeDispatch(
        dispatcher,
        registerTools({
            source,
            tools,
        }),
        'registerTools',
    );
}

function handleUnregisterRequested(event, dispatcher) {
    const source = event?.payload?.source ?? null;

    if (!source) return null;

    return safeDispatch(
        dispatcher,
        unregisterTools({
            source,
        }),
        'unregisterTools',
    );
}

export function handleCapabilityIntent(event, { dispatcher } = {}) {
    if (!event || typeof event.type !== 'string') return null;

    switch (event.type) {
        case 'capability.tools.register.requested':
            return handleRegisterRequested(event, dispatcher);
        case 'capability.tools.unregister.requested':
            return handleUnregisterRequested(event, dispatcher);
        default:
            return null;
    }
}
