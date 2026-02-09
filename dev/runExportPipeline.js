import { exportDroppleSpec } from '../export/exportDroppleSpec';
import { exportStaticHTML } from '../export/static/exportStaticHTML';
import { exportWordPress } from '../export/wordpress/exportWordPress';

/**
 * Dev-only export pipeline runner.
 * Read-only, deterministic, no side effects.
 */
export function runExportPipeline(runtime, target) {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('runExportPipeline is dev-only');
    }

    const spec = exportDroppleSpec(runtime);

    switch (target) {
        case 'static-html':
            return exportStaticHTML(spec);
        case 'wordpress':
            return exportWordPress(spec);
        default:
            throw new Error(`Unknown export target: ${target}`);
    }
}
