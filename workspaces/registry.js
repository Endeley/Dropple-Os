import { graphicWorkspace } from './registry/graphicWorkspace';
import { uiuxWorkspace } from './registry/uiuxWorkspace';
import { animationWorkspace } from './registry/animationWorkspace';
import { videoWorkspace } from './registry/videoWorkspace';
import { podcastWorkspace } from './registry/podcastWorkspace';
import { materialWorkspace } from './registry/materialWorkspace';
import { iconWorkspace } from './registry/iconWorkspace';
import { devWorkspace } from './registry/devWorkspace';
import { educationWorkspace } from './registry/educationWorkspace';
import { brandingWorkspace } from './registry/brandingWorkspace';
import { documentWorkspace } from './registry/documentWorkspace';
import { conversionWorkspace } from './registry/conversionWorkspace';
import { workspaceRoutes } from './registry/routes';

const routes = workspaceRoutes();

export const WorkspaceRegistry = {
    graphic: { ...graphicWorkspace, routes },
    uiux: { ...uiuxWorkspace, routes },
    animation: { ...animationWorkspace, routes },
    video: { ...videoWorkspace, routes },
    podcast: { ...podcastWorkspace, routes },
    material: { ...materialWorkspace, routes },
    icons: { ...iconWorkspace, routes },
    dev: { ...devWorkspace, routes },
    education: { ...educationWorkspace, routes },
    branding: { ...brandingWorkspace, routes },
    document: { ...documentWorkspace, routes },
    conversion: { ...conversionWorkspace, routes },
};
