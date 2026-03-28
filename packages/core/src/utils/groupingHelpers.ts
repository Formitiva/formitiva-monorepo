import type { DefinitionPropertyField } from "../core/formitivaTypes";

/**
 * Enhanced rename duplicated groups with better conflict resolution
 * For example: g1, g1, g2, g1 becomes g1, g1, g2, g1(1)
 * This mutates the provided nameToField map so downstream code sees the
 * renamed group values.
 */
export const renameDuplicatedGroups = (
  properties: DefinitionPropertyField[],
  nameToField: Record<string, DefinitionPropertyField>
): number => {
  const seenSeq = new Map<string, number>();
  let prevOriginalGroup: string | null = null;
  let currentRename: string | null = null;
  let renamedCount = 0;

  for (const field of properties) {
    const orig = field.group;
    if (!orig) {
      prevOriginalGroup = null;
      currentRename = null;
      continue;
    }

    if (orig === prevOriginalGroup) {
      // Same contiguous sequence: keep the same name (possibly renamed)
      nameToField[field.name].group = currentRename ?? orig;
    } else {
      // New sequence for this group name
      if (!seenSeq.has(orig)) {
        // First time we've seen this group name as a sequence
        seenSeq.set(orig, 1); // Next duplicate sequence will use suffix (1)
        currentRename = null;
        nameToField[field.name].group = orig;
      } else {
        // This group name appeared in an earlier non-contiguous sequence, so
        // assign a suffix for this new sequence
        const suffix = seenSeq.get(orig)!;
        const newName = `${orig}(${suffix})`;
        seenSeq.set(orig, suffix + 1);
        currentRename = newName;
        nameToField[field.name].group = newName;
        renamedCount++;
      }
      prevOriginalGroup = orig;
    }
  }
  
  return renamedCount;
};

/**
 * Enhanced consecutive field grouping with metadata
 */
export const groupConsecutiveFields = (
  items: DefinitionPropertyField[],
  options: { includeEmpty?: boolean } = {}
): {
  groups: Array<{ name: string | null; fields: DefinitionPropertyField[] }>;
  metadata: {
    totalGroups: number;
    emptyGroups: number;
    largestGroup: number;
  };
} => {
  const { includeEmpty = true } = options;
  const groups: { name: string | null; fields: DefinitionPropertyField[] }[] = [];
  let currentName: string | null = null;
  let bucket: DefinitionPropertyField[] = [];
  let emptyGroups = 0;

  for (const item of items) {
    const name = item.group || null;
    if (name !== currentName) {
      if (bucket.length > 0 || includeEmpty) {
        groups.push({ name: currentName, fields: bucket });
      }
      currentName = name;
      bucket = [item];
    } else {
      bucket.push(item);
    }
  }
  
  if (bucket.length > 0 || includeEmpty) {
    groups.push({ name: currentName, fields: bucket });
  }

  emptyGroups = groups.filter(g => g.fields.length === 0).length;
  const largestGroup = Math.max(0, ...groups.map(g => g.fields.length));

  return {
    groups,
    metadata: {
      totalGroups: groups.length,
      emptyGroups,
      largestGroup
    }
  };
}
