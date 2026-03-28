<script setup lang="ts">
/**
 * SubmitHandler.vue — Named Submit Handler Example
 */
import { ref, onUnmounted } from 'vue';
import { Formitiva } from '@formitiva/vue';
import { registerSubmissionHandler } from '@formitiva/vue';
import type { FormitivaDefinition, FormitivaInstance, FieldValueType, TranslationFunction } from '@formitiva/vue';

let _onSubmitted: ((instance: FormitivaInstance) => void) | null = null;

registerSubmissionHandler(
  'exampleSubmitHandler',
  (
    definition: FormitivaDefinition | Record<string, unknown>,
    instanceName: string | null,
    valuesMap: Record<string, FieldValueType | unknown>,
    _t: TranslationFunction
  ): string[] | undefined => {
    const newInstance: FormitivaInstance = {
      name: instanceName ?? 'unnamed',
      definition: (definition as FormitivaDefinition).name ?? '',
      version: (definition as FormitivaDefinition).version ?? '1.0.0',
      values: valuesMap as Record<string, FieldValueType>,
    };
    _onSubmitted?.(newInstance);
    return undefined;
  }
);

const definition = {
  name: 'submit_handler_app',
  version: '1.0.0',
  displayName: 'Submit Handler Example',
  submitHandlerName: 'exampleSubmitHandler',
  properties: [
    { name: 'firstName', displayName: 'First Name',              type: 'string',   defaultValue: '', required: true },
    { name: 'age',       displayName: 'Age',                     type: 'int',      defaultValue: 30, min: 0 },
    { name: 'subscribe', displayName: 'Subscribe to newsletter', type: 'checkbox', defaultValue: false },
  ],
};

const initialInstance: FormitivaInstance = {
  name: 'demoUser', version: '1.0.0', definition: 'submit_handler_app',
  values: { firstName: 'Alice', age: 28, subscribe: true },
};

const instance   = ref<FormitivaInstance>(initialInstance);
const serialised = ref('');

_onSubmitted = (newInstance) => {
  instance.value   = newInstance;
  serialised.value = JSON.stringify(newInstance, null, 2);
};

onUnmounted(() => { _onSubmitted = null; });
</script>

<template>
  <div class="page-content">
    <h2>Named Submit Handler</h2>
    <p class="desc">
      Call <code>registerSubmissionHandler(name, fn)</code> once, then reference the name via
      <code>submitHandlerName</code> in the definition. Formitiva invokes the handler on submit.
      The serialised instance is shown below after each submission.
    </p>

    <Formitiva
      :definition-data="definition"
      :instance="instance"
      theme="material"
    />

    <div v-if="serialised" class="result-box success">{{ serialised }}</div>
  </div>
</template>
