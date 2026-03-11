import { GRID_SIZE } from './snapConstants.js';

export function computeGridSnap(delta) {
    return {
        dx: Math.round((delta?.dx ?? 0) / GRID_SIZE) * GRID_SIZE,
        dy: Math.round((delta?.dy ?? 0) / GRID_SIZE) * GRID_SIZE,
    };
}
