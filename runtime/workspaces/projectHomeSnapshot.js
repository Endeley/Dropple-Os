function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function normalizeRecentProjects(projects) {
    if (!Array.isArray(projects)) return Object.freeze([]);
    const normalized = projects
        .map((project) => {
            const projectId = asNonEmptyString(project?.projectId);
            const name = asNonEmptyString(project?.name);
            if (!projectId || !name) return null;
            return Object.freeze({
                projectId,
                name,
                blueprintId: asNonEmptyString(project?.blueprintId),
                updatedAt: Number.isFinite(project?.updatedAt) ? Number(project.updatedAt) : null,
            });
        })
        .filter(Boolean)
        .sort((left, right) => {
            const leftUpdated = left.updatedAt ?? -1;
            const rightUpdated = right.updatedAt ?? -1;
            if (leftUpdated !== rightUpdated) return rightUpdated - leftUpdated;
            return left.projectId.localeCompare(right.projectId);
        });
    return Object.freeze(normalized);
}

function normalizeBlueprintRecommendations(blueprints) {
    if (!Array.isArray(blueprints)) return Object.freeze([]);
    const normalized = blueprints
        .map((blueprint) => {
            const id = asNonEmptyString(blueprint?.id);
            const name = asNonEmptyString(blueprint?.name);
            if (!id || !name) return null;
            return Object.freeze({
                id,
                name,
                description: asNonEmptyString(blueprint?.description) ?? '',
            });
        })
        .filter(Boolean)
        .sort((left, right) => left.id.localeCompare(right.id));
    return Object.freeze(normalized);
}

function normalizeContinueRoute(route) {
    const normalized = asNonEmptyString(route);
    return normalized ?? '/workspace/overview';
}

export function buildProjectHomeSnapshot({
    recentProjects = [],
    recommendedBlueprints = [],
    continueRoute = '/workspace/overview',
} = {}) {
    return Object.freeze({
        recentProjects: normalizeRecentProjects(recentProjects),
        recommendedBlueprints: normalizeBlueprintRecommendations(recommendedBlueprints),
        continueRoute: normalizeContinueRoute(continueRoute),
        marketplaceRoute: '/marketplace',
    });
}
