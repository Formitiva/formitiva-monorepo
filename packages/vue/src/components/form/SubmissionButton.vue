<script setup lang="ts">
export interface SubmissionButtonProps {
  disabled?: boolean;
  t: (s: string) => string;
}

const props = withDefaults(defineProps<SubmissionButtonProps>(), { disabled: false });
const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <button
    :disabled="props.disabled"
    @click="emit('click')"
    class="formitiva-button formitiva-submit-button"
  >
    {{ props.t("Submit") }}
  </button>
</template>
