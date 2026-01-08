export function enforceAuthority(shell, action) {
  if (
    shell.education.enabled &&
    shell.cursor.authority !== 'controller'
  ) {
    throw new Error(`Observer cannot perform this action: ${action}`);
  }
}
