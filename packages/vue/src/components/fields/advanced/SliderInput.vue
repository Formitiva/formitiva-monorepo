<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { BaseInputProps, DefinitionPropertyField } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useFieldValidator } from "../../../hooks/useFieldValidator";

type SliderInputProps = BaseInputProps<string | number, DefinitionPropertyField>;

const props = defineProps<SliderInputProps>();

const emit = defineEmits<{
  change: [value: string | number];
  error: [error: string | null];
}>();

const validate = useFieldValidator(props.field, props.error);

const min = props.field.min ?? 0;
const max = props.field.max ?? 100;

const inputValue = ref(!isNaN(Number(props.value)) ? String(Number(props.value)) : String(min));

watch(() => props.value, (newValue) => {
  const newVal = !isNaN(Number(newValue)) ? String(Number(newValue)) : String(min);
  inputValue.value = newVal;
});

const error = ref<string | null>(null);
const prevError = ref<string | null>(null);

const updateError = (next: string | null) => {
  if (next !== prevError.value) {
    prevError.value = next;
    error.value = next;
    emit('error', next);
  }
};

watch(inputValue, (newVal) => {
  updateError(validate(newVal, "sync") ?? null);
});

const handleValueChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const input = target.value;
  inputValue.value = input;
  updateError(validate(input, "change") ?? null);
  emit('change', input);
};

const handleBlur = (e: Event) => {
  const target = e.target as HTMLInputElement;
  updateError(validate(target.value, "blur") ?? null);
};

const displayValue = computed(() => 
  !isNaN(Number(inputValue.value)) ? String(Number(inputValue.value)) : String(min)
);
</script>

<template>
  <StandardFieldLayout :field="field" :error="error">
    <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
      <input
        :id="`${field.name}-range`"
        type="range"
        :value="displayValue"
        @input="handleValueChange"
        @blur="handleBlur"
        :min="min"
        :max="max"
        :step="props.field.step ?? 1"
        style="padding: 0; flex: 1;"
        :class="CSS_CLASSES.rangeInput"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${field.name}-error` : undefined"
      />
      <div style="width: 40px; text-align: center;">{{ displayValue }}</div>
      <input
        :id="field.name"
        type="text"
        :value="inputValue"
        @input="handleValueChange"
        @blur="handleBlur"
        required
        style="
          width: 40px;
          min-width: 40px;
          height: 2.3em;
          text-align: center;
          flex-shrink: 0;
        "
        :class="combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${field.name}-error` : undefined"
      />
    </div>
  </StandardFieldLayout>
</template>
