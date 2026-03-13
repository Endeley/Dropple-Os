import test from 'node:test';
import assert from 'node:assert/strict';

import { compileProject } from '../compiler/compileProject.js';

test('workflow compiler emits form-submit workflow executors', () => {
    const files = compileProject({
        nodes: [
            {
                id: 'login',
                type: 'screen',
                children: [
                    {
                        id: 'loginForm',
                        type: 'form',
                    },
                ],
            },
        ],
        forms: [
            {
                id: 'loginForm',
                fields: [
                    { name: 'email', type: 'text', required: true },
                    { name: 'password', type: 'password', required: true },
                ],
            },
        ],
        workflows: [
            {
                id: 'loginFlow',
                trigger: {
                    type: 'formSubmit',
                    formId: 'loginForm',
                },
                steps: [
                    {
                        type: 'if',
                        condition: 'loginForm.email && loginForm.password',
                        then: [
                            { type: 'navigate', to: '/dashboard' },
                        ],
                        else: [
                            { type: 'notify', message: 'Missing credentials' },
                        ],
                    },
                ],
            },
        ],
    });

    assert.match(files['screens/LoginScreen.jsx'], /async function runLoginFlow\(workflowContext\)/);
    assert.match(files['screens/LoginScreen.jsx'], /if \(loginForm\.email && loginForm\.password\)/);
    assert.match(files['screens/LoginScreen.jsx'], /navigate\("\/dashboard"\);/);
    assert.match(files['screens/LoginScreen.jsx'], /console\.warn\("Missing credentials"\);/);
    assert.match(files['screens/LoginScreen.jsx'], /async function handleLoginFormWorkflow\(e\)/);
    assert.match(files['screens/LoginScreen.jsx'], /function handleLoginFormSubmit\(e\) \{\n    return handleLoginFormWorkflow\(e\);\n  \}/);
});
