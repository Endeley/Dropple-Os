export async function hashReplay(events) {
  const json = JSON.stringify(events ?? []);
  if (globalThis.crypto?.subtle && globalThis.TextEncoder) {
    const buffer = await globalThis.crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(json),
    );
    return [...new Uint8Array(buffer)]
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  return json;
}
