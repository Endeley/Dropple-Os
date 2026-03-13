import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { setRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { clearPluginAPI, getRegisteredTools, getWorkspaceCapabilities } from '@/platform/plugins/pluginAPI.js';
import { clearPluginHost, startPluginHost } from '@/platform/plugins/pluginHost.js';
import { clearPluginRegistry, getAllPlugins } from '@/platform/plugins/pluginRegistry.js';

function resetPluginPlatform() {
    clearPluginHost();
    clearPluginAPI();
    clearPluginRegistry();
}

test('plugin host installs controlled tool and workspace extensions', async () => {
    resetPluginPlatform();

    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState({ nodes: {}, rootIds: [] }, { animate: false });
    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'dev',
                policy: {
                    capabilities: ['node:create'],
                },
            },
        },
    });
    setRuntimeDispatcher(dispatcher);

    const pluginModule = async (sandbox) => ({
        id: 'example-tool',
        install({
            registerTool,
            registerWorkspaceCapability,
        }) {
            registerTool('example', {
                name: 'Example Tool',
                async run() {
                    return sandbox.dispatchEvent({
                        type: EventTypes.NODE_CREATE,
                        payload: { node: { id: 'plugin-node', type: 'frame' } },
                    });
                },
            });

            registerWorkspaceCapability('education', {
                label: 'Education',
            });
        },
    });

    await startPluginHost(
        [{ id: 'example-tool', module: pluginModule }],
        () => useRuntimeStore.getState(),
    );

    assert.equal(getAllPlugins().length, 1);
    assert.equal(getRegisteredTools().length, 1);
    assert.equal(getWorkspaceCapabilities().length, 1);

    const [tool] = getRegisteredTools();
    await tool.run();

    const next = dispatcher.getState();
    assert.ok(next.nodes['plugin-node']);
});

test('plugin sandbox returns frozen projection snapshots', async () => {
    resetPluginPlatform();

    const projection = {
        selection: { ids: ['a'] },
    };

    const pluginModule = async (sandbox) => {
        const snapshot = sandbox.readProjection();
        assert.deepEqual(snapshot.selection.ids, ['a']);
        assert.throws(() => {
            snapshot.selection = null;
        });

        return {
            id: 'snapshot-plugin',
        };
    };

    await startPluginHost(
        [{ id: 'snapshot-plugin', module: pluginModule }],
        () => projection,
    );

    assert.equal(getAllPlugins().length, 1);
});

test('plugin install receives capability context instead of importing engines directly', async () => {
    resetPluginPlatform();

    const pluginModule = async () => ({
        id: 'capability-aware-plugin',
        install({ capabilities, registerCapability }) {
            registerCapability({
                id: 'vector',
                runtimeServices: {
                    createVector: 'vector-service',
                },
            });

            assert.equal(capabilities.has('vector'), true);
            assert.equal(capabilities.get('vector').runtimeServices.createVector, 'vector-service');
        },
    });

    await startPluginHost(
        [{ id: 'capability-aware-plugin', module: pluginModule }],
        () => ({}),
    );

    assert.equal(getAllPlugins().length, 1);
});
