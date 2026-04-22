'use client';

import { Panel } from '@/ui/Panel';
import SubmissionInfoPanel from '@/review/panels/SubmissionInfoPanel';

import { useReplayState } from '@/runtime/replay/useReplayState';
import { useSelection } from '@/ui/workspace/shared/SelectionContext';
import { getNodes } from '@/runtime/document/documentAdapter.js';

import { useMemo, useCallback } from 'react';

/**
 * Build simple hierarchy (parent -> children)
 */
function buildNodeTree(nodes) {
    const map = {};
    const roots = [];

    Object.values(nodes).forEach((node) => {
        map[node.id] = { ...node, children: [] };
    });

    Object.values(map).forEach((node) => {
        if (node.parentId && map[node.parentId]) {
            map[node.parentId].children.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}

/**
 * Recursive node renderer
 */
function LayerItem({ node, depth, selectedIds, onSelect }) {
    const isSelected = selectedIds?.has(node.id);

    return (
        <>
            <div className={`layer-item ${isSelected ? 'selected' : ''}`} style={{ paddingLeft: depth * 12 }} onClick={(e) => onSelect(e, node.id)}>
                <span className='layer-name'>{node.name || node.type || 'Node'}</span>
            </div>

            {node.children?.map((child) => (
                <LayerItem key={child.id} node={child} depth={depth + 1} selectedIds={selectedIds} onSelect={onSelect} />
            ))}
        </>
    );
}

export default function LeftPanel({ panels = [], submission, events, cursor, workspaceId }) {
    const { selectedIds, setSelection } = useSelection();

    const state = useReplayState({ events, cursor });

    // ✅ stable nodes
    const nodes = useMemo(() => {
        return getNodes(state) || {};
    }, [state]);

    // ✅ single declaration (FIXED)
    const tree = useMemo(() => buildNodeTree(nodes), [nodes]);

    /**
     * Visibility
     */
    const showSubmission = panels.includes('SubmissionInfoPanel') && !!submission;

    const showLayers = workspaceId === 'design';

    const hasAnyPanel = showSubmission || showLayers;

    /**
     * Selection handler (supports multi-select)
     */
    const handleSelect = useCallback(
        (e, nodeId) => {
            if (e.shiftKey || e.metaKey || e.ctrlKey) {
                const next = new Set(selectedIds || []);
                if (next.has(nodeId)) next.delete(nodeId);
                else next.add(nodeId);
                setSelection(next);
            } else {
                setSelection(new Set([nodeId]));
            }
        },
        [selectedIds, setSelection],
    );

    return (
        <aside className='left-panel' aria-hidden={!hasAnyPanel}>
            {/* ----- DESIGN: LAYERS PANEL ----- */}
            {showLayers && (
                <Panel title='Layers'>
                    {tree.length === 0 ? (
                        <div className='layers-empty'>No nodes yet</div>
                    ) : (
                        <div className='layers-list'>
                            {tree.map((node) => (
                                <LayerItem key={node.id} node={node} depth={0} selectedIds={selectedIds} onSelect={handleSelect} />
                            ))}
                        </div>
                    )}
                </Panel>
            )}

            {/* ----- REVIEW ----- */}
            {showSubmission && (
                <Panel title='Submission'>
                    <SubmissionInfoPanel submission={submission} />
                </Panel>
            )}
        </aside>
    );
}
