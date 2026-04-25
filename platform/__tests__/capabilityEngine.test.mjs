import test from 'node:test';
import assert from 'node:assert/strict';

import {
    activateWorkspaceCapabilities,
} from '@/platform/capabilities/capabilityRuntime.js';
import { resolveWorkspaceActivationContract } from '@/platform/capabilities/workspaceActivation.js';
import {
    createGlobalCapabilityContext,
    createWorkspaceCapabilityContext,
} from '@/platform/capabilities/capabilityContext.js';
import {
    getWorkspaceDefinition,
    listWorkspaceDefinitions,
    resolveWorkspaceId,
} from '@/platform/workspaces/index.js';
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

test('capability contexts expose only enabled capability surfaces', () => {
    resetCapabilityPlatform();

    registerCapability({
        id: 'layout',
        runtimeServices: {
            evaluateLayout: 'layout-service',
        },
        selectors: {
            selectLayout: 'layout-selector',
        },
    });

    registerCapability({
        id: 'vector',
        runtimeServices: {
            createVector: 'vector-service',
        },
    });

    registerWorkspacePolicy({
        workspace: 'graphic',
        capabilities: ['vector'],
    });

    const globalContext = createGlobalCapabilityContext();
    const workspaceContext = createWorkspaceCapabilityContext('graphic');

    assert.equal(globalContext.has('layout'), true);
    assert.equal(globalContext.get('layout').runtimeServices.evaluateLayout, 'layout-service');
    assert.deepEqual(globalContext.list(), ['layout', 'vector']);

    assert.equal(workspaceContext.has('vector'), true);
    assert.equal(workspaceContext.has('layout'), false);
    assert.throws(() => workspaceContext.get('layout'), /Capability not enabled/);
});

test('workspace registry can seed capability activation without parallel policy wiring', () => {
    resetCapabilityPlatform();

    registerCapability({
        id: 'node:create',
        tools: ['frame'],
    });
    registerCapability({
        id: 'node:mutate',
        tools: ['move', 'resize', 'text', 'image', 'shape'],
    });
    registerCapability({
        id: 'vector:create',
        nodes: ['vector'],
    });
    registerCapability({
        id: 'vector:mutate',
        permissions: ['vector:edit'],
    });
    registerCapability({
        id: 'vector:delete',
        permissions: ['vector:delete'],
    });
    registerCapability({
        id: 'timeline:view',
        panels: ['TimelinePanel'],
    });

    const active = activateWorkspaceCapabilities('graphic');
    const contract = resolveWorkspaceActivationContract('graphic');

    assert.equal(active.capabilities.has('node:create'), true);
    assert.equal(active.capabilities.has('vector:create'), true);
    assert.equal(contract.workspace, 'graphic');
    assert.equal(contract.tools.has('select'), true);
    assert.equal(contract.tools.has('frame'), true);
    assert.equal(contract.permissions.has('vector:edit'), true);
    assert.equal(contract.allowedEventTypes.size > 0, true);
    assert.equal(contract.canvasPolicy, null);
});

test('platform workspace registry resolves canonical workspace definitions', () => {
    const definition = getWorkspaceDefinition('design');
    const mediaDefinition = getWorkspaceDefinition('media');
    const animationDefinition = getWorkspaceDefinition('animation');
    const workspaceList = listWorkspaceDefinitions();

    assert.equal(resolveWorkspaceId('design'), 'design');
    assert.equal(resolveWorkspaceId('graphic'), 'design');
    assert.equal(definition.id, 'uiux');
    assert.equal(resolveWorkspaceId('media'), 'media');
    assert.equal(mediaDefinition.id, 'media');
    assert.equal(animationDefinition.id, 'animation');
    assert.equal(Array.isArray(workspaceList), true);
    assert.equal(workspaceList.length > 0, true);
});
