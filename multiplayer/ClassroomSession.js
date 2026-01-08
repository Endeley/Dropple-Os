export function createClassroomSession({
  sessionId,
  runId,
  teacherId,
}) {
  return {
    sessionId,
    runId,
    teacherId,
    participants: {},
    lockedCursor: null,
    createdAt: Date.now(),
  };
}
