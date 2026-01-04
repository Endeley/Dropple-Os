/**
 * TimelineContract
 *
 * Defines what a timeline IS.
 * No UI. No rendering. No mutation.
 */
export const TimelineContract = {
    /**
     * Total duration in milliseconds
     */
    duration: 0,

    /**
     * Current playhead position (ms)
     */
    currentTime: 0,

    /**
     * Timeline tracks
     * Each track describes how state changes over time
     */
    tracks: [
        /*
        {
          id: "transform",
          targetId: "node-id",
          property: "x",
          keyframes: [
            { time: 0, value: 0 },
            { time: 1000, value: 200 },
          ]
        }
        */
    ],
};
