export async function logAudit(
  ctx: any,
  { actorId, action, meta }: { actorId: string; action: string; meta?: any }
) {
  await ctx.db.insert('auditLogs', {
    docId: 'assessment',
    actorId,
    action,
    meta,
    createdAt: Date.now(),
  });
}
