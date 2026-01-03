'use client';

import { useRef, useEffect } from 'react';
import { MoveSession } from '@/input/sessions/MoveSession';
import { bus, sessionManager } from './canvasBus';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { isAutoLayoutChild } from '@/engine/layout/isAutoLayoutChild.js';

function isDescendant(targetId, selectionSet, nodes) {
    const target = nodes[targetId];
    if (!target || !target.children) return false;
    for (const childId of target.children) {
        if (selectionSet.has(childId)) return true;
        if (isDescendant(childId, selectionSet, nodes)) return true;
    }
    return false;
}

export default function CanvasHost({ children, selectedNodeIds = [] }) {
    const canvasRef = useRef(null);
    const activePointerRef = useRef(null);

    useEffect(() => {
        console.count('Canvas render');
    });

    useEffect(() => {
        const el = canvasRef.current;
        if (!el) return;

        function onPointerDown(e) {
            // primary button only
            if (e.button !== 0) return;

            if (!selectedNodeIds.length) return;

            el.setPointerCapture(e.pointerId);
            activePointerRef.current = e.pointerId;

            const startPointer = {
                x: e.clientX,
                y: e.clientY,
            };

            const runtimeNodes = useRuntimeStore.getState().nodes;
            const selectedNodes = selectedNodeIds.map((id) => runtimeNodes[id]).filter(Boolean);
            const parentId = selectedNodes[0]?.parentId;
            const sameParent = parentId && selectedNodes.every((n) => n?.parentId === parentId);
            const isAuto =
                sameParent && selectedNodes.length > 0 && isAutoLayoutChild(selectedNodes[0], runtimeNodes);
            const parent = parentId ? runtimeNodes[parentId] : null;
            const siblings =
                parent?.children?.filter((id) => !selectedNodeIds.includes(id)).map((id) => runtimeNodes[id]) || [];
            const orderedChildren =
                parent?.children?.filter((id) => !selectedNodeIds.includes(id)).map((id) => runtimeNodes[id]).filter(Boolean) || [];
            const allowedDropTargets = Object.values(runtimeNodes).filter((node) => {
                if (!node?.layout || node.layout.mode === 'none') return false;
                if (selectedNodeIds.includes(node.id)) return false;
                return !isDescendant(node.id, new Set(selectedNodeIds), runtimeNodes);
            });

            const session = new MoveSession({
                nodeIds: selectedNodeIds,
                nodes: selectedNodes,
                siblings,
                startPointer,
                context: {
                    autoLayout: isAuto,
                    isAutoLayoutChild: isAuto,
                    parentId,
                    parentChildren: parent?.children || [],
                    layoutMode: parent?.layout?.mode || 'auto-y',
                    container: parent,
                    children: orderedChildren,
                    sourceParentId: parentId,
                    sourceLayoutMode: parent?.layout?.mode || 'none',
                    allowedDropTargets,
                },
            });

            sessionManager.startSession(session, e);
        }

        function onPointerMove(e) {
            if (activePointerRef.current == null) return;
            sessionManager.updateSession(e);
        }

        function onPointerUp(e) {
            if (activePointerRef.current == null) return;

            try {
                sessionManager.commitSession();
            } finally {
                el.releasePointerCapture(activePointerRef.current);
                activePointerRef.current = null;
            }
        }

        function onPointerCancel() {
            activePointerRef.current = null;
            sessionManager.cancelSession();
        }

        el.addEventListener('pointerdown', onPointerDown);
        el.addEventListener('pointermove', onPointerMove);
        el.addEventListener('pointerup', onPointerUp);
        el.addEventListener('pointercancel', onPointerCancel);

        return () => {
            el.removeEventListener('pointerdown', onPointerDown);
            el.removeEventListener('pointermove', onPointerMove);
            el.removeEventListener('pointerup', onPointerUp);
            el.removeEventListener('pointercancel', onPointerCancel);
        };
    }, [selectedNodeIds]);

    return (
        <div ref={canvasRef} className='relative w-full h-full overflow-hidden touch-none'>
            {children}
        </div>
    );
}
