const ALLOWED_EXPORT_FORMATS = new Set([
    'mp4',
    'webm',
    'gif',
    'wav',
    'mp3',
    'png-sequence',
    'jpeg-sequence',
    'lottie',
]);

function safeNumber(value, fallback = null) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function normalizeFormat(target) {
    const format = String(target?.format ?? target?.type ?? '').trim().toLowerCase();
    if (!format) {
        throw new Error('exportTarget: format is required');
    }
    if (!ALLOWED_EXPORT_FORMATS.has(format)) {
        throw new Error(`exportTarget: unsupported format (${format})`);
    }
    return format;
}

function normalizeBoolean(value, fallback = false) {
    return value == null ? fallback : value === true;
}

function normalizeProxy(proxy) {
    if (!proxy || typeof proxy !== 'object') return null;

    return {
        id: typeof proxy.id === 'string' && proxy.id.trim() ? proxy.id.trim() : null,
        url: typeof proxy.url === 'string' && proxy.url.trim() ? proxy.url.trim() : null,
        mimeType: typeof proxy.mimeType === 'string' && proxy.mimeType.trim() ? proxy.mimeType.trim() : null,
        width: safeNumber(proxy.width, null),
        height: safeNumber(proxy.height, null),
        bitRateKbps: safeNumber(proxy.bitRateKbps ?? proxy.bitrateKbps, null),
    };
}

export function normalizeExportTarget(target) {
    if (!target || typeof target !== 'object') {
        throw new Error('exportTarget: target is required');
    }

    const format = normalizeFormat(target);
    const presetId = typeof target.presetId === 'string' && target.presetId.trim() ? target.presetId.trim() : null;
    const delivery = typeof target.delivery === 'string' && target.delivery.trim()
        ? target.delivery.trim().toLowerCase()
        : 'master';
    const id = typeof target.id === 'string' && target.id.trim()
        ? target.id.trim()
        : `${format}:${presetId ?? delivery}`;

    return {
        id,
        type: format,
        format,
        presetId,
        label: typeof target.label === 'string' && target.label.trim() ? target.label.trim() : null,
        delivery,
        width: safeNumber(target.width, null),
        height: safeNumber(target.height, null),
        frameRate: safeNumber(target.frameRate, null),
        bitRateKbps: safeNumber(target.bitRateKbps ?? target.bitrateKbps, null),
        sampleRate: safeNumber(target.sampleRate, null),
        channels: safeNumber(target.channels, null),
        videoCodec: typeof target.videoCodec === 'string' && target.videoCodec.trim() ? target.videoCodec.trim() : null,
        audioCodec: typeof target.audioCodec === 'string' && target.audioCodec.trim() ? target.audioCodec.trim() : null,
        includeVideo: normalizeBoolean(target.includeVideo, true),
        includeAudio: normalizeBoolean(target.includeAudio, true),
        includeAlpha: normalizeBoolean(target.includeAlpha, false),
        proxy: normalizeProxy(target.proxy),
        options: target.options && typeof target.options === 'object' ? { ...target.options } : {},
    };
}

export function normalizeExportSettings(exportsState) {
    const targets = Array.isArray(exportsState?.targets) ? exportsState.targets : [];

    return {
        targets: targets
            .map((target) => normalizeExportTarget(target))
            .sort((left, right) => String(left.id).localeCompare(String(right.id))),
    };
}
