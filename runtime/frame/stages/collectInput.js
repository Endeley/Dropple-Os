export function collectInput(context) {
  return {
    ...context,
    input: context.input || {},
  };
}
