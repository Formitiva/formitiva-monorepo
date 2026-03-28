<script setup lang="ts">
import { computed } from "vue";
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import { CSS_CLASSES } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";

export type NumericStepperInputProps = BaseInputProps<string | number, DefinitionPropertyField>;

const props = defineProps<NumericStepperInputProps>();

const emit = defineEmits<{
  change: [value: string | number];
  error: [error: string | null];
}>();

const validate = useFieldValidator(props.field, props.error);

const { inputRef, error, handleChange, handleBlur } = useUncontrolledValidatedInput({
  value: String(props.value ?? ""),
  onChange: (val: string | number) => emit('change', val),
  onError: (err: string | null) => emit('error', err),
  validate,
});

const step = Math.max(1, Math.round(Number(props.field.step ?? 1)));
const min = props.field.min != null ? Number(props.field.min) : Number.NEGATIVE_INFINITY;
const max = props.field.max != null ? Number(props.field.max) : Number.POSITIVE_INFINITY;

const currentValue = computed(() => {
  const v = props.value;
  if (v === null || v === undefined || v === "") return 0;
  const num = Number(v as any);
  return Number.isFinite(num) ? num : 0;
});

const increment = () => {
  const next = Math.min(max, currentValue.value + step);
  emit('change', next);
};

const decrement = () => {
  const next = Math.max(min, currentValue.value - step);
  emit('change', next);
};

const _ctx = useFormitivaContext();
const t = computed(() => _ctx.t);

const isAtMin = computed(() => currentValue.value <= min);
const isAtMax = computed(() => currentValue.value >= max);
</script>

<template>
  <StandardFieldLayout :field="field" :error="error">
    <div style="display:flex; align-items:center; gap:8px;">
      <button
        type="button"
        :aria-label="t('decrement') || 'decrement'"
        @click="decrement"
        :disabled="isAtMin"
      >
        -
      </button>

      <input
        :id="field.name"
        type="text"
        :defaultValue="String(value ?? '')"
        :ref="inputRef"
        @input="handleChange"
        @blur="handleBlur"
        style="flex:1;"
        :class="CSS_CLASSES.input"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${field.name}-error` : undefined"
      />

      <button
        type="button"
        :aria-label="t('increment') || 'increment'"
        @click="increment"
        :disabled="isAtMax"
      >
        +
      </button>
    </div>
  </StandardFieldLayout>
</template>
