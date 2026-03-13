import { compileStructure } from '../compilers/compileStructure.js';
import { compileLayout } from '../compilers/compileLayout.js';
import { compileStyles } from '../compilers/compileStyles.js';
import { compileComponents } from '../compilers/compileComponents.js';
import { compileBindings } from '../compilers/compileBindings.js';
import { createApplicationCompilerContext } from '../application/applicationContext.js';
import { compileInteractions } from '../application/compileInteractions.js';
import { compileNavigation } from '../application/compileNavigation.js';
import { compileState } from '../application/compileState.js';

export function runCompilerPipeline(context) {
    compileStructure(context);
    compileLayout(context);
    compileStyles(context);
    compileComponents(context);
    compileBindings(context);
    createApplicationCompilerContext(context);
    compileInteractions(context);
    compileNavigation(context);
    compileState(context);

    return context;
}
