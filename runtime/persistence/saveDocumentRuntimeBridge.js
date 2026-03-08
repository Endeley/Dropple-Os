import { getRuntimeState } from '@/runtime/state/runtimeState';
import { useSaveCurrentDocument } from '@/runtime/persistence/saveCurrentDocument.js';

export function useSaveDocumentRuntimeBridge() {
    const saveCurrentDocument = useSaveCurrentDocument();

    return async function saveDocumentFromRuntime() {
        const snapshot = getRuntimeState();
        return saveCurrentDocument(snapshot);
    };
}
