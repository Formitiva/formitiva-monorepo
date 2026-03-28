/**
 * plugin.ts — Plugin System Example
 *
 * Bundles the Point2D field widget into a FormitivaPlugin and registers it
 * with registerPlugin({ conflictResolution: 'skip' }).
 */
import {
  Formitiva,
  registerPlugin,
  createStandardFieldLayout,
} from '@formitiva/vanilla';
import type { FieldFactory, FieldWidget, FormitivaPlugin, FieldValueType } from '@formitiva/vanilla';
import type { FormitivaInstance } from '@formitiva/vanilla';

// ------------------------------------------------------------------
// Point2D field factory (same implementation as customComponent.ts)
// ------------------------------------------------------------------
const point2dFactory: FieldFactory = (field, ctx, onChange, _onError, initialValue, _initialError, disabled) => {
  const layout = createStandardFieldLayout(field, ctx);

  const parseVal = (v: unknown): { x: string; y: string } => {
    if (v && typeof v === 'object' && 'x' in v && 'y' in v) {
      return { x: String((v as any).x ?? ''), y: String((v as any).y ?? '') };
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

  const emit = () => {
    const x = parseFloat(xInput.value);
    const y = parseFloat(yInput.value);
    onChange((!isNaN(x) && !isNaN(y) ? { x, y } : '') as unknown as FieldValueType);
  };

  xInput.addEventListener('input', emit);
  yInput.addEventListener('input', emit);

  row.appendChild(document.createTextNode('x: '));
  row.appendChild(xInput);
  row.appendChild(document.createTextNode('  y: '));
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
let pluginSubmitCallback: ((values: Record<string, unknown>) => void) | null = null;

// ------------------------------------------------------------------
// PointPlugin definition
// ------------------------------------------------------------------
const PointPlugin: FormitivaPlugin = {
  name: 'point2d-plugin',
  version: '1.0.0',
  description: 'Adds a 2-D coordinate (point2d) field type with validators and a submission handler.',
  components: {
    point2d: point2dFactory,
  },
  fieldTypeValidators: {
    point2d: (_field, input) => {
      if (!input || typeof input !== 'object' || !('x' in input) || !('y' in input)) {
        return 'Please enter both X and Y coordinates.';
      }
      const { x, y } = input as { x: unknown; y: unknown };
      if (typeof x !== 'number' || typeof y !== 'number') return 'Coordinates must be numbers.';
      if (x < -100 || x > 100 || y < -100 || y > 100) return 'Coordinates must be in range [-100, 100].';
      return undefined;
    },
  },
  fieldCustomValidators: {
    point2d: {
      mustBePositive: (_fieldName, value) => {
        if (!value || typeof value !== 'object') return undefined;
        const { x, y } = value as { x: unknown; y: unknown };
        if (typeof x !== 'number' || typeof y !== 'number') return undefined;
        return x >= 0 && y >= 0 ? undefined : 'Both coordinates must be non-negative.';
      },
    },
  },
  formValidators: {
    'point2d:sumLimit': (values) => {
      const pt = values['location'] as { x?: number; y?: number } | undefined;
      if (!pt || typeof pt.x !== 'number' || typeof pt.y !== 'number') return undefined;
      return pt.x + pt.y <= 100 ? undefined : ['The sum of X and Y must not exceed 100.'];
    },
  },
  submissionHandlers: {
    pluginSubmitHandler: async (_definition, _instanceName, valuesMap) => {
      pluginSubmitCallback?.(valuesMap as Record<string, unknown>);
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
  name: 'pluginDemo',
  displayName: 'Plugin Demo',
  version: '1.0.0',
  formValidation: ['point2d:sumLimit'],
  submitHandler: 'pluginSubmitHandler',
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
  name: 'pluginDemo', version: '1.0.0', definition: 'pluginDemo',
  values: { label: 'My Point', location: { x: 5, y: 15 } as unknown as FieldValueType },
};

// ------------------------------------------------------------------
// Render
// ------------------------------------------------------------------
export default async function render(container: HTMLElement) {
  let lastResult: Record<string, unknown> | null = null;

  container.innerHTML = `
    <div class="page-content">
      <h2>Plugin System</h2>
      <p class="desc">
        Bundle components, validators, and submission handlers into a
        <code>FormitivaPlugin</code> object and register it with
        <code>registerPlugin(plugin, { conflictResolution: 'skip' })</code>.
        The plugin is registered once at module load; subsequent navigations reuse it.
      </p>
      <div id="form-container"></div>
      <div id="result-box" class="result-box" style="display:none"></div>
    </div>
  `;

  const formContainer = container.querySelector('#form-container') as HTMLElement;
  const resultBox = container.querySelector('#result-box') as HTMLElement;

  // Wire the submission-handler callback so UI can show results
  pluginSubmitCallback = (values) => {
    lastResult = values;
    resultBox.style.display = 'block';
    resultBox.textContent = JSON.stringify(values, null, 2);
  };

  const form = new Formitiva({
    definitionData: definition,
    instance: preloadedInstance,
    theme: 'material',
  });

  await form.mount(formContainer);

  // Cleanup when user navigates away (router replaces container content)
  const observer = new MutationObserver(() => {
    if (!document.body.contains(container)) {
      pluginSubmitCallback = null;
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
