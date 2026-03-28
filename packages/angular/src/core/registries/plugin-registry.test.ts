import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  registerPlugin,
  unregisterPlugin,
  getPlugin,
  getAllPlugins,
  hasPlugin,
} from './plugin-registry';

// Angular's plugin-registry uses 'warn' as the default conflictResolution strategy.

describe('registerPlugin', () => {
  afterEach(() => {
    unregisterPlugin('test-angular-plugin-a');
    unregisterPlugin('test-angular-plugin-b');
  });

  it('registers a plugin and detects it with hasPlugin', () => {
    registerPlugin({ name: 'test-angular-plugin-a', version: '1.0.0' });
    expect(hasPlugin('test-angular-plugin-a')).toBe(true);
  });

  it('retrieves a registered plugin with getPlugin', () => {
    registerPlugin({ name: 'test-angular-plugin-a', version: '2.5.0', description: 'Angular test' });
    const p = getPlugin('test-angular-plugin-a');
    expect(p?.name).toBe('test-angular-plugin-a');
    expect(p?.version).toBe('2.5.0');
    expect(p?.description).toBe('Angular test');
  });

  it('getAllPlugins includes all registered plugins', () => {
    registerPlugin({ name: 'test-angular-plugin-a', version: '1.0.0' });
    registerPlugin({ name: 'test-angular-plugin-b', version: '1.0.0' });
    const names = getAllPlugins().map((p) => p.name);
    expect(names).toContain('test-angular-plugin-a');
    expect(names).toContain('test-angular-plugin-b');
  });

  it('calls setup hook on registration', () => {
    const setup = vi.fn();
    registerPlugin({ name: 'test-angular-plugin-a', version: '1.0.0', setup });
    expect(setup).toHaveBeenCalledOnce();
  });

  it('throws on duplicate registration with conflictResolution "error"', () => {
    registerPlugin({ name: 'test-angular-plugin-a', version: '1.0.0' });
    expect(() =>
      registerPlugin(
        { name: 'test-angular-plugin-a', version: '2.0.0' },
        { conflictResolution: 'error' },
      ),
    ).toThrow(`Plugin "test-angular-plugin-a" is already registered.`);
  });

  it('skips duplicate registration with conflictResolution "skip"', () => {
    registerPlugin({ name: 'test-angular-plugin-a', version: '1.0.0' });
    registerPlugin(
      { name: 'test-angular-plugin-a', version: '2.0.0' },
      { conflictResolution: 'skip' },
    );
    expect(getPlugin('test-angular-plugin-a')?.version).toBe('1.0.0');
  });

  it('allows re-registration with default "warn" strategy (overrides)', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerPlugin({ name: 'test-angular-plugin-a', version: '1.0.0' });
    registerPlugin({ name: 'test-angular-plugin-a', version: '2.0.0' });
    // Default 'warn' does not throw, and updates the plugin
    expect(getPlugin('test-angular-plugin-a')?.version).toBe('2.0.0');
    spy.mockRestore();
  });
});

describe('hasPlugin', () => {
  it('returns false for an unregistered plugin', () => {
    expect(hasPlugin('nonexistent-plugin-angular-xyz')).toBe(false);
  });
});

describe('unregisterPlugin', () => {
  afterEach(() => {
    unregisterPlugin('test-angular-plugin-a');
  });

  it('removes the plugin and returns true', () => {
    registerPlugin({ name: 'test-angular-plugin-a', version: '1.0.0' });
    expect(unregisterPlugin('test-angular-plugin-a')).toBe(true);
    expect(hasPlugin('test-angular-plugin-a')).toBe(false);
  });

  it('returns false for a non-existent plugin', () => {
    expect(unregisterPlugin('does-not-exist-angular-xyz')).toBe(false);
  });

  it('calls cleanup hook on unregistration', () => {
    const cleanup = vi.fn();
    registerPlugin({ name: 'test-angular-plugin-a', version: '1.0.0', cleanup });
    unregisterPlugin('test-angular-plugin-a');
    expect(cleanup).toHaveBeenCalledOnce();
  });
});
