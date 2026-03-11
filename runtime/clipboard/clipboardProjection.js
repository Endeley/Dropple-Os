export function clipboardProjection(runtime) {
    const count = runtime?.clipboard?.nodes?.length ?? 0;

    return Object.freeze({
        count,
        hasData: count > 0,
    });
}
