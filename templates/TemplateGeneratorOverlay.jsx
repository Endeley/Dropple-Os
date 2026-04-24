'use client';

export default function TemplateGeneratorOverlay({
    generator,
    state,
    events,
    mode,
}) {
    if (!generator?.open) return null;

    const metadata = generator.metadata ?? {};

    function updateField(field, value) {
        generator.setMetadata((current) => ({
            ...current,
            [field]: value,
        }));
    }

    async function publish() {
        try {
            await generator.publish({
                state,
                events,
                mode,
            });
        } catch (err) {
            console.error(err);
        }
    }

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
            }}
        >
            <div
                style={{
                    background: 'var(--surface-panel)',
                    padding: 'var(--space-lg)',
                    width: 420,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    display: 'grid',
                    gap: 'var(--space-sm)',
                }}
            >
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

                {generator.error ? (
                    <div style={{ color: 'var(--danger-500, #b91c1c)', fontSize: 12 }}>
                        {generator.error instanceof Error
                            ? generator.error.message
                            : 'Template publish failed.'}
                    </div>
                ) : null}

                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <button
                        onClick={publish}
                        disabled={generator.isPublishing}
                        style={{
                            minWidth: 32,
                            height: 32,
                            padding: '0 var(--space-sm)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--surface-1)',
                            color: 'var(--text-primary)',
                            fontSize: 12,
                        }}
                    >
                        {generator.isPublishing ? 'Publishing...' : 'Publish Template'}
                    </button>
                    <button
                        onClick={generator.closeGenerator}
                        disabled={generator.isPublishing}
                        style={{
                            minWidth: 32,
                            height: 32,
                            padding: '0 var(--space-sm)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--surface-1)',
                            color: 'var(--text-primary)',
                            fontSize: 12,
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
