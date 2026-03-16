import { evaluateAnimationBlend } from './blending/blendEngine.js';
import { evaluateChoreography } from '../choreography/evaluateChoreography.js';

function isObject(value) {
    return Boolean(value) && typeof value === 'object';
}

export function projectBlendedChannelsToControllerValues(blendedChannels) {
    const controllerValues = {};

    for (const [key, value] of Object.entries(blendedChannels || {})) {
        const separator = key.indexOf(':');
        if (separator <= 0) continue;

        const controllerId = key.slice(0, separator);
        const channel = key.slice(separator + 1);
        if (!controllerId || !channel) continue;

        if (!isObject(controllerValues[controllerId])) {
            controllerValues[controllerId] = {};
        }

        controllerValues[controllerId][channel] = value;
    }

    return controllerValues;
}

export function evaluateAnimationFrame(runtime) {
    const timelineClips = runtime?.animation?.timelineClips ?? [];
    const stateMachineClips = runtime?.animation?.stateClips ?? runtime?.animation?.stateMachineClips ?? [];
    const choreographyClips = evaluateChoreography(runtime?.snapshot ?? runtime ?? {});
    const blendedChannels = evaluateAnimationBlend({
        timelineClips: [...timelineClips, ...choreographyClips],
        stateMachineClips,
    });

    return {
        choreographyClips,
        blendedChannels,
        controllerValues: projectBlendedChannelsToControllerValues(blendedChannels),
    };
}
