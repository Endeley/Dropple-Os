export const OBSERVER_INSIGHTS = {
    ALIGNMENT_IN_PROGRESS: 'ALIGNMENT_IN_PROGRESS',
    DENSE_CLUSTER: 'DENSE_CLUSTER',
    SPARSE_VIEWPORT: 'SPARSE_VIEWPORT',
    SNAP_CANDIDATE_VISIBLE: 'SNAP_CANDIDATE_VISIBLE',
};

if (process.env.NODE_ENV === 'development') {
    Object.freeze(OBSERVER_INSIGHTS);
}

const DENSE_CLUSTER_THRESHOLD = 4;
const SPARSE_VIEWPORT_THRESHOLD = 0;

export function observeSpatialState(input) {
    if (!input) return [];

    const insights = [];
    const { world, camera, interaction, nearest, snap } = input;

    const zoomTier = camera?.zoomTier ?? 'normal';
    const zoomEligible = zoomTier === 'normal' || zoomTier === 'detail' || zoomTier === 'micro';

    if (
        interaction?.isDragging &&
        nearest?.primary &&
        Array.isArray(snap?.candidates) &&
        snap.candidates.length > 0
    ) {
        insights.push({
            type: OBSERVER_INSIGHTS.ALIGNMENT_IN_PROGRESS,
            nodes: [interaction.activeNodeId, nearest.primary.id].filter(Boolean),
        });
    }

    if (zoomEligible && Array.isArray(nearest?.list)) {
        if (nearest.list.length >= DENSE_CLUSTER_THRESHOLD) {
            insights.push({
                type: OBSERVER_INSIGHTS.DENSE_CLUSTER,
                region: {
                    center: interaction?.cursorWorld ?? null,
                    radius: nearest.radius,
                },
            });
        }
    }

    if (zoomEligible) {
        const viewportCount = world?.viewportNodeCount ?? 0;
        if (viewportCount <= SPARSE_VIEWPORT_THRESHOLD) {
            insights.push({ type: OBSERVER_INSIGHTS.SPARSE_VIEWPORT });
        }
    }

    if (Array.isArray(snap?.candidates) && snap.candidates.length > 0) {
        insights.push({
            type: OBSERVER_INSIGHTS.SNAP_CANDIDATE_VISIBLE,
            targetId: snap.candidates[0].targetId,
        });
    }

    return insights;
}
