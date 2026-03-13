import { compileTimelineToIR } from '@/runtime/animation/compileTimelineToIR.js';
import { exportWebAnimation } from '@/runtime/animation/exporters/exportWebAnimation.js';

export function exportMotionBridge({ motion }) {
    if (!motion) return [];

    const ir = compileTimelineToIR(motion);
    return ir.map((anim) => exportWebAnimation(anim, { duration: undefined }));
}
