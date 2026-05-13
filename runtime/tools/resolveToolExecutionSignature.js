function normalizeString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizeSessionType(descriptor) {
    const explicit = normalizeString(descriptor?.handlerPayload?.sessionType);
    if (explicit) return explicit;
    return normalizeString(descriptor?.id);
}

function normalizeNodeType(descriptor) {
    return normalizeString(descriptor?.handlerPayload?.nodeType);
}

export function resolveToolExecutionSignature(descriptor) {
    const handlerFamily = normalizeString(descriptor?.handlerFamily);

    if (handlerFamily === 'createNode') {
        return Object.freeze({
            executionMode: 'createNode',
            intentKind: 'create-node',
            nodeType: normalizeNodeType(descriptor),
            sessionType: '',
        });
    }

    if (handlerFamily === 'session') {
        return Object.freeze({
            executionMode: 'session',
            intentKind: 'session',
            nodeType: '',
            sessionType: normalizeSessionType(descriptor),
        });
    }

    return Object.freeze({
        executionMode: 'utility',
        intentKind: 'utility',
        nodeType: '',
        sessionType: '',
    });
}
