import { buildDroppleSpec } from './buildDroppleSpec';
import { validateDroppleSpec } from './validateDroppleSpec';

/**
 * The ONLY semantic export entry point.
 */
export function exportDroppleSpec(workspace) {
    const spec = buildDroppleSpec(workspace);
    validateDroppleSpec(spec);
    return spec;
}
