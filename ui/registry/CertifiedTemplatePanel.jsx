'use client';

const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background: '#0f172a',
    color: '#e2e8f0',
};

const warningStyle = {
    color: '#b45309',
    fontSize: 12,
};

export default function CertifiedTemplatePanel({
    templates = [],
    engineHash = null,
    onInstall = null,
    getCertificationStatus = null,
}) {
    const items = Array.isArray(templates) ? templates : [];

    return (
        <div style={{ padding: 16, display: 'grid', gap: 12 }}>
            <div>
                <h3 style={{ margin: 0 }}>Certified Templates</h3>
                <p style={{ margin: '6px 0 0', color: '#64748b' }}>
                    Official, deterministic templates from the registry.
                </p>
            </div>

            {items.length === 0 ? (
                <div style={{ color: '#94a3b8' }}>No certified templates available.</div>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {items.map((template) => {
                        const status =
                            typeof getCertificationStatus === 'function'
                                ? getCertificationStatus(template)
                                : { valid: Boolean(template?.certification?.signature) };
                        const certified = Boolean(status?.valid);
                        const engineCompatible =
                            engineHash && template?.certification?.engineHash
                                ? template.certification.engineHash === engineHash
                                : null;

                        return (
                            <div
                                key={`${template.id || 'template'}:${template.version || '0.0.0'}`}
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 12,
                                    padding: 12,
                                    display: 'grid',
                                    gap: 8,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>
                                            {template?.metadata?.name || template?.id || 'Untitled Template'}
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: 12 }}>
                                            {template?.version || '0.0.0'}
                                        </div>
                                    </div>
                                    <span style={badgeStyle}>
                                        {certified ? 'Certified' : 'Unverified'}
                                    </span>
                                </div>

                                {template?.metadata?.description ? (
                                    <div style={{ color: '#475569', fontSize: 13 }}>
                                        {template.metadata.description}
                                    </div>
                                ) : null}

                                {engineCompatible === false ? (
                                    <div style={warningStyle}>
                                        Engine drift - re-certification required.
                                    </div>
                                ) : null}

                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={() => onInstall?.(template)}
                                        disabled={!onInstall}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: 8,
                                            border: '1px solid #cbd5f5',
                                            background: '#f8fafc',
                                            cursor: onInstall ? 'pointer' : 'not-allowed',
                                        }}
                                    >
                                        Install
                                    </button>
                                    {template?.certification?.structuralHash ? (
                                        <span style={{ fontSize: 12, color: '#94a3b8' }}>
                                            {template.certification.structuralHash.slice(0, 12)}...
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
