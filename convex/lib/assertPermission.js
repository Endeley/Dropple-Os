// convex/lib/assertPermission.js

export async function assertPermission(ctx, { docId, userId, allow }) {
    const member = await ctx.db
        .query('documentMembers')
        .withIndex('by_doc_user', (q) => q.eq('docId', docId).eq('userId', userId))
        .unique();

    if (!member || !allow(member.role)) {
        throw new Error('Permission denied');
    }

    return member.role;
}
