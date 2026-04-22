'use client';

import { useMemo } from 'react';

function buildChildrenMap(nodes) {
    const children = new Map();

    for (const node of nodes) {
        children.set(node.id, []);
    }

    for (const node of nodes) {
        for (const parentId of node.parents ?? []) {
            const siblings = children.get(parentId) ?? [];
            siblings.push(node.id);
            siblings.sort((left, right) => left.localeCompare(right));
            children.set(parentId, siblings);
        }
    }

    return children;
}

function computeLineageDepth(nodeById, versionId, visited = new Set()) {
    if (!versionId || visited.has(versionId)) return 0;

    const node = nodeById.get(versionId);
    if (!node) return 0;
    if (!Array.isArray(node.parents) || node.parents.length === 0) return 0;

    const nextVisited = new Set(visited);
    nextVisited.add(versionId);

    return (
        1 +
        Math.max(
            ...node.parents.map((parentId) =>
                computeLineageDepth(nodeById, parentId, nextVisited),
            ),
        )
    );
}

function computeDescendantCount(childrenById, versionId) {
    const visited = new Set();
    const stack = [...(childrenById.get(versionId) ?? [])];

    while (stack.length > 0) {
        const currentId = stack.pop();
        if (!currentId || visited.has(currentId)) continue;

        visited.add(currentId);
        stack.push(...(childrenById.get(currentId) ?? []));
    }

    return visited.size;
}

export function TokenVersionInspector({ selectedNode, projectedGraph }) {
    const details = useMemo(() => {
        if (!selectedNode) return null;

        const nodeById = new Map(
            (projectedGraph?.nodes ?? []).map((node) => [node.id, node]),
        );
        const childrenById = buildChildrenMap(projectedGraph?.nodes ?? []);

        return {
            parentVersions: selectedNode.parents ?? [],
            mergeParents:
                (selectedNode.parents?.length ?? 0) > 1 ? selectedNode.parents : [],
            lineageDepth: computeLineageDepth(nodeById, selectedNode.id),
            descendantCount: computeDescendantCount(childrenById, selectedNode.id),
        };
    }, [projectedGraph, selectedNode]);

    if (!selectedNode || !details) {
        return (
            <div className='inspector-block inspector-group' data-testid='token-version-inspector-empty'>
                <div className='inspector-title'>Version Inspector</div>
                <div className='inspector-muted'>Select a version node to inspect lineage details</div>
            </div>
        );
    }

    return (
        <div className='inspector-block inspector-group' data-testid='token-version-inspector'>
            <div className='inspector-title'>Version Inspector</div>

            <div className='inspector-row'>
                <span className='inspector-muted'>ID</span>
                <span data-testid='token-version-inspector-id'>{selectedNode.id}</span>
            </div>
            <div className='inspector-row'>
                <span className='inspector-muted'>Label</span>
                <span>{selectedNode.label}</span>
            </div>
            <div className='inspector-row'>
                <span className='inspector-muted'>Parents</span>
                <span>{details.parentVersions.length}</span>
            </div>
            <div className='inspector-row'>
                <span className='inspector-muted'>Merge Parents</span>
                <span>{details.mergeParents.length}</span>
            </div>
            <div className='inspector-row'>
                <span className='inspector-muted'>Created At</span>
                <span>{selectedNode.timestamp ?? '—'}</span>
            </div>
            <div className='inspector-row'>
                <span className='inspector-muted'>Tag</span>
                <span>{selectedNode.operation ?? 'tag'}</span>
            </div>
            <div className='inspector-row'>
                <span className='inspector-muted'>Lineage Depth</span>
                <span>{details.lineageDepth}</span>
            </div>
            <div className='inspector-row'>
                <span className='inspector-muted'>Descendants</span>
                <span>{details.descendantCount}</span>
            </div>
            <div className='inspector-row'>
                <span className='inspector-muted'>Active Head</span>
                <span>{selectedNode.isActive ? 'Yes' : 'No'}</span>
            </div>
            <div className='inspector-muted'>
                {details.parentVersions.length > 0
                    ? `Parents: ${details.parentVersions.join(', ')}`
                    : 'Root version'}
            </div>
        </div>
    );
}

export default TokenVersionInspector;
