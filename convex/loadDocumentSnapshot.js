// convex/loadDocumentSnapshot.js

import { query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Load a full document snapshot from Convex.
 *
 * 🔒 Rules:
 * - Read-only
 * - No reconstruction here
 * - No runtime logic
 */
export const loadDocumentSnapshot = query({
    args: {
        docId: v.string(),
    },

    async handler(ctx, { docId }) {
        const doc = await ctx.db.query('documents').withIndex('by_docId', (q) => q.eq('docId', docId)).unique();

        if (!doc) return null;

        const branches = await ctx.db.query('branches').withIndex('by_doc', (q) => q.eq('docId', docId)).collect();

        const events = await ctx.db.query('events').withIndex('by_doc_branch', (q) => q.eq('docId', docId)).collect();

        const timelines = await ctx.db.query('timelines').withIndex('by_doc', (q) => q.eq('docId', docId)).collect();

        const markers = await ctx.db.query('markers').withIndex('by_doc', (q) => q.eq('docId', docId)).collect();

        return {
            doc,
            branches,
            events,
            timelines,
            markers,
        };
    },
});
