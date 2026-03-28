<script setup lang="ts">
import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";


export type PhoneInputProps = BaseInputProps<string, DefinitionPropertyField>;

const props = defineProps<PhoneInputProps>();

const emit = defineEmits<{
  change: [value: string];
  error: [error: string | null];
}>();

const validate = useFieldValidator(props.field, props.error);

const { inputRef, error, handleChange, handleBlur } = useUncontrolledValidatedInput({
  value: props.value,
  onChange: (val: string) => emit('change', val),
  onError: (err: string | null) => emit('error', err),
  validate,
});

// `useUncontrolledValidatedInput` returns a VNodeRef-compatible `inputRef`.
</script>

<template>
  <StandardFieldLayout :field="field" :error="error">
    <input
      :id="field.name"
      type="tel"
      :defaultValue="String(value ?? '')"
      :ref="inputRef"
      @input="handleChange"
      @blur="handleBlur"
      :class="combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${field.name}-error` : undefined"
    />
  </StandardFieldLayout>
</template>
