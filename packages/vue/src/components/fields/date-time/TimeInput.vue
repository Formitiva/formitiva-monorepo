<script setup lang="ts">
import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";


type TimeInputProps = BaseInputProps<string, DefinitionPropertyField>;

const props = defineProps<TimeInputProps>();

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

</script>

<template>
  <StandardFieldLayout :field="field" :error="error">
    <input
      :id="field.name"
      type="time"
      :ref="inputRef"
      :defaultValue="value"
      :step="field.includeSeconds ? 1 : 60"
      @input="handleChange"
      @blur="handleBlur"
      :min="typeof field.min === 'string' ? field.min : undefined"
      :max="typeof field.max === 'string' ? field.max : undefined"
      :class="combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${field.name}-error` : undefined"
    />
  </StandardFieldLayout>
</template>
