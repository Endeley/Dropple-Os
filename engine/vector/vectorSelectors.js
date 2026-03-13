export function getVector(document, id) {
  return document?.vectors?.[id] ?? null;
}

export function getAllVectors(document) {
  return Object.values(document?.vectors ?? {}).sort((a, b) =>
    String(a?.id ?? '').localeCompare(String(b?.id ?? ''))
  );
}
