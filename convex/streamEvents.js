// convex/streamEvents.js

import { query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Stream events for a document branch.
 *
 * 🔒 Read-only
 * 🔒 Ordered by creation time
 */
export const streamEvents = query({
    args: {
        docId: v.string(),
        branchId: v.string(),
    },

    async handler(ctx, { docId, branchId }) {
        return await ctx.db
            .query('events')
            .withIndex('by_doc_branch', (q) => q.eq('docId', docId).eq('branchId', branchId))
            .order('asc')
            .collect();
    },
});
