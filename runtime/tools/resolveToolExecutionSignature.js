function normalizeString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

const EXECUTION_SIGNATURE_SCHEMA_VERSION = '1.0';

function normalizeSchemaVersion(value) {
    const raw = normalizeString(value);
    return raw.length > 0 ? raw : EXECUTION_SIGNATURE_SCHEMA_VERSION;
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
    const schemaVersion = normalizeSchemaVersion(descriptor?.executionSignatureVersion);

    if (handlerFamily === 'createNode') {
        return Object.freeze({
            schemaVersion,
            executionMode: 'createNode',
            intentKind: 'create-node',
            nodeType: normalizeNodeType(descriptor),
            sessionType: '',
        });
    }

    if (handlerFamily === 'session') {
        return Object.freeze({
            schemaVersion,
            executionMode: 'session',
            intentKind: 'session',
            nodeType: '',
            sessionType: normalizeSessionType(descriptor),
        });
    }

    return Object.freeze({
        schemaVersion,
        executionMode: 'utility',
        intentKind: 'utility',
        nodeType: '',
        sessionType: '',
    });
}
