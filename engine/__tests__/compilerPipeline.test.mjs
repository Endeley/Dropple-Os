import test from 'node:test';
import assert from 'node:assert/strict';

import { compileProject } from '../compiler/index.js';

test('compiler pipeline emits App.jsx for array node IR', () => {
    const ir = {
        nodes: [
            { id: 'root', type: 'div' },
            { id: 'btn', type: 'button' },
        ],
    };

    const output = compileProject(ir);

    assert.ok(output['App.jsx']);
    assert.match(output['App.jsx'], /id="root"/);
    assert.match(output['App.jsx'], /id="btn"/);
});
