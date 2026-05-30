const OVERLAY_CLASSES = Object.freeze({
    capability: 'capability',
    payload: 'payload',
});

function freezeEntry(entry) {
    return Object.freeze({
        ...entry,
        legacyModes: Object.freeze([...(entry.legacyModes ?? [])]),
        payload: Object.freeze({ ...(entry.payload ?? {}) }),
    });
}

export const OVERLAY_REGISTRY = Object.freeze({
    branding: freezeEntry({
        ownerWorkspaceId: 'design',
        ownerModeId: 'graphic',
        overlayId: 'brand-systems',
        class: OVERLAY_CLASSES.capability,
        legacyModes: ['branding'],
        payload: {
            engines: ['brand', 'tokens', 'rules', 'vector'],
            exports: ['brand-kit', 'tokens', 'pdf'],
        },
    }),

    icons: freezeEntry({
        ownerWorkspaceId: 'design',
        ownerModeId: 'graphic',
        overlayId: 'icon-systems',
        class: OVERLAY_CLASSES.capability,
        legacyModes: ['icons'],
        payload: {
            tools: ['select', 'path', 'stroke'],
            exports: ['svg', 'icon-font'],
        },
    }),

    'motion-design': freezeEntry({
        ownerWorkspaceId: 'media',
        ownerModeId: 'animation',
        overlayId: 'motion-graphics',
        class: OVERLAY_CLASSES.capability,
        legacyModes: ['motion-design'],
        payload: {
            engines: ['timeline', 'composite', 'kinetic-type'],
        },
    }),

    podcast: freezeEntry({
        ownerWorkspaceId: 'media',
        ownerModeId: 'audio',
        overlayId: 'podcast',
        class: OVERLAY_CLASSES.payload,
        legacyModes: ['podcast'],
        payload: {
            engines: ['timeline', 'audio'],
            tools: ['cut', 'mute', 'chapter'],
            timelineProperties: ['volume', 'mute'],
            exports: ['mp3', 'wav'],
        },
    }),

    'state-machine': freezeEntry({
        ownerWorkspaceId: 'build',
        ownerModeId: 'logic',
        overlayId: 'state-machine',
        class: OVERLAY_CLASSES.capability,
        legacyModes: ['state-machine'],
        payload: {
            specialization: 'state-machine',
        },
    }),

    api: freezeEntry({
        ownerWorkspaceId: 'build',
        ownerModeId: 'automation',
        overlayId: 'api',
        class: OVERLAY_CLASSES.capability,
        legacyModes: ['api'],
        payload: {
            specialization: 'api-integration',
        },
    }),

    conversion: freezeEntry({
        ownerWorkspaceId: 'build',
        ownerModeId: 'automation',
        overlayId: 'conversion',
        class: OVERLAY_CLASSES.payload,
        legacyModes: ['conversion'],
        payload: {
            exports: ['css', 'lottie', 'react'],
            codegen: true,
        },
    }),

    'ai-build': freezeEntry({
        ownerWorkspaceId: 'build',
        ownerModeId: 'automation',
        overlayId: 'ai-systems',
        class: OVERLAY_CLASSES.payload,
        legacyModes: ['ai-build'],
        payload: {
            aiAssisted: true,
        },
    }),

    'systems-engineering': freezeEntry({
        ownerWorkspaceId: 'build',
        ownerModeId: 'automation',
        overlayId: 'systems-engineering',
        class: OVERLAY_CLASSES.payload,
        legacyModes: ['systems-engineering'],
        payload: {
            domain: 'systems-engineering',
            engines: ['graph', 'workflow', 'simulation'],
            artifacts: ['spec', 'trace', 'report'],
        },
    }),

    'enterprise-operations': freezeEntry({
        ownerWorkspaceId: 'build',
        ownerModeId: 'automation',
        overlayId: 'enterprise-operations',
        class: OVERLAY_CLASSES.payload,
        legacyModes: ['enterprise-operations'],
        payload: {
            domain: 'enterprise-operations',
            engines: ['workflow', 'data', 'automation'],
            governanceSurface: {
                workspaceId: 'collaborate',
                modeId: 'production',
            },
        },
    }),

    themes: freezeEntry({
        ownerWorkspaceId: 'system',
        ownerModeId: 'tokens',
        overlayId: 'themes',
        class: OVERLAY_CLASSES.capability,
        legacyModes: ['themes'],
        payload: {
            specialization: 'theme-authoring',
        },
    }),

    variants: freezeEntry({
        ownerWorkspaceId: 'system',
        ownerModeId: 'components',
        overlayId: 'variants',
        class: OVERLAY_CLASSES.capability,
        legacyModes: ['variants'],
        payload: {
            specialization: 'component-variants',
        },
    }),

    versioning: freezeEntry({
        ownerWorkspaceId: 'system',
        ownerModeId: 'governance',
        overlayId: 'versioning',
        class: OVERLAY_CLASSES.payload,
        legacyModes: ['versioning'],
        payload: {
            features: [
                'diff',
                'compare',
                'merge',
                'conflict-resolution',
                'review',
                'rollback',
            ],
        },
    }),

    comments: freezeEntry({
        ownerWorkspaceId: 'collaborate',
        ownerModeId: 'review',
        overlayId: 'comments',
        class: OVERLAY_CLASSES.capability,
        legacyModes: ['comments'],
        payload: {
            specialization: 'review-comments',
        },
    }),

    education: freezeEntry({
        ownerWorkspaceId: 'collaborate',
        ownerModeId: 'knowledge',
        overlayId: 'learning',
        class: OVERLAY_CLASSES.payload,
        legacyModes: ['education'],
        payload: {
            readOnly: true,
            tools: ['select', 'step', 'explain'],
            engines: ['ai', 'tutorial', 'replay'],
        },
    }),
});

