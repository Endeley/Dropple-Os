'use client';

// branching/merge/MergePreview.jsx

import React, { useState } from 'react';
import { getRuntimeState } from '@/runtime/state/runtimeState';
import { computeMergeDiff } from './computeMergeDiff';

/**
 * Visual merge preview (read-only).
 *
 * 🔒 No mutation
 * 🔒 No auto-merge
 */
export default function MergePreview() {
    const state = getRuntimeState();
    const doc = state?.document;

    const [sourceBranchId, setSourceBranchId] = useState('');

    if (!doc) return null;

    const targetBranch = doc.branches[doc.currentBranch];
    const sourceBranch = sourceBranchId ? doc.branches[sourceBranchId] : null;

    const diff = sourceBranch
        ? computeMergeDiff({
              targetBranch,
              sourceBranch,
          })
        : null;

    return (
        <div
            style={{
                padding: 8,
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 6,
                color: '#fff',
                fontSize: 12,
            }}
        >
            <div style={{ marginBottom: 6, opacity: 0.7 }}>
                Merge Preview (into <strong>{doc.currentBranch}</strong>)
            </div>

            <select value={sourceBranchId} onChange={(e) => setSourceBranchId(e.target.value)} style={selectStyle}>
                <option value="">Select source branch</option>
                {Object.keys(doc.branches)
                    .filter((id) => id !== doc.currentBranch)
                    .map((id) => (
                        <option key={id} value={id}>
                            {id}
                        </option>
                    ))}
            </select>

            {!diff && <div style={{ marginTop: 8, opacity: 0.6 }}>Select a branch to preview merge</div>}

            {diff && (
                <div style={{ marginTop: 8 }}>
                    <div>
                        <strong>{diff.eventCount}</strong> event(s) will be merged
                    </div>

                    <div style={{ marginTop: 4, opacity: 0.8 }}>
                        Affected nodes:{' '}
                        {diff.affectedNodeIds.length > 0 ? diff.affectedNodeIds.join(', ') : 'none'}
                    </div>

                    <div style={{ marginTop: 8 }}>
                        <div style={{ opacity: 0.7, marginBottom: 4 }}>Incoming events</div>

                        <div
                            style={{
                                maxHeight: 120,
                                overflow: 'auto',
                                fontSize: 11,
                                background: 'rgba(0,0,0,0.2)',
                                padding: 4,
                                borderRadius: 4,
                            }}
                        >
                            {diff.events.map((e) => (
                                <div key={e.id} style={{ opacity: 0.75, padding: '2px 0' }}>
                                    {e.type} ({e.id})
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const selectStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    borderRadius: 4,
    padding: '4px 6px',
};
