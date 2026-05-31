'use client';

const DESIGN_MODE_LABEL_BY_ID = Object.freeze({
    uiux: 'UIUX',
    graphic: 'Graphic',
    document: 'Document',
});

export function normalizeDesignModeId(value, fallback = 'uiux') {
    const normalized = String(value ?? '')
        .trim()
        .toLowerCase();
    return normalized.length > 0 ? normalized : fallback;
}

export function resolveDesignModeLabel(modeId) {
    return DESIGN_MODE_LABEL_BY_ID[normalizeDesignModeId(modeId)] ?? 'Design';
}

export function DesignWorkspaceStrip({ modeId = 'uiux', status = 'Draft' }) {
    return (
        <div className='uiux-workspace-strip'>
            <div className='uiux-breadcrumb'>Design / {resolveDesignModeLabel(modeId)}</div>
            <div className='uiux-surface-controls'>{status}</div>
        </div>
    );
}

export function DesignWorkspaceBrand({ modeId = 'uiux' }) {
    return (
        <div className='workspace-brand'>
            <span className='workspace-name'>{resolveDesignModeLabel(modeId)}</span>
        </div>
    );
}
