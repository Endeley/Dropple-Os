function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function titleCaseFromId(value, fallback = 'Project') {
    const source = asNonEmptyString(value);
    if (!source) return fallback;
    return source
        .replace(/[._]/g, ' ')
        .split(/[\s-]+/)
        .filter(Boolean)
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(' ');
}

export function resolveProjectWorldAnchor({
    projectName = null,
    perspectiveLabel = 'Overview',
    entryLabel = null,
    focusedUniverseItem = null,
    artifactCount = 0,
} = {}) {
    const normalizedProjectName = asNonEmptyString(projectName) ?? 'Untitled Project';
    const normalizedPerspectiveLabel = asNonEmptyString(perspectiveLabel) ?? 'Overview';
    const normalizedEntryLabel = asNonEmptyString(entryLabel);
    const focusLabel = asNonEmptyString(focusedUniverseItem?.label) ?? 'Project Hub';
    const focusSubtitle =
        asNonEmptyString(focusedUniverseItem?.subtitle) ??
        `${Number.isFinite(artifactCount) ? artifactCount : 0} artifact${artifactCount === 1 ? '' : 's'} in this project world`;

    return Object.freeze({
        projectLabel: normalizedProjectName,
        activityLabel: normalizedEntryLabel
            ? `${normalizedPerspectiveLabel} / ${normalizedEntryLabel}`
            : normalizedPerspectiveLabel,
        focusLabel,
        focusSubtitle,
        projectSummary: `${normalizedProjectName} · ${titleCaseFromId(normalizedPerspectiveLabel, normalizedPerspectiveLabel)}`,
    });
}
