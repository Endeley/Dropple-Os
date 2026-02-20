export function exportMetadata(workspace) {
    return {
        createdAt: workspace?.createdAt,
        updatedAt: workspace?.updatedAt,
        createdBy: workspace?.createdBy,
    };
}
