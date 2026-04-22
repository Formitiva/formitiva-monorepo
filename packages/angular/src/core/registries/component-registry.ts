import { Type } from '@angular/core';
import { BaseRegistry } from '@formitiva/core';

/**
 * Angular component registry - maps field type strings to Angular component classes.
 * Unlike the React version, we store Angular component Types here which can be
 * used with NgComponentOutlet for dynamic rendering.
 */
const registry = new BaseRegistry<Type<unknown>>();

const builtinComponentTypes = new Set<string>();

/**
 * Debounce configuration retained for documentation purposes.
 * In Angular, debouncing is handled via RxJS in each field component.
 */
export type DebounceConfig = false | { wait?: number; leading?: boolean; trailing?: boolean };

export const DEBOUNCE_CONFIG: Record<string, DebounceConfig> = {
  checkbox: false, switch: false, radio: false, dropdown: false,
  'multi-selection': false, color: false, rating: false, file: false,
  image: false, separator: false, description: false, button: false,
  string: { wait: 200 }, text: { wait: 200 }, multiline: { wait: 200 },
  email: { wait: 200 }, password: { wait: 200 }, phone: { wait: 200 },
  url: { wait: 200 }, int: { wait: 200 }, float: { wait: 200 },
  unit: { wait: 100 }, date: { wait: 150 }, time: { wait: 150 },
  slider: { wait: 100, leading: true, trailing: true },
  stepper: { wait: 100, leading: true, trailing: true },
};

export function isBuiltinComponentType(typeName: string): boolean {
  return builtinComponentTypes.has(typeName);
}

let registeredBaseComponents = false;

/**
 * Register built-in component types. Called once by FormitivaModule.
 * Imports are deferred to avoid circular dependencies.
 */
export function registerBaseComponents(): Promise<void> {
  if (registeredBaseComponents) return Promise.resolve();
  registeredBaseComponents = true;

  // Grouped component files — one import per group to register all types in that group
  const pending = [
    import('../../components/fields/text-numeric/text-numeric-fields.component').then(m => {
      registerBuiltinComponent('string', m.TextInputComponent);
      registerBuiltinComponent('text', m.TextInputComponent);
      registerBuiltinComponent('int', m.IntegerInputComponent);
      registerBuiltinComponent('float', m.FloatInputComponent);
      registerBuiltinComponent('multiline', m.MultilineTextInputComponent);
      registerBuiltinComponent('int-array', m.IntegerArrayInputComponent);
      registerBuiltinComponent('float-array', m.FloatArrayInputComponent);
      registerBuiltinComponent('stepper', m.NumericStepperInputComponent);
      registerBuiltinComponent('password', m.PasswordInputComponent);
    }),

    import('../../components/fields/choices/choice-fields.component').then(m => {
      registerBuiltinComponent('checkbox', m.CheckboxInputComponent);
      registerBuiltinComponent('switch', m.SwitchInputComponent);
      registerBuiltinComponent('radio', m.RadioInputComponent);
      registerBuiltinComponent('dropdown', m.DropdownInputComponent);
      registerBuiltinComponent('multi-selection', m.MultiSelectionComponent);
    }),

    import('../../components/fields/date-time/date-time-fields.component').then(m => {
      registerBuiltinComponent('date', m.DateInputComponent);
      registerBuiltinComponent('time', m.TimeInputComponent);
    }),

    import('../../components/fields/advanced/advanced-fields.component').then(m => {
      registerBuiltinComponent('email', m.EmailInputComponent);
      registerBuiltinComponent('phone', m.PhoneInputComponent);
      registerBuiltinComponent('url', m.UrlInputComponent);
      registerBuiltinComponent('color', m.ColorInputComponent);
      registerBuiltinComponent('slider', m.SliderInputComponent);
      registerBuiltinComponent('rating', m.RatingInputComponent);
      registerBuiltinComponent('file', m.FileInputComponent);
      registerBuiltinComponent('unit', m.UnitValueInputComponent);
    }),

    import('../../components/fields/ui-elements/ui-elements.component').then(m => {
      registerBuiltinComponent('button', m.ButtonComponent);
      registerBuiltinComponent('description', m.DescriptionComponent);
      registerBuiltinComponent('image', m.ImageDisplayComponent);
      registerBuiltinComponent('separator', m.SeparatorComponent);
    }),
  ];

  return Promise.all(pending).then(() => undefined);
}

function registerBuiltinComponent(type: string, component: Type<unknown>): void {
  if (!component) return; // guard for test environments where dynamic imports are mocked
  builtinComponentTypes.add(type);
  registry.register(type, component);
}

/**
 * Register a custom Angular component for a field type.
 * Cannot override built-in types.
 */
export function registerComponent(type: string, component: Type<unknown>): void {
  if (builtinComponentTypes.has(type)) {
    console.warn(`[Formitiva] Cannot override built-in component for type "${type}".`);
    return;
  }
  registry.register(type, component);
}

export function getComponent(type: string): Type<unknown> | undefined {
  return registry.get(type);
}

export function hasComponent(type: string): boolean {
  return registry.has(type);
}
