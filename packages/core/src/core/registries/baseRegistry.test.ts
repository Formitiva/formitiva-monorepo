import { describe, it, expect, beforeEach } from 'vitest';
import { BaseRegistry } from './baseRegistry';

describe('BaseRegistry', () => {
  let registry: BaseRegistry<string>;

  beforeEach(() => {
    registry = new BaseRegistry<string>();
  });

  // ─── register / get ──────────────────────────────────────────────────────────

  it('registers and retrieves a value', () => {
    registry.register('handler', 'value');
    expect(registry.get('handler')).toBe('value');
  });

  it('overwrites existing value on re-register', () => {
    registry.register('k', 'v1');
    registry.register('k', 'v2');
    expect(registry.get('k')).toBe('v2');
  });

  it('returns undefined for an unknown key', () => {
    expect(registry.get('missing')).toBeUndefined();
  });

  it('throws when registering an empty key', () => {
    expect(() => registry.register('', 'value')).toThrow();
  });

  it('throws when registering a non-string key', () => {
    expect(() => registry.register(null as unknown as string, 'value')).toThrow();
  });

  it('returns undefined when getting with an empty key', () => {
    expect(registry.get('')).toBeUndefined();
  });

  // ─── has ─────────────────────────────────────────────────────────────────────

  it('has() returns true for a registered key', () => {
    registry.register('k', 'v');
    expect(registry.has('k')).toBe(true);
  });

  it('has() returns false for an unknown key', () => {
    expect(registry.has('missing')).toBe(false);
  });

  it('has() returns false for an empty key', () => {
    expect(registry.has('')).toBe(false);
  });

  // ─── list / size ─────────────────────────────────────────────────────────────

  it('list() returns all registered keys', () => {
    registry.register('a', 'v1');
    registry.register('b', 'v2');
    expect(registry.list()).toContain('a');
    expect(registry.list()).toContain('b');
    expect(registry.list()).toHaveLength(2);
  });

  it('size() returns 0 for empty registry', () => {
    expect(registry.size()).toBe(0);
  });

  it('size() increments when registering', () => {
    registry.register('x', 'v');
    expect(registry.size()).toBe(1);
  });

  // ─── unregister ──────────────────────────────────────────────────────────────

  it('unregister() removes a key and returns true', () => {
    registry.register('k', 'v');
    expect(registry.unregister('k')).toBe(true);
    expect(registry.has('k')).toBe(false);
  });

  it('unregister() returns false for an unknown key', () => {
    expect(registry.unregister('missing')).toBe(false);
  });

  // ─── clear ───────────────────────────────────────────────────────────────────

  it('clear() empties the registry', () => {
    registry.register('a', 'v1');
    registry.register('b', 'v2');
    registry.clear();
    expect(registry.size()).toBe(0);
    expect(registry.list()).toHaveLength(0);
  });

  // ─── registerAll ─────────────────────────────────────────────────────────────

  it('registerAll() accepts an object', () => {
    registry.registerAll({ a: 'v1', b: 'v2' });
    expect(registry.get('a')).toBe('v1');
    expect(registry.get('b')).toBe('v2');
  });

  it('registerAll() accepts an array of [key, value] pairs', () => {
    registry.registerAll([['a', 'v1'], ['b', 'v2']]);
    expect(registry.get('a')).toBe('v1');
    expect(registry.get('b')).toBe('v2');
  });

  it('registerAll() skips invalid (empty) keys in array form', () => {
    registry.registerAll([['', 'v']]);
    expect(registry.size()).toBe(0);
  });

  // ─── getOrDefault ─────────────────────────────────────────────────────────────

  it('getOrDefault() returns the registered value when key exists', () => {
    registry.register('k', 'found');
    expect(registry.getOrDefault('k', 'default')).toBe('found');
  });

  it('getOrDefault() returns the default value for an unknown key', () => {
    expect(registry.getOrDefault('missing', 'fallback')).toBe('fallback');
  });

  // ─── entries / values ─────────────────────────────────────────────────────────

  it('entries() returns all [key, value] pairs', () => {
    registry.register('a', 'v1');
    expect(registry.entries()).toContainEqual(['a', 'v1']);
  });

  it('values() returns all registered values', () => {
    registry.register('a', 'v1');
    registry.register('b', 'v2');
    expect(registry.values()).toContain('v1');
    expect(registry.values()).toContain('v2');
  });
});
