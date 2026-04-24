/**
 * Validation.tsx — Form Validation Example
 *
 * Demonstrates registering a cross-field validation handler via
 * `registerFormValidator()` and referencing it in the definition's
 * `validatorRef` field.
 */
import { useState } from 'react';
import { Formitiva, registerPlugin } from '@formitiva/react';
import type { FormitivaPlugin, FormValidationHandler, FormSubmissionHandler } from '@formitiva/react';

// Register the form-level validation handler once (at module load)
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

export default function Validation() {
  const [lastResult, setLastResult] = useState('');
  const [isError,    setIsError]    = useState(false);

  const handleSubmit: FormSubmissionHandler = (_def, _instanceName, values, _t) => {
    setIsError(false);
    setLastResult(`Submitted successfully!\n\n${JSON.stringify(values, null, 2)}`);
    return undefined;
  };

  return (
    <div className="page-content">
      <h2>Form Validation</h2>
      <p className="desc">
        Use a <code>FormitivaPlugin</code> with a <code>formValidators</code> map,
        then reference the validator name via <code>validatorRef</code> in the definition.
        The validator receives all field values and returns an array of error strings (or{' '}
        <code>undefined</code> for no errors).
      </p>

      <Formitiva
        definitionData={definition}
        onSubmit={handleSubmit}
        displayInstanceName={false}
        fieldValidationMode="onSubmission"
      />

      {lastResult && (
        <div className={`result-box ${isError ? 'error' : 'success'}`}>{lastResult}</div>
      )}
    </div>
  );
}
