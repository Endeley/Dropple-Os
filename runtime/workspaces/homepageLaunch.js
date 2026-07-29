import {
    applyWorkspaceLaunchContextToSearchParams,
    createWorkspaceLaunchContext,
} from './workspaceLaunchContext.js';

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function createHomepageLanguageLaunchContext(modeId) {
    const normalizedModeId = asNonEmptyString(modeId);
    if (!normalizedModeId) return null;

    return createWorkspaceLaunchContext({
        language: normalizedModeId,
        grammar: 'create',
    });
}

export function buildHomepageLanguageLaunchHref(modeId) {
    const normalizedModeId = asNonEmptyString(modeId);
    if (!normalizedModeId) return '/workspace';

    const launchContext = createHomepageLanguageLaunchContext(normalizedModeId);
    const searchParams = applyWorkspaceLaunchContextToSearchParams({
        launchContext,
    });

    return `/workspace/${encodeURIComponent(normalizedModeId)}?${searchParams.toString()}`;
}
