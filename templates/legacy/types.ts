export type LegacyTemplate = {
  id: string;
  mode: string;
  baseSnapshot: unknown | null;
  eventTimeline: Array<{
    type: string;
    payload: unknown;
  }>;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
  };
};
