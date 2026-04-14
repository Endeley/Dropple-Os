export function computeMergeDiff(base = {}, source = {}, target = {}) {
    const diff = {
        added: [],
        removed: [],
        updated: [],
    };

    const allIds = new Set([
        ...Object.keys(base),
        ...Object.keys(source),
        ...Object.keys(target),
    ]);

    const sortedIds = Array.from(allIds).sort();

    for (const nodeId of sortedIds) {
        const b = base[nodeId];
        const s = source[nodeId];
        const t = target[nodeId];

        if (!b && (s || t)) {
            diff.added.push({
                nodeId,
                after: s ?? t,
            });
            continue;
        }

        if (b && !s && !t) {
            diff.removed.push({
                nodeId,
                before: b,
            });
            continue;
        }

        if (JSON.stringify(s) !== JSON.stringify(t)) {
            diff.updated.push({
                nodeId,
                before: t,
                after: s,
            });
        }
    }

    return diff;
}
