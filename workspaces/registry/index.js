import { graphicWorkspace } from './graphicWorkspace';
import { uiuxWorkspace } from './uiuxWorkspace';
import { animationWorkspace } from './animationWorkspace';
import { videoWorkspace } from './videoWorkspace';
import { podcastWorkspace } from './podcastWorkspace';
import { materialWorkspace } from './materialWorkspace';
import { iconWorkspace } from './iconWorkspace';
import { devWorkspace } from './devWorkspace';
import { educationWorkspace } from './educationWorkspace';
import { aiWorkspace } from './aiWorkspace';
import { brandingWorkspace } from './brandingWorkspace';
import { documentWorkspace } from './documentWorkspace';
import { conversionWorkspace } from './conversionWorkspace';
import { translateWorkspace } from './translateWorkspace';
import { reviewWorkspace } from './reviewWorkspace';
import { adaptWorkspaceToContractV1 } from '@/core/contracts/adaptWorkspaceToContractV1.js';

export const WorkspaceRegistry = {
    graphic: adaptWorkspaceToContractV1(graphicWorkspace),
    uiux: adaptWorkspaceToContractV1(uiuxWorkspace),
    animation: adaptWorkspaceToContractV1(animationWorkspace),
    video: adaptWorkspaceToContractV1(videoWorkspace),
    podcast: adaptWorkspaceToContractV1(podcastWorkspace),
    material: adaptWorkspaceToContractV1(materialWorkspace),
    icons: adaptWorkspaceToContractV1(iconWorkspace),
    dev: adaptWorkspaceToContractV1(devWorkspace),
    education: adaptWorkspaceToContractV1(educationWorkspace),
    ai: adaptWorkspaceToContractV1(aiWorkspace),
    branding: adaptWorkspaceToContractV1(brandingWorkspace),
    document: adaptWorkspaceToContractV1(documentWorkspace),
    translate: adaptWorkspaceToContractV1(translateWorkspace),
    conversion: adaptWorkspaceToContractV1(conversionWorkspace),
    review: adaptWorkspaceToContractV1(reviewWorkspace),
};
