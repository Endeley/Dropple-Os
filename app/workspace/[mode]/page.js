import { ModeLoader } from '../../../ui/workspace/shell/ModeLoader';
import {
    buildInitialEnvironmentDescriptorFromQuery,
} from '../new/workspaceEnvironmentBoot.js';
import { resolveTemplateEnvironment } from '@/domain/templates/resolveTemplateEnvironment.js';
import { resolveWorkspaceLaunchContextFromSearchParams } from '@/runtime/workspaces/index.js';

export default async function WorkspacePage({ params, searchParams }) {
    const { mode } = await params;
    const resolvedSearchParams = (await searchParams) ?? {};
    const initialWorkspaceLaunchContext = resolveWorkspaceLaunchContextFromSearchParams(resolvedSearchParams);
    const initialEnvironmentDescriptor = buildInitialEnvironmentDescriptorFromQuery(
        resolvedSearchParams,
        initialWorkspaceLaunchContext,
    );
    return (
        <ModeLoader
            mode={mode}
            queryMode={resolvedSearchParams.mode ?? null}
            queryPerspective={resolvedSearchParams.perspective ?? null}
            queryEntry={resolvedSearchParams.entry ?? null}
            initialEnvironmentDescriptor={initialEnvironmentDescriptor}
            initialWorkspaceLaunchContext={initialWorkspaceLaunchContext}
            initialResolvedTemplateEnvironment={
                initialEnvironmentDescriptor ? resolveTemplateEnvironment(initialEnvironmentDescriptor) : null
            }
        />
    );
}
