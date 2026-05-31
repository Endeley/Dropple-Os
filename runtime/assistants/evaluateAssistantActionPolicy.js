function normalizeString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function evaluateAssistantActionPolicy({
    assistantCapability,
    action,
    requestedPerspectiveId = null,
} = {}) {
    if (!assistantCapability || typeof assistantCapability !== 'object') {
        throw new Error('assistant policy evaluation requires a capability descriptor');
    }

    const normalizedAction = normalizeString(action);
    if (!normalizedAction) {
        throw new Error('assistant policy evaluation requires an action');
    }

    if (!assistantCapability.actions.includes(normalizedAction)) {
        throw new Error(`assistant action is not allowed for ${assistantCapability.id}: ${normalizedAction}`);
    }

    const normalizedRequestedPerspectiveId = normalizeString(requestedPerspectiveId);
    if (
        normalizedRequestedPerspectiveId &&
        normalizedRequestedPerspectiveId !== assistantCapability.perspectiveId
    ) {
        throw new Error(
            `assistant perspective mismatch for ${assistantCapability.id}: expected ${assistantCapability.perspectiveId}, got ${normalizedRequestedPerspectiveId}`,
        );
    }

    return Object.freeze({
        assistantId: assistantCapability.id,
        perspectiveId: assistantCapability.perspectiveId,
        action: normalizedAction,
        requestedPerspectiveId: normalizedRequestedPerspectiveId,
        allowed: true,
    });
}
