import { downloadText } from './utils/download';

export function exportJSON({ nodes = {}, events = [], cursor = { index: -1 } } = {}) {
    const doc = {
        version: 1,
        exportedAt: Date.now(),
        nodes,
        events,
        cursor,
    };

    downloadText(JSON.stringify(doc, null, 2), 'dropple-export.json', 'application/json');
}
