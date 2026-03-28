<script setup lang="ts">
/**
 * Point2DInput.vue — Custom Field Component for point2d type
 */
import { computed } from 'vue';
import { StandardFieldLayout } from '@formitiva/vue';
import type { DefinitionPropertyField, FieldValueType } from '@formitiva/vue';

const props = defineProps<{
  field: DefinitionPropertyField;
  value?: FieldValueType;
  error?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  change: [value: FieldValueType];
}>();

const xVal = computed(() => Array.isArray(props.value) ? String(props.value[0] ?? '') : '');
const yVal = computed(() => Array.isArray(props.value) ? String(props.value[1] ?? '') : '');

function emitUpdate(newX: string, newY: string) {
  emit('change', [newX, newY] as unknown as FieldValueType);
}
</script>

<template>
  <StandardFieldLayout :field="field" :error="error">
    <div class="point2d-inputs">
      <label>X:</label>
      <input
        type="number"
        :value="xVal"
        :disabled="disabled"
        @blur="(e) => emitUpdate((e.target as HTMLInputElement).value, yVal)"
      />
      <label>Y:</label>
      <input
        type="number"
        :value="yVal"
        :disabled="disabled"
        @blur="(e) => emitUpdate(xVal, (e.target as HTMLInputElement).value)"
      />
    </div>
  </StandardFieldLayout>
</template>

<style scoped>
.point2d-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.point2d-inputs label {
  font-size: 0.82rem;
  color: #666;
  min-width: 16px;
}
.point2d-inputs input {
  width: 90px;
  padding: 6px 8px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s;
}
.point2d-inputs input:focus {
  border-color: #6c63ff;
}
</style>
