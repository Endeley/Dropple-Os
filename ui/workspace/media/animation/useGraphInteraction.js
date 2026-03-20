'use client';

import { useCallback, useRef, useState } from 'react';

function clampZoom(value) {
    return Math.max(0.5, Math.min(2, value));
}

export function useGraphInteraction() {
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [hoverNodeId, setHoverNodeId] = useState(null);
    const [viewport, setViewport] = useState({
        x: 0,
        y: 0,
        zoom: 1,
    });
    const [draggingNode, setDraggingNode] = useState(null);
    const [panning, setPanning] = useState(false);

    const panAnchorRef = useRef(null);

    const selectNode = useCallback((id) => {
        setSelectedNodeId(id);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedNodeId(null);
    }, []);

    const setHover = useCallback((id) => {
        setHoverNodeId(id);
    }, []);

    const startPan = useCallback((x, y) => {
        panAnchorRef.current = { x, y };
        setPanning(true);
    }, []);

    const endPan = useCallback(() => {
        panAnchorRef.current = null;
        setPanning(false);
    }, []);

    const updatePanFromPointer = useCallback((x, y) => {
        const last = panAnchorRef.current;
        if (!last) return;

        const dx = x - last.x;
        const dy = y - last.y;

        panAnchorRef.current = { x, y };

        setViewport((current) => ({
            ...current,
            x: current.x + dx,
            y: current.y + dy,
        }));
    }, []);

    const updateZoom = useCallback((delta) => {
        setViewport((current) => ({
            ...current,
            zoom: clampZoom(current.zoom - delta * 0.001),
        }));
    }, []);

    const startNodeDrag = useCallback((id, pointerX, pointerY, nodePosition) => {
        setDraggingNode({
            id,
            pointerStartX: pointerX,
            pointerStartY: pointerY,
            originX: Number(nodePosition?.x ?? 0),
            originY: Number(nodePosition?.y ?? 0),
            previewX: Number(nodePosition?.x ?? 0),
            previewY: Number(nodePosition?.y ?? 0),
        });
    }, []);

    const updateNodeDrag = useCallback((pointerX, pointerY) => {
        setDraggingNode((current) => {
            if (!current) return current;

            const dx = pointerX - current.pointerStartX;
            const dy = pointerY - current.pointerStartY;

            return {
                ...current,
                previewX: current.originX + dx,
                previewY: current.originY + dy,
            };
        });
    }, []);

    const endNodeDrag = useCallback(() => {
        setDraggingNode(null);
    }, []);

    return {
        selectedNodeId,
        hoverNodeId,
        viewport,
        draggingNode,
        panning,
        selectNode,
        clearSelection,
        setHover,
        startPan,
        endPan,
        updatePanFromPointer,
        updateZoom,
        startNodeDrag,
        updateNodeDrag,
        endNodeDrag,
    };
}
