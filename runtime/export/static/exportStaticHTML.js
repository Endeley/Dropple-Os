import { buildStaticHTML } from './buildStaticHTML';

/**
 * Static HTML exporter (structure only).
 * Dev-only, non-breaking, deterministic.
 */
export function exportStaticHTML(droppleSpec) {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('[StaticExport] Dev-only exporter');
    }

    const intent = droppleSpec?.intent || {};
    const html = buildStaticHTML(droppleSpec, {
        intent,
        enableSemanticTags: true,
        enableIntentAttributes: true,
    });
    const motionFiles = buildMotionFiles(droppleSpec);
    const interactionFiles = buildInteractionFiles(droppleSpec);
    const capabilityFiles = buildCapabilityFiles(droppleSpec);
    const readme = buildReadme(droppleSpec);

    const files = {
        'static-export/index.html': html,
        'static-export/README.md': readme,
        ...motionFiles,
        ...interactionFiles,
        ...capabilityFiles,
    };

    return {
        files,
        directories: [
            'static-export/',
            'static-export/assets/',
            'static-export/assets/css/',
            'static-export/assets/images/',
            'static-export/motion/',
            'static-export/interaction/',
            'static-export/capabilities/',
        ],
        meta: { format: 'static-html-v1' },
    };
}

function buildMotionFiles(droppleSpec) {
    const files = {};
    const nodes = [...(droppleSpec?.nodes ?? [])].sort(sortById);

    for (const node of nodes) {
        const motion = extractMotionIntent(droppleSpec, node);
        if (!motion) continue;

        const payload = {
            id: node.id,
            kind: 'motion',
            timeline: {
                start: motion.start ?? 0,
                end: motion.end ?? 0,
                duration: motion.duration ?? 0,
            },
            keyframes: motion.keyframes ?? [],
            easing: motion.easing ?? 'linear',
            autoplay: motion.autoplay ?? false,
            loop: motion.loop ?? false,
        };

        files[`static-export/motion/${node.id}.json`] = JSON.stringify(payload, null, 2);
    }

    return files;
}

function buildInteractionFiles(droppleSpec) {
    const files = {};
    const nodes = [...(droppleSpec?.nodes ?? [])].sort(sortById);

    for (const node of nodes) {
        const interaction = extractInteractionIntent(droppleSpec, node);
        if (!interaction) continue;

        const payload = {
            id: node.id,
            kind: 'interaction',
            events: {
                click: interaction.events?.click ?? null,
                hover: interaction.events?.hover ?? null,
                focus: interaction.events?.focus ?? null,
                blur: interaction.events?.blur ?? null,
                drag: interaction.events?.drag ?? null,
            },
            gestures: {
                pointerDown: interaction.gestures?.pointerDown ?? null,
                pointerMove: interaction.gestures?.pointerMove ?? null,
                pointerUp: interaction.gestures?.pointerUp ?? null,
            },
        };

        files[`static-export/interaction/${node.id}.json`] = JSON.stringify(payload, null, 2);
    }

    return files;
}

function buildCapabilityFiles(droppleSpec) {
    const files = {};
    const capabilities = normalizeCapabilities(droppleSpec).sort(sortCapabilities);

    for (const cap of capabilities) {
        if (!cap?.capability || !cap?.provider) continue;

        const payload = {
            capability: cap.capability,
            provider: cap.provider,
            status: 'inactive',
            preparedFor: cap.preparedFor ?? [],
            assumptions: cap.assumptions ?? [],
            notes: cap.notes ?? '',
        };

        files[
            `static-export/capabilities/${cap.capability}/${cap.provider}.json`
        ] = JSON.stringify(payload, null, 2);
    }

    return files;
}

function extractMotionIntent(droppleSpec, node) {
    const intentMotion = droppleSpec?.intent?.motion?.[node.id];
    if (intentMotion && typeof intentMotion === 'object') {
        return intentMotion;
    }

    const motion = node?.props?.motion;
    if (!motion || typeof motion !== 'object') return null;

    const hasFields =
        motion.start != null ||
        motion.end != null ||
        motion.duration != null ||
        motion.keyframes != null ||
        motion.easing != null ||
        motion.autoplay != null ||
        motion.loop != null;

    return hasFields ? motion : null;
}

function extractInteractionIntent(droppleSpec, node) {
    const intentInteraction = droppleSpec?.intent?.interaction?.[node.id];
    if (intentInteraction && typeof intentInteraction === 'object') {
        return intentInteraction;
    }

    const interaction = node?.props?.interaction;
    if (!interaction || typeof interaction !== 'object') return null;

    const hasEvents = interaction.events && typeof interaction.events === 'object';
    const hasGestures = interaction.gestures && typeof interaction.gestures === 'object';

    return hasEvents || hasGestures ? interaction : null;
}

function sortById(a, b) {
    return String(a.id).localeCompare(String(b.id));
}

function sortCapabilities(a, b) {
    if (a.capability !== b.capability) {
        return String(a.capability).localeCompare(String(b.capability));
    }
    return String(a.provider).localeCompare(String(b.provider));
}

function normalizeCapabilities(droppleSpec) {
    const intentCaps = droppleSpec?.intent?.capabilities;
    if (intentCaps && typeof intentCaps === 'object' && !Array.isArray(intentCaps)) {
        return Object.entries(intentCaps)
            .filter(([, value]) => value && typeof value === 'object' && value.provider)
            .map(([capability, value]) => ({
                capability,
                provider: value.provider,
                preparedFor: value.preparedFor ?? [],
                assumptions: value.assumptions ?? [],
                notes: value.notes ?? '',
            }));
    }

    return [...(droppleSpec?.capabilities ?? [])];
}

function buildReadme(droppleSpec) {
    const lines = [
        'This is a static scaffold.',
        '',
        'Motion/interaction are intent only.',
        'Nothing is active.',
        'User must wire everything manually.',
        'Dropple does not execute, connect, or configure services.',
    ];

    const capabilities = normalizeCapabilities(droppleSpec);
    if (capabilities.length) {
        lines.push('');
        lines.push('## Capabilities (Not Activated)');
        for (const cap of capabilities.sort(sortCapabilities)) {
            lines.push(`- ${cap.capability}: ${cap.provider} (prepared, not configured)`);
        }
    }

    lines.push('');
    return lines.join('\n');
}
