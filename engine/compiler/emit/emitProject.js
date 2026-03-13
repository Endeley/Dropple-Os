import { emitFiles } from './emitFiles.js';
import { createReactTarget } from '../targets/react/reactTarget.js';

export function emitProject(context) {
    const target = resolveTarget(context.target);
    const files = {
        'App.jsx': target.render(context),
    };

    return emitFiles(context, files);
}

function resolveTarget(targetName) {
    switch (targetName) {
        case 'react':
        default:
            return createReactTarget();
    }
}
