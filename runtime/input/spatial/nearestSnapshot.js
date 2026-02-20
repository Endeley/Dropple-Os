let latestSnapshot = {
    tier: 'normal',
    radius: 0,
    nearest: [],
    primary: null,
    worldPoint: null,
};

export function setNearestSnapshot(next, worldPoint = null) {
    if (!next) return;
    const snapshot = {
        tier: next.tier,
        radius: next.radius,
        nearest: next.nearest,
        primary: next.primary,
        worldPoint,
    };

    if (process.env.NODE_ENV === 'development') {
        Object.freeze(snapshot);
    }

    latestSnapshot = snapshot;
}

export function getNearestSnapshot() {
    return latestSnapshot;
}
