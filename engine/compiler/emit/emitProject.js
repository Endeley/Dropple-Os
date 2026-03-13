import { emitFiles } from './emitFiles.js';
import { reactTarget } from '../targets/react/reactTarget.js';

export function emitProject(context) {
    if (context.target === 'react') {
        reactTarget(context);
    }

    return emitFiles(context, context.files);
}
