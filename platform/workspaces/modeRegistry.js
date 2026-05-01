import {
    CANONICAL_MODES,
    resolveCanonicalWorkspaceForMode,
} from './canonicalRegistry.js';
import { resolveOverlayByLegacyMode } from './overlayRegistry.js';

function freezeExposure(exposure) {
    return Object.freeze({
        tools: exposure.tools,
        panels: exposure.panels,
        canvas: exposure.canvas,
        inspector: exposure.inspector,
        timeline: exposure.timeline,
        export: exposure.export,
        review: exposure.review,
        readOnly: exposure.readOnly,
    });
}

function freezeModeDefinition({ id, label, workspaceId, definitionId, exposure }) {
    return Object.freeze({
        id,
        label,
        workspaceId,
        definitionId,
        exposure: freezeExposure(exposure),
    });
}

/* =========================
   MODE REGISTRY (CANONICAL SOVEREIGNTY)
   ========================= */

export const MODE_REGISTRY = Object.freeze({
    uiux: freezeModeDefinition({
        id: 'uiux',
        label: 'UI / UX',
        workspaceId: 'design',
        definitionId: 'uiux',
        exposure: {
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: true,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    graphic: freezeModeDefinition({
        id: 'graphic',
        label: 'Graphic',
        workspaceId: 'design',
        definitionId: 'graphic',
        exposure: {
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    document: freezeModeDefinition({
        id: 'document',
        label: 'Document',
        workspaceId: 'design',
        definitionId: 'document',
        exposure: {
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    animation: freezeModeDefinition({
        id: 'animation',
        label: 'Animation',
        workspaceId: 'media',
        definitionId: 'animation',
        exposure: {
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: true,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    video: freezeModeDefinition({
        id: 'video',
        label: 'Video',
        workspaceId: 'media',
        definitionId: 'video',
        exposure: {
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: true,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    audio: freezeModeDefinition({
        id: 'audio',
        label: 'Audio',
        workspaceId: 'media',
        definitionId: 'podcast',
        exposure: {
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: true,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    application: freezeModeDefinition({
        id: 'application',
        label: 'Application',
        workspaceId: 'build',
        definitionId: 'dev',
        exposure: {
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    logic: freezeModeDefinition({
        id: 'logic',
        label: 'Logic',
        workspaceId: 'build',
        definitionId: 'dev',
        exposure: {
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: false,
            review: false,
            readOnly: false,
        },
    }),

    automation: freezeModeDefinition({
        id: 'automation',
        label: 'Automation',
        workspaceId: 'build',
        definitionId: 'conversion',
        exposure: {
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    tokens: freezeModeDefinition({
        id: 'tokens',
        label: 'Design Tokens',
        workspaceId: 'system',
        definitionId: 'material',
        exposure: {
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    components: freezeModeDefinition({
        id: 'components',
        label: 'Component Libraries',
        workspaceId: 'system',
        definitionId: 'material',
        exposure: {
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    governance: freezeModeDefinition({
        id: 'governance',
        label: 'Governance',
        workspaceId: 'system',
        definitionId: 'material',
        exposure: {
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: false,
            review: false,
            readOnly: false,
        },
    }),

    review: freezeModeDefinition({
        id: 'review',
        label: 'Review',
        workspaceId: 'collaborate',
        definitionId: 'review',
        exposure: {
            tools: false,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: true,
            export: false,
            review: true,
            readOnly: true,
        },
    }),

    production: freezeModeDefinition({
        id: 'production',
        label: 'Production',
        workspaceId: 'collaborate',
        definitionId: 'review',
        exposure: {
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: true,
            export: false,
            review: true,
            readOnly: false,
        },
    }),

    knowledge: freezeModeDefinition({
        id: 'knowledge',
        label: 'Knowledge',
        workspaceId: 'collaborate',
        definitionId: 'education',
        exposure: {
            tools: false,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: false,
            review: false,
            readOnly: false,
        },
    }),
});

/* =========================
   LEGACY COMPATIBILITY DEFINITIONS
   ========================= */

const LEGACY_MODE_DEFINITIONS = Object.freeze({
    branding: freezeModeDefinition({
        id: 'branding',
        label: 'Branding',
        workspaceId: 'design',
        definitionId: 'branding',
        exposure: {
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    icons: freezeModeDefinition({
        id: 'icons',
        label: 'Icons',
        workspaceId: 'design',
        definitionId: 'icons',
        exposure: {
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    podcast: freezeModeDefinition({
        id: 'podcast',
        label: 'Podcast',
        workspaceId: 'media',
        definitionId: 'podcast',
        exposure: {
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: true,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    'motion-design': freezeModeDefinition({
        id: 'motion-design',
        label: 'Motion Design',
        workspaceId: 'media',
        definitionId: 'animation',
        exposure: {
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: true,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    'state-machine': freezeModeDefinition({
        id: 'state-machine',
        label: 'State Machines',
        workspaceId: 'build',
        definitionId: 'dev',
        exposure: {
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: false,
            review: false,
            readOnly: false,
        },
    }),

    api: freezeModeDefinition({
        id: 'api',
        label: 'API / Integration',
        workspaceId: 'build',
        definitionId: 'dev',
        exposure: {
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: false,
            review: false,
            readOnly: false,
        },
    }),

    conversion: freezeModeDefinition({
        id: 'conversion',
        label: 'Conversion',
        workspaceId: 'build',
        definitionId: 'conversion',
        exposure: {
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    'ai-build': freezeModeDefinition({
        id: 'ai-build',
        label: 'AI Build',
        workspaceId: 'build',
        definitionId: 'ai',
        exposure: {
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: false,
            review: false,
            readOnly: false,
        },
    }),

    variants: freezeModeDefinition({
        id: 'variants',
        label: 'Variants',
        workspaceId: 'system',
        definitionId: 'material',
        exposure: {
            tools: true,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    themes: freezeModeDefinition({
        id: 'themes',
        label: 'Themes',
        workspaceId: 'system',
        definitionId: 'material',
        exposure: {
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: true,
            review: false,
            readOnly: false,
        },
    }),

    versioning: freezeModeDefinition({
        id: 'versioning',
        label: 'Versioning',
        workspaceId: 'system',
        definitionId: 'material',
        exposure: {
            tools: true,
            panels: true,
            canvas: false,
            inspector: true,
            timeline: false,
            export: false,
            review: false,
            readOnly: false,
        },
    }),

    comments: freezeModeDefinition({
        id: 'comments',
        label: 'Comments',
        workspaceId: 'collaborate',
        definitionId: 'review',
        exposure: {
            tools: false,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: true,
            export: false,
            review: true,
            readOnly: true,
        },
    }),

    education: freezeModeDefinition({
        id: 'education',
        label: 'Education',
        workspaceId: 'collaborate',
        definitionId: 'education',
        exposure: {
            tools: false,
            panels: true,
            canvas: true,
            inspector: true,
            timeline: true,
            export: false,
            review: false,
            readOnly: true,
        },
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
        const mode = MODE_REGISTRY[modeId];

        if (mode.id !== modeId) {
            throw new Error(
                `[Dropple Constitution] Mode id mismatch: key=${modeId}, value=${mode.id}`
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

    for (const [modeId, mode] of Object.entries(LEGACY_MODE_DEFINITIONS)) {
        const overlay = resolveOverlayByLegacyMode(modeId);

        if (!overlay) {
            throw new Error(
                `[Dropple Constitution] Legacy compatibility mode "${modeId}" must resolve through OVERLAY_REGISTRY`
            );
        }

        if (mode.workspaceId !== overlay.ownerWorkspaceId) {
            throw new Error(
                `[Dropple Constitution] Legacy mode "${modeId}" assigned to "${mode.workspaceId}" but overlay owner is "${overlay.ownerWorkspaceId}"`
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
    return MODE_REGISTRY[modeId] ?? LEGACY_MODE_DEFINITIONS[modeId] ?? null;
}

export function hasModeDefinition(modeId) {
    return Boolean(modeId && getModeDefinition(modeId));
}

export function resolveModeDefinitionId(modeId) {
    return getModeDefinition(modeId)?.definitionId ?? null;
}

export function resolveModeExposure(modeId) {
    return getModeDefinition(modeId)?.exposure ?? null;
}
