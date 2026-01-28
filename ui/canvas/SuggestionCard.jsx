'use client';

const PRIORITY_ORDER = {
    high: 0,
    medium: 1,
    low: 2,
};

const KIND_LABELS = {
    ALIGN_ELEMENTS: 'Alignment',
    DENSITY_NOTICE: 'Density',
    EMPTY_VIEWPORT: 'Sparse View',
    SNAP_AVAILABLE: 'Snap Available',
    VALIDATION_ERROR: 'UX Error',
    VALIDATION_WARNING: 'UX Warning',
    VALIDATION_INFO: 'UX Notice',
};

export function SuggestionCard({ suggestion }) {
    if (!suggestion) return null;
    const title = KIND_LABELS[suggestion.kind] ?? suggestion.kind;
    const priority = suggestion.priority ?? 'low';
    const nodeCount = suggestion.context?.nodeIds?.length ?? 0;
    const hasRegion = Boolean(suggestion.context?.region);

    return (
        <div
            style={{
                border: '1px solid rgba(226,232,240,0.15)',
                borderRadius: 8,
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.55)',
                display: 'grid',
                gap: 6,
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
                    {title}
                </div>
                <span
                    style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 999,
                        border: '1px solid rgba(226,232,240,0.2)',
                        color: '#e2e8f0',
                        textTransform: 'uppercase',
                        letterSpacing: 0.6,
                    }}
                >
                    {priority}
                </span>
            </div>
            <div style={{ fontSize: 12, color: '#cbd5f5' }}>{suggestion.message}</div>
            <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#94a3b8' }}>
                {nodeCount > 0 && <span>nodes: {nodeCount}</span>}
                {hasRegion && <span>region: yes</span>}
                {nodeCount === 0 && !hasRegion && <span>context: none</span>}
            </div>
        </div>
    );
}

export function sortSuggestions(list = []) {
    return [...list].sort((a, b) => {
        const aOrder = PRIORITY_ORDER[a.priority] ?? 3;
        const bOrder = PRIORITY_ORDER[b.priority] ?? 3;
        if (aOrder !== bOrder) return aOrder - bOrder;
        if (a.id === b.id) return 0;
        return a.id < b.id ? -1 : 1;
    });
}
