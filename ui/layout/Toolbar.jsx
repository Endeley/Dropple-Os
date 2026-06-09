'use client';

import { useMemo } from 'react';
import { useGrid } from '@/ui/workspace/shared/GridContext';
import { useSelection } from '@/ui/workspace/shared/SelectionContext';
import { CapabilityActions } from '@/ui/capabilities/capabilityActions';
import { runExportGate } from '@/ui/export/exportGateClient.js';
import { performServiceExport } from '@/ui/export/exportExecutionClient.js';
import { createShareLink } from '@/share/createShareLink';
import { createEmbedCode } from '@/share/createEmbedCode';
import { runCommandIntent } from '@/ui/bridges/runtimeCommandFacade.js';
import { useWorkspaceProjectionState } from '@/runtime/projection';
import { useExportExecution } from '@/ui/export/useExportExecution.js';
import {
    ArtifactExportKinds,
    exportArtifact as exportArtifactFacade,
} from '@/runtime/export/exportArtifact.js';
import { getExportCapabilities } from '@/runtime/export/getExportCapabilities.js';

const TOOLBAR_EXPORT_ACTIONS = Object.freeze({
    json: {
        label: 'JSON',
        format: ArtifactExportKinds.JSON,
    },
    svg: {
        label: 'SVG',
        format: ArtifactExportKinds.SVG,
    },
    png: {
        label: 'PNG',
        format: ArtifactExportKinds.PNG,
        options: Object.freeze({ scale: 2 }),
    },
});

const EMPTY_RUNTIME_EVENTS = Object.freeze([]);
const EMPTY_EXPORT_TARGETS = Object.freeze([]);

