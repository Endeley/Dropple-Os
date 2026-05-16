import { registerTools, unregisterTools } from '@/runtime/actions/toolActions.js';
import { validateNoRecursiveToolRegistration } from '@/runtime/tools/toolRegistrationRecursionGuard.js';
import { createToolGovernanceAcceptTelemetry, createToolGovernanceRejectTelemetry } from '@/runtime/tools/toolGovernanceTelemetry.js';

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

function handleRegisterRequested(event, dispatcher, onGovernanceReject, onGovernanceAccept) {
    const source = event?.payload?.source ?? null;
    const tools = Array.isArray(event?.payload?.tools)
        ? event.payload.tools
        : [];
    const descriptors = Array.isArray(event?.payload?.descriptors)
        ? event.payload.descriptors
        : [];
    const priority = Number.isFinite(event?.payload?.priority)
        ? event.payload.priority
        : 0;

    if (!source) return null;
    const recursiveCheck = validateNoRecursiveToolRegistration(event?.payload);
    if (!recursiveCheck.ok) {
        onGovernanceReject?.(createToolGovernanceRejectTelemetry({
            code: recursiveCheck?.code,
            source,
            toolIds: tools,
            atEventType: event?.type,
            reason: recursiveCheck?.message,
            currentTimeMs: event?.payload?.currentTimeMs,
        }));
        return null;
    }
    onGovernanceAccept?.(createToolGovernanceAcceptTelemetry({
        code: 'tool-registration-approved',
        source,
        toolIds: tools,
        atEventType: event?.type,
        reason: 'capability-boundary-governance-approved',
        currentTimeMs: event?.payload?.currentTimeMs,
    }));

    return safeDispatch(
        dispatcher,
        registerTools({
            source,
            tools,
            descriptors,
            priority,
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

export function handleCapabilityIntent(event, { dispatcher, onGovernanceReject, onGovernanceAccept } = {}) {
    if (!event || typeof event.type !== 'string') return null;

    switch (event.type) {
        case 'capability.tools.register.requested':
            return handleRegisterRequested(event, dispatcher, onGovernanceReject, onGovernanceAccept);
        case 'capability.tools.unregister.requested':
            return handleUnregisterRequested(event, dispatcher);
        default:
            return null;
    }
}
