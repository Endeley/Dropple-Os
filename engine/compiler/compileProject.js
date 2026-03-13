import { createCompilerContext } from './pipeline/compilerContext.js';
import { runCompilerPipeline } from './pipeline/compilerPipeline.js';
import { generateComponents } from './generators/componentGenerator.js';
import { generateScreens } from './generators/screenGenerator.js';
import { generateProject } from './generators/projectGenerator.js';

export function compileProject(ir, options = {}) {
    const context = createCompilerContext(ir, options);

    runCompilerPipeline(context);

    generateComponents(context);
    generateScreens(context);
    generateProject(context);

    return context.files;
}
