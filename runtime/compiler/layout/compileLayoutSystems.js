import { compileConstraints } from './compileConstraints.js';
import { compileResponsiveLayout } from './compileResponsiveLayout.js';
import { compileBreakpoints } from './compileBreakpoints.js';

export function compileLayoutSystems(document = {}) {
    return {
        constraints: compileConstraints(document?.sceneGraph),
        responsiveRules: compileResponsiveLayout(document?.sceneGraph),
        breakpoints: compileBreakpoints(document).breakpoints,
    };
}
