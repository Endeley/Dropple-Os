import { WorkspaceRoot } from '@/ui/workspace/root/WorkspaceRoot.jsx';
import { mockLessons } from '@/marketplace/mockLessons';
import { forkLessonToWorkspace } from '@/education/forkLessonToWorkspace';
import { loadCertifiedTemplates } from '@/engine/templates/templateLoader.js';
import { buildRuntimeSnapshotFromCertifiedTemplate } from '@/domain/templates/installCertifiedTemplate.js';
import {
  getWorkspaceDefinition,
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

function resolveSeededWorkspace(fromTemplate, fromLesson) {
  if (fromTemplate) {
    const certifiedTemplate = loadCertifiedTemplates().find((template) => template.id === fromTemplate);
    if (certifiedTemplate) {
      return {
        workspace: createEmptyWorkspace(certifiedTemplate.mode ?? 'design'),
        initialRuntimeSnapshot: buildRuntimeSnapshotFromCertifiedTemplate(certifiedTemplate),
      };
    }
  }

  if (fromLesson) {
    const lesson = mockLessons.find((entry) => entry.id === fromLesson);
    if (lesson) {
      return {
        workspace: forkLessonToWorkspace(lesson),
        initialRuntimeSnapshot: null,
      };
    }
  }

  return {
    workspace: createEmptyWorkspace(),
    initialRuntimeSnapshot: null,
  };
}

export default function WorkspaceNewPage({ searchParams = {} }) {
  const fromTemplate = getSearchParam(searchParams, 'fromTemplate');
  const fromLesson = getSearchParam(searchParams, 'fromLesson');
  const { workspace, initialRuntimeSnapshot } = resolveSeededWorkspace(fromTemplate, fromLesson);

  const initialCursorIndex = workspace.events.length ? workspace.events.length - 1 : -1;
  const workspaceContext = resolveWorkspaceContext({
    workspace: workspace.mode,
  });
  const workspaceDefinition = getWorkspaceDefinition(
    workspaceContext.definitionId ?? workspace.mode
  );

  return (
    <WorkspaceRoot
      modeId={workspaceContext.mode ?? workspace.mode}
      workspaceId={workspaceContext.definitionId ?? workspace.mode}
      profile={workspaceDefinition?.profile ?? 'design'}
      workspace={workspaceDefinition}
      workspaceContext={workspaceContext}
      shellProps={{
        initialRuntimeSnapshot,
        initialEvents: workspace.events,
        initialCursorIndex,
        disableSeed: workspace.events.length > 0,
      }}
    />
  );
}
