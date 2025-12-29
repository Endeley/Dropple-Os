/**
 * Deterministically measures text size using font metadata.
 * No DOM access.
 */
export function measureText(text, style = {}) {
    const { fontSize = 16, lineHeight = 1.2, maxWidth = Infinity } = style;

    const charWidth = fontSize * 0.6; // heuristic, deterministic
    const words = String(text ?? '').split(/\s+/);

    let lines = 1;
    let currentWidth = 0;
    let maxLineWidth = 0;

    words.forEach((word) => {
        const wordWidth = word.length * charWidth;

        if (currentWidth + wordWidth > maxWidth) {
            lines += 1;
            currentWidth = wordWidth;
        } else {
            currentWidth += wordWidth;
        }

        maxLineWidth = Math.max(maxLineWidth, currentWidth);
    });

    return {
        width: Math.ceil(maxLineWidth),
        height: Math.ceil(lines * fontSize * lineHeight),
    };
}
