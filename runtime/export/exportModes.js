export function exportModes(workspace) {
    return (
        workspace?.modes?.map((m) => ({
            id: m.id,
            allowedIntents: m.allowedIntents ?? [],
            uiOverlays: m.uiOverlays ?? [],
        })) ?? []
    );
}
