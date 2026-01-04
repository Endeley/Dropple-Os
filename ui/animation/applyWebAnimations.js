/**
 * Applies exported Web Animations config to DOM nodes.
 * UI-only; runtime state remains untouched.
 */
export function applyWebAnimations({ animations, nodesById }) {
    if (!animations || !Array.isArray(animations)) return;

    animations.forEach((anim) => {
        const el = document.querySelector(`[data-node-id="${anim.target}"]`);
        if (!el) return;
        el.animate(anim.keyframes, anim.options);
    });
}
