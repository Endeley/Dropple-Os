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
