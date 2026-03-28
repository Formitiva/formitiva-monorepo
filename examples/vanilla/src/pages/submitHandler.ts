/**
 * submitHandler.ts — Named Submit Handler Example
 */
import { Formitiva, registerSubmissionHandler } from '@formitiva/vanilla';
import type { FormitivaDefinition, FormitivaInstance, FieldValueType, TranslationFunction } from '@formitiva/vanilla';

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

export default async function render(container: HTMLElement) {
  const resultBox = document.createElement('div');

  _onSubmitted = (newInstance) => {
    resultBox.className = 'result-box success';
    resultBox.textContent = JSON.stringify(newInstance, null, 2);
  };

  const form = new Formitiva({
    definitionData: definition,
    instance: initialInstance,
    theme: 'material',
  });

  container.innerHTML = `
    <div class="page-content">
      <h2>Named Submit Handler</h2>
      <p class="desc">
        Call <code>registerSubmissionHandler(name, fn)</code> once, then reference the name via
        <code>submitHandlerName</code> in the definition. Formitiva invokes the handler on submit.
        The serialised instance is shown below after each submission.
      </p>
    </div>
  `;

  const pageContent = container.querySelector('.page-content') as HTMLElement;
  await form.mount(pageContent);
  pageContent.appendChild(resultBox);
}
