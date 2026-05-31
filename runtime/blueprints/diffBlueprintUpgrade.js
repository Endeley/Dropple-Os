function stableStringify(value) {
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
    if (typeof value === 'object') {
        const keys = Object.keys(value).sort((a, b) => a.localeCompare(b));
        return `{${keys.map((key) => `"${key}":${stableStringify(value[key])}`).join(',')}}`;
    }
    return JSON.stringify(value);
}

function normalizeSeedEvents(blueprint) {
    const events = Array.isArray(blueprint?.seedEvents) ? blueprint.seedEvents : [];
    return events.map((event) => ({
        type: event?.type ?? '',
        payload: event?.payload ?? {},
    }));
}

export function isBlueprintUpgradeAdditive(diff) {
    return (diff?.removed?.length ?? 0) === 0 && (diff?.changed?.length ?? 0) === 0;
}

export function diffBlueprintUpgrade({ fromBlueprint, toBlueprint }) {
    const fromEvents = normalizeSeedEvents(fromBlueprint);
    const toEvents = normalizeSeedEvents(toBlueprint);
    const maxLength = Math.max(fromEvents.length, toEvents.length);

    const added = [];
    const removed = [];
    const changed = [];

    for (let index = 0; index < maxLength; index += 1) {
        const fromEvent = fromEvents[index];
        const toEvent = toEvents[index];

        if (!fromEvent && toEvent) {
            added.push({ index, event: toEvent });
            continue;
        }

        if (fromEvent && !toEvent) {
            removed.push({ index, event: fromEvent });
            continue;
        }

        if (stableStringify(fromEvent) !== stableStringify(toEvent)) {
            changed.push({ index, from: fromEvent, to: toEvent });
        }
    }

    const hasChanges = added.length > 0 || removed.length > 0 || changed.length > 0;
    const hasConflicts = removed.length > 0 || changed.length > 0;
    return Object.freeze({
        fromVersionId: fromBlueprint?.lineage?.versionId ?? null,
        toVersionId: toBlueprint?.lineage?.versionId ?? null,
        added: Object.freeze(added),
        removed: Object.freeze(removed),
        changed: Object.freeze(changed),
        hasChanges,
        hasConflicts,
        additiveOnly: !hasConflicts,
        conflictCount: removed.length + changed.length,
    });
}
