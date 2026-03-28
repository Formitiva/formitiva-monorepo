/**
 * Plugin.tsx — Plugin Example
 *
 * Demonstrates bundling multiple registrations into a single
 * `FormitivaPlugin` object and installing it with `registerPlugin()`.
 */
import { useState, useEffect } from 'react';
import { Formitiva } from '@formitiva/react';
import { registerPlugin, StandardFieldLayout } from '@formitiva/react';
import type {
  FormitivaPlugin,
  FormValidationHandler,
  FieldValueType,
  TranslationFunction,
  DefinitionPropertyField,
  BaseInputProps,
} from '@formitiva/react';

// ── Point2D component (same as CustomComponent page) ─────────────────────────
function Point2DInput({ field, value, error, disabled, onChange }: BaseInputProps) {
  const [x, y] = Array.isArray(value) ? [String(value[0] ?? ''), String(value[1] ?? '')] : ['', ''];
  const emit = (newX: string, newY: string) => {
    onChange?.([newX, newY] as unknown as FieldValueType);
  };
  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: '0.82rem', color: '#666', minWidth: 16 }}>X:</label>
        <input type="number" defaultValue={x} disabled={disabled} onBlur={(e) => emit(e.target.value, y)}
          style={{ width: 90, padding: '6px 8px', border: '1px solid #d0d5dd', borderRadius: 6 }} />
        <label style={{ fontSize: '0.82rem', color: '#666', minWidth: 16 }}>Y:</label>
        <input type="number" defaultValue={y} disabled={disabled} onBlur={(e) => emit(x, e.target.value)}
          style={{ width: 90, padding: '6px 8px', border: '1px solid #d0d5dd', borderRadius: 6 }} />
      </div>
    </StandardFieldLayout>
  );
}

// ── Plugin definition ─────────────────────────────────────────────────────────
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
    'point2d:alertSubmission': (definition, instanceName, valuesMap, _t) => {
      const output = JSON.stringify(
        { definition: (definition as { name?: string }).name, instanceName, values: valuesMap }, null, 2
      );
      pluginSubmitCallback?.(output);
      return undefined;
    },
  },
};

registerPlugin(PointPlugin, { conflictResolution: 'skip' });

// ─────────────────────────────────────────────────────────────────────────────

const definition = {
  name: 'RectangleRegion',
  displayName: 'Rectangle Region (via Plugin)',
  version: '1.0.0',
  validationHandlerName: 'point2d:regionValidator',
  submitHandlerName: 'point2d:alertSubmission',
  properties: [
    { type: 'point2d', name: 'pos2d_1', displayName: 'Top-Left Position',     defaultValue: ['0', '0'],     required: true, validationHandlerName: ['point2d', 'nonNegativePoint'] },
    { type: 'point2d', name: 'pos2d_2', displayName: 'Bottom-Right Position', defaultValue: ['100', '100'], required: true },
  ],
};

const initialInstance = {
  name: 'pluginRegion', version: '1.0.0', definition: 'RectangleRegion',
  values: { pos2d_1: ['10', '20'], pos2d_2: ['100', '200'] },
};

export default function Plugin() {
  const [lastSubmission, setLastSubmission] = useState('');

  useEffect(() => {
    pluginSubmitCallback = setLastSubmission;
    return () => { pluginSubmitCallback = null; };
  }, []);

  return (
    <div className="page-content">
      <h2>Plugin</h2>
      <p className="desc">
        Bundle components, validators, and submission handlers into a{' '}
        <code>FormitivaPlugin</code> object, then call{' '}
        <code>registerPlugin(plugin, {'{ conflictResolution: \'skip\' }'})</code>.
        This page uses the same <em>Point2D</em> feature as the previous example,
        but installed as a self-contained plugin rather than individual registrations.
      </p>

      <Formitiva
        definitionData={definition}
        instance={initialInstance}
        theme="material"
      />

      {lastSubmission && (
        <div className="result-box success">{lastSubmission}</div>
      )}
    </div>
  );
}
