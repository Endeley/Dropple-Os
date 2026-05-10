import { loadMotionExportCommands } from '@/ui/bridges/motionExportRuntimeBridge.js';

/**
 * Exports canonical motion intent through the runtime-owned motion export command boundary.
 */
export async function exportMotion({
    motion,
    format = 'web-animation',
} = {}) {
    const { performMotionExportCommand } = await loadMotionExportCommands();
    const result = performMotionExportCommand({
        state: {
            document: {
                motion,
            },
        },
        format,
    });

    return result.output;
}
