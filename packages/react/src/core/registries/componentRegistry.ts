import { BaseRegistry } from '@formitiva/core';
import * as React from "react";
import type { DefinitionPropertyField } from '@formitiva/core';
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";
import { IS_TEST_ENV } from "../env";

import CheckboxInput from "../../components/fields/choices/CheckboxInput";
import ColorInput from "../../components/fields/advanced/ColorInput";
import DateInput from "../../components/fields/date-time/DateInput";
import Description from "../../components/fields/ui-elements/Description";
import DropdownInput from "../../components/fields/choices/DropdownInput";
import EmailInput from "../../components/fields/advanced/EmailInput";
import FieldSeparator from "../../components/fields/ui-elements/Separator";
import FileInput from "../../components/fields/advanced/FileInput";
import FloatArrayInput from "../../components/fields/text-numeric/FloatArrayInput";
import FloatInput from "../../components/fields/text-numeric/FloatInput";
import ImageDisplay from "../../components/fields/ui-elements/ImageDisplay";
import IntegerArrayInput from "../../components/fields/text-numeric/IntegerArrayInput";
import IntegerInput from "../../components/fields/text-numeric/IntegerInput";
import MultilineTextInput from "../../components/fields/text-numeric/MultilineTextInput";
import MultiSelect from "../../components/fields/choices/MultiSelection";
import NumericStepperInput from "../../components/fields/text-numeric/NumericStepperInput";
import PhoneInput from "../../components/fields/advanced/PhoneInput";
import RadioInput from "../../components/fields/choices/RadioInput";
import RatingInput from "../../components/fields/advanced/RatingInput";
import PasswordInput from "../../components/fields/advanced/PasswordInput";
import SliderInput from "../../components/fields/advanced/SliderInput";
import SwitchInput from "../../components/fields/choices/SwitchInput";
import TextInput from "../../components/fields/text-numeric/TextInput";
import TimeInput from "../../components/fields/date-time/TimeInput";
import UnitValueInput from "../../components/fields/advanced/UnitValueInput";
import UrlInput from "../../components/fields/advanced/UrlInput";
import Button from "../../components/fields/ui-elements/Button";

// Now DebounceConfig and DEBOUNCE_CONFIG are only used in this file
// In future we can move them to a separate file if needed
export type DebounceConfig = false | {
  wait?: number;
  leading?: boolean;
  trailing?: boolean;
};

export const DEBOUNCE_CONFIG: Record<string, DebounceConfig> = {
  // No debounce
  checkbox: false,
  switch: false,
  radio: false,
  dropdown: false,
  "multi-selection": false,
  color: false,
  rating: false,
  file: false,
  image: false,
  separator: false,
  description: false,
  button: false, // Buttons don't need debouncing

  // Standard text inputs
  string: { wait: 200 },
  text: { wait: 200 },
  multiline: { wait: 200 },
  email: { wait: 200 },
  password: { wait: 200 },
  phone: { wait: 200 },
  url: { wait: 200 },
  int: { wait: 200 },
  float: { wait: 200 },
  unit: { wait: 100 },

  // Date / time
  date: { wait: 150 },
  time: { wait: 150 },

  // Continuous
  slider: { wait: 100, leading: true, trailing: true },
  stepper: { wait: 100, leading: true, trailing: true },
};

// IMPORTANT: This registry is part of the public API surface.
// Do not expose React types (e.g. `React.ComponentType`) from here, because
// the emitted `.d.ts` can become coupled to the consumer's React typings
// and cause friction across React 18/19 setups.
type RegisteredComponent = unknown;

const registry = new BaseRegistry<RegisteredComponent>();

const baseComponents: Record<string, RegisteredComponent> = {
  button: Button,
  checkbox: CheckboxInput,
  color: ColorInput,
  date: DateInput,
  description: Description,
  dropdown: DropdownInput,
  email: EmailInput,
  file: FileInput,
  float: FloatInput,
  "float-array": FloatArrayInput,
  image: ImageDisplay,
  int: IntegerInput,
  "int-array": IntegerArrayInput,
  "multi-selection": MultiSelect,
  "multiline": MultilineTextInput,
  password: PasswordInput,
  phone: PhoneInput,
  radio: RadioInput,
  rating: RatingInput,
  separator: FieldSeparator,
  slider: SliderInput,
  string: TextInput,
  stepper: NumericStepperInput,
  switch: SwitchInput,
  text: TextInput,
  time: TimeInput,
  unit: UnitValueInput,
  url: UrlInput,
};

export function isBuiltinComponentType(typeName: string): boolean {
  return typeName in baseComponents;
}

// Helper to wrap a component with debounce functionality
type WrappedProps = {
  field?: Partial<DefinitionPropertyField>;
  onChange?: ((...args: unknown[]) => void) | undefined;
} & Record<string, unknown>;

function componentWithDebounce(
  Component: RegisteredComponent,
  config: Exclude<DebounceConfig, false>
): RegisteredComponent {
  const { wait = 200, leading, trailing } = config;

  const WrappedComponent = React.memo((props: WrappedProps) => {
    const onChangeRef = React.useRef(props.onChange);

    React.useEffect(() => {
      onChangeRef.current = props.onChange;
    }, [props.onChange]);

    const { callback, cancel } = useDebouncedCallback(
      (...args: unknown[]) => {
        onChangeRef.current?.(...args);
      },
      wait,
      { leading, trailing }
    );

    React.useEffect(() => cancel, [cancel]);

    return React.createElement(
      Component as React.ElementType,
      { ...props, onChange: callback }
    );
  });

  WrappedComponent.displayName = "DebouncedFieldWrapper";
  return WrappedComponent;
}

// Internal registration function
//   Prevent overwriting base components if isBaseComponent is false
export function registerComponentInternal(
  type: string,
  component: unknown,
  isBaseComponent: boolean
): void {
  const typedComponent = component as RegisteredComponent;

  if (!isBaseComponent && type in baseComponents) {
    console.warn(`Can't overwrite base component type "${type}".`);
    return;
  }

  const debounceConfig = DEBOUNCE_CONFIG[type];

  // No debounce �C register directly
  if (debounceConfig === false) {
    registry.register(type, typedComponent);
    return;
  }

  // Debounced (explicit or default)
  const effectiveConfig =
    debounceConfig ?? { wait: 200 };

  if (IS_TEST_ENV) {
    // Regster component directly in test env
    registry.register(type, typedComponent)
  } else {
    // Wrap with debounce HOC
    registry.register(
      type,
      componentWithDebounce(typedComponent, effectiveConfig) 
    );
  }
}

// Register a component for a given type, external user API
export function registerComponent(type: string, component: unknown): void {
  registerComponentInternal(type, component, false);
}

export function getComponent(type: string): unknown {
  return registry.get(type);
}

export function listComponents(): string[] {
  return registry.list();
}

// Register base components (called once)
let baseComponentRegistered = false;
export function registerBaseComponents(): void {
  if (baseComponentRegistered) return;

  Object.entries(baseComponents).forEach(([type, component]) => {
    // Register as base component
    registerComponentInternal(type, component, true);
  });

  baseComponentRegistered = true;
}

export default registry;
