'use client';

import { useMemo } from 'react';

import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';
import { useWorkspaceProjectionState, useWorkspaceVisualState } from '@/runtime/projection';
import { dispatchNodeDeleteSelection } from '@/ui/canvas/deleteSelection.js';
import { runCommandIntent } from '@/ui/bridges/runtimeCommandFacade.js';
import {
    attachMotionClipToNode,
    getMotionClipsForNode,
    removeMotionClipsFromNode,
} from '@/ui/motion/motionClipActions.js';

function ActionButton({ label, onClick, disabled = false, danger = false, testId = null }) {
    return (
        <button
            type='button'
            data-testid={testId}
            className={danger ? 'selection-context-menu__button is-danger' : 'selection-context-menu__button'}
            disabled={disabled}
            onClick={onClick}>
            {label}
        </button>
    );
}

export function SelectionActionsPanel({ node }) {
    const dispatcher = useDispatcher();
    const document = useWorkspaceProjectionState((state) => state.document ?? null);
    const workspaceId = useWorkspaceProjectionState((state) => state.definitionId ?? state.modeId ?? state.id ?? 'uiux');
    const selectionIds = useWorkspaceVisualState((state) => state.selection?.ids ?? []);

    const normalizedSelectionIds = useMemo(
        () => (Array.isArray(selectionIds) ? selectionIds.filter((id) => typeof id === 'string' && id.trim().length > 0) : []),
        [selectionIds],
    );
    const motionClips = useMemo(() => getMotionClipsForNode(document, node?.id ?? null), [document, node?.id]);

    if (!node || normalizedSelectionIds.length === 0) return null;

    const canDelete = normalizedSelectionIds.length > 0;
    const canGroup = normalizedSelectionIds.length > 1;
    const canUngroup = normalizedSelectionIds.length === 1 && node?.type === 'group';
    const canAttachMotion = normalizedSelectionIds.length === 1 && node?.type !== 'group' && motionClips.length === 0;
    const canRemoveMotion = normalizedSelectionIds.length === 1 && node?.type !== 'group' && motionClips.length > 0;

    return (
        <div className='inspector-group'>
            <div className='inspector-row' style={{ justifyContent: 'space-between', fontSize: 12 }}>
                <span className='inspector-subtle'>Selection Actions</span>
                <span>{normalizedSelectionIds.length} selected</span>
            </div>

            <div className='inspector-row' style={{ justifyContent: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                <ActionButton
                    label='Delete'
                    danger={true}
                    disabled={!canDelete}
                    testId='inspector-action-delete'
                    onClick={() =>
                        dispatchNodeDeleteSelection({
                            ids: normalizedSelectionIds,
                            dispatchEvent: dispatcher.dispatch,
                        })
                    }
                />

                {canGroup ? (
                    <ActionButton
                        label='Group'
                        testId='inspector-action-group'
                        onClick={() => runCommandIntent('group', { nodeIds: normalizedSelectionIds }, { dispatcher, workspaceId })}
                    />
                ) : null}

                {canUngroup ? (
                    <ActionButton
                        label='Ungroup'
                        testId='inspector-action-ungroup'
                        onClick={() => runCommandIntent('ungroup', { nodeIds: normalizedSelectionIds }, { dispatcher, workspaceId })}
                    />
                ) : null}

                {canAttachMotion ? (
                    <ActionButton
                        label='Attach Motion'
                        testId='inspector-action-attach-motion'
                        onClick={() => attachMotionClipToNode(dispatcher.dispatch, node?.id ?? null)}
                    />
                ) : null}

                {canRemoveMotion ? (
                    <ActionButton
                        label='Remove Motion'
                        testId='inspector-action-remove-motion'
                        onClick={() => removeMotionClipsFromNode(dispatcher.dispatch, node?.id ?? null, motionClips)}
                    />
                ) : null}
            </div>
        </div>
    );
}
