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
