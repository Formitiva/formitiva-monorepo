<script setup lang="ts">
import type { CSSProperties } from 'vue';

export interface Props {
  id?: string;
}

const { id } = defineProps<Props>();

const style: CSSProperties = {
  color: 'var(--formitiva-error-color, red)',
  fontSize: '13px',
  marginTop: '4px',
  fontWeight: 'var(--formitiva-font-weight)',
  display: "flex",
  flex: 1,
  justifyContent: "flex-start",
  alignItems: "flex-start",
  userSelect: "none",
};
</script>

<template>
  <div :id="id" :style="style">
    <slot />
  </div>
</template>
