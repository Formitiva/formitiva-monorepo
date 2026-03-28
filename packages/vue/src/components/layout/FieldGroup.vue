<script setup lang="ts">
import { ref } from 'vue';
import type { DefinitionPropertyField, FieldValueType, ErrorType } from '@formitiva/core';
import FieldRenderer from "./FieldRenderer.vue";

export interface FieldGroupProps {
  groupName: string;
  defaultOpen?: boolean;
  fields: DefinitionPropertyField[];
  valuesMap: Record<string, FieldValueType>;
  handleChange: (fieldName: string, value: FieldValueType) => void;
  handleError?: (fieldName: string, error: ErrorType) => void;
  errorsMap?: Record<string, string>;
  t: (key: string) => string;
}

const props = withDefaults(defineProps<FieldGroupProps>(), {
  defaultOpen: true
});

const isOpen = ref(props.defaultOpen);
const onToggle = () => { isOpen.value = !isOpen.value; };
</script>

<template>
  <fieldset class="formitiva-group">
    <legend @click="onToggle" class="formitiva-group_legend">
      <span>{{ t(groupName) }}</span>
      <span class="formitiva-group_legend_arrow">{{ isOpen ? "\u25BC" : "\u25B6" }}</span>
    </legend>
    <template v-if="isOpen">
      <FieldRenderer
        v-for="field in fields"
        :key="field.name"
        :field="field"
        :valuesMap="valuesMap"
        :handleChange="handleChange"
        :handleError="handleError"
        :errorsMap="errorsMap"
      />
    </template>
  </fieldset>
</template>
