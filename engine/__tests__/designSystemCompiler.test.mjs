import test from 'node:test';
import assert from 'node:assert/strict';

import { compileProject } from '../compiler/compileProject.js';

test('design system compiler emits tokens, themes, and react design system files', () => {
    const files = compileProject({
        nodes: [],
        designSystem: {
            tokens: {
                color: {
                    primary: '#3b82f6',
                    secondary: '#9333ea',
                    background: '#ffffff',
                },
                spacing: {
                    medium: '16px',
                },
            },
            themes: {
                light: {
                    primaryColor: 'color.primary',
                    spacingMd: 'spacing.medium',
                },
                brand: {
                    primaryColor: 'color.secondary',
                },
            },
            components: {
                Button: {
                    tag: 'button',
                    defaultVariant: 'primary',
                    variants: {
                        primary: {
                            background: 'color.primary',
                            color: '#fff',
                        },
                        secondary: {
                            background: 'color.secondary',
                            color: '#fff',
                        },
                    },
                    slots: ['icon', 'label'],
                },
                Card: {
                    variants: {
                        default: {
                            padding: 'spacing.medium',
                        },
                    },
                },
            },
        },
    }, { workspace: 'material' });

    assert.ok(files['design-system/react/Button.jsx']);
    assert.ok(files['design-system/react/Card.jsx']);
    assert.ok(files['design-system/react/index.js']);
    assert.ok(files['design-system/react/tokens.js']);
    assert.ok(files['design-system/react/themes.js']);
    assert.ok(files['design-system/react/package.json']);
    assert.ok(files['design-system/react/theme.css']);
    assert.ok(files['design-system/tokens/tokens.json']);
    assert.match(files['design-system/react/Button.jsx'], /function Button/);
    assert.match(files['design-system/react/Button.jsx'], /variant = "primary"/);
    assert.match(files['design-system/react/Button.jsx'], /background/);
    assert.match(files['design-system/react/index.js'], /export \{ default as Button \}/);
    assert.match(files['design-system/react/tokens.js'], /export const tokens/);
    assert.match(files['design-system/react/themes.js'], /export const themes/);
    assert.match(files['design-system/react/package.json'], /@dropple\/material/);
    assert.match(files['design-system/react/theme.css'], /--color-primary: #3b82f6;/);
    assert.match(files['design-system/react/theme.css'], /\[data-theme="brand"\]/);
    assert.match(files['design-system/tokens/tokens.json'], /"Button"/);
    assert.match(files['design-system/tokens/tokens.json'], /"primaryColor": "#3b82f6"/);
});
