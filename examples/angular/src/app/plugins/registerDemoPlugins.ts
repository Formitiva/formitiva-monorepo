import { registerPlugin } from '@formitiva/angular';
import type { FormitivaPlugin, ComputedValueHandler } from '@formitiva/angular';

/**
 * Single handler that computes both `total` and `finalPrice` atomically.
 * Returning a map ensures `finalPrice` always uses the freshly-computed `total`.
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

const ComputedPlugin: FormitivaPlugin = {
  name: 'computed-demo-plugin',
  version: '1.0.0',
  description: 'Registers computed value handlers that derive field values from other fields.',
  computedHandlers: {
    'demo:calcPrices': calcPricesHandler,
  },
};

// Install the plugin (skip if already registered)
registerPlugin(ComputedPlugin, { conflictResolution: 'skip' });
