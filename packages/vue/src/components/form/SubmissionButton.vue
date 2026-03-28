<script setup lang="ts">
import { ref } from 'vue';

export interface SubmissionButtonProps {
  disabled?: boolean;
  t: (s: string) => string;
}

const props = withDefaults(defineProps<SubmissionButtonProps>(), {
  disabled: false
});

const emit = defineEmits<{
  click: [];
}>();

const hover = ref(false);
</script>

<template>
  <button
    :disabled="props.disabled"
    @click="emit('click')"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    :style="{
      padding: 'var(--formitiva-button-padding, var(--formitiva-space) 12px)',
      backgroundColor: disabled
        ? 'var(--formitiva-button-disabled-bg, #cccccc)'
        : 'var(--formitiva-button-bg, var(--formitiva-success-color))',
      color: 'var(--formitiva-button-text, #ffffff)',
      border: 'none',
      borderRadius: '4px',
      cursor: disabled ? 'var(--formitiva-button-disabled-cursor, not-allowed)' : 'pointer',
      fontSize: 'var(--formitiva-button-font-size, 14px)',
      fontWeight: 'var(--formitiva-button-font-weight, 500)',
      boxShadow: 'var(--formitiva-button-shadow, none)',
      marginTop: 'var(--formitiva-button-margin-top, 0.5em)',
      transition: 'opacity 0.2s ease',
      opacity: disabled
        ? 'var(--formitiva-button-disabled-opacity, 0.6)'
        : hover
        ? 'var(--formitiva-button-hover-opacity, 0.9)'
        : '1',
    }"
  >
    {{ props.t("Submit") }}
  </button>
</template>
