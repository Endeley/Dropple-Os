import { EventTypes } from '@/core/events/eventTypes.js';
import { replayEvents } from '@/runtime/dispatcher/replayEvents.js';
import { projectActiveTokens } from '@/runtime/tokens/projectActiveTokens.js';
import { resolveActiveVersionHead } from '@/runtime/tokens/tokenVersionGraph.js';

const VERSION_EVENT_TYPES = new Set([
    EventTypes.TOKEN_VERSION_TAG,
    EventTypes.TOKEN_VERSION_FORK,
    EventTypes.TOKEN_VERSION_MERGE,
]);

function createEmptyDiff(baseVersionId = null, compareVersionId = null) {
    return Object.freeze({
        baseVersionId,
        compareVersionId,
        baseLabel: baseVersionId,
        compareLabel: compareVersionId,
        addedTokens: Object.freeze([]),
        removedTokens: Object.freeze([]),
        changedValues: Object.freeze([]),
        changedAliases: Object.freeze([]),
        changedThemeBindings: Object.freeze([]),
        impactSummary: Object.freeze({
            breaking: 0,
            additive: 0,
            cosmetic: 0,
        }),
    });
}

function clone(value) {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}

function isAliasToken(value) {
    return isPlainObject(value) && value.type === 'token' && typeof value.value === 'string';
}

