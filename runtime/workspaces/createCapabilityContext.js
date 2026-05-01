export function createCapabilityContext({ emit, workspace, mode, overlayId } = {}) {
    return Object.freeze({
        emit: typeof emit === 'function' ? emit : null,
        workspace: workspace ?? null,
        mode: mode ?? null,
        overlayId: overlayId ?? null,
    });
}
