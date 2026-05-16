import {
    beginCreateSessionFederationRuntime,
    closeCreateSessionFederationRuntime,
    getCreateSessionFederationSnapshotRuntime,
    resetCreateSessionFederationRuntimeForTests,
    sealCreateSessionFederationCommitRuntime,
    updateCreateSessionFederationPreviewRuntime,
} from '@/runtime/input/createSessionFederationRuntimeBridge.js';

export function beginCreateSessionFederation(params) {
    return beginCreateSessionFederationRuntime(params);
}

export function updateCreateSessionFederationPreview(params) {
    return updateCreateSessionFederationPreviewRuntime(params);
}

export function sealCreateSessionFederationCommit(params) {
    return sealCreateSessionFederationCommitRuntime(params);
}

export function closeCreateSessionFederation(params) {
    return closeCreateSessionFederationRuntime(params);
}

export function getCreateSessionFederationSnapshot(sessionId) {
    return getCreateSessionFederationSnapshotRuntime(sessionId);
}

export function resetCreateSessionFederationForTests() {
    resetCreateSessionFederationRuntimeForTests();
}

