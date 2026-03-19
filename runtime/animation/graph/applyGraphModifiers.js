import { safeNumber } from '../blending/blendUtils.js';

function normalizeLayer(layer, index, context = {}) {
    const layerId = layer?.id ?? `layer:${index}`;
    const policy = context?.graphLayerMeta?.[layerId] ?? {};

    return {
        id: layerId,
        priority: safeNumber(policy?.priority ?? layer?.priority ?? 0),
        mode: policy?.mode ?? layer?.mode ?? 'replace',
        weight: safeNumber(policy?.weight ?? layer?.weight ?? 1),
        rigId: policy?.rigId ?? layer?.rigId ?? null,
        channels: Array.isArray(layer?.channels) ? layer.channels : [],
        meta: {
            ...(layer?.meta ?? {}),
            ...(policy?.meta ?? {}),
        },
    };
}

function compareLayers(left, right) {
    if (left.priority !== right.priority) {
        return right.priority - left.priority;
    }

    return String(left.id).localeCompare(String(right.id));
}

function applyChannelModifiers(channel, layer) {
    let value = safeNumber(channel?.value ?? 0);
    const meta = layer?.meta ?? {};

    if (meta?.clamp) {
        const min = safeNumber(meta.clamp?.min ?? 0);
        const max = safeNumber(meta.clamp?.max ?? 1);
        value = Math.max(min, Math.min(max, value));
    }

    if (meta?.scale !== undefined) {
        value *= safeNumber(meta.scale);
    }

    if (meta?.offset !== undefined) {
        value += safeNumber(meta.offset);
    }

    return {
        ...channel,
        value,
    };
}

function applyLayerModifiers(layer, context = {}) {
    void context;

    return {
        ...layer,
        channels: layer.channels.map((channel) => applyChannelModifiers(channel, layer)),
    };
}

export function applyGraphModifiers(layers, context = {}) {
    if (!Array.isArray(layers) || layers.length === 0) {
        return [];
    }

    return layers
        .map((layer, index) => normalizeLayer(layer, index, context))
        .slice()
        .sort(compareLayers)
        .map((layer) => applyLayerModifiers(layer, context));
}
