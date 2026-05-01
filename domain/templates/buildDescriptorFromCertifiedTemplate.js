import { createDerivedEnvironmentDescriptor } from './DerivedEnvironmentDescriptor.js';
import { resolveCanonicalWorkspaceOverlayContext } from '../../platform/workspaces/index.js';

export function buildDescriptorFromCertifiedTemplate(template) {
    if (!template || typeof template !== 'object') {
        throw new Error('buildDescriptorFromCertifiedTemplate: template is required');
    }

    const lineageRootId =
        template?.lineageRootId ??
        template?.certification?.lineageRootId ??
        template?.lineage?.rootId ??
        template?.lineage?.lineageRootId ??
        null;
    const versionId =
        template?.versionId ??
        template?.certification?.lineageNodeId ??
        template?.lineage?.nodeId ??
        template?.lineage?.versionId ??
        null;

    if (!lineageRootId || !versionId) {
        throw new Error('buildDescriptorFromCertifiedTemplate: missing lineage identity');
    }

    const explicitModeContext = template?.modeContext ?? null;
    const resolvedContext = explicitModeContext
        ? null
        : resolveCanonicalWorkspaceOverlayContext({
              workspaceId: template?.workspaceId ?? null,
              modeId: template?.modeId ?? template?.mode ?? null,
          });
    const workspaceId = explicitModeContext?.workspaceId ?? resolvedContext?.workspaceId ?? null;
    const modeId =
        explicitModeContext?.modeId ??
        resolvedContext?.canonicalModeId ??
        resolvedContext?.modeId ??
        null;
    const overlayId =
        explicitModeContext?.overlayId ??
        resolvedContext?.overlayId ??
        null;

    if (!workspaceId || !modeId) {
        throw new Error('buildDescriptorFromCertifiedTemplate: missing modeContext');
    }

    return createDerivedEnvironmentDescriptor({
        lineage: {
            lineageRootId,
            versionId,
        },
        environment: {
            overrides: {},
            runtimeConfig: {},
            modeContext: {
                workspaceId,
                modeId,
                ...(overlayId ? { overlayId } : {}),
            },
        },
        metadata: {
            source: 'certified-template',
            templateId: template?.id ?? null,
        },
    });
}
