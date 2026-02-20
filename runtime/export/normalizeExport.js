// export/normalizeExport.js

/**
 * Normalize exported code for stable diffing.
 *
 * 🔒 Pure
 */
export function normalizeExport(code) {
    if (!code) return '';

    return code
        .trim()
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+$/gm, '') // trim trailing spaces
        .replace(/\n{3,}/g, '\n\n'); // collapse empty lines
}
