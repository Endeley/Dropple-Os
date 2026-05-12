function normalizeVisibleToolDefinitions(visibleToolDefinitions) {
    if (!visibleToolDefinitions || typeof visibleToolDefinitions !== 'object') {
        return [];
    }

    return Object.entries(visibleToolDefinitions)
        .filter(([, definition]) => definition && typeof definition === 'object')
        .map(([toolId, definition]) => ({
            toolId,
            definition,
        }));
}

function compareDefaultCandidate(left, right) {
    const leftPriority = Number.isFinite(left?.definition?.winnerPriority)
        ? left.definition.winnerPriority
        : 0;
    const rightPriority = Number.isFinite(right?.definition?.winnerPriority)
        ? right.definition.winnerPriority
        : 0;

    if (leftPriority !== rightPriority) {
        return rightPriority - leftPriority;
    }

    return String(left?.toolId ?? '').localeCompare(String(right?.toolId ?? ''));
}

export function resolveCanonicalDefaultActiveTool(visibleToolDefinitions) {
    const candidates = normalizeVisibleToolDefinitions(visibleToolDefinitions)
        .filter(({ definition }) => definition?.descriptor?.defaultActive === true)
        .sort(compareDefaultCandidate);

    return candidates[0]?.toolId ?? null;
}
