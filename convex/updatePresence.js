// convex/updatePresence.js

import { mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Update user presence for a document.
 *
 * 🔒 Rules:
 * - Overwrite-only
 * - No history
 * - No side effects
 */
export const updatePresence = mutation({
    args: {
        docId: v.string(),
        userId: v.string(),
        name: v.optional(v.string()),
        color: v.optional(v.string()),
    },

    async handler(ctx, args) {
        const now = Date.now();

        const existing = await ctx.db
            .query('presence')
            .withIndex('by_doc_user', (q) => q.eq('docId', args.docId).eq('userId', args.userId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                name: args.name,
                color: args.color,
                lastSeen: now,
            });
        } else {
            await ctx.db.insert('presence', {
                docId: args.docId,
                userId: args.userId,
                name: args.name,
                color: args.color,
                lastSeen: now,
            });
        }
    },
});
