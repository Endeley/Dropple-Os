const RECENT_VIEWS_STORAGE_KEY = 'dropple.projectShell.recentViews.v1';
const MAX_RECENT_VIEWS = 8;

function normalizeRoute(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function getProjectShellRecentViewsStorageKey() {
    return RECENT_VIEWS_STORAGE_KEY;
}

export function normalizeRecentProjectRoutes(value) {
    if (!Array.isArray(value)) return Object.freeze([]);
    const deduped = [];
    const seen = new Set();
    for (const entry of value) {
        const route = normalizeRoute(entry);
        if (!route || seen.has(route)) continue;
        deduped.push(route);
        seen.add(route);
        if (deduped.length >= MAX_RECENT_VIEWS) break;
    }
    return Object.freeze(deduped);
}

export function mergeRecentProjectRoutes({ activeRoute, previousRoutes } = {}) {
    const route = normalizeRoute(activeRoute);
    const normalizedPrevious = normalizeRecentProjectRoutes(previousRoutes);
    if (!route) return normalizedPrevious;
    return normalizeRecentProjectRoutes([route, ...normalizedPrevious]);
}

export function buildProjectViewShareHref({ pathname, searchParams } = {}) {
    const normalizedPathname = normalizeRoute(pathname) ?? '/workspace/overview';
    const params = new URLSearchParams(searchParams?.toString?.() ?? '');
    const query = params.toString();
    return query.length > 0 ? `${normalizedPathname}?${query}` : normalizedPathname;
}
