<script setup lang="ts">
import { ref, computed, watch, watchEffect, reactive } from 'vue';
import { provideFormitivaContext } from '../../hooks/useFormitivaContext';
import type { FieldValidationMode, FormitivaProviderProps, FormitivaContextType } from '@formitiva/core';
import {
  loadTranslationMaps,
  createTranslationFunction,
  buildFormStyle,
  buildFieldStyle,
  type TranslationMap
} from '@formitiva/core';
import { registerBaseComponents } from '../../core/registries/componentRegistry';
import { ensureBuiltinFieldTypeValidatorsRegistered } from '@formitiva/core';

// Import CSS variables if needed
import '@formitiva/core/styles/formitiva.css';

registerBaseComponents();
ensureBuiltinFieldTypeValidatorsRegistered();

interface Props extends Omit<FormitivaProviderProps, 'children'> {
  defaultLanguage?: string;
  defaultTheme?: string;
  defaultLocalizeName?: string;
  className?: string;
  defaultDisplayInstanceName?: boolean;
  defaultFieldValidationMode?: FieldValidationMode;
}

const props = withDefaults(defineProps<Props>(), {
  definitionName: '',
  defaultStyle: () => ({}),
  defaultLanguage: 'en',
  defaultTheme: 'light',
  defaultLocalizeName: '',
  defaultFieldValidationMode: 'onEdit',
  className: 'formitiva-container',
  defaultDisplayInstanceName: true
});

const commonMapState = ref<TranslationMap>({});
const userMapState = ref<TranslationMap>({});

// Initialize form and field style
const formStyle = computed(() => buildFormStyle(props.defaultStyle));
const fieldStyle = computed(() => buildFieldStyle(props.defaultStyle));

// Memoize the underlying translation function
const translationFn = computed(() => 
  createTranslationFunction(props.defaultLanguage, commonMapState.value, userMapState.value)
);

// Load translations
watch([() => props.defaultLanguage, () => props.defaultLocalizeName], async ([language, localizeName]) => {
  const maps = await loadTranslationMaps(language, localizeName);
  commonMapState.value = maps.commonMap;
  userMapState.value = maps.userMap;
}, { immediate: true });

// Provide context
const contextValue = computed(() => ({
  definitionName: props.definitionName,
  language: props.defaultLanguage,
  theme: props.defaultTheme,
  formStyle: formStyle.value,
  fieldStyle: fieldStyle.value,
  t: translationFn.value,
  fieldValidationMode: props.defaultFieldValidationMode,
  displayInstanceName: props.defaultDisplayInstanceName
}));

// Provide a reactive object once during setup and keep it in sync with contextValue.
const providedContext = reactive({ ...(contextValue.value as Record<string, unknown>) }) as unknown as FormitivaContextType;
provideFormitivaContext(providedContext);
watchEffect(() => {
  Object.assign(providedContext, contextValue.value as unknown as Record<string, unknown>);
});

const wrapperStyle = computed(() => 
  props.defaultStyle?.height ? { height: '100%' } : undefined
);
</script>

<template>
  <div
    :data-formitiva-theme="props.defaultTheme"
    :class="props.className"
    :style="wrapperStyle"
  >
    <slot />
  </div>
</template>
