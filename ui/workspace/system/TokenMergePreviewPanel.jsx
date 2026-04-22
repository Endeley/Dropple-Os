'use client';

function PreviewSection({ title, items, emptyText, testId }) {
    return (
        <div className='inspector-block inspector-group' data-testid={testId}>
            <div className='inspector-title'>{title}</div>
            {items.length === 0 ? (
                <div className='inspector-muted'>{emptyText}</div>
            ) : (
                <div className='inspector-group'>
                    {items.map((item) => (
                        <div
                            key={`${item.entityKey}-${item.reason ?? item.impact ?? 'change'}`}
                            className='token-version-diff__item'
                        >
                            <div>{item.label ?? item.entityKey}</div>
                            <div className='inspector-muted'>
                                {item.reason ?? item.impact ?? 'change'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function TokenMergePreviewPanel({ preview }) {
    const hasPreview = Boolean(
        preview?.leftVersionId &&
            preview?.rightVersionId &&
            preview?.commonAncestorId,
    );

    if (!hasPreview) {
        return (
            <div className='inspector-block inspector-group' data-testid='token-merge-preview-empty'>
                <div className='inspector-title'>Merge Preview</div>
                <div className='inspector-muted'>Select a merge candidate to preview incoming changes and conflicts.</div>
            </div>
        );
    }

    return (
        <div className='token-merge-preview inspector-group' data-testid='token-merge-preview-panel'>
            <div className='inspector-block inspector-group'>
                <div className='inspector-title'>Merge Preview</div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Left</span>
                    <span data-testid='token-merge-preview-left'>{preview.leftVersionId}</span>
                </div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Right</span>
                    <span data-testid='token-merge-preview-right'>{preview.rightVersionId}</span>
                </div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Common ancestor</span>
                    <span data-testid='token-merge-preview-ancestor'>{preview.commonAncestorId}</span>
                </div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Conflicts</span>
                    <span data-testid='token-merge-preview-conflicts'>{preview.conflicts.length}</span>
                </div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Auto mergeable</span>
                    <span data-testid='token-merge-preview-auto'>{preview.autoMergeable.length}</span>
                </div>
            </div>

            <PreviewSection
                title='Incoming Changes'
                items={preview.incomingChanges}
                emptyText='No incoming changes'
                testId='token-merge-preview-incoming'
            />
            <PreviewSection
                title='Overlapping Changes'
                items={preview.overlappingChanges}
                emptyText='No overlapping changes'
                testId='token-merge-preview-overlap'
            />
            <PreviewSection
                title='Conflicts'
                items={preview.conflicts}
                emptyText='No conflicts'
                testId='token-merge-preview-conflict-list'
            />
        </div>
    );
}
