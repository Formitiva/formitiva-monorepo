<script setup lang="ts">
/**
 * Validation.vue — Form Validation Example
 */
import { ref } from 'vue';
import { Formitiva, registerPlugin } from '@formitiva/vue';
import type { FormitivaPlugin, FormValidationHandler, FormSubmissionHandler } from '@formitiva/vue';

const rangeValidator: FormValidationHandler = (valuesMap, t) => {
  const lower = Number(valuesMap['lowerLimit'] ?? NaN);
  const upper = Number(valuesMap['upperLimit'] ?? NaN);
  if (Number.isNaN(lower) || Number.isNaN(upper)) return undefined;
  if (!(lower < upper)) return [t('Lower Limit must be less than Upper Limit.')];
  return undefined;
};

const ValidationDemoPlugin: FormitivaPlugin = {
  name: 'validation-demo-plugin',
  version: '1.0.0',
  formValidators: { rangeValidator },
};
registerPlugin(ValidationDemoPlugin, { conflictResolution: 'skip' });

const definition = {
  name: 'rangeForm',
  version: '1.0.0',
  displayName: 'Range Validation Demo',
  validatorRef: 'rangeValidator',
  properties: [
    { name: 'lowerLimit', displayName: 'Lower Limit', type: 'int', defaultValue: 0 },
    { name: 'upperLimit', displayName: 'Upper Limit', type: 'int', defaultValue: 10 },
    {
      name: 'description', displayName: 'Instructions', type: 'description', defaultValue: '',
      displayText: '<b>Instructions:</b><br/><br/>This form demonstrates custom cross-field validation.<br/><br/>Rule: <em>Lower Limit</em> must be strictly less than <em>Upper Limit</em>.<br/><br/>Try setting Lower Limit ≥ Upper Limit and submitting — an error will appear.',
      allowHtml: true,
    },
  ],
};

const lastResult = ref('');
const isError    = ref(false);

const handleSubmit: FormSubmissionHandler = (_def, _instanceName, values, _t) => {
  isError.value = false;
  lastResult.value = `Submitted successfully!\n\n${JSON.stringify(values, null, 2)}`;
  return undefined;
};
</script>

<template>
  <div class="page-content">
    <h2>Form Validation</h2>
    <p class="desc">
      Use a <code>FormitivaPlugin</code> with a <code>formValidators</code> map,
      then reference the validator name via <code>validatorRef</code> in the definition.
      The validator receives all field values and returns an array of error strings (or
      <code>undefined</code> for no errors).
    </p>

    <Formitiva
      :definition-data="definition"
      :on-submit="handleSubmit"
      :display-instance-name="false"
      field-validation-mode="onSubmission"
    />

    <div v-if="lastResult" class="result-box" :class="{ success: !isError, error: isError }">
      {{ lastResult }}
    </div>
  </div>
</template>
