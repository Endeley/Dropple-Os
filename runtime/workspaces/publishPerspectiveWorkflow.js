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

const ENTRY_PRIORITIES = Object.freeze({
    governance: 0,
    review: 1,
    versioning: 2,
    conversion: 3,
    components: 4,
    themes: 5,
    variants: 6,
    tokens: 7,
});

const CLUSTER_DEFINITIONS = Object.freeze({
    release: Object.freeze({
        id: 'release',
        label: 'Release',
        entryIds: Object.freeze(['governance', 'review', 'versioning', 'conversion']),
    }),
    system: Object.freeze({
        id: 'system',
        label: 'System',
        entryIds: Object.freeze(['components', 'themes', 'variants', 'tokens']),
    }),
});

const ENTRY_TO_CLUSTER_ID = Object.freeze(
    Object.fromEntries(
        Object.values(CLUSTER_DEFINITIONS).flatMap((cluster) =>
            cluster.entryIds.map((entryId) => [entryId, cluster.id]),
        ),
    ),
);

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

const ENTRY_GUIDANCE_NOTES = Object.freeze({
    governance: 'Keep release rules, approvals, and artifact evidence aligned before publication.',
    review: 'Close the review loop before advancing publication so release evidence stays trustworthy.',
    versioning: 'Keep version plans and release evidence synchronized before surfacing downstream delivery.',
    conversion: 'Keep delivery targets grounded in the source artifact so exports remain traceable.',
    components: 'Keep component publication aligned with the system library before surfacing release output.',
    themes: 'Keep themes connected to components and tokens so visual publication stays coherent.',
    variants: 'Keep variants tied to theme and component intent before pushing publication forward.',
    tokens: 'Keep token publication anchored to themes and components so system signals stay lawful.',
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

function buildPublishWorkflowHref({ entryId, targetId = null }) {
    const searchParams = new URLSearchParams();
    searchParams.set('entry', entryId);
    if (targetId) searchParams.set('u', targetId);
    return `/workspace/publish?${searchParams.toString()}`;
}

function resolveClusterId(entryId) {
    return ENTRY_TO_CLUSTER_ID[entryId] ?? 'release';
}

function resolvePublishContinuityNode(universe, targetId) {
    const normalizedTargetId = asNonEmptyString(targetId);
    if (!normalizedTargetId) return null;
    return asObject(universe?.nodes)?.[normalizedTargetId] ?? null;
}

function buildWorkflowItem({
    targetId,
    entryId,
    kind,
    label,
    activeEntryId,
    continuityTargetId = null,
    continuityTargetLabel = null,
    continuityTargetKind = null,
    continuityIntentLabel = null,
}) {
    const clusterId = resolveClusterId(entryId);
    return Object.freeze({
        targetId,
        entryId,
        entryLabel: ENTRY_LABELS[entryId] ?? entryId,
        clusterId,
        clusterLabel: CLUSTER_DEFINITIONS[clusterId]?.label ?? 'Release',
        kind,
        label,
        href: buildPublishWorkflowHref({ entryId, targetId: targetId.startsWith('publish:') ? null : targetId }),
        continuityTargetId: asNonEmptyString(continuityTargetId) ?? targetId,
        continuityTargetLabel: asNonEmptyString(continuityTargetLabel) ?? label,
        continuityTargetKind: asNonEmptyString(continuityTargetKind) ?? kind,
        continuityIntentLabel:
            asNonEmptyString(continuityIntentLabel) ??
            `Continue publishing through ${ENTRY_LABELS[entryId] ?? entryId} via ${label}.`,
        active: entryId === activeEntryId,
    });
}

function buildPublishAssistantGuidance({
    activeEntryId,
    currentTaskLabel,
    suggestedNextArtifact,
}) {
    const entryLabel = ENTRY_LABELS[activeEntryId] ?? 'Publish';
    const taskLabel = asNonEmptyString(currentTaskLabel) ?? ENTRY_FALLBACK_TASKS[activeEntryId] ?? 'publish context';
    const nextArtifactLabel = asNonEmptyString(suggestedNextArtifact?.label) ?? taskLabel;
    const nextArtifactEntryLabel = asNonEmptyString(suggestedNextArtifact?.entryLabel) ?? entryLabel;

    return Object.freeze({
        assistantLabel: 'Publishing Assistant',
        assistantSummary: `Publishing Assistant is guiding ${entryLabel} toward ${taskLabel}.`,
        nextGuidanceLabel: `Continue from ${taskLabel} into ${nextArtifactEntryLabel} via ${nextArtifactLabel}.`,
        systemGuidanceLabel:
            ENTRY_GUIDANCE_NOTES[activeEntryId] ??
            'Keep publish intent, artifact evidence, and release system context aligned before surfacing delivery.',
    });
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

export function buildPublishPerspectiveWorkflow({ entryId = 'governance', document = null, universe = null } = {}) {
    const activeEntryId = asNonEmptyString(entryId)?.toLowerCase() ?? 'governance';
    const normalizedDocument = asObject(document) ?? {};
    const publishTargetNode = resolvePublishContinuityNode(universe, 'workflow:publish');
    const componentLibraryNode = resolvePublishContinuityNode(universe, 'components:library');
    const documentNode = resolvePublishContinuityNode(universe, 'document:primary');
    const publishFallbackTarget =
        componentLibraryNode ??
        documentNode ??
        publishTargetNode ??
        null;
    const publishNodes = listUniverseNodes(
        universe,
        (node) =>
            node.id === 'workflow:publish' ||
            node.kind === ArtifactKind.DOCUMENT ||
            node.kind === ArtifactKind.COMPONENT_LIBRARY ||
            node.kind === ArtifactKind.VIDEO ||
            node.kind === ArtifactKind.ANIMATION,
    );

    const themeCount = countObjectKeys(normalizedDocument?.themes?.byId);
    const variantCount = countThemeVariants(normalizedDocument?.themes?.byId);
    const tokenCount = countTokenEntries(normalizedDocument?.tokens);

    const linkedArtifacts = [
        ...publishNodes.flatMap((node) => {
            if (node.id === 'workflow:publish') {
                return [
                    buildWorkflowItem({
                        targetId: node.id,
                        entryId: 'governance',
                        kind: String(node.kind ?? 'workflow'),
                        label: asNonEmptyString(node.label) ?? node.id,
                        activeEntryId,
                        continuityIntentLabel: 'Continue publishing governance through Publish Targets.',
                    }),
                    buildWorkflowItem({
                        targetId: node.id,
                        entryId: 'review',
                        kind: String(node.kind ?? 'workflow'),
                        label: asNonEmptyString(node.label) ?? node.id,
                        activeEntryId,
                        continuityIntentLabel: 'Continue publishing review through Publish Targets.',
                    }),
                    buildWorkflowItem({
                        targetId: node.id,
                        entryId: 'versioning',
                        kind: String(node.kind ?? 'workflow'),
                        label: asNonEmptyString(node.label) ?? node.id,
                        activeEntryId,
                        continuityIntentLabel: 'Continue publishing versioning through Publish Targets.',
                    }),
                ];
            }

            if (node.kind === ArtifactKind.COMPONENT_LIBRARY) {
                return [
                    buildWorkflowItem({
                        targetId: node.id,
                        entryId: 'components',
                        kind: String(node.kind),
                        label: asNonEmptyString(node.label) ?? node.id,
                        activeEntryId,
                        continuityIntentLabel: 'Continue publishing components through Component Library.',
                    }),
                ];
            }

            return [
                buildWorkflowItem({
                    targetId: node.id,
                    entryId: 'conversion',
                    kind: String(node.kind ?? 'document'),
                    label: asNonEmptyString(node.label) ?? node.id,
                    activeEntryId,
                    continuityIntentLabel: `Continue publishing conversion through ${asNonEmptyString(node.label) ?? node.id}.`,
                }),
            ];
        }),
        ...(themeCount > 0
            ? [
                  buildWorkflowItem({
                      targetId: 'publish:themes',
                      entryId: 'themes',
                      kind: 'theme-system',
                      label: asNonEmptyString(normalizedDocument?.themes?.activeThemeId) ?? 'Theme System',
                      activeEntryId,
                      continuityTargetId: publishFallbackTarget?.id,
                      continuityTargetLabel: asNonEmptyString(publishFallbackTarget?.label),
                      continuityTargetKind: asNonEmptyString(publishFallbackTarget?.kind),
                      continuityIntentLabel: 'Continue publishing themes through Component Library.',
                  }),
              ]
            : []),
        ...(variantCount > 0
            ? [
                  buildWorkflowItem({
                      targetId: 'publish:variants',
                      entryId: 'variants',
                      kind: 'variant-system',
                      label:
                          Object.entries(asObject(normalizedDocument?.themes?.byId) ?? {})
                              .flatMap(([themeId, theme]) =>
                                  Object.keys(asObject(theme?.variants) ?? {})
                                      .sort()
                                      .map((variantId) => `${themeId}/${variantId}`),
                              )[0] ?? 'Variant System',
                      activeEntryId,
                      continuityTargetId: publishFallbackTarget?.id,
                      continuityTargetLabel: asNonEmptyString(publishFallbackTarget?.label),
                      continuityTargetKind: asNonEmptyString(publishFallbackTarget?.kind),
                      continuityIntentLabel: 'Continue publishing variants through Component Library.',
                  }),
              ]
            : []),
        ...(tokenCount > 0
            ? [
                  buildWorkflowItem({
                      targetId: 'publish:tokens',
                      entryId: 'tokens',
                      kind: 'token-system',
                      label: asNonEmptyString(normalizedDocument?.themes?.activeThemeId) ?? 'Token System',
                      activeEntryId,
                      continuityTargetId: publishFallbackTarget?.id,
                      continuityTargetLabel: asNonEmptyString(publishFallbackTarget?.label),
                      continuityTargetKind: asNonEmptyString(publishFallbackTarget?.kind),
                      continuityIntentLabel: 'Continue publishing tokens through Component Library.',
                  }),
              ]
            : []),
    ].sort((left, right) => {
        const activeDelta = Number(right.active) - Number(left.active);
        if (activeDelta !== 0) return activeDelta;
        const priorityDelta = (ENTRY_PRIORITIES[left.entryId] ?? 999) - (ENTRY_PRIORITIES[right.entryId] ?? 999);
        if (priorityDelta !== 0) return priorityDelta;
        return left.label.localeCompare(right.label);
    });

    const summaryCounts = new Map();
    for (const item of linkedArtifacts) {
        summaryCounts.set(item.entryId, (summaryCounts.get(item.entryId) ?? 0) + 1);
    }

    const entrySummaries = Object.keys(ENTRY_PRIORITIES)
        .filter((candidateEntryId) => summaryCounts.has(candidateEntryId))
        .map((candidateEntryId) =>
            Object.freeze({
                entryId: candidateEntryId,
                entryLabel: ENTRY_LABELS[candidateEntryId] ?? candidateEntryId,
                count: summaryCounts.get(candidateEntryId) ?? 0,
            }),
        )
        .sort((left, right) => (ENTRY_PRIORITIES[left.entryId] ?? 999) - (ENTRY_PRIORITIES[right.entryId] ?? 999));

    const artifactClusters = Object.values(CLUSTER_DEFINITIONS)
        .map((cluster) => {
            const items = linkedArtifacts.filter((item) => item.clusterId === cluster.id);
            if (items.length === 0) return null;
            return Object.freeze({
                clusterId: cluster.id,
                clusterLabel: cluster.label,
                items: Object.freeze(items),
            });
        })
        .filter(Boolean);

    const suggestedNextArtifact = linkedArtifacts.find((item) => item.entryId !== activeEntryId) ?? linkedArtifacts[0] ?? null;
    const worldSummary = buildPublishPerspectiveWorldSummary({ entryId: activeEntryId, document, universe });
    const assistantGuidance = buildPublishAssistantGuidance({
        activeEntryId,
        currentTaskLabel: worldSummary?.currentTaskLabel,
        suggestedNextArtifact,
    });

    return Object.freeze({
        activeEntryId,
        linkedArtifacts: Object.freeze(linkedArtifacts),
        entrySummaries: Object.freeze(entrySummaries),
        artifactClusters: Object.freeze(artifactClusters),
        suggestedNextArtifact,
        assistantGuidance,
        worldSummary: Object.freeze({
            ...worldSummary,
            linkedArtifactCount: linkedArtifacts.length,
            clusterCount: artifactClusters.length,
            nextArtifactLabel: suggestedNextArtifact?.label ?? null,
            assistantSummary: assistantGuidance.assistantSummary,
        }),
    });
}
