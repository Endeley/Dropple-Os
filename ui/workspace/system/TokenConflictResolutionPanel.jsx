'use client';

function toSlug(value) {
    return String(value ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function renderValue(value) {
    if (value == null) return 'none';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

export function TokenConflictResolutionPanel({
    resolution,
    canApply,
    onChoose,
    onManualValueChange,
    onManualTargetPathChange,
    onApply,
    proposalStatus,
    applyVersionId,
    applyLabel,
    onApplyVersionIdChange,
    onApplyLabelChange,
}) {
    const hasConflicts = (resolution?.resolutions?.length ?? 0) > 0;

    if (!hasConflicts) {
        return (
            <div className='inspector-block inspector-group' data-testid='token-conflict-resolution-empty'>
                <div className='inspector-title'>Conflict Resolution</div>
                <div className='inspector-muted'>Select a conflicting merge preview to resolve token conflicts.</div>
            </div>
        );
    }

    return (
        <div className='token-conflict-resolution inspector-group' data-testid='token-conflict-resolution-panel'>
            <div className='inspector-block inspector-group'>
                <div className='inspector-title'>Conflict Resolution</div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Unresolved</span>
                    <span data-testid='token-conflict-unresolved-count'>{resolution.unresolvedCount}</span>
                </div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Predicted merged result</span>
                    <span>{resolution.predictedMergedResult.length}</span>
                </div>
                <input
                    className='token-version-graph__input'
                    placeholder='Resolved merge version id'
                    value={applyVersionId}
                    onChange={(event) => onApplyVersionIdChange(event.target.value)}
                    data-testid='token-conflict-apply-version-id'
                />
                <input
                    className='token-version-graph__input'
                    placeholder='Resolved merge label'
                    value={applyLabel}
                    onChange={(event) => onApplyLabelChange(event.target.value)}
                    data-testid='token-conflict-apply-label'
                />
                <button
                    type='button'
                    className='inspector-button'
                    disabled={!canApply}
                    onClick={onApply}
                    data-testid='token-conflict-apply-button'
                >
                    Apply resolved merge proposal
                </button>
                <div className='inspector-muted' data-testid='token-conflict-proposal-status'>
                    {proposalStatus}
                </div>
            </div>

            {resolution.resolutions.map((entry) => {
                const slug = toSlug(entry.entityKey);
                const showManualValue = entry.selectedChoice === 'manual-merged-value';
                const showManualTargetPath = entry.selectedChoice === 'alias-rebind';

                return (
                    <div key={entry.entityKey} className='inspector-block inspector-group'>
                        <div className='inspector-row'>
                            <span>{entry.label}</span>
                            <span className='inspector-muted'>{entry.conflictType}</span>
                        </div>
                        <div className='inspector-row'>
                            <span className='inspector-muted'>Left</span>
                            <span>{renderValue(entry.left?.next)}</span>
                        </div>
                        <div className='inspector-row'>
                            <span className='inspector-muted'>Right</span>
                            <span>{renderValue(entry.right?.next)}</span>
                        </div>
                        <div className='token-conflict-resolution__choices inspector-row'>
                            {entry.options.includes('keep-left') ? (
                                <button
                                    type='button'
                                    className='inspector-button'
                                    onClick={() => onChoose(entry.entityKey, 'keep-left')}
                                    data-testid={`token-conflict-keep-left-${slug}`}
                                >
                                    Keep left
                                </button>
                            ) : null}
                            {entry.options.includes('keep-right') ? (
                                <button
                                    type='button'
                                    className='inspector-button'
                                    onClick={() => onChoose(entry.entityKey, 'keep-right')}
                                    data-testid={`token-conflict-keep-right-${slug}`}
                                >
                                    Keep right
                                </button>
                            ) : null}
                            {entry.options.includes('manual-merged-value') ? (
                                <button
                                    type='button'
                                    className='inspector-button'
                                    onClick={() => onChoose(entry.entityKey, 'manual-merged-value')}
                                    data-testid={`token-conflict-manual-value-${slug}`}
                                >
                                    Manual value
                                </button>
                            ) : null}
                            {entry.options.includes('alias-rebind') ? (
                                <button
                                    type='button'
                                    className='inspector-button'
                                    onClick={() => onChoose(entry.entityKey, 'alias-rebind')}
                                    data-testid={`token-conflict-alias-rebind-${slug}`}
                                >
                                    Alias rebind
                                </button>
                            ) : null}
                        </div>
                        {showManualValue ? (
                            <input
                                className='token-version-graph__input'
                                placeholder='Merged value'
                                value={entry.manualValue}
                                onChange={(event) => onManualValueChange(entry.entityKey, event.target.value)}
                                data-testid={`token-conflict-manual-value-input-${slug}`}
                            />
                        ) : null}
                        {showManualTargetPath ? (
                            <input
                                className='token-version-graph__input'
                                placeholder='Alias target path'
                                value={entry.manualTargetPath}
                                onChange={(event) => onManualTargetPathChange(entry.entityKey, event.target.value)}
                                data-testid={`token-conflict-alias-target-input-${slug}`}
                            />
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
