import { buildDescriptorFromCertifiedTemplate } from '@/domain/templates/buildDescriptorFromCertifiedTemplate.js';
import { createDerivedEnvironmentDescriptor } from '@/domain/templates/DerivedEnvironmentDescriptor.js';
import { resolveTemplateEnvironment } from '@/domain/templates/resolveTemplateEnvironment.js';
import { mockLessons } from '@/marketplace/mockLessons';
import { forkLessonToWorkspace } from '@/education/forkLessonToWorkspace';
import { loadCertifiedTemplates } from '@/engine/templates/templateLoader.js';
import { createUuid } from '@/core/utils/createUuid.js';
import {
    resolveCanonicalWorkspaceOverlayContext,
} from '@/platform/workspaces/index.js';

export function createEmptyWorkspace(mode = 'design') {
    return {
        id: createUuid(),
        mode,
        snapshot: null,
        events: [],
        forkedFrom: null,
    };
}

export function getSearchParam(searchParams, key) {
    const value = searchParams?.[key];
    return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function resolveLaunchContextModeContext(launchContext = null) {
    const launchLanguage =
        typeof launchContext?.language === 'string' ? launchContext.language.trim() : '';
    if (!launchLanguage) {
        return null;
    }

    const resolvedContext = resolveCanonicalWorkspaceOverlayContext({
        modeId: launchLanguage,
    });
    const resolvedWorkspaceId = resolvedContext?.workspaceId ?? null;
    const resolvedModeId =
        resolvedContext?.canonicalModeId ??
        resolvedContext?.modeId ??
        launchLanguage ??
        null;

    if (!resolvedWorkspaceId || !resolvedModeId) {
        return null;
    }

    return Object.freeze({
        workspaceId: resolvedWorkspaceId,
        modeId: resolvedModeId,
        overlayId: resolvedContext?.overlayId ?? null,
    });
}

export function buildInitialEnvironmentDescriptorFromQuery(searchParams = {}, launchContext = null) {
    const lineageRootId = getSearchParam(searchParams, 'lineageRootId');
    const versionId =
        launchContext?.template?.versionId ??
        getSearchParam(searchParams, 'versionId') ??
        null;

    if (!lineageRootId && !versionId) {
        return null;
    }

    if (!lineageRootId || !versionId) {
        throw new Error('Workspace new requires both lineageRootId and versionId for environment boot.');
    }

    const overlayId = getSearchParam(searchParams, 'overlayId');
    const resolvedContext = resolveLaunchContextModeContext(launchContext);
    const resolvedWorkspaceId = resolvedContext?.workspaceId ?? getSearchParam(searchParams, 'workspaceId') ?? null;
    const resolvedModeId = resolvedContext?.modeId ?? getSearchParam(searchParams, 'modeId') ?? null;
    const resolvedOverlayId = overlayId ?? resolvedContext?.overlayId ?? null;

    if (!resolvedWorkspaceId || !resolvedModeId) {
        throw new Error('Workspace new environment boot requires launch-context language ownership.');
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
                workspaceId: resolvedWorkspaceId,
                modeId: resolvedModeId,
                ...(resolvedOverlayId ? { overlayId: resolvedOverlayId } : {}),
            },
        },
        metadata: {
            source: launchContext ? 'workspace-new-launch-context' : 'workspace-new-query',
        },
    });
}

export function resolveSeededWorkspace({
    initialEnvironmentDescriptor = null,
    fromTemplate = null,
    fromLesson = null,
}) {
    if (initialEnvironmentDescriptor) {
        return {
            workspace: createEmptyWorkspace(initialEnvironmentDescriptor.environment.modeContext.modeId),
            initialEnvironmentDescriptor,
            initialResolvedTemplateEnvironment: resolveTemplateEnvironment(initialEnvironmentDescriptor),
            initialRuntimeSnapshot: null,
        };
    }

    if (fromTemplate) {
        const certifiedTemplate = loadCertifiedTemplates().find((template) => template.id === fromTemplate);
        if (certifiedTemplate) {
            const initialDescriptor = buildDescriptorFromCertifiedTemplate(certifiedTemplate);
            return {
                workspace: createEmptyWorkspace(initialDescriptor.environment.modeContext.modeId),
                initialEnvironmentDescriptor: initialDescriptor,
                initialResolvedTemplateEnvironment: resolveTemplateEnvironment(initialDescriptor),
                initialRuntimeSnapshot: null,
            };
        }
    }

    if (fromLesson) {
        const lesson = mockLessons.find((entry) => entry.id === fromLesson);
        if (lesson) {
            return {
                workspace: forkLessonToWorkspace(lesson),
                initialEnvironmentDescriptor: null,
                initialResolvedTemplateEnvironment: null,
                initialRuntimeSnapshot: null,
            };
        }
    }

    return {
        workspace: createEmptyWorkspace(),
        initialEnvironmentDescriptor: null,
        initialResolvedTemplateEnvironment: null,
        initialRuntimeSnapshot: null,
    };
}
