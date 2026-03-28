<script setup lang="ts">
import { computed } from 'vue';
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";

export type IntegerArrayInputProps = BaseInputProps<string | number[], DefinitionPropertyField>;

const props = defineProps<IntegerArrayInputProps>();

const emit = defineEmits<{
  change: [value: string | number[]];
  error: [error: string | null];
}>();

const validate = useFieldValidator(props.field, props.error);

const stringValue = computed(() => 
  Array.isArray(props.value) ? props.value.join(", ") : String(props.value ?? "")
);

const { inputRef, error, handleChange, handleBlur } = useUncontrolledValidatedInput({
  value: stringValue.value,
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
      :defaultValue="stringValue"
      :ref="inputRef"
      @input="handleChange"
      @blur="handleBlur"
      :class="combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)"
      style="flex: 1"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${field.name}-error` : undefined"
    />
  </StandardFieldLayout>
</template>
