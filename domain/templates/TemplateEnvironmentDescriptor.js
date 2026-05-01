import {
    createDerivedEnvironmentDescriptor,
    deriveDerivedEnvironmentId,
} from './DerivedEnvironmentDescriptor.js';

export function deriveTemplateEnvironmentId({
    lineageRootId,
    versionId,
    overrides = {},
    runtimeConfig = {},
    modeContext = {},
}) {
    return deriveDerivedEnvironmentId({
        lineage: {
            lineageRootId,
            versionId,
        },
        environment: {
            overrides,
            runtimeConfig,
            modeContext,
        },
    });
}

export function createTemplateEnvironmentDescriptor({
    environmentId,
    lineageRootId,
    versionId,
    overrides = {},
    runtimeConfig = {},
    modeContext,
    metadata = {},
}) {
    return createDerivedEnvironmentDescriptor({
        environmentId,
        lineage: {
            lineageRootId,
            versionId,
        },
        environment: {
            overrides,
            runtimeConfig,
            modeContext,
        },
        metadata,
    });
}
