<script setup lang="ts">
import { ref, computed, watch, watchEffect, reactive } from 'vue';
import { provideFormitivaContext } from '../../hooks/useFormitivaContext';
import type { FieldValidationMode, FormitivaProviderProps, FormitivaContextType } from '@formitiva/core';
import {
  loadCommonTranslation,
  loadUserTranslation,
  createTranslationFunction,
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

// Local copies of style generators
const getFormStyle = (style: Record<string, unknown> | undefined): Record<string, Record<string, unknown>> => {
  return {
    container: {
      padding: "var(--formitiva-space-sm, 8px)",
      margin: "0 auto",
      backgroundColor: "transparent",
      borderRadius: 0,
      color: "var(--formitiva-color-text)",
      fontFamily: style?.fontFamily || "var(--formitiva-font-family, system-ui, -apple-system, sans-serif)",
      boxSizing: "border-box",
      minHeight: style?.minHeight ?? "0",
      ...(style?.width ? { width: style.width, overflowX: "auto" } : { maxWidth: "100%" }),
      ...(style?.height ? { height: style.height, overflowY: "auto" } : {}),
    },
    buttonStyle: {
      padding: "var(--formitiva-space-sm, 8px) var(--formitiva-space-md, 16px)",
      backgroundColor: "var(--formitiva-color-primary)",
      color: "var(--formitiva-color-background)",
      border: "1px solid var(--formitiva-color-primary)",
      borderRadius: "var(--formitiva-border-radius, 6px)",
      cursor: "pointer",
      fontSize: style?.fontSize || "1rem",
      fontWeight: "600",
      transition: "all 0.2s ease",
      boxShadow: "var(--formitiva-shadow-small, 0 1px 3px rgba(0, 0, 0, 0.12))",
    },
    titleStyle: {
      marginBottom: "var(--formitiva-space-lg, 24px)",
      color: "var(--formitiva-color-text)",
      fontSize: typeof style?.fontSize === "number" ? `${style.fontSize * 1.5}px` : "1.5rem",
      fontWeight: "700",
      lineHeight: "1.2",
      textAlign: "left",
    },
  };
};

const getFieldStyle = (style: Record<string, unknown> | undefined): Record<string, Record<string, unknown>> => {
  const baseInputStyle = {
    color: "var(--formitiva-color-text)",
    fontFamily: (style as Record<string, unknown>)?.fontFamily as string || "var(--formitiva-font-family, inherit)",
    transition: "all 0.2s ease",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };
  return {
    container: {
      fontFamily: style?.fontFamily || "var(--formitiva-font-family, inherit)",
      fontSize: style?.fontSize || "var(--formitiva-font-size, 1rem)",
      width: "100%",
      maxWidth: style?.width || "100%",
      marginBottom: "var(--formitiva-space-md, 16px)",
    },
    label: {
      display: "block",
      marginBottom: "var(--formitiva-space-xs, 4px)",
      fontWeight: "500",
      color: "var(--formitiva-color-text)",
      fontSize: "var(--formitiva-font-size, 1rem)",
      fontFamily: style?.fontFamily || "var(--formitiva-font-family, inherit)",
    },
    input: baseInputStyle,
    textInput: baseInputStyle,
    optionInput: baseInputStyle,
    select: {
      ...baseInputStyle,
      cursor: "pointer",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 8px center",
      backgroundSize: "16px",
      paddingRight: "32px",
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6,9 12,15 18,9'/></svg>")`,
    },
    textarea: {
      ...baseInputStyle,
      minHeight: "80px",
      resize: "vertical",
      paddingTop: "var(--formitiva-space-sm, 8px)",
    },
    error: {
      color: "var(--formitiva-color-error)",
      fontSize: "0.875rem",
      marginTop: "var(--formitiva-space-xs, 4px)",
      display: "block",
    },
  };
};

// Initialize form and field style
const formStyle = computed(() => getFormStyle(props.defaultStyle));
const fieldStyle = computed(() => getFieldStyle(props.defaultStyle));

// Memoize the underlying translation function
const translationFn = computed(() => 
  createTranslationFunction(props.defaultLanguage, commonMapState.value, userMapState.value)
);

// Load translations
watch([() => props.defaultLanguage, () => props.defaultLocalizeName], async ([language, localizeName]) => {
  if (language === 'en') {
    commonMapState.value = {};
    userMapState.value = {};
    return;
  }

  try {
    const commonResult = await loadCommonTranslation(language);
    commonMapState.value = commonResult.success ? commonResult.translations : {};

    const userResult = await loadUserTranslation(language, localizeName);
    userMapState.value = userResult.success ? userResult.translations : {};
  } catch {
    commonMapState.value = {};
    userMapState.value = {};
  }
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
