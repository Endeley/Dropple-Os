import { resolveTemplateEnvironment } from '@/domain/templates/resolveTemplateEnvironment.js';
import {
    activateResolvedTemplateEnvironment,
    buildRuntimeSnapshotFromTemplateEnvironment,
} from '@/runtime/templates/activateResolvedTemplateEnvironment.js';

export { buildRuntimeSnapshotFromTemplateEnvironment } from '@/runtime/templates/activateResolvedTemplateEnvironment.js';

export function activateTemplateEnvironment({
    descriptor,
    dispatcher,
    animate = false,
} = {}) {
    if (!dispatcher?.hydrateRuntimeState) {
        throw new Error('Template environment activation requires a dispatcher with hydrateRuntimeState().');
    }

    const resolved = resolveTemplateEnvironment(descriptor);
    return activateResolvedTemplateEnvironment({
        resolved,
        dispatcher,
        animate,
    });
}
