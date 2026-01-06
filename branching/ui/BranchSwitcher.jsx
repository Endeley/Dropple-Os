'use client';

// branching/ui/BranchSwitcher.jsx

import React from 'react';
import { useBranchState } from './useBranchState';
import { replayBranch } from '@/persistence/replay';
import { resetRuntimeState, setRuntimeState } from '@/runtime/state/runtimeState';
import { syncRuntimeToZustand } from '@/runtime/bridge/zustandBridge';

/**
 * Branch Switcher UI.
 *
 * 🔒 Rules:
 * - Explicit switch only
 * - Deterministic replay
 * - Undo/redo stack resets
 */
export default function BranchSwitcher({ dispatcher }) {
    if (!dispatcher) {
        throw new Error('BranchSwitcher: dispatcher is required');
    }

    const { currentBranch, branches } = useBranchState();

    const handleSwitch = (branchId) => {
        if (branchId === currentBranch) return;

        const state = dispatcher.getState();
        const doc = state?.document;
        if (!doc) return;

        const branch = doc.branches[branchId];
        if (!branch) return;

        // 🔒 Reset runtime + history
        dispatcher.reset();

        // Replay branch deterministically
        const nextState = replayBranch(branch, undefined);

        // Attach document + current branch
        const hydrated = {
            ...nextState,
            document: {
                ...doc,
                currentBranch: branchId,
            },
        };

        setRuntimeState(hydrated);
        syncRuntimeToZustand(hydrated);
    };

    return (
        <div
            style={{
                padding: 8,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.4)',
                color: '#fff',
                fontSize: 12,
            }}
        >
            <div style={{ marginBottom: 6, opacity: 0.7 }}>Branches</div>

            {branches.map((b) => (
                <div
                    key={b.id}
                    onClick={() => handleSwitch(b.id)}
                    style={{
                        padding: '4px 6px',
                        marginBottom: 2,
                        cursor: b.id === currentBranch ? 'default' : 'pointer',
                        borderRadius: 4,
                        background: b.id === currentBranch ? 'rgba(59,130,246,0.35)' : 'transparent',
                        opacity: b.id === currentBranch ? 1 : 0.7,
                    }}
                >
                    <strong>{b.id}</strong>
                    {b.base && <span style={{ opacity: 0.6 }}> ← {b.base}</span>}
                    <span style={{ float: 'right', opacity: 0.5 }}>{b.eventCount}</span>
                </div>
            ))}
        </div>
    );
}
