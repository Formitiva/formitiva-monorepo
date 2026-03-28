<script setup lang="ts">
import { computed } from 'vue';
import ColumnFieldLayout from './ColumnFieldLayout.vue';
import RowFieldLayout from './RowFieldLayout.vue';
import type { DefinitionPropertyField } from '@formitiva/core';

export interface Props {
  field: DefinitionPropertyField;
  error?: string | null;
  rightAlign?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  rightAlign: false
});

const useColumnLayout = computed(() => 
  props.field.labelLayout === 'column-left' || 
  props.field.labelLayout === 'column-center' ||
  props.field.type === 'checkbox' ||
  props.field.type === 'switch'
);

const showLabel = computed(() => 
  !(props.field.type === 'checkbox' || props.field.type === 'switch')
);
</script>

<template>
  <ColumnFieldLayout
    v-if="useColumnLayout"
    :field="field"
    :error="error"
    :show-label="showLabel"
  >
    <slot />
  </ColumnFieldLayout>
  <RowFieldLayout
    v-else
    :field="field"
    :error="error"
    :right-align="rightAlign"
  >
    <slot />
  </RowFieldLayout>
</template>
