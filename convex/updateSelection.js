// convex/updateSelection.js

import { mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Update selection presence (UI-only).
 *
 * 🔒 Non-authoritative
 */
export const updateSelection = mutation({
    args: {
        docId: v.string(),
        userId: v.string(),
        selectedNodeIds: v.array(v.string()),
    },

    async handler(ctx, { docId, userId, selectedNodeIds }) {
        const now = Date.now();

        const existing = await ctx.db
            .query('presence')
            .withIndex('by_doc_user', (q) => q.eq('docId', docId).eq('userId', userId))
            .unique();

        if (!existing) return;

        await ctx.db.patch(existing._id, {
            selectedNodeIds,
            lastSeen: now,
        });
    },
});
