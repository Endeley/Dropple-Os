import { blendChannelValues } from './blendChannels.js';
import { safeNumber, stableCompare } from './blendUtils.js';

function toChannels(layer) {
    return Array.isArray(layer?.channels) ? layer.channels : [];
}

function toBlendInput(layer, channel) {
    return {
        value: channel?.value,
        weight: safeNumber(channel?.weight ?? layer?.weight ?? 1),
        mode: channel?.mode ?? layer?.mode ?? 'replace',
    };
}

export function blendAnimationLayers(layers) {
    const channelMap = new Map();

    for (const layer of layers || []) {
        const orderedChannels = toChannels(layer).slice().sort((left, right) => {
            const controllerDelta = stableCompare(left?.controllerId, right?.controllerId);
            if (controllerDelta !== 0) return controllerDelta;
            return stableCompare(left?.channel, right?.channel);
        });

        for (const channel of orderedChannels) {
            const controllerId = channel?.controllerId ?? null;
            const channelId = channel?.channel ?? null;
            if (!controllerId || !channelId) continue;

            const key = `${controllerId}:${channelId}`;
            const existing = channelMap.get(key) ?? [];
            existing.push(toBlendInput(layer, channel));
            channelMap.set(key, existing);
        }
    }

    const result = {};

    for (const key of Array.from(channelMap.keys()).sort(stableCompare)) {
        result[key] = blendChannelValues(channelMap.get(key));
    }

    return result;
}

