export function createAnimationController({ duration = 200, easing, onFrame }) {
    let rafId = null;
    let startTime = 0;
    let fromState = null;
    let toState = null;

    function start(prev, next) {
        cancel();
        fromState = prev;
        toState = next;
        startTime = performance.now();
        rafId = requestAnimationFrame(tick);
    }

    function tick(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = easing ? easing(t) : t;

        onFrame(fromState, toState, eased);

        if (t < 1) {
            rafId = requestAnimationFrame(tick);
        }
    }

    function cancel() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    return { start, cancel };
}
