/**
 * component.ts — Custom Field Component Example
 *
 * Registers a custom Point2D field widget inside a FormitivaPlugin with a
 * components map, then installs it with registerPlugin({ conflictResolution: 'skip' }).
 */
import {
  Formitiva,
  registerPlugin,
  createStandardFieldLayout,
} from '@formitiva/vanilla';
import type { FieldFactory, FieldWidget, FormitivaPlugin, FieldValueType } from '@formitiva/vanilla';
import type { FormitivaInstance } from '@formitiva/vanilla';

// ------------------------------------------------------------------
// Point2D field factory  (value format: [xString, yString])
// ------------------------------------------------------------------
const point2dFactory: FieldFactory = (field, ctx, onChange, _onError, initialValue, _initialError, disabled) => {
  const layout = createStandardFieldLayout(field, ctx);

  const parseVal = (v: unknown): { x: string; y: string } => {
    if (Array.isArray(v) && v.length >= 2) {
      return { x: String(v[0] ?? ''), y: String(v[1] ?? '') };
    }
    return { x: '', y: '' };
  };

  const current = parseVal(initialValue);

  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:8px;align-items:center';

  const makeInput = (placeholder: string, value: string): HTMLInputElement => {
    const input = document.createElement('input');
    input.type = 'number';
    input.placeholder = placeholder;
    input.value = value;
    input.disabled = disabled;
    input.className = 'formitiva-input formitiva-input--number';
    input.style.cssText = 'width:80px';
    return input;
  };

  const xInput = makeInput('X', current.x);
  const yInput = makeInput('Y', current.y);

  const emit = () => onChange([xInput.value, yInput.value] as unknown as FieldValueType);

  xInput.addEventListener('input', emit);
  yInput.addEventListener('input', emit);

  row.appendChild(document.createTextNode('X: '));
  row.appendChild(xInput);
  row.appendChild(document.createTextNode('  Y: '));
  row.appendChild(yInput);
  layout.slot.appendChild(row);

  const widget: FieldWidget = {
    el: layout.el,
    update(value, error, isDisabled) {
      const parsed = parseVal(value);
      xInput.value = parsed.x;
      yInput.value = parsed.y;
      xInput.disabled = isDisabled;
      yInput.disabled = isDisabled;
      layout.setError(error);
    },
    destroy() {
      xInput.removeEventListener('input', emit);
      yInput.removeEventListener('input', emit);
    },
  };

  return widget;
};

// ------------------------------------------------------------------
// Module-level submit callback slot (enables cleanup on navigation)
// ------------------------------------------------------------------
let pluginSubmitCallback: ((output: string) => void) | null = null;

// ------------------------------------------------------------------
// PointPlugin definition
// ------------------------------------------------------------------
const PointPlugin: FormitivaPlugin = {
  name: 'point2d-plugin',
  version: '1.0.0',
  description: 'Adds a 2-D point field type with region validation and a submission handler.',
  components: {
    point2d: point2dFactory,
  },
  fieldTypeValidators: {
    point2d: (_field, input) => {
      if (!Array.isArray(input) || input.length !== 2) return 'Value must be a 2D point [x, y]';
      const [x, y] = input as unknown[];
      if (!Number.isFinite(Number(x))) return 'X must be a valid number';
      if (!Number.isFinite(Number(y))) return 'Y must be a valid number';
      return undefined;
    },
  },
  fieldCustomValidators: {
    point2d: {
      nonNegativePoint: (_fieldName, value) => {
        const [x, y] = value as unknown[];
        if (Number(x) < 0) return 'X must be ≥ 0';
        if (Number(y) < 0) return 'Y must be ≥ 0';
        return undefined;
      },
    },
  },
  formValidators: {
    'point2d:regionValidator': (valuesMap) => {
      const p1 = valuesMap['pos2d_1'] as unknown[];
      const p2 = valuesMap['pos2d_2'] as unknown[];
      const errors: string[] = [];
      if (Number(p1?.[0]) > Number(p2?.[0])) errors.push('Top-Left X must be ≤ Bottom-Right X');
      if (Number(p1?.[1]) > Number(p2?.[1])) errors.push('Top-Left Y must be ≤ Bottom-Right Y');
      return errors.length > 0 ? errors : undefined;
    },
  },
  submissionHandlers: {
    'point2d:alertSubmission': async (_definition, _instanceName, valuesMap) => {
      const output = JSON.stringify(valuesMap, null, 2);
      pluginSubmitCallback?.(output);
      return undefined;
    },
  },
};

// Register once (skip on repeated navigation)
registerPlugin(PointPlugin, { conflictResolution: 'skip' });

// ------------------------------------------------------------------
// Definition & instance
// ------------------------------------------------------------------
const definition = {
  name: 'RectangleRegion',
  displayName: 'Rectangle Region (via Plugin)',
  version: '1.0.0',
  validatorRef: 'point2d:regionValidator',
  submitterRef: 'point2d:alertSubmission',
  properties: [
    { type: 'point2d', name: 'pos2d_1', displayName: 'Top-Left Position',     defaultValue: ['0', '0'],     required: true, validation: [{ category: 'point2d', handler: 'nonNegativePoint' }] },
    { type: 'point2d', name: 'pos2d_2', displayName: 'Bottom-Right Position', defaultValue: ['100', '100'], required: true },
  ],
};

const preloadedInstance: FormitivaInstance = {
  name: 'pluginRegion', version: '1.0.0', definition: 'RectangleRegion',
  values: { pos2d_1: ['10', '20'] as unknown as FieldValueType, pos2d_2: ['100', '200'] as unknown as FieldValueType },
};

// ------------------------------------------------------------------
// Render
// ------------------------------------------------------------------
export default async function render(container: HTMLElement) {
  container.innerHTML = `
    <div class="page-content">
      <h2>Component</h2>
      <p class="desc">
        Register a custom field component inside a <code>FormitivaPlugin</code> object with a
        <code>components</code> map, then call
        <code>registerPlugin(plugin, { conflictResolution: 'skip' })</code>.
        Any field with <code>type: 'point2d'</code> will render the
        <code>Point2DInputComponent</code>. Validators and a submission handler are bundled in the
        same plugin.
      </p>
      <div id="form-container"></div>
      <div id="result-box" class="result-box" style="display:none"></div>
    </div>
  `;

  const formContainer = container.querySelector('#form-container') as HTMLElement;
  const resultBox = container.querySelector('#result-box') as HTMLElement;

  pluginSubmitCallback = (output) => {
    resultBox.style.display = 'block';
    resultBox.textContent = output;
  };

  const form = new Formitiva({
    definitionData: definition,
    instance: preloadedInstance,
    theme: 'material',
  });

  await form.mount(formContainer);

  const observer = new MutationObserver(() => {
    if (!document.body.contains(container)) {
      pluginSubmitCallback = null;
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
