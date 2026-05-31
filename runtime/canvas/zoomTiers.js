export const ZOOM_TIERS = [
    { id: 'far', min: 0, max: 0.4 },
    { id: 'overview', min: 0.4, max: 0.8 },
    { id: 'normal', min: 0.8, max: 1.4 },
    { id: 'detail', min: 1.4, max: 2.5 },
    { id: 'micro', min: 2.5, max: Infinity },
];

export function getZoomTier(scale) {
    const safeScale = Number.isFinite(scale) ? scale : 1;
    const tier =
        ZOOM_TIERS.find((entry) => safeScale >= entry.min && safeScale < entry.max) ??
        ZOOM_TIERS[0];
    return tier.id;
}

const DEFAULT_PERSPECTIVE_ID = 'overview';
const PERSPECTIVE_IDS = new Set(['overview', 'create', 'build', 'operate', 'collaborate', 'publish']);

const BASE_PRESENTATION = Object.freeze({
    far: Object.freeze({ detail: 'systems', cluster: 'project-domain', labels: false }),
    overview: Object.freeze({ detail: 'domain', cluster: 'artifact-group', labels: true }),
    normal: Object.freeze({ detail: 'artifact', cluster: 'artifact-node', labels: true }),
    detail: Object.freeze({ detail: 'artifact-detail', cluster: 'artifact-node', labels: true }),
    micro: Object.freeze({ detail: 'node-precision', cluster: 'none', labels: true }),
});

const PERSPECTIVE_OVERRIDES = Object.freeze({
    create: Object.freeze({ domain: 'creative' }),
    build: Object.freeze({ domain: 'execution' }),
    operate: Object.freeze({ domain: 'operations' }),
    collaborate: Object.freeze({ domain: 'people' }),
    publish: Object.freeze({ domain: 'release' }),
    overview: Object.freeze({ domain: 'project' }),
});

const TIER_NODE_BUDGET = Object.freeze({
    far: 0,
    overview: 4,
    normal: 6,
    detail: 8,
    micro: Number.POSITIVE_INFINITY,
});

const PERSPECTIVE_NODE_PRIORITY = Object.freeze({
    overview: Object.freeze(['ui', 'brand', 'app', 'workflow', 'knowledge', 'media']),
    create: Object.freeze(['ui', 'brand', 'media', 'workflow', 'knowledge', 'app']),
    build: Object.freeze(['app', 'workflow', 'ui', 'knowledge', 'brand', 'media']),
    operate: Object.freeze(['workflow', 'app', 'knowledge', 'ui', 'media', 'brand']),
    collaborate: Object.freeze(['knowledge', 'workflow', 'ui', 'brand', 'media', 'app']),
    publish: Object.freeze(['media', 'ui', 'brand', 'knowledge', 'workflow', 'app']),
});

export function resolveSemanticZoomPresentation({ scale, perspectiveId } = {}) {
    const tier = getZoomTier(scale);
    const normalizedPerspectiveId =
        typeof perspectiveId === 'string' && PERSPECTIVE_IDS.has(perspectiveId.trim().toLowerCase())
            ? perspectiveId.trim().toLowerCase()
            : DEFAULT_PERSPECTIVE_ID;
    const base = BASE_PRESENTATION[tier] ?? BASE_PRESENTATION.overview;
    const override = PERSPECTIVE_OVERRIDES[normalizedPerspectiveId] ?? PERSPECTIVE_OVERRIDES.overview;

    return Object.freeze({
        tier,
        perspectiveId: normalizedPerspectiveId,
        detail: base.detail,
        cluster: base.cluster,
        labels: base.labels,
        domain: override.domain,
    });
}

const TIER_VISIBILITY = Object.freeze({
    far: Object.freeze({
        showProjectHubLabel: true,
        showNodeLabels: false,
        showNodeCards: false,
        showClusterDots: true,
    }),
    overview: Object.freeze({
        showProjectHubLabel: true,
        showNodeLabels: true,
        showNodeCards: false,
        showClusterDots: true,
    }),
    normal: Object.freeze({
        showProjectHubLabel: true,
        showNodeLabels: true,
        showNodeCards: true,
        showClusterDots: false,
    }),
    detail: Object.freeze({
        showProjectHubLabel: true,
        showNodeLabels: true,
        showNodeCards: true,
        showClusterDots: false,
    }),
    micro: Object.freeze({
        showProjectHubLabel: true,
        showNodeLabels: true,
        showNodeCards: true,
        showClusterDots: false,
    }),
});

export function resolveSemanticZoomVisibility(tier) {
    return TIER_VISIBILITY[tier] ?? TIER_VISIBILITY.normal;
}

export function resolveSemanticZoomNodeSelection({ tier, perspectiveId, nodeIds } = {}) {
    const normalizedTier = typeof tier === 'string' ? tier : 'normal';
    const normalizedPerspectiveId =
        typeof perspectiveId === 'string' && PERSPECTIVE_IDS.has(perspectiveId.trim().toLowerCase())
            ? perspectiveId.trim().toLowerCase()
            : DEFAULT_PERSPECTIVE_ID;
    const ids = Array.isArray(nodeIds) ? nodeIds.filter((id) => typeof id === 'string') : [];
    const budget = Number.isFinite(TIER_NODE_BUDGET[normalizedTier]) ? TIER_NODE_BUDGET[normalizedTier] : 6;
    const priorityOrder = PERSPECTIVE_NODE_PRIORITY[normalizedPerspectiveId] ?? PERSPECTIVE_NODE_PRIORITY.overview;
    const priorityRank = new Map(priorityOrder.map((id, index) => [id, index]));
    const ordered = [...ids].sort((left, right) => {
        const leftRank = priorityRank.has(left) ? priorityRank.get(left) : Number.POSITIVE_INFINITY;
        const rightRank = priorityRank.has(right) ? priorityRank.get(right) : Number.POSITIVE_INFINITY;
        if (leftRank !== rightRank) return leftRank - rightRank;
        return left.localeCompare(right);
    });
    const selected = Number.isFinite(budget) ? ordered.slice(0, budget) : ordered;
    return Object.freeze({
        tier: normalizedTier,
        perspectiveId: normalizedPerspectiveId,
        budget,
        selectedNodeIds: Object.freeze(selected),
        hiddenCount: Math.max(0, ordered.length - selected.length),
    });
}
