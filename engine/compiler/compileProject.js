import { createCompilerContext } from './pipeline/compilerContext.js';
import { runCompilerPipeline } from './pipeline/compilerPipeline.js';
import { generateComponents } from './generators/componentGenerator.js';
import { generateScreens } from './generators/screenGenerator.js';
import { generateProject } from './generators/projectGenerator.js';
import {
    compileDesignComponents,
    compileDesignTokens,
    compileThemes,
    compileVariants,
    generateReactDesignSystem,
} from './designSystem/index.js';

export function compileProject(ir, options = {}) {
    const context = createCompilerContext(ir, options);
    const hasDesignSystem = Boolean(ir?.designSystem);

    runCompilerPipeline(context);

    if (hasDesignSystem) {
        compileDesignTokens(context);
        compileThemes(context);
        compileDesignComponents(context);
        compileVariants(context);
    }

    generateComponents(context);
    generateScreens(context);
    generateProject(context);

    if (hasDesignSystem) {
        mergeFiles(context.files, generateReactDesignSystem(context));
    }

    return context.files;
}

function mergeFiles(baseFiles, extraFiles) {
    for (const [path, source] of Object.entries(extraFiles || {})) {
        baseFiles[path] = source;
    }
}
