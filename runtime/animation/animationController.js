// runtime/animation/animationController.js

export function createAnimationController({ duration = 200, easing, onFrame, onComplete }) {
    let rafId = null;
    let startTime = 0;
    let fromState = null;
    let toState = null;
    let completed = false;
    const defaultOnComplete = onComplete;
    let currentOnComplete = onComplete;

    function start(prev, next, options = {}) {
        cancel();

        fromState = prev;
        toState = next;
        completed = false;
        startTime = performance.now();
        currentOnComplete = options.onComplete ?? defaultOnComplete;

        rafId = requestAnimationFrame(tick);
    }

    function tick(now) {
        if (!fromState || !toState) return;

        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const eased = easing ? easing(t) : t;

        // 🔒 Projection only — no state mutation here
        onFrame(fromState, toState, eased);

        if (t < 1) {
            rafId = requestAnimationFrame(tick);
        } else {
            finalize();
        }
    }

    function finalize() {
        if (completed) return;
        completed = true;

        rafId = null;

        // 🔔 Signal completion (caller decides what to do)
        if (typeof currentOnComplete === 'function') {
            currentOnComplete();
        }

        cleanup();
    }

    function cancel() {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        cleanup();
    }

    function cleanup() {
        rafId = null;
        startTime = 0;
        fromState = null;
        toState = null;
        completed = false;
        currentOnComplete = defaultOnComplete;
    }

    return {
        start,
        cancel,
    };
}
