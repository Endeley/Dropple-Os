export async function safeMutation(fn) {
  try {
    return await fn();
  } catch (err) {
    console.error(err);
    throw new Error(err?.message || 'Action failed');
  }
}
