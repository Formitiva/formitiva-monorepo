<script setup lang="ts">
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { toRef } from 'vue';
import { useFieldValidator } from "../../../hooks/useFieldValidator";

export type IntegerInputProps = BaseInputProps<number | string, DefinitionPropertyField>;

const props = defineProps<IntegerInputProps>();

const emit = defineEmits<{
  change: [value: string];
  error: [error: string | null];
}>();

// Define validation logic
const validate = useFieldValidator(props.field, props.error);

// Use our shared uncontrolled + validated input hook
const { inputRef, error, handleChange, handleBlur } = useUncontrolledValidatedInput({
  value: toRef(props, 'value'),
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
      :defaultValue="String(value ?? '')"
      :ref="inputRef"
      @input="handleChange"
      @blur="handleBlur"
      :class="combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputNumber)"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${field.name}-error` : undefined"
    />
  </StandardFieldLayout>
</template>
