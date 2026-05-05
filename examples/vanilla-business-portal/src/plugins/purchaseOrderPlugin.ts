import { registerPlugin } from '@formitiva/vanilla';
import type { FormitivaPlugin, FormValidationHandler, ComputedValueHandler } from '@formitiva/vanilla';
import { submissionBridge } from './bridge';

const calcOrderTotals: ComputedValueHandler = (_field, values) => {
  const qty      = Math.max(0, Number(values['quantity']    ?? 0));
  const price    = Math.max(0, Number(values['unitPrice']   ?? 0));
  const discount = Math.max(0, Math.min(100, Number(values['discountPct'] ?? 0)));
  const subtotal    = Math.round(qty * price * 100) / 100;
  const totalAmount = Math.round(subtotal * (1 - discount / 100) * 100) / 100;
  return { subtotal, totalAmount };
};

const purchaseOrderValidator: FormValidationHandler = (values, t) => {
  const errors: string[] = [];
  if (Number(values['quantity']  ?? 0) <= 0) errors.push(t('Quantity must be greater than zero.'));
  if (Number(values['unitPrice'] ?? 0) <= 0) errors.push(t('Unit Price must be greater than zero.'));
  return errors.length > 0 ? errors : undefined;
};

const purchaseOrderPlugin: FormitivaPlugin = {
  name: 'purchase-order-plugin',
  version: '1.0.0',
  description: 'Computed totals, validation, and submission for the Purchase Order form.',
  computedHandlers: { 'biz:calcOrderTotals': calcOrderTotals },
  formValidators: { 'biz:purchaseOrderValidator': purchaseOrderValidator },
  submissionHandlers: {
    'biz:purchaseOrder': (_def, _instance, values, _t) => {
      submissionBridge.onSubmit?.('Purchase Order', values);
      return undefined;
    },
  },
};

export function registerPurchaseOrderPlugin(): void {
  registerPlugin(purchaseOrderPlugin, { conflictResolution: 'skip' });
}
