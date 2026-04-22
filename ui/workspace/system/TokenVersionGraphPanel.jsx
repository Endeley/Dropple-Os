'use client';

import { useEffect, useMemo, useState } from 'react';

import { Panel } from '@/ui/Panel';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { selectActiveTokenVersionGraph } from '@/runtime/tokens/selectActiveTokenVersionGraph.js';
import { selectActiveTokenVersionDiff } from '@/runtime/tokens/selectActiveTokenVersionDiff.js';
import { selectActiveTokenMergePreview } from '@/runtime/tokens/selectActiveTokenMergePreview.js';
import { useTokenAuthoringIntent } from '@/ui/workspace/system/tokenAuthoringIntent.js';
import { TokenVersionInspector } from '@/ui/workspace/system/TokenVersionInspector.jsx';
import { TokenVersionComparePanel } from '@/ui/workspace/system/TokenVersionComparePanel.jsx';
import { TokenVersionDiffPanel } from '@/ui/workspace/system/TokenVersionDiffPanel.jsx';
import { TokenMergePreviewPanel } from '@/ui/workspace/system/TokenMergePreviewPanel.jsx';

function VersionNode({ node, isSelected, onSelect }) {
    return (
        <button
            type='button'
            className={`token-version-node${node.isActive ? ' is-active' : ''}${isSelected ? ' is-selected' : ''}`}
            onClick={() => onSelect(node.id)}
            data-testid={`token-version-node-${node.id}`}
        >
            <div className='token-version-node__header'>
                <span className='token-version-node__id'>{node.id}</span>
                <span className='token-version-node__flags'>
                    {node.isMergeNode ? 'merge' : node.isBranchHead ? 'head' : node.operation}
                </span>
            </div>
            <div className='token-version-node__label'>{node.label}</div>
            <div className='token-version-node__meta'>
                <span>{`parents: ${node.parents.length}`}</span>
                {node.themeId ? <span>{`theme: ${node.themeId}`}</span> : null}
            </div>
        </button>
    );
}

