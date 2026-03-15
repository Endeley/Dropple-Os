import { graphicWorkspace } from './graphicWorkspace.js';
import { mediaWorkspace } from './mediaWorkspace.js';
import { uiuxWorkspace } from './uiuxWorkspace.js';
import { animationWorkspace } from './animationWorkspace.js';
import { videoWorkspace } from './videoWorkspace.js';
import { podcastWorkspace } from './podcastWorkspace.js';
import { materialWorkspace } from './materialWorkspace.js';
import { iconWorkspace } from './iconWorkspace.js';
import { devWorkspace } from './devWorkspace.js';
import { educationWorkspace } from './educationWorkspace.js';
import { aiWorkspace } from './aiWorkspace.js';
import { brandingWorkspace } from './brandingWorkspace.js';
import { documentWorkspace } from './documentWorkspace.js';
import { conversionWorkspace } from './conversionWorkspace.js';
import { translateWorkspace } from './translateWorkspace.js';
import { reviewWorkspace } from './reviewWorkspace.js';
import { adaptWorkspaceToContractV1 } from '@/core/contracts/adaptWorkspaceToContractV1.js';

export const WorkspaceRegistry = {
    graphic: adaptWorkspaceToContractV1(graphicWorkspace),
    media: adaptWorkspaceToContractV1(mediaWorkspace),
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
