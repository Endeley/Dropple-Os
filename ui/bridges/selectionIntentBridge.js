import { canvasBus } from '../eventBus/canvasBus.js';
import {
    clearSelection,
    selectNode,
    setSelection,
    toggleNode,
} from './selectionRuntimeFacade.js';

let registered = false;
let activeDispatch = null;
let activeRegistrations = 0;

export function registerSelectionIntentBridge(dispatcher) {
    activeDispatch = dispatcher?.dispatch ?? dispatcher ?? null;
    activeRegistrations += 1;

    const onSelect = (payload) => {
        const nodeId = payload?.nodeId ?? null;
        if (!nodeId || typeof activeDispatch !== 'function') return;
        activeDispatch(selectNode(nodeId));
    };

    const onToggle = (payload) => {
        const nodeId = payload?.nodeId ?? null;
        if (!nodeId || typeof activeDispatch !== 'function') return;
        activeDispatch(toggleNode(nodeId));
    };

    const onSet = (payload) => {
        const ids = Array.isArray(payload?.ids) ? payload.ids : [];
        if (typeof activeDispatch !== 'function') return;
        activeDispatch(setSelection(ids, payload?.primary ?? null));
    };

    const onClear = () => {
        if (typeof activeDispatch !== 'function') return;
        activeDispatch(clearSelection());
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
            activeDispatch = null;
            registered = false;
        }
    };
}
