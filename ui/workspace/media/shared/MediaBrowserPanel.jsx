'use client';

import { useMemo } from 'react';
import {
    projectMediaAssets,
    selectMediaAssets,
    useWorkspaceProjectionState as useRuntimeStore,
} from '@/runtime/projection';

function cardStyle() {
    return {
        borderRadius: 14,
        border: '1px solid rgba(148, 163, 184, 0.35)',
        background: 'rgba(248, 250, 252, 0.92)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 14px 34px rgba(15, 23, 42, 0.12)',
        padding: '12px 14px',
    };
}

export function MediaBrowserPanel({ mode }) {
    const assetState = useRuntimeStore(selectMediaAssets);
    const assets = useMemo(() => projectMediaAssets(assetState), [assetState]);
    const assetLabel = assets.length === 1 ? 'asset' : 'assets';

    return (
        <div style={cardStyle()}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#475569' }}>
                Browser
            </div>
            <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, marginTop: 4 }}>
                {mode.label} workspace assets and project structure
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                {mode.summary}
            </div>
            <div style={{ marginTop: 12 }}>
                {[
                    ['Scenes', 'shared'],
                    ['Assets', `${assets.length} ${assetLabel}`],
                    ['Exports', mode.exportFormats.join(', ')],
                ].map(([section, value]) => (
                    <div
                        key={section}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            borderTop: section === 'Scenes' ? '1px solid transparent' : '1px solid #e2e8f0',
                            fontSize: 12,
                        }}>
                        <span style={{ color: '#334155', fontWeight: 600 }}>{section}</span>
                        <span style={{ color: '#94a3b8' }}>{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
