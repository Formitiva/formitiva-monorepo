<script setup lang="ts">
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";


type TextInputProps = BaseInputProps<string, DefinitionPropertyField> & { error?: string | null };

const props = defineProps<TextInputProps>();

const emit = defineEmits<{
  change: [value: string];
  error: [error: string | null];
}>();

const validate = useFieldValidator(props.field, props.error);

const { inputRef, error, handleChange, handleBlur } = useUncontrolledValidatedInput({
  value: props.value,
  onChange: (value: string) => emit('change', value),
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
      :class="combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)"
      :placeholder="field.placeholder"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${field.name}-error` : undefined"
    />
  </StandardFieldLayout>
</template>
