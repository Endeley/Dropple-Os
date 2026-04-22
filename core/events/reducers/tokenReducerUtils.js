function isPlainObject(value) {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}

export function toPathSegments(tokenPath) {
    if (typeof tokenPath !== 'string') return [];
    return tokenPath.split('.').map((segment) => segment.trim()).filter(Boolean);
}

export function getValueAtPath(source, path) {
    if (!isPlainObject(source)) return undefined;

    let current = source;
    for (const segment of path) {
        if (!isPlainObject(current) || !Object.prototype.hasOwnProperty.call(current, segment)) {
            return undefined;
        }
        current = current[segment];
    }

    return current;
}

export function setValueAtPath(source, path, value, mode = 'upsert') {
    if (!Array.isArray(path) || path.length === 0) {
        return source;
    }

    if (mode === 'create' && getValueAtPath(source, path) !== undefined) {
        return source;
    }

    if (mode === 'set' && getValueAtPath(source, path) === undefined) {
        return source;
    }

    const root = isPlainObject(source) ? source : {};

    function write(node, index) {
        const key = path[index];
        const current = isPlainObject(node) ? node : {};

        if (index === path.length - 1) {
            if (current[key] === value) {
                return current;
            }

            return {
                ...current,
                [key]: value,
            };
        }

        const child = current[key];
        const nextChild = write(child, index + 1);
        if (nextChild === child) {
            return current;
        }

        return {
            ...current,
            [key]: nextChild,
        };
    }

    return write(root, 0);
}

export function deleteValueAtPath(source, path) {
    if (!Array.isArray(path) || path.length === 0 || !isPlainObject(source)) {
        return source;
    }

    function remove(node, index) {
        if (!isPlainObject(node)) {
            return node;
        }

        const key = path[index];
        if (!Object.prototype.hasOwnProperty.call(node, key)) {
            return node;
        }

        if (index === path.length - 1) {
            const next = { ...node };
            delete next[key];
            return next;
        }

        const child = node[key];
        const nextChild = remove(child, index + 1);
        if (nextChild === child) {
            return node;
        }

        const next = { ...node };
        if (isPlainObject(nextChild) && Object.keys(nextChild).length > 0) {
            next[key] = nextChild;
        } else {
            delete next[key];
        }
        return next;
    }

    return remove(source, 0);
}

