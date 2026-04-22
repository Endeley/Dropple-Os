import { DEFAULT_TOKENS } from './tokenRegistry.js';
import { resolveToken } from './resolveToken.js';

function clone(value) {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge(base, overlay) {
    if (!isPlainObject(base)) {
        return overlay === undefined ? base : overlay;
    }

    const result = { ...base };
    if (!isPlainObject(overlay)) {
        return result;
    }

    for (const [key, value] of Object.entries(overlay)) {
        if (value === undefined) continue;

        if (isPlainObject(value) && isPlainObject(result[key])) {
            result[key] = deepMerge(result[key], value);
            continue;
        }

        result[key] = clone(value);
    }

    return result;
}

function collectThemeChain(themes, activeThemeId) {
    const order = [];
    const visited = new Set();
    let currentId = activeThemeId;

    while (typeof currentId === 'string' && currentId.length > 0) {
        if (visited.has(currentId)) {
            return [];
        }

        visited.add(currentId);
        const current = themes?.byId?.[currentId];
        if (!current) {
            return [];
        }

        order.unshift(current);
        currentId = current.parentThemeId ?? null;
    }

    return order;
}

function resolveTokenTree(tree, rootTokens) {
    if (Array.isArray(tree)) {
        return tree.map((entry) => resolveTokenTree(entry, rootTokens));
    }

    if (!isPlainObject(tree)) {
        return resolveToken(tree, rootTokens);
    }

    if (tree.type === 'token' && typeof tree.value === 'string') {
        return resolveToken(tree, rootTokens);
    }

    return Object.fromEntries(
        Object.entries(tree).map(([key, value]) => [key, resolveTokenTree(value, rootTokens)]),
    );
}

export function projectActiveTokens(document) {
    let projected = clone(DEFAULT_TOKENS);

    if (isPlainObject(document?.tokens)) {
        projected = deepMerge(projected, document.tokens);
    }

    const themeChain = collectThemeChain(document?.themes, document?.themes?.activeThemeId);
    for (const theme of themeChain) {
        if (isPlainObject(theme?.tokens)) {
            projected = deepMerge(projected, theme.tokens);
        }
    }

    return resolveTokenTree(projected, projected);
}

