export function filterCommands(commands, query, context) {
  const q = (query || '').toLowerCase();

  return (commands || []).filter((cmd) => {
    if (cmd.modes && context?.mode && !cmd.modes.includes(context.mode)) {
      return false;
    }

    if (cmd.requiresAuth && !context?.authenticated) {
      return false;
    }

    if (cmd.requiresSelection === 'multi' && !(context?.selected?.length > 1)) {
      return false;
    }

    if (cmd.requiresSelection === true && !(context?.selected?.length > 0)) {
      return false;
    }

    if (context?.readOnly && cmd.mutatesState) {
      return false;
    }

    if (!q) return true;

    if (cmd.title?.toLowerCase().includes(q)) return true;
    if (cmd.category?.toLowerCase().includes(q)) return true;
    return cmd.keywords?.some((k) => k.toLowerCase().includes(q));
  });
}
