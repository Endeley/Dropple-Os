'use client';

async function copyTextToClipboard(text) {
    try {
        await navigator.clipboard?.writeText(text);
        return true;
    } catch {
        return false;
    }
}

export async function performServiceExport({
    snapshot,
    exportTarget = null,
    runWorkflow,
    performWorkflow,
} = {}) {
    if (!snapshot || typeof snapshot !== 'object') {
        throw new Error('performServiceExport requires snapshot.');
    }
    if (typeof runWorkflow !== 'function' || typeof performWorkflow !== 'function') {
        throw new Error('performServiceExport requires workflow functions.');
    }

    await runWorkflow({
        snapshot,
        exportTarget,
    });
    const performed = await performWorkflow();
    const outputText = JSON.stringify(performed.output, null, 2);
    const copied = await copyTextToClipboard(outputText);

    return Object.freeze({
        performed,
        copied,
        message: copied ? 'Export output copied to clipboard' : 'Export output generated',
    });
}
