function readPath(tokens, path) {
    let current = tokens;

    for (const key of path) {
        if (!current) return null;
        current = current[key];
    }

    return current ?? null;
}

function normalizeReference(value) {
    if (typeof value === 'string' && value.startsWith('token.')) {
        return value.replace('token.', '');
    }

    if (value && typeof value === 'object' && value.type === 'token' && typeof value.value === 'string') {
        return value.value;
    }

    return null;
}

export function resolveToken(value, tokens, seen = new Set()) {
    if (!value) return value;

    const reference = normalizeReference(value);
    if (!reference) {
        return value;
    }

    if (seen.has(reference)) {
        return null;
    }

    const nextSeen = new Set(seen);
    nextSeen.add(reference);

    const resolved = readPath(tokens, reference.split('.'));
    if (resolved == null) {
        return null;
    }

    const nestedReference = normalizeReference(resolved);
    if (nestedReference) {
        return resolveToken(resolved, tokens, nextSeen);
    }

    return resolved;
}
