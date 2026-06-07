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

function normalizeContinuityKind(value) {
    const normalized = asNonEmptyString(value);
    if (normalized === 'hop' || normalized === 'dive' || normalized === 'surface') {
        return normalized;
    }
    return null;
}

function resolvePerspectiveIdFromPathname(pathname) {
    const normalized = asNonEmptyString(pathname);
    if (!normalized) return null;
    const match = normalized.match(/^\/workspace\/([^/?#]+)/);
    return asNonEmptyString(match?.[1]);
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
        sourceLabel: asNonEmptyString(searchParams?.get?.('pl')),
        targetEntryId: asNonEmptyString(searchParams?.get?.('pe')),
        sourceEntryId: asNonEmptyString(searchParams?.get?.('ps')),
        sourceKind: asNonEmptyString(searchParams?.get?.('pk')),
        continuityKind: normalizeContinuityKind(searchParams?.get?.('pm')),
    });
}

export function withProjectPerspectiveContinuitySearchParams({ searchParams, continuity } = {}) {
    const next = new URLSearchParams(searchParams?.toString?.() ?? '');
    const fromPerspectiveId = asNonEmptyString(continuity?.fromPerspectiveId);
    const toPerspectiveId = asNonEmptyString(continuity?.toPerspectiveId);
    const sourceTargetId = asNonEmptyString(continuity?.sourceTargetId);
    const sourceLabel = asNonEmptyString(continuity?.sourceLabel);
    const targetEntryId = asNonEmptyString(continuity?.targetEntryId);
    const sourceEntryId = asNonEmptyString(continuity?.sourceEntryId);
    const sourceKind = asNonEmptyString(continuity?.sourceKind);
    const continuityKind = normalizeContinuityKind(continuity?.continuityKind);

    if (fromPerspectiveId) next.set('pf', fromPerspectiveId);
    else next.delete('pf');

    if (toPerspectiveId) next.set('pt', toPerspectiveId);
    else next.delete('pt');

    if (sourceTargetId) next.set('pu', sourceTargetId);
    else next.delete('pu');

    if (sourceLabel) next.set('pl', sourceLabel);
    else next.delete('pl');

    if (targetEntryId) next.set('pe', targetEntryId);
    else next.delete('pe');

    if (sourceEntryId) next.set('ps', sourceEntryId);
    else next.delete('ps');

    if (sourceKind) next.set('pk', sourceKind);
    else next.delete('pk');

    if (continuityKind) next.set('pm', continuityKind);
    else next.delete('pm');

    return next;
}

export function resolveProjectWorldRouteStateFromSearchParams(searchParams) {
    return Object.freeze({
        camera: resolveProjectCameraFromSearchParams(searchParams),
        focus: resolveProjectUniverseFocusFromSearchParams(searchParams),
        continuity: resolveProjectPerspectiveContinuityFromSearchParams(searchParams),
    });
}

export function withProjectWorldSearchParams({
    searchParams,
    camera,
    focus,
    continuity,
} = {}) {
    const withCamera = withProjectCameraSearchParams({
        searchParams,
        camera,
    });
    const withFocus = withProjectUniverseFocusSearchParams({
        searchParams: withCamera,
        focus,
    });
    return withProjectPerspectiveContinuitySearchParams({
        searchParams: withFocus,
        continuity,
    });
}

export function buildProjectArtifactContinuityHref({
    href,
    camera,
    query = '',
    currentPerspectiveId = 'overview',
    currentEntryId = null,
    continuityTarget = null,
} = {}) {
    const normalizedHref = asNonEmptyString(href);
    if (!normalizedHref) return '/workspace/overview';

    const url = new URL(normalizedHref, 'https://dropple.local');
    const targetPerspectiveId =
        resolvePerspectiveIdFromPathname(url.pathname) ??
        asNonEmptyString(currentPerspectiveId) ??
        'overview';
    const targetEntryId = asNonEmptyString(url.searchParams.get('entry'));
    const continuityTargetId =
        asNonEmptyString(url.searchParams.get('u')) ??
        asNonEmptyString(continuityTarget?.targetId);

    const continuityKind =
        targetPerspectiveId === asNonEmptyString(currentPerspectiveId) &&
        targetEntryId &&
        targetEntryId !== asNonEmptyString(currentEntryId)
            ? 'dive'
            : 'hop';

    const next = withProjectWorldSearchParams({
        searchParams: url.searchParams,
        camera,
        focus: {
            targetId: continuityTargetId,
            query: asNonEmptyString(query) ?? '',
        },
        continuity: {
            fromPerspectiveId: asNonEmptyString(currentPerspectiveId),
            toPerspectiveId: targetPerspectiveId,
            sourceTargetId: continuityTargetId,
            sourceLabel: asNonEmptyString(continuityTarget?.label),
            targetEntryId,
            sourceEntryId: asNonEmptyString(currentEntryId),
            sourceKind: asNonEmptyString(continuityTarget?.kind),
            continuityKind,
        },
    });

    return `${url.pathname}?${next.toString()}`;
}
