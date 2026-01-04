/**
 * Track schema: animates ONE node across property paths.
 */
export function createTrack({ id, nodeId }) {
    return {
        id,
        nodeId,
        properties: {
            // propertyPath -> keyframes[]
        },
    };
}
