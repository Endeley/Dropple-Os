import test from 'node:test';
import assert from 'node:assert/strict';

import { compileConstraints } from '@/runtime/compiler/layout/compileConstraints.js';
import { compileResponsiveLayout } from '@/runtime/compiler/layout/compileResponsiveLayout.js';
import { compileBreakpoints } from '@/runtime/compiler/layout/compileBreakpoints.js';
import { compileLayoutSystems } from '@/runtime/compiler/layout/compileLayoutSystems.js';

test('layout compiler extracts constraints responsive rules and breakpoints from canonical document layout', () => {
    const document = {
        sceneGraph: {
            nodes: {
                root: {
                    id: 'root',
                },
                card: {
                    id: 'card',
                    parentId: 'root',
                    responsive: {
                        mobile: { width: '100%' },
                        tablet: { width: '50%' },
                        desktop: { width: 400 },
                    },
                },
            },
        },
        layout: {
            nodes: {
                root: {
                    mode: 'free',
                },
                card: {
                    mode: 'constraint',
                    constraints: {
                        left: true,
                        top: true,
                        centerX: false,
                    },
                },
            },
            breakpoints: {
                mobile: 420,
                tablet: 900,
                desktop: 1440,
            },
        },
    };

    assert.deepEqual(compileConstraints(document.layout), [
        {
            nodeId: 'card',
            type: 'constraints',
            constraints: {
                left: true,
                top: true,
                centerX: false,
            },
        },
    ]);

    assert.deepEqual(compileResponsiveLayout(document.sceneGraph), [
        {
            nodeId: 'card',
            type: 'responsiveLayout',
            rules: {
                mobile: { width: '100%' },
                tablet: { width: '50%' },
                desktop: { width: 400 },
            },
        },
    ]);

    assert.deepEqual(compileBreakpoints(document), {
        type: 'breakpoints',
        breakpoints: {
            mobile: 420,
            tablet: 900,
            desktop: 1440,
        },
    });

    assert.deepEqual(compileLayoutSystems(document), {
        constraints: compileConstraints(document.layout),
        responsiveRules: compileResponsiveLayout(document.sceneGraph),
        breakpoints: {
            mobile: 420,
            tablet: 900,
            desktop: 1440,
        },
    });
});
