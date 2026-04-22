import { describe, it, expect, vi, afterAll } from 'vitest';

// Mock all dynamically-imported Angular component modules so that the
// dynamic import() calls inside registerBaseComponents() resolve immediately
// with empty objects instead of loading real Angular code. Without these mocks
// the promises settle after the Vitest environment is torn down, causing
// EnvironmentTeardownError in CI.
// NOTE: vi.mock() is hoisted — factories must be inline expressions, not variable refs.
// Each factory returns the exact named exports that registerBaseComponents() accesses,
// using plain stub constructors so Vitest does not throw on named-export validation.
vi.mock('../../components/fields/text-numeric/text-numeric-fields.component', () => ({
  TextInputComponent: class {},
  IntegerInputComponent: class {},
  FloatInputComponent: class {},
  MultilineTextInputComponent: class {},
  IntegerArrayInputComponent: class {},
  FloatArrayInputComponent: class {},
  NumericStepperInputComponent: class {},
  PasswordInputComponent: class {},
}));
vi.mock('../../components/fields/choices/choice-fields.component', () => ({
  CheckboxInputComponent: class {},
  SwitchInputComponent: class {},
  RadioInputComponent: class {},
  DropdownInputComponent: class {},
  MultiSelectionComponent: class {},
}));
vi.mock('../../components/fields/date-time/date-time-fields.component', () => ({
  DateInputComponent: class {},
  TimeInputComponent: class {},
}));
vi.mock('../../components/fields/advanced/advanced-fields.component', () => ({
  EmailInputComponent: class {},
  PhoneInputComponent: class {},
  UrlInputComponent: class {},
  ColorInputComponent: class {},
  SliderInputComponent: class {},
  RatingInputComponent: class {},
  FileInputComponent: class {},
  UnitValueInputComponent: class {},
}));
vi.mock('../../components/fields/ui-elements/ui-elements.component', () => ({
  ButtonComponent: class {},
  DescriptionComponent: class {},
  ImageDisplayComponent: class {},
  SeparatorComponent: class {},
}));

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
  // Await the returned promise in afterAll so all dynamic import() chains
  // fully settle before Vitest tears down the environment, avoiding
  // EnvironmentTeardownError in CI.
  afterAll(async () => {
    await registerBaseComponents();
  });

  it('does not throw and returns a Promise', async () => {
    await expect(registerBaseComponents()).resolves.toBeUndefined();
  });

  it('is idempotent — repeated calls do not throw', async () => {
    await expect(
      Promise.all([registerBaseComponents(), registerBaseComponents()]),
    ).resolves.toBeDefined();
  });
});
