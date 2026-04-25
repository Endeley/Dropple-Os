'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspaceProjectionState } from '@/runtime/projection';
import { getDesignStateAtCursor } from '@/core/persistence/index.js';
import {
    closeTemplatePublishDialog,
    getTemplatePublishDialogState,
    subscribeTemplatePublishDialog,
} from '@/ui/bridges/templatePublishRuntimeFacade.js';

const INITIAL_METADATA = Object.freeze({
    title: '',
    description: '',
    tags: [],
    level: 'beginner',
});

export function TemplatePublishDialogBridge() {
    const [dialogState, setDialogState] = useState(() => getTemplatePublishDialogState());
    const [metadata, setMetadata] = useState(INITIAL_METADATA);
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState(null);

    const events = useWorkspaceProjectionState((state) => state.events ?? []);
    const cursorIndex = useWorkspaceProjectionState((state) => state.cursorIndex ?? -1);

    useEffect(() => {
        return subscribeTemplatePublishDialog((nextState) => {
            setDialogState(nextState);
            if (nextState?.open) {
                setError(null);
                setMetadata(INITIAL_METADATA);
            }
        });
    }, []);

    const resolvedMode = dialogState?.mode ?? null;

    const state = useMemo(
        () =>
            getDesignStateAtCursor({
                events,
                uptoIndex: cursorIndex,
            }),
        [events, cursorIndex],
    );

    const updateField = useCallback((field, value) => {
        setMetadata((current) => ({
            ...current,
            [field]: value,
        }));
    }, []);

    const close = useCallback(() => {
        if (isPublishing) return;
        closeTemplatePublishDialog();
    }, [isPublishing]);

    const publish = useCallback(async () => {
        setIsPublishing(true);
        setError(null);

        try {
            const response = await fetch('/api/templates/publish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    state,
                    events,
                    mode: resolvedMode,
                    metadata,
                }),
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload?.error ?? 'Template publish failed.');
            }

            closeTemplatePublishDialog();
            return payload?.result ?? null;
        } catch (nextError) {
            setError(nextError);
            throw nextError;
        } finally {
            setIsPublishing(false);
        }
    }, [events, metadata, resolvedMode, state]);

    if (!dialogState?.open) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}>
            <div
                style={{
                    background: 'var(--surface-panel)',
                    padding: 'var(--space-lg)',
                    width: 420,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    display: 'grid',
                    gap: 'var(--space-sm)',
                }}>
                <h3 style={{ margin: 0 }}>Create Template</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                    Publish the current workspace through the certified template pipeline.
                </p>

                <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                    <span>Template Name</span>
                    <input
                        type='text'
                        value={metadata.title ?? ''}
                        onChange={(event) => updateField('title', event.target.value)}
                        placeholder='Untitled Template'
                        style={{
                            width: '100%',
                            minHeight: 36,
                            padding: '0 10px',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--surface-1)',
                            color: 'var(--text-primary)',
                        }}
                    />
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                    <span>Description</span>
                    <textarea
                        value={metadata.description ?? ''}
                        onChange={(event) => updateField('description', event.target.value)}
                        placeholder='What does this template preserve?'
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--surface-1)',
                            color: 'var(--text-primary)',
                            resize: 'vertical',
                        }}
                    />
                </label>

                {error ? (
                    <div style={{ color: 'var(--danger-500, #b91c1c)', fontSize: 12 }}>
                        {error instanceof Error ? error.message : 'Template publish failed.'}
                    </div>
                ) : null}

                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <button
                        onClick={publish}
                        disabled={isPublishing}
                        style={{
                            minWidth: 32,
                            height: 32,
                            padding: '0 var(--space-sm)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--surface-1)',
                            color: 'var(--text-primary)',
                            fontSize: 12,
                        }}>
                        {isPublishing ? 'Publishing...' : 'Publish Template'}
                    </button>
                    <button
                        onClick={close}
                        disabled={isPublishing}
                        style={{
                            minWidth: 32,
                            height: 32,
                            padding: '0 var(--space-sm)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--surface-1)',
                            color: 'var(--text-primary)',
                            fontSize: 12,
                        }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
