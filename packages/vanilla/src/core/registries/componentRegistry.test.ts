import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import {
  DEBOUNCE_CONFIG,
  isBuiltinComponentType,
  registerComponent,
  getComponent,
  listComponents,
  registerBaseComponents,
} from './componentRegistry';
import {
  registerPlugin,
  unregisterPlugin,
  getPlugin,
  getAllPlugins,
  hasPlugin,
} from './pluginRegistry';

// ── DEBOUNCE_CONFIG ────────────────────────────────────────────────────────────
describe('DEBOUNCE_CONFIG', () => {
  it.each([
    'checkbox', 'switch', 'radio', 'dropdown', 'multi-selection',
    'color', 'rating', 'file', 'image', 'separator', 'description', 'button',
  ])('disables debounce for "%s"', (type) => {
    expect(DEBOUNCE_CONFIG[type]).toBe(false);
  });

  it.each([
    ['text', 200], ['string', 200], ['email', 200], ['password', 200],
    ['phone', 200], ['url', 200], ['int', 200], ['float', 200], ['multiline', 200],
  ])('"%s" field has %dms debounce wait', (type, wait) => {
    expect(DEBOUNCE_CONFIG[type]).toEqual({ wait });
  });

  it('sets 100ms wait for unit field', () => {
    expect(DEBOUNCE_CONFIG['unit']).toEqual({ wait: 100 });
  });

  it('sets 150ms wait for date and time fields', () => {
    expect(DEBOUNCE_CONFIG['date']).toEqual({ wait: 150 });
    expect(DEBOUNCE_CONFIG['time']).toEqual({ wait: 150 });
  });

  it('sets slider config with leading and trailing true', () => {
    expect(DEBOUNCE_CONFIG['slider']).toEqual({ wait: 100, leading: true, trailing: true });
  });

  it('sets stepper config with leading and trailing true', () => {
    expect(DEBOUNCE_CONFIG['stepper']).toEqual({ wait: 100, leading: true, trailing: true });
  });
});

// ── isBuiltinComponentType ─────────────────────────────────────────────────────
describe('isBuiltinComponentType', () => {
  it.each([
    'text', 'string', 'email', 'checkbox', 'switch', 'radio', 'dropdown',
    'multi-selection', 'color', 'rating', 'file', 'image', 'separator',
    'description', 'button', 'multiline', 'password', 'phone', 'url',
    'int', 'float', 'unit', 'date', 'time', 'slider', 'stepper',
    'int-array', 'float-array',
  ])('returns true for built-in type "%s"', (type) => {
    expect(isBuiltinComponentType(type)).toBe(true);
  });

  it('returns false for unknown type', () => {
    expect(isBuiltinComponentType('my-custom-widget')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isBuiltinComponentType('')).toBe(false);
  });
});

// ── registerComponent / getComponent ──────────────────────────────────────────
describe('registerComponent / getComponent', () => {
  it('registers and retrieves a custom component factory', () => {
    const myFactory = () => ({ destroy: () => undefined });
    registerComponent('custom-vanilla-widget', myFactory);
    expect(getComponent('custom-vanilla-widget')).toBe(myFactory);
  });

  it('returns undefined for an unregistered type', () => {
    expect(getComponent('nonexistent-type-vanilla-xyz')).toBeUndefined();
  });

  it('warns and skips when attempting to overwrite a built-in type', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const intruder = () => ({ destroy: () => undefined });
    registerComponent('checkbox', intruder);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('"checkbox"'));
    expect(getComponent('checkbox')).not.toBe(intruder);
    spy.mockRestore();
  });
});

