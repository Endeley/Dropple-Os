// security/usePermissions.js

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import * as perms from './permissions';

export function usePermissions({ docId, userId }) {
    const member = useQuery(api.getDocumentMember, {
        docId,
        userId,
    });

    const role = member?.role;

    return {
        role,
        canEdit: perms.canEdit(role),
        canMerge: perms.canMerge(role),
        canCreateBranch: perms.canCreateBranch(role),
        canDeleteBranch: perms.canDeleteBranch(role),
    };
}
