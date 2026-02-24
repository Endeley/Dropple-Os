export const ALLOWED_CHANNELS = new Set([
    'transform.x',
    'transform.y',
    'opacity',
    'camera.x',
    'camera.y',
    'camera.scale',
]);

export function validateChannelKey(key) {
    if (!ALLOWED_CHANNELS.has(key)) {
        throw new Error(`Invalid channel key: ${key}`);
    }
}
