<script setup lang="ts">
import { ref, computed } from 'vue';
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";
import useFormitivaContext from "../../../hooks/useFormitivaContext";

type PasswordInputProps = BaseInputProps<string, DefinitionPropertyField>;

const props = defineProps<PasswordInputProps>();

const emit = defineEmits<{
  change: [value: string];
  error: [error: string | null];
}>();

const _ctx = useFormitivaContext();
const t = computed(() => _ctx.t);
const validate = useFieldValidator(props.field, props.error);

const { inputRef, error, handleChange, handleBlur } = useUncontrolledValidatedInput({
  value: props.value,
  onChange: (val: string) => emit('change', val),
  onError: (err: string | null) => emit('error', err),
  validate,
});

const showPassword = ref(false);
const toggleShow = () => { showPassword.value = !showPassword.value; };

const handleBlurExplicit = () => {
  // call hook blur handler to keep internal state in sync
  try { handleBlur(); } catch {}
  const inputProxy = inputRef as unknown as { value?: { value?: string } } | undefined;
  const str = String(inputProxy?.value?.value ?? props.value ?? '');
  const err = validate(str, 'blur');
  emit('error', err ?? null);
};
</script>

<template>
  <StandardFieldLayout :field="field" :error="error">
    <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
      <input
        :id="field.name"
        :type="showPassword ? 'text' : 'password'"
        :defaultValue="String(value ?? '')"
        :ref="inputRef"
        @input="handleChange"
        @blur="handleBlurExplicit"
        :class="combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)"
        style="flex: 1; min-width: 0;"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${field.name}-error` : undefined"
      />
      <button
        type="button"
        @click="toggleShow"
        :aria-label="showPassword ? t('Hide password') : t('Show password')"
        style="background: transparent; border: none; cursor: pointer; font-size: 16px; line-height: 1; padding: 4px 6px; flex-shrink: 0;"
      >
        <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-8 1.02-2.35 2.77-4.28 4.78-5.54" />
          <path d="M1 1l22 22" />
          <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>
  </StandardFieldLayout>
</template>
