import { canvasBus } from '../eventBus/canvasBus.js';

export function layoutConvertIntent({
    layout,
    nodeIds,
    columns,
    rows,
    options,
    source,
} = {}) {
    const ids = Array.isArray(nodeIds) ? nodeIds.filter(Boolean) : [];
    if (!layout || ids.length < 2) return null;

    canvasBus.emit('intent.edit.begin', {
        type: 'layout.convert',
        ids,
        source: source || 'layout.suggestion',
    });

    canvasBus.emit('intent.layout.convert', {
        layout,
        nodeIds: ids,
        columns,
        rows,
        options,
        source: source || 'layout.suggestion',
    });

    canvasBus.emit('intent.edit.commit', {
        type: 'layout.convert',
        ids,
        source: source || 'layout.suggestion',
    });

    return ids;
}
