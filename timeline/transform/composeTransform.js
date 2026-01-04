export function composeTransform(values = {}) {
    const parts = [];

    if (values.x != null || values.y != null) {
        parts.push(`translate(${values.x || 0}px, ${values.y || 0}px)`);
    }

    if (values.scale != null) {
        parts.push(`scale(${values.scale})`);
    }

    if (values.rotate != null) {
        parts.push(`rotate(${values.rotate}deg)`);
    }

    return parts.join(' ');
}
