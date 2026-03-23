'use client';

function resolveNodeIdFromElement(element) {
    let current = element;

    while (current && !(current instanceof Element)) {
        current = current.parentNode;
    }

    while (current) {
        if (current.dataset?.nodeId) return current.dataset.nodeId;
        current = current.parentElement;
    }

    return null;
}

export function resolveTargetNodeId(eventTarget, screenPoint = null) {
    const directNodeId = resolveNodeIdFromElement(eventTarget);
    if (directNodeId) return directNodeId;

    if (
        typeof document === 'undefined' ||
        typeof document.elementsFromPoint !== 'function' ||
        !Number.isFinite(screenPoint?.x) ||
        !Number.isFinite(screenPoint?.y)
    ) {
        return null;
    }

    const elements = document.elementsFromPoint(screenPoint.x, screenPoint.y);
    const nodeElements = elements
        .map((element) => {
            let current = element;
            while (current && !(current instanceof Element)) {
                current = current.parentNode;
            }
            return current?.closest?.('[data-node-id]') ?? null;
        })
        .filter(Boolean);

    if (nodeElements.length === 0) return null;

    return nodeElements[0].dataset.nodeId;
}
