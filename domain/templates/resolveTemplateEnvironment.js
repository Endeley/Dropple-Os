import { createDerivedEnvironmentDescriptor } from './DerivedEnvironmentDescriptor.js';
import { resolveTemplateByLineageKey } from './TemplateRegistry.js';

function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
        return value;
    }

    Object.freeze(value);

    if (Array.isArray(value)) {
        value.forEach((item) => deepFreeze(item));
        return value;
    }

    Object.values(value).forEach((item) => deepFreeze(item));
    return value;
}

export function resolveTemplateEnvironment(descriptorInput = {}) {
    const descriptor = createDerivedEnvironmentDescriptor(descriptorInput);
    const template = resolveTemplateByLineageKey({
        lineageRootId: descriptor.lineage.lineageRootId,
        versionId: descriptor.lineage.versionId,
    });

    if (!template) {
        throw new Error(
            `Template environment resolution failed: unknown lineage key ${descriptor.lineage.lineageRootId}:${descriptor.lineage.versionId}.`,
        );
    }

    return deepFreeze({
        environmentId: descriptor.environmentId,
        lineage: descriptor.lineage,
        descriptor,
        template,
        resolvedEnvironment: descriptor.environment,
        metadata: descriptor.metadata,
    });
}