(function validateOverlayRegistry() {
    const seenOverlayIds = new Set();
    const seenLegacyModes = new Set();

    for (const [entryId, entry] of Object.entries(OVERLAY_REGISTRY)) {
        if (!entry.ownerWorkspaceId || typeof entry.ownerWorkspaceId !== 'string') {
            throw new Error(
                `[Dropple Constitution] Overlay "${entryId}" must declare ownerWorkspaceId`
            );
        }

        if (!entry.ownerModeId || typeof entry.ownerModeId !== 'string') {
            throw new Error(
                `[Dropple Constitution] Overlay "${entryId}" must declare ownerModeId`
            );
        }

        if (!entry.overlayId || typeof entry.overlayId !== 'string') {
            throw new Error(
                `[Dropple Constitution] Overlay "${entryId}" must declare overlayId`
            );
        }

        if (!Object.values(OVERLAY_CLASSES).includes(entry.class)) {
            throw new Error(
                `[Dropple Constitution] Overlay "${entryId}" must declare a valid overlay class`
            );
        }

        if (!Array.isArray(entry.legacyModes) || entry.legacyModes.length === 0) {
            throw new Error(
                `[Dropple Constitution] Overlay "${entryId}" must preserve at least one legacy mode`
            );
        }

        if (seenOverlayIds.has(entry.overlayId)) {
            throw new Error(
                `[Dropple Constitution] Overlay id "${entry.overlayId}" is duplicated`
            );
        }
        seenOverlayIds.add(entry.overlayId);

        for (const legacyModeId of entry.legacyModes) {
            if (typeof legacyModeId !== 'string' || legacyModeId.length === 0) {
                throw new Error(
                    `[Dropple Constitution] Overlay "${entryId}" contains an invalid legacy mode id`
                );
            }

            if (seenLegacyModes.has(legacyModeId)) {
                throw new Error(
                    `[Dropple Constitution] Legacy mode "${legacyModeId}" is owned by multiple overlays`
                );
            }

            seenLegacyModes.add(legacyModeId);
        }
    }
})();

export function hasOverlayEntry(entryId) {
    return Boolean(entryId && OVERLAY_REGISTRY[entryId]);
}

export function getOverlayEntry(entryId) {
    return hasOverlayEntry(entryId)
        ? OVERLAY_REGISTRY[entryId]
        : null;
}

export function listOverlayEntryIds() {
    return Object.keys(OVERLAY_REGISTRY).sort();
}

export function listOverlayIds() {
    return Object.values(OVERLAY_REGISTRY)
        .map((entry) => entry.overlayId)
        .sort();
}

export function resolveOverlayByLegacyMode(modeId) {
    if (hasOverlayEntry(modeId)) {
        return getOverlayEntry(modeId);
    }

    return Object.values(OVERLAY_REGISTRY).find((entry) =>
        entry.legacyModes.includes(modeId),
    ) ?? null;
}

export function getOverlaysForMode(modeId) {
    return Object.values(OVERLAY_REGISTRY).filter(
        (entry) => entry.ownerModeId === modeId,
    );
}
