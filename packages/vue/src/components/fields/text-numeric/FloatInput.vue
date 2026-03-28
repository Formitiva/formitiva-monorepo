<script setup lang="ts">
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";


export type FloatInputProps = BaseInputProps<number | string, DefinitionPropertyField>;

const props = defineProps<FloatInputProps>();

const emit = defineEmits<{
  change: [value: string];
  error: [error: string | null];
}>();

const validate = useFieldValidator(props.field, props.error);

// Use shared uncontrolled + validated input hook
const { inputRef, error, handleChange, handleBlur } = useUncontrolledValidatedInput({
  value: props.value,
  onChange: (val: string) => emit('change', val),
  onError: (err: string | null) => emit('error', err),
  validate,
});

</script>

<template>
  <StandardFieldLayout :field="field" :error="error">
    <input
      :id="field.name"
      type="text"
      :ref="inputRef"
      :defaultValue="String(value ?? '')"
      @input="handleChange"
      @blur="handleBlur"
      :class="combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputNumber)"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${field.name}-error` : undefined"
    />
  </StandardFieldLayout>
</template>
