import test from 'node:test';
import assert from 'node:assert/strict';

import { validateGraphParameters } from '../graph/validateGraphParameters.js';

test('validateGraphParameters accepts valid parameter definitions', () => {
    assert.doesNotThrow(() =>
        validateGraphParameters({
            parameters: {
                speed: { type: 'number', min: 0, max: 1, default: 0.5 },
                attack: { type: 'boolean', default: false },
            },
        })
    );
});

test('validateGraphParameters throws when a parameter type is missing', () => {
    assert.throws(
        () =>
            validateGraphParameters({
                parameters: {
                    speed: { default: 0 },
                },
            }),
        /Parameter "speed" missing type/
    );
});

test('validateGraphParameters throws on unsupported types', () => {
    assert.throws(
        () =>
            validateGraphParameters({
                parameters: {
                    speed: { type: 'vector' },
                },
            }),
        /Parameter "speed" has unsupported type "vector"/
    );
});

test('validateGraphParameters throws on invalid ranges', () => {
    assert.throws(
        () =>
            validateGraphParameters({
                parameters: {
                    speed: { type: 'number', min: 10, max: 1 },
                },
            }),
        /Parameter "speed" has invalid range/
    );
});
