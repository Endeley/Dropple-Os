import { compileConstraints } from './compileConstraints.js';
import { compileResponsiveLayout } from './compileResponsiveLayout.js';
import { compileBreakpoints } from './compileBreakpoints.js';

export function compileLayoutSystems(document = {}) {
    return {
        constraints: compileConstraints(document?.layout),
        responsiveRules: compileResponsiveLayout(document?.sceneGraph),
        breakpoints: compileBreakpoints(document).breakpoints,
    };
}
