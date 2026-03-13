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

test('layout primitives render inline without becoming component imports', () => {
    const files = compileProject({
        nodes: [
            {
                id: 'home',
                type: 'screen',
                children: [
                    {
                        id: 'root',
                        type: 'Stack',
                        layout: { type: 'stack', gap: 20, align: 'center' },
                        children: [{ id: 'button', type: 'Button' }],
                    },
                ],
            },
        ],
    });

    assert.match(
        files['screens/HomeScreen.jsx'],
        /<div className="node-root" style=\{\{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" \}\}>/,
    );
    assert.doesNotMatch(files['screens/HomeScreen.jsx'], /import Stack from/);
    assert.ok(files['components/Button/Button.jsx']);
});
