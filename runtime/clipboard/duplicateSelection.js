import { copySelection } from './copySelection.js';
import { pasteClipboard } from './pasteClipboard.js';

export async function duplicateSelection(selectionIds, document, dispatcher) {
    const clipboard = copySelection(selectionIds, document);
    return pasteClipboard(clipboard, dispatcher);
}
