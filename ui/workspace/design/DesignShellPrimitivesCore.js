const DESIGN_MODE_LABEL_BY_ID = Object.freeze({
    uiux: 'UIUX',
    graphic: 'Graphic',
    document: 'Document',
});

const DESIGN_TOP_CHROME_BY_MODE = Object.freeze({
    uiux: Object.freeze({
        primaryActionLabel: 'Frame',
        secondaryActionLabel: 'Auto Layout',
        zoomLabel: '100%',
        surfaceLabel: 'Draft Surface',
    }),
    graphic: Object.freeze({
        primaryActionLabel: 'Frame',
        secondaryActionLabel: 'Auto Layout',
        zoomLabel: '100%',
        surfaceLabel: 'Draft Surface',
    }),
    document: Object.freeze({
        primaryActionLabel: 'Frame',
        secondaryActionLabel: 'Auto Layout',
        zoomLabel: '100%',
        surfaceLabel: 'Draft Surface',
    }),
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

export function resolveDesignTopChrome(modeId) {
    const normalizedModeId = normalizeDesignModeId(modeId);
    return DESIGN_TOP_CHROME_BY_MODE[normalizedModeId] ?? DESIGN_TOP_CHROME_BY_MODE.uiux;
}
