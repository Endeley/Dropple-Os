function normalizePath(value) {
  return String(value ?? '').trim();
}

export function union(pathA, pathB) {
  return `${normalizePath(pathA)} ${normalizePath(pathB)}`.trim();
}

export function subtract(pathA, pathB) {
  return {
    type: 'subtract',
    a: normalizePath(pathA),
    b: normalizePath(pathB),
  };
}

export function intersect(pathA, pathB) {
  return {
    type: 'intersect',
    a: normalizePath(pathA),
    b: normalizePath(pathB),
  };
}
