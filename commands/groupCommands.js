export function groupByCategory(commands) {
  return (commands || []).reduce((acc, cmd) => {
    const key = cmd.category || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(cmd);
    return acc;
  }, {});
}
