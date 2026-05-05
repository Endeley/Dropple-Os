import { exportDroppleSpec } from '../runtime/export/exportDroppleSpec';
import { exportStaticHTML } from '../runtime/export/static/exportStaticHTML';
import { exportWordPress } from '../runtime/export/wordpress/exportWordPress';

/**
 * Dev-only export pipeline runner.
 * Read-only, deterministic, no side effects.
 */
export function runExportPipeline(runtime, target) {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('runExportPipeline is dev-only');
    }

    const spec = exportDroppleSpec({ snapshot: runtime });

    switch (target) {
        case 'static-html':
            return exportStaticHTML(spec);
        case 'wordpress':
            return exportWordPress(spec);
        default:
            throw new Error(`Unknown export target: ${target}`);
    }
}
