export const SNAP_RADIUS_BY_TIER = {
    far: 0,
    overview: 0,
    normal: 12,
    detail: 8,
    micro: 4,
};

export function getSnapRadius(zoomTier) {
    return SNAP_RADIUS_BY_TIER[zoomTier] ?? 0;
}
