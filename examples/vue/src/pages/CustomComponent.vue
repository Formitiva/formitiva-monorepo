<script setup lang="ts">
/**
 * CustomComponent.vue — Custom Field Component Registration Example
 */
import { ref } from 'vue';
import { Formitiva } from '@formitiva/vue';
import {
  registerComponent,
  registerFieldValidator,
  registerFormValidator,
  registerTypeValidator,
} from '@formitiva/vue';
import type {
  FormSubmissionHandler,
  FormValidationHandler,
  FieldValueType,
  TranslationFunction,
  DefinitionPropertyField,
} from '@formitiva/vue';
import Point2DInput from './Point2DInput.vue';

registerComponent('point2d', Point2DInput);

registerTypeValidator(
  'point2d',
  (_field: DefinitionPropertyField, input: FieldValueType, t: TranslationFunction) => {
    if (!Array.isArray(input) || input.length !== 2) return t('Value must be a 2D point [x, y]');
    const [x, y] = input;
    if (!Number.isFinite(Number(x))) return t('X must be a valid number');
    if (!Number.isFinite(Number(y))) return t('Y must be a valid number');
    return undefined;
  }
);

registerFieldValidator(
  'point2d', 'nonNegativePoint',
  (_fieldName: string, value: FieldValueType | unknown, t: TranslationFunction) => {
    const [x, y] = value as [unknown, unknown];
    if (Number(x) < 0) return t('X must be ≥ 0');
    if (Number(y) < 0) return t('Y must be ≥ 0');
    return undefined;
  }
);

const regionValidator: FormValidationHandler = (valuesMap, t) => {
  const p1 = valuesMap['pos2d_1'] as [unknown, unknown] | undefined;
  const p2 = valuesMap['pos2d_2'] as [unknown, unknown] | undefined;
  const errors: string[] = [];
  if (Number(p1?.[0]) > Number(p2?.[0])) errors.push(t('Top-Left X must be ≤ Bottom-Right X'));
  if (Number(p1?.[1]) > Number(p2?.[1])) errors.push(t('Top-Left Y must be ≤ Bottom-Right Y'));
  return errors.length > 0 ? errors : undefined;
};

registerFormValidator('point2d:regionValidator', regionValidator);

const definition = {
  name: 'RectangleRegion',
  displayName: 'Rectangle Region',
  version: '1.0.0',
  validatorRef: 'point2d:regionValidator',
  properties: [
    { type: 'point2d', name: 'pos2d_1', displayName: 'Top-Left Position',     defaultValue: ['0', '0'],     required: true, validatorRef: ['point2d', 'nonNegativePoint'] },
    { type: 'point2d', name: 'pos2d_2', displayName: 'Bottom-Right Position', defaultValue: ['100', '100'], required: true },
    { name: 'submitBtn', displayName: 'Save Region', type: 'button', action: 'submit' },
  ],
};

const initialInstance = {
  name: 'region1', version: '1.0.0', definition: 'RectangleRegion',
  values: { pos2d_1: ['10', '20'], pos2d_2: ['100', '200'] },
};

const lastSubmission = ref('');

const handleSubmit: FormSubmissionHandler = (_def, _instanceName, values, _t) => {
  lastSubmission.value = JSON.stringify(values, null, 2);
  return undefined;
};
</script>

<template>
  <div class="page-content">
    <h2>Custom Field Component</h2>
    <p class="desc">
      Create a custom Vue component, then call <code>registerComponent('point2d', MyComponent)</code>.
      Any field with <code>type: 'point2d'</code> will render your component.
      Field-level and form-level validators are registered separately.
    </p>

    <Formitiva
      :definition-data="definition"
      :instance="initialInstance"
      :on-submit="handleSubmit"
      theme="material"
    />

    <div v-if="lastSubmission" class="result-box success">{{ lastSubmission }}</div>
  </div>
</template>
