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

            const runtimeSelectionIds = (() => {
                const runtimeState = globalThis.__droppleDispatcher?.getState?.();
                const ids = runtimeState?.selection?.ids;
                if (ids instanceof Set) return Array.from(ids);
                if (Array.isArray(ids)) return ids;
                return [];
            })();
            const effectiveSelectedIds =
                runtimeSelectionIds.length >= selectedIds.size
                    ? runtimeSelectionIds
                    : Array.from(selectedIds);

            const selected = effectiveSelectedIds.length > 1 ? effectiveSelectedIds : null;
            if (!selected || selected.length < 2) return;

            const canDistribute = selected.length >= 3;
            if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && !canDistribute) {
                e.preventDefault();
                return;
            }
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
