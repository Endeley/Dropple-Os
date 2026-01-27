'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkspaceShell } from '@/ui/workspace/shared/WorkspaceShell';
import { mockTemplates } from '@/marketplace/mockTemplates';
import { createWorkspaceFromTemplate } from '@/workspace/createFromTemplate';
import { mockLessons } from '@/marketplace/mockLessons';
import { forkLessonToWorkspace } from '@/education/forkLessonToWorkspace';

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

  return (
    <WorkspaceShell
      modeId={workspace.mode}
      initialEvents={workspace.events}
      initialCursorIndex={initialCursorIndex}
      disableSeed={workspace.events.length > 0}
    />
  );
}
