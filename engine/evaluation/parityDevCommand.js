import { validateFrameParity } from './validateFrameParity.js';

export function runParityCheck(options = {}) {
    return validateFrameParity(options);
}
