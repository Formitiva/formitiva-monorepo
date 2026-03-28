<script setup lang="ts">
import { computed } from 'vue';
import type { DefinitionPropertyField, FieldValueType, ErrorType } from '@formitiva/core';
import { getComponent } from "../../core/registries/componentRegistry";

export interface FieldRendererProps {
  field: DefinitionPropertyField;
  valuesMap: Record<string, FieldValueType>;
  handleChange: (fieldName: string, value: FieldValueType) => void;
  handleError?: (fieldName: string, error: ErrorType) => void;
  errorsMap?: Record<string, string>;
}

const props = defineProps<FieldRendererProps>();

const Component = computed(() => getComponent(props.field.type));
const value = computed(() => props.valuesMap[props.field.name]);
const fieldError = computed(() => props.errorsMap ? props.errorsMap[props.field.name] ?? null : undefined);
const isDisabled = computed(() => Boolean(props.field.disabled));

const onChange = (v: FieldValueType) => props.handleChange(props.field.name, v);
const onError = (err: ErrorType) => props.handleError?.(props.field.name, err);
</script>

<template>
  <div
    v-if="Component"
    :aria-disabled="isDisabled"
    :style="isDisabled ? { opacity: 0.6, pointerEvents: 'none' } : undefined"
  >
    <component
      v-if="field.type === 'button'"
      :is="Component"
      :field="field"
      :value="null"
      :disabled="isDisabled"
      :valuesMap="valuesMap"
      :handleChange="handleChange"
      :handleError="handleError || (() => {})"
    />
    <component
      v-else
      :is="Component"
      :field="field"
      :value="value"
      :disabled="isDisabled"
      @change="onChange"
      @error="onError"
      :error="fieldError"
    />
  </div>
</template>
