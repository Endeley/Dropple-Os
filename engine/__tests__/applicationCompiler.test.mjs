import test from 'node:test';
import assert from 'node:assert/strict';

import { compileProject } from '../compiler/compileProject.js';

test('application compiler emits navigation and stateful app shell', () => {
    const ir = {
        nodes: [],
        interactions: [],
        state: { auth: { loading: false } },
        navigation: {
            initialRoute: 'home',
            routes: [{ id: 'home', component: 'HomeScreen', path: '/' }],
        },
    };

    const files = compileProject(ir, { target: 'react' });

    assert.match(files['App.jsx'], /BrowserRouter/);
    assert.match(files['App.jsx'], /React\.useState/);
    assert.match(files['App.jsx'], /HomeScreen/);
});

test('application compiler emits click handlers for screen component instances', () => {
    const ir = {
        nodes: [
            {
                id: 'login',
                type: 'screen',
                children: [{ id: 'loginButton', type: 'button' }],
            },
        ],
        interactions: [
            {
                id: 'login-click',
                sourceNodeId: 'loginButton',
                event: 'click',
                action: {
                    type: 'navigate',
                    to: '/dashboard',
                },
            },
        ],
        state: {
            auth: {
                loading: false,
            },
        },
        navigation: {
            initialRoute: 'login',
            routes: [
                { id: 'dashboard', component: 'DashboardScreen', path: '/dashboard' },
                { id: 'login', component: 'LoginScreen', path: '/login' },
            ],
        },
    };

    const files = compileProject(ir, { target: 'react' });

    assert.match(files['screens/LoginScreen.jsx'], /useNavigate/);
    assert.match(files['screens/LoginScreen.jsx'], /<Button onClick=\{\(\) => navigate\("\/dashboard"\)\} \/>/);
    assert.match(files['App.jsx'], /setAuth/);
});