export default function Toolbar({ mode, onOpenTemplateGenerator, emit, getState, events, cursor, exportArtifact = null, documentName, onSave, onSaveAs, recentDocs = [], onOpenDocument, canPersist = true, onImportJSONReplace, onImportJSONMerge, onImportSVGReplace, onImportSVGMerge, canImport = true }) {
    const { grid, toggleGrid } = useGrid();
    const { selectedIds } = useSelection();

    const state = getState?.();
    const nodes = state?.nodes || {};
    const selected = selectedIds ? Array.from(selectedIds) : [];

    const multi = selected.length > 1;
    const single = selected.length === 1;
    const hasNodes = Object.keys(nodes).length > 0;
    const exportCapabilities = exportArtifact ? getExportCapabilities(exportArtifact) : null;
    const runtimeDocument = useWorkspaceProjectionState((runtimeState) => runtimeState?.document ?? null);
    const runtimeScene = useWorkspaceProjectionState((runtimeState) => runtimeState?.scene ?? null);
    const runtimeTimeline = useWorkspaceProjectionState((runtimeState) => runtimeState?.timeline ?? null);
    const runtimePlayback = useWorkspaceProjectionState((runtimeState) => runtimeState?.playback ?? null);
    const runtimeEvents = useWorkspaceProjectionState((runtimeState) => runtimeState?.events ?? EMPTY_RUNTIME_EVENTS);
    const runtimeCursorIndex = useWorkspaceProjectionState((runtimeState) => runtimeState?.cursorIndex ?? -1);
    const exportRuntimeSnapshot = useMemo(
        () => ({
            document: runtimeDocument,
            scene: runtimeScene,
            timeline: runtimeTimeline,
            playback: runtimePlayback,
            events: runtimeEvents,
            cursorIndex: runtimeCursorIndex,
        }),
        [runtimeDocument, runtimeScene, runtimeTimeline, runtimePlayback, runtimeEvents, runtimeCursorIndex],
    );
    const savedExportTargets = useWorkspaceProjectionState(
        (runtimeState) =>
            Array.isArray(runtimeState?.document?.exports?.targets)
                ? runtimeState.document.exports.targets
                : EMPTY_EXPORT_TARGETS,
    );
    const { runWorkflow, performWorkflow, serviceState } = useExportExecution();
    const toolbarExportFormats = exportCapabilities
        ? exportCapabilities.formats.filter((format) => TOOLBAR_EXPORT_ACTIONS[format])
        : [];
    const canExport = hasNodes && exportArtifact != null && toolbarExportFormats.length > 0;
    const canRunSavedExport = hasNodes && savedExportTargets.length > 0;
    const savedWorkflowStatus = serviceState.workflow?.queueEntry?.status ?? null;

    function handleRunSavedExport(target) {
        runExportGate({
            onProceed: async () => {
                try {
                    await performServiceExport({
                        snapshot: exportRuntimeSnapshot,
                        exportTarget: target,
                        runWorkflow,
                        performWorkflow,
                    });
                } catch (error) {
                    const reason = error instanceof Error ? error.message : 'unknown export error';
                    console.warn('[Toolbar] Export blocked:', reason);
                }
            },
        });
    }

    return (
        <div className='toolbar-root'>
            {/* LEFT: Mode + Grid */}
            <div className='toolbar-group'>
                <div className='toolbar-mode'>{mode.id}</div>

                <button className='toolbar-btn' onClick={toggleGrid} aria-pressed={grid.enabled}>
                    Grid
                </button>
            </div>

            {/* DOCUMENT */}
            {canPersist && (
                <div className='toolbar-group'>
                    <button className='toolbar-btn' onClick={onSave}>
                        Save
                    </button>

                    <button className='toolbar-btn' onClick={onSaveAs}>
                        Save As
                    </button>

                    {recentDocs.length > 0 && (
                        <select
                            className='toolbar-select'
                            defaultValue=''
                            onChange={(e) => {
                                const id = e.target.value;
                                if (!id) return;
                                onOpenDocument?.(id);
                                e.target.value = '';
                            }}>
                            <option value=''>Open…</option>
                            {recentDocs.map((doc) => (
                                <option key={doc.id} value={doc.id}>
                                    {doc.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            )}

            {/* IMPORT */}
            {canImport && (
                <div className='toolbar-group'>
                    <button className='toolbar-btn' onClick={onImportJSONReplace}>
                        JSON
                    </button>
                    <button className='toolbar-btn' onClick={onImportJSONMerge}>
                        JSON+
                    </button>
                    <button className='toolbar-btn' onClick={onImportSVGReplace}>
                        SVG
                    </button>
                    <button className='toolbar-btn' onClick={onImportSVGMerge}>
                        SVG+
                    </button>
                </div>
            )}

            {/* LAYOUT */}
                <div className='toolbar-group'>
                <button className='toolbar-btn' disabled={!multi} onClick={() => runCommandIntent('group')}>
                    Group
                </button>

                <button className='toolbar-btn' disabled={!single} onClick={() => runCommandIntent('ungroup')}>
                    Ungroup
                </button>

                <button className='toolbar-btn' disabled={!multi} onClick={() => CapabilityActions.alignLeft(selected, emit)}>
                    Left
                </button>

                <button className='toolbar-btn' disabled={!multi} onClick={() => CapabilityActions.alignCenterX(selected, emit)}>
                    Center
                </button>

                <button className='toolbar-btn' disabled={!multi} onClick={() => CapabilityActions.alignRight(selected, emit)}>
                    Right
                </button>

                <button className='toolbar-btn' disabled={!multi} onClick={() => CapabilityActions.distributeX(selected, emit)}>
                    Dist X
                </button>

                <button className='toolbar-btn' disabled={!multi} onClick={() => CapabilityActions.distributeY(selected, emit)}>
                    Dist Y
                </button>
            </div>

            {/* EXPORT */}
            <div className='toolbar-group'>
                {toolbarExportFormats.map((format) => {
                    const action = TOOLBAR_EXPORT_ACTIONS[format];
                    return (
                        <button
                            key={format}
                            className='toolbar-btn'
                            title={exportCapabilities?.description ?? undefined}
                            disabled={!canExport}
                            onClick={() =>
                                runExportGate({
                                    onProceed: () =>
                                        exportArtifactFacade({
                                            artifact: exportArtifact,
                                            format: action.format,
                                            options: action.options,
                                        }),
                                })
                            }>
                            {action.label}
                        </button>
                    );
                })}

                {savedExportTargets.map((target) => (
                    <button
                        key={`saved-${target.id}`}
                        className='toolbar-btn'
                        disabled={!canRunSavedExport}
                        title='Runs the canonical render/export workflow'
                        onClick={() => handleRunSavedExport(target)}>
                        {target.label ?? target.id}
                    </button>
                ))}

                {exportCapabilities && (
                    <span className='toolbar-mode' title={exportCapabilities.description}>
                        {exportCapabilities.label}
                    </span>
                )}
                {savedWorkflowStatus && (
                    <span className='toolbar-mode' title='Canonical export workflow status'>
                        {savedWorkflowStatus}
                    </span>
                )}

                <button
                    className='toolbar-btn'
                    disabled={!hasNodes}
                    onClick={async () => {
                        const url = createShareLink({ events, cursorIndex: cursor?.index ?? -1 });
                        try {
                            await navigator.clipboard.writeText(url);
                        } catch {
                            window.prompt('Copy link', url);
                        }
                    }}>
                    Share
                </button>

                <button
                    className='toolbar-btn'
                    disabled={!hasNodes}
                    onClick={async () => {
                        const code = createEmbedCode({
                            zoom: 1,
                            bg: 'transparent',
                            timeline: false,
                            controls: false,
                        });
                        try {
                            await navigator.clipboard.writeText(code);
                        } catch {
                            window.prompt('Copy embed', code);
                        }
                    }}>
                    Embed
                </button>
            </div>

            {/* TEMPLATE */}
            {mode?.workspaceId === 'design' && onOpenTemplateGenerator && (
                <div className='toolbar-group'>
                    <button className='toolbar-btn' onClick={onOpenTemplateGenerator}>
                        Publish
                    </button>
                </div>
            )}
        </div>
    );
}
