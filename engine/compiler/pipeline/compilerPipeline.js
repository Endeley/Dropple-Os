import { compileStructure } from '../compilers/compileStructure.js';
import { compileLayout } from '../compilers/compileLayout.js';
import { compileStyles } from '../compilers/compileStyles.js';
import { compileComponents } from '../compilers/compileComponents.js';
import { compileBindings } from '../compilers/compileBindings.js';
import { compileInteractions } from '../compilers/compileInteractions.js';
import { compileNavigation } from '../compilers/compileNavigation.js';
import { compileState } from '../compilers/compileState.js';

export function runCompilerPipeline(context) {
    compileStructure(context);
    compileLayout(context);
    compileStyles(context);
    compileComponents(context);
    compileBindings(context);
    compileInteractions(context);
    compileNavigation(context);
    compileState(context);

    return context;
}
