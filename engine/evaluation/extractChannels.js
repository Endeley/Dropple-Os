import { validateChannelKey } from './channelContract.js';

function validateChannelValue(key, value) {
    if (Array.isArray(value)) {
        if (value.length === 0) {
            throw new Error(`Channel ${key} keyframes must not be empty`);
        }
        let lastTime = -Infinity;
        for (const frame of value) {
            if (!frame || typeof frame !== 'object') {
                throw new Error(`Channel ${key} keyframes must be objects`);
            }
            const time = frame.time ?? frame.t;
            const v = frame.value ?? frame.v;
            if (!Number.isFinite(time) || !Number.isFinite(v)) {
                throw new Error(`Channel ${key} keyframes require finite time and value`);
            }
            const easing = frame.easing ?? 'linear';
            if (easing !== 'linear' && easing !== 'easeInOut') {
                throw new Error(`Channel ${key} keyframes easing must be linear or easeInOut`);
            }
            if (time <= lastTime) {
                throw new Error(`Channel ${key} keyframes must be strictly ascending`);
            }
            lastTime = time;
        }
        return { keyframes: value };
    }

    if (value && typeof value === 'object' && Array.isArray(value.keyframes)) {
        return validateChannelValue(key, value.keyframes);
    }

    if (Number.isFinite(value)) {
        return { value };
    }

    if (value && typeof value === 'object' && 'value' in value) {
        if (!Number.isFinite(value.value)) {
            throw new Error(`Channel ${key} value must be a finite number`);
        }
        return { value: value.value };
    }

    throw new Error(`Channel ${key} must be a static number or keyframes`);
}

export function extractChannels(node) {
    const channels = {};
    if (!node || typeof node !== 'object') return channels;

    const source = node.channels && typeof node.channels === 'object' ? node.channels : null;
    if (source) {
        Object.entries(source).forEach(([key, value]) => {
            if (value == null) return;
            validateChannelKey(key);
            channels[key] = validateChannelValue(key, value);
        });
    }

    if (node.transform?.x?.keyframes) {
        throw new Error('Inline keyframes are deprecated. Use node.channels.');
    }
    if (node.transform?.y?.keyframes) {
        throw new Error('Inline keyframes are deprecated. Use node.channels.');
    }
    if (node.opacity?.keyframes) {
        throw new Error('Inline keyframes are deprecated. Use node.channels.');
    }

    return channels;
}
