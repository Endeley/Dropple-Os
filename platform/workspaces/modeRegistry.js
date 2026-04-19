import {
    CANONICAL_MODES,
    hasCanonicalMode,
    resolveCanonicalWorkspaceForMode,
} from './canonicalRegistry.js';

/* =========================
   MODE REGISTRY (MODE TRUTH)
   ========================= */

export const MODE_REGISTRY = Object.freeze({
    uiux: Object.freeze({
        id: 'uiux',
        label: 'UI / UX',
        workspaceId: 'design',
        definitionId: 'uiux',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: true,
            export: true,
            review: false,
            readOnly: false,
        }),
    }),

    graphic: Object.freeze({
        id: 'graphic',
        label: 'Graphic',
        workspaceId: 'design',
        definitionId: 'graphic',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        }),
    }),

    branding: Object.freeze({
        id: 'branding',
        label: 'Branding',
        workspaceId: 'design',
        definitionId: 'branding',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        }),
    }),

    icons: Object.freeze({
        id: 'icons',
        label: 'Icons',
        workspaceId: 'design',
        definitionId: 'icons',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        }),
    }),

    document: Object.freeze({
        id: 'document',
        label: 'Document',
        workspaceId: 'design',
        definitionId: 'document',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        }),
    }),

    animation: Object.freeze({
        id: 'animation',
        label: 'Animation',
        workspaceId: 'media',
        definitionId: 'animation',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: true,
            export: true,
            review: false,
            readOnly: false,
        }),
    }),

    video: Object.freeze({
        id: 'video',
        label: 'Video',
        workspaceId: 'media',
        definitionId: 'video',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: true,
            export: true,
            review: false,
            readOnly: false,
        }),
    }),

    podcast: Object.freeze({
        id: 'podcast',
        label: 'Podcast',
        workspaceId: 'media',
        definitionId: 'podcast',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: true,
            export: true,
            review: false,
            readOnly: false,
        }),
    }),

    'motion-design': Object.freeze({
        id: 'motion-design',
        label: 'Motion Design',
        workspaceId: 'media',
        definitionId: 'animation',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: true,
            export: true,
            review: false,
            readOnly: false,
        }),
    }),

    application: Object.freeze({
        id: 'application',
        label: 'Application',
        workspaceId: 'build',
        definitionId: 'dev',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        }),
    }),

    logic: Object.freeze({
        id: 'logic',
        label: 'Data & Logic',
        workspaceId: 'build',
        definitionId: 'dev',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: false,
            review: false,
            readOnly: false,
        }),
    }),

    'state-machine': Object.freeze({
        id: 'state-machine',
        label: 'State Machines',
        workspaceId: 'build',
        definitionId: 'dev',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: false,
            review: false,
            readOnly: false,
        }),
    }),

    api: Object.freeze({
        id: 'api',
        label: 'API / Integration',
        workspaceId: 'build',
        definitionId: 'dev',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: false,
            review: false,
            readOnly: false,
        }),
    }),

    conversion: Object.freeze({
        id: 'conversion',
        label: 'Conversion',
        workspaceId: 'build',
        definitionId: 'conversion',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        }),
    }),

    'ai-build': Object.freeze({
        id: 'ai-build',
        label: 'AI Build',
        workspaceId: 'build',
        definitionId: 'ai',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: false,
            review: false,
            readOnly: false,
        }),
    }),

    tokens: Object.freeze({
        id: 'tokens',
        label: 'Design Tokens',
        workspaceId: 'system',
        definitionId: 'material',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        }),
    }),

    components: Object.freeze({
        id: 'components',
        label: 'Component Libraries',
        workspaceId: 'system',
        definitionId: 'material',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        }),
    }),

    variants: Object.freeze({
        id: 'variants',
        label: 'Variants',
        workspaceId: 'system',
        definitionId: 'material',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        }),
    }),

    themes: Object.freeze({
        id: 'themes',
        label: 'Themes',
        workspaceId: 'system',
        definitionId: 'material',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        }),
    }),

    versioning: Object.freeze({
        id: 'versioning',
        label: 'Versioning',
        workspaceId: 'system',
        definitionId: 'material',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: false,
            review: false,
            readOnly: false,
        }),
    }),

    review: Object.freeze({
        id: 'review',
        label: 'Review',
        workspaceId: 'collaborate',
        definitionId: 'review',
        exposure: Object.freeze({
            tools: false,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: true,
            export: false,
            review: true,
            readOnly: true,
        }),
    }),

    comments: Object.freeze({
        id: 'comments',
        label: 'Comments',
        workspaceId: 'collaborate',
        definitionId: 'review',
        exposure: Object.freeze({
            tools: false,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: true,
            export: false,
            review: true,
            readOnly: true,
        }),
    }),

    production: Object.freeze({
        id: 'production',
        label: 'Production',
        workspaceId: 'collaborate',
        definitionId: 'review',
        exposure: Object.freeze({
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: true,
            export: false,
            review: true,
            readOnly: false,
        }),
    }),

    knowledge: Object.freeze({
        id: 'knowledge',
        label: 'Knowledge',
        workspaceId: 'collaborate',
        definitionId: 'education',
        exposure: Object.freeze({
            tools: false,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: false,
            review: false,
            readOnly: true,
        }),
    }),

    education: Object.freeze({
        id: 'education',
        label: 'Education',
        workspaceId: 'collaborate',
        definitionId: 'education',
        exposure: Object.freeze({
            tools: false,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: true,
            export: false,
            review: false,
            readOnly: true,
        }),
    }),
});

