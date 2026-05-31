const CAMERA_LIMITS = Object.freeze({
    minPosition: -10000,
    maxPosition: 10000,
    minScale: 0.1,
    maxScale: 8,
});

function parseFiniteOr(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function normalizeProjectCameraState(camera = {}) {
    return Object.freeze({
        x: clamp(parseFiniteOr(camera?.x, 0), CAMERA_LIMITS.minPosition, CAMERA_LIMITS.maxPosition),
        y: clamp(parseFiniteOr(camera?.y, 0), CAMERA_LIMITS.minPosition, CAMERA_LIMITS.maxPosition),
        scale: clamp(parseFiniteOr(camera?.scale, 1), CAMERA_LIMITS.minScale, CAMERA_LIMITS.maxScale),
    });
}

export function resolveProjectCameraFromSearchParams(searchParams) {
    return normalizeProjectCameraState({
        x: searchParams?.get?.('x'),
        y: searchParams?.get?.('y'),
        scale: searchParams?.get?.('z'),
    });
}

export function withProjectCameraSearchParams({ searchParams, camera }) {
    const normalized = normalizeProjectCameraState(camera);
    const next = new URLSearchParams(searchParams?.toString?.() ?? '');
    next.set('x', normalized.x.toFixed(2));
    next.set('y', normalized.y.toFixed(2));
    next.set('z', normalized.scale.toFixed(3));
    return next;
}
