// branching/graph/buildBranchGraph.js

/**
 * Build a simple branch graph layout.
 *
 * 🔒 Rules:
 * - Pure function
 * - Deterministic layout
 * - No UI, no state
 *
 * Layout strategy:
 * - main branch on top
 * - children stacked vertically under parent
 * - simple left-to-right depth
 */

export function buildBranchGraph(branches) {
    if (!branches || typeof branches !== 'object') {
        return { nodes: [], edges: [] };
    }

    const nodes = [];
    const edges = [];

    // Build adjacency + roots
    const childrenMap = {};
    const roots = [];

    for (const [id, branch] of Object.entries(branches)) {
        const base = branch.base;
        if (base) {
            if (!childrenMap[base]) childrenMap[base] = [];
            childrenMap[base].push(id);
            edges.push({ from: base, to: id });
        } else {
            roots.push(id);
        }
    }

    const visited = new Set();
    const positions = {};
    let row = 0;

    function walk(id, depth) {
        if (visited.has(id)) return;
        visited.add(id);

        positions[id] = {
            x: depth * 160,
            y: row * 60,
        };

        nodes.push({
            id,
            base: branches[id]?.base ?? null,
            x: positions[id].x,
            y: positions[id].y,
        });

        row++;

        const children = childrenMap[id] || [];
        for (const child of children) {
            walk(child, depth + 1);
        }
    }

    // Walk from roots (usually just "main")
    for (const root of roots) {
        walk(root, 0);
    }

    return { nodes, edges };
}
