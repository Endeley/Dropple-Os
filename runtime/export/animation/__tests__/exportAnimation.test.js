// NOTE: Tests defined but not executed yet.
// Runner setup is deferred intentionally.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { exportAnimation } from '../exportAnimation.js';

describe('exportAnimation (Phase 4D)', () => {
  it('produces deterministic normalized output', () => {
    const state = {
      document: {
        motion: {
          clips: {
            c1: {
              id: 'c1',
              target: 'nodeA',
              property: 'opacity',
              keyframes: [
                { id: 'k1', t: 0, v: 0, easing: 'linear' },
                { id: 'k2', t: 100, v: 1, easing: 'linear' },
              ],
            },
          },
        },
      },
    };

    const a = exportAnimation({ state, format: 'css' });
    const b = exportAnimation({ state, format: 'css' });

    assert.equal(a.normalized, b.normalized);
    assert.equal(a.manifest.manifestId, b.manifest.manifestId);
    assert.equal(a.manifest.exportFamily, 'motion');
  });

  it('preserves semantic format separation while using canonical motion authority', () => {
    const state = {
      document: {
        motion: {
          clips: {
            c1: {
              id: 'c1',
              target: 'nodeA',
              property: 'opacity',
              keyframes: [
                { id: 'k1', t: 0, v: 0, easing: 'linear' },
                { id: 'k2', t: 100, v: 1, easing: 'linear' },
              ],
            },
          },
        },
      },
    };

    const css = exportAnimation({ state, format: 'css' });
    const waapi = exportAnimation({ state, format: 'waapi' });

    assert.equal(css.manifest.format, 'css');
    assert.equal(waapi.manifest.format, 'waapi');
    assert.notEqual(css.manifest.manifestId, waapi.manifest.manifestId);
    assert.equal(Array.isArray(css.output), true);
    assert.equal(Array.isArray(waapi.output), true);
  });
});
