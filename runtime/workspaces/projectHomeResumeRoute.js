function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function buildProjectHomeResumeRoute(activeDocumentId) {
    const normalized = asNonEmptyString(activeDocumentId);
    if (!normalized) return '/workspace/overview';
    return `/workspace/new?doc=${encodeURIComponent(normalized)}`;
}
