<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';
import useFormitivaContext from "../../hooks/useFormitivaContext";
import { CSS_CLASSES } from '@formitiva/core';
import Tooltip from "../fields/base/Tooltip.vue";
import type { DefinitionPropertyField } from '@formitiva/core';
import ErrorDiv from './ErrorDiv.vue';

export interface Props {
  field: DefinitionPropertyField;
  error?: string | null;
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true
});

const _ctx = useFormitivaContext();
const t = computed(() => _ctx.t);

const labelAlignment = computed(() => 
  props.field.labelLayout === 'column-center' ? 'center' : 'left'
);

const rootStyle = computed(() => {
  const s = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--formitiva-label-gap, 4px)',
    ['--label-align']: labelAlignment.value,
  } as unknown as CSSProperties;
  return s;
});

const labelStyle = computed(() => {
  return {
    textAlign: labelAlignment.value as unknown as CSSProperties['textAlign'],
    width: '100%',
    minWidth: 'unset',
    display: 'block',
    marginBottom: '10px',
  } as CSSProperties;
});

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--formitiva-inline-gap, 8px)',
  width: '100%',
};
</script>

<template>
  <div :class="`${CSS_CLASSES.field} column-layout`" :style="rootStyle">
    <label
      v-if="showLabel"
      :id="`${field.name}-label`"
      :class="CSS_CLASSES.label"
      :for="field.name"
      :style="labelStyle"
    >
      {{ t(field.displayName) }}
    </label>

    <div :style="rowStyle">
      <div style="flex: 1; min-width: 0;">
        <slot />
      </div>
      <Tooltip v-if="field.tooltip" :content="field.tooltip" />
    </div>

    <ErrorDiv v-if="error" :id="`${field.name}-error`">
      {{ error }}
    </ErrorDiv>
  </div>
</template>
