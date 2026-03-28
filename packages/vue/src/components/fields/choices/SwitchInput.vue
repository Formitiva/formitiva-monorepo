<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { CSSProperties, StyleValue } from 'vue';
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from '@formitiva/core';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { CSS_CLASSES } from '@formitiva/core';
import { useFieldValidator } from "../../../hooks/useFieldValidator";

type SwitchInputProps = BaseInputProps<boolean, DefinitionPropertyField>;

const props = defineProps<SwitchInputProps>();

const emit = defineEmits<{
  change: [value: boolean];
  error: [error: string | null];
}>();

const _ctx = useFormitivaContext();
const t = computed(() => _ctx.t);
const validate = useFieldValidator(props.field, props.error);
const error = ref<string | null>(null);
const prevError = ref<string | null>(null);

const updateError = (next: string | null) => {
  if (next !== prevError.value) {
    prevError.value = next;
    error.value = next;
    emit('error', next ?? null);
  }
};

watch(() => props.value, (newValue) => {
  updateError(validate(Boolean(newValue), "sync"));
}, { immediate: true });

const fs = computed(() => _ctx.formStyle as Record<string, unknown> | undefined);
const ffs = computed(() => _ctx.fieldStyle as Record<string, unknown> | undefined);

const styleFrom = (
  source: Record<string, unknown> | undefined,
  section?: string,
  key?: string
): StyleValue => {
  if (!section) return {} as StyleValue;
  const sec = source?.[section] as Record<string, unknown> | undefined;
  const val = key && sec ? (sec[key] as StyleValue | undefined) : undefined;
  return (val ?? {}) as StyleValue;
};

const mergeStyle = (a: StyleValue, b: StyleValue | undefined): StyleValue => {
  if (Array.isArray(a) || Array.isArray(b)) {
    const arrA = Array.isArray(a) ? a : [a];
    const arrB = Array.isArray(b) ? b : (b !== undefined ? [b] : []);
    return [...arrA, ...arrB];
  }
  const objA = (a || {}) as Record<string, unknown>;
  const objB = (b || {}) as Record<string, unknown>;
  return Object.assign({}, objA, objB) as StyleValue;
};

const labelStyle = computed<StyleValue>(() => {
  const base = {
    display: 'inline-block',
    position: 'relative',
    width: '44px',
    height: '24px',
  } as CSSProperties;
  return mergeStyle(mergeStyle(base, styleFrom(fs.value, 'switch', 'label')), styleFrom(ffs.value, undefined, 'label'));
});

const hiddenInputStyle = computed<StyleValue>(() => {
  const base = {
    position: 'absolute',
    opacity: 0,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    cursor: 'pointer',
  } as CSSProperties;
  return mergeStyle(mergeStyle(base, styleFrom(fs.value, 'switch', 'hiddenInput')), styleFrom(ffs.value, undefined, 'hiddenInput'));
});

const sliderBaseStyle = computed<StyleValue>(() => {
  const base = {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'var(--formitiva-switch-off-bg, #ccc)',
    transition: '0.3s',
    borderRadius: '24px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'transparent',
  } as CSSProperties;
  return mergeStyle(mergeStyle(base, styleFrom(fs.value, 'switch', 'slider')), styleFrom(ffs.value, undefined, 'slider'));
});

const knobBaseStyle = computed<StyleValue>(() => {
  const base = {
    position: 'absolute',
    height: '16px',
    width: '16px',
    left: '2px',
    bottom: '2px',
    backgroundColor: 'white',
    transition: '0.3s',
    borderRadius: '50%',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
  } as CSSProperties;
  return mergeStyle(mergeStyle(base, styleFrom(fs.value, 'switch', 'knob')), styleFrom(ffs.value, undefined, 'knob'));
});

const activeSliderStyle = computed<StyleValue>(() => {
  const overrides = {
    backgroundColor: 'var(--formitiva-switch-on-bg, #22c55e)',
    borderColor: 'var(--formitiva-switch-on-border, #16a34a)',
  } as CSSProperties;
  return isOn.value ? mergeStyle(sliderBaseStyle.value, overrides) : sliderBaseStyle.value;
});

const knobStyle = computed<StyleValue>(() =>
  mergeStyle(knobBaseStyle.value, { transform: isOn.value ? 'translateX(20px)' : undefined } as CSSProperties)
);

const isOn = computed(() => Boolean(props.value));

const handleToggle = () => {
  const newVal = !isOn.value;
  updateError(validate(newVal, "change"));
  emit('change', newVal);
};

const handleBlur = () => {
  updateError(validate(isOn.value, "blur"));
};

const onLabelClick = (e?: Event) => {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }
  handleToggle();
  const id = props.field?.name;
  if (id && typeof document !== 'undefined') {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.focus();
  }
};
</script>

<template>
  <StandardFieldLayout :field="field" :error="error" :right-align="false">
    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
      <label
        :class="CSS_CLASSES.label"
        :for="field.name"
        style="text-align: left; justify-content: flex-start; cursor: pointer;"
        @click.prevent="onLabelClick"
        @keydown.space.prevent="onLabelClick"
        @keydown.enter.prevent="onLabelClick"
      >
        {{ t(field.displayName) }}
      </label>
      <label
        :style="labelStyle"
        @mousedown.prevent
        @click="handleToggle"
      >
        <input
          :id="field.name"
          type="checkbox"
          :checked="isOn"
          :aria-label="t(field.displayName)"
          role="switch"
          :aria-invalid="!!error"
          :aria-describedby="error ? `${field.name}-error` : undefined"
          :style="hiddenInputStyle"
          tabindex="0"
          @change="handleToggle"
          @keydown.space.prevent="handleToggle"
          @keydown.enter.prevent="handleToggle"
        />
        <span
          role="switch"
          data-testid="switch"
          tabindex="0"
          :aria-checked="isOn"
          :aria-invalid="!!error"
          :aria-describedby="error ? `${field.name}-error` : undefined"
          @blur="handleBlur"
          @keydown.space.prevent="handleToggle"
          @keydown.enter.prevent="handleToggle"
          :class="`formitiva-switch ${isOn ? 'active checked on' : ''}`"
          :style="activeSliderStyle"
        >
          <span :style="knobStyle" />
        </span>
      </label>
    </div>
  </StandardFieldLayout>
</template>
