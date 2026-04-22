import { BaseRegistry } from '@formitiva/core';
import { h, defineComponent, onUnmounted, type Component } from "vue";
// type imports not required in this file
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";
import { IS_TEST_ENV } from "../env";

import CheckboxInput from "../../components/fields/choices/CheckboxInput.vue";
import ColorInput from "../../components/fields/advanced/ColorInput.vue";
import DateInput from "../../components/fields/date-time/DateInput.vue";
import Description from "../../components/fields/ui-elements/Description.vue";
import DropdownInput from "../../components/fields/choices/DropdownInput.vue";
import EmailInput from "../../components/fields/advanced/EmailInput.vue";
import FieldSeparator from "../../components/fields/ui-elements/Separator.vue";
import FileInput from "../../components/fields/advanced/FileInput.vue";
import FloatArrayInput from "../../components/fields/text-numeric/FloatArrayInput.vue";
import FloatInput from "../../components/fields/text-numeric/FloatInput.vue";
import ImageDisplay from "../../components/fields/ui-elements/ImageDisplay.vue";
import IntegerArrayInput from "../../components/fields/text-numeric/IntegerArrayInput.vue";
import IntegerInput from "../../components/fields/text-numeric/IntegerInput.vue";
import MultilineTextInput from "../../components/fields/text-numeric/MultilineTextInput.vue";
import MultiSelect from "../../components/fields/choices/MultiSelection.vue";
import NumericStepperInput from "../../components/fields/text-numeric/NumericStepperInput.vue";
import PhoneInput from "../../components/fields/advanced/PhoneInput.vue";
import RadioInput from "../../components/fields/choices/RadioInput.vue";
import RatingInput from "../../components/fields/advanced/RatingInput.vue";
import PasswordInput from "../../components/fields/advanced/PasswordInput.vue";
import SliderInput from "../../components/fields/advanced/SliderInput.vue";
import SwitchInput from "../../components/fields/choices/SwitchInput.vue";
import TextInput from "../../components/fields/text-numeric/TextInput.vue";
import TimeInput from "../../components/fields/date-time/TimeInput.vue";
import UnitValueInput from "../../components/fields/advanced/UnitValueInput.vue";
import UrlInput from "../../components/fields/advanced/UrlInput.vue";
import Button from "../../components/fields/ui-elements/Button.vue";

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
type RegisteredComponent = Component;

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

// Helper to wrap a Vue component with debounce functionality
function componentWithDebounce(
  component: RegisteredComponent,
  config: Exclude<DebounceConfig, false>
): RegisteredComponent {
  const { wait = 200, leading, trailing } = config;

  const WrappedComponent = defineComponent({
    name: 'DebouncedFieldWrapper',
    props: ['field', 'onChange'],
    setup(props, { attrs, slots, emit }) {
      const { callback, cancel } = useDebouncedCallback(
        (...args: unknown[]) => {
          if (props.onChange) {
            props.onChange(...args);
          }
          emit('change', ...args);
        },
        wait,
        { leading, trailing }
      );

      // Ensure any pending debounced call is cancelled when component is unmounted
      onUnmounted(() => {
        cancel();
      });

      return () => h(component, { ...attrs, ...props, onChange: callback }, slots);
    }
  });
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
    // Register component directly in test env
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
