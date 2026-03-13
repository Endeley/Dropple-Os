import { compileStructure } from '../compilers/compileStructure.js';
import { compileLayout } from '../compilers/compileLayout.js';
import { compileStyles } from '../compilers/compileStyles.js';
import { compileComponents } from '../compilers/compileComponents.js';
import { compileBindings } from '../compilers/compileBindings.js';
import { createApplicationCompilerContext } from '../application/applicationContext.js';
import { compileInteractions } from '../application/compileInteractions.js';
import { compileNavigation } from '../application/compileNavigation.js';
import { compileState } from '../application/compileState.js';
import { createFormCompilerContext } from '../application/forms/formContext.js';
import { compileForms } from '../application/forms/compileForms.js';
import { createDataCompilerContext } from '../application/data/dataContext.js';
import { compileDataSources } from '../application/data/compileDataSources.js';
import { createWorkflowCompilerContext } from '../application/workflows/workflowContext.js';
import { compileWorkflows } from '../application/workflows/compileWorkflows.js';

export function runCompilerPipeline(context) {
    compileStructure(context);
    compileLayout(context);
    compileStyles(context);
    compileComponents(context);
    compileBindings(context);
    createApplicationCompilerContext(context);
    createFormCompilerContext(context);
    createDataCompilerContext(context);
    createWorkflowCompilerContext(context);
    compileInteractions(context);
    compileNavigation(context);
    compileState(context);
    compileForms(context);
    compileDataSources(context);
    compileWorkflows(context);

    return context;
}
