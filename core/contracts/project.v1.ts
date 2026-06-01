export const PROJECT_VERSION = 1;

export type ProjectPerspectiveFlagsV1 = {
    create?: boolean;
    build?: boolean;
    operate?: boolean;
    collaborate?: boolean;
    publish?: boolean;
};

export type ProjectV1 = {
    version: typeof PROJECT_VERSION;
    projectId: string;
    name: string;
    blueprintId?: string | null;
    createdAt: number;
    updatedAt: number;
    owner?: string | null;
    metadata?: Record<string, unknown>;
    perspectives?: ProjectPerspectiveFlagsV1;
    archivedAt?: number | null;
};
