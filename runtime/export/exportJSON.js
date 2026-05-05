import { downloadText } from './utils/download.js';
import { getNodes } from '@/runtime/document/documentAdapter.js';

export function buildJSONExportDocument(snapshot) {
    const nodes = getNodes(snapshot);
    const events = Array.isArray(snapshot?.events) ? snapshot.events : [];
    const cursorIndex = Number.isFinite(snapshot?.cursorIndex) ? snapshot.cursorIndex : -1;

    return {
        version: 1,
        nodes,
        events,
        cursor: { index: cursorIndex },
    };
}

export function exportJSON({ snapshot, filename = 'dropple-export.json' } = {}) {
    if (!snapshot || typeof snapshot !== 'object') {
        throw new Error('exportJSON requires snapshot.');
    }

    const doc = {
        ...buildJSONExportDocument(snapshot),
    };

    downloadText(JSON.stringify(doc, null, 2), filename, 'application/json');
    return doc;
}
