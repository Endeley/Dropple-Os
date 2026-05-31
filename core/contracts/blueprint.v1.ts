export type BlueprintLineageV1 = {
    rootId: string;
    versionId: string;
    parentVersionId: string | null;
};

export type BlueprintCertificationV1 = {
    algorithm: 'sha256';
    hash: string;
};

export type BlueprintV1 = {
    id: string;
    version: 1;
    name: string;
    description: string;
    kind: string;
    workspaceProfiles: Record<string, string[]>;
    capabilityProfiles: Record<string, string[]>;
    seedGraph: Record<string, unknown>;
    seedEvents: Array<{ type: string; payload?: Record<string, unknown> }>;
    workflowPresets: Record<string, unknown>;
    publishPresets: Record<string, unknown>;
    certification: BlueprintCertificationV1;
    lineage: BlueprintLineageV1;
};
