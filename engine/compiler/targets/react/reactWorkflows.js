import { buildWorkflowExecutors } from '../../application/workflows/workflowExecution.js';

export function buildReactWorkflows(context, options = {}) {
    return buildWorkflowExecutors(context, {
        navigateAccessor: options.navigateAccessor || 'navigate',
        notifyAccessor: options.notifyAccessor || 'console.warn',
    });
}
