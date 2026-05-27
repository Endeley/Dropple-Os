'use client';

import { useEffect } from 'react';
import { useSelection } from '@/ui/workspace/shared/SelectionContext';
import { CapabilityActions } from '@/ui/capabilities/capabilityActions';

export function dispatchAlignmentShortcutIntent({ key, shiftKey = false, selectedIds, emit }) {
    const selected = Array.isArray(selectedIds) && selectedIds.length > 1 ? selectedIds : null;
    if (!selected || selected.length < 2) return false;

    const canDistribute = selected.length >= 3;
    if (shiftKey && (key === 'ArrowUp' || key === 'ArrowDown') && !canDistribute) {
        return true;
    }
    if (shiftKey && canDistribute) {
        switch (key) {
            case 'ArrowLeft':
            case 'ArrowRight':
                CapabilityActions.distributeX(selected, emit);
                return true;
            case 'ArrowUp':
            case 'ArrowDown':
                CapabilityActions.distributeY(selected, emit);
                return true;
            default:
                break;
        }
    }

    switch (key) {
        case 'ArrowLeft':
            CapabilityActions.alignLeft(selected, emit);
            return true;
        case 'ArrowRight':
            if (shiftKey) {
                CapabilityActions.alignCenterX(selected, emit);
                return true;
            }
            CapabilityActions.alignRight(selected, emit);
            return true;
        case 'ArrowUp':
            if (shiftKey) {
                CapabilityActions.alignCenterY(selected, emit);
                return true;
            }
            CapabilityActions.alignTop(selected, emit);
            return true;
        case 'ArrowDown':
            CapabilityActions.alignBottom(selected, emit);
            return true;
        default:
            return false;
    }
}

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

        function resolveEffectiveSelectionIds() {
            const runtimeState = globalThis.__droppleDispatcher?.getState?.();
            const ids = runtimeState?.selection?.ids;
            const runtimeSelectionIds = ids instanceof Set ? Array.from(ids) : Array.isArray(ids) ? ids : [];
            return runtimeSelectionIds.length >= selectedIds.size ? runtimeSelectionIds : Array.from(selectedIds);
        }

        function onKeyDown(e) {
            const tag = e.target?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) {
                return;
            }

            const mod = e.metaKey === true || e.ctrlKey === true;
            if (!mod) return;
            const handled = dispatchAlignmentShortcutIntent({
                key: e.key,
                shiftKey: e.shiftKey === true,
                selectedIds: resolveEffectiveSelectionIds(),
                emit,
            });
            if (!handled) return;
            e.preventDefault();
        }

        globalThis.__droppleTestDispatchAlignmentShortcut = ({ key, shiftKey = false, nodeIds = null }) => {
            const selectedForDispatch = Array.isArray(nodeIds) && nodeIds.length > 0 ? nodeIds : resolveEffectiveSelectionIds();
            return dispatchAlignmentShortcutIntent({
                key,
                shiftKey,
                selectedIds: selectedForDispatch,
                emit,
            });
        };

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            delete globalThis.__droppleTestDispatchAlignmentShortcut;
        };
    }, [enabled, selectedIds, emit, getState]);
}
