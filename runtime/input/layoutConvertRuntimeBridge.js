import { nanoid } from 'nanoid';
import { EventTypes } from '../../core/events/eventTypes.js';

function normalizeLayout(value) {
    const raw = String(value || '').toLowerCase();
    if (raw === 'row' || raw === 'column' || raw === 'grid') return raw;
    return null;
}

export function createLayoutConvertEvent(intent) {
    if (!intent) return null;

    const layout = normalizeLayout(intent.layout);
    const nodeIds = Array.isArray(intent.nodeIds) ? intent.nodeIds.filter(Boolean) : [];
    if (!layout || nodeIds.length < 2) return null;

    const containerId = intent.containerId || `layout-${nanoid()}`;

    return {
        type: EventTypes.LAYOUT_CONVERT,
        payload: {
            layout,
            nodeIds,
            containerId,
            options: intent.options || {},
            columns: intent.columns,
            rows: intent.rows,
        },
    };
}
