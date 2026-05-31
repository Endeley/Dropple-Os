function fnv1a64(input, seed = 0xcbf29ce484222325n) {
    let hash = seed;
    const prime = 0x100000001b3n;
    const text = String(input);
    for (let index = 0; index < text.length; index += 1) {
        hash ^= BigInt(text.charCodeAt(index));
        hash = BigInt.asUintN(64, hash * prime);
    }
    return hash;
}

function toHex64(value) {
    return value.toString(16).padStart(16, '0');
}

export function stableSha256LikeHex(input) {
    const text = String(input);
    const h0 = fnv1a64(text, 0xcbf29ce484222325n);
    const h1 = fnv1a64(`${text}|1`, 0x84222325cbf29ce4n);
    const h2 = fnv1a64(`${text}|2`, 0x9e3779b97f4a7c15n);
    const h3 = fnv1a64(`${text}|3`, 0x6c8e9cf570932bd5n);
    return `${toHex64(h0)}${toHex64(h1)}${toHex64(h2)}${toHex64(h3)}`;
}

