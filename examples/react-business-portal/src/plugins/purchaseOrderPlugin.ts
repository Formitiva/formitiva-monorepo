/**
 * plugins/purchaseOrderPlugin.ts
 *
 * Handles the "Purchase Order" form (purchase-order.json).
 *
 * JSON schema references:
 *   submitterRef → "biz:purchaseOrder"
 *   validatorRef → "biz:purchaseOrderValidator"
 *   computedRef  → "biz:calcOrderTotals"  (on subtotal, totalAmount)
 *
 * Business rules:
 *   • Subtotal  = quantity × unitPrice
 *   • Total     = subtotal × (1 − discountPct / 100)
 *   • Both are computed automatically; the fields are marked disabled in the schema.
 *   • Quantity and Unit Price must each be greater than zero before submitting.
 *   • On submit, the form values are forwarded to the submission bridge
 *     (in production this would create a PO in your ERP system).
 */
import { registerPlugin } from '@formitiva/react';
import type {
  FormitivaPlugin,
  FormValidationHandler,
  ComputedValueHandler,
} from '@formitiva/react';
import { submissionBridge } from './bridge';

// ── Computed ───────────────────────────────────────────────────────────────────

/**
 * Derive Subtotal and Total Amount from Quantity, Unit Price, and Discount.
 * Returning a map lets Formitiva update both fields in one synchronous pass,
 * so Total always reflects the freshly-computed Subtotal.
 */
const calcOrderTotals: ComputedValueHandler = (_field, values) => {
  const qty      = Math.max(0, Number(values['quantity']    ?? 0));
  const price    = Math.max(0, Number(values['unitPrice']   ?? 0));
  const discount = Math.max(0, Math.min(100, Number(values['discountPct'] ?? 0)));
  const subtotal    = Math.round(qty * price * 100) / 100;
  const totalAmount = Math.round(subtotal * (1 - discount / 100) * 100) / 100;
  return { subtotal, totalAmount };
};

// ── Validation ─────────────────────────────────────────────────────────────────

/** Both Quantity and Unit Price must be positive before a PO can be raised. */
const purchaseOrderValidator: FormValidationHandler = (values, t) => {
  const errors: string[] = [];
  if (Number(values['quantity']  ?? 0) <= 0) errors.push(t('Quantity must be greater than zero.'));
  if (Number(values['unitPrice'] ?? 0) <= 0) errors.push(t('Unit Price must be greater than zero.'));
  return errors.length > 0 ? errors : undefined;
};

// ── Plugin ─────────────────────────────────────────────────────────────────────

const purchaseOrderPlugin: FormitivaPlugin = {
  name: 'purchase-order-plugin',
  version: '1.0.0',
  description: 'Handles computed totals, validation, and submission for the Purchase Order form.',

  computedHandlers: {
    'biz:calcOrderTotals': calcOrderTotals,
  },

  formValidators: {
    'biz:purchaseOrderValidator': purchaseOrderValidator,
  },

  submissionHandlers: {
    'biz:purchaseOrder': (_def, _instance, values, _t) => {
      submissionBridge.onSubmit?.('Purchase Order', values);
      return undefined;
    },
  },
};

/** Register the Purchase Order plugin with Formitiva. */
export function registerPurchaseOrderPlugin(): void {
  registerPlugin(purchaseOrderPlugin, { conflictResolution: 'skip' });
}
