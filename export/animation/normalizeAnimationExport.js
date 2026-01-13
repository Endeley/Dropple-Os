/**
 * Normalize animation export for diffing.
 */
export function normalizeAnimationExport(output) {
  return JSON.stringify(
    output,
    (_, value) => {
      if (typeof value === 'number') {
        return Number(value.toFixed(4));
      }
      return value;
    },
    2
  );
}
