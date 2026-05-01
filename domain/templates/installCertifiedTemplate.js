import { buildDescriptorFromCertifiedTemplate } from './buildDescriptorFromCertifiedTemplate.js';
import { buildRuntimeSnapshotFromCertifiedTemplate } from './buildRuntimeSnapshotFromCertifiedTemplate.js';
import { activateResolvedTemplateEnvironment } from '../../runtime/templates/activateResolvedTemplateEnvironment.js';

export { buildRuntimeSnapshotFromCertifiedTemplate } from './buildRuntimeSnapshotFromCertifiedTemplate.js';

export function installCertifiedTemplate({ dispatcher, template } = {}) {
    if (!dispatcher?.hydrateRuntimeState) {
        throw new Error('Missing dispatcher.');
    }

    const descriptor = buildDescriptorFromCertifiedTemplate(template);
    const activation = activateResolvedTemplateEnvironment({
        resolved: {
            environmentId: descriptor.environmentId,
            lineage: descriptor.lineage,
            descriptor,
            template,
            resolvedEnvironment: descriptor.environment,
            metadata: descriptor.metadata,
        },
        dispatcher,
        animate: false,
    });

    return {
        installed: true,
        descriptor,
        environmentId: activation.environmentId,
        hydratedState: activation.hydratedState,
        structuralHash:
            template?.certification?.structuralHash ??
            template?.certification?.snapshotHash ??
            null,
    };
}
