import { hashTimeline } from '../../domain/timeline/TimelineContract.js';
import { createSnapshotGraph, createSnapshotNode, assertSnapshotIntegrity } from './snapshotGraph.js';
import { diffTimeline } from './diffTimeline.js';

export function createTimelineHistory(initialTimeline) {
    return createSnapshotGraph(initialTimeline);
}

export function applyTimelineMutation(history, nextTimeline) {
    const currentNode = history.nodes[history.headId];
    const nextHash = hashTimeline(nextTimeline);

    if (nextHash === history.headId) {
        return history;
    }

    const existing = history.nodes[nextHash];
    const nextNodes = { ...history.nodes };
    const nextMeta = { ...history.meta };

    const nextNode = existing
        ? existing
        : createSnapshotNode(nextTimeline, [history.headId], diffTimeline(currentNode.timeline, nextTimeline));

    if (!existing) {
        nextNodes[nextHash] = nextNode;
        nextMeta[nextHash] = {
            label: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
    }

    const parent = nextNodes[history.headId];
    const parentChildren = new Set(parent.childrenIds);
    parentChildren.add(nextHash);
    nextNodes[history.headId] = {
        ...parent,
        childrenIds: Array.from(parentChildren),
    };

    if (!nextNode.parentIds.includes(history.headId)) {
        nextNodes[nextHash] = {
            ...nextNode,
            parentIds: [...nextNode.parentIds, history.headId],
        };
    }

    assertSnapshotIntegrity(nextNodes[nextHash]);

    return {
        nodes: nextNodes,
        headId: nextHash,
        meta: nextMeta,
    };
}

export function checkoutSnapshot(history, snapshotId) {
    const node = history.nodes[snapshotId];
    if (!node) {
        throw new Error(`Snapshot ${snapshotId} not found`);
    }
    assertSnapshotIntegrity(node);
    if (history.headId === snapshotId) return history;
    return {
        ...history,
        headId: snapshotId,
    };
}

export function undo(history) {
    const node = history.nodes[history.headId];
    const parentId = node?.parentIds?.[0];
    if (!parentId) return history;
    return checkoutSnapshot(history, parentId);
}

export function redo(history) {
    const node = history.nodes[history.headId];
    if (!node) return history;
    if (node.childrenIds.length !== 1) return history;
    return checkoutSnapshot(history, node.childrenIds[0]);
}

function normalizeLabel(label) {
    if (label == null) return '';
    const trimmed = String(label).trim();
    return trimmed.length > 64 ? trimmed.slice(0, 64) : trimmed;
}

export function setSnapshotLabel(history, { snapshotId, label }) {
    const node = history.nodes[snapshotId];
    if (!node) {
        throw new Error(`Snapshot ${snapshotId} not found`);
    }
    const nextLabel = normalizeLabel(label);
    const currentMeta = history.meta?.[snapshotId] ?? {
        label: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
    if (currentMeta.label === nextLabel) return history;

    const updatedMeta = {
        ...currentMeta,
        label: nextLabel,
        updatedAt: Date.now(),
    };

    return {
        ...history,
        meta: {
            ...history.meta,
            [snapshotId]: updatedMeta,
        },
    };
}
