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
import { resolveWorkspaceLaunchContextFromSearchParams } from '@/runtime/workspaces/index.js';

export default async function WorkspaceNewPage({ searchParams = {} }) {
  const resolvedSearchParams = await searchParams;
  const initialWorkspaceLaunchContext = resolveWorkspaceLaunchContextFromSearchParams(resolvedSearchParams);
  const initialEnvironmentDescriptor = buildInitialEnvironmentDescriptorFromQuery(
    resolvedSearchParams,
    initialWorkspaceLaunchContext,
  );
  const initialDocumentId = getSearchParam(resolvedSearchParams, 'doc');
  const fromTemplate = getSearchParam(resolvedSearchParams, 'fromTemplate');
  const fromLesson = getSearchParam(resolvedSearchParams, 'fromLesson');
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
        initialDocumentId,
        initialWorkspaceLaunchContext,
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
