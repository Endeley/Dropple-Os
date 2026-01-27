export const CanvasSurfaceTypes = {
    SMOOTH: 'smooth',
    DOTS: 'dots',
    GRID: 'grid',
};

export function resolveCanvasSurface(workspace) {
    if (workspace?.canvasSurface) {
        return workspace.canvasSurface;
    }
    if (workspace?.id === 'uiux') {
        return {
            type: CanvasSurfaceTypes.DOTS,
            gridSize: 8,
            snap: false,
        };
    }

    return {
        type: CanvasSurfaceTypes.SMOOTH,
        snap: false,
    };
}
