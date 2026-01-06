'use client';

// branching/merge/MergePreview.jsx

import React, { useState } from 'react';
import { getRuntimeState } from '@/runtime/state/runtimeState';
import { computeMergeDiff } from './computeMergeDiff';
import { planMerge } from './planMerge';
import { applyMerge } from './applyMerge';
import { simulateMergeState } from './simulateMergeState';
import { computeNodeDiff } from './computeNodeDiff';
import VisualNodeDiffOverlay from './VisualNodeDiffOverlay';
import { dispatcher } from '@/ui/interaction/dispatcher.js';
import { generateExportPair } from '@/export/generateExportPair';
import { diffLines } from '@/export/diffLines';
import ExportDiffViewer from '@/export/ExportDiffViewer';

export default function MergePreview() {
    const state = getRuntimeState();
    const doc = state?.document;

    const [sourceBranchId, setSourceBranchId] = useState('');
    const [applied, setApplied] = useState(false);

    if (!doc) return null;

    const targetBranch = doc.branches[doc.currentBranch];
    const sourceBranch = sourceBranchId ? doc.branches[sourceBranchId] : null;

    const diff = sourceBranch
        ? computeMergeDiff({
              targetBranch,
              sourceBranch,
          })
        : null;

    const mergePlan = sourceBranch && targetBranch ? planMerge({ targetBranch, sourceBranch }) : [];

    const runtimeState = state;
    const simulatedState =
        diff && mergePlan.length
            ? simulateMergeState({
                  baseState: runtimeState,
                  events: mergePlan,
              })
            : null;

    const nodeDiffs =
        simulatedState && runtimeState
            ? computeNodeDiff({
                  before: runtimeState,
                  after: simulatedState,
              })
            : [];

    const exportPair =
        simulatedState &&
        generateExportPair({
            beforeState: runtimeState,
            afterState: simulatedState,
            format: 'css',
        });

    const exportDiff = exportPair ? diffLines(exportPair.before, exportPair.after) : null;

    const onApplyMerge = () => {
        if (!mergePlan.length) return;

        applyMerge({
            dispatcher,
            events: mergePlan,
        });

        setApplied(true);
    };

    return (
        <>
            {nodeDiffs.length > 0 && <VisualNodeDiffOverlay diffs={nodeDiffs} />}
            <div style={panelStyle}>
                <div style={{ opacity: 0.7, marginBottom: 6 }}>
                    Merge Preview → <strong>{doc.currentBranch}</strong>
                </div>

            <select
                value={sourceBranchId}
                onChange={(e) => {
                    setSourceBranchId(e.target.value);
                    setApplied(false);
                }}
                style={selectStyle}
            >
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
                            Affected nodes: {diff.affectedNodeIds.length ? diff.affectedNodeIds.join(', ') : 'none'}
                        </div>

                        <button
                            onClick={onApplyMerge}
                            disabled={applied || mergePlan.length === 0}
                            style={{
                                marginTop: 10,
                                padding: '6px 10px',
                                borderRadius: 4,
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: applied ? 'rgba(34,197,94,0.25)' : 'rgba(59,130,246,0.25)',
                                color: '#fff',
                                cursor: applied ? 'default' : 'pointer',
                            }}
                        >
                            {applied ? 'Merged ✓' : 'Apply Merge'}
                        </button>

                        <div style={eventListStyle}>
                            {mergePlan.map((e) => (
                                <div key={e.id} style={{ opacity: 0.7 }}>
                                    {e.type} ({e.id})
                                </div>
                            ))}
                        </div>

                        {exportDiff && exportDiff.length > 0 && (
                            <>
                                <div style={{ marginTop: 12, opacity: 0.7 }}>Export Diff (CSS)</div>
                                <ExportDiffViewer diff={exportDiff} />
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

const panelStyle = {
    padding: 8,
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    color: '#fff',
    fontSize: 12,
};

const selectStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    borderRadius: 4,
    padding: '4px 6px',
};

const eventListStyle = {
    marginTop: 8,
    maxHeight: 120,
    overflow: 'auto',
    fontSize: 11,
    background: 'rgba(0,0,0,0.2)',
    padding: 4,
    borderRadius: 4,
};
