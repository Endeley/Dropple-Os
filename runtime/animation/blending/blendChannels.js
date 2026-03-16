import { safeNumber } from './blendUtils.js';

export function blendChannelValues(inputs) {
    let result = 0;
    let hasValue = false;

    for (const input of inputs || []) {
        const value = safeNumber(input?.value);
        const weight = safeNumber(input?.weight ?? 1);
        const mode = input?.mode ?? 'replace';

        if (mode === 'replace' || mode === 'override') {
            result = hasValue ? result * (1 - weight) + value * weight : value * weight;
            hasValue = true;
            continue;
        }

        if (mode === 'add') {
            result += value * weight;
            hasValue = true;
            continue;
        }

        if (mode === 'multiply') {
            result = hasValue ? result * (1 + value * weight) : 1 * (1 + value * weight);
            hasValue = true;
        }
    }

    return result;
}

