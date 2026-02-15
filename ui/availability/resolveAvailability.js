import { Availability } from './availability';
import { getWorkspaceCapabilities } from '@/ui/capabilities/workspaceCapabilities';
import { applyModeLocks } from '@/ui/capabilities/modeLocks';

function hasAll(capSet, required = []) {
  return required.every((cap) => capSet.has(cap));
}

export function resolveAvailability({
  workspaceId,
  modeId,
  readCaps = [],
  writeCaps = [],
}) {
  const baseCaps = getWorkspaceCapabilities(workspaceId);
  const effective = applyModeLocks(baseCaps, modeId);

  if (!hasAll(effective, readCaps)) {
    return Availability.HIDDEN;
  }

  if (writeCaps.length > 0 && !hasAll(effective, writeCaps)) {
    return Availability.READ_ONLY;
  }

  return Availability.ACTIVE;
}
