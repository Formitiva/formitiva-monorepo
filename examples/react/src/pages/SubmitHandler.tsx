/**
 * SubmitHandler.tsx — Named Submit Handler Example
 *
 * Demonstrates registering a submission handler by name with
 * `registerSubmitter('myHandler', fn)` and referencing it
 * via `submitterRef` in the definition.
 */
import { useState, useEffect } from 'react';
import { Formitiva, registerSubmitter } from '@formitiva/react';
import type { FormitivaDefinition, FormitivaInstance, FieldValueType, TranslationFunction } from '@formitiva/react';

// Module-level callback so the registered handler can update component state
let _onSubmitted: ((instance: FormitivaInstance) => void) | null = null;

registerSubmitter(
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
  submitterRef: 'exampleSubmitHandler',
  properties: [
    { name: 'firstName', displayName: 'First Name', type: 'string',   defaultValue: '', required: true },
    { name: 'age',       displayName: 'Age',         type: 'int',      defaultValue: 30, min: 0 },
    { name: 'subscribe', displayName: 'Subscribe to newsletter', type: 'checkbox', defaultValue: false },
  ],
};

const initialInstance: FormitivaInstance = {
  name: 'demoUser',
  version: '1.0.0',
  definition: 'submit_handler_app',
  values: { firstName: 'Alice', age: 28, subscribe: true },
};

export default function SubmitHandler() {
  const [instance,   setInstance]   = useState<FormitivaInstance>(initialInstance);
  const [serialised, setSerialised] = useState('');

  useEffect(() => {
    _onSubmitted = (newInstance) => {
      setInstance(newInstance);
      setSerialised(JSON.stringify(newInstance, null, 2));
    };
    return () => { _onSubmitted = null; };
  }, []);

  return (
    <div className="page-content">
      <h2>Named Submit Handler</h2>
      <p className="desc">
        Call <code>registerSubmitter(name, fn)</code> once, then reference the name via{' '}
        <code>submitterRef</code> in the definition. Formitiva invokes the handler on submit.
        The serialised instance is shown below after each submission.
      </p>

      <Formitiva
        definitionData={definition}
        instance={instance}
        theme="material"
      />

      {serialised && (
        <div className="result-box success">{serialised}</div>
      )}
    </div>
  );
}
