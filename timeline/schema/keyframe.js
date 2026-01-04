export function createKeyframe({ time, property, value, easing = 'linear' } = {}) {
    if (time == null) throw new Error('Keyframe time required');
    if (!property) throw new Error('Keyframe property required');

    return {
        id: crypto.randomUUID(),
        time,
        property,
        value,
        easing,
    };
}
