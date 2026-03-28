/**
 * customComponent.ts — Custom Component / Field Widget Example
 *
 * Registers a vanilla FieldFactory for the custom 'point2d' field type.
 */
import {
  Formitiva,
  registerComponent,
  registerFieldTypeValidationHandler,
  registerFieldCustomValidationHandler,
  registerFormValidationHandler,
  createStandardFieldLayout,
} from '@formitiva/vanilla';
import type { FieldFactory, FieldWidget, FieldValueType } from '@formitiva/vanilla';
import type { FormitivaInstance } from '@formitiva/vanilla';

// ------------------------------------------------------------------
// Point2D field factory
// ------------------------------------------------------------------
const point2dFactory: FieldFactory = (field, ctx, onChange, _onError, initialValue, initialError, disabled) => {
  const layout = createStandardFieldLayout(field, ctx);

  // Parse initial value – expected shape: { x: number; y: number } | ''
  const parseVal = (v: unknown): { x: string; y: string } => {
    if (v && typeof v === 'object' && 'x' in v && 'y' in v) {
      return { x: String((v as any).x ?? ''), y: String((v as any).y ?? '') };
    }
    return { x: '', y: '' };
  };

  let current = parseVal(initialValue);

  // Build input row
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

  const emit = () => {
    const x = parseFloat(xInput.value);
    const y = parseFloat(yInput.value);
    if (!isNaN(x) && !isNaN(y)) {
      onChange({ x, y } as unknown as FieldValueType);
    } else {
      onChange('');
    }
  };

  xInput.addEventListener('input', emit);
  yInput.addEventListener('input', emit);

  row.appendChild(document.createTextNode('x: '));
  row.appendChild(xInput);
  row.appendChild(document.createTextNode('  y: '));
  row.appendChild(yInput);
  layout.slot.appendChild(row);

  if (initialError) layout.setError(initialError);

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
// Registrations (once, guarded by module-level flag)
// ------------------------------------------------------------------
let registered = false;

function ensureRegistered() {
  if (registered) return;
  registered = true;

  registerComponent('point2d', point2dFactory);

  // Type-level validator: value must be a { x, y } object with numbers in [-100, 100]
  registerFieldTypeValidationHandler('point2d', (_field, input) => {
    if (!input || typeof input !== 'object' || !('x' in input) || !('y' in input)) {
      return 'Please enter both X and Y coordinates.';
    }
    const { x, y } = input as { x: unknown; y: unknown };
    if (typeof x !== 'number' || typeof y !== 'number') return 'Coordinates must be numbers.';
    if (x < -100 || x > 100 || y < -100 || y > 100) return 'Coordinates must be in the range [-100, 100].';
    return undefined;
  });

  // Custom field validator: named handler "mustBePositive"
  registerFieldCustomValidationHandler('point2d', 'mustBePositive', (_fieldName, value) => {
    if (!value || typeof value !== 'object') return undefined;
    const { x, y } = value as { x: unknown; y: unknown };
    if (typeof x !== 'number' || typeof y !== 'number') return undefined;
    return (x >= 0 && y >= 0) ? undefined : 'Both coordinates must be non-negative.';
  });

  // Form-level validator: x + y must be ≤ 100
  registerFormValidationHandler('point2d:sumLimit', (values) => {
    const pt = values['location'] as { x?: number; y?: number } | undefined;
    if (!pt || typeof pt.x !== 'number' || typeof pt.y !== 'number') return undefined;
    return (pt.x + pt.y <= 100) ? undefined : ['The sum of X and Y must not exceed 100.'];
  });
}

// ------------------------------------------------------------------
// Definition & instance
// ------------------------------------------------------------------
const definition = {
  name: 'customComponentDemo',
  displayName: 'Custom Component Demo',
  version: '1.0.0',
  formValidation: ['point2d:sumLimit'],
  properties: [
    { type: 'text', name: 'label', displayName: 'Label', defaultValue: 'My Point', required: true },
    {
      type: 'point2d',
      name: 'location',
      displayName: 'Location',
      defaultValue: '',
      required: true,
      validation: [{ category: 'point2d', handler: 'mustBePositive' }],
    },
  ],
};

const preloadedInstance: FormitivaInstance = {
  name: 'customDemo', version: '1.0.0', definition: 'customComponentDemo',
  values: { label: 'Origin', location: { x: 10, y: 20 } as unknown as FieldValueType },
};

// ------------------------------------------------------------------
// Render
// ------------------------------------------------------------------
export default async function render(container: HTMLElement) {
  ensureRegistered();

  container.innerHTML = `
    <div class="page-content">
      <h2>Custom Component</h2>
      <p class="desc">
        Register a custom vanilla field widget with <code>registerComponent(typeName, factory)</code>.
        The factory returns a plain <code>FieldWidget</code> (an object with <code>el</code>,
        <code>update()</code>, and <code>destroy()</code>). Use <code>createStandardFieldLayout</code>
        to get the standard label/error wrapper, then append your inputs into its <code>slot</code>.
      </p>
      <div id="form-container"></div>
      <div id="result-box" class="result-box" style="display:none"></div>
    </div>
  `;

  const formContainer = container.querySelector('#form-container') as HTMLElement;
  const resultBox = container.querySelector('#result-box') as HTMLElement;

  const form = new Formitiva({
    definitionData: definition,
    instance: preloadedInstance,
    theme: 'material',
    onSubmit: (_def, _instanceName, valuesMap) => {
      resultBox.style.display = 'block';
      resultBox.textContent = JSON.stringify(valuesMap, null, 2);
      return undefined;
    },
  });

  await form.mount(formContainer);
}
