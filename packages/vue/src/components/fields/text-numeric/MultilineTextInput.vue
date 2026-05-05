<script setup lang="ts">
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";
import useFormitivaContext from "../../../hooks/useFormitivaContext";


type MultilineTextInputProps = BaseInputProps<string, DefinitionPropertyField>;

const props = defineProps<MultilineTextInputProps>();

const emit = defineEmits<{
  change: [value: string];
  error: [error: string | null];
}>();

const validate = useFieldValidator(props.field, props.error);
const { t } = useFormitivaContext();

// Use shared uncontrolled + validated input hook (textarea variant)
const { inputRef, error, handleChange, handleBlur } = useUncontrolledValidatedInput<HTMLTextAreaElement>({
  value: props.value,
  onChange: (val: string) => emit('change', val),
  onError: (err: string | null) => emit('error', err),
  validate,
});

</script>

<template>
  <StandardFieldLayout :field="field" :error="error">
    <textarea
      :id="field.name"
      :defaultValue="String(value ?? '')"
      :ref="inputRef"
      @input="handleChange"
      @blur="handleBlur"
      :style="{
        resize: 'vertical',
        minHeight: field.minHeight ?? '80px',
        width: '100%',
        boxSizing: 'border-box',
      }"
      :class="combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)"
      :placeholder="field.placeholder ? t(field.placeholder) : undefined"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${field.name}-error` : undefined"
    />
  </StandardFieldLayout>
</template>
