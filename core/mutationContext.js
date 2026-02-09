let currentMutationOrigin = null;

export function withMutationOrigin(origin, fn) {
    const prev = currentMutationOrigin;
    currentMutationOrigin = origin;
    try {
        return fn();
    } finally {
        currentMutationOrigin = prev;
    }
}

export function getMutationOrigin() {
    return currentMutationOrigin;
}
