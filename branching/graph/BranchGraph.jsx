'use client';

// branching/graph/BranchGraph.jsx

import React from 'react';
import { buildBranchGraph } from './buildBranchGraph';
import { useBranchState } from '@/branching/ui/useBranchState';
import { replayBranch } from '@/persistence/replay';
import { setRuntimeState } from '@/runtime/state/runtimeState';
import { syncRuntimeToZustand } from '@/runtime/bridge/zustandBridge';

/**
 * SVG-based Branch Graph UI.
 *
 * 🔒 Rules:
 * - Visual only
 * - Deterministic layout
 * - Explicit branch switching
 */
export default function BranchGraph({ dispatcher, width = 600, height = 300 }) {
    if (!dispatcher) {
        throw new Error('BranchGraph: dispatcher is required');
    }

    const { currentBranch, branches } = useBranchState();

    // Build graph model from branch map
    const branchMap = {};
    for (const b of branches) {
        branchMap[b.id] = { base: b.base };
    }

    const { nodes, edges } = buildBranchGraph(branchMap);

    const handleSwitch = (branchId) => {
        if (branchId === currentBranch) return;

        const state = dispatcher.getState();
        const doc = state?.document;
        if (!doc) return;

        const branch = doc.branches[branchId];
        if (!branch) return;

        dispatcher.reset();

        const nextState = replayBranch(branch, undefined);

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
        <svg
            width={width}
            height={height}
            style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 6,
            }}
        >
            {/* Edges */}
            {edges.map((e) => {
                const from = nodes.find((n) => n.id === e.from);
                const to = nodes.find((n) => n.id === e.to);
                if (!from || !to) return null;

                return (
                    <line
                        key={`${e.from}-${e.to}`}
                        x1={from.x + 60}
                        y1={from.y + 20}
                        x2={to.x}
                        y2={to.y + 20}
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth={1}
                    />
                );
            })}

            {/* Nodes */}
            {nodes.map((n) => {
                const isCurrent = n.id === currentBranch;

                return (
                    <g
                        key={n.id}
                        transform={`translate(${n.x}, ${n.y})`}
                        onClick={() => handleSwitch(n.id)}
                        style={{ cursor: isCurrent ? 'default' : 'pointer' }}
                    >
                        <rect
                            width={120}
                            height={40}
                            rx={6}
                            ry={6}
                            fill={isCurrent ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.15)'}
                            stroke={isCurrent ? 'rgba(59,130,246,0.9)' : 'rgba(255,255,255,0.3)'}
                        />
                        <text x={60} y={24} textAnchor="middle" fill="#fff" fontSize={12}>
                            {n.id}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
