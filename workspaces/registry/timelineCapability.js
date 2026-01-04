/**
 * Timeline configuration shape.
 */
export function createTimelineCapability({ readOnly = true, maxTracks = Infinity, allowedProperties = [] } = {}) {
    return {
        readOnly,
        maxTracks,
        allowedProperties,
    };
}
