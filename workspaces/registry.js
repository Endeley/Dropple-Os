import { graphicWorkspace } from './registry/graphicWorkspace.js';
import { uiuxWorkspace } from './registry/uiuxWorkspace.js';
import { animationWorkspace } from './registry/animationWorkspace.js';
import { videoWorkspace } from './registry/videoWorkspace.js';
import { podcastWorkspace } from './registry/podcastWorkspace.js';
import { materialWorkspace } from './registry/materialWorkspace.js';
import { iconWorkspace } from './registry/iconWorkspace.js';
import { devWorkspace } from './registry/devWorkspace.js';
import { educationWorkspace } from './registry/educationWorkspace.js';
import { aiWorkspace } from './registry/aiWorkspace.js';
import { brandingWorkspace } from './registry/brandingWorkspace.js';
import { documentWorkspace } from './registry/documentWorkspace.js';
import { conversionWorkspace } from './registry/conversionWorkspace.js';
import { translateWorkspace } from './registry/translateWorkspace.js';
import { workspaceRoutes } from './registry/routes.js';

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
    ai: { ...aiWorkspace, routes },
    branding: { ...brandingWorkspace, routes },
    document: { ...documentWorkspace, routes },
    translate: { ...translateWorkspace, routes },
    conversion: { ...conversionWorkspace, routes },
};
