const DESIGN_MODE_LABEL_BY_ID = Object.freeze({
    uiux: 'UI / UX',
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

const DESIGN_MODE_CAPABILITY_SURFACE = Object.freeze({
    uiux: Object.freeze({
        showMotionInspector: true,
        showTransitionTimeline: true,
    }),
    graphic: Object.freeze({
        showMotionInspector: true,
        showTransitionTimeline: true,
    }),
    document: Object.freeze({
        showMotionInspector: true,
        showTransitionTimeline: true,
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

export function resolveDesignWorkspaceContext({ modeId, workspaceContext } = {}) {
    const resolvedModeId = normalizeDesignModeId(modeId ?? workspaceContext?.modeId ?? 'uiux');
    const resolvedWorkspaceId =
        String(workspaceContext?.workspaceId ?? workspaceContext?.definitionId ?? 'design')
            .trim()
            .toLowerCase() || 'design';

    return Object.freeze({
        modeId: resolvedModeId,
        workspaceId: resolvedWorkspaceId,
    });
}

export function buildDesignPublishModePayload(context) {
    return Object.freeze({
        id: normalizeDesignModeId(context?.modeId ?? 'uiux'),
        workspaceId:
            String(context?.workspaceId ?? 'design')
                .trim()
                .toLowerCase() || 'design',
    });
}

export function resolveDesignModeCapabilitySurface(modeId) {
    const normalizedModeId = normalizeDesignModeId(modeId);
    return DESIGN_MODE_CAPABILITY_SURFACE[normalizedModeId] ?? DESIGN_MODE_CAPABILITY_SURFACE.uiux;
}
