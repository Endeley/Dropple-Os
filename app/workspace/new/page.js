import { WorkspaceRoot } from '@/ui/workspace/root/WorkspaceRoot.jsx';
import {
  getWorkspaceDefinition,
  resolveWorkspaceContext,
} from '@/platform/workspaces/index.js';
import {
  buildInitialEnvironmentDescriptorFromQuery,
  getSearchParam,
  resolveSeededWorkspace,
} from './workspaceEnvironmentBoot.js';

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
