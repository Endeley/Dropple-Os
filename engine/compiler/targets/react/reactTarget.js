import { renderReactProject } from './reactRenderer.js';

export function createReactTarget() {
    return {
        name: 'react',
        render(context) {
            return renderReactProject(context);
        },
    };
}
