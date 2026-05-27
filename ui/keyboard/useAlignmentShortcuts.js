'use client';

import { useEffect } from 'react';
import { useSelection } from '@/ui/workspace/shared/SelectionContext';
import { CapabilityActions } from '@/ui/capabilities/capabilityActions';

export function useAlignmentShortcuts({
    enabled = true,
    emit,
    getState,
    selectedIds: selectedIdsOverride = null,
}) {
    const selectionContext = useSelection();
    const selectedIdsRaw = selectedIdsOverride ?? selectionContext?.selectedIds ?? null;
    const selectedIds =
        selectedIdsRaw instanceof Set
            ? selectedIdsRaw
            : selectedIdsRaw
                ? new Set(selectedIdsRaw)
                : new Set();

    useEffect(() => {
        if (!enabled) return;

        function onKeyDown(e) {
            const tag = e.target?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) {
                return;
            }

            const mod = e.metaKey === true || e.ctrlKey === true;
            if (!mod) return;

            const selected = selectedIds.size > 1 ? Array.from(selectedIds) : null;
            if (!selected || selected.length < 2) return;

            const canDistribute = selected.length >= 3;
            if (e.shiftKey && canDistribute) {
                switch (e.key) {
                    case 'ArrowLeft':
                    case 'ArrowRight':
                        CapabilityActions.distributeX(selected, emit);
                        e.preventDefault();
                        return;
                    case 'ArrowUp':
                    case 'ArrowDown':
                        CapabilityActions.distributeY(selected, emit);
                        e.preventDefault();
                        return;
                    default:
                        break;
                }
            }

            switch (e.key) {
                case 'ArrowLeft':
                    CapabilityActions.alignLeft(selected, emit);
                    break;
                case 'ArrowRight':
                    if (e.shiftKey) {
                        CapabilityActions.alignCenterX(selected, emit);
                        break;
                    }
                    CapabilityActions.alignRight(selected, emit);
                    break;
                case 'ArrowUp':
                    if (e.shiftKey) {
                        CapabilityActions.alignCenterY(selected, emit);
                        break;
                    }
                    CapabilityActions.alignTop(selected, emit);
                    break;
                case 'ArrowDown':
                    CapabilityActions.alignBottom(selected, emit);
                    break;
                default:
                    return;
            }

            e.preventDefault();
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [enabled, selectedIds, emit, getState]);
}
