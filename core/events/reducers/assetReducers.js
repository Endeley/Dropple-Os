import { EventTypes } from '../eventTypes.js';
import { assetBucketForType, normalizeMediaAsset } from '@/core/media/mediaAssetContract.js';

function ensureAssetState(state) {
    if (state?.document?.assets) return state;

    return {
        ...state,
        document: {
            ...state.document,
            assets: {
                images: {},
                videos: {},
                audio: {},
            },
        },
    };
}

function updateAssets(state, assets) {
    return {
        ...state,
        document: {
            ...state.document,
            assets,
        },
    };
}

export function assetReducers(state, event) {
    const ensured = ensureAssetState(state);
    const assets = ensured.document.assets;
    const { type, payload } = event;

    switch (type) {
        case EventTypes.MEDIA_ASSET_REGISTER: {
            const normalized = normalizeMediaAsset(payload?.assetType, payload?.asset);
            if (!normalized) return state;
            const bucket = assetBucketForType(normalized.type);
            if (!bucket) return state;

            return updateAssets(ensured, {
                ...assets,
                [bucket]: {
                    ...(assets[bucket] || {}),
                    [normalized.id]: normalized,
                },
            });
        }

        case EventTypes.MEDIA_ASSET_UPDATE: {
            const assetType = payload?.assetType;
            const assetId = payload?.assetId;
            const patch = payload?.patch;
            const bucket = assetBucketForType(assetType);
            const current = bucket ? assets?.[bucket]?.[assetId] ?? null : null;
            if (!bucket || !assetId || !patch || !current) return state;

            const normalized = normalizeMediaAsset(assetType, {
                ...current,
                ...patch,
                id: assetId,
            });
            if (!normalized) return state;

            return updateAssets(ensured, {
                ...assets,
                [bucket]: {
                    ...(assets[bucket] || {}),
                    [assetId]: normalized,
                },
            });
        }

        case EventTypes.MEDIA_ASSET_DELETE: {
            const assetType = payload?.assetType;
            const assetId = payload?.assetId;
            const bucket = assetBucketForType(assetType);
            if (!bucket || !assetId || !assets?.[bucket]?.[assetId]) return state;

            const nextBucket = { ...(assets[bucket] || {}) };
            delete nextBucket[assetId];

            return updateAssets(ensured, {
                ...assets,
                [bucket]: nextBucket,
            });
        }

        default:
            return state;
    }
}
