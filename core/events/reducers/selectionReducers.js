import { EventTypes } from '@/core/events/eventTypes.js';

function ensureSelection(selection) {
  if (selection?.ids instanceof Set) {
    return selection;
  }

  return {
    ids: new Set(selection?.ids ?? []),
    primary: selection?.primary ?? null,
  };
}

function validateSelection(selection) {
  if (!selection) return false;
  if (!(selection.ids instanceof Set)) return false;
  if (selection.primary !== null && !selection.ids.has(selection.primary)) {
    return false;
  }
  return true;
}

function finalizeSelection(selection) {
  if (!validateSelection(selection)) {
    throw new Error('[Dropple Selection] Invalid runtime.selection state');
  }

  return selection;
}

export function selectionReducer(runtime, event) {
  const selection = ensureSelection(runtime.selection);

    switch (event.type) {
    case EventTypes.NODE_WRAP: {
      const wrapperId = event?.payload?.wrapperNode?.id ?? null;
      if (!wrapperId) {
        return runtime;
      }

      return {
        ...runtime,
        selection: finalizeSelection({
          ids: new Set([wrapperId]),
          primary: wrapperId,
        }),
      };
    }

    case EventTypes.SELECTION_SET: {
      const ids = new Set(event?.payload?.ids ?? []);
      const primary = event?.payload?.primary ?? null;

      return {
        ...runtime,
        selection: finalizeSelection({
          ids,
          primary,
        }),
      };
    }

    case EventTypes.SELECTION_CLEAR:
      return {
        ...runtime,
        selection: finalizeSelection({
          ids: new Set(),
          primary: null,
        }),
      };

    case EventTypes.SELECTION_ADD: {
      const next = new Set(selection.ids);
      const id = event?.payload?.id;

      if (id) {
        next.add(id);
      }

      return {
        ...runtime,
        selection: finalizeSelection({
          ids: next,
          primary: selection.primary,
        }),
      };
    }

    case EventTypes.SELECTION_REMOVE: {
      const next = new Set(selection.ids);
      const id = event?.payload?.id;

      if (id) {
        next.delete(id);
      }

      const primary = next.has(selection.primary)
        ? selection.primary
        : next.values().next().value ?? null;

      return {
        ...runtime,
        selection: finalizeSelection({
          ids: next,
          primary,
        }),
      };
    }

    case EventTypes.SELECTION_TOGGLE: {
      const next = new Set(selection.ids);
      const id = event?.payload?.id;

      if (id) {
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
      }

      const primary = next.has(selection.primary)
        ? selection.primary
        : next.values().next().value ?? null;

      return {
        ...runtime,
        selection: finalizeSelection({
          ids: next,
          primary,
        }),
      };
    }

    case EventTypes.NODE_DELETE: {
      const id = event?.payload?.id ?? null;
      if (!id || !selection.ids.has(id)) {
        return runtime;
      }

      const next = new Set(selection.ids);
      next.delete(id);

      const primary = next.has(selection.primary)
        ? selection.primary
        : next.values().next().value ?? null;

      return {
        ...runtime,
        selection: finalizeSelection({
          ids: next,
          primary,
        }),
      };
    }

    default:
      return runtime;
  }
}
