function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

export function validateBlueprintInstallManifestV1(manifest) {
    if (!manifest || typeof manifest !== 'object') {
        throw new Error('blueprint install manifest must be an object');
    }

    const requiredStringFields = [
        'projectId',
        'projectName',
        'defaultPerspectiveId',
        'blueprintId',
        'blueprintVersionId',
    ];

    for (const field of requiredStringFields) {
        if (!isNonEmptyString(manifest[field])) {
            throw new Error(`blueprint install manifest missing required field: ${field}`);
        }
    }

    return Object.freeze({
        schemaVersion: 1,
        projectId: manifest.projectId.trim(),
        projectName: manifest.projectName.trim(),
        defaultPerspectiveId: manifest.defaultPerspectiveId.trim(),
        blueprintId: manifest.blueprintId.trim(),
        blueprintVersionId: manifest.blueprintVersionId.trim(),
    });
}
