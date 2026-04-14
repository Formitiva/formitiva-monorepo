<script setup lang="ts">
/**
 * Plugin.vue — Plugin Example
 */
import { ref, onUnmounted } from 'vue';
import { Formitiva } from '@formitiva/vue';
import { registerPlugin } from '@formitiva/vue';
import type {
  FormitivaPlugin,
  FormValidationHandler,
  FieldValueType,
  TranslationFunction,
  DefinitionPropertyField,
} from '@formitiva/vue';
import Point2DInput from './Point2DInput.vue';

const regionValidator: FormValidationHandler = (valuesMap, t) => {
  const p1 = valuesMap['pos2d_1'] as [unknown, unknown] | undefined;
  const p2 = valuesMap['pos2d_2'] as [unknown, unknown] | undefined;
  const errors: string[] = [];
  if (Number(p1?.[0]) > Number(p2?.[0])) errors.push(t('Top-Left X must be ≤ Bottom-Right X'));
  if (Number(p1?.[1]) > Number(p2?.[1])) errors.push(t('Top-Left Y must be ≤ Bottom-Right Y'));
  return errors.length > 0 ? errors : undefined;
};

let pluginSubmitCallback: ((output: string) => void) | null = null;

const PointPlugin: FormitivaPlugin = {
  name: 'point2d-plugin',
  version: '1.0.0',
  description: 'Adds a 2-D point field type with region validation and a submission handler.',
  components: { point2d: Point2DInput },
  fieldTypeValidators: {
    point2d: (_field: DefinitionPropertyField, input: FieldValueType, t: TranslationFunction) => {
      if (!Array.isArray(input) || input.length !== 2) return t('Value must be a 2D point [x, y]');
      const [x, y] = input;
      if (!Number.isFinite(Number(x))) return t('X must be a valid number');
      if (!Number.isFinite(Number(y))) return t('Y must be a valid number');
      return undefined;
    },
  },
  fieldCustomValidators: {
    point2d: {
      nonNegativePoint: (_fieldName: string, value: FieldValueType | unknown, t: TranslationFunction) => {
        const [x, y] = value as [unknown, unknown];
        if (Number(x) < 0) return t('X must be ≥ 0');
        if (Number(y) < 0) return t('Y must be ≥ 0');
        return undefined;
      },
    },
  },
  formValidators: { 'point2d:regionValidator': regionValidator },
  submissionHandlers: {
    'point2d:alertSubmission': (definition: unknown, instanceName: string | null, valuesMap: Record<string, unknown>, _t: (s: string) => string) => {
      const output = JSON.stringify(
        { definition: (definition as { name?: string }).name, instanceName, values: valuesMap }, null, 2
      );
      pluginSubmitCallback?.(output);
      return undefined;
    },
  },
};

registerPlugin(PointPlugin, { conflictResolution: 'skip' });

const definition = {
  name: 'RectangleRegion',
  displayName: 'Rectangle Region (via Plugin)',
  version: '1.0.0',
  validatorRef: 'point2d:regionValidator',
  submitterRef: 'point2d:alertSubmission',
  properties: [
    { type: 'point2d', name: 'pos2d_1', displayName: 'Top-Left Position',     defaultValue: ['0', '0'],     required: true, validatorRef: ['point2d', 'nonNegativePoint'] },
    { type: 'point2d', name: 'pos2d_2', displayName: 'Bottom-Right Position', defaultValue: ['100', '100'], required: true },
  ],
};

const initialInstance = {
  name: 'pluginRegion', version: '1.0.0', definition: 'RectangleRegion',
  values: { pos2d_1: ['10', '20'], pos2d_2: ['100', '200'] },
};

const lastSubmission = ref('');

pluginSubmitCallback = (output) => { lastSubmission.value = output; };
onUnmounted(() => { pluginSubmitCallback = null; });
</script>

<template>
  <div class="page-content">
    <h2>Component</h2>
    <p class="desc">
      Register a custom field component inside a <code>FormitivaPlugin</code> object
      with a <code>components</code> map, then call
      <code>registerPlugin(plugin, { conflictResolution: 'skip' })</code>.
      Any field with <code>type: 'point2d'</code> will render your custom <em>Point2DInput</em>.
      Validators and a submission handler are bundled in the same plugin.
    </p>

    <Formitiva
      :definition-data="definition"
      :instance="initialInstance"
      theme="material"
    />

    <div v-if="lastSubmission" class="result-box success">{{ lastSubmission }}</div>
  </div>
</template>
