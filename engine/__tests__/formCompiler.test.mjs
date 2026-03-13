import test from 'node:test';
import assert from 'node:assert/strict';

import { compileProject } from '../compiler/compileProject.js';

test('form compiler emits React form state and bindings', () => {
    const files = compileProject({
        nodes: [
            {
                id: 'login',
                type: 'screen',
                children: [
                    {
                        id: 'loginForm',
                        type: 'form',
                        children: [
                            {
                                id: 'emailInput',
                                type: 'input',
                                props: { formId: 'loginForm', field: 'email', placeholder: 'Email' },
                            },
                            {
                                id: 'passwordInput',
                                type: 'input',
                                props: { formId: 'loginForm', field: 'password' },
                            },
                            {
                                id: 'submitButton',
                                type: 'button',
                            },
                        ],
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
                submit: {
                    action: { type: 'navigate', to: '/dashboard' },
                },
            },
        ],
        navigation: {
            routes: [
                { id: 'login', component: 'LoginScreen', path: '/login' },
                { id: 'dashboard', component: 'DashboardScreen', path: '/dashboard' },
            ],
        },
    });

    assert.match(files['App.jsx'], /const \[loginForm, setLoginForm\] = React\.useState/);
    assert.match(files['App.jsx'], /function handleLoginFormSubmit\(e, navigate\)/);
    assert.match(files['screens/LoginScreen.jsx'], /useNavigate/);
    assert.match(files['screens/LoginScreen.jsx'], /<Form onSubmit=\{handleLoginFormSubmit\} \/>/);
    assert.match(files['components/Form/Form.jsx'], /<form className="node-loginForm" \{\.\.\.props\}>/);
    assert.match(files['components/Form/Form.jsx'], /value=\{props\.loginForm\.email\}/);
    assert.match(files['components/Form/Form.jsx'], /onChange=\{\(e\) => props\.setLoginForm\(\(prev\) => \(\{ \.\.\.prev, "email": e\.target\.value \}\)\)\}/);
    assert.match(files['components/Form/Form.jsx'], /type="password"/);
    assert.match(files['components/Form/Form.jsx'], /required/);
});

test('form compiler prefers normalized binding metadata over legacy props shortcuts', () => {
    const files = compileProject({
        nodes: [
            {
                id: 'login',
                type: 'screen',
                children: [
                    {
                        id: 'loginForm',
                        type: 'form',
                        children: [
                            {
                                id: 'emailInput',
                                type: 'input',
                                binding: {
                                    type: 'form',
                                    form: 'loginForm',
                                    field: 'email',
                                },
                            },
                        ],
                    },
                ],
            },
        ],
        forms: [
            {
                id: 'loginForm',
                fields: [{ name: 'email', type: 'email', required: true }],
            },
        ],
    });

    assert.match(files['components/Form/Form.jsx'], /value=\{props\.loginForm\.email\}/);
    assert.match(files['components/Form/Form.jsx'], /type="email"/);
    assert.doesNotMatch(files['components/Form/Form.jsx'], /formId/);
});
