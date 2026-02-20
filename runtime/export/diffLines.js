// export/diffLines.js

/**
 * Simple line-based diff.
 *
 * Returns:
 * - unchanged
 * - added
 * - removed
 */
export function diffLines(before, after) {
    const a = before.split('\n');
    const b = after.split('\n');

    const result = [];
    const max = Math.max(a.length, b.length);

    for (let i = 0; i < max; i++) {
        if (a[i] === b[i]) {
            result.push({ type: 'same', value: a[i] });
        } else {
            if (a[i] !== undefined) {
                result.push({ type: 'remove', value: a[i] });
            }
            if (b[i] !== undefined) {
                result.push({ type: 'add', value: b[i] });
            }
        }
    }

    return result;
}