// ── registerBaseComponents ─────────────────────────────────────────────────────
describe('registerBaseComponents', () => {
  beforeAll(() => {
    registerBaseComponents();
  });

  it.each([
    'text', 'string', 'email', 'checkbox', 'switch', 'radio', 'dropdown',
    'multi-selection', 'color', 'rating', 'file', 'image', 'separator',
    'description', 'button', 'multiline', 'password', 'phone', 'url',
    'int', 'float', 'unit', 'date', 'time', 'slider', 'stepper',
    'int-array', 'float-array',
  ])('registers built-in factory "%s"', (type) => {
    expect(getComponent(type)).toBeDefined();
  });

  it('is idempotent — repeated calls do not change registrations', () => {
    const textBefore = getComponent('text');
    registerBaseComponents();
    registerBaseComponents();
    expect(getComponent('text')).toBe(textBefore);
  });

  it('listComponents includes all built-in types', () => {
    const types = listComponents();
    expect(types).toContain('text');
    expect(types).toContain('email');
    expect(types).toContain('checkbox');
    expect(types).toContain('slider');
  });
});

// ── pluginRegistry ─────────────────────────────────────────────────────────────
describe('pluginRegistry', () => {
  afterEach(() => {
    unregisterPlugin('test-vanilla-plugin-a');
    unregisterPlugin('test-vanilla-plugin-b');
  });

  it('registers a plugin and detects it with hasPlugin', () => {
    registerPlugin({ name: 'test-vanilla-plugin-a', version: '1.0.0' });
    expect(hasPlugin('test-vanilla-plugin-a')).toBe(true);
  });

  it('retrieves a registered plugin with getPlugin', () => {
    registerPlugin({ name: 'test-vanilla-plugin-a', version: '3.0.0', description: 'Vanilla' });
    const p = getPlugin('test-vanilla-plugin-a');
    expect(p?.name).toBe('test-vanilla-plugin-a');
    expect(p?.version).toBe('3.0.0');
    expect(p?.description).toBe('Vanilla');
  });

  it('getAllPlugins includes all registered plugins', () => {
    registerPlugin({ name: 'test-vanilla-plugin-a', version: '1.0.0' });
    registerPlugin({ name: 'test-vanilla-plugin-b', version: '1.0.0' });
    const names = getAllPlugins().map((p) => p.name);
    expect(names).toContain('test-vanilla-plugin-a');
    expect(names).toContain('test-vanilla-plugin-b');
  });

  it('hasPlugin returns false for an unregistered plugin', () => {
    expect(hasPlugin('nonexistent-plugin-vanilla-xyz')).toBe(false);
  });

  it('unregisterPlugin removes the plugin and returns true', () => {
    registerPlugin({ name: 'test-vanilla-plugin-a', version: '1.0.0' });
    expect(unregisterPlugin('test-vanilla-plugin-a')).toBe(true);
    expect(hasPlugin('test-vanilla-plugin-a')).toBe(false);
  });

  it('unregisterPlugin returns false for a non-existent plugin', () => {
    expect(unregisterPlugin('does-not-exist-vanilla-xyz')).toBe(false);
  });

  it('calls setup on registration', () => {
    const setup = vi.fn();
    registerPlugin({ name: 'test-vanilla-plugin-a', version: '1.0.0', setup });
    expect(setup).toHaveBeenCalledOnce();
  });

  it('calls cleanup on unregistration', () => {
    const cleanup = vi.fn();
    registerPlugin({ name: 'test-vanilla-plugin-a', version: '1.0.0', cleanup });
    unregisterPlugin('test-vanilla-plugin-a');
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('throws on duplicate registration with conflictResolution "error"', () => {
    registerPlugin({ name: 'test-vanilla-plugin-a', version: '1.0.0' });
    expect(() =>
      registerPlugin(
        { name: 'test-vanilla-plugin-a', version: '2.0.0' },
        { conflictResolution: 'error' },
      ),
    ).toThrow();
  });

  it('skips duplicate registration with conflictResolution "skip"', () => {
    registerPlugin({ name: 'test-vanilla-plugin-a', version: '1.0.0' });
    registerPlugin(
      { name: 'test-vanilla-plugin-a', version: '2.0.0' },
      { conflictResolution: 'skip' },
    );
    expect(getPlugin('test-vanilla-plugin-a')?.version).toBe('1.0.0');
  });
});
