export function definePlugin(manifest) {
    return {
        id: manifest.id,
        version: manifest.version,
        type: manifest.type,
        activate: manifest.activate,
        permissions: manifest.permissions || [],
    };
}
