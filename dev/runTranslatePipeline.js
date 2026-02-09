import { exportDroppleSpec } from '../export/exportDroppleSpec';
import { designToPseudoCode } from '../translate/designToPseudoCode';
import { pseudoCodeToReact } from '../translate/pseudoCodeToReact';

/**
 * Dev-only translation pipeline runner.
 * Read-only, deterministic, no side effects.
 */
export function runTranslatePipeline(runtime) {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('runTranslatePipeline is dev-only');
    }

    const droppleSpec = exportDroppleSpec(runtime);
    const pseudoCode = designToPseudoCode(droppleSpec);
    const reactSource = pseudoCodeToReact(pseudoCode);

    return {
        spec: droppleSpec,
        pseudoCode,
        reactSource,
    };
}
