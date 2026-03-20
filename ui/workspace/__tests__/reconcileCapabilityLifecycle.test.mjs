import test from 'node:test';
import assert from 'node:assert/strict';
import {
    cleanupCapabilityLifecycle,
    reconcileCapabilityLifecycle,
} from '@/ui/workspace/capabilities/reconcileCapabilityLifecycle.js';

test('reconcileCapabilityLifecycle mounts new capabilities and unmounts removed ones', () => {
    const calls = [];
    const context = Object.freeze({ workspace: 'media', mode: 'animation' });
    const registry = {
        graph: {
            lifecycle: {
                onMount(ctx) {
                    calls.push(['mount', 'graph', ctx]);
                },
                onUnmount(ctx) {
                    calls.push(['unmount', 'graph', ctx]);
                },
            },
        },
        rig: {
            lifecycle: {
                onMount(ctx) {
                    calls.push(['mount', 'rig', ctx]);
                },
                onUnmount(ctx) {
                    calls.push(['unmount', 'rig', ctx]);
                },
            },
        },
    };

    let mounted = reconcileCapabilityLifecycle({
        mountedCapabilities: new Set(),
        capabilities: ['graph', 'rig'],
        registry,
        context,
    });

    mounted = reconcileCapabilityLifecycle({
        mountedCapabilities: mounted,
        capabilities: ['rig'],
        registry,
        context,
    });

    assert.deepEqual(
        calls.map(([phase, capability]) => [phase, capability]),
        [
            ['mount', 'graph'],
            ['mount', 'rig'],
            ['unmount', 'graph'],
        ],
    );
    assert.deepEqual([...mounted], ['rig']);
});

test('cleanupCapabilityLifecycle unmounts all mounted capabilities', () => {
    const calls = [];
    const registry = {
        graph: {
            lifecycle: {
                onUnmount() {
                    calls.push('graph');
                },
            },
        },
        rig: {
            lifecycle: {
                onUnmount() {
                    calls.push('rig');
                },
            },
        },
    };

    const mounted = cleanupCapabilityLifecycle({
        mountedCapabilities: new Set(['graph', 'rig']),
        registry,
        context: Object.freeze({}),
    });

    assert.deepEqual(calls, ['graph', 'rig']);
    assert.equal(mounted.size, 0);
});

test('reconcileCapabilityLifecycle isolates lifecycle errors per capability', () => {
    const calls = [];
    const errors = [];
    const originalConsoleError = console.error;
    console.error = (...args) => {
        errors.push(args);
    };

    try {
        const mounted = reconcileCapabilityLifecycle({
            mountedCapabilities: new Set(),
            capabilities: ['graph', 'rig'],
            registry: {
                graph: {
                    lifecycle: {
                        onMount() {
                            throw new Error('graph failed');
                        },
                    },
                },
                rig: {
                    lifecycle: {
                        onMount() {
                            calls.push('rig-mounted');
                        },
                    },
                },
            },
            context: Object.freeze({}),
        });

        assert.deepEqual([...mounted], ['graph', 'rig']);
        assert.deepEqual(calls, ['rig-mounted']);
        assert.equal(errors.length, 1);
        assert.match(String(errors[0][0]), /\[Capability:graph\] mount failed/);
    } finally {
        console.error = originalConsoleError;
    }
});
