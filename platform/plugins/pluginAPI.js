import { registerPlugin } from './pluginRegistry.js';
import { registerCapability } from '@/platform/capabilities/capabilityRegistry.js';

const tools = new Map();
const panels = new Map();
const nodes = new Map();
const compilers = new Map();
const exporters = new Map();
const workspaces = new Map();
const dataProviders = new Map();

function sortValues(map) {
    return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, value]) => value);
}

function setUnique(map, id, value, label) {
    if (!id) {
        throw new Error(`${label} requires id`);
    }
    if (map.has(id)) {
        throw new Error(`${label} ${id} already registered`);
    }
    map.set(id, value);
}

export function registerTool(id, tool) {
    setUnique(tools, id, { id, ...tool }, 'Tool');
}

export function registerPanel(id, panel) {
    setUnique(panels, id, { id, ...panel }, 'Panel');
}

export function registerNodeType(id, node) {
    setUnique(nodes, id, { id, ...node }, 'Node');
}

export function registerCompilerTarget(id, compiler) {
    setUnique(compilers, id, { id, ...compiler }, 'Compiler target');
}

export function registerExportTarget(id, target) {
    setUnique(exporters, id, { id, ...target }, 'Export target');
}

export function registerWorkspaceCapability(id, workspace) {
    setUnique(workspaces, id, { id, ...workspace }, 'Workspace capability');
}

export function registerDataProvider(id, provider) {
    setUnique(dataProviders, id, { id, ...provider }, 'Data provider');
}

export function getRegisteredTools() {
    return sortValues(tools);
}

export function getRegisteredPanels() {
    return sortValues(panels);
}

export function getRegisteredNodeTypes() {
    return sortValues(nodes);
}

export function getCompilerTargets() {
    return sortValues(compilers);
}

export function getExportTargets() {
    return sortValues(exporters);
}

export function getWorkspaceCapabilities() {
    return sortValues(workspaces);
}

export function getDataProviders() {
    return sortValues(dataProviders);
}

export function installPlugin(plugin, sandbox) {
    registerPlugin(plugin);

    if (typeof plugin.install === 'function') {
        plugin.install({
            sandbox,
            registerCapability,
            registerTool,
            registerPanel,
            registerNodeType,
            registerCompilerTarget,
            registerExportTarget,
            registerWorkspaceCapability,
            registerDataProvider,
        });
    }

    return plugin;
}

export function clearPluginAPI() {
    tools.clear();
    panels.clear();
    nodes.clear();
    compilers.clear();
    exporters.clear();
    workspaces.clear();
    dataProviders.clear();
}
