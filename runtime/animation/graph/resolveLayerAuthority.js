import { safeNumber } from '../blending/blendUtils.js';

function matchesMask(channel, mask) {
    if (mask?.controllers && !mask.controllers.includes(channel.controllerId)) {
        return false;
    }

    if (mask?.channels && !mask.channels.includes(channel.channel)) {
        return false;
    }

    return true;
}

function groupByChannel(entries) {
    const grouped = Object.create(null);

    for (const entry of entries) {
        const key = `${entry.controllerId}::${entry.channel}`;
        if (!Array.isArray(grouped[key])) {
            grouped[key] = [];
        }
        grouped[key].push(entry);
    }

    return grouped;
}

function resolveChannel(entries) {
    const sorted = entries.slice().sort((left, right) => {
        if (left.priority !== right.priority) {
            return right.priority - left.priority;
        }

        return String(left.layerId).localeCompare(String(right.layerId));
    });

    let value = 0;

    for (const entry of sorted) {
        switch (entry.mode) {
            case 'replace':
                value = entry.value;
                return value;
            case 'add':
                value += entry.value;
                break;
            case 'multiply':
                value *= entry.value;
                break;
            case 'override':
                value = entry.value;
                break;
            default:
                value = entry.value;
                return value;
        }
    }

    return value;
}

export function resolveLayerAuthority(layers) {
    if (!Array.isArray(layers) || layers.length === 0) {
        return [];
    }

    const entries = [];

    for (const layer of layers) {
        const priority = safeNumber(layer?.priority ?? 0);
        const mask = layer?.meta?.mask ?? null;

        for (const channel of layer?.channels ?? []) {
            if (!channel?.controllerId || !channel?.channel) continue;
            if (mask && !matchesMask(channel, mask)) continue;

            entries.push({
                layerId: layer?.id ?? '',
                priority,
                mode: layer?.mode ?? 'replace',
                controllerId: channel.controllerId,
                channel: channel.channel,
                value: safeNumber(channel.value ?? 0),
            });
        }
    }

    const grouped = groupByChannel(entries);
    const resolved = [];

    for (const key of Object.keys(grouped).sort()) {
        const [controllerId, channel] = key.split('::');
        resolved.push({
            controllerId,
            channel,
            value: resolveChannel(grouped[key]),
        });
    }

    return resolved;
}
