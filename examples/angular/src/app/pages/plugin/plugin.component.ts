/**
 * plugin.component.ts — Plugin Example
 *
 * Demonstrates bundling multiple registrations into a single
 * `FormitivaPlugin` object and installing it with `registerPlugin()`.
 *
 * The `PointPlugin` bundles:
 *  - The custom `point2d` component (Point2DInputComponent)
 *  - A type-level validator for `point2d`
 *  - A field-level custom validator (nonNegativePoint)
 *  - A form-level validation handler (regionValidator)
 *  - A submission handler that shows an alert
 *
 * `conflictResolution: 'skip'` prevents re-registration if the
 * custom-component page was visited first in the same session.
 */
import { Component, signal } from '@angular/core';
import { FormitivaComponent, registerPlugin } from '@formitiva/angular';
import type {
  FormitivaPlugin,
  FormSubmissionHandler,
  FormValidationHandler,
  FieldValueType,
  TranslationFunction,
  DefinitionPropertyField,
} from '@formitiva/angular';
import { Point2DInputComponent } from '../component/point2d-input.component';

// ── Plugin definition ─────────────────────────────────────────────────────────

const regionValidator: FormValidationHandler = (valuesMap, t) => {
  const p1 = valuesMap['pos2d_1'] as [unknown, unknown] | undefined;
  const p2 = valuesMap['pos2d_2'] as [unknown, unknown] | undefined;
  const x1 = Number(p1?.[0]);
  const y1 = Number(p1?.[1]);
  const x2 = Number(p2?.[0]);
  const y2 = Number(p2?.[1]);
  const errors: string[] = [];
  if (x1 > x2) errors.push(t('Top-Left X must be ≤ Bottom-Right X'));
  if (y1 > y2) errors.push(t('Top-Left Y must be ≤ Bottom-Right Y'));
  return errors.length > 0 ? errors : undefined;
};

export const PointPlugin: FormitivaPlugin = {
  name: 'point2d-plugin',
  version: '1.0.0',
  description: 'Adds a 2-D point field type with region validation and an alert submission handler.',

  // Custom components { typeName: ComponentClass }
  components: {
    point2d: Point2DInputComponent,
  },

  // Field type validators { typeName: validatorFn }
  fieldTypeValidators: {
    point2d: (
      _field: DefinitionPropertyField,
      input: FieldValueType,
      t: TranslationFunction
    ) => {
      if (!Array.isArray(input) || input.length !== 2)
        return t('Value must be a 2D point [x, y]');
      const [x, y] = input;
      if (!Number.isFinite(Number(x))) return t('X must be a valid number');
      if (!Number.isFinite(Number(y))) return t('Y must be a valid number');
      return undefined;
    },
  },

  // Field custom validators { category: { handlerName: fn } }
  fieldCustomValidators: {
    point2d: {
      nonNegativePoint: (
        _fieldName: string,
        value: FieldValueType | unknown,
        t: TranslationFunction
      ) => {
        const [x, y] = value as [unknown, unknown];
        if (Number(x) < 0) return t('X must be ≥ 0');
        if (Number(y) < 0) return t('Y must be ≥ 0');
        return undefined;
      },
    },
  },

  // Form validators { handlerName: fn }
  formValidators: {
    'point2d:regionValidator': regionValidator,
  },

  // Submission handlers { handlerName: fn }
  submissionHandlers: {
    'point2d:alertSubmission': (definition, instanceName, valuesMap, _t) => {
      const output = JSON.stringify(
        { definition: (definition as { name?: string }).name, instanceName, values: valuesMap },
        null,
        2
      );
      // Signal back to the component (see PluginComponent below)
      pluginSubmitCallback?.(output);
      return undefined;
    },
  },
};

// Module-level callback so the plugin's submission handler can update component state
let pluginSubmitCallback: ((output: string) => void) | null = null;

// Install the plugin (skip if already registered from a previous visit)
registerPlugin(PointPlugin, { conflictResolution: 'skip' });
// ─────────────────────────────────────────────────────────────────────────────

const definition = {
  name: 'RectangleRegion',
  displayName: 'Rectangle Region (via Plugin)',
  version: '1.0.0',
  validatorRef: 'point2d:regionValidator',
  submitterRef: 'point2d:alertSubmission',
  properties: [
    {
      type: 'point2d',
      name: 'pos2d_1',
      displayName: 'Top-Left Position',
      defaultValue: ['0', '0'],
      required: true,
      validatorRef: ['point2d', 'nonNegativePoint'],
    },
    {
      type: 'point2d',
      name: 'pos2d_2',
      displayName: 'Bottom-Right Position',
      defaultValue: ['100', '100'],
      required: true,
    },
  ],
};

const initialInstance = {
  name: 'pluginRegion',
  version: '1.0.0',
  definition: 'RectangleRegion',
  values: {
    pos2d_1: ['10', '20'],
    pos2d_2: ['100', '200'],
  },
};

@Component({
  selector: 'app-plugin',
  standalone: true,
  imports: [FormitivaComponent],
  template: `
    <div class="page-content">
      <h2>Plugin</h2>
      <p class="desc">
        Bundle components, validators, and submission handlers into a
        <code>FormitivaPlugin</code> object, then call
        <code>registerPlugin(plugin, &#123; conflictResolution: 'skip' &#125;)</code>.
        The <em>Point2D</em> custom field component, validators, and submission
        handler are all bundled inside one plugin object.
      </p>

      <fv-formitiva
        [definitionData]="definition"
        [instance]="initialInstance"
      ></fv-formitiva>

      @if (lastSubmission()) {
        <div class="result-box success">{{ lastSubmission() }}</div>
      }
    </div>
  `,
})
export class PluginComponent {
  definition = definition;
  initialInstance = initialInstance;
  lastSubmission = signal('');

  constructor() {
    pluginSubmitCallback = (output) => this.lastSubmission.set(output);
  }
}
