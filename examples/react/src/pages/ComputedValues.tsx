/**
 * ComputedValues.tsx — Computed Value Handler Example
 *
 * Demonstrates registering computedHandlers inside a FormitivaPlugin and
 * referencing them from field definitions via `computedRef`.
 *
 * When `quantity` or `unitPrice` changes, `total` is recomputed automatically.
 * When `total` or `discountPct` changes, `finalPrice` is recomputed automatically.
 * Computed fields are set to `disabled` in the definition so users cannot edit them directly.
 */
import { Formitiva, registerPlugin } from '@formitiva/react';
import type { FormitivaPlugin, ComputedValueHandler } from '@formitiva/react';

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

const initialInstance = {
  name: 'computedDemo',
  version: '1.0.0',
  definition: 'ComputedValuesDemo',
  values: { quantity: 1, unitPrice: 10, total: 10, discountPct: 0, finalPrice: 10 },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ComputedValues() {
  return (
    <div className="page-content">
      <h2>Computed Values</h2>
      <p className="desc">
        Register <code>computedHandlers</code> inside a <code>FormitivaPlugin</code> and
        reference them from field definitions via <code>computedRef</code>.
        Whenever any field changes, the renderer re-evaluates all computed fields and
        merges the results back into the form values automatically.
        Change <em>Quantity</em>, <em>Unit Price</em>, or <em>Discount %</em> to see
        <em>Total</em> and <em>Final Price</em> update live.
      </p>

      <table style={{ borderCollapse: 'collapse', marginBottom: 20, fontSize: '0.82rem' }}>
        <thead>
          <tr>
            <th style={thStyle}>Field</th>
            <th style={thStyle}>computedRef</th>
            <th style={thStyle}>Formula</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}><strong>total</strong></td>
            <td style={tdStyle}><code>demo:calcPrices</code></td>
            <td style={tdStyle}>quantity × unitPrice</td>
          </tr>
          <tr>
            <td style={tdStyle}><strong>finalPrice</strong></td>
            <td style={tdStyle}><code>demo:calcPrices</code></td>
            <td style={tdStyle}>total × (1 − discount / 100)</td>
          </tr>
        </tbody>
      </table>

      <Formitiva
        definitionData={definition}
        instance={initialInstance}
      />
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '6px 12px',
  textAlign: 'left',
  borderBottom: '2px solid #d0d5dd',
  color: '#344054',
};

const tdStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderBottom: '1px solid #eaecf0',
  color: '#475467',
};
