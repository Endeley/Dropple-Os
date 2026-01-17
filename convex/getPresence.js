// convex/getPresence.js

import { query } from './_generated/server';
import { v } from 'convex/values';
import { getUserRole } from './_helpers/permissions';

/**
 * Get live presence for a document.
 */
export const getPresence = query({
    args: {
        docId: v.string(),
    },

    async handler(ctx, { docId }) {
        const role = await getUserRole(ctx, docId);
        if (!role) return [];

        const now = Date.now();
        const TTL = 15_000; // 15s activity window

        const rows = await ctx.db.query('presence').withIndex('by_doc', (q) => q.eq('docId', docId)).collect();

        // Filter out stale presence
        return rows.filter((p) => now - p.lastSeen < TTL);
    },
});
