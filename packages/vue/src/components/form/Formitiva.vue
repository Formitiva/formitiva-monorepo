<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import FormitivaRenderer from './FormitivaRenderer.vue';
import FormitivaProvider from './FormitivaProvider.vue';
import { createInstanceFromDefinition } from '@formitiva/core';
import type { FormitivaDefinition, FormitivaProps } from '@formitiva/core';

const props = withDefaults(defineProps<FormitivaProps>(), {
  language: 'en',
  theme: undefined,
  className: '',
  style: () => ({}),
  fieldValidationMode: 'onEdit',
  displayInstanceName: true,
  onSubmit: undefined,
  onValidation: undefined,
});

const detectedTheme = ref<string | null>(null);
let mutationObserver: MutationObserver | null = null;

const definition = computed<FormitivaDefinition | null>(() => {
  try {
    return typeof props.definitionData === 'string' 
      ? JSON.parse(props.definitionData) 
      : (props.definitionData ?? null);
  } catch (e) {
    console.error('[Formitiva] Failed to parse definitionData:', e);
    return null;
  }
});

const inputStyle = computed(() => ({
  fontSize: "inherit",
  fontFamily: "inherit",
  ...props.style
}));

const inputTheme = computed(() => props.theme ?? detectedTheme.value ?? 'light');
const inputLanguage = computed(() => props.language ?? 'en');

const resolvedInstance = computed(() => {
  if (props.instance) return props.instance;
  if (!definition.value) return null;

  const created = createInstanceFromDefinition(definition.value, definition.value.name);
  if (!created.success || !created.instance) {
    return null;
  }
  return created.instance;
});

// Theme detection
onMounted(() => {
  const startEl = document.querySelector('[data-formitiva-theme]');
  if (startEl) {
    const themedNode = startEl.closest('[data-formitiva-theme]') as Element | null;
    if (themedNode) {
      const read = () => {
        detectedTheme.value = themedNode.getAttribute('data-formitiva-theme');
      };
      read();

      mutationObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === 'attributes' && m.attributeName === 'data-formitiva-theme') {
            read();
          }
        }
      });
      mutationObserver.observe(themedNode, { 
        attributes: true, 
        attributeFilter: ['data-formitiva-theme'] 
      });
    }
  }

  // Add popup-root div if not already present
  let root = document.getElementById('popup-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'popup-root';
    document.body.appendChild(root);
  }
});

onUnmounted(() => {
  if (mutationObserver) {
    mutationObserver.disconnect();
  }
});
</script>

<template>
  <div v-if="!definition" style="color: red">
    Error: No form definition provided.
  </div>
  <div v-else-if="!resolvedInstance" style="color: red">
    Error: Failed to create instance from definition.
  </div>
  <FormitivaProvider
    v-else
    :definition-name="definition.name"
    :default-style="inputStyle"
    :default-language="inputLanguage"
    :default-theme="inputTheme"
    :default-localize-name="definition.localization || ''"
    :class-name="props.className || undefined"
    :default-field-validation-mode="props.fieldValidationMode"
    :default-display-instance-name="props.displayInstanceName"
    :on-submit="props.onSubmit"
    :on-validation="props.onValidation"
  >
    <FormitivaRenderer
      :definition="definition"
      :instance="resolvedInstance"
      :on-submit="onSubmit"
      :on-validation="onValidation"
    />
  </FormitivaProvider>
</template>
