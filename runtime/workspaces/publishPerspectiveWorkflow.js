import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';

function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function countObjectKeys(value) {
    return Object.keys(asObject(value) ?? {}).length;
}

function listUniverseNodes(universe, predicate) {
    return Object.values(asObject(universe?.nodes) ?? {})
        .filter((node) => node && node.id !== universe?.hubId)
        .filter(predicate)
        .sort((left, right) => String(left.label ?? left.id).localeCompare(String(right.label ?? right.id)));
}

const ENTRY_LABELS = Object.freeze({
    governance: 'Governance',
    versioning: 'Versioning',
    tokens: 'Tokens',
    components: 'Components',
    themes: 'Themes',
    variants: 'Variants',
    conversion: 'Conversion',
    review: 'Review',
});

const ENTRY_FALLBACK_TASKS = Object.freeze({
    governance: 'Awaiting governance review',
    versioning: 'Awaiting version plan',
    tokens: 'Awaiting token set',
    components: 'Awaiting component library',
    themes: 'Awaiting theme surface',
    variants: 'Awaiting variant set',
    conversion: 'Awaiting delivery plan',
    review: 'Awaiting release review',
});

function countThemeVariants(themesById) {
    return Object.values(asObject(themesById) ?? {}).reduce(
        (count, theme) => count + countObjectKeys(theme?.variants),
        0,
    );
}

function countTokenEntries(tokens) {
    return Object.keys(asObject(tokens) ?? {}).filter((key) => {
        const value = tokens[key];
        return value != null && typeof value !== 'function';
    }).length;
}

export function buildPublishPerspectiveWorldSummary({ entryId = 'governance', document = null, universe = null } = {}) {
    const normalizedEntryId = asNonEmptyString(entryId)?.toLowerCase() ?? 'governance';
    const exportTargetCount = Array.isArray(asObject(document?.exports)?.targets)
        ? document.exports.targets.length
        : 0;
    const componentCount =
        countObjectKeys(asObject(document?.components)?.definitions) +
        countObjectKeys(asObject(document?.components)?.instances);
    const themeCount = countObjectKeys(document?.themes?.byId);
    const variantCount = countThemeVariants(document?.themes?.byId);
    const tokenCount = countTokenEntries(document?.tokens);

    const publishNodes = listUniverseNodes(
        universe,
        (node) =>
            node.id === 'workflow:publish' ||
            node.kind === ArtifactKind.DOCUMENT ||
            node.kind === ArtifactKind.COMPONENT_LIBRARY ||
            node.kind === ArtifactKind.VIDEO ||
            node.kind === ArtifactKind.ANIMATION,
    );
    const publishTargetNode = publishNodes.find((node) => node.id === 'workflow:publish') ?? publishNodes[0] ?? null;
    const componentNode =
        publishNodes.find((node) => node.kind === ArtifactKind.COMPONENT_LIBRARY) ?? null;
    const themeLabel =
        asNonEmptyString(document?.themes?.activeThemeId) ??
        Object.keys(asObject(document?.themes?.byId) ?? {}).sort()[0] ??
        null;
    const variantLabel =
        Object.entries(asObject(document?.themes?.byId) ?? {})
            .flatMap(([themeId, theme]) =>
                Object.keys(asObject(theme?.variants) ?? {})
                    .sort()
                    .map((variantId) => `${themeId}/${variantId}`),
            )[0] ?? null;

    if (normalizedEntryId === 'components') {
        return Object.freeze({
            activityLabel: 'Components',
            currentTaskLabel: asNonEmptyString(componentNode?.label) ?? ENTRY_FALLBACK_TASKS.components,
            linkedContextCount: componentNode ? 1 : 0,
            summaryLabel: `${componentCount} components · ${themeCount} themes · ${variantCount} variants`,
            bridgeLabel: 'Publish / Components',
        });
    }

    if (normalizedEntryId === 'themes') {
        return Object.freeze({
            activityLabel: 'Themes',
            currentTaskLabel: themeLabel ?? ENTRY_FALLBACK_TASKS.themes,
            linkedContextCount: themeCount,
            summaryLabel: `${themeCount} themes · ${variantCount} variants · ${tokenCount} token groups`,
            bridgeLabel: 'Publish / Themes',
        });
    }

    if (normalizedEntryId === 'variants') {
        return Object.freeze({
            activityLabel: 'Variants',
            currentTaskLabel: variantLabel ?? ENTRY_FALLBACK_TASKS.variants,
            linkedContextCount: variantCount,
            summaryLabel: `${variantCount} variants · ${themeCount} themes · ${componentCount} components`,
            bridgeLabel: 'Publish / Variants',
        });
    }

    if (normalizedEntryId === 'tokens') {
        return Object.freeze({
            activityLabel: 'Tokens',
            currentTaskLabel: themeLabel ?? ENTRY_FALLBACK_TASKS.tokens,
            linkedContextCount: tokenCount,
            summaryLabel: `${tokenCount} token groups · ${themeCount} themes · ${variantCount} variants`,
            bridgeLabel: 'Publish / Tokens',
        });
    }

    return Object.freeze({
        activityLabel: ENTRY_LABELS[normalizedEntryId] ?? 'Publish',
        currentTaskLabel: asNonEmptyString(publishTargetNode?.label) ?? ENTRY_FALLBACK_TASKS[normalizedEntryId] ?? 'Awaiting publish context',
        linkedContextCount: publishNodes.length,
        summaryLabel: `${exportTargetCount} export targets · ${componentCount} components · ${themeCount} themes`,
        bridgeLabel: `Publish / ${ENTRY_LABELS[normalizedEntryId] ?? 'Publish'}`,
    });
}
