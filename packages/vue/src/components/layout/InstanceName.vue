<script setup lang="ts">
import { computed } from 'vue';
import useFormitivaContext from "../../hooks/useFormitivaContext";
import { combineClasses, CSS_CLASSES } from '@formitiva/core';

export interface Props {
  name: string;
}

const { name } = defineProps<Props>();

const emit = defineEmits<{
  change: [name: string];
}>();

const _ctx = useFormitivaContext();
const t = computed(() => _ctx.t);
</script>

<template>
  <div style="margin-bottom: 16px;">
    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px; align-items: center;">
      <label
        for="instance-name-input"
        style="margin: 0; font-size: 0.95em; font-weight: 500; color: var(--formitiva-text-color, #333);"
      >
        {{ t('Instance Name') }}
      </label>
      <input
        id="instance-name-input"
        type="text"
        :value="name"
        :class="combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)"
        @input="emit('change', ($event.target as HTMLInputElement).value)"
        :placeholder="t('Enter instance name')"
      />
    </div>
    <div style="height: 1px; background-color: var(--formitiva-separator, #e6e6e6); margin-top: 12px; margin-bottom: 12px;" />
  </div>
</template>
