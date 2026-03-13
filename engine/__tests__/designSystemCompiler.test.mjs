import test from 'node:test';
import assert from 'node:assert/strict';

import { compileProject } from '../compiler/compileProject.js';

test('design system compiler emits tokens, themes, and react design system files', () => {
    const files = compileProject({
        nodes: [],
        designSystem: {
            colors: {
                primary: '#3b82f6',
                background: '#ffffff',
                text: '#111111',
            },
            spacing: {
                medium: '16px',
            },
            components: {
                Button: {
                    variants: {
                        primary: {},
                        outline: {},
                    },
                    slots: ['icon', 'label'],
                },
            },
        },
    });

    assert.ok(files['design-system/react/Button.jsx']);
    assert.ok(files['design-system/react/theme.css']);
    assert.ok(files['design-system/tokens/tokens.json']);
    assert.match(files['design-system/react/Button.jsx'], /function Button/);
    assert.match(files['design-system/react/Button.jsx'], /variant = "outline"|variant = "primary"/);
    assert.match(files['design-system/react/theme.css'], /--color-primary: #3b82f6;/);
    assert.match(files['design-system/react/theme.css'], /\[data-theme="dark"\]/);
    assert.match(files['design-system/tokens/tokens.json'], /"Button"/);
});
