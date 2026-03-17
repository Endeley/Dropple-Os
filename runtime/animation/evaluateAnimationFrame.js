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
    const rigId = runtime?.rigId ?? null;
    const timelineClips = (runtime?.animation?.timelineClips ?? []).filter(
        (clip) => !clip?.rigId || !rigId || clip.rigId === rigId
    );
    const layers = (runtime?.animation?.layers ?? []).filter(
        (clip) => !clip?.rigId || !rigId || clip.rigId === rigId
    );
    const stateMachineClips = (
        runtime?.animation?.stateClips ??
        runtime?.animation?.stateMachineClips ??
        []
    ).filter((clip) => !clip?.rigId || !rigId || clip.rigId === rigId);
    const choreographyClips = evaluateChoreography(runtime?.snapshot ?? runtime ?? {}).filter(
        (clip) => !clip?.rigId || !rigId || clip.rigId === rigId
    );
    const blendedLayers = layers.length
        ? [
              ...layers,
              ...choreographyClips.map((clip) => ({
                  ...clip,
                  intent: clip?.intent ?? 'base',
                  priority: Number.isFinite(clip?.priority) ? Number(clip.priority) : 0,
              })),
          ]
        : null;
    const blendedChannels = evaluateAnimationBlend({
        layers: blendedLayers,
        timelineClips: [...timelineClips, ...choreographyClips],
        stateMachineClips,
    });

    return {
        choreographyClips,
        blendedChannels,
        controllerValues: projectBlendedChannelsToControllerValues(blendedChannels),
    };
}
