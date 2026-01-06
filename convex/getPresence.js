// convex/getPresence.js

import { query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get live presence for a document.
 */
export const getPresence = query({
    args: {
        docId: v.string(),
    },

    async handler(ctx, { docId }) {
        const now = Date.now();
        const TTL = 10_000; // 10s activity window

        const rows = await ctx.db.query('presence').withIndex('by_doc', (q) => q.eq('docId', docId)).collect();

        // Filter out stale presence
        return rows.filter((p) => now - p.lastSeen < TTL);
    },
});
