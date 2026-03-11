export function validateSelection(selection) {
    if (!selection) return false;
    if (!(selection.ids instanceof Set)) return false;

    if (selection.primary !== null && !selection.ids.has(selection.primary)) {
        return false;
    }

    return true;
}
