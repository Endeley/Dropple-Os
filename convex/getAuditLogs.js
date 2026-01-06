// convex/getAuditLogs.js

import { query } from './_generated/server';
import { v } from 'convex/values';

export const getAuditLogs = query({
    args: {
        docId: v.string(),
        limit: v.optional(v.number()),
    },

    async handler(ctx, { docId, limit = 50 }) {
        return await ctx.db
            .query('auditLogs')
            .withIndex('by_doc_time', (q) => q.eq('docId', docId))
            .order('desc')
            .take(limit);
    },
});
