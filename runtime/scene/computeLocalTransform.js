import {
    multiplyMatrix,
    rotationMatrix,
    translationMatrix,
} from '../math/matrix2d.js';

export function computeLocalTransform(node) {
    const transform = node?.props?.transform ?? {};

    const x = transform.x ?? node?.x ?? 0;
    const y = transform.y ?? node?.y ?? 0;
    const rotation = transform.rotation ?? 0;

    return multiplyMatrix(translationMatrix(x, y), rotationMatrix(rotation));
}
