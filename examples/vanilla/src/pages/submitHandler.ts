/**
 * submitHandler.ts — Named Submit Handler Example
 */
import { Formitiva, registerPlugin } from '@formitiva/vanilla';
import type { FormitivaPlugin, FormitivaDefinition, FormitivaInstance, FieldValueType, TranslationFunction } from '@formitiva/vanilla';

let _onSubmitted: ((instance: FormitivaInstance) => void) | null = null;

const SubmitDemoPlugin: FormitivaPlugin = {
  name: 'submit-demo-plugin',
  version: '1.0.0',
  submissionHandlers: {
    exampleSubmitHandler: (
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
    },
  },
};
registerPlugin(SubmitDemoPlugin, { conflictResolution: 'skip' });

const definition = {
  name: 'submit_handler_app',
  version: '1.0.0',
  displayName: 'Submit Handler Example',
  submitterRef: 'exampleSubmitHandler',
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
  });

  container.innerHTML = `
    <div class="page-content">
      <h2>Named Submit Handler</h2>
      <p class="desc">
        Use a <code>FormitivaPlugin</code> with a <code>submissionHandlers</code> map,
        then reference the handler name via <code>submitterRef</code> in the definition.
        Formitiva invokes the handler on submit; the serialised instance is shown below.
      </p>
    </div>
  `;

  const pageContent = container.querySelector('.page-content') as HTMLElement;
  await form.mount(pageContent);
  pageContent.appendChild(resultBox);
}
