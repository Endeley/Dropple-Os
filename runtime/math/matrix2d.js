function normalizeMatrixValue(value) {
    return Math.abs(value) < 1e-10 ? 0 : value;
}

export function identityMatrix() {
    return [1, 0, 0, 1, 0, 0];
}

export function multiplyMatrix(a, b) {
    return [
        a[0] * b[0] + a[2] * b[1],
        a[1] * b[0] + a[3] * b[1],
        a[0] * b[2] + a[2] * b[3],
        a[1] * b[2] + a[3] * b[3],
        a[0] * b[4] + a[2] * b[5] + a[4],
        a[1] * b[4] + a[3] * b[5] + a[5],
    ];
}

export function translationMatrix(x = 0, y = 0) {
    return [1, 0, 0, 1, x, y];
}

export function rotationMatrix(angle = 0) {
    const radians = (angle * Math.PI) / 180;
    const cos = normalizeMatrixValue(Math.cos(radians));
    const sin = normalizeMatrixValue(Math.sin(radians));

    return [cos, sin, -sin, cos, 0, 0];
}

export function applyMatrix(matrix, point) {
    return {
        x: matrix[0] * point.x + matrix[2] * point.y + matrix[4],
        y: matrix[1] * point.x + matrix[3] * point.y + matrix[5],
    };
}