function stableStringify(value) {
    if (value == null || typeof value !== 'object') {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
    }

    const keys = Object.keys(value).sort((left, right) => left.localeCompare(right));
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function formatScopedTokenPath(scope, tokenPath, themeId = null, variantId = null) {
    if (scope === 'theme') {
        return `theme.${themeId}.${tokenPath}`;
    }

    if (scope === 'variant') {
        return `theme.${themeId}.variant.${variantId}.${tokenPath}`;
    }

    return tokenPath;
}

function walkTokenTree(tree, emit, prefix = []) {
    if (tree === undefined) {
        return;
    }

    if (isAliasToken(tree)) {
        emit(prefix.join('.'), tree);
        return;
    }

    if (!isPlainObject(tree) || Object.keys(tree).length === 0) {
        emit(prefix.join('.'), tree);
        return;
    }

    for (const key of Object.keys(tree).sort((left, right) => left.localeCompare(right))) {
        walkTokenTree(tree[key], emit, [...prefix, key]);
    }
}

function indexTokenEntries(document) {
    const valueEntries = new Map();
    const aliasEntries = new Map();

    function record(scope, tokenPath, value, themeId = null, variantId = null) {
        if (typeof tokenPath !== 'string' || tokenPath.length === 0) return;

        const key = formatScopedTokenPath(scope, tokenPath, themeId, variantId);
        const entry = Object.freeze({
            key,
            scope,
            tokenPath,
            themeId,
            variantId,
            value: clone(value),
        });

        if (isAliasToken(value)) {
            aliasEntries.set(key, entry);
            return;
        }

        valueEntries.set(key, entry);
    }

    walkTokenTree(document?.tokens ?? {}, (tokenPath, value) => {
        record('global', tokenPath, value);
    });

    const themes = document?.themes?.byId ?? {};
    const orderedThemeIds = Array.isArray(document?.themes?.order)
        ? [...document.themes.order]
        : Object.keys(themes).sort((left, right) => left.localeCompare(right));

    for (const themeId of orderedThemeIds) {
        const theme = themes[themeId];
        if (!theme) continue;

        walkTokenTree(theme.tokens ?? {}, (tokenPath, value) => {
            record('theme', tokenPath, value, themeId, null);
        });

        const variants = theme.variants ?? {};
        for (const variantId of Object.keys(variants).sort((left, right) => left.localeCompare(right))) {
            walkTokenTree(variants[variantId]?.tokens ?? {}, (tokenPath, value) => {
                record('variant', tokenPath, value, themeId, variantId);
            });
        }
    }

    return {
        values: valueEntries,
        aliases: aliasEntries,
    };
}

function compareValueEntries(baseEntries, compareEntries) {
    const addedTokens = [];
    const removedTokens = [];
    const changedValues = [];

    const allKeys = Array.from(new Set([...baseEntries.keys(), ...compareEntries.keys()])).sort((left, right) =>
        left.localeCompare(right),
    );

    for (const key of allKeys) {
        const base = baseEntries.get(key) ?? null;
        const compare = compareEntries.get(key) ?? null;

        if (!base && compare) {
            addedTokens.push(
                Object.freeze({
                    key: compare.key,
                    scope: compare.scope,
                    tokenPath: compare.tokenPath,
                    themeId: compare.themeId,
                    variantId: compare.variantId,
                    value: clone(compare.value),
                }),
            );
            continue;
        }

        if (base && !compare) {
            removedTokens.push(
                Object.freeze({
                    key: base.key,
                    scope: base.scope,
                    tokenPath: base.tokenPath,
                    themeId: base.themeId,
                    variantId: base.variantId,
                    value: clone(base.value),
                }),
            );
            continue;
        }

        if (stableStringify(base?.value) !== stableStringify(compare?.value)) {
            changedValues.push(
                Object.freeze({
                    key,
                    scope: compare?.scope ?? base?.scope ?? 'global',
                    tokenPath: compare?.tokenPath ?? base?.tokenPath ?? key,
                    themeId: compare?.themeId ?? base?.themeId ?? null,
                    variantId: compare?.variantId ?? base?.variantId ?? null,
                    from: clone(base?.value),
                    to: clone(compare?.value),
                }),
            );
        }
    }

    return {
        addedTokens: Object.freeze(addedTokens),
        removedTokens: Object.freeze(removedTokens),
        changedValues: Object.freeze(changedValues),
    };
}

function compareAliasEntries(baseEntries, compareEntries) {
    const changedAliases = [];
    const allKeys = Array.from(new Set([...baseEntries.keys(), ...compareEntries.keys()])).sort((left, right) =>
        left.localeCompare(right),
    );

    for (const key of allKeys) {
        const base = baseEntries.get(key) ?? null;
        const compare = compareEntries.get(key) ?? null;
        const from = base?.value?.value ?? null;
        const to = compare?.value?.value ?? null;

        if (from === to) continue;

        changedAliases.push(
            Object.freeze({
                key,
                scope: compare?.scope ?? base?.scope ?? 'global',
                tokenPath: compare?.tokenPath ?? base?.tokenPath ?? key,
                themeId: compare?.themeId ?? base?.themeId ?? null,
                variantId: compare?.variantId ?? base?.variantId ?? null,
                from,
                to,
            }),
        );
    }

    return Object.freeze(changedAliases);
}

function compareThemeBindings(baseSnapshot, compareSnapshot) {
    const bindings = [];
    const checks = [
        ['activeTheme', baseSnapshot?.activeThemeId ?? null, compareSnapshot?.activeThemeId ?? null],
        ['versionTheme', baseSnapshot?.versionThemeId ?? null, compareSnapshot?.versionThemeId ?? null],
    ];

    for (const [type, from, to] of checks) {
        if (from === to) continue;
        bindings.push(
            Object.freeze({
                type,
                from,
                to,
            }),
        );
    }

    return Object.freeze(bindings);
}

function snapshotForVersionEntries(events, tokenVersionGraph) {
    const snapshots = new Map();
    replayEvents({
        events,
        onEvent(replayState, event) {
            if (!VERSION_EVENT_TYPES.has(event?.type)) {
                return replayState;
            }

            const versionId = event?.payload?.versionId ?? event?.payload?.id ?? null;
            if (!versionId) {
                return replayState;
            }

            const versionEntry =
                replayState?.document?.tokenVersions?.entries?.[versionId] ??
                tokenVersionGraph?.entries?.[versionId] ??
                null;
            if (!versionEntry) {
                return replayState;
            }

            snapshots.set(
                versionId,
                Object.freeze({
                    document: Object.freeze({
                        tokens: clone(replayState?.document?.tokens ?? {}),
                        themes: clone(
                            replayState?.document?.themes ?? {
                                activeThemeId: null,
                                byId: {},
                                order: [],
                            },
                        ),
                    }),
                    projectedTokens: Object.freeze(projectActiveTokens(replayState?.document ?? null)),
                    activeThemeId: replayState?.document?.themes?.activeThemeId ?? null,
                    versionThemeId: versionEntry?.themeId ?? null,
                }),
            );

            return replayState;
        },
    });

    return snapshots;
}

function resolveVersionLabel(tokenVersionGraph, versionId) {
    if (!versionId) return null;
    const entry = tokenVersionGraph?.entries?.[versionId] ?? null;
    return entry?.label ?? versionId;
}

export function projectTokenVersionDiff({
    tokenVersionGraph,
    document,
    events,
    baseVersionId = null,
    compareVersionId = null,
}) {
    const graph = tokenVersionGraph ?? document?.tokenVersions ?? {
        entries: {},
        order: [],
        activeVersionId: null,
    };

    const resolvedBaseVersionId = baseVersionId ?? resolveActiveVersionHead(graph);
    const resolvedCompareVersionId =
        compareVersionId && compareVersionId !== resolvedBaseVersionId ? compareVersionId : null;

    if (!resolvedBaseVersionId || !resolvedCompareVersionId) {
        return createEmptyDiff(resolvedBaseVersionId, resolvedCompareVersionId);
    }

    const snapshots = snapshotForVersionEntries(events, graph);
    const baseSnapshot = snapshots.get(resolvedBaseVersionId) ?? null;
    const compareSnapshot = snapshots.get(resolvedCompareVersionId) ?? null;

    if (!baseSnapshot || !compareSnapshot) {
        return createEmptyDiff(resolvedBaseVersionId, resolvedCompareVersionId);
    }

    const indexedBase = indexTokenEntries(baseSnapshot.document);
    const indexedCompare = indexTokenEntries(compareSnapshot.document);
    const { addedTokens, removedTokens, changedValues } = compareValueEntries(
        indexedBase.values,
        indexedCompare.values,
    );
    const changedAliases = compareAliasEntries(indexedBase.aliases, indexedCompare.aliases);
    const changedThemeBindings = compareThemeBindings(baseSnapshot, compareSnapshot);

    return Object.freeze({
        baseVersionId: resolvedBaseVersionId,
        compareVersionId: resolvedCompareVersionId,
        baseLabel: resolveVersionLabel(graph, resolvedBaseVersionId),
        compareLabel: resolveVersionLabel(graph, resolvedCompareVersionId),
        addedTokens,
        removedTokens,
        changedValues,
        changedAliases,
        changedThemeBindings,
        impactSummary: Object.freeze({
            breaking: removedTokens.length + changedAliases.length,
            additive: addedTokens.length,
            cosmetic: changedValues.length + changedThemeBindings.length,
        }),
    });
}

export function hashProjectedTokenVersionDiff(projectedDiff) {
    return stableStringify(projectedDiff ?? createEmptyDiff());
}
