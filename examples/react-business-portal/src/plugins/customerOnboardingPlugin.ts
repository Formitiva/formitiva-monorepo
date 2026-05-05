/**
 * plugins/customerOnboardingPlugin.ts
 *
 * Handles the "Customer Registration" form (customer-onboarding.json).
 *
 * JSON schema references:
 *   submitterRef  → "biz:customerOnboarding"
 *   validatorRef  → "biz:customerOnboardingValidator"
 *   visibilityRef → "biz:isBusinessAccount"  (on companyName, taxId, industry)
 *
 * Business rules:
 *   • Business-only fields are hidden when accountType ≠ "business".
 *   • Company Name is required when accountType = "business".
 *   • On submit, the form values are forwarded to the submission bridge
 *     (in production this would call your onboarding API endpoint).
 */
import { registerPlugin } from '@formitiva/react';
import type {
  FormitivaPlugin,
  VisibilityHandler,
  FormValidationHandler,
} from '@formitiva/react';
import { submissionBridge } from './bridge';

// ── Visibility ─────────────────────────────────────────────────────────────────

/** Show company-specific fields only when the account type is "business". */
const isBusinessAccount: VisibilityHandler = (_field, values) =>
  values['accountType'] === 'business' ? 'visible' : 'invisible';

// ── Validation ─────────────────────────────────────────────────────────────────

/** Company Name must be filled in when registering a business account. */
const customerOnboardingValidator: FormValidationHandler = (values, t) => {
  if (values['accountType'] === 'business' && !String(values['companyName'] ?? '').trim()) {
    return [t('Company Name is required for business accounts.')];
  }
  return undefined;
};

// ── Plugin ─────────────────────────────────────────────────────────────────────

const customerOnboardingPlugin: FormitivaPlugin = {
  name: 'customer-onboarding-plugin',
  version: '1.0.0',
  description: 'Handles visibility, validation, and submission for the Customer Registration form.',

  visibilityHandlers: {
    'biz:isBusinessAccount': isBusinessAccount,
  },

  formValidators: {
    'biz:customerOnboardingValidator': customerOnboardingValidator,
  },

  submissionHandlers: {
    'biz:customerOnboarding': (_def, _instance, values, _t) => {
      submissionBridge.onSubmit?.('Customer Registration', values);
      return undefined;
    },
  },
};

/** Register the Customer Onboarding plugin with Formitiva. */
export function registerCustomerOnboardingPlugin(): void {
  registerPlugin(customerOnboardingPlugin, { conflictResolution: 'skip' });
}
