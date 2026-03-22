import { canvasBus } from '../eventBus/canvasBus.js';
import {
    clearSelection,
    selectNode,
    setSelection,
    toggleNode,
} from './selectionRuntimeFacade.js';

let registered = false;

export function registerSelectionIntentBridge(dispatcher) {
    if (registered) return () => {};
    registered = true;

    const dispatch = dispatcher?.dispatch ?? dispatcher;

    const onSelect = (payload) => {
        const nodeId = payload?.nodeId ?? null;
        if (!nodeId || typeof dispatch !== 'function') return;
        dispatch(selectNode(nodeId));
    };

    const onToggle = (payload) => {
        const nodeId = payload?.nodeId ?? null;
        if (!nodeId || typeof dispatch !== 'function') return;
        dispatch(toggleNode(nodeId));
    };

    const onSet = (payload) => {
        const ids = Array.isArray(payload?.ids) ? payload.ids : [];
        if (typeof dispatch !== 'function') return;
        dispatch(setSelection(ids, payload?.primary ?? null));
    };

    const onClear = () => {
        if (typeof dispatch !== 'function') return;
        dispatch(clearSelection());
    };

    canvasBus.on('intent.selection.select', onSelect);
    canvasBus.on('intent.selection.toggle', onToggle);
    canvasBus.on('intent.selection.set', onSet);
    canvasBus.on('intent.selection.clear', onClear);

    return () => {
        canvasBus.off('intent.selection.select', onSelect);
        canvasBus.off('intent.selection.toggle', onToggle);
        canvasBus.off('intent.selection.set', onSet);
        canvasBus.off('intent.selection.clear', onClear);
        registered = false;
    };
}
