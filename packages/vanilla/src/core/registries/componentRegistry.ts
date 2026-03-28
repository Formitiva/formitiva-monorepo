import { BaseRegistry } from '@formitiva/core';
import type { FieldFactory, ButtonFieldFactory } from '../../core/fieldWidget';
import { createDebouncedCallback } from '../../hooks/useDebouncedCallback';
import { IS_TEST_ENV } from '../env';

import createCheckboxInput from '../../components/fields/choices/CheckboxInput';
import createColorInput from '../../components/fields/advanced/ColorInput';
import createDateInput from '../../components/fields/date-time/DateInput';
import createDescription from '../../components/fields/ui-elements/Description';
import createDropdownInput from '../../components/fields/choices/DropdownInput';
import createEmailInput from '../../components/fields/advanced/EmailInput';
import createSeparator from '../../components/fields/ui-elements/Separator';
import createFileInput from '../../components/fields/advanced/FileInput';
import createFloatArrayInput from '../../components/fields/text-numeric/FloatArrayInput';
import createFloatInput from '../../components/fields/text-numeric/FloatInput';
import createImageDisplay from '../../components/fields/ui-elements/ImageDisplay';
import createIntegerArrayInput from '../../components/fields/text-numeric/IntegerArrayInput';
import createIntegerInput from '../../components/fields/text-numeric/IntegerInput';
import createMultilineTextInput from '../../components/fields/text-numeric/MultilineTextInput';
import createMultiSelection from '../../components/fields/choices/MultiSelection';
import createNumericStepperInput from '../../components/fields/text-numeric/NumericStepperInput';
import createPhoneInput from '../../components/fields/advanced/PhoneInput';
import createRadioInput from '../../components/fields/choices/RadioInput';
import createRatingInput from '../../components/fields/advanced/RatingInput';
import createPasswordInput from '../../components/fields/advanced/PasswordInput';
import createSliderInput from '../../components/fields/advanced/SliderInput';
import createSwitchInput from '../../components/fields/choices/SwitchInput';
import createTextInput from '../../components/fields/text-numeric/TextInput';
import createTimeInput from '../../components/fields/date-time/TimeInput';
import createUnitValueInput from '../../components/fields/advanced/UnitValueInput';
import createUrlInput from '../../components/fields/advanced/UrlInput';
import createButton from '../../components/fields/ui-elements/Button';

export type DebounceConfig = false | {
  wait?: number;
  leading?: boolean;
  trailing?: boolean;
};

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

type RegisteredComponent = FieldFactory | ButtonFieldFactory;

const registry = new BaseRegistry<RegisteredComponent>();

const baseComponents: Record<string, RegisteredComponent> = {
  button: createButton as unknown as ButtonFieldFactory,
  checkbox: createCheckboxInput,
  color: createColorInput,
  date: createDateInput,
  description: createDescription,
  dropdown: createDropdownInput,
  email: createEmailInput,
  file: createFileInput,
  float: createFloatInput,
  'float-array': createFloatArrayInput,
  image: createImageDisplay,
  int: createIntegerInput,
  'int-array': createIntegerArrayInput,
  'multi-selection': createMultiSelection,
  multiline: createMultilineTextInput,
  password: createPasswordInput,
  phone: createPhoneInput,
  radio: createRadioInput,
  rating: createRatingInput,
  separator: createSeparator,
  slider: createSliderInput,
  string: createTextInput,
  stepper: createNumericStepperInput,
  switch: createSwitchInput,
  text: createTextInput,
  time: createTimeInput,
  unit: createUnitValueInput,
  url: createUrlInput,
};

export function isBuiltinComponentType(typeName: string): boolean {
  return typeName in baseComponents;
}

function factoryWithDebounce(
  factory: FieldFactory,
  config: Exclude<DebounceConfig, false>
): FieldFactory {
  const { wait = 200, leading, trailing } = config;
  return function(field, ctx, onChange, onError, initialValue, initialError, disabled) {
    const { callback, cancel } = createDebouncedCallback(onChange as (...args: unknown[]) => unknown, wait, { leading, trailing });
    const widget = factory(field, ctx, callback, onError, initialValue, initialError, disabled);
    const origDestroy = widget.destroy.bind(widget);
    return { ...widget, destroy() { cancel(); origDestroy(); } };
  };
}

export function registerComponentInternal(
  type: string,
  component: unknown,
  isBaseComponent: boolean
): void {
  if (!isBaseComponent && type in baseComponents) {
    console.warn(`Can't overwrite base component type "${type}".`);
    return;
  }
  const debounceConfig = DEBOUNCE_CONFIG[type];
  if (debounceConfig === false || type === 'button') {
    registry.register(type, component as RegisteredComponent);
    return;
  }
  const effectiveConfig = debounceConfig ?? { wait: 200 };
  if (IS_TEST_ENV) {
    registry.register(type, component as RegisteredComponent);
  } else {
    registry.register(type, factoryWithDebounce(component as FieldFactory, effectiveConfig));
  }
}

export function registerComponent(type: string, component: unknown): void {
  registerComponentInternal(type, component, false);
}

export function getComponent(type: string): unknown {
  return registry.get(type);
}

export function listComponents(): string[] {
  return registry.list();
}

let baseComponentRegistered = false;
export function registerBaseComponents(): void {
  if (baseComponentRegistered) return;
  Object.entries(baseComponents).forEach(([type, component]) => {
    registerComponentInternal(type, component, true);
  });
  baseComponentRegistered = true;
}

export default registry;
