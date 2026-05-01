export const CANONICAL_WORKSPACES = Object.freeze({
    design: Object.freeze({
        id: 'design',
        label: 'Design',
        defaultMode: 'uiux',
    }),
    media: Object.freeze({
        id: 'media',
        label: 'Media',
        defaultMode: 'animation',
    }),
    build: Object.freeze({
        id: 'build',
        label: 'Build',
        defaultMode: 'application',
    }),
    system: Object.freeze({
        id: 'system',
        label: 'System',
        defaultMode: 'components',
    }),
    collaborate: Object.freeze({
        id: 'collaborate',
        label: 'Collaborate',
        defaultMode: 'review',
    }),
});

export const CANONICAL_MODES = Object.freeze({
    uiux: Object.freeze({ id: 'uiux', label: 'UI / UX', workspaceId: 'design' }),
    graphic: Object.freeze({ id: 'graphic', label: 'Graphic', workspaceId: 'design' }),
    document: Object.freeze({ id: 'document', label: 'Document', workspaceId: 'design' }),

    animation: Object.freeze({ id: 'animation', label: 'Animation', workspaceId: 'media' }),
    video: Object.freeze({ id: 'video', label: 'Video', workspaceId: 'media' }),
    audio: Object.freeze({ id: 'audio', label: 'Audio', workspaceId: 'media' }),

    application: Object.freeze({ id: 'application', label: 'Application', workspaceId: 'build' }),
    logic: Object.freeze({ id: 'logic', label: 'Logic', workspaceId: 'build' }),
    automation: Object.freeze({ id: 'automation', label: 'Automation', workspaceId: 'build' }),

    tokens: Object.freeze({ id: 'tokens', label: 'Design Tokens', workspaceId: 'system' }),
    components: Object.freeze({ id: 'components', label: 'Component Libraries', workspaceId: 'system' }),
    governance: Object.freeze({ id: 'governance', label: 'Governance', workspaceId: 'system' }),

    review: Object.freeze({ id: 'review', label: 'Review', workspaceId: 'collaborate' }),
    production: Object.freeze({ id: 'production', label: 'Production', workspaceId: 'collaborate' }),
    knowledge: Object.freeze({ id: 'knowledge', label: 'Knowledge', workspaceId: 'collaborate' }),
});

/* =========================
   🔒 CONSTITUTIONAL GUARDS
   ========================= */

(function validateCanonicalRegistry() {
    const workspaceIds = Object.keys(CANONICAL_WORKSPACES);

    if (workspaceIds.length !== 5) {
        throw new Error(
            `[Dropple Constitution] Expected exactly 5 workspaces, got ${workspaceIds.length}`
        );
    }

    if (Object.keys(CANONICAL_MODES).length !== 15) {
        throw new Error(
            `[Dropple Constitution] Expected exactly 15 canonical modes, got ${Object.keys(CANONICAL_MODES).length}`
        );
    }

    for (const id of workspaceIds) {
        if (CANONICAL_WORKSPACES[id].id !== id) {
            throw new Error(
                `[Dropple Constitution] Workspace id mismatch: key=${id}, value=${CANONICAL_WORKSPACES[id].id}`
            );
        }
    }

    for (const modeId of Object.keys(CANONICAL_MODES)) {
        const mode = CANONICAL_MODES[modeId];

        if (!CANONICAL_WORKSPACES[mode.workspaceId]) {
            throw new Error(
                `[Dropple Constitution] Mode "${modeId}" references unknown workspace "${mode.workspaceId}"`
            );
        }

        if (mode.id !== modeId) {
            throw new Error(
                `[Dropple Constitution] Mode id mismatch: key=${modeId}, value=${mode.id}`
            );
        }
    }

    for (const workspaceId of workspaceIds) {
        const defaultMode = CANONICAL_WORKSPACES[workspaceId].defaultMode;

        if (!CANONICAL_MODES[defaultMode]) {
            throw new Error(
                `[Dropple Constitution] Workspace "${workspaceId}" defaultMode "${defaultMode}" is not defined`
            );
        }

        if (CANONICAL_MODES[defaultMode].workspaceId !== workspaceId) {
            throw new Error(
                `[Dropple Constitution] Workspace "${workspaceId}" defaultMode "${defaultMode}" belongs to another workspace`
            );
        }
    }
})();

/* =========================
   PUBLIC HELPERS
   ========================= */

export function listCanonicalWorkspaceIds() {
    return Object.keys(CANONICAL_WORKSPACES).sort();
}

export function listCanonicalModeIds() {
    return Object.keys(CANONICAL_MODES).sort();
}

export function listCanonicalModesForWorkspace(workspaceId) {
    if (!hasCanonicalWorkspace(workspaceId)) return [];

    return Object.values(CANONICAL_MODES).filter(
        (mode) => mode.workspaceId === workspaceId,
    );
}

export function hasCanonicalWorkspace(workspaceId) {
    return Boolean(workspaceId && CANONICAL_WORKSPACES[workspaceId]);
}

export function hasCanonicalMode(modeId) {
    return Boolean(modeId && CANONICAL_MODES[modeId]);
}

export function getCanonicalWorkspace(workspaceId) {
    return hasCanonicalWorkspace(workspaceId)
        ? CANONICAL_WORKSPACES[workspaceId]
        : null;
}

export function getCanonicalMode(modeId) {
    return hasCanonicalMode(modeId)
        ? CANONICAL_MODES[modeId]
        : null;
}

export function resolveCanonicalWorkspaceForMode(modeId) {
    return getCanonicalMode(modeId)?.workspaceId ?? null;
}

export function resolveWorkspaceDefaultMode(workspaceId) {
    return getCanonicalWorkspace(workspaceId)?.defaultMode ?? null;
}
