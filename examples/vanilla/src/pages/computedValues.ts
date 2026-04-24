/**
 * computedValues.ts — Computed Value Handler Example
 *
 * Demonstrates registering computedHandlers inside a FormitivaPlugin and
 * referencing them from field definitions via `computedRef`.
 *
 * When `quantity` or `unitPrice` changes, `total` is recomputed automatically.
 * When `total` or `discountPct` changes, `finalPrice` is recomputed automatically.
 * Computed fields are set to `disabled` in the definition so users cannot edit them directly.
 */
import { Formitiva, registerPlugin } from '@formitiva/vanilla';
import type { FormitivaPlugin, ComputedValueHandler, FieldValueType } from '@formitiva/vanilla';

// ── Handler definitions ───────────────────────────────────────────────────────

/**
 * Single handler that computes both `total` and `finalPrice` in one shot.
 * Returning a map ensures `finalPrice` always uses the freshly-computed `total`,
 * not the stale value from the previous render cycle.
 */
const calcPricesHandler: ComputedValueHandler = (_fieldName, valuesMap) => {
  const qty = Number(valuesMap['quantity'] ?? 0);
  const price = Number(valuesMap['unitPrice'] ?? 0);
  const total = Math.round(qty * price * 100) / 100;
  const discount = Number(valuesMap['discountPct'] ?? 0);
  const multiplier = Math.max(0, Math.min(100, discount));
  const finalPrice = Math.round(total * (1 - multiplier / 100) * 100) / 100;
  return { total, finalPrice };
};

// ── Plugin definition ─────────────────────────────────────────────────────────

const ComputedPlugin: FormitivaPlugin = {
  name: 'computed-demo-plugin',
  version: '1.0.0',
  description: 'Registers computed value handlers that derive field values from other fields.',
  computedHandlers: {
    'demo:calcPrices': calcPricesHandler,
  },
};

// Register once (skip on repeated navigation)
registerPlugin(ComputedPlugin, { conflictResolution: 'skip' });

// ── Form definition ───────────────────────────────────────────────────────────

const definition = {
  name: 'ComputedValuesDemo',
  displayName: 'Computed Values Demo',
  version: '1.0.0',
  properties: [
    {
      type: 'float',
      name: 'quantity',
      displayName: 'Quantity',
      defaultValue: 1,
      min: 0,
      required: true,
    },
    {
      type: 'float',
      name: 'unitPrice',
      displayName: 'Unit Price ($)',
      defaultValue: 10,
      min: 0,
      required: true,
    },
    {
      type: 'float',
      name: 'total',
      displayName: 'Total ($)',
      defaultValue: 10,
      disabled: true,
      computedRef: 'demo:calcPrices',
    },
    {
      type: 'float',
      name: 'discountPct',
      displayName: 'Discount (%)',
      defaultValue: 0,
      min: 0,
      max: 100,
    },
    {
      type: 'float',
      name: 'finalPrice',
      displayName: 'Final Price ($)',
      defaultValue: 10,
      disabled: true,
      computedRef: 'demo:calcPrices',
    },
  ],
};

const preloadedInstance = {
  name: 'computedDemo',
  version: '1.0.0',
  definition: 'ComputedValuesDemo',
  values: {
    quantity: 1 as FieldValueType,
    unitPrice: 10 as FieldValueType,
    total: 10 as FieldValueType,
    discountPct: 0 as FieldValueType,
    finalPrice: 10 as FieldValueType,
  },
};

// ── Render ────────────────────────────────────────────────────────────────────

export default async function render(container: HTMLElement) {
  container.innerHTML = `
    <div class="page-content">
      <h2>Computed Values</h2>
      <p class="desc">
        Register <code>computedHandlers</code> inside a <code>FormitivaPlugin</code> and
        reference them from field definitions via <code>computedRef</code>.
        Whenever any field changes, the renderer re-evaluates all computed fields and
        merges the results back into the form values automatically.
        Change <em>Quantity</em>, <em>Unit Price</em>, or <em>Discount %</em> to see
        <em>Total</em> and <em>Final Price</em> update live.
      </p>
      <table class="info-table">
        <thead><tr><th>Field</th><th>computedRef</th><th>Formula</th></tr></thead>
        <tbody>
          <tr><td><strong>total</strong></td><td><code>demo:calcPrices</code></td><td>quantity × unitPrice</td></tr>
          <tr><td><strong>finalPrice</strong></td><td><code>demo:calcPrices</code></td><td>total × (1 − discount / 100)</td></tr>
        </tbody>
      </table>
      <div id="form-container"></div>
    </div>
  `;

  const formContainer = container.querySelector('#form-container') as HTMLElement;

  const form = new Formitiva({
    definitionData: definition,
    instance: preloadedInstance,
  });

  await form.mount(formContainer);

  // Cleanup when user navigates away
  const observer = new MutationObserver(() => {
    if (!document.body.contains(container)) {
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
