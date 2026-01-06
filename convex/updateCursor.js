// convex/updateCursor.js

import { mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Update live cursor position.
 *
 * 🔒 UI-only, ephemeral
 */
export const updateCursor = mutation({
    args: {
        docId: v.string(),
        userId: v.string(),
        x: v.number(),
        y: v.number(),
    },

    async handler(ctx, { docId, userId, x, y }) {
        const now = Date.now();

        const existing = await ctx.db
            .query('presence')
            .withIndex('by_doc_user', (q) => q.eq('docId', docId).eq('userId', userId))
            .unique();

        if (!existing) return;

        await ctx.db.patch(existing._id, {
            x,
            y,
            lastSeen: now,
        });
    },
});
