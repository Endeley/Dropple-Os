export const NEAR_RADIUS_BY_TIER = {
    far: 200,
    overview: 120,
    normal: 64,
    detail: 32,
    micro: 16,
};

export const BASE_NEAR_RADIUS = 48;

export function getNearRadius(zoomTier) {
    return NEAR_RADIUS_BY_TIER[zoomTier] ?? BASE_NEAR_RADIUS;
}
