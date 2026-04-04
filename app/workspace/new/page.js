'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkspaceRoot } from '@/ui/workspace/root/WorkspaceRoot.jsx';
import { mockTemplates } from '@/marketplace/mockTemplates';
import { mockLessons } from '@/marketplace/mockLessons';
import { forkLessonToWorkspace } from '@/education/forkLessonToWorkspace';
import {
  createWorkspaceFromTemplate,
  getWorkspaceDefinition,
  resolveWorkspaceContext,
} from '@/platform/workspaces/index.js';

function createEmptyWorkspace() {
  return {
    id: crypto.randomUUID(),
    mode: 'design',
    snapshot: null,
    events: [],
    forkedFrom: null,
  };
}

export default function WorkspaceNewPage() {
  const searchParams = useSearchParams();
  const fromTemplate = searchParams.get('fromTemplate');
  const fromLesson = searchParams.get('fromLesson');

  const workspace = useMemo(() => {
    const template = mockTemplates.find((t) => t.id === fromTemplate);
    if (template) return createWorkspaceFromTemplate(template);

    const lesson = mockLessons.find((l) => l.id === fromLesson);
    if (lesson) return forkLessonToWorkspace(lesson);

    return createEmptyWorkspace();
  }, [fromTemplate, fromLesson]);

  const initialCursorIndex = workspace.events.length
    ? workspace.events.length - 1
    : -1;
  const workspaceContext = useMemo(
    () =>
      resolveWorkspaceContext({
        workspace: workspace.mode,
      }),
    [workspace.mode]
  );
  const workspaceDefinition = useMemo(
    () => getWorkspaceDefinition(workspaceContext.definitionId ?? workspace.mode),
    [workspace.mode, workspaceContext]
  );

  return (
    <WorkspaceRoot
      modeId={workspaceContext.mode ?? workspace.mode}
      workspaceId={workspaceContext.definitionId ?? workspace.mode}
      profile={workspaceDefinition?.profile ?? 'design'}
      workspace={workspaceDefinition}
      workspaceContext={workspaceContext}
      shellProps={{
        initialEvents: workspace.events,
        initialCursorIndex,
        disableSeed: workspace.events.length > 0,
      }}
    />
  );
}
