const vectors = new Map();

export function registerVector(node) {
  if (!node?.id) {
    throw new Error('Vector node requires id');
  }

  vectors.set(node.id, {
    ...node,
  });
}

export function unregisterVector(id) {
  vectors.delete(id);
}

export function clearVectorRegistry() {
  vectors.clear();
}

export function getVector(id) {
  return vectors.get(id) ?? null;
}

export function getAllVectors() {
  return Array.from(vectors.values()).sort((a, b) =>
    String(a.id).localeCompare(String(b.id))
  );
}
