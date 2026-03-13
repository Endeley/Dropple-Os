import { createCompilerContext } from './pipeline/compilerContext.js';
import { runCompilerPipeline } from './pipeline/compilerPipeline.js';
import { emitProject } from './emit/emitProject.js';

export function compileProject(ir, options = {}) {
    const context = createCompilerContext(ir, options);

    runCompilerPipeline(context);

    return emitProject(context);
}
