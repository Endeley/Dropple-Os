import { exportMotionBridge } from '@/ui/bridges/exportMotionBridge.js';

/**
 * Exports motion intent from the canonical motion document into Web Animations configs.
 * Pure function: returns array of { target, keyframes, options }.
 */
export function exportMotion({ motion }) {
    return exportMotionBridge({ motion });
}
