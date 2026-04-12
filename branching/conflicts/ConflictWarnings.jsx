'use client';

// branching/conflicts/ConflictWarnings.jsx

import React from 'react';
import { getRuntimeState } from '@/runtime/state/runtimeState';
import { detectBranchConflicts } from './detectBranchConflicts';

/**
 * Read-only conflict warnings.
 *
 * 🔒 No mutation
 * 🔒 No auto-resolution
 */
export default function ConflictWarnings() {
    const state = getRuntimeState();
    const doc = state?.document;

    if (!doc) return null;

    const conflicts = detectBranchConflicts(doc.branches);

    if (conflicts.length === 0) return null;

    return (
        <div
            style={{
                padding: 8,
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.5)',
                borderRadius: 6,
                color: '#fff',
                fontSize: 12,
                marginBottom: 8,
            }}
        >
            <strong>⚠ Branch Conflicts Detected</strong>

            {conflicts.map((c, i) => (
                <div key={i} style={{ marginTop: 6 }}>
                    <div>
                        Branches <strong>{c.branchA}</strong> and <strong>{c.branchB}</strong> diverged from{' '}
                        <strong>{c.base}</strong>
                    </div>
                    <div style={{ opacity: 0.7, fontSize: 11 }}>
                        {c.onlyA.length} unique event(s) in {c.branchA}, {c.onlyB.length} in {c.branchB}
                    </div>
                </div>
            ))}
        </div>
    );
}
