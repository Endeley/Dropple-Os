'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspaceProjectionState } from '@/runtime/projection';
import { getDesignStateAtCursor } from '@/core/persistence/index.js';
import {
    clearTemplatePublishTrust,
    closeTemplatePublishDialog,
    getTemplatePublishDialogState,
    setTemplatePublishTrust,
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

            if (payload?.releaseTrust) {
                setTemplatePublishTrust({
                    status: payload.releaseTrust.status ?? 'UNKNOWN',
                    summary: payload.releaseTrust.summary ?? '',
                    timestampMs: Date.now(),
                });
            } else {
                setTemplatePublishTrust(null);
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

    const publishTrust = dialogState?.publishTrust ?? null;

    if (!dialogState?.open && !publishTrust) return null;

    const trustStatus = publishTrust?.status ?? 'UNKNOWN';
    const trustTone =
        trustStatus === 'PASS'
            ? 'var(--success-600, #166534)'
            : trustStatus === 'FAIL'
                ? 'var(--danger-600, #b91c1c)'
                : 'var(--warning-600, #92400e)';

    const trustSummaryPreview = typeof publishTrust?.summary === 'string'
        ? publishTrust.summary
            .split('\n')
            .filter((line) => line.startsWith('- Status:') || line.startsWith('- Baseline required after:') || line.startsWith('### OS Surface'))
            .slice(0, 4)
            .join('\n')
        : '';

    return (
        <>
            {dialogState?.open ? (
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
            ) : null}

            {publishTrust ? (
                <aside
                    data-testid='template-publish-trust-surface'
                    style={{
                        position: 'fixed',
                        right: 16,
                        bottom: 16,
                        width: 420,
                        maxWidth: 'calc(100vw - 32px)',
                        zIndex: 1001,
                        background: 'var(--surface-panel)',
                        border: `1px solid ${trustTone}`,
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-sm)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                        display: 'grid',
                        gap: 8,
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <strong style={{ fontSize: 12, color: trustTone }}>
                            Release Trust: {trustStatus}
                        </strong>
                        <button
                            onClick={clearTemplatePublishTrust}
                            style={{
                                minWidth: 24,
                                height: 24,
                                border: '1px solid var(--border-default)',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--surface-1)',
                                color: 'var(--text-primary)',
                                fontSize: 11,
                            }}>
                            Dismiss
                        </button>
                    </div>
                    <pre
                        style={{
                            margin: 0,
                            fontSize: 11,
                            lineHeight: 1.35,
                            whiteSpace: 'pre-wrap',
                            color: 'var(--text-muted)',
                            maxHeight: 120,
                            overflow: 'auto',
                        }}>
                        {trustSummaryPreview || 'No trust summary available for this publish.'}
                    </pre>
                </aside>
            ) : null}
        </>
    );
}