/* =========================
   🔒 CONSTITUTIONAL GUARDS
   ========================= */

(function validateModeRegistry() {
    const modeIds = Object.keys(MODE_REGISTRY);

    const REQUIRED_EXPOSURE_KEYS = [
        'tools',
        'panels',
        'canvas',
        'inspector',
        'timeline',
        'export',
        'review',
        'readOnly',
    ];

    for (const canonicalModeId of Object.keys(CANONICAL_MODES)) {
        if (!MODE_REGISTRY[canonicalModeId]) {
            throw new Error(
                `[Dropple Constitution] Missing mode "${canonicalModeId}" in MODE_REGISTRY`
            );
        }
    }

    for (const modeId of modeIds) {
        if (!CANONICAL_MODES[modeId]) {
            throw new Error(
                `[Dropple Constitution] Unknown mode "${modeId}" not in CANONICAL_MODES`
            );
        }
    }

    for (const modeId of modeIds) {
        const mode = MODE_REGISTRY[modeId];

        if (mode.id !== modeId) {
            throw new Error(
                `[Dropple Constitution] Mode id mismatch: key=${modeId}, value=${mode.id}`
            );
        }

        if (!hasCanonicalMode(modeId)) {
            throw new Error(
                `[Dropple Constitution] Non-canonical mode "${modeId}"`
            );
        }

        if (mode.workspaceId !== resolveCanonicalWorkspaceForMode(modeId)) {
            throw new Error(
                `[Dropple Constitution] Mode "${modeId}" assigned to "${mode.workspaceId}" but canonical is "${resolveCanonicalWorkspaceForMode(modeId)}"`
            );
        }

        if (!mode.definitionId || typeof mode.definitionId !== 'string') {
            throw new Error(
                `[Dropple Constitution] Mode "${modeId}" must declare definitionId`
            );
        }

        if (!mode.exposure || typeof mode.exposure !== 'object') {
            throw new Error(
                `[Dropple Constitution] Mode "${modeId}" must declare exposure`
            );
        }

        for (const key of REQUIRED_EXPOSURE_KEYS) {
            if (!(key in mode.exposure)) {
                throw new Error(
                    `[Dropple Constitution] Mode "${modeId}" missing exposure key "${key}"`
                );
            }

            if (typeof mode.exposure[key] !== 'boolean') {
                throw new Error(
                    `[Dropple Constitution] Mode "${modeId}" exposure "${key}" must be boolean`
                );
            }
        }

        if (mode.exposure.readOnly && mode.exposure.tools) {
            throw new Error(
                `[Dropple Constitution] Mode "${modeId}" cannot be readOnly and expose tools`
            );
        }

        if (mode.exposure.review && !mode.exposure.canvas) {
            throw new Error(
                `[Dropple Constitution] Mode "${modeId}" review mode must expose canvas`
            );
        }
    }
})();

/* =========================
   PUBLIC HELPERS
   ========================= */

export function listModeRegistryIds() {
    return Object.keys(MODE_REGISTRY).sort();
}

export function getModeDefinition(modeId) {
    return MODE_REGISTRY[modeId] ?? null;
}

export function hasModeDefinition(modeId) {
    return Boolean(modeId && MODE_REGISTRY[modeId]);
}

export function resolveModeDefinitionId(modeId) {
    return getModeDefinition(modeId)?.definitionId ?? null;
}

export function resolveModeExposure(modeId) {
    return getModeDefinition(modeId)?.exposure ?? null;
}
