import { exportStaticHTML } from '../static/exportStaticHTML';
import { buildWordPressTheme } from './buildWordPressTheme';

/**
 * WordPress exporter (structure only).
 * Dev-only, non-breaking, deterministic.
 */
export function exportWordPress(droppleSpec) {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('[WordPressExport] Dev-only exporter');
    }

    const intent = droppleSpec?.intent || {};
    const themeFiles = buildWordPressTheme(droppleSpec, {
        intent,
        enableSemanticTags: true,
        enableIntentAttributes: true,
    });
    const staticExport = exportStaticHTML(droppleSpec);
    const readme = buildReadme(droppleSpec);

    const intentFiles = Object.entries(staticExport.files)
        .filter(([path]) =>
            path.startsWith('static-export/motion/') ||
            path.startsWith('static-export/interaction/') ||
            path.startsWith('static-export/capabilities/')
        )
        .reduce((acc, [path, content]) => {
            const nextPath = path.replace('static-export/', 'wordpress-export/');
            acc[nextPath] = content;
            return acc;
        }, {});

    const files = {
        'wordpress-export/README.md': readme,
        ...Object.entries(themeFiles).reduce((acc, [name, content]) => {
            acc[`wordpress-export/theme/${name}`] = content;
            return acc;
        }, {}),
        ...intentFiles,
    };

    return {
        files,
        directories: [
            'wordpress-export/',
            'wordpress-export/theme/',
            'wordpress-export/motion/',
            'wordpress-export/interaction/',
            'wordpress-export/capabilities/',
        ],
        meta: { format: 'wordpress-export-v1' },
    };
}

function buildReadme(droppleSpec) {
    const lines = [
        'This is a structure-only WordPress theme.',
        '',
        'Motion, interaction, and capabilities are inactive.',
        'Users must activate behavior via plugins or custom code.',
        'No credentials are included.',
        'Dropple does not configure WordPress.',
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

function sortCapabilities(a, b) {
    if (a.capability !== b.capability) {
        return String(a.capability).localeCompare(String(b.capability));
    }
    return String(a.provider).localeCompare(String(b.provider));
}
