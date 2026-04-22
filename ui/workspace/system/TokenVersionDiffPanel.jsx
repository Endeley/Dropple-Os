'use client';

function renderValue(value) {
    if (value == null) return 'none';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

function DiffSection({ title, items, renderItem, testId }) {
    return (
        <div className='inspector-block inspector-group' data-testid={testId}>
            <div className='inspector-title'>{title}</div>
            {items.length === 0 ? (
                <div className='inspector-muted'>No changes</div>
            ) : (
                <div className='inspector-group'>
                    {items.map((item) => (
                        <div
                            key={item.key ?? `${title}-${renderValue(item.from)}-${renderValue(item.to)}`}
                            className='token-version-diff__item'
                        >
                            {renderItem(item)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function TokenVersionDiffPanel({ diff }) {
    const prefix = diff?.testIdPrefix ?? 'token-version-diff';
    const hasCompareTarget = Boolean(diff?.baseVersionId && diff?.compareVersionId);

    if (!hasCompareTarget) {
        return (
            <div className='inspector-block inspector-group' data-testid={`${prefix}-empty`}>
                <div className='inspector-title'>Version Diff</div>
                <div className='inspector-muted'>Select a non-active version to compare against the active head.</div>
            </div>
        );
    }

    return (
        <div className='token-version-diff inspector-group' data-testid={`${prefix}-panel`}>
            <div className='inspector-block inspector-group'>
                <div className='inspector-title'>Version Diff</div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Base</span>
                    <span data-testid={`${prefix}-base`}>{diff.baseVersionId}</span>
                </div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Compare</span>
                    <span data-testid={`${prefix}-compare`}>{diff.compareVersionId}</span>
                </div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Breaking</span>
                    <span data-testid={`${prefix}-breaking`}>{diff.impactSummary.breaking}</span>
                </div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Additive</span>
                    <span data-testid={`${prefix}-additive`}>{diff.impactSummary.additive}</span>
                </div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Cosmetic</span>
                    <span data-testid={`${prefix}-cosmetic`}>{diff.impactSummary.cosmetic}</span>
                </div>
            </div>

            <DiffSection
                title='Added'
                items={diff.addedTokens}
                testId={`${prefix}-added`}
                renderItem={(item) => (
                    <>
                        <div>{item.key}</div>
                        <div className='inspector-muted'>{renderValue(item.value)}</div>
                    </>
                )}
            />
            <DiffSection
                title='Removed'
                items={diff.removedTokens}
                testId={`${prefix}-removed`}
                renderItem={(item) => (
                    <>
                        <div>{item.key}</div>
                        <div className='inspector-muted'>{renderValue(item.value)}</div>
                    </>
                )}
            />
            <DiffSection
                title='Changed Values'
                items={diff.changedValues}
                testId={`${prefix}-values`}
                renderItem={(item) => (
                    <>
                        <div>{item.key}</div>
                        <div className='inspector-muted'>{`${renderValue(item.from)} -> ${renderValue(item.to)}`}</div>
                    </>
                )}
            />
            <DiffSection
                title='Changed Aliases'
                items={diff.changedAliases}
                testId={`${prefix}-aliases`}
                renderItem={(item) => (
                    <>
                        <div>{item.key}</div>
                        <div className='inspector-muted'>{`${renderValue(item.from)} -> ${renderValue(item.to)}`}</div>
                    </>
                )}
            />
            <DiffSection
                title='Theme Impact'
                items={diff.changedThemeBindings}
                testId={`${prefix}-themes`}
                renderItem={(item) => (
                    <>
                        <div>{item.type}</div>
                        <div className='inspector-muted'>{`${renderValue(item.from)} -> ${renderValue(item.to)}`}</div>
                    </>
                )}
            />
        </div>
    );
}
