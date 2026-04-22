<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { CSSProperties } from 'vue';
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from '@formitiva/core';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useFieldValidator } from "../../../hooks/useFieldValidator";

type RadioField = DefinitionPropertyField & {
  options: NonNullable<DefinitionPropertyField["options"]>;
};

export type RadioInputProps = BaseInputProps<string, RadioField>;

const props = defineProps<RadioInputProps>();

const emit = defineEmits<{
  change: [value: string];
  error: [error: string | null];
}>();

const _ctx = useFormitivaContext();
const t = computed(() => _ctx.t);
const validate = useFieldValidator(props.field, props.error);

const layout = computed<"row" | "column">(() =>
  props.field.layout?.toLowerCase() === "horizontal" ? "row" : "column"
);

const error = ref<string | null>(null);
const prevError = ref<string | null>(null);

const updateError = (next: string | null) => {
  if (next !== prevError.value) {
    prevError.value = next;
    error.value = next;
    emit('error', next);
  }
};

// Validate & normalize incoming value
watch(() => props.value, (newValue) => {
  const safeValue = newValue != null ? String(newValue) : "";
  const err = validate(safeValue, "sync");
  updateError(err);
}, { immediate: true });

// Emit required error immediately if needed
if (props.field.required && (props.value == null || String(props.value) === '')) {
  const errMsg = t.value('This field is required');
  updateError(errMsg);
}

// Keyboard navigation between radio options
const handleOptionKeyDown = (e: KeyboardEvent, idx: number) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault();
    const nextIdx = Math.min(props.field.options.length - 1, idx + 1);
    const nextVal = String(props.field.options[nextIdx].value);
    const err = validate(nextVal, 'change');
    updateError(err);
    emit('change', nextVal);
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault();
    const prevIdx = Math.max(0, idx - 1);
    const prevVal = String(props.field.options[prevIdx].value);
    const err = validate(prevVal, 'change');
    updateError(err);
    emit('change', prevVal);
  }
};

const handleChange = (e: Event) => {
  const nextValue = (e.target as HTMLInputElement).value;
  const err = validate(nextValue, "change");
  updateError(err);
  emit('change', nextValue);
};

const handleBlur = (e: Event) => {
  const err = validate((e.target as HTMLInputElement).value, "blur");
  updateError(err);
};

const containerStyle = computed<CSSProperties>(() => ({
  display: "flex",
  flexDirection: layout.value,
  flexWrap: layout.value === "row" ? "wrap" : "nowrap",
  gap: layout.value === "row" ? "12px" : "4px",
  alignItems: layout.value === "row" ? "center" : "stretch",
  width: "100%",
  padding: layout.value === "row" ? "8px" : undefined,
  boxSizing: "border-box",
}));

const labelStyle = computed<CSSProperties>(() => ({
  display: layout.value === "column" ? "flex" : "inline-flex",
  gap: "8px",
  alignItems: "center",
  whiteSpace: "nowrap",
  marginBottom: layout.value === "column" ? '6px' : 0,
  cursor: "pointer",
  width: layout.value === "column" ? "100%" : undefined,
  justifyContent: "flex-start",
}));
</script>

<template>
  <StandardFieldLayout :field="field" :error="error">
    <div
      :class="CSS_CLASSES.input"
      :aria-labelledby="`${field.name}-label`"
      :aria-invalid="!!error"
      :style="containerStyle"
    >
      <label
        v-for="(opt, idx) in field.options"
        :key="String(opt.value)"
        :class="combineClasses(CSS_CLASSES.label)"
        :style="labelStyle"
      >
        <input
          :id="`${field.name}-${opt.value}`"
          type="radio"
          :name="field.name"
          :value="String(opt.value)"
          :checked="String(value ?? '') === String(opt.value)"
          @change="handleChange"
          @blur="handleBlur"
          @keydown="(e) => handleOptionKeyDown(e, idx)"
          style="width: 1.1em; height: 1.1em;"
        />
        <span
          :style="{
            userSelect: 'none',
            textAlign: layout === 'column' ? 'left' : undefined,
            flex: layout === 'column' ? 1 : undefined,
            fontWeight: 400,
          }"
        >
          {{ t(opt.label) }}
        </span>
      </label>
    </div>
  </StandardFieldLayout>
</template>
