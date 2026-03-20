import {
    WORKSPACE_CONTRACTS,
    WORKSPACE_MODE_CONTRACTS,
} from './workspaceContracts.js';
import { createDefaultSlice } from './defaultDocumentSlices.js';

export function bootWorkspaceDocument({
    document,
    workspace,
    mode,
} = {}) {
    if (!document || typeof document !== 'object') {
        throw new Error('[BootContract] Invalid document');
    }

    const baseContract = WORKSPACE_CONTRACTS[workspace];
    if (!baseContract) {
        return document;
    }

    const overlayContract =
        mode != null ? WORKSPACE_MODE_CONTRACTS[`${workspace}:${mode}`] ?? null : null;

    const requiredSlices = new Set([
        ...(baseContract.required || []),
        ...(overlayContract?.required || []),
    ]);

    let nextDocument = document;

    for (const slice of requiredSlices) {
        if (nextDocument[slice] !== undefined) continue;

        const defaultValue = createDefaultSlice(slice);
        if (defaultValue === undefined) continue;

        if (nextDocument === document) {
            nextDocument = { ...document };
        }

        nextDocument[slice] = defaultValue;
    }

    return nextDocument;
}
