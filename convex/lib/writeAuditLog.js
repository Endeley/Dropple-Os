// convex/lib/writeAuditLog.js

export async function writeAuditLog(ctx, { docId, actorId, action, branchId, eventId, meta }) {
    await ctx.db.insert('auditLogs', {
        docId,
        actorId,
        action,
        branchId,
        eventId,
        meta,
        createdAt: Date.now(),
    });
}
