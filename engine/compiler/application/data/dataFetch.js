export function buildFetchOptions(source) {
    const options = {
        method: source.method,
    };

    if (Object.keys(source.params || {}).length > 0) {
        options.headers = {
            'Content-Type': 'application/json',
        };
        options.body = JSON.stringify(source.params);
    }

    return options;
}
