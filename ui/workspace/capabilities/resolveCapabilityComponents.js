export function resolveCapabilityComponents(capabilities, registry) {
    const surfaceEntries = [];
    const overlayEntries = [];
    const seenSurfacePanels = new Set();
    const seenOverlays = new Set();

    for (const capability of capabilities) {
        const definition = registry[capability];
        if (!definition) continue;
        const ui = definition.ui || {};

        if (Array.isArray(ui.surfacePanels)) {
            for (const entry of ui.surfacePanels) {
                const component = entry?.component ?? null;
                if (!component || seenSurfacePanels.has(component)) continue;

                seenSurfacePanels.add(component);
                surfaceEntries.push({
                    component,
                    priority: Number.isFinite(entry?.priority) ? entry.priority : 100,
                });
            }
        }

        if (Array.isArray(ui.overlays)) {
            for (const entry of ui.overlays) {
                const component = entry?.component ?? null;
                if (!component || seenOverlays.has(component)) continue;

                seenOverlays.add(component);
                overlayEntries.push({
                    component,
                    priority: Number.isFinite(entry?.priority) ? entry.priority : 100,
                });
            }
        }
    }

    const sortEntries = (left, right) => {
        if (left.priority !== right.priority) {
            return left.priority - right.priority;
        }

        const leftName = left.component?.displayName ?? left.component?.name ?? '';
        const rightName = right.component?.displayName ?? right.component?.name ?? '';
        return leftName.localeCompare(rightName);
    };

    return {
        surfacePanels: surfaceEntries.sort(sortEntries).map((entry) => entry.component),
        overlays: overlayEntries.sort(sortEntries).map((entry) => entry.component),
    };
}
