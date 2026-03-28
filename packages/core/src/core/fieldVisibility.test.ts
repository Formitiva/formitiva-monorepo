import { describe, it, expect } from 'vitest';
import { updateVisibilityMap, updateVisibilityBasedOnSelection } from './fieldVisibility';
import type { DefinitionPropertyField, FieldValueType } from './formitivaTypes';

const field = (
  name: string,
  overrides: Partial<DefinitionPropertyField> = {},
): DefinitionPropertyField => ({ name, type: 'dropdown', displayName: name, ...overrides } as DefinitionPropertyField);

const makeFieldMap = (fields: DefinitionPropertyField[]): Record<string, DefinitionPropertyField> =>
  Object.fromEntries(fields.map((f) => [f.name, f]));

// ─── updateVisibilityMap ──────────────────────────────────────────────────────

describe('updateVisibilityMap', () => {
  it('marks root fields (no parents) as visible', () => {
    const fields = [field('color'), field('size')];
    const fieldMap = makeFieldMap(fields);
    const vis = updateVisibilityMap(fields, {}, {}, fieldMap);
    expect(vis.color).toBe(true);
    expect(vis.size).toBe(true);
  });

  it('does not override false visibility for parent-dependent fields', () => {
    const parent = field('type');
    const child = field('sub', { parents: { type: ['A'] } });
    const fields = [parent, child];
    const fieldMap = makeFieldMap(fields);
    const vis = updateVisibilityMap(fields, {}, { sub: false }, fieldMap);
    expect(vis.type).toBe(true);
    expect(vis.sub).toBe(false);
  });

  it('shows children when parent has matching value', () => {
    const parent = field('color', { children: { red: ['hexRed'] } });
    const child = field('hexRed', { parents: { color: ['red'] } });
    const fields = [parent, child];
    const fieldMap = makeFieldMap(fields);
    const vis = updateVisibilityMap(fields, { color: 'red' } as Record<string, FieldValueType>, {}, fieldMap);
    expect(vis.color).toBe(true);
    expect(vis.hexRed).toBe(true);
  });
});

// ─── updateVisibilityBasedOnSelection ────────────────────────────────────────

describe('updateVisibilityBasedOnSelection', () => {
  it('shows children matching the selected value', () => {
    const color = field('color', { children: { red: ['hexRed'], blue: ['hexBlue'] } });
    const hexRed = field('hexRed', { parents: { color: ['red'] } });
    const hexBlue = field('hexBlue', { parents: { color: ['blue'] } });
    const fieldMap = makeFieldMap([color, hexRed, hexBlue]);
    const initial = { color: true, hexRed: false, hexBlue: false };

    const result = updateVisibilityBasedOnSelection(initial, fieldMap, { color: 'red' } as Record<string, FieldValueType>, 'color', 'red');
    expect(result.hexRed).toBe(true);
    expect(result.hexBlue).toBe(false);
  });

  it('hides previously visible children when value changes', () => {
    const color = field('color', { children: { red: ['hexRed'], blue: ['hexBlue'] } });
    const hexRed = field('hexRed', { parents: { color: ['red'] } });
    const hexBlue = field('hexBlue', { parents: { color: ['blue'] } });
    const fieldMap = makeFieldMap([color, hexRed, hexBlue]);
    const initial = { color: true, hexRed: true, hexBlue: false };

    const result = updateVisibilityBasedOnSelection(initial, fieldMap, { color: 'blue' } as Record<string, FieldValueType>, 'color', 'blue');
    expect(result.hexRed).toBe(false);
    expect(result.hexBlue).toBe(true);
  });

  it('hides all children when value is null/undefined', () => {
    const color = field('color', { children: { red: ['hexRed'] } });
    const hexRed = field('hexRed', { parents: { color: ['red'] } });
    const fieldMap = makeFieldMap([color, hexRed]);
    const initial = { color: true, hexRed: true };

    const result = updateVisibilityBasedOnSelection(initial, fieldMap, {} as Record<string, FieldValueType>, 'color', null as unknown as FieldValueType);
    expect(result.hexRed).toBe(false);
  });

  it('shows parent-based fields when value matches accepted list', () => {
    const status = field('status');
    const note = field('note', { parents: { status: ['active', 'pending'] } });
    const fieldMap = makeFieldMap([status, note]);
    const initial = { status: true, note: false };

    const result = updateVisibilityBasedOnSelection(initial, fieldMap, {} as Record<string, FieldValueType>, 'status', 'active');
    expect(result.note).toBe(true);
  });

  it('hides parent-based fields when value does not match', () => {
    const status = field('status');
    const note = field('note', { parents: { status: ['active'] } });
    const fieldMap = makeFieldMap([status, note]);
    const initial = { status: true, note: true };

    const result = updateVisibilityBasedOnSelection(initial, fieldMap, {} as Record<string, FieldValueType>, 'status', 'inactive');
    expect(result.note).toBe(false);
  });

  it('does not mutate the original visibility object', () => {
    const color = field('color', { children: { red: ['hexRed'] } });
    const hexRed = field('hexRed', { parents: { color: ['red'] } });
    const fieldMap = makeFieldMap([color, hexRed]);
    const initial = { color: true, hexRed: false };
    const frozen = { ...initial };

    updateVisibilityBasedOnSelection(initial, fieldMap, {} as Record<string, FieldValueType>, 'color', 'red');
    // original should not change
    expect(initial).toEqual(frozen);
  });

  it('hides nested grandchildren when parent is cleared', () => {
    const top = field('top', { children: { A: ['mid'] } });
    const mid = field('mid', { children: { X: ['bottom'] }, parents: { top: ['A'] } });
    const bottom = field('bottom', { parents: { mid: ['X'] } });
    const fieldMap = makeFieldMap([top, mid, bottom]);
    const initial = { top: true, mid: true, bottom: true };

    const result = updateVisibilityBasedOnSelection(initial, fieldMap, { top: null } as Record<string, FieldValueType>, 'top', null as unknown as FieldValueType);
    expect(result.mid).toBe(false);
    expect(result.bottom).toBe(false);
  });
});
