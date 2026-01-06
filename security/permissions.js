// security/permissions.js

export function canEdit(role) {
    return role === 'owner' || role === 'editor';
}

export function canMerge(role) {
    return role === 'owner' || role === 'editor';
}

export function canCreateBranch(role) {
    return role === 'owner' || role === 'editor';
}

export function canDeleteBranch(role) {
    return role === 'owner';
}

export function canView(role) {
    return Boolean(role);
}
