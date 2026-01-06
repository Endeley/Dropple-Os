'use client';

// branching/ui/CreateBranch.jsx

import React, { useState } from 'react';
import { getRuntimeState, setRuntimeState } from '@/runtime/state/runtimeState';
import { syncRuntimeToZustand } from '@/runtime/bridge/zustandBridge';

/**
 * Create Branch UI.
 *
 * 🔒 Rules:
 * - Explicit user action
 * - Forks from current branch
 * - No auto-switch
 * - No persistence write
 */
export default function CreateBranch() {
    const [name, setName] = useState('');
    const [error, setError] = useState(null);

    const handleCreate = () => {
        setError(null);

        const branchId = name.trim();
        if (!branchId) {
            setError('Branch name is required');
            return;
        }

        const state = getRuntimeState();
        const doc = state?.document;
        if (!doc) {
            setError('No active document');
            return;
        }

        if (doc.branches[branchId]) {
            setError(`Branch "${branchId}" already exists`);
            return;
        }

        const currentId = doc.currentBranch;
        const currentBranch = doc.branches[currentId];
        if (!currentBranch) {
            setError('Current branch not found');
            return;
        }

        // 🔒 Fork branch deterministically
        const nextDoc = {
            ...doc,
            branches: {
                ...doc.branches,
                [branchId]: {
                    base: currentId,
                    events: [...currentBranch.events],
                    head: currentBranch.head,
                    checkpoints: [...currentBranch.checkpoints],
                },
            },
        };

        const nextState = {
            ...state,
            document: nextDoc,
        };

        setRuntimeState(nextState);
        syncRuntimeToZustand(nextState);

        setName('');
    };

    return (
        <div
            style={{
                padding: 8,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.35)',
                color: '#fff',
                fontSize: 12,
            }}
        >
            <div style={{ marginBottom: 6, opacity: 0.7 }}>Create Branch</div>

            <div style={{ display: 'flex', gap: 6 }}>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="branch-name"
                    style={inputStyle}
                />
                <button onClick={handleCreate} style={buttonStyle}>
                    Create
                </button>
            </div>

            {error && (
                <div style={{ marginTop: 6, color: '#f87171' }}>
                    {error}
                </div>
            )}
        </div>
    );
}

const inputStyle = {
    flex: 1,
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    borderRadius: 4,
    padding: '4px 6px',
};

const buttonStyle = {
    background: 'rgba(59,130,246,0.5)',
    border: '1px solid rgba(59,130,246,0.8)',
    color: '#fff',
    borderRadius: 4,
    padding: '4px 10px',
    cursor: 'pointer',
};
