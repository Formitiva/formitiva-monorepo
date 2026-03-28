import { describe, it, expect } from 'vitest';
import { renameDuplicatedGroups } from './groupingHelpers';
import type { DefinitionPropertyField } from '../core/formitivaTypes';

const makeField = (name: string, group?: string): DefinitionPropertyField =>
  ({ name, type: 'text', displayName: name, ...(group !== undefined ? { group } : {}) } as DefinitionPropertyField);

const makeNameToField = (props: DefinitionPropertyField[]): Record<string, DefinitionPropertyField> =>
  Object.fromEntries(props.map((p) => [p.name, { ...p }]));

describe('renameDuplicatedGroups', () => {
  it('returns 0 when there are no groups', () => {
    const props = [makeField('a'), makeField('b')];
    expect(renameDuplicatedGroups(props, makeNameToField(props))).toBe(0);
  });

  it('returns 0 when all group names are unique', () => {
    const props = [makeField('a', 'g1'), makeField('b', 'g2'), makeField('c', 'g3')];
    expect(renameDuplicatedGroups(props, makeNameToField(props))).toBe(0);
  });

  it('keeps contiguous same-group fields unchanged', () => {
    const props = [makeField('a', 'g1'), makeField('b', 'g1'), makeField('c', 'g2')];
    const ntf = makeNameToField(props);
    renameDuplicatedGroups(props, ntf);
    expect(ntf['a'].group).toBe('g1');
    expect(ntf['b'].group).toBe('g1');
    expect(ntf['c'].group).toBe('g2');
  });

  it('renames a non-contiguous duplicate group with suffix (1)', () => {
    const props = [makeField('a', 'g1'), makeField('b', 'g2'), makeField('c', 'g1')];
    const ntf = makeNameToField(props);
    const count = renameDuplicatedGroups(props, ntf);
    expect(count).toBe(1);
    expect(ntf['a'].group).toBe('g1');
    expect(ntf['c'].group).toBe('g1(1)');
  });

  it('assigns sequential suffixes (1), (2) for multiple non-contiguous runs', () => {
    const props = [
      makeField('a', 'g1'),
      makeField('b', 'g2'),
      makeField('c', 'g1'),
      makeField('d', 'g2'),
      makeField('e', 'g1'),
    ];
    const ntf = makeNameToField(props);
    renameDuplicatedGroups(props, ntf);
    expect(ntf['a'].group).toBe('g1');
    expect(ntf['c'].group).toBe('g1(1)');
    expect(ntf['e'].group).toBe('g1(2)');
  });

  it('resets contiguity tracking when a field has no group', () => {
    const props = [makeField('a', 'g1'), makeField('x'), makeField('b', 'g1')];
    const ntf = makeNameToField(props);
    renameDuplicatedGroups(props, ntf);
    // 'x' (no group) breaks the run, so 'b' is a new non-contiguous sequence
    expect(ntf['b'].group).toBe('g1(1)');
  });

  it('handles multiple contiguous fields in a renamed run correctly', () => {
    const props = [
      makeField('a', 'g1'),
      makeField('b', 'g2'),
      makeField('c', 'g1'), // first duplicate run
      makeField('d', 'g1'), // contiguous with c — same renamed group
    ];
    const ntf = makeNameToField(props);
    renameDuplicatedGroups(props, ntf);
    expect(ntf['c'].group).toBe('g1(1)');
    expect(ntf['d'].group).toBe('g1(1)'); // same run, keeps same name
  });

  it('mutates the nameToField map with renamed groups', () => {
    const props = [makeField('a', 'g1'), makeField('b', 'g2'), makeField('c', 'g1')];
    const ntf = makeNameToField(props);
    renameDuplicatedGroups(props, ntf);
    // nameToField should be updated
    expect(ntf['c'].group).toBe('g1(1)');
  });
});
