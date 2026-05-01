import { ArtifactKind } from '@/gallery/artifacts/types.js';

export function getArtifactPresentation(artifact) {
  switch (artifact?.kind) {
    case ArtifactKind.ENVIRONMENT:
      return {
        label: 'Reproducible',
        description: 'Can be replayed and modified',
        badgeStyle: {
          border: '1px solid rgba(20, 130, 90, 0.24)',
          background: 'rgba(20, 130, 90, 0.12)',
          color: '#0f6b4b',
        },
        capabilities: {
          canInstall: true,
          canRemix: true,
          canInspectLineage: true,
        },
      };
    case ArtifactKind.SNAPSHOT:
      return {
        label: 'Final',
        description: 'Frozen output',
        badgeStyle: {
          border: '1px solid rgba(107, 114, 128, 0.24)',
          background: 'rgba(107, 114, 128, 0.12)',
          color: 'var(--text-muted)',
        },
        capabilities: {
          canInstall: false,
          canRemix: false,
          canInspectLineage: false,
        },
      };
    default:
      throw new Error(`Unknown artifact kind: ${artifact?.kind ?? 'missing'}`);
  }
}
