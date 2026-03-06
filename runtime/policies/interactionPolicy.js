export function resolveInteractionPolicy(input) {
  const modifiers = input?.modifiers || {};

  return {
    snapEnabled: !modifiers.meta,
    lockAspectRatio: !!modifiers.shift,
    centerResize: !!modifiers.alt,
    precisionMode: !!modifiers.shift && !!modifiers.meta,
  };
}
