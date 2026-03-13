import test from 'node:test';
import assert from 'node:assert/strict';

import { compileProject } from '../compiler/index.js';

test('compiler pipeline emits App.jsx for array node IR', () => {
    const ir = {
        nodes: [
            {
                id: 'home',
                type: 'screen',
                layout: 'stack',
                styles: {
                    padding: 16,
                    backgroundColor: 'red',
                },
                children: [
                    { id: 'btn', type: 'button', styles: { marginTop: 8 } },
                ],
            },
        ],
    };

    const output = compileProject(ir);

    assert.ok(output['App.jsx']);
    assert.ok(output['styles.css']);
    assert.ok(output['screens/HomeScreen.jsx']);
    assert.ok(output['components/Button/Button.jsx']);
    assert.match(output['App.jsx'], /import HomeScreen from "\.\/screens\/HomeScreen\.jsx";/);
    assert.match(output['App.jsx'], /<HomeScreen \/>/);
    assert.match(output['screens/HomeScreen.jsx'], /<Button \/>/);
    assert.match(output['styles.css'], /\.node-home \{/);
    assert.match(output['styles.css'], /padding: 16px;/);
    assert.match(output['styles.css'], /background-color: red;/);
});
