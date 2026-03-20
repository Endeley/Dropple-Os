'use client';

import { GRAPH_NODE_LIBRARY } from './graphNodeCatalog.js';

function panelStyle() {
    return {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: 188,
        padding: 12,
        borderRight: '1px solid rgba(148, 163, 184, 0.12)',
        background: 'rgba(2, 6, 23, 0.3)',
    };
}

export function GraphNodeCreationPanel({ disabled = false, onCreateNode }) {
    return (
        <aside style={panelStyle()}>
            <div>
                <div
                    style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#93c5fd',
                    }}>
                    Node Library
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>
                    Add nodes to the active graph through the dispatcher-backed authoring path.
                </div>
            </div>
            <div style={{ display: 'grid', gap: 8, overflowY: 'auto' }}>
                {GRAPH_NODE_LIBRARY.map((entry) => (
                    <button
                        key={entry.type}
                        type='button'
                        disabled={disabled}
                        onClick={() => onCreateNode?.(entry.type)}
                        style={{
                            textAlign: 'left',
                            padding: '10px 12px',
                            borderRadius: 12,
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            background: disabled
                                ? 'rgba(15, 23, 42, 0.42)'
                                : 'rgba(15, 23, 42, 0.72)',
                            color: disabled ? '#64748b' : '#e2e8f0',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                        }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{entry.label}</div>
                        <div style={{ marginTop: 4, fontSize: 11, color: disabled ? '#64748b' : '#94a3b8' }}>
                            {entry.summary}
                        </div>
                    </button>
                ))}
            </div>
        </aside>
    );
}
