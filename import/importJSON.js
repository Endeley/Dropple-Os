export async function readJSONFile(file) {
  if (!file) return null;

  const text = await file.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (err) {
    console.warn('[importJSON] invalid JSON', err);
    return null;
  }
}
