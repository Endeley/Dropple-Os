import { resolveCanonicalWorkspace, resolveCanonicalMode } from './modeResolution.js';
import { canonicalRegistry } from './canonicalRegistry.js';

/**
 * 🔒 Normalize workspace definition into safe, deterministic, data-only shape
 */
function normalizeWorkspaceDef(workspaceDef) {
    if (!workspaceDef) return null;

    const safeTools = Array.isArray(workspaceDef?.tools)
        ? workspaceDef.tools
        : Array.isArray(workspaceDef?.ui?.tools)
          ? workspaceDef.ui.tools
          : [
                // 🔥 Critical fallback (ensures UI never breaks)
                { id: 'select', label: 'Select' },
                { id: 'move', label: 'Move' },
            ];

    return {
        ...workspaceDef,
        tools: safeTools.slice(), // copy-on-read (no mutation risk)
    };
}

/**
 * 🔒 Ensure plain JSON-safe structure (no functions, no execution leakage)
 */
function assertPlainData(value, path = 'activation') {
    if (value == null) return;

    if (typeof value === 'function') {
        throw new Error(`Illegal function value in ${path}`);
    }

    if (Array.isArray(value)) {
        value.forEach((v, i) => assertPlainData(v, `${path}[${i}]`));
        return;
    }

    if (typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => assertPlainData(v, `${path}.${k}`));
    }
}

/**
 * 🔒 Build activation (pure)
 */
function buildActivation({ workspace, mode, workspaceDef }) {
    return {
        workspace: workspace.id,
        mode: mode.id,
        workspaceDef,
    };
}

/**
 * 🔒 Build adapter (pure)
 */
function buildAdapter({ workspace, mode }) {
    return {
        workspaceId: workspace.id,
        modeId: mode.id,
    };
}

/**
 * 🔒 Build contract seed (pure)
 */
function buildContractSeed({ workspace, mode }) {
    return {
        workspaceId: workspace.id,
        modeId: mode.id,
        capabilities: [],
    };
}

/**
 * 🔒 Public API
 */
export function getWorkspaceActivation({ workspaceId, modeId }) {
    const workspace = resolveCanonicalWorkspace(workspaceId);
    const mode = resolveCanonicalMode(modeId, workspace.id);

    const workspaceDef = canonicalRegistry[workspace.id];

    const normalizedWorkspaceDef = normalizeWorkspaceDef(workspaceDef);

    const activation = buildActivation({
        workspace,
        mode,
        workspaceDef: normalizedWorkspaceDef,
    });

    const adapter = buildAdapter({ workspace, mode });

    const contract = buildContractSeed({ workspace, mode });

    // 🔒 Enforce data-only output (guardrail)
    assertPlainData(activation);
    assertPlainData(adapter);
    assertPlainData(contract);

    return {
        ...activation,
        adapter,
        contract,
    };
}
