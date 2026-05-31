export function createUuid() {
    const globalCrypto = globalThis.crypto;

    if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
        return globalCrypto.randomUUID();
    }

    const randomBytes =
        globalCrypto && typeof globalCrypto.getRandomValues === 'function'
            ? globalCrypto.getRandomValues(new Uint8Array(16))
            : Uint8Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));

    randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40;
    randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80;

    const hex = [...randomBytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
