'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useWorkspaceProjectionState as useRuntimeStore } from '@/runtime/projection';
import { selectVersionComparison } from '@/runtime/tokens/selectVersionComparison.js';
import { TokenVersionDiffPanel } from '@/ui/workspace/system/TokenVersionDiffPanel.jsx';

function firstNonMatchingVersion(options, excludedId) {
    return options.find((option) => option.id !== excludedId)?.id ?? '';
}

export function TokenVersionComparePanel({ versionOptions, activeHead }) {
    const document = useRuntimeStore((state) => state.document);
    const events = useRuntimeStore((state) => state.events);
    const [leftVersionId, setLeftVersionId] = useState(activeHead ?? '');
    const [rightVersionId, setRightVersionId] = useState('');
    const previousActiveHeadRef = useRef(activeHead ?? '');
    const hasManualOverrideRef = useRef(false);

    useEffect(() => {
        if (!versionOptions.some((option) => option.id === leftVersionId)) {
            const nextLeft = activeHead ?? versionOptions[0]?.id ?? '';
            setLeftVersionId(nextLeft);
        }
    }, [activeHead, leftVersionId, versionOptions]);

    useEffect(() => {
        const previousActiveHead = previousActiveHeadRef.current;
        if (!hasManualOverrideRef.current || leftVersionId === previousActiveHead) {
            const nextLeft = activeHead ?? versionOptions[0]?.id ?? '';
            if (nextLeft !== leftVersionId) {
                setLeftVersionId(nextLeft);
            }
        }
        previousActiveHeadRef.current = activeHead ?? '';
    }, [activeHead, leftVersionId, versionOptions]);

    useEffect(() => {
        const nextRight = versionOptions.some((option) => option.id === rightVersionId)
            ? rightVersionId
            : firstNonMatchingVersion(versionOptions, leftVersionId);

        if (nextRight !== rightVersionId) {
            setRightVersionId(nextRight);
        }
    }, [leftVersionId, rightVersionId, versionOptions]);

    const comparison = useMemo(
        () =>
            selectVersionComparison(
                {
                    document,
                    events,
                },
                {
                    leftVersionId: leftVersionId || null,
                    rightVersionId: rightVersionId || null,
                },
            ),
        [document, events, leftVersionId, rightVersionId],
    );
    const comparisonWithTestPrefix = useMemo(
        () => ({
            ...comparison,
            testIdPrefix: 'token-version-compare-diff',
        }),
        [comparison],
    );

    function handleSwap() {
        hasManualOverrideRef.current = true;
        setLeftVersionId(rightVersionId);
        setRightVersionId(leftVersionId);
    }

    return (
        <div className='token-version-compare inspector-group' data-testid='token-version-compare-panel'>
            <div className='inspector-block inspector-group'>
                <div className='inspector-title'>Compare Versions</div>
                <div className='token-version-graph__action-grid'>
                    <label className='inspector-group'>
                        <span className='inspector-muted'>Version A</span>
                        <select
                            className='token-version-graph__input'
                            value={leftVersionId}
                            onChange={(event) => {
                                hasManualOverrideRef.current = true;
                                setLeftVersionId(event.target.value);
                            }}
                            data-testid='token-version-compare-left'
                        >
                            {versionOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className='inspector-group'>
                        <span className='inspector-muted'>Version B</span>
                        <select
                            className='token-version-graph__input'
                            value={rightVersionId}
                            onChange={(event) => {
                                hasManualOverrideRef.current = true;
                                setRightVersionId(event.target.value);
                            }}
                            data-testid='token-version-compare-right'
                        >
                            {versionOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className='inspector-row'>
                    <span className='inspector-muted'>Relationship</span>
                    <span data-testid='token-version-compare-relationship'>{comparison.relationship}</span>
                </div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Common ancestor</span>
                    <span data-testid='token-version-compare-ancestor'>{comparison.commonAncestorId ?? 'none'}</span>
                </div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Swap</span>
                    <button
                        type='button'
                        className='inspector-button'
                        onClick={handleSwap}
                        data-testid='token-version-compare-swap'
                    >
                        Swap
                    </button>
                </div>
            </div>

            <TokenVersionDiffPanel diff={comparisonWithTestPrefix} />
        </div>
    );
}
