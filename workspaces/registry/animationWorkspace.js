/**
 * Animation Workspace
 *
 * This is the reference implementation for:
 * - timeline-heavy modes
 * - motion systems
 * - preview vs commit workflows
 */
export const animationWorkspace = {
    id: "animation",
    label: "Animation & Motion",
    status: "active",

    /**
     * Required engine systems
     */
    engines: ["nodeTree", "layout", "constraints", "timeline", "motion"],

    /**
     * Tools exposed to the user
     */
    tools: ["select", "move", "resize", "draw-path", "keyframe", "easing"],

    /**
     * Inspector panels
     */
    panels: ["layers", "properties", "timeline", "motion"],

    /**
     * Timeline is FIRST-CLASS here
     */
    timeline: {
        enabled: true,
        primary: true,

        tracks: ["transform", "opacity", "motion-path", "effects"],
    },

    /**
     * Declares what kind of intent this workspace emits
     */
    ir: {
        design: true,
        layout: true,
        motion: true,

        semantic: false,
        audio: false,
        video: false,
        code: false,
    },

    /**
     * Export formats enabled for animation
     */
    export: {
        formats: ["mp4", "gif", "lottie", "svg-motion"],
    },
};
