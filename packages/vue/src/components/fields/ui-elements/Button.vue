<script setup lang="ts">
import { ref, computed } from 'vue';
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
  FieldValueType,
  ErrorType,
} from '@formitiva/core';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { CSS_CLASSES } from '@formitiva/core';
import { getButtonHandler } from '@formitiva/core';

/**
 * Extended props for Button component
 * Unlike other fields, Button needs access to all form values
 * and the ability to change any field
 */
export interface ButtonInputProps extends BaseInputProps<null, DefinitionPropertyField> {
  valuesMap: Record<string, FieldValueType>;
  handleChange: (fieldName: string, value: FieldValueType) => void;
  handleError: (fieldName: string, error: ErrorType) => void;
}

const props = defineProps<ButtonInputProps>();

const _ctx = useFormitivaContext();
const t = computed(() => _ctx.t);
const isProcessing = ref(false);
const buttonError = ref<string | null>(null);

const handleClick = async () => {
  if (!props.field.action) {
    console.warn(`Button "${props.field.name}" has no action defined`);
    return;
  }

  const handler = getButtonHandler(props.field.action);
  if (!handler) {
    const errorMsg = `Button handler "${props.field.action}" not found`;
    console.error(errorMsg);
    buttonError.value = errorMsg;
    return;
  }

  isProcessing.value = true;
  buttonError.value = null;

  try {
    await handler(props.valuesMap, props.handleChange, props.handleError, t.value);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Button handler "${props.field.action}" failed:`, errorMsg);
    buttonError.value = errorMsg;
  } finally {
    isProcessing.value = false;
  }
};

// Determine alignment: left | center | right. Default to 'right' for backwards compatibility
const alignment = computed(() => (props.field.alignment || 'right') as 'left' | 'center' | 'right');

const buttonStyle = computed(() => {
  const style: Record<string, string | number> = {
    cursor: isProcessing.value ? 'wait' : 'pointer',
    opacity: isProcessing.value ? 0.6 : 1,
  };

  // Support flexible width: number => pixels, string => CSS size
  if (props.field.width) {
    if (typeof props.field.width === 'number') {
      if (props.field.width > 0) style.width = `${props.field.width}px`;
    } else if (typeof props.field.width === 'string' && (props.field.width as string).trim() !== '') {
      style.width = props.field.width as string;
    }
  }

  return style;
});

const buttonLabel = computed(() => props.field.buttonText || props.field.displayName);
const rightAlign = computed(() => alignment.value === 'right');
const justifyContent = computed(() => {
  if (alignment.value === 'right') return 'flex-end';
  if (alignment.value === 'center') return 'center';
  return 'flex-start';
});
</script>

<template>
  <StandardFieldLayout :field="field" :rightAlign="rightAlign" :error="buttonError">
    <div style="display: flex; width: 100%;" :style="{ justifyContent }">
      <button
        type="button"
        :class="CSS_CLASSES.button"
        @click="handleClick"
        :disabled="isProcessing || field.disabled"
        :aria-label="t(buttonLabel)"
        :aria-busy="isProcessing"
        :style="buttonStyle"
      >
        {{ isProcessing ? t("Processing...") : t(buttonLabel) }}
      </button>
    </div>
  </StandardFieldLayout>
</template>
