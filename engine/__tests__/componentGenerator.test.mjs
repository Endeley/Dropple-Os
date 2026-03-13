import test from 'node:test';
import assert from 'node:assert/strict';

import { compileProject } from '../compiler/compileProject.js';

test('component generator emits reusable component folders and screen files', () => {
    const ir = {
        nodes: [
            {
                id: 'home',
                type: 'screen',
                children: [{ id: 'button', type: 'button' }],
            },
        ],
    };

    const files = compileProject(ir);

    assert.deepEqual(
        Object.keys(files).sort(),
        [
            'App.jsx',
            'components/Button/Button.css',
            'components/Button/Button.jsx',
            'routes.jsx',
            'screens/HomeScreen.jsx',
            'styles.css',
        ],
    );
});
