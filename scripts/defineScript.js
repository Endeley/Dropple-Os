export function defineScript(def) {
    return {
        id: def.id,
        version: def.version,
        description: def.description,
        run: def.run,
    };
}
