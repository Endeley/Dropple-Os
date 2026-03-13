function collectChangedKeys(previous = {}, next = {}) {
    const keys = new Set([
        ...Object.keys(previous || {}),
        ...Object.keys(next || {}),
    ]);

    return Array.from(keys)
        .filter((key) => previous?.[key] !== next?.[key])
        .sort();
}

function formatKeys(keys) {
    return keys.length > 0 ? keys.join(', ') : 'none';
}

export function assertReducerOwnership(
    reducerName,
    previousState,
    nextState,
    {
        allowedDocumentSlices = [],
        allowedRuntimeSlices = [],
    } = {},
) {
    if (!nextState || previousState === nextState) {
        return nextState;
    }

    const changedDocumentSlices = collectChangedKeys(
        previousState?.document,
        nextState?.document,
    );
    const unauthorizedDocumentSlices = changedDocumentSlices.filter(
        (key) => !allowedDocumentSlices.includes(key),
    );

    if (unauthorizedDocumentSlices.length > 0) {
        throw new Error(
            `[Dropple Truth Violation] ${reducerName} mutated foreign document slices: ${formatKeys(unauthorizedDocumentSlices)}. Allowed: ${formatKeys(allowedDocumentSlices)}`,
        );
    }

    const previousRuntime = { ...(previousState || {}) };
    const nextRuntime = { ...(nextState || {}) };
    delete previousRuntime.document;
    delete nextRuntime.document;

    const changedRuntimeSlices = collectChangedKeys(previousRuntime, nextRuntime);
    const unauthorizedRuntimeSlices = changedRuntimeSlices.filter(
        (key) => !allowedRuntimeSlices.includes(key),
    );

    if (unauthorizedRuntimeSlices.length > 0) {
        throw new Error(
            `[Dropple Truth Violation] ${reducerName} mutated foreign runtime slices: ${formatKeys(unauthorizedRuntimeSlices)}. Allowed: ${formatKeys(allowedRuntimeSlices)}`,
        );
    }

    return nextState;
}
