/**
 * submit-handler.component.ts — Named Submit Handler Example
 *
 * Demonstrates two integrated approaches:
 *
 *  1. Registering a submission handler by name with
 *     `registerSubmitter('myHandler', fn)` and referencing it
 *     via `submitterRef` in the definition so the form always
 *     uses it regardless of where it is rendered.
 *
 *  2. Using the `[onSubmit]` @Input as an alternative inline callback
 *     (toggle `useDefinitionHandler` to switch between them).
 *
 * The handler updates the component's `submittedInstance` signal so the
 * current values are displayed after each submission.
 */
import { Component, signal } from '@angular/core';
import { FormitivaComponent, registerPlugin } from '@formitiva/angular';
import type {
  FormitivaPlugin,
  FormSubmissionHandler,
  FormitivaDefinition,
  FormitivaInstance,
  FieldValueType,
  TranslationFunction,
} from '@formitiva/angular';

// ── Registered handler (referenced by name in the definition) ────────────────
//
// Note: The handler is registered once at module load. Since this component is
// lazy-loaded, registration happens the first time this route is visited.
//
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
  // References the globally registered handler:
  submitterRef: 'exampleSubmitHandler',
  properties: [
    {
      name: 'firstName',
      displayName: 'First Name',
      type: 'string',
      defaultValue: '',
      required: true,
    },
    {
      name: 'age',
      displayName: 'Age',
      type: 'int',
      defaultValue: 30,
      min: 0,
    },
    {
      name: 'subscribe',
      displayName: 'Subscribe to newsletter',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
};

const initialInstance: FormitivaInstance = {
  name: 'demoUser',
  version: '1.0.0',
  definition: 'submit_handler_app',
  values: {
    firstName: 'Alice',
    age: 28,
    subscribe: true,
  },
};

@Component({
  selector: 'app-submit-handler',
  standalone: true,
  imports: [FormitivaComponent],
  template: `
    <div class="page-content">
      <h2>Named Submit Handler</h2>
      <p class="desc">
        Use a <code>FormitivaPlugin</code> with a <code>submissionHandlers</code> map,
        then reference the handler name via <code>submitterRef</code> in the definition.
        Formitiva invokes the handler on submit; the serialised instance is shown below.
      </p>

      <fv-formitiva
        [definitionData]="definition"
        [instance]="instance()"
        theme="material"
      ></fv-formitiva>

      @if (serialised()) {
        <div class="result-box success">{{ serialised() }}</div>
      }
    </div>
  `,
})
export class SubmitHandlerComponent {
  definition = definition;
  instance = signal<FormitivaInstance>(initialInstance);
  serialised = signal('');

  constructor() {
    // Wire the module-level callback to this component instance
    _onSubmitted = (newInstance) => {
      this.instance.set(newInstance);
      this.serialised.set(JSON.stringify(newInstance, null, 2));
    };
  }
}
