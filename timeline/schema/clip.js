// timeline/createTimelinePrimitives.js

/**
 * Timeline schema for authoring motion.
 * Pure data constructors — NO ID generation here.
 * IDs are assigned at commit time (Phase 8 policy).
 */

export function createClip({ id = null, start = 0, end = 0, source = null, loop = false, keyframes = [] } = {}) {
    if (end < start) {
        throw new Error('Clip end must be >= start');
    }

    return {
        id, // assigned at commit boundary
        start,
        end,
        source, // nodeId, media asset, generator
        loop,
        keyframes, // [{ id, time, value, easing }]
    };
}
