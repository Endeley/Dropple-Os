export function getSceneGraph(runtimeState: any) {
    return runtimeState?.document?.sceneGraph ?? runtimeState?.sceneGraph ?? null;
}
