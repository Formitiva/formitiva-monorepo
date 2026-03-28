<script setup lang="ts">
import { computed } from 'vue';
import useFormitivaContext from "../../hooks/useFormitivaContext";
import { CSS_CLASSES } from '@formitiva/core';
import Tooltip from "../fields/base/Tooltip.vue";
import type { DefinitionPropertyField } from '@formitiva/core';
import ErrorDiv from './ErrorDiv.vue';

export interface Props {
  field: DefinitionPropertyField;
  error?: string | null;
  rightAlign?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  rightAlign: false
});

const _ctx = useFormitivaContext();
const t = computed(() => _ctx.t);

const valueRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '3px',
};
</script>

<template>
  <div :class="`${CSS_CLASSES.field} row-layout`">
    <label
      :id="`${props.field.name}-label`"
      :class="CSS_CLASSES.label"
      :for="props.field.name"
      style="text-align: left;"
    >
      {{ t(props.field.displayName) }}
    </label>

    <div>
      <div :style="valueRowStyle">
        <div v-if="props.rightAlign" style="display: flex; flex: 1; justify-content: flex-end;">
          <slot />
        </div>
        <slot v-else />
        <Tooltip v-if="props.field.tooltip" :content="props.field.tooltip" />
      </div>

      <ErrorDiv v-if="props.error" :id="`${props.field.name}-error`">
        {{ props.error }}
      </ErrorDiv>
    </div>
  </div>
</template>
