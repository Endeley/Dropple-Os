// branching/conflicts/detectBranchConflicts.js

/**
 * Detect divergent branches.
 *
 * 🔒 Pure function
 * 🔒 No mutation
 *
 * A conflict exists when:
 * - branches share the same base
 * - both have unique events not in the other
 */
export function detectBranchConflicts(branches) {
    if (!branches) return [];

    const conflicts = [];
    const entries = Object.entries(branches);

    for (let i = 0; i < entries.length; i++) {
        const [idA, a] = entries[i];

        for (let j = i + 1; j < entries.length; j++) {
            const [idB, b] = entries[j];

            if (!a.base || a.base !== b.base) continue;

            const idsA = new Set(a.events.map((e) => e.id));
            const idsB = new Set(b.events.map((e) => e.id));

            const onlyA = [...idsA].filter((id) => !idsB.has(id));
            const onlyB = [...idsB].filter((id) => !idsA.has(id));

            if (onlyA.length > 0 && onlyB.length > 0) {
                conflicts.push({
                    base: a.base,
                    branchA: idA,
                    branchB: idB,
                    onlyA,
                    onlyB,
                });
            }
        }
    }

    return conflicts;
}
