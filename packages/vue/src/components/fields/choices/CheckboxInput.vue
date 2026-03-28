<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from '@formitiva/core';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { CSS_CLASSES } from '@formitiva/core';
import { useFieldValidator } from "../../../hooks/useFieldValidator";

type CheckboxInputProps = BaseInputProps<boolean, DefinitionPropertyField>;

const props = withDefaults(defineProps<CheckboxInputProps>(), {
  value: false
});

const emit = defineEmits<{
  change: [value: boolean];
  error: [error: string | null];
}>();

const _ctx = useFormitivaContext();
const t = computed(() => _ctx.t);
const validate = useFieldValidator(props.field, props.error);
const error = ref<string | null>(null);
const prevError = ref<string | null>(null);

watch(() => props.value, (newValue) => {
  const err = validate(newValue, "sync");
  if (err !== prevError.value) {
    prevError.value = err;
    error.value = err;
    if (!props.error) {
      emit('error', err ?? null);
    }
  }
}, { immediate: true });

const updateError = (next: string | null) => {
  if (next !== prevError.value) {
    prevError.value = next;
    error.value = next;
    if (!props.error) {
      emit('error', next ?? null);
    }
  }
};

const handleChange = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked;
  updateError(validate(checked, "change"));
  emit('change', checked);
};

const handleKeyDown = (e: KeyboardEvent) => {
  const isSpace = e.key === " " || e.key === "Space" || e.key === "Spacebar" || e.code === "Space";
  if (isSpace || e.key === "Enter") {
    e.preventDefault();
    const next = !props.value;
    updateError(validate(next, "change"));
    emit('change', next);
  }
};

const handleBlur = (e: Event) => {
  updateError(validate((e.target as HTMLInputElement).checked, "blur"));
};

const inputId = props.field.name;
</script>

<template>
  <StandardFieldLayout :field="field" :right-align="false" :error="error">
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }"
    >
      <label
        :class="CSS_CLASSES.label"
        :for="inputId"
        :style="{ textAlign: 'left', justifyContent: 'flex-start' }"
      >
        {{ t(field.displayName) }}
      </label>

      <input
        :id="inputId"
        data-testid="boolean-checkbox"
        type="checkbox"
        :checked="value"
        @change="handleChange"
        @keydown="handleKeyDown"
        @blur="handleBlur"
        :aria-checked="value"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${field.name}-error` : undefined"
        :style="{
          cursor: 'pointer',
          margin: '8px 0',
          width: '1.2em',
          height: '1.2em',
          verticalAlign: 'middle',
          accentColor: '#0000FF',
        }"
      />
    </div>
  </StandardFieldLayout>
</template>
