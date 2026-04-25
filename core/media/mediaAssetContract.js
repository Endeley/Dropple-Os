function normalizeAssetType(assetType, asset = null) {
    const explicit = typeof assetType === 'string' ? assetType.trim().toLowerCase() : null;
    if (explicit === 'image' || explicit === 'video' || explicit === 'audio') {
        return explicit;
    }

    const inferred = typeof asset?.type === 'string' ? asset.type.trim().toLowerCase() : null;
    if (inferred === 'image' || inferred === 'video' || inferred === 'audio') {
        return inferred;
    }

    return null;
}

function normalizeProxy(proxy, asset) {
    if (proxy && typeof proxy === 'object') {
        return {
            id: typeof proxy.id === 'string' ? proxy.id : null,
            url: typeof proxy.url === 'string' ? proxy.url : null,
            mimeType: typeof proxy.mimeType === 'string' ? proxy.mimeType : null,
            width: Number.isFinite(proxy.width) ? Number(proxy.width) : null,
            height: Number.isFinite(proxy.height) ? Number(proxy.height) : null,
            bitRateKbps: Number.isFinite(proxy.bitRateKbps ?? proxy.bitrateKbps)
                ? Number(proxy.bitRateKbps ?? proxy.bitrateKbps)
                : null,
        };
    }

    if (typeof asset?.proxyId === 'string' && asset.proxyId) {
        return {
            id: asset.proxyId,
            url: null,
            mimeType: null,
            width: null,
            height: null,
            bitRateKbps: null,
        };
    }

    return null;
}

function normalizeWaveform(waveform) {
    if (!waveform || typeof waveform !== 'object') return null;

    const peaks = Array.isArray(waveform.peaks)
        ? waveform.peaks.filter((peak) => Number.isFinite(peak)).map((peak) => Number(peak))
        : [];

    return {
        peaks,
        bucketMs: Number.isFinite(waveform.bucketMs) ? Number(waveform.bucketMs) : null,
        sampleCount: Number.isFinite(waveform.sampleCount)
            ? Number(waveform.sampleCount)
            : peaks.length,
        durationMs: Number.isFinite(waveform.durationMs) ? Number(waveform.durationMs) : null,
    };
}

export function normalizeMediaAsset(assetType, asset) {
    if (!asset || typeof asset !== 'object' || !asset.id) return null;

    const type = normalizeAssetType(assetType, asset);
    if (!type) {
        throw new Error('mediaAsset: asset type must be image, video, or audio');
    }

    const durationMs = Number.isFinite(asset.durationMs) ? Math.max(0, Number(asset.durationMs)) : 0;
    const trimStartMs = Number.isFinite(asset.trimStartMs) ? Math.max(0, Number(asset.trimStartMs)) : 0;
    const trimEndMs = Number.isFinite(asset.trimEndMs) ? Math.max(trimStartMs, Number(asset.trimEndMs)) : durationMs;

    return {
        id: asset.id,
        type,
        url: String(asset.url ?? ''),
        durationMs,
        trimStartMs,
        trimEndMs,
        mimeType: asset.mimeType ?? null,
        width: Number.isFinite(asset.width) ? Number(asset.width) : null,
        height: Number.isFinite(asset.height) ? Number(asset.height) : null,
        channels: Number.isFinite(asset.channels) ? Number(asset.channels) : null,
        sampleRate: Number.isFinite(asset.sampleRate) ? Number(asset.sampleRate) : null,
        frameRate: Number.isFinite(asset.frameRate) ? Number(asset.frameRate) : null,
        proxyId: typeof asset.proxyId === 'string' ? asset.proxyId : null,
        proxy: normalizeProxy(asset.proxy, asset),
        waveform: normalizeWaveform(asset.waveform),
        meta: asset.meta && typeof asset.meta === 'object' ? { ...asset.meta } : {},
    };
}

export function assetBucketForType(assetType) {
    switch (normalizeAssetType(assetType)) {
        case 'image':
            return 'images';
        case 'video':
            return 'videos';
        case 'audio':
            return 'audio';
        default:
            return null;
    }
}
