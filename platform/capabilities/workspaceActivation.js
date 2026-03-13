import { activateWorkspaceCapabilities } from './capabilityRuntime.js';
import { ensureWorkspacePolicyRegistered, getWorkspaceDefinition } from './workspaceRegistryBridge.js';

function sortSet(values) {
    return new Set([...values].sort((a, b) => String(a).localeCompare(String(b))));
}

function addAll(target, values = []) {
    [...values].sort((a, b) => String(a).localeCompare(String(b))).forEach((value) => {
        target.add(value);
    });
}

export function resolveWorkspaceActivationContract(workspace) {
    const policy = ensureWorkspacePolicyRegistered(workspace);
    const definition = getWorkspaceDefinition(workspace);

    if (!policy || !definition) {
        throw new Error(`Workspace ${workspace} is not registered`);
    }

    const capabilityActivation = activateWorkspaceCapabilities(workspace);
    const tools = new Set(capabilityActivation.tools);
    const panels = new Set(capabilityActivation.panels);

    addAll(tools, policy.tools);
    addAll(panels, policy.panels);

    return {
        workspace: definition.id,
        readonly: Boolean(policy.readonly),
        capabilities: capabilityActivation.capabilities,
        tools: sortSet(tools),
        panels: sortSet(panels),
        nodes: capabilityActivation.nodes,
        compilers: capabilityActivation.compilers,
        exports: capabilityActivation.exports,
        dataProviders: capabilityActivation.dataProviders,
        workspaceFeatures: capabilityActivation.workspaceFeatures,
        permissions: capabilityActivation.permissions,
        allowedEventTypes: new Set(policy.allowedEventTypes ?? []),
        enabledTriggerTypes: new Set(policy.enabledTriggerTypes ?? []),
        canvasPolicy: policy.canvasPolicy ?? null,
        canvasSurface: policy.canvasSurface ?? null,
        timeline: policy.timeline ?? null,
        media: policy.media ?? null,
        render: policy.render ?? null,
        export: policy.export ?? null,
    };
}
