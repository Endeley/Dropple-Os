import { ArtifactKind } from '@/gallery/artifacts/types.js';

const EXPORT_FORMATS = Object.freeze([
    'json',
    'svg',
    'png',
]);

const ENVIRONMENT_EXPORT_CAPABILITIES = Object.freeze({
    mode: 'rebuild',
    reproducible: true,
    supportsLineage: true,
    supportsReplay: true,
    formats: EXPORT_FORMATS,
    label: 'Reproducible',
    description: 'Exports from descriptor-defined environment',
});

const SNAPSHOT_EXPORT_CAPABILITIES = Object.freeze({
    mode: 'final',
    reproducible: false,
    supportsLineage: false,
    supportsReplay: false,
    formats: EXPORT_FORMATS,
    label: 'Final',
    description: 'Exports from frozen runtime state',
});

export function getExportCapabilities(artifact) {
    if (!artifact || !artifact.kind) {
        throw new Error('Invalid artifact: missing kind');
    }

    switch (artifact.kind) {
        case ArtifactKind.ENVIRONMENT:
            return ENVIRONMENT_EXPORT_CAPABILITIES;
        case ArtifactKind.SNAPSHOT:
            return SNAPSHOT_EXPORT_CAPABILITIES;
        default:
            throw new Error(`Unknown artifact kind: ${artifact.kind}`);
    }
}
