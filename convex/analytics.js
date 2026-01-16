import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const trackView = mutation({
  args: {
    galleryItemId: v.id('galleryItems'),
    ownerId: v.string(),
    source: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const windowMs = 5 * 60 * 1000;
    const identity = await ctx.auth.getUserIdentity();
    const actorId = identity?.subject ?? null;
    const source = args.source ?? 'viewer';

    if (source !== 'viewer') {
      return;
    }

    const sessionId =
      args.sessionId && args.sessionId.length <= 64 ? args.sessionId : null;

    if (actorId) {
      const recentByActor = await ctx.db
        .query('analyticsEvents')
        .withIndex('by_actor', (q) => q.eq('actorId', actorId))
        .filter((q) => q.gte(q.field('createdAt'), now - 60_000))
        .collect();

      if (recentByActor.length >= 60) {
        return;
      }
    }

    if (actorId) {
      const recent = await ctx.db
        .query('analyticsEvents')
        .withIndex('by_gallery', (q) => q.eq('galleryItemId', args.galleryItemId))
        .filter((q) => q.eq(q.field('type'), 'view'))
        .filter((q) => q.eq(q.field('actorId'), actorId))
        .filter((q) => q.gte(q.field('createdAt'), now - windowMs))
        .first();

      if (recent) {
        return;
      }
    } else if (sessionId) {
      const recent = await ctx.db
        .query('analyticsEvents')
        .withIndex('by_gallery', (q) => q.eq('galleryItemId', args.galleryItemId))
        .filter((q) => q.eq(q.field('type'), 'view'))
        .filter((q) => q.eq(q.field('sessionId'), sessionId))
        .filter((q) => q.gte(q.field('createdAt'), now - windowMs))
        .first();

      if (recent) {
        return;
      }
    }

    await ctx.db.insert('analyticsEvents', {
      type: 'view',
      galleryItemId: args.galleryItemId,
      ownerId: args.ownerId,
      actorId,
      sessionId,
      source,
      createdAt: now,
    });
  },
});

export const trackFork = mutation({
  args: {
    galleryItemId: v.id('galleryItems'),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) {
      return;
    }

    const recentByActor = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_actor', (q) => q.eq('actorId', identity.subject))
      .filter((q) => q.gte(q.field('createdAt'), Date.now() - 60_000))
      .collect();

    if (recentByActor.length >= 60) {
      return;
    }

    const existing = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_gallery', (q) => q.eq('galleryItemId', args.galleryItemId))
      .filter((q) => q.eq(q.field('type'), 'fork'))
      .filter((q) => q.eq(q.field('actorId'), identity.subject))
      .first();

    if (existing) {
      return;
    }

    await ctx.db.insert('analyticsEvents', {
      type: 'fork',
      galleryItemId: args.galleryItemId,
      ownerId: args.ownerId,
      actorId: identity.subject,
      source: 'viewer',
      createdAt: Date.now(),
    });
  },
});

export const getGalleryStats = query({
  args: {
    galleryItemId: v.id('galleryItems'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    const item = await ctx.db.get(args.galleryItemId);
    if (!item) {
      return null;
    }

    if (item.ownerId !== identity.subject) {
      throw new Error('Forbidden');
    }

    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_gallery', (q) =>
        q.eq('galleryItemId', args.galleryItemId)
      )
      .collect();

    let views = 0;
    let forks = 0;
    let publishes = 0;

    for (const event of events) {
      if (event.type === 'view') views += 1;
      else if (event.type === 'fork') forks += 1;
      else if (event.type === 'publish') publishes += 1;
    }

    return { views, forks, publishes };
  },
});
