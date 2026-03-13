import test from 'node:test';
import assert from 'node:assert/strict';

import { compileProject } from '../compiler/compileProject.js';

test('data source compiler emits fetch logic', () => {
    const files = compileProject({
        nodes: [],
        dataSources: [
            {
                id: 'users',
                type: 'rest',
                url: '/api/users',
            },
        ],
    });

    assert.match(files['App.jsx'], /fetchUsers/);
    assert.match(files['App.jsx'], /React\.useEffect/);
    assert.match(files['App.jsx'], /const \[users, setUsers\] = React\.useState\(null\);/);
});
