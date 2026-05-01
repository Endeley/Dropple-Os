import { WorkspaceRoot } from '@/ui/workspace/root/WorkspaceRoot.jsx';
import { mockLessons } from '@/marketplace/mockLessons';
import { forkLessonToWorkspace } from '@/education/forkLessonToWorkspace';
import { loadCertifiedTemplates } from '@/engine/templates/templateLoader.js';
import { buildDescriptorFromCertifiedTemplate } from '@/domain/templates/buildDescriptorFromCertifiedTemplate.js';
import { createDerivedEnvironmentDescriptor } from '@/domain/templates/DerivedEnvironmentDescriptor.js';
import { resolveTemplateEnvironment } from '@/domain/templates/resolveTemplateEnvironment.js';
import {
  getWorkspaceDefinition,
  resolveCanonicalWorkspaceOverlayContext,
  resolveWorkspaceContext,
} from '@/platform/workspaces/index.js';

function createEmptyWorkspace(mode = 'design') {
  return {
    id: crypto.randomUUID(),
    mode,
    snapshot: null,
    events: [],
    forkedFrom: null,
  };
}

function getSearchParam(searchParams, key) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function buildInitialEnvironmentDescriptorFromQuery(searchParams = {}) {
  const lineageRootId = getSearchParam(searchParams, 'lineageRootId');
  const versionId = getSearchParam(searchParams, 'versionId');

  if (!lineageRootId && !versionId) {
    return null;
  }

  if (!lineageRootId || !versionId) {
    throw new Error('Workspace new requires both lineageRootId and versionId for environment boot.');
  }

  const workspaceId = getSearchParam(searchParams, 'workspaceId');
  const modeId = getSearchParam(searchParams, 'modeId');
  const overlayId = getSearchParam(searchParams, 'overlayId');
  const resolvedContext = resolveCanonicalWorkspaceOverlayContext({
    workspaceId,
    modeId,
  });
  const resolvedWorkspaceId = resolvedContext?.workspaceId ?? workspaceId ?? null;
  const resolvedModeId =
    resolvedContext?.canonicalModeId ??
    resolvedContext?.modeId ??
    modeId ??
    null;
  const resolvedOverlayId = overlayId ?? resolvedContext?.overlayId ?? null;

  if (!resolvedWorkspaceId || !resolvedModeId) {
    throw new Error('Workspace new environment boot requires workspaceId and modeId.');
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
      source: 'workspace-new-query',
    },
  });
}

function resolveSeededWorkspace({
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

export default function WorkspaceNewPage({ searchParams = {} }) {
  const initialEnvironmentDescriptor = buildInitialEnvironmentDescriptorFromQuery(searchParams);
  const fromTemplate = getSearchParam(searchParams, 'fromTemplate');
  const fromLesson = getSearchParam(searchParams, 'fromLesson');
  const {
    workspace,
    initialRuntimeSnapshot,
    initialEnvironmentDescriptor: resolvedInitialEnvironmentDescriptor,
    initialResolvedTemplateEnvironment,
  } = resolveSeededWorkspace({
    initialEnvironmentDescriptor,
    fromTemplate,
    fromLesson,
  });

  const initialCursorIndex = workspace.events.length ? workspace.events.length - 1 : -1;
  const workspaceContext = resolvedInitialEnvironmentDescriptor
    ? resolveWorkspaceContext({
        workspaceId: resolvedInitialEnvironmentDescriptor.environment.modeContext.workspaceId,
        modeId: resolvedInitialEnvironmentDescriptor.environment.modeContext.modeId,
      })
    : resolveWorkspaceContext({
        workspace: workspace.mode,
      });
  const workspaceDefinition = getWorkspaceDefinition(
    workspaceContext.definitionId ?? workspaceContext.workspaceId ?? workspace.mode
  );

  return (
    <WorkspaceRoot
      modeId={workspaceContext.mode ?? workspaceContext.modeId ?? workspace.mode}
      workspaceId={workspaceContext.definitionId ?? workspaceContext.workspaceId ?? workspace.mode}
      profile={workspaceDefinition?.profile ?? 'design'}
      workspace={workspaceDefinition}
      workspaceContext={workspaceContext}
      shellProps={{
        initialEnvironmentDescriptor: resolvedInitialEnvironmentDescriptor,
        initialResolvedTemplateEnvironment,
        initialRuntimeSnapshot,
        initialEvents: workspace.events,
        initialCursorIndex,
        disableSeed: workspace.events.length > 0,
      }}
    />
  );
}
