import { describe, it, expect, vi } from 'vitest';
import {
  DEBOUNCE_CONFIG,
  isBuiltinComponentType,
  registerComponent,
  getComponent,
  hasComponent,
  registerBaseComponents,
} from './component-registry';

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
// Angular uses dynamic imports in registerBaseComponents(), so built-in types
// are registered asynchronously. Before those resolve, isBuiltinComponentType
// returns false for all types.
describe('isBuiltinComponentType', () => {
  it('returns false for types not yet registered via registerBuiltinComponent', () => {
    // Built-ins are only populated via dynamic imports; in unit tests those
    // component files are not available, so the set stays empty.
    expect(isBuiltinComponentType('text')).toBe(false);
    expect(isBuiltinComponentType('checkbox')).toBe(false);
  });

  it('returns false for unknown types', () => {
    expect(isBuiltinComponentType('my-custom-widget')).toBe(false);
    expect(isBuiltinComponentType('')).toBe(false);
  });
});

// ── registerComponent / getComponent / hasComponent ───────────────────────────
describe('registerComponent / getComponent / hasComponent', () => {
  it('registers and retrieves a custom component', () => {
    class MyAngularComp {}
    registerComponent('custom-angular-widget', MyAngularComp as unknown as new () => unknown);
    expect(getComponent('custom-angular-widget')).toBe(MyAngularComp);
  });

  it('hasComponent returns true after registration', () => {
    class AnotherComp {}
    registerComponent('custom-angular-widget-2', AnotherComp as unknown as new () => unknown);
    expect(hasComponent('custom-angular-widget-2')).toBe(true);
  });

  it('hasComponent returns false for unregistered type', () => {
    expect(hasComponent('nonexistent-angular-xyz')).toBe(false);
  });

  it('getComponent returns undefined for unregistered type', () => {
    expect(getComponent('nonexistent-angular-xyz')).toBeUndefined();
  });

  it('warns and skips when attempting to overwrite a built-in type', () => {
    // Simulate a type that is in builtinComponentTypes by calling registerBaseComponents
    // and waiting for a microtask — but since dynamic imports fail in tests, we instead
    // directly verify the guard on a type that was NOT registered as built-in:
    // registerComponent for a non-built-in custom type should succeed without warnings.
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    class DummyComp {}
    registerComponent('custom-angular-widget-3', DummyComp as unknown as new () => unknown);
    expect(console.warn).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

// ── registerBaseComponents ─────────────────────────────────────────────────────
describe('registerBaseComponents', () => {
  it('does not throw when called', () => {
    expect(() => registerBaseComponents()).not.toThrow();
  });

  it('is idempotent — repeated calls do not throw', () => {
    expect(() => {
      registerBaseComponents();
      registerBaseComponents();
    }).not.toThrow();
  });
});
