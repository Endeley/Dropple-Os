const CAMERA_LIMITS = Object.freeze({
    minPosition: -10000,
    maxPosition: 10000,
    minScale: 0.1,
    maxScale: 8,
});

export const PROJECT_WORLD_NAVIGATION_STATE_KEY = '__droppleProjectWorldEnvelope';
export const PROJECT_WORLD_SESSION_BRIDGE_PREFIX = 'dropple:project-world-envelope:';

const PROJECT_WORLD_TRANSIENT_QUERY_KEYS = Object.freeze([
    'x',
    'y',
    'z',
    'uq',
    'pf',
    'pt',
    'pu',
    'pl',
    'pi',
    'pj',
    'pe',
    'ps',
    'pk',
    'pm',
]);

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

export function normalizeProjectUniverseFocusState(focus = {}) {
    return Object.freeze({
        targetId: asNonEmptyString(focus?.targetId),
        query: asNonEmptyString(focus?.query) ?? '',
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
        sourceIntentLabel: asNonEmptyString(searchParams?.get?.('pi')),
        sourceIntentSource: asNonEmptyString(searchParams?.get?.('pj')),
        targetEntryId: asNonEmptyString(searchParams?.get?.('pe')),
        sourceEntryId: asNonEmptyString(searchParams?.get?.('ps')),
        sourceKind: asNonEmptyString(searchParams?.get?.('pk')),
        continuityKind: normalizeContinuityKind(searchParams?.get?.('pm')),
    });
}

export function normalizeProjectPerspectiveContinuityState(continuity = {}) {
    return Object.freeze({
        fromPerspectiveId: asNonEmptyString(continuity?.fromPerspectiveId),
        toPerspectiveId: asNonEmptyString(continuity?.toPerspectiveId),
        sourceTargetId: asNonEmptyString(continuity?.sourceTargetId),
        sourceLabel: asNonEmptyString(continuity?.sourceLabel),
        sourceIntentLabel: asNonEmptyString(continuity?.sourceIntentLabel),
        sourceIntentSource: asNonEmptyString(continuity?.sourceIntentSource),
        targetEntryId: asNonEmptyString(continuity?.targetEntryId),
        sourceEntryId: asNonEmptyString(continuity?.sourceEntryId),
        sourceKind: asNonEmptyString(continuity?.sourceKind),
        continuityKind: normalizeContinuityKind(continuity?.continuityKind),
    });
}

export function withProjectPerspectiveContinuitySearchParams({ searchParams, continuity } = {}) {
    const next = new URLSearchParams(searchParams?.toString?.() ?? '');
    const fromPerspectiveId = asNonEmptyString(continuity?.fromPerspectiveId);
    const toPerspectiveId = asNonEmptyString(continuity?.toPerspectiveId);
    const sourceTargetId = asNonEmptyString(continuity?.sourceTargetId);
    const sourceLabel = asNonEmptyString(continuity?.sourceLabel);
    const sourceIntentLabel = asNonEmptyString(continuity?.sourceIntentLabel);
    const sourceIntentSource = asNonEmptyString(continuity?.sourceIntentSource);
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

    if (sourceIntentLabel) next.set('pi', sourceIntentLabel);
    else next.delete('pi');

    if (sourceIntentSource) next.set('pj', sourceIntentSource);
    else next.delete('pj');

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

export function buildProjectWorldNavigationEnvelope({
    camera,
    focus,
    continuity,
} = {}) {
    return Object.freeze({
        camera: normalizeProjectCameraState(camera),
        focus: normalizeProjectUniverseFocusState(focus),
        continuity: normalizeProjectPerspectiveContinuityState(continuity),
    });
}

export function buildProjectWorldSessionBridgeKey({ href, pathname, searchParams } = {}) {
    let routeHref = asNonEmptyString(href);
    if (!routeHref) {
        const normalizedPathname = asNonEmptyString(pathname) ?? '/workspace/overview';
        const normalizedSearchParams = searchParams instanceof URLSearchParams
            ? searchParams
            : new URLSearchParams(searchParams?.toString?.() ?? '');
        routeHref = `${normalizedPathname}?${normalizedSearchParams.toString()}`;
    }
    return `${PROJECT_WORLD_SESSION_BRIDGE_PREFIX}${routeHref}`;
}

export function withProjectDurableWorldSearchParams({
    searchParams,
    focus,
    entryId = undefined,
} = {}) {
    const next = new URLSearchParams(searchParams?.toString?.() ?? '');
    for (const key of PROJECT_WORLD_TRANSIENT_QUERY_KEYS) {
        next.delete(key);
    }

    if (entryId !== undefined) {
        const normalizedEntryId = asNonEmptyString(entryId);
        if (normalizedEntryId) next.set('entry', normalizedEntryId);
        else next.delete('entry');
    }

    const normalizedFocus = normalizeProjectUniverseFocusState(focus);
    if (normalizedFocus.targetId) next.set('u', normalizedFocus.targetId);
    else next.delete('u');

    return next;
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
    continuityIntentLabel = null,
    continuityIntentSource = null,
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

    const samePerspective = targetPerspectiveId === asNonEmptyString(currentPerspectiveId);
    const sameEntry = targetEntryId === asNonEmptyString(currentEntryId);
    const continuityKind =
        samePerspective && (continuityTargetId || !sameEntry)
            ? 'dive'
            : 'hop';

    const next = withProjectDurableWorldSearchParams({
        searchParams: url.searchParams,
        focus: {
            targetId: continuityTargetId,
        },
        entryId: targetEntryId,
    });
    const envelope = buildProjectWorldNavigationEnvelope({
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
            sourceIntentLabel: asNonEmptyString(continuityIntentLabel),
            sourceIntentSource: asNonEmptyString(continuityIntentSource),
            targetEntryId,
            sourceEntryId: asNonEmptyString(currentEntryId),
            sourceKind: asNonEmptyString(continuityTarget?.kind),
            continuityKind,
        },
    });
    const queryString = next.toString();

    return Object.freeze({
        href: queryString.length > 0 ? `${url.pathname}?${queryString}` : url.pathname,
        envelope,
    });
}
