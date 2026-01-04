export function createKeyframe({ time, value, easing = 'linear' }) {
    return {
        time,
        value,
        easing,
    };
}
