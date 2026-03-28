/**
 * CustomComponent.tsx — Custom Field Component Registration Example
 *
 * Shows the full workflow for registering a custom React component as a
 * Formitiva field type using `registerComponent('point2d', MyComponent)`.
 */
import { useState, useCallback } from 'react';
import { Formitiva } from '@formitiva/react';
import {
  registerComponent,
  registerFieldCustomValidationHandler,
  registerFormValidationHandler,
  registerFieldTypeValidationHandler,
  StandardFieldLayout,
} from '@formitiva/react';
import type {
  FormSubmissionHandler,
  FormValidationHandler,
  FieldValueType,
  TranslationFunction,
  DefinitionPropertyField,
  BaseInputProps,
} from '@formitiva/react';

// ── Point2D custom field component ────────────────────────────────────────────
type Point2DValue = [string, string];

function Point2DInput({ field, value, error, disabled, onChange }: BaseInputProps) {
  const [x, y] = Array.isArray(value) ? [String(value[0] ?? ''), String(value[1] ?? '')] : ['', ''];

  const emit = useCallback((newX: string, newY: string) => {
    onChange?.([newX, newY] as unknown as FieldValueType);
  }, [onChange]);

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: '0.82rem', color: '#666', minWidth: 16 }}>X:</label>
        <input
          type="number"
          defaultValue={x}
          disabled={disabled}
          onBlur={(e) => emit(e.target.value, y)}
          style={{ width: 90, padding: '6px 8px', border: '1px solid #d0d5dd', borderRadius: 6, fontSize: '0.9rem' }}
        />
        <label style={{ fontSize: '0.82rem', color: '#666', minWidth: 16 }}>Y:</label>
        <input
          type="number"
          defaultValue={y}
          disabled={disabled}
          onBlur={(e) => emit(x, e.target.value)}
          style={{ width: 90, padding: '6px 8px', border: '1px solid #d0d5dd', borderRadius: 6, fontSize: '0.9rem' }}
        />
      </div>
    </StandardFieldLayout>
  );
}

// ── Register everything ───────────────────────────────────────────────────────

registerComponent('point2d', Point2DInput);

registerFieldTypeValidationHandler(
  'point2d',
  (_field: DefinitionPropertyField, input: FieldValueType, t: TranslationFunction) => {
    if (!Array.isArray(input) || input.length !== 2) return t('Value must be a 2D point [x, y]');
    const [x, y] = input;
    if (!Number.isFinite(Number(x))) return t('X must be a valid number');
    if (!Number.isFinite(Number(y))) return t('Y must be a valid number');
    return undefined;
  }
);

registerFieldCustomValidationHandler(
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

registerFormValidationHandler('point2d:regionValidator', regionValidator);

// ─────────────────────────────────────────────────────────────────────────────

const definition = {
  name: 'RectangleRegion',
  displayName: 'Rectangle Region',
  version: '1.0.0',
  validationHandlerName: 'point2d:regionValidator',
  properties: [
    { type: 'point2d', name: 'pos2d_1', displayName: 'Top-Left Position',     defaultValue: ['0', '0'],     required: true, validationHandlerName: ['point2d', 'nonNegativePoint'] },
    { type: 'point2d', name: 'pos2d_2', displayName: 'Bottom-Right Position', defaultValue: ['100', '100'], required: true },
    { name: 'submitBtn', displayName: 'Save Region', type: 'button', action: 'submit' },
  ],
};

const initialInstance = {
  name: 'region1', version: '1.0.0', definition: 'RectangleRegion',
  values: { pos2d_1: ['10', '20'], pos2d_2: ['100', '200'] },
};

export default function CustomComponent() {
  const [lastSubmission, setLastSubmission] = useState('');

  const handleSubmit: FormSubmissionHandler = (_def, _instanceName, values, _t) => {
    setLastSubmission(JSON.stringify(values, null, 2));
    return undefined;
  };

  return (
    <div className="page-content">
      <h2>Custom Field Component</h2>
      <p className="desc">
        Create a custom field component that accepts <code>BaseInputProps</code>,
        then call <code>registerComponent('point2d', MyComponent)</code>.
        Any field with <code>type: 'point2d'</code> will render your component.
        Field-level and form-level validators are registered separately.
      </p>

      <Formitiva
        definitionData={definition}
        instance={initialInstance}
        onSubmit={handleSubmit}
        theme="material"
      />

      {lastSubmission && (
        <div className="result-box success">{lastSubmission}</div>
      )}
    </div>
  );
}
