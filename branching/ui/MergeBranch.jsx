'use client';

// branching/ui/MergeBranch.jsx

import React, { useState } from 'react';
import { useBranchState } from './useBranchState';
import { getRuntimeState, setRuntimeState } from '@/runtime/state/runtimeState';
import { syncRuntimeToZustand } from '@/runtime/bridge/zustandBridge';

/**
 * Merge Branch UI (explicit + guarded).
 *
 * 🔒 Rules:
 * - Target = current branch
 * - Source = user-selected branch
 * - Linear event append only
 * - No auto-conflict resolution
 */
export default function MergeBranch() {
    const { currentBranch, branches } = useBranchState();
    const [sourceBranchId, setSourceBranchId] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleMerge = () => {
        setError(null);
        setSuccess(null);

        if (!sourceBranchId) {
            setError('Select a source branch');
            return;
        }

        if (sourceBranchId === currentBranch) {
            setError('Cannot merge a branch into itself');
            return;
        }

        const state = getRuntimeState();
        const doc = state?.document;
        if (!doc) {
            setError('No active document');
            return;
        }

        const target = doc.branches[currentBranch];
        const source = doc.branches[sourceBranchId];

        if (!target || !source) {
            setError('Invalid branch selection');
            return;
        }

        // 🔒 Build set of existing event IDs in target
        const existingIds = new Set(target.events.map((e) => e.id));

        // 🔒 Select only new events from source
        const incomingEvents = source.events.filter((e) => !existingIds.has(e.id));

        if (incomingEvents.length === 0) {
            setSuccess('Nothing to merge (branches already aligned)');
            return;
        }

        // 🔒 Append events deterministically
        const nextDoc = {
            ...doc,
            branches: {
                ...doc.branches,
                [currentBranch]: {
                    ...target,
                    events: [...target.events, ...incomingEvents],
                    head: incomingEvents[incomingEvents.length - 1]?.id ?? target.head,
                },
            },
        };

        const nextState = {
            ...state,
            document: nextDoc,
        };

        setRuntimeState(nextState);
        syncRuntimeToZustand(nextState);

        setSuccess(`Merged ${incomingEvents.length} event(s) from "${sourceBranchId}"`);
        setSourceBranchId('');
    };

    return (
        <div
            style={{
                padding: 8,
                background: 'rgba(0,0,0,0.35)',
                color: '#fff',
                fontSize: 12,
                borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            <div style={{ marginBottom: 6, opacity: 0.7 }}>
                Merge into <strong>{currentBranch}</strong>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <select value={sourceBranchId} onChange={(e) => setSourceBranchId(e.target.value)} style={selectStyle}>
                    <option value="">Select source branch</option>
                    {branches
                        .filter((b) => b.id !== currentBranch)
                        .map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.id}
                            </option>
                        ))}
                </select>

                <button onClick={handleMerge} style={buttonStyle}>
                    Merge
                </button>
            </div>

            {error && <div style={{ color: '#f87171', marginTop: 4 }}>{error}</div>}

            {success && <div style={{ color: '#4ade80', marginTop: 4 }}>{success}</div>}
        </div>
    );
}

const selectStyle = {
    flex: 1,
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    borderRadius: 4,
    padding: '4px 6px',
};

const buttonStyle = {
    background: 'rgba(34,197,94,0.5)',
    border: '1px solid rgba(34,197,94,0.8)',
    color: '#fff',
    borderRadius: 4,
    padding: '4px 10px',
    cursor: 'pointer',
};