export function TokenVersionGraphPanel() {
    const document = useRuntimeStore((state) => state.document);
    const events = useRuntimeStore((state) => state.events);
    const commands = useTokenAuthoringIntent();
    const projectedGraph = useMemo(
        () => selectActiveTokenVersionGraph({ document }),
        [document],
    );
    const [tagVersionId, setTagVersionId] = useState('');
    const [tagLabel, setTagLabel] = useState('');
    const [forkVersionId, setForkVersionId] = useState('');
    const [forkLabel, setForkLabel] = useState('');
    const [mergeVersionId, setMergeVersionId] = useState('');
    const [mergeLabel, setMergeLabel] = useState('');
    const [selectedVersionId, setSelectedVersionId] = useState('');

    const {
        activeHead,
        nodes,
        edges,
        branchHeads,
        mergeNodes,
        topoOrder,
    } = projectedGraph;
    const activeThemeId = document?.themes?.activeThemeId ?? null;
    const tokenCount = Object.keys(document?.tokens ?? {}).length;
    const selectedNode = useMemo(
        () => nodes.find((node) => node.id === selectedVersionId) ?? null,
        [nodes, selectedVersionId],
    );
    const versionOptions = useMemo(
        () => nodes.map((node) => ({ id: node.id, label: node.label })),
        [nodes],
    );
    const parentsById = useMemo(
        () =>
            new Map(nodes.map((node) => [node.id, node.parents ?? []])),
        [nodes],
    );
    const projectedDiff = useMemo(
        () =>
            selectActiveTokenVersionDiff(
                {
                    document,
                    events,
                },
                {
                    compareVersionId: selectedVersionId || null,
                },
            ),
        [document, events, selectedVersionId],
    );
    const projectedMergePreview = useMemo(
        () =>
            selectActiveTokenMergePreview(
                {
                    document,
                    events,
                },
                {
                    leftVersionId: activeHead || null,
                    rightVersionId: selectedVersionId && selectedVersionId !== activeHead ? selectedVersionId : null,
                },
            ),
        [activeHead, document, events, selectedVersionId],
    );

    useEffect(() => {
        if (!nodes.some((node) => node.id === selectedVersionId)) {
            setSelectedVersionId(activeHead ?? '');
        }
    }, [activeHead, nodes, selectedVersionId]);

    function isAncestor(ancestorId, descendantId) {
        if (!ancestorId || !descendantId) return false;
        if (ancestorId === descendantId) return true;

        const visited = new Set();
        const stack = [...(parentsById.get(descendantId) ?? [])];

        while (stack.length > 0) {
            const currentId = stack.pop();
            if (!currentId || visited.has(currentId)) continue;
            if (currentId === ancestorId) return true;

            visited.add(currentId);
            stack.push(...(parentsById.get(currentId) ?? []));
        }

        return false;
    }

    const canMergeSelectedWithHead =
        Boolean(selectedNode?.id) &&
        Boolean(activeHead) &&
        selectedNode.id !== activeHead &&
        (isAncestor(selectedNode.id, activeHead) || isAncestor(activeHead, selectedNode.id));
    const canRollbackToSelected =
        Boolean(selectedNode?.id) &&
        Boolean(activeHead) &&
        selectedNode.id !== activeHead;

    function buildSuggestedVersionId() {
        return `v${nodes.length + 1}`;
    }

    function handleTagVersion() {
        const versionId = tagVersionId.trim() || buildSuggestedVersionId();
        commands.tagTokenVersion({
            versionId,
            label: tagLabel.trim() || `Version ${versionId}`,
            themeId: activeThemeId,
            parentVersionIds: activeHead ? [activeHead] : [],
        });
        setTagVersionId('');
        setTagLabel('');
    }

    function handleForkVersion() {
        const sourceVersionId = activeHead ?? selectedNode?.id ?? null;
        const versionId = forkVersionId.trim() || buildSuggestedVersionId();
        if (!sourceVersionId) return;

        commands.forkTokenVersion({
            versionId,
            sourceVersionId,
            label: forkLabel.trim() || `Fork ${versionId}`,
            themeId: activeThemeId,
        });
        setForkVersionId('');
        setForkLabel('');
    }

    function handleMergeVersion() {
        const versionId = mergeVersionId.trim() || buildSuggestedVersionId();
        if (!canMergeSelectedWithHead || !selectedNode || !activeHead) return;

        commands.mergeTokenVersion({
            versionId,
            parentVersionIds: [selectedNode.id, activeHead],
            label: mergeLabel.trim() || `Merge ${versionId}`,
            themeId: activeThemeId,
        });
        setMergeVersionId('');
        setMergeLabel('');
    }

    function handleRollback() {
        const targetId = selectedNode?.id ?? null;
        if (!targetId || !canRollbackToSelected) return;

        commands.rollbackTokenVersion({
            rollbackTargetId: targetId,
            label: `Rollback to ${targetId}`,
        });
    }

    return (
        <Panel title='Token Version Graph'>
            <div className='token-version-graph inspector-group'>
                <div className='token-version-graph__summary inspector-block' data-testid='token-version-head-ribbon'>
                    <div className='inspector-row'>
                        <span className='inspector-muted'>Active head</span>
                        <span data-testid='token-version-active-head'>{activeHead ?? 'none'}</span>
                    </div>
                    <div className='inspector-row'>
                        <span className='inspector-muted'>Selected</span>
                        <span data-testid='token-version-selected-head'>{selectedNode?.id ?? 'none'}</span>
                    </div>
                    <div className='inspector-row'>
                        <span className='inspector-muted'>Theme</span>
                        <span>{activeThemeId ?? 'none'}</span>
                    </div>
                    <div className='inspector-row'>
                        <span className='inspector-muted'>Token set</span>
                        <span>{tokenCount}</span>
                    </div>
                    <div className='inspector-row'>
                        <span className='inspector-muted'>Versions</span>
                        <span>{nodes.length}</span>
                    </div>
                    <div className='inspector-row'>
                        <span className='inspector-muted'>Branch heads</span>
                        <span>{branchHeads.length}</span>
                    </div>
                    <div className='inspector-row'>
                        <span className='inspector-muted'>Pending merge candidates</span>
                        <span>{canMergeSelectedWithHead ? 1 : 0}</span>
                    </div>
                </div>

                <div className='token-version-graph__actions inspector-block'>
                    <div className='inspector-title'>Version Actions</div>

                    <div className='token-version-graph__action-grid'>
                        <div className='token-version-graph__action-card inspector-group'>
                            <div className='inspector-row'>
                                <span>Tag version</span>
                                <button
                                    type='button'
                                    className='inspector-button'
                                    onClick={handleTagVersion}
                                    data-testid='token-version-tag-button'
                                >
                                    Tag
                                </button>
                            </div>
                            <input
                                className='token-version-graph__input'
                                placeholder={buildSuggestedVersionId()}
                                value={tagVersionId}
                                onChange={(event) => setTagVersionId(event.target.value)}
                                data-testid='token-version-tag-id'
                            />
                            <input
                                className='token-version-graph__input'
                                placeholder='Version label'
                                value={tagLabel}
                                onChange={(event) => setTagLabel(event.target.value)}
                                data-testid='token-version-tag-label'
                            />
                            <div className='inspector-muted'>
                                {activeHead ? `Parents active head ${activeHead}` : 'Creates the first lineage node'}
                            </div>
                        </div>

                        <div className='token-version-graph__action-card inspector-group'>
                            <div className='inspector-row'>
                                <span>Fork active head</span>
                                <button
                                    type='button'
                                    className='inspector-button'
                                    onClick={handleForkVersion}
                                    disabled={!activeHead}
                                    data-testid='token-version-fork-button'
                                >
                                    Fork
                                </button>
                            </div>
                            <input
                                className='token-version-graph__input'
                                placeholder={buildSuggestedVersionId()}
                                value={forkVersionId}
                                onChange={(event) => setForkVersionId(event.target.value)}
                                data-testid='token-version-fork-id'
                            />
                            <input
                                className='token-version-graph__input'
                                placeholder='Fork label'
                                value={forkLabel}
                                onChange={(event) => setForkLabel(event.target.value)}
                                data-testid='token-version-fork-label'
                            />
                            <div className='inspector-muted'>
                                {activeHead ? `Source ${activeHead}` : 'Requires an active version head'}
                            </div>
                        </div>

                        <div className='token-version-graph__action-card inspector-group'>
                            <div className='inspector-row'>
                                <span>Merge lineage</span>
                                <button
                                    type='button'
                                    className='inspector-button'
                                    onClick={handleMergeVersion}
                                    disabled={!canMergeSelectedWithHead}
                                    data-testid='token-version-merge-button'
                                >
                                    Merge
                                </button>
                            </div>
                            <input
                                className='token-version-graph__input'
                                placeholder={buildSuggestedVersionId()}
                                value={mergeVersionId}
                                onChange={(event) => setMergeVersionId(event.target.value)}
                                data-testid='token-version-merge-id'
                            />
                            <input
                                className='token-version-graph__input'
                                placeholder='Merge label'
                                value={mergeLabel}
                                onChange={(event) => setMergeLabel(event.target.value)}
                                data-testid='token-version-merge-label'
                            />
                            <div className='inspector-muted'>
                                {canMergeSelectedWithHead && selectedNode
                                    ? `Merges ${selectedNode.id} with active head ${activeHead}`
                                    : 'Select a lineage-related version to merge with the active head'}
                            </div>
                        </div>

                        <div className='token-version-graph__action-card inspector-group'>
                            <div className='inspector-row'>
                                <span>Rollback head</span>
                                <button
                                    type='button'
                                    className='inspector-button'
                                    onClick={handleRollback}
                                    disabled={!canRollbackToSelected}
                                    data-testid='token-version-rollback-button'
                                >
                                    Rollback
                                </button>
                            </div>
                            <div className='inspector-muted'>
                                {canRollbackToSelected && selectedNode
                                    ? `Repoints active head to ${selectedNode.id}`
                                    : activeHead
                                      ? 'Select a non-head version to rollback to'
                                      : 'No active head yet'}
                            </div>
                        </div>
                    </div>
                </div>

                <TokenVersionInspector
                    selectedNode={selectedNode}
                    projectedGraph={projectedGraph}
                />

                <TokenVersionComparePanel
                    activeHead={activeHead}
                    versionOptions={versionOptions}
                />
                <TokenVersionDiffPanel diff={projectedDiff} />
                <TokenMergePreviewPanel preview={projectedMergePreview} />

                <div className='token-version-graph__lane inspector-block'>
                    <div className='inspector-title'>Topological Order</div>
                    {topoOrder.length === 0 ? (
                        <div className='inspector-muted'>No token lineage yet</div>
                    ) : (
                        <div className='token-version-graph__nodes inspector-group'>
                            {nodes.map((node) => (
                                <VersionNode
                                    key={node.id}
                                    node={node}
                                    isSelected={node.id === selectedVersionId}
                                    onSelect={setSelectedVersionId}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className='token-version-graph__lane inspector-block'>
                    <div className='inspector-title'>Edges</div>
                    {edges.length === 0 ? (
                        <div className='inspector-muted'>No lineage edges</div>
                    ) : (
                        <div className='token-version-graph__edges inspector-group'>
                            {edges.map((edge) => (
                                <div
                                    key={`${edge.from}-${edge.to}-${edge.type}`}
                                    className='token-version-graph__edge inspector-row'
                                >
                                    <span>{`${edge.from} → ${edge.to}`}</span>
                                    <span className='inspector-muted'>{edge.type}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Panel>
    );
}

export default TokenVersionGraphPanel;
