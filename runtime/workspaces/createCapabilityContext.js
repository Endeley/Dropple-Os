export function createCapabilityContext({ emit, workspace, mode } = {}) {
    return Object.freeze({
        emit: typeof emit === 'function' ? emit : null,
        workspace: workspace ?? null,
        mode: mode ?? null,
    });
}
