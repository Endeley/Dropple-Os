function normalizeString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function normalizeStringArray(values) {
    if (!Array.isArray(values)) return Object.freeze([]);
    return Object.freeze(
        Array.from(
            new Set(
                values
                    .map((value) => normalizeString(value))
                    .filter(Boolean),
            ),
        ).sort((left, right) => left.localeCompare(right)),
    );
}

function normalizeTool(tool = {}) {
    return Object.freeze({
        toolId: normalizeString(tool.toolId),
        semanticId: normalizeString(tool.semanticId),
        winnerSource: normalizeString(tool.winnerSource),
        winnerPriority: Number.isFinite(tool.winnerPriority) ? Number(tool.winnerPriority) : 0,
        ownerSources: normalizeStringArray(tool.ownerSources),
        capabilityTags: normalizeStringArray(tool.capabilityTags),
        defaultActive: tool.defaultActive === true,
        executionSignature: normalizeString(tool.executionSignature),
        migrationWindowId: normalizeString(tool.migrationWindowId),
    });
}

export function buildSynthesizedToolSurfaceModel(input = {}) {
    const tools = Array.isArray(input?.tools) ? input.tools : [];
    const normalized = tools
        .map((tool) => normalizeTool(tool))
        .filter((tool) => tool.toolId)
        .sort((left, right) => left.toolId.localeCompare(right.toolId));

    return Object.freeze({
        activeToolId: normalizeString(input.activeToolId),
        tools: Object.freeze(normalized),
    });
}
