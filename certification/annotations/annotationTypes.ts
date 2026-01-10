export type Annotation = {
  id: string;
  submissionId: string;
  reviewerId: string;
  cursorIndex: number;
  nodeId?: string;
  message: string;
  createdAt: number;
};
