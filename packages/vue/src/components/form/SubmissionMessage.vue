<script setup lang="ts">
export interface SubmissionMessageProps {
  message: string | null;
  success: boolean | null;
  t: (s: string) => string;
}

const { message, success, t } = defineProps<SubmissionMessageProps>();

const emit = defineEmits<{
  dismiss: [];
}>();
</script>

<template>
  <div
    v-if="message"
    role="status"
    :style="{
      marginBottom: '12px',
      padding: '12px',
      borderRadius: '6px',
      backgroundColor: success
        ? 'rgba(76, 175, 80, 0.12)'
        : 'rgba(225, 29, 72, 0.06)',
      border: `1px solid ${success ? 'rgba(76,175,80,0.3)' : 'rgba(225,29,72,0.12)'}`,
      color: success ? 'var(--formitiva-success-color, #4CAF50)' : 'var(--formitiva-error-color, #e11d48)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }"
  >
    <div style="white-space: pre-wrap; flex: 1;">{{ message }}</div>
    <button
      @click="emit('dismiss')"
      :aria-label="t('Dismiss')"
      :style="{
        marginLeft: '12px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'inherit',
        fontSize: '16px',
        lineHeight: '1'
      }"
    >
      ×
    </button>
  </div>
</template>
