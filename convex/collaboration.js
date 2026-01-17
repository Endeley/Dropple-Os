import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getUserRole } from './_helpers/permissions';

export const getMyRoleForDocument = query({
  args: {
    docId: v.string(),
  },
  handler: async (ctx, args) => {
    return await getUserRole(ctx, args.docId);
  },
});

export const inviteToDocument = mutation({
  args: {
    docId: v.string(),
    email: v.string(),
    role: v.union(v.literal('editor'), v.literal('viewer')),
  },
  handler: async (ctx, args) => {
    const role = await getUserRole(ctx, args.docId);
    if (role !== 'owner') {
      throw new Error('Forbidden');
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query('documentInvites')
      .withIndex('by_doc', (q) => q.eq('docId', args.docId))
      .filter((q) => q.eq(q.field('email'), email))
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .first();

    if (existing) {
      return { inviteId: existing._id };
    }

    const inviteId = await ctx.db.insert('documentInvites', {
      docId: args.docId,
      email,
      role: args.role,
      invitedBy: identity.subject,
      status: 'pending',
      createdAt: Date.now(),
    });

    return { inviteId };
  },
});

export const acceptInvite = mutation({
  args: {
    docId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new Error('Unauthorized');
    }

    const email = identity.email.toLowerCase();
    const invite = await ctx.db
      .query('documentInvites')
      .withIndex('by_email', (q) => q.eq('email', email))
      .filter((q) => q.eq(q.field('docId'), args.docId))
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .first();

    if (!invite) {
      throw new Error('Invite not found');
    }

    const existingMember = await ctx.db
      .query('documentMembers')
      .withIndex('by_doc_user', (q) =>
        q.eq('docId', args.docId).eq('userId', identity.subject)
      )
      .unique();

    if (!existingMember) {
      await ctx.db.insert('documentMembers', {
        docId: args.docId,
        userId: identity.subject,
        role: invite.role,
        createdAt: Date.now(),
      });
    }

    await ctx.db.patch(invite._id, { status: 'accepted' });

    return { ok: true };
  },
});

export const revokeDocumentInvite = mutation({
  args: {
    inviteId: v.id('documentInvites'),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      return { ok: false };
    }

    const role = await getUserRole(ctx, invite.docId);
    if (role !== 'owner') {
      throw new Error('Forbidden');
    }

    await ctx.db.patch(invite._id, { status: 'revoked' });

    return { ok: true };
  },
});

export const listInvitesForDocument = query({
  args: {
    docId: v.string(),
  },
  handler: async (ctx, args) => {
    const role = await getUserRole(ctx, args.docId);
    if (role !== 'owner') {
      throw new Error('Forbidden');
    }

    return await ctx.db
      .query('documentInvites')
      .withIndex('by_doc', (q) => q.eq('docId', args.docId))
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .order('desc')
      .collect();
  },
});

export const listDocumentMembers = query({
  args: {
    docId: v.string(),
  },
  handler: async (ctx, args) => {
    const role = await getUserRole(ctx, args.docId);
    if (role !== 'owner') {
      throw new Error('Forbidden');
    }

    return await ctx.db
      .query('documentMembers')
      .withIndex('by_doc', (q) => q.eq('docId', args.docId))
      .collect();
  },
});

export const updateMemberRole = mutation({
  args: {
    docId: v.string(),
    userId: v.string(),
    role: v.union(v.literal('editor'), v.literal('viewer')),
  },
  handler: async (ctx, args) => {
    const requesterRole = await getUserRole(ctx, args.docId);
    if (requesterRole !== 'owner') {
      throw new Error('Forbidden');
    }

    const membership = await ctx.db
      .query('documentMembers')
      .withIndex('by_doc_user', (q) =>
        q.eq('docId', args.docId).eq('userId', args.userId)
      )
      .first();

    if (!membership) {
      throw new Error('Member not found');
    }

    if (membership.role === 'owner') {
      throw new Error('Cannot change owner role');
    }

    await ctx.db.patch(membership._id, {
      role: args.role,
    });

    return { ok: true };
  },
});

export const removeMember = mutation({
  args: {
    docId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const requesterRole = await getUserRole(ctx, args.docId);
    if (requesterRole !== 'owner') {
      throw new Error('Forbidden');
    }

    const membership = await ctx.db
      .query('documentMembers')
      .withIndex('by_doc_user', (q) =>
        q.eq('docId', args.docId).eq('userId', args.userId)
      )
      .first();

    if (!membership) {
      return { ok: true };
    }

    if (membership.role === 'owner') {
      throw new Error('Cannot remove owner');
    }

    await ctx.db.delete(membership._id);

    return { ok: true };
  },
});
