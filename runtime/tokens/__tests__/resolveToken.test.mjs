import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveToken } from '@/runtime/tokens/resolveToken.js';

const TOKENS = {
    color: {
        primary: '#3b82f6',
        secondary: '#6366f1',
    },
};

test('resolveToken returns literal values unchanged when they are not token references', () => {
    assert.equal(resolveToken('#ff0000', TOKENS), '#ff0000');
    assert.equal(resolveToken(null, TOKENS), null);
});

test('resolveToken resolves string token references', () => {
    assert.equal(resolveToken('token.color.primary', TOKENS), '#3b82f6');
    assert.equal(resolveToken('token.color.secondary', TOKENS), '#6366f1');
});

test('resolveToken resolves object token references', () => {
    assert.equal(resolveToken({ type: 'token', value: 'color.primary' }, TOKENS), '#3b82f6');
});

test('resolveToken returns null for missing token paths', () => {
    assert.equal(resolveToken('token.color.missing', TOKENS), null);
    assert.equal(resolveToken({ type: 'token', value: 'missing.value' }, TOKENS), null);
});
