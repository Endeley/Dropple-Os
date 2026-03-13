import test from 'node:test';
import assert from 'node:assert/strict';

import {
    activateWorkspaceCapabilities,
} from '@/platform/capabilities/capabilityRuntime.js';
import {
    clearCapabilityRegistry,
    registerCapability,
} from '@/platform/capabilities/capabilityRegistry.js';
import {
    clearWorkspacePolicies,
    registerWorkspacePolicy,
} from '@/platform/capabilities/workspacePolicy.js';
import { clearPluginAPI, getRegisteredTools } from '@/platform/plugins/pluginAPI.js';
import { clearPluginHost, startPluginHost } from '@/platform/plugins/pluginHost.js';
import { clearPluginRegistry } from '@/platform/plugins/pluginRegistry.js';

function resetCapabilityPlatform() {
    clearCapabilityRegistry();
    clearWorkspacePolicies();
    clearPluginHost();
    clearPluginAPI();
    clearPluginRegistry();
}

test('capability engine resolves deterministic workspace activation sets', () => {
    resetCapabilityPlatform();

    registerCapability({
        id: 'designSystem',
        tools: ['tokenEditor'],
        nodes: ['component', 'variant'],
        compilers: ['react'],
    });
    registerCapability({
        id: 'layout',
        tools: ['frame', 'grid', 'stack'],
        nodes: ['container', 'frame'],
        permissions: ['app:navigate'],
    });

    registerWorkspacePolicy({
        workspace: 'uiux',
        capabilities: ['layout', 'designSystem'],
    });

    const active = activateWorkspaceCapabilities('uiux');

    assert.deepEqual([...active.capabilities], ['designSystem', 'layout']);
    assert.deepEqual([...active.tools], ['frame', 'grid', 'stack', 'tokenEditor']);
    assert.deepEqual([...active.nodes], ['component', 'container', 'frame', 'variant']);
    assert.deepEqual([...active.compilers], ['react']);
    assert.deepEqual([...active.permissions], ['app:navigate']);
});

test('plugins can register capabilities consumed by workspace policy', async () => {
    resetCapabilityPlatform();

    const pluginModule = async () => ({
        id: 'physics-plugin',
        install({ registerCapability, registerTool }) {
            registerCapability({
                id: 'physics',
                tools: ['physicsBrush'],
                nodes: ['rigidBody'],
            });

            registerTool('physicsBrush', {
                name: 'Physics Brush',
            });
        },
    });

    await startPluginHost([{ id: 'physics-plugin', module: pluginModule }], () => ({}));

    registerWorkspacePolicy({
        workspace: 'game',
        capabilities: ['physics'],
    });

    const active = activateWorkspaceCapabilities('game');

    assert.deepEqual([...active.capabilities], ['physics']);
    assert.deepEqual([...active.tools], ['physicsBrush']);
    assert.deepEqual([...active.nodes], ['rigidBody']);
    assert.equal(getRegisteredTools()[0].id, 'physicsBrush');
});
