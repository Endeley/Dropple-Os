import { canvasBus } from '../eventBus/canvasBus.js';
import {
    clearSelection,
    selectNode,
    setSelection,
    toggleNode,
} from './selectionRuntimeFacade.js';
import { resolveSelectableGroupTarget } from '@/runtime/grouping/resolveSelectableGroupTarget.js';

let registered = false;
let activeDispatcher = null;
let activeRegistrations = 0;

export function registerSelectionIntentBridge(dispatcher) {
    activeDispatcher = dispatcher ?? null;
    activeRegistrations += 1;

    const resolveNodeId = (nodeId) => {
        if (!nodeId) return null;

        const state =
            typeof activeDispatcher?.getState === 'function'
                ? activeDispatcher.getState()
                : null;
        const nodesById =
            state?.document?.sceneGraph?.nodes ??
            state?.nodes ??
            null;

        return resolveSelectableGroupTarget(nodesById, nodeId);
    };

    const onSelect = (payload) => {
        const nodeId = resolveNodeId(payload?.nodeId ?? null);
        if (!nodeId || typeof activeDispatcher?.dispatch !== 'function') return;
        activeDispatcher.dispatch(selectNode(nodeId));
    };

    const onToggle = (payload) => {
        const nodeId = resolveNodeId(payload?.nodeId ?? null);
        if (!nodeId || typeof activeDispatcher?.dispatch !== 'function') return;
        activeDispatcher.dispatch(toggleNode(nodeId));
    };

    const onSet = (payload) => {
        const ids = Array.isArray(payload?.ids) ? payload.ids : [];
        if (typeof activeDispatcher?.dispatch !== 'function') return;
        activeDispatcher.dispatch(setSelection(ids, payload?.primary ?? null));
    };

    const onClear = () => {
        if (typeof activeDispatcher?.dispatch !== 'function') return;
        activeDispatcher.dispatch(clearSelection());
    };

    if (!registered) {
        canvasBus.on('intent.selection.select', onSelect);
        canvasBus.on('intent.selection.toggle', onToggle);
        canvasBus.on('intent.selection.set', onSet);
        canvasBus.on('intent.selection.clear', onClear);
        registered = true;
    }

    return () => {
        activeRegistrations = Math.max(0, activeRegistrations - 1);
        if (activeRegistrations === 0) {
            canvasBus.off('intent.selection.select', onSelect);
            canvasBus.off('intent.selection.toggle', onToggle);
            canvasBus.off('intent.selection.set', onSet);
            canvasBus.off('intent.selection.clear', onClear);
            activeDispatcher = null;
            registered = false;
        }
    };
}
