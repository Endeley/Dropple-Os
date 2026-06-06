const CAMERA_LIMITS = Object.freeze({
    minPosition: -10000,
    maxPosition: 10000,
    minScale: 0.1,
    maxScale: 8,
});

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

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

export function resolveProjectUniverseFocusFromSearchParams(searchParams) {
    return Object.freeze({
        targetId: asNonEmptyString(searchParams?.get?.('u')),
        query: asNonEmptyString(searchParams?.get?.('uq')) ?? '',
    });
}

export function withProjectUniverseFocusSearchParams({ searchParams, focus } = {}) {
    const next = new URLSearchParams(searchParams?.toString?.() ?? '');
    const targetId = asNonEmptyString(focus?.targetId);
    const query = asNonEmptyString(focus?.query) ?? '';

    if (targetId) next.set('u', targetId);
    else next.delete('u');

    if (query.length > 0) next.set('uq', query);
    else next.delete('uq');

    return next;
}

export function resolveProjectPerspectiveContinuityFromSearchParams(searchParams) {
    return Object.freeze({
        fromPerspectiveId: asNonEmptyString(searchParams?.get?.('pf')),
        toPerspectiveId: asNonEmptyString(searchParams?.get?.('pt')),
        sourceTargetId: asNonEmptyString(searchParams?.get?.('pu')),
    });
}

export function withProjectPerspectiveContinuitySearchParams({ searchParams, continuity } = {}) {
    const next = new URLSearchParams(searchParams?.toString?.() ?? '');
    const fromPerspectiveId = asNonEmptyString(continuity?.fromPerspectiveId);
    const toPerspectiveId = asNonEmptyString(continuity?.toPerspectiveId);
    const sourceTargetId = asNonEmptyString(continuity?.sourceTargetId);

    if (fromPerspectiveId) next.set('pf', fromPerspectiveId);
    else next.delete('pf');

    if (toPerspectiveId) next.set('pt', toPerspectiveId);
    else next.delete('pt');

    if (sourceTargetId) next.set('pu', sourceTargetId);
    else next.delete('pu');

    return next;
}
